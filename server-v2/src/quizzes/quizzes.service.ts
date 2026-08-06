import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, UpdateQuizDto, SubmitAnswerDto } from './dto/create-quiz.dto';
import { QUIZ_BANK, LESSON_TITLE_MAP } from './quiz-bank.data';

@Injectable()
export class QuizzesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedQuizzesIfEmpty();
  }

  private async seedQuizzesIfEmpty() {
    try {
      const count = await this.prisma.quiz.count();
      console.log(`[QuizzesService] onModuleInit: Current Quiz count in Neon DB = ${count}`);

      if (count === 0) {
        console.log(`🌱 [QuizzesService] DB kosong! Memulai auto-seed ${QUIZ_BANK.length} soal dari embedded QUIZ_BANK...`);

        // Step 1: Pastikan ada project
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

        // Step 2: Buat/cari semua lesson berdasarkan kategori ekosistem
        const lessonMap: Record<string, string> = {};
        for (const [ecoKey, lessonTitle] of Object.entries(LESSON_TITLE_MAP)) {
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

        // Step 3: Insert semua soal kuis dari embedded QUIZ_BANK
        let seeded = 0;
        for (const item of QUIZ_BANK) {
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
        console.log(`✅ [QuizzesService] Auto-seeded ${seeded}/${QUIZ_BANK.length} soal ke Neon PostgreSQL berhasil!`);
      } else {
        console.log(`[QuizzesService] DB sudah ada ${count} soal, skip auto-seed.`);
      }
    } catch (err) {
      console.error('[QuizzesService] ❌ Auto-seed error:', err);
    }
  }


  private async getOrCreateDefaultLesson(teacherId?: string): Promise<string> {
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

  async create(dto: CreateQuizDto, teacherId?: string) {
    let targetLessonId = dto.lessonId;

    if (!targetLessonId) {
      // Find any existing lesson (seeding should have created lessons already)
      const anyLesson = await this.prisma.lesson.findFirst();
      if (anyLesson) {
        targetLessonId = anyLesson.id;
      } else {
        // Fallback: create lesson + project if none exist at all
        targetLessonId = await this.getOrCreateDefaultLesson(teacherId);
      }
    } else {
      const lesson = await this.prisma.lesson.findUnique({ where: { id: targetLessonId } });
      if (!lesson) {
        const anyLesson = await this.prisma.lesson.findFirst();
        targetLessonId = anyLesson?.id || await this.getOrCreateDefaultLesson(teacherId);
      }
    }

    if (!Array.isArray(dto.options) || dto.options.length < 2) {
      throw new BadRequestException('Pilihan kuis harus berupa array dengan minimal 2 opsi');
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

  async findByLesson(lessonId: string) {
    const quizzes = await this.prisma.quiz.findMany({
      where: { lessonId },
      orderBy: { id: 'asc' },
    });

    return { success: true, quizzes };
  }

  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        lesson: true,
      }
    });

    if (!quiz) {
      throw new NotFoundException('Kuis tidak ditemukan');
    }

    return { success: true, quiz };
  }

  async update(id: string, dto: UpdateQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz) {
      throw new NotFoundException('Kuis tidak ditemukan');
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

  async delete(id: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz) {
      throw new NotFoundException('Kuis tidak ditemukan');
    }

    // Delete attempts first to satisfy foreign key constraint
    await this.prisma.quizAttempt.deleteMany({ where: { quizId: id } });
    await this.prisma.quiz.delete({ where: { id } });

    return { success: true, message: 'Kuis berhasil dihapus' };
  }

  async submitAnswer(quizId: string, studentId: string, dto: SubmitAnswerDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Kuis tidak ditemukan');
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

    // Also record activity log for SUBMIT_QUIZ
    await this.prisma.activityLog.create({
      data: {
        userId: studentId,
        action: 'SUBMIT_QUIZ',
        entityType: 'QUIZ',
        entityId: quizId,
        metadata: { isCorrect, answer: dto.answer },
      },
    }).catch(() => {});

    return {
      success: true,
      isCorrect,
      correctAnswer: quiz.correctAnswer,
      attemptId: attempt.id,
      attemptedAt: attempt.attemptedAt,
    };
  }

  async getStudentAttempts(studentId: string) {
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
}

