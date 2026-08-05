import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogActivityDto } from './dto/log-activity.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async log(userId: string | null, dto: LogActivityDto) {
    const logRecord = await this.prisma.activityLog.create({
      data: {
        userId: userId || undefined,
        action: dto.action,
        entityType: dto.entityType || undefined,
        entityId: dto.entityId || undefined,
        metadata: dto.metadata || {},
        ipAddress: dto.ipAddress || undefined,
        userAgent: dto.userAgent || undefined,
      },
    });

    return { success: true, logId: logRecord.id };
  }

  async getSummary() {
    const totalLogs = await this.prisma.activityLog.count();
    const totalScans = await this.prisma.activityLog.count({ where: { action: 'SCAN_QR' } });
    const totalArViews = await this.prisma.activityLog.count({ where: { action: 'VIEW_AR' } });
    const totalBakes = await this.prisma.activityLog.count({ where: { action: 'BAKE_GLB' } });
    const totalQuizSubmissions = await this.prisma.activityLog.count({ where: { action: 'SUBMIT_QUIZ' } });

    const totalAssets = await this.prisma.asset.count();
    const totalScenes = await this.prisma.scene.count();
    const totalQuizzes = await this.prisma.quiz.count();
    const totalQuizAttempts = await this.prisma.quizAttempt.count();

    return {
      success: true,
      summary: {
        totalLogs,
        totalScans,
        totalArViews,
        totalBakes,
        totalQuizSubmissions,
        totalAssets,
        totalScenes,
        totalQuizzes,
        totalQuizAttempts,
      },
    };
  }

  async getLogs(page = 1, limit = 20, action?: string) {
    const skip = (page - 1) * limit;

    const where = action ? { action } : {};

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      success: true,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
      logs,
    };
  }
}
