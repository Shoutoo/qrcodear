"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.RefreshTokenDto = exports.LoginDto = exports.RegisterDto = void 0;
class RegisterDto {
    name;
    email;
    password;
    role;
}
exports.RegisterDto = RegisterDto;
class LoginDto {
    email;
    password;
    device;
}
exports.LoginDto = LoginDto;
class RefreshTokenDto {
    refreshToken;
}
exports.RefreshTokenDto = RefreshTokenDto;
class ForgotPasswordDto {
    email;
}
exports.ForgotPasswordDto = ForgotPasswordDto;
class ResetPasswordDto {
    token;
    newPassword;
}
exports.ResetPasswordDto = ResetPasswordDto;
//# sourceMappingURL=auth.dto.js.map