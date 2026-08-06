import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new BadRequestException('Nama lengkap wajib diisi');
    }

    if (!dto.email || !dto.email.includes('@')) {
      throw new BadRequestException('Format email tidak valid');
    }

    if (!dto.password || dto.password.length < 6) {
      throw new BadRequestException('Kata sandi minimal 6 karakter');
    }

    const cleanEmail = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      throw new BadRequestException('Email sudah terdaftar dalam sistem');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const role: Role = dto.role && Object.values(Role).includes(dto.role as Role) ? (dto.role as Role) : Role.STUDENT;

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: cleanEmail,
        password_hash: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Auto-login upon registration (Generate JWT Access & Refresh Tokens)
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    const refreshTokenStr = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenStr,
        userId: user.id,
        device: 'web-register',
        expiresAt,
      },
    });

    return {
      success: true,
      message: `Pendaftaran berhasil! Selamat datang, ${user.name}.`,
      accessToken,
      refreshToken: refreshTokenStr,
      user,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau kata sandi tidak valid');
    }

    const validPassword = await bcrypt.compare(dto.password, user.password_hash);
    if (!validPassword) {
      throw new UnauthorizedException('Email atau kata sandi tidak valid');
    }

    // Generate JWT Access Token (15 min)
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    // Generate Refresh Token (7 days) stored in DB per device
    const refreshTokenStr = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenStr,
        userId: user.id,
        device: dto.device || 'web-studio',
        expiresAt,
      },
    });

    const userRes = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    return {
      success: true,
      accessToken,
      refreshToken: refreshTokenStr,
      user: userRes,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token tidak valid atau sudah kedaluwarsa');
    }

    const payload = { sub: storedToken.user.id, email: storedToken.user.email, role: storedToken.user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    return { success: true, accessToken };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, token: refreshToken },
        data: { revoked: true },
      });
    } else {
      await this.prisma.refreshToken.updateMany({
        where: { userId },
        data: { revoked: true },
      });
    }
    return { success: true, message: 'Berhasil keluar' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new NotFoundException('Pengguna dengan email tersebut tidak ditemukan');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour validity

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    return {
      success: true,
      message: 'Token reset kata sandi telah dibuat',
      resetToken,
      expiresAt: resetTokenExpiry,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Token reset kata sandi tidak valid atau sudah kedaluwarsa');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Revoke all existing refresh tokens for security
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revoked: true },
    });

    return { success: true, message: 'Kata sandi berhasil diperbarui' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (!dto.oldPassword) {
      throw new BadRequestException('Kata sandi lama wajib diisi');
    }

    if (!dto.newPassword || dto.newPassword.length < 6) {
      throw new BadRequestException('Kata sandi baru minimal 6 karakter');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password_hash);
    if (!isMatch) {
      throw new BadRequestException('Kata sandi lama tidak cocok');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: hashedPassword,
      },
    });

    return {
      success: true,
      message: 'Kata sandi akun Anda berhasil diperbarui!',
    };
  }

  async updateProfile(userId: string, dto: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    const newName = dto.name ? dto.name.trim() : user.name;
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: newName,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      message: 'Data profil berhasil diperbarui!',
      user: {
        ...updatedUser,
        school: dto.school || '',
        gradeClass: dto.gradeClass || '',
        bioHobby: dto.bioHobby || '',
        avatar: dto.avatar || '🦁',
        nip: dto.nip || '',
        subject: dto.subject || '',
        whatsapp: dto.whatsapp || '',
      },
    };
  }
}


