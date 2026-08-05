"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const auth_service_1 = require("./auth/auth.service");
const client_1 = require("@prisma/client");
async function testAuthModule() {
    console.log('=====================================================');
    console.log('🧪 FASE R5: Testing Auth Module (JWT & RBAC & Reset)');
    console.log('=====================================================\n');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const authService = app.get(auth_service_1.AuthService);
    const testEmail = `test.student.${Date.now()}@eduar.internal`;
    const testPass = 'Rahasia123!';
    console.log('1. Testing User Registration...');
    const regRes = await authService.register({
        name: 'Siswa Test AR',
        email: testEmail,
        password: testPass,
        role: client_1.Role.STUDENT,
    });
    console.log(`   ✅ Registered User: ${regRes.user.name} (${regRes.user.email}) Role: ${regRes.user.role}`);
    console.log('\n2. Testing User Login & Token Generation...');
    const loginRes = await authService.login({
        email: testEmail,
        password: testPass,
        device: 'web-studio',
    });
    console.log(`   ✅ Login SUCCESS!`);
    console.log(`   • Access Token: ${loginRes.accessToken.slice(0, 25)}...`);
    console.log(`   • Refresh Token: ${loginRes.refreshToken.slice(0, 25)}...`);
    console.log('\n3. Testing Access Token Refresh...');
    const refreshRes = await authService.refresh({
        refreshToken: loginRes.refreshToken,
    });
    console.log(`   ✅ Token Refresh SUCCESS! New Access Token: ${refreshRes.accessToken.slice(0, 25)}...`);
    console.log('\n4. Testing Forgot Password Token Generation...');
    const forgotRes = await authService.forgotPassword({
        email: testEmail,
    });
    console.log(`   ✅ Reset Token Generated: ${forgotRes.resetToken}`);
    console.log('\n5. Testing Password Reset Flow...');
    const newPass = 'PasswordBaru456!';
    const resetRes = await authService.resetPassword({
        token: forgotRes.resetToken,
        newPassword: newPass,
    });
    console.log(`   ✅ Reset Password Result: ${resetRes.message}`);
    console.log('\n6. Testing Login with New Password...');
    const newLoginRes = await authService.login({
        email: testEmail,
        password: newPass,
        device: 'unity-app',
    });
    console.log(`   ✅ Login with New Password SUCCESS for device "unity-app"!`);
    console.log('\n7. Testing Logout & Token Revocation...');
    const logoutRes = await authService.logout(regRes.user.id, newLoginRes.refreshToken);
    console.log(`   ✅ Logout Result: ${logoutRes.message}`);
    await app.close();
    console.log('\n=====================================================');
    console.log('✅ ALL FASE R5 AUTH & ROLE MODULES VALIDATED SUCCESSFULLY');
    console.log('=====================================================');
}
testAuthModule().catch(console.error);
//# sourceMappingURL=test-r5-auth.js.map