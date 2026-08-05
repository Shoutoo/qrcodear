import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, SubmitAnswerDto } from './dto/create-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQuizDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson tidak ditemukan');
    }

    if (!Array.isArray(dto.options) || dto.options.length < 2) {
      throw new BadRequestException('Pilihan kuis harus berupa array dengan minimal 2 opsi');
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
    });

    if (!quiz) {
      throw new NotFoundException('Kuis tidak ditemukan');
    }

    return { success: true, quiz };
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
}
