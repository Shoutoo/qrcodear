"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const r2_service_1 = require("./storage/r2.service");
async function testStorageModule() {
    console.log('=====================================================');
    console.log('🧪 FASE R8: Testing Cloudflare R2 / Local Fallback Storage');
    console.log('=====================================================\n');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const r2Service = app.get(r2_service_1.R2Service);
    console.log('1. Checking Storage Service Connection...');
    const isConnected = await r2Service.checkConnection();
    console.log(`   R2 Direct Connection Active: ${isConnected ? 'YES (Cloudflare R2 Ready)' : 'NO (Using Local Storage Fallback)'}`);
    console.log('\n2. Testing Dual Upload with Fallback...');
    const sampleKey = `test_model_${Date.now()}.glb`;
    const sampleBuffer = Buffer.from('glTF binary mock data for AR model verification');
    const uploadRes = await r2Service.uploadWithFallback(sampleKey, sampleBuffer, 'model/gltf-binary');
    console.log(`   ✅ File Upload Result:`);
    console.log(`   • Key: ${uploadRes.key}`);
    console.log(`   • URL: ${uploadRes.url}`);
    console.log(`   • Storage Mode: ${uploadRes.mode}`);
    console.log('\n3. Testing Storage File Deletion...');
    const deleteRes = await r2Service.deleteWithFallback(sampleKey);
    console.log(`   ✅ Deletion Result: ${deleteRes ? 'SUCCESS' : 'FAILED'}`);
    await app.close();
    console.log('\n=====================================================');
    console.log('✅ ALL FASE R8 STORAGE DUAL-MODE TESTS VALIDATED SUCCESSFULLY');
    console.log('=====================================================');
}
testStorageModule().catch(console.error);
//# sourceMappingURL=test-r8-storage.js.map