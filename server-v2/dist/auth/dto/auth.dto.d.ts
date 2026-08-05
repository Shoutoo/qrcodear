export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role?: 'STUDENT' | 'TEACHER' | 'ADMIN';
}
export declare class LoginDto {
    email: string;
    password: string;
    device?: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
