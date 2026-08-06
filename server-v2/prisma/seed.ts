import { PrismaClient, PublishType, AssetType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const ROOT_DIR = path.join(__dirname, '..', '..', '..');
const DATA_DIR = path.join(ROOT_DIR, 'server', 'data');

async function seed() {
  console.log('🌱 AlamVerse — Where Nature Meets Reality — Prisma Seed Script');

  // ─── 1. Seed Ecosystem Presets ───────────────────────────────────────
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
    } else {
      console.log('  ⚠️  No ecosystem-presets.json found, skipping');
    }
  } else {
    console.log(`  ℹ️  Presets already exist (${existingPresets}), skipping`);
  }

  // ─── 2. Seed Published Experiences ───────────────────────────────────
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
            type: PublishType.ECOSYSTEM_PRESET,
            presetId: pub.presetId || null,
            bakedGlbUrl: pub.glbUrl || `/assets/${pub.id}.glb`,
            qrCodeUrl: pub.qrCodeDataUrl || pub.qrFilename || '',
            viewUrl: pub.directUrl || `/ecosystem/view/${pub.id}`,
            createdAt: pub.publishedAt ? new Date(pub.publishedAt) : new Date(),
          },
        });
      }
      console.log(`  ✅ Seeded ${published.length} published experiences`);
    } else {
      console.log('  ⚠️  No ecosystem-published.json found, skipping');
    }
  } else {
    console.log(`  ℹ️  Published experiences already exist (${existingPub}), skipping`);
  }

  // ─── 3. Seed Ecosystem Model Library ─────────────────────────────────
  const existingEcoModels = await prisma.asset.count({
    where: { type: AssetType.ECOSYSTEM_MODEL },
  });
  if (existingEcoModels === 0) {
    const ecoLibFile = path.join(DATA_DIR, 'ecosystem-model-library.json');
    if (fs.existsSync(ecoLibFile)) {
      const ecoLib = JSON.parse(fs.readFileSync(ecoLibFile, 'utf8'));
      // Find or create a default project for ecosystem assets
      let defaultProject = await prisma.project.findFirst();
      if (!defaultProject) {
        let defaultUser = await prisma.user.findFirst();
        if (!defaultUser) {
          defaultUser = await prisma.user.create({
            data: {
              name: 'AlamVerse System',
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
              type: AssetType.ECOSYSTEM_MODEL,
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
    } else {
      console.log('  ⚠️  No ecosystem-model-library.json found, skipping');
    }
  } else {
    console.log(`  ℹ️  Ecosystem model assets already exist (${existingEcoModels}), skipping`);
  }

  // ─── 4. Seed Test Accounts (1 TEACHER & 1 STUDENT) ─────────────────────
  const bcrypt = require('bcryptjs');
  const defaultPasswordHash = await bcrypt.hash('Test1234!', 10);

  const teacher = await prisma.user.upsert({
    where: { email: 'guru@eduar.id' },
    update: {
      name: 'Bapak Guru Test',
      password_hash: defaultPasswordHash,
      role: 'TEACHER',
    },
    create: {
      name: 'Bapak Guru Test',
      email: 'guru@eduar.id',
      password_hash: defaultPasswordHash,
      role: 'TEACHER',
    },
  });
  console.log(`  ✅ Seeded TEACHER account: guru@eduar.id (Password: Test1234!)`);

  const student = await prisma.user.upsert({
    where: { email: 'siswa@eduar.id' },
    update: {
      name: 'Siswa Belajar Test',
      password_hash: defaultPasswordHash,
      role: 'STUDENT',
    },
    create: {
      name: 'Siswa Belajar Test',
      email: 'siswa@eduar.id',
      password_hash: defaultPasswordHash,
      role: 'STUDENT',
    },
  });
  console.log(`  ✅ Seeded STUDENT account: siswa@eduar.id (Password: Test1234!)`);

  await prisma.$disconnect();
  console.log('🌱 Seed complete!');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
