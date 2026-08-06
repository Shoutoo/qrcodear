import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, UpdateQuizDto, SubmitAnswerDto } from './dto/create-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreateDefaultLesson(): Promise<string> {
    let lesson = await this.prisma.lesson.findFirst({
      where: { title: 'Kuis Ekosistem Umum' },
    });

    if (!lesson) {
      let project = await this.prisma.project.findFirst();
      if (!project) {
        let teacher = await this.prisma.user.findFirst({ where: { role: 'TEACHER' } });
        if (!teacher) {
          teacher = await this.prisma.user.create({
            data: {
              name: 'Guru EduAR',
              email: 'guru@eduar.com',
              password_hash: '$2b$10$abcdefghijklmnopqrstuv',
              role: 'TEACHER',
            },
          });
        }
        project = await this.prisma.project.create({
          data: {
            title: 'Proyek Rantai Makanan SD',
            creatorId: teacher.id,
          },
        });
      }

      lesson = await this.prisma.lesson.create({
        data: {
          title: 'Kuis Ekosistem Umum',
          content: 'Default skeleton lesson for unassigned quizzes',
          projectId: project.id,
        },
      });
    }

    return lesson.id;
  }

  async create(dto: CreateQuizDto) {
    let targetLessonId = dto.lessonId;
    if (!targetLessonId) {
      targetLessonId = await this.getOrCreateDefaultLesson();
    } else {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: targetLessonId },
      });
      if (!lesson) {
        throw new NotFoundException('Lesson tidak ditemukan');
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

