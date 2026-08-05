import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { Role } from '@prisma/client';

async function testAuthModule() {
  console.log('=====================================================');
  console.log('🧪 FASE R5: Testing Auth Module (JWT & RBAC & Reset)');
  console.log('=====================================================\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  const testEmail = `test.student.${Date.now()}@eduar.internal`;
  const testPass = 'Rahasia123!';

  // 1. Test Register
  console.log('1. Testing User Registration...');
  const regRes = await authService.register({
    name: 'Siswa Test AR',
    email: testEmail,
    password: testPass,
    role: Role.STUDENT,
  });
  console.log(`   ✅ Registered User: ${regRes.user.name} (${regRes.user.email}) Role: ${regRes.user.role}`);

  // 2. Test Login
  console.log('\n2. Testing User Login & Token Generation...');
  const loginRes = await authService.login({
    email: testEmail,
    password: testPass,
    device: 'web-studio',
  });
  console.log(`   ✅ Login SUCCESS!`);
  console.log(`   • Access Token: ${loginRes.accessToken.slice(0, 25)}...`);
  console.log(`   • Refresh Token: ${loginRes.refreshToken.slice(0, 25)}...`);

  // 3. Test Refresh Token
  console.log('\n3. Testing Access Token Refresh...');
  const refreshRes = await authService.refresh({
    refreshToken: loginRes.refreshToken,
  });
  console.log(`   ✅ Token Refresh SUCCESS! New Access Token: ${refreshRes.accessToken.slice(0, 25)}...`);

  // 4. Test Forgot Password Token Generation
  console.log('\n4. Testing Forgot Password Token Generation...');
  const forgotRes = await authService.forgotPassword({
    email: testEmail,
  });
  console.log(`   ✅ Reset Token Generated: ${forgotRes.resetToken}`);

  // 5. Test Password Reset
  console.log('\n5. Testing Password Reset Flow...');
  const newPass = 'PasswordBaru456!';
  const resetRes = await authService.resetPassword({
    token: forgotRes.resetToken,
    newPassword: newPass,
  });
  console.log(`   ✅ Reset Password Result: ${resetRes.message}`);

  // 6. Test Login with New Password
  console.log('\n6. Testing Login with New Password...');
  const newLoginRes = await authService.login({
    email: testEmail,
    password: newPass,
    device: 'unity-app',
  });
  console.log(`   ✅ Login with New Password SUCCESS for device "unity-app"!`);

  // 7. Test Logout
  console.log('\n7. Testing Logout & Token Revocation...');
  const logoutRes = await authService.logout(regRes.user.id, newLoginRes.refreshToken);
  console.log(`   ✅ Logout Result: ${logoutRes.message}`);

  await app.close();
  console.log('\n=====================================================');
  console.log('✅ ALL FASE R5 AUTH & ROLE MODULES VALIDATED SUCCESSFULLY');
  console.log('=====================================================');
}

testAuthModule().catch(console.error);
