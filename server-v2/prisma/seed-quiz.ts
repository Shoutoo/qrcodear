import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Quiz Seed Script...');

  // 1. Ensure default teacher & project exist
  let teacher = await prisma.user.findFirst({ where: { role: 'TEACHER' } });
  if (!teacher) {
    teacher = await prisma.user.create({
      data: {
        name: 'Guru Pak Budi',
        email: 'guru@eduar.com',
        password_hash: '$2b$10$abcdefghijklmnopqrstuv', // placeholder hash
        role: 'TEACHER',
      },
    });
  }

  let project = await prisma.project.findFirst({ where: { creatorId: teacher.id } });
  if (!project) {
    project = await prisma.project.create({
      data: {
        title: 'Proyek Rantai Makanan & Ekosistem SD',
        description: 'Materi pembelajaran dan bank soal kuis interaktif ekosistem SD',
        creatorId: teacher.id,
      },
    });
  }

  // 2. Load bank soal json
  const jsonPath = path.resolve(__dirname, '../../bank-soal-kuis-ekosistem-SD.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Bank soal JSON not found at:', jsonPath);
    return;
  }

  const quizData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`📋 Found ${quizData.length} questions in bank-soal-kuis-ekosistem-SD.json`);

  // Map ecosystem to lesson title
  const lessonTitles: Record<string, string> = {
    umum: 'Kuis Ekosistem Umum',
    hutan: 'Kuis Ekosistem Hutan',
    darat: 'Kuis Ekosistem Darat',
    laut: 'Kuis Ekosistem Laut',
    sawah: 'Kuis Ekosistem Sawah',
  };

  const lessonMap: Record<string, string> = {};

  for (const ecoKey of Object.keys(lessonTitles)) {
    const title = lessonTitles[ecoKey];
    let lesson = await prisma.lesson.findFirst({ where: { title, projectId: project.id } });
    if (!lesson) {
      lesson = await prisma.lesson.create({
        data: {
          title,
          content: `Skeleton Lesson wadah kuis interaktif kategori ekosistem ${ecoKey}`,
          projectId: project.id,
        },
      });
    }
    lessonMap[ecoKey] = lesson.id;
  }

  // 3. Insert/Upsert Quizzes
  let seededCount = 0;
  for (const item of quizData) {
    const lessonId = lessonMap[item.ecosystem] || lessonMap['umum'];
    
    // Check if question already exists in this lesson
    const existing = await prisma.quiz.findFirst({
      where: { lessonId, question: item.question }
    });

    if (!existing) {
      await prisma.quiz.create({
        data: {
          lessonId,
          question: item.question,
          options: item.options,
          correctAnswer: item.correctAnswer,
        },
      });
      seededCount++;
    }
  }

  console.log(`✅ Quiz Seeding Completed! Seeded ${seededCount} new quiz questions into database.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
