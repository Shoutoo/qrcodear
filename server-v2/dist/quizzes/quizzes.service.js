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
const quiz_bank_data_1 = require("./quiz-bank.data");
let QuizzesService = class QuizzesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.seedQuizzesIfEmpty();
    }
    async seedQuizzesIfEmpty() {
        try {
            const count = await this.prisma.quiz.count();
            console.log(`[QuizzesService] onModuleInit: Current Quiz count in Neon DB = ${count}`);
            if (count === 0) {
                console.log(`🌱 [QuizzesService] DB kosong! Memulai auto-seed ${quiz_bank_data_1.QUIZ_BANK.length} soal dari embedded QUIZ_BANK...`);
                let project = await this.prisma.project.findFirst();
                if (!project) {
                    let teacher = await this.prisma.user.findFirst({ where: { role: 'TEACHER' } });
                    if (!teacher) {
                        teacher = await this.prisma.user.findFirst();
                    }
                    if (!teacher) {
                        teacher = await this.prisma.user.create({
                            data: {
                                name: 'Guru EduAR System',
                                email: 'system@eduar.internal',
                                password_hash: '$2b$10$abcdefghijklmnopqrstuuvwxyz',
                                role: 'TEACHER',
                            },
                        });
                    }
                    project = await this.prisma.project.create({
                        data: {
                            title: 'Proyek Ekosistem & Kuis SD',
                            description: 'Proyek default untuk kuis interaktif ekosistem SD',
                            creatorId: teacher.id,
                        },
                    });
                    console.log(`✅ [Seed] Created default project: ${project.id}`);
                }
                const lessonMap = {};
                for (const [ecoKey, lessonTitle] of Object.entries(quiz_bank_data_1.LESSON_TITLE_MAP)) {
                    let lesson = await this.prisma.lesson.findFirst({
                        where: { title: lessonTitle, projectId: project.id },
                    });
                    if (!lesson) {
                        lesson = await this.prisma.lesson.create({
                            data: {
                                title: lessonTitle,
                                content: `Kuis Interaktif Ekosistem ${ecoKey} untuk Siswa SD`,
                                projectId: project.id,
                            },
                        });
                        console.log(`✅ [Seed] Created lesson: ${lessonTitle}`);
                    }
                    lessonMap[ecoKey] = lesson.id;
                }
                let seeded = 0;
                for (const item of quiz_bank_data_1.QUIZ_BANK) {
                    const lessonId = lessonMap[item.ecosystem] || lessonMap['umum'];
                    await this.prisma.quiz.create({
                        data: {
                            lessonId,
                            question: item.question.trim(),
                            options: item.options,
                            correctAnswer: item.correctAnswer.trim(),
                        },
                    });
                    seeded++;
                }
                console.log(`✅ [QuizzesService] Auto-seeded ${seeded}/${quiz_bank_data_1.QUIZ_BANK.length} soal ke Neon PostgreSQL berhasil!`);
            }
            else {
                console.log(`[QuizzesService] DB sudah ada ${count} soal, skip auto-seed.`);
            }
        }
        catch (err) {
            console.error('[QuizzesService] ❌ Auto-seed error:', err);
        }
    }
    async getOrCreateDefaultLesson(teacherId) {
        let lesson = await this.prisma.lesson.findFirst();
        if (!lesson) {
            let project = await this.prisma.project.findFirst();
            if (!project) {
                let creatorId = teacherId;
                if (!creatorId) {
                    let teacher = await this.prisma.user.findFirst({ where: { role: 'TEACHER' } });
                    if (!teacher) {
                        teacher = await this.prisma.user.findFirst();
                    }
                    creatorId = teacher?.id;
                }
                if (!creatorId) {
                    const fallbackUser = await this.prisma.user.create({
                        data: {
                            name: 'Guru EduAR',
                            email: `guru_system@eduar.com`,
                            password_hash: '$2b$10$abcdefghijklmnopqrstuv',
                            role: 'TEACHER',
                        },
                    });
                    creatorId = fallbackUser.id;
                }
                project = await this.prisma.project.create({
                    data: {
                        title: 'Proyek Rantai Makanan & Ekosistem SD',
                        description: 'Materi & Kuis Ekosistem',
                        creatorId,
                    },
                });
            }
            lesson = await this.prisma.lesson.create({
                data: {
                    title: 'Kuis Ekosistem Umum',
                    content: 'Default skeleton lesson for quizzes',
                    projectId: project.id,
                },
            });
        }
        return lesson.id;
    }
    async create(dto, teacherId) {
        let targetLessonId = dto.lessonId;
        if (!targetLessonId) {
            const anyLesson = await this.prisma.lesson.findFirst();
            if (anyLesson) {
                targetLessonId = anyLesson.id;
            }
            else {
                targetLessonId = await this.getOrCreateDefaultLesson(teacherId);
            }
        }
        else {
            const lesson = await this.prisma.lesson.findUnique({ where: { id: targetLessonId } });
            if (!lesson) {
                const anyLesson = await this.prisma.lesson.findFirst();
                targetLessonId = anyLesson?.id || await this.getOrCreateDefaultLesson(teacherId);
            }
        }
        if (!Array.isArray(dto.options) || dto.options.length < 2) {
            throw new common_1.BadRequestException('Pilihan kuis harus berupa array dengan minimal 2 opsi');
        }
        const quiz = await this.prisma.quiz.create({
            data: {
                lessonId: targetLessonId,
                question: dto.question.trim(),
                options: dto.options,
                correctAnswer: dto.correctAnswer.trim(),
            },
        });
        return { success: true, quiz };
    }
    async findAll() {
        const quizzes = await this.prisma.quiz.findMany({
            include: {
                lesson: {
                    select: { id: true, title: true }
                }
            },
            orderBy: { id: 'asc' },
        });
        return { success: true, quizzes };
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
            include: {
                lesson: true,
            }
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Kuis tidak ditemukan');
        }
        return { success: true, quiz };
    }
    async update(id, dto) {
        const quiz = await this.prisma.quiz.findUnique({ where: { id } });
        if (!quiz) {
            throw new common_1.NotFoundException('Kuis tidak ditemukan');
        }
        const updated = await this.prisma.quiz.update({
            where: { id },
            data: {
                question: dto.question ? dto.question.trim() : undefined,
                options: dto.options ? dto.options : undefined,
                correctAnswer: dto.correctAnswer ? dto.correctAnswer.trim() : undefined,
                lessonId: dto.lessonId ? dto.lessonId : undefined,
            },
        });
        return { success: true, quiz: updated };
    }
    async delete(id) {
        const quiz = await this.prisma.quiz.findUnique({ where: { id } });
        if (!quiz) {
            throw new common_1.NotFoundException('Kuis tidak ditemukan');
        }
        await this.prisma.quizAttempt.deleteMany({ where: { quizId: id } });
        await this.prisma.quiz.delete({ where: { id } });
        return { success: true, message: 'Kuis berhasil dihapus' };
    }
    async submitAnswer(quizId, studentId, dto) {
        const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
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
        await this.prisma.activityLog.create({
            data: {
                userId: studentId,
                action: 'SUBMIT_QUIZ',
                entityType: 'QUIZ',
                entityId: quizId,
                metadata: { isCorrect, answer: dto.answer },
            },
        }).catch(() => { });
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
    async getRecap() {
        const attempts = await this.prisma.quizAttempt.findMany({
            include: {
                student: {
                    select: { id: true, name: true, email: true }
                },
                quiz: {
                    select: { id: true, question: true, correctAnswer: true }
                }
            },
            orderBy: { attemptedAt: 'desc' }
        });
        return {
            success: true,
            totalAttempts: attempts.length,
            attempts,
        };
    }
    async diagnose() {
        try {
            const quizCount = await this.prisma.quiz.count();
            const lessonCount = await this.prisma.lesson.count();
            const projectCount = await this.prisma.project.count();
            const userCount = await this.prisma.user.count();
            const dbUrl = process.env.DATABASE_URL || 'NOT SET';
            const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':***@');
            const isPooled = dbUrl.includes('-pooler.');
            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                env: process.env.NODE_ENV || 'unknown',
                database: {
                    url_preview: maskedUrl,
                    is_pooled_connection: isPooled,
                    quizzes: quizCount,
                    lessons: lessonCount,
                    projects: projectCount,
                    users: userCount,
                },
                quiz_bank_embedded: quiz_bank_data_1.QUIZ_BANK.length,
                message: quizCount === 0
                    ? '⚠️ DB kosong — POST /api/quizzes/force-seed untuk isi soal'
                    : `✅ ${quizCount} soal tersedia di database`,
            };
        }
        catch (err) {
            return {
                status: 'error',
                error: err.message,
                hint: 'Periksa DATABASE_URL di Render Environment Variables',
            };
        }
    }
    async forceSeed() {
        try {
            const before = await this.prisma.quiz.count();
            if (before > 0) {
                return {
                    success: true,
                    skipped: true,
                    message: `DB sudah memiliki ${before} soal, seed dilewati. Untuk re-seed, hapus semua soal dulu.`,
                    count: before,
                };
            }
            await this.seedQuizzesIfEmpty();
            const after = await this.prisma.quiz.count();
            return {
                success: true,
                seeded: after,
                total: after,
                message: `✅ Berhasil seed ${after} soal ke Neon PostgreSQL`,
            };
        }
        catch (err) {
            return {
                success: false,
                error: err.message,
            };
        }
    }
};
exports.QuizzesService = QuizzesService;
exports.QuizzesService = QuizzesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuizzesService);
//# sourceMappingURL=quizzes.service.js.map