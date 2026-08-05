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
const DATA_DIR = path.join(ROOT_DIR, 'server', 'data');
async function seed() {
    console.log('🌱 EduAR Platform — Prisma Seed Script');
    const existingPresets = await prisma.ecosystemPreset.count();
    if (existingPresets === 0) {
        const presetsFile = path.join(DATA_DIR, 'ecosystem-presets.json');
        if (fs.existsSync(presetsFile)) {
            const presets = JSON.parse(fs.readFileSync(presetsFile, 'utf8'));
            for (const pr of presets) {
                await prisma.ecosystemPreset.upsert({
                    where: { id: pr.id },
                    update: { name: pr.name, slots: pr.slots || [] },
                    create: {
                        id: pr.id,
                        name: pr.name,
                        slots: pr.slots || [],
                        createdAt: pr.createdAt ? new Date(pr.createdAt) : new Date(),
                    },
                });
            }
            console.log(`  ✅ Seeded ${presets.length} ecosystem presets`);
        }
        else {
            console.log('  ⚠️  No ecosystem-presets.json found, skipping');
        }
    }
    else {
        console.log(`  ℹ️  Presets already exist (${existingPresets}), skipping`);
    }
    const existingPub = await prisma.publishedExperience.count();
    if (existingPub === 0) {
        const pubFile = path.join(DATA_DIR, 'ecosystem-published.json');
        if (fs.existsSync(pubFile)) {
            const published = JSON.parse(fs.readFileSync(pubFile, 'utf8'));
            for (const pub of published) {
                await prisma.publishedExperience.upsert({
                    where: { id: pub.id },
                    update: {},
                    create: {
                        id: pub.id,
                        type: client_1.PublishType.ECOSYSTEM_PRESET,
                        presetId: pub.presetId || null,
                        bakedGlbUrl: pub.glbUrl || `/assets/${pub.id}.glb`,
                        qrCodeUrl: pub.qrCodeDataUrl || pub.qrFilename || '',
                        viewUrl: pub.directUrl || `/ecosystem/view/${pub.id}`,
                        createdAt: pub.publishedAt ? new Date(pub.publishedAt) : new Date(),
                    },
                });
            }
            console.log(`  ✅ Seeded ${published.length} published experiences`);
        }
        else {
            console.log('  ⚠️  No ecosystem-published.json found, skipping');
        }
    }
    else {
        console.log(`  ℹ️  Published experiences already exist (${existingPub}), skipping`);
    }
    const existingEcoModels = await prisma.asset.count({
        where: { type: client_1.AssetType.ECOSYSTEM_MODEL },
    });
    if (existingEcoModels === 0) {
        const ecoLibFile = path.join(DATA_DIR, 'ecosystem-model-library.json');
        if (fs.existsSync(ecoLibFile)) {
            const ecoLib = JSON.parse(fs.readFileSync(ecoLibFile, 'utf8'));
            let defaultProject = await prisma.project.findFirst();
            if (!defaultProject) {
                let defaultUser = await prisma.user.findFirst();
                if (!defaultUser) {
                    defaultUser = await prisma.user.create({
                        data: {
                            name: 'EduAR System',
                            email: 'system@eduar.internal',
                            password_hash: '$2b$10$placeholder_system_account_hash_eduar2026',
                            role: 'TEACHER',
                        },
                    });
                }
                defaultProject = await prisma.project.create({
                    data: {
                        title: 'Proyek Ekosistem AR (Default)',
                        description: 'Proyek default untuk model ekosistem',
                        creatorId: defaultUser.id,
                    },
                });
            }
            let count = 0;
            for (const cat of ecoLib) {
                const ecoName = cat.ecosystem || cat.id;
                const itemList = cat.items || cat.species || cat.models || [];
                for (const sp of itemList) {
                    await prisma.asset.upsert({
                        where: { id: sp.id },
                        update: {},
                        create: {
                            id: sp.id,
                            projectId: defaultProject.id,
                            type: client_1.AssetType.ECOSYSTEM_MODEL,
                            modelUrl: sp.modelSrc || sp.glbUrl || `/uploads/ecosystem-models/library/${ecoName}/${sp.id}.glb`,
                            textureUrl: sp.thumbnail || null,
                            label: sp.name,
                            ecosystem: ecoName,
                            role: sp.role,
                            source: sp.source || 'Poly Pizza',
                            license: sp.license || 'CC0',
                        },
                    });
                    count++;
                }
            }
            console.log(`  ✅ Seeded ${count} ecosystem model assets`);
        }
        else {
            console.log('  ⚠️  No ecosystem-model-library.json found, skipping');
        }
    }
    else {
        console.log(`  ℹ️  Ecosystem model assets already exist (${existingEcoModels}), skipping`);
    }
    await prisma.$disconnect();
    console.log('🌱 Seed complete!');
}
seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map