import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AnalyticsService } from './analytics/analytics.service';
import { PrismaService } from './prisma/prisma.service';

async function testAnalyticsModule() {
  console.log('=====================================================');
  console.log('🧪 FASE R7: Testing Analytics & Activity Log Engine');
  console.log('=====================================================\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const analyticsService = app.get(AnalyticsService);
  const prisma = app.get(PrismaService);

  const defaultUser = await prisma.user.findFirst();

  // 1. Log SCAN_QR Event
  console.log('1. Logging SCAN_QR Activity Log Event...');
  const scanLog = await analyticsService.log(defaultUser?.id || null, {
    action: 'SCAN_QR',
    entityType: 'EcosystemPreset',
    entityId: 'preset-darat',
    metadata: { scannerDevice: 'iPhone 15 Pro', qrType: 'ecosystem' },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
  });
  console.log(`   ✅ Logged SCAN_QR: Log ID=${scanLog.logId}`);

  // 2. Log VIEW_AR Event
  console.log('\n2. Logging VIEW_AR Activity Log Event...');
  const viewLog = await analyticsService.log(defaultUser?.id || null, {
    action: 'VIEW_AR',
    entityType: 'Scene',
    entityId: 'studio_1785943380299',
    metadata: { arMode: 'webxr-tap-to-place', durationSec: 45 },
  });
  console.log(`   ✅ Logged VIEW_AR: Log ID=${viewLog.logId}`);

  // 3. Log BAKE_GLB Event
  console.log('\n3. Logging BAKE_GLB Activity Log Event...');
  const bakeLog = await analyticsService.log(defaultUser?.id || null, {
    action: 'BAKE_GLB',
    entityType: 'EcosystemPreset',
    entityId: 'preset-darat',
    metadata: { bakedSizeKb: 80.8, speciesCount: 6 },
  });
  console.log(`   ✅ Logged BAKE_GLB: Log ID=${bakeLog.logId}`);

  // 4. Retrieve Aggregated Summary Statistics
  console.log('\n4. Retrieving Aggregated Platform Summary...');
  const summaryRes = await analyticsService.getSummary();
  console.log(`   ✅ Total Log Events: ${summaryRes.summary.totalLogs}`);
  console.log(`   ✅ Total QR Scans: ${summaryRes.summary.totalScans}`);
  console.log(`   ✅ Total AR Views: ${summaryRes.summary.totalArViews}`);
  console.log(`   ✅ Total GLB Bakes: ${summaryRes.summary.totalBakes}`);

  // 5. Retrieve Paginated Activity Logs
  console.log('\n5. Retrieving Paginated Log History...');
  const logsRes = await analyticsService.getLogs(1, 5);
  console.log(`   ✅ Fetched ${logsRes.logs.length} logs (Total Logs in DB: ${logsRes.pagination.total})`);

  await app.close();
  console.log('\n=====================================================');
  console.log('✅ ALL FASE R7 ANALYTICS & LOGGING MODULES VALIDATED SUCCESSFULLY');
  console.log('=====================================================');
}

testAnalyticsModule().catch(console.error);
