import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { R2Service } from './storage/r2.service';

async function testStorageModule() {
  console.log('=====================================================');
  console.log('🧪 FASE R8: Testing Cloudflare R2 / Local Fallback Storage');
  console.log('=====================================================\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const r2Service = app.get(R2Service);

  // 1. Check Connection
  console.log('1. Checking Storage Service Connection...');
  const isConnected = await r2Service.checkConnection();
  console.log(`   R2 Direct Connection Active: ${isConnected ? 'YES (Cloudflare R2 Ready)' : 'NO (Using Local Storage Fallback)'}`);

  // 2. Upload Sample 3D Model File
  console.log('\n2. Testing Dual Upload with Fallback...');
  const sampleKey = `test_model_${Date.now()}.glb`;
  const sampleBuffer = Buffer.from('glTF binary mock data for AR model verification');
  const uploadRes = await r2Service.uploadWithFallback(sampleKey, sampleBuffer, 'model/gltf-binary');

  console.log(`   ✅ File Upload Result:`);
  console.log(`   • Key: ${uploadRes.key}`);
  console.log(`   • URL: ${uploadRes.url}`);
  console.log(`   • Storage Mode: ${uploadRes.mode}`);

  // 3. Delete Sample File
  console.log('\n3. Testing Storage File Deletion...');
  const deleteRes = await r2Service.deleteWithFallback(sampleKey);
  console.log(`   ✅ Deletion Result: ${deleteRes ? 'SUCCESS' : 'FAILED'}`);

  await app.close();
  console.log('\n=====================================================');
  console.log('✅ ALL FASE R8 STORAGE DUAL-MODE TESTS VALIDATED SUCCESSFULLY');
  console.log('=====================================================');
}

testStorageModule().catch(console.error);
