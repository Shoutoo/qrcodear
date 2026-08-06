"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const prisma_service_1 = require("./prisma/prisma.service");
const r2_service_1 = require("./storage/r2.service");
async function bootstrap() {
    console.log('--- FASE R1: End-to-End Connection Test ---');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const prisma = app.get(prisma_service_1.PrismaService);
    const r2 = app.get(r2_service_1.R2Service);
    try {
        const userCount = await prisma.user.count();
        console.log(`✅ PostgreSQL + Prisma Connection: SUCCESS (Current User Count: ${userCount})`);
    }
    catch (err) {
        console.error(`❌ PostgreSQL Connection Error:`, err.message);
    }
    try {
        const connected = await r2.checkConnection();
        if (connected) {
            console.log('✅ Cloudflare R2 Bucket Connection: SUCCESS');
            const testBuffer = Buffer.from('AlamVerse — Where Nature Meets Reality R2 Connection Test - FASE R1');
            const testKey = `test-fase-r1-${Date.now()}.txt`;
            const uploadRes = await r2.uploadWithFallback(testKey, testBuffer, 'text/plain');
            console.log(`   R2 Test Upload Result: URL = ${uploadRes.url} (Mode: ${uploadRes.mode})`);
            await r2.deleteWithFallback(testKey);
            console.log(`✅ R2 Delete Test SUCCESS: ${testKey}`);
        }
        else {
            console.log('⚠️  Cloudflare R2: Credentials currently set to placeholder in .env. Waiting for production R2 credentials from Cloudflare dashboard.');
        }
    }
    catch (err) {
        console.warn(`⚠️  R2 Test Warning: ${err.message}`);
    }
    await app.close();
    console.log('--------------------------------------------');
}
bootstrap();
//# sourceMappingURL=test-connection.js.map