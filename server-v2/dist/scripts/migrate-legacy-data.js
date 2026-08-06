"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma = new client_1.PrismaClient();
const ROOT_DIR = path.join(__dirname, '..', '..', '..');
const LEGACY_DATA_DIR = path.join(ROOT_DIR, 'server', 'data');
async function migrateLegacyData() {
    console.log('=====================================================');
    console.log('🚀 AlamVerse — Where Nature Meets Reality — FASE R2: Script Migrasi Data');
    console.log('=====================================================');
    console.log(`Source data dir: ${LEGACY_DATA_DIR}\n`);
    console.log('0. Cleaning previous migration records from database...');
    await prisma.publishedExperience.deleteMany({});
    await prisma.ecosystemPreset.deleteMany({});
    await prisma.scene.deleteMany({});
    await prisma.asset.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('   ✅ Cleaned previous records.\n');
    console.log('1. Creating Legacy Teacher User...');
    const legacyUser = await prisma.user.create({
        data: {
            name: 'Guru AR Edu (Legacy)',
            email: 'legacy.teacher@eduar.internal',
            password_hash: '$2b$10$legacyPasswordHashPlaceholderForEduARPlatform2026',
            role: client_1.Role.TEACHER,
        },
    });
    console.log(`   ✅ Legacy Teacher User ID: ${legacyUser.id}`);
    console.log('2. Creating Legacy Default Project...');
    const legacyProject = await prisma.project.create({
        data: {
            title: 'Proyek Rantai Makanan & AR Studio (Legacy)',
            description: 'Proyek hasil migrasi otomatis dari database Express JSON lama',
            creatorId: legacyUser.id,
        },
    });
    console.log(`   ✅ Default Project ID: ${legacyProject.id}\n`);
    const stats = {
        assetsLegacyJson: 0,
        assetsLegacyMigrated: 0,
        ecosystemLibraryJson: 0,
        ecosystemLibraryMigrated: 0,
        scenesJson: 0,
        scenesMigrated: 0,
        presetsJson: 0,
        presetsMigrated: 0,
        publishedJson: 0,
        publishedMigrated: 0,
    };
    const assetsFilePath = path.join(LEGACY_DATA_DIR, 'assets.json');
    if (fs.existsSync(assetsFilePath)) {
        console.log('3. Migrating assets.json (Legacy Single Assets)...');
        const legacyAssets = JSON.parse(fs.readFileSync(assetsFilePath, 'utf8'));
        stats.assetsLegacyJson = legacyAssets.length;
        for (const item of legacyAssets) {
            await prisma.asset.create({
                data: {
                    id: item.id || undefined,
                    projectId: legacyProject.id,
                    type: client_1.AssetType.LEGACY_SINGLE,
                    modelUrl: item.modelSrc || item.glbUrl || `/assets/${item.id}.glb`,
                    textureUrl: item.thumbnail || null,
                    label: item.name || item.title || 'Legacy Model',
                    source: item.source || 'AR Edu QR Legacy',
                    license: item.license || 'CC0',
                    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
                },
            });
            stats.assetsLegacyMigrated++;
        }
        console.log(`   ✅ Migrated ${stats.assetsLegacyMigrated}/${stats.assetsLegacyJson} legacy single assets.\n`);
    }
    const ecoLibFilePath = path.join(LEGACY_DATA_DIR, 'ecosystem-model-library.json');
    if (fs.existsSync(ecoLibFilePath)) {
        console.log('4. Migrating ecosystem-model-library.json (Ecosystem 3D Toy Models)...');
        const ecoLib = JSON.parse(fs.readFileSync(ecoLibFilePath, 'utf8'));
        for (const cat of ecoLib) {
            const ecoName = cat.ecosystem || cat.id;
            const itemList = cat.items || cat.species || cat.models || [];
            stats.ecosystemLibraryJson += itemList.length;
            for (const sp of itemList) {
                await prisma.asset.create({
                    data: {
                        id: sp.id || undefined,
                        projectId: legacyProject.id,
                        type: client_1.AssetType.ECOSYSTEM_MODEL,
                        modelUrl: sp.modelSrc || sp.glbUrl || `/uploads/ecosystem-models/library/${ecoName}/${sp.id}.glb`,
                        textureUrl: sp.thumbnail || null,
                        label: sp.name,
                        ecosystem: ecoName,
                        role: sp.role,
                        source: sp.source || 'Poly Pizza / Antigravity Procedural Toy Engine',
                        license: sp.license || 'CC0',
                    },
                });
                stats.ecosystemLibraryMigrated++;
            }
        }
        console.log(`   ✅ Migrated ${stats.ecosystemLibraryMigrated}/${stats.ecosystemLibraryJson} ecosystem species models.\n`);
    }
    const scenesFilePath = path.join(LEGACY_DATA_DIR, 'scenes.json');
    if (fs.existsSync(scenesFilePath)) {
        console.log('5. Migrating scenes.json (Studio Scenes)...');
        const scenes = JSON.parse(fs.readFileSync(scenesFilePath, 'utf8'));
        stats.scenesJson = scenes.length;
        for (const sc of scenes) {
            await prisma.scene.create({
                data: {
                    id: sc.id || sc.sceneId || undefined,
                    projectId: legacyProject.id,
                    data: sc,
                    createdAt: sc.createdAt ? new Date(sc.createdAt) : new Date(),
                },
            });
            stats.scenesMigrated++;
        }
        console.log(`   ✅ Migrated ${stats.scenesMigrated}/${stats.scenesJson} Studio scenes.\n`);
    }
    const presetsFilePath = path.join(LEGACY_DATA_DIR, 'ecosystem-presets.json');
    if (fs.existsSync(presetsFilePath)) {
        console.log('6. Migrating ecosystem-presets.json (Ecosystem Presets)...');
        const presets = JSON.parse(fs.readFileSync(presetsFilePath, 'utf8'));
        stats.presetsJson = presets.length;
        for (const pr of presets) {
            await prisma.ecosystemPreset.create({
                data: {
                    id: pr.id || undefined,
                    name: pr.name,
                    slots: pr.slots || [],
                    createdAt: pr.createdAt ? new Date(pr.createdAt) : new Date(),
                },
            });
            stats.presetsMigrated++;
        }
        console.log(`   ✅ Migrated ${stats.presetsMigrated}/${stats.presetsJson} ecosystem presets.\n`);
    }
    const pubFilePath = path.join(LEGACY_DATA_DIR, 'ecosystem-published.json');
    if (fs.existsSync(pubFilePath)) {
        console.log('7. Migrating ecosystem-published.json (Published Experiences)...');
        const publishedList = JSON.parse(fs.readFileSync(pubFilePath, 'utf8'));
        stats.publishedJson = publishedList.length;
        for (const pub of publishedList) {
            await prisma.publishedExperience.create({
                data: {
                    id: pub.id || undefined,
                    type: client_1.PublishType.ECOSYSTEM_PRESET,
                    presetId: pub.presetId || null,
                    bakedGlbUrl: pub.glbUrl || `/assets/${pub.id}.glb`,
                    qrCodeUrl: pub.qrCodeDataUrl || pub.qrFilename || '',
                    viewUrl: pub.directUrl || `/ecosystem/view/${pub.id}`,
                    createdAt: pub.publishedAt ? new Date(pub.publishedAt) : new Date(),
                },
            });
            stats.publishedMigrated++;
        }
        console.log(`   ✅ Migrated ${stats.publishedMigrated}/${stats.publishedJson} published experiences.\n`);
    }
    console.log('=====================================================');
    console.log('📊 REKAPITULASI HASIL MIGRASI DATA (FASE R2)');
    console.log('=====================================================');
    console.table([
        { Entity: 'User (Legacy Teacher)', LegacyJSON: 'N/A', PostgresDB: 1, Status: 'MATCH' },
        { Entity: 'Project (Default)', LegacyJSON: 'N/A', PostgresDB: 1, Status: 'MATCH' },
        { Entity: 'Asset (Legacy Single)', LegacyJSON: stats.assetsLegacyJson, PostgresDB: stats.assetsLegacyMigrated, Status: stats.assetsLegacyJson === stats.assetsLegacyMigrated ? 'MATCH' : 'MISMATCH' },
        { Entity: 'Asset (Ecosystem Models)', LegacyJSON: stats.ecosystemLibraryJson, PostgresDB: stats.ecosystemLibraryMigrated, Status: stats.ecosystemLibraryJson === stats.ecosystemLibraryMigrated ? 'MATCH' : 'MISMATCH' },
        { Entity: 'Scene (Studio Scenes)', LegacyJSON: stats.scenesJson, PostgresDB: stats.scenesMigrated, Status: stats.scenesJson === stats.scenesMigrated ? 'MATCH' : 'MISMATCH' },
        { Entity: 'EcosystemPreset', LegacyJSON: stats.presetsJson, PostgresDB: stats.presetsMigrated, Status: stats.presetsJson === stats.presetsMigrated ? 'MATCH' : 'MISMATCH' },
        { Entity: 'PublishedExperience', LegacyJSON: stats.publishedJson, PostgresDB: stats.publishedMigrated, Status: stats.publishedJson === stats.publishedMigrated ? 'MATCH' : 'MISMATCH' },
    ]);
    console.log('=====================================================\n');
    await prisma.$disconnect();
}
migrateLegacyData().catch((err) => {
    console.error('❌ Error executing migration script:', err);
    process.exit(1);
});
//# sourceMappingURL=migrate-legacy-data.js.map