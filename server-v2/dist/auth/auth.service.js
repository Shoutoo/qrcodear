"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(dto) {
        if (!dto.name || dto.name.trim().length === 0) {
            throw new common_1.BadRequestException('Nama lengkap wajib diisi');
        }
        if (!dto.email || !dto.email.includes('@')) {
            throw new common_1.BadRequestException('Format email tidak valid');
        }
        if (!dto.password || dto.password.length < 6) {
            throw new common_1.BadRequestException('Kata sandi minimal 6 karakter');
        }
        const cleanEmail = dto.email.toLowerCase().trim();
        const existing = await this.prisma.user.findUnique({
            where: { email: cleanEmail },
        });
        if (existing) {
            throw new common_1.BadRequestException('Email sudah terdaftar dalam sistem');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const role = dto.role && Object.values(client_1.Role).includes(dto.role) ? dto.role : client_1.Role.STUDENT;
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
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase().trim() },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Email atau kata sandi tidak valid');
        }
        const validPassword = await bcrypt.compare(dto.password, user.password_hash);
        if (!validPassword) {
            throw new common_1.UnauthorizedException('Email atau kata sandi tidak valid');
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
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
    async refresh(dto) {
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: dto.refreshToken },
            include: { user: true },
        });
        if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token tidak valid atau sudah kedaluwarsa');
        }
        const payload = { sub: storedToken.user.id, email: storedToken.user.email, role: storedToken.user.role };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        return { success: true, accessToken };
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            await this.prisma.refreshToken.updateMany({
                where: { userId, token: refreshToken },
                data: { revoked: true },
            });
        }
        else {
            await this.prisma.refreshToken.updateMany({
                where: { userId },
                data: { revoked: true },
            });
        }
        return { success: true, message: 'Berhasil keluar' };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase().trim() },
        });
        if (!user) {
            throw new common_1.NotFoundException('Pengguna dengan email tersebut tidak ditemukan');
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date();
        resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);
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
    async resetPassword(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetToken: dto.token,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Token reset kata sandi tidak valid atau sudah kedaluwarsa');
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
        await this.prisma.refreshToken.updateMany({
            where: { userId: user.id },
            data: { revoked: true },
        });
        return { success: true, message: 'Kata sandi berhasil diperbarui' };
    }
    async changePassword(userId, dto) {
        if (!dto.oldPassword) {
            throw new common_1.BadRequestException('Kata sandi lama wajib diisi');
        }
        if (!dto.newPassword || dto.newPassword.length < 6) {
            throw new common_1.BadRequestException('Kata sandi baru minimal 6 karakter');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Pengguna tidak ditemukan');
        }
        const isMatch = await bcrypt.compare(dto.oldPassword, user.password_hash);
        if (!isMatch) {
            throw new common_1.BadRequestException('Kata sandi lama tidak cocok');
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
    async updateProfile(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Pengguna tidak ditemukan');
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map