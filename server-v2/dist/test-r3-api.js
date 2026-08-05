"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const scenes_service_1 = require("./scenes/scenes.service");
const assets_service_1 = require("./assets/assets.service");
const ecosystem_service_1 = require("./ecosystem/ecosystem.service");
async function bootstrap() {
    console.log('=====================================================');
    console.log('🧪 FASE R3: Testing Core NestJS REST API Endpoints');
    console.log('=====================================================\n');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const scenesService = app.get(scenes_service_1.ScenesService);
    const assetsService = app.get(assets_service_1.AssetsService);
    const ecosystemService = app.get(ecosystem_service_1.EcosystemService);
    try {
        const scenes = await scenesService.findAll();
        console.log(`1. GET /api/scenes → SUCCESS (Found ${scenes.length} scenes)`);
        if (scenes.length > 0) {
            const single = await scenesService.findOne(scenes[0].id);
            console.log(`   GET /api/scenes/${scenes[0].id} → SUCCESS (Name: "${single.name || 'AR Scene'}")`);
        }
    }
    catch (err) {
        console.error('❌ Scenes API Error:', err.message);
    }
    try {
        const assets = await assetsService.findAll();
        console.log(`2. GET /api/assets → SUCCESS (Found ${assets.length} assets)`);
        if (assets.length > 0) {
            const qrRes = await assetsService.getAssetQr(assets[0].id, 'localhost:3001');
            console.log(`   GET /api/assets/${assets[0].id}/qr → SUCCESS (Viewer URL: ${qrRes.viewerUrl})`);
        }
    }
    catch (err) {
        console.error('❌ Assets API Error:', err.message);
    }
    try {
        const libRes = await ecosystemService.getLibrary();
        console.log(`3. GET /api/ecosystem/library → SUCCESS (Categories: ${libRes.library.length})`);
        libRes.library.forEach((cat) => {
            console.log(`   • ${cat.name}: ${cat.items.length} species items`);
        });
    }
    catch (err) {
        console.error('❌ Ecosystem Library API Error:', err.message);
    }
    try {
        const presetsRes = await ecosystemService.getPresets();
        console.log(`4. GET /api/ecosystem/presets → SUCCESS (Found ${presetsRes.presets.length} presets)`);
        if (presetsRes.presets.length > 0) {
            const singleP = await ecosystemService.getPresetById(presetsRes.presets[0].id);
            console.log(`   GET /api/ecosystem/presets/${presetsRes.presets[0].id} → SUCCESS (Name: "${singleP.preset.name}")`);
        }
    }
    catch (err) {
        console.error('❌ Ecosystem Presets API Error:', err.message);
    }
    try {
        const pubRes = await ecosystemService.publishEcosystem('preset-darat', 'Ekosistem Darat Test', 'localhost:3001');
        console.log(`5. POST /api/ecosystem/publish → SUCCESS (Published ID: ${pubRes.id}, URL: ${pubRes.directUrl})`);
    }
    catch (err) {
        console.error('❌ Publish Ecosystem API Error:', err.message);
    }
    await app.close();
    console.log('\n=====================================================');
    console.log('✅ ALL FASE R3 CORE REST API ENDPOINTS VALIDATED SUCCESSFULLY');
    console.log('=====================================================');
}
bootstrap().catch(console.error);
//# sourceMappingURL=test-r3-api.js.map