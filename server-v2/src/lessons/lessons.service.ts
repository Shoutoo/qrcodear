import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLessonDto) {
    let projectId = dto.projectId;
    if (!projectId) {
      const defaultProject = await this.prisma.project.findFirst();
      if (!defaultProject) {
        throw new NotFoundException('Project tidak ditemukan');
      }
      projectId = defaultProject.id;
    }

    const lesson = await this.prisma.lesson.create({
      data: {
        title: dto.title.trim(),
        content: dto.content || 'Materi AR Rantai Makanan',
        projectId,
      },
      include: {
        quizzes: true,
      },
    });

    return { success: true, lesson };
  }

  async findAll() {
    const lessons = await this.prisma.lesson.findMany({
      include: {
        quizzes: true,
      },
      orderBy: { id: 'desc' },
    });

    return { success: true, lessons };
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        quizzes: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson tidak ditemukan');
    }

    return { success: true, lesson };
  }

  async update(id: string, dto: UpdateLessonDto) {
    const existing = await this.prisma.lesson.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Lesson tidak ditemukan');
    }

    const updated = await this.prisma.lesson.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? dto.title.trim() : existing.title,
        content: dto.content !== undefined ? dto.content : existing.content,
      },
    });

    return { success: true, lesson: updated };
  }

  async remove(id: string) {
    const existing = await this.prisma.lesson.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Lesson tidak ditemukan');
    }

    await this.prisma.quiz.deleteMany({ where: { lessonId: id } });
    await this.prisma.lesson.delete({ where: { id } });

    return { success: true, message: 'Lesson berhasil dihapus' };
  }
}
