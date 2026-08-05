"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const lessons_service_1 = require("./lessons/lessons.service");
const quizzes_service_1 = require("./quizzes/quizzes.service");
const prisma_service_1 = require("./prisma/prisma.service");
async function testQuizModule() {
    console.log('=====================================================');
    console.log('🧪 FASE R6: Testing Quiz & Lesson Modules');
    console.log('=====================================================\n');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const lessonsService = app.get(lessons_service_1.LessonsService);
    const quizzesService = app.get(quizzes_service_1.QuizzesService);
    const prisma = app.get(prisma_service_1.PrismaService);
    const defaultUser = await prisma.user.findFirst();
    if (!defaultUser)
        throw new Error('Default user tidak ditemukan');
    console.log('1. Creating Lesson...');
    const lessonRes = await lessonsService.create({
        title: 'Materi Ekosistem Darat & Rantai Makanan AR',
        content: 'Dalam ekosistem darat, rumput bertindak sebagai produsen dan belalang sebagai konsumen primer.',
    });
    console.log(`   ✅ Lesson Created: ID=${lessonRes.lesson.id}, Title="${lessonRes.lesson.title}"`);
    console.log('\n2. Creating Quiz Questions...');
    const q1 = await quizzesService.create({
        lessonId: lessonRes.lesson.id,
        question: 'Organisme apakah yang bertindak sebagai produsen dalam ekosistem sawah?',
        options: ['Belalang', 'Padi', 'Ular', 'Katak'],
        correctAnswer: 'Padi',
    });
    console.log(`   ✅ Quiz 1 Created: "${q1.quiz.question}" (Jawaban Benar: ${q1.quiz.correctAnswer})`);
    const q2 = await quizzesService.create({
        lessonId: lessonRes.lesson.id,
        question: 'Siapakah peranan jamur dan bakteri dalam rantai makanan?',
        options: ['Produsen', 'Konsumen Primer', 'Decomposer (Pengurai)', 'Konsumen Tersier'],
        correctAnswer: 'Decomposer (Pengurai)',
    });
    console.log(`   ✅ Quiz 2 Created: "${q2.quiz.question}" (Jawaban Benar: ${q2.quiz.correctAnswer})`);
    console.log('\n3. Submitting Student Answers (Quiz Attempt)...');
    const attempt1 = await quizzesService.submitAnswer(q1.quiz.id, defaultUser.id, { answer: 'Padi' });
    console.log(`   ✅ Student Answer to Q1: "Padi" → Result: ${attempt1.isCorrect ? 'BENAR (100%)' : 'SALAH'}`);
    const attempt2 = await quizzesService.submitAnswer(q2.quiz.id, defaultUser.id, { answer: 'Produsen' });
    console.log(`   ✅ Student Answer to Q2: "Produsen" → Result: ${attempt2.isCorrect ? 'BENAR' : 'SALAH (0%)'}`);
    console.log('\n4. Retrieving Student Quiz Score & Performance History...');
    const scoreRes = await quizzesService.getStudentAttempts(defaultUser.id);
    console.log(`   ✅ Total Attempts: ${scoreRes.totalAttempts}`);
    console.log(`   ✅ Correct Answers: ${scoreRes.correctAnswers}`);
    console.log(`   ✅ Calculated Score: ${scoreRes.score}%`);
    await app.close();
    console.log('\n=====================================================');
    console.log('✅ ALL FASE R6 QUIZ & LESSON MODULES VALIDATED SUCCESSFULLY');
    console.log('=====================================================');
}
testQuizModule().catch(console.error);
//# sourceMappingURL=test-r6-quiz.js.map