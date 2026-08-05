export class RegisterDto {
  name!: string;
  email!: string;
  password!: string;
  role?: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

export class LoginDto {
  email!: string;
  password!: string;
  device?: string; // "web-studio", "unity", "admin-dashboard"
}

export class RefreshTokenDto {
  refreshToken!: string;
}

export class ForgotPasswordDto {
  email!: string;
}

export class ResetPasswordDto {
  token!: string;
  newPassword!: string;
}
