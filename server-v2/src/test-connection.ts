import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { R2Service } from './storage/r2.service';

async function bootstrap() {
  console.log('--- FASE R1: End-to-End Connection Test ---');
  const app = await NestFactory.createApplicationContext(AppModule);

  const prisma = app.get(PrismaService);
  const r2 = app.get(R2Service);

  // 1. Test PostgreSQL Prisma Connection
  try {
    const userCount = await prisma.user.count();
    console.log(`✅ PostgreSQL + Prisma Connection: SUCCESS (Current User Count: ${userCount})`);
  } catch (err) {
    console.error(`❌ PostgreSQL Connection Error:`, err.message);
  }

  // 2. Test Cloudflare R2 Connection
  try {
    const connected = await r2.checkConnection();
    if (connected) {
      console.log('✅ Cloudflare R2 Bucket Connection: SUCCESS');
      const testBuffer = Buffer.from('EduAR Platform R2 Connection Test - FASE R1');
      const testKey = `test-fase-r1-${Date.now()}.txt`;
      const uploadRes = await r2.uploadWithFallback(testKey, testBuffer, 'text/plain');
      console.log(`   R2 Test Upload Result: URL = ${uploadRes.url} (Mode: ${uploadRes.mode})`);
      await r2.deleteWithFallback(testKey);
      console.log(`✅ R2 Delete Test SUCCESS: ${testKey}`);
    } else {
      console.log('⚠️  Cloudflare R2: Credentials currently set to placeholder in .env. Waiting for production R2 credentials from Cloudflare dashboard.');
    }
  } catch (err) {
    console.warn(`⚠️  R2 Test Warning: ${err.message}`);
  }

  await app.close();
  console.log('--------------------------------------------');
}

bootstrap();
