"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizzesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let QuizzesService = class QuizzesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: dto.lessonId },
        });
        if (!lesson) {
            throw new common_1.NotFoundException('Lesson tidak ditemukan');
        }
        if (!Array.isArray(dto.options) || dto.options.length < 2) {
            throw new common_1.BadRequestException('Pilihan kuis harus berupa array dengan minimal 2 opsi');
        }
        const quiz = await this.prisma.quiz.create({
            data: {
                lessonId: dto.lessonId,
                question: dto.question.trim(),
                options: dto.options,
                correctAnswer: dto.correctAnswer.trim(),
            },
        });
        return { success: true, quiz };
    }
    async findByLesson(lessonId) {
        const quizzes = await this.prisma.quiz.findMany({
            where: { lessonId },
            orderBy: { id: 'asc' },
        });
        return { success: true, quizzes };
    }
    async findOne(id) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Kuis tidak ditemukan');
        }
        return { success: true, quiz };
    }
    async submitAnswer(quizId, studentId, dto) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Kuis tidak ditemukan');
        }
        const isCorrect = dto.answer.trim().toLowerCase() === quiz.correctAnswer.trim().toLowerCase();
        const attempt = await this.prisma.quizAttempt.create({
            data: {
                quizId: quiz.id,
                studentId,
                answer: dto.answer.trim(),
                isCorrect,
            },
        });
        return {
            success: true,
            isCorrect,
            correctAnswer: quiz.correctAnswer,
            attemptId: attempt.id,
            attemptedAt: attempt.attemptedAt,
        };
    }
    async getStudentAttempts(studentId) {
        const attempts = await this.prisma.quizAttempt.findMany({
            where: { studentId },
            include: {
                quiz: true,
            },
            orderBy: { attemptedAt: 'desc' },
        });
        const total = attempts.length;
        const correctCount = attempts.filter((a) => a.isCorrect).length;
        const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
        return {
            success: true,
            score,
            totalAttempts: total,
            correctAnswers: correctCount,
            attempts,
        };
    }
};
exports.QuizzesService = QuizzesService;
exports.QuizzesService = QuizzesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuizzesService);
//# sourceMappingURL=quizzes.service.js.map