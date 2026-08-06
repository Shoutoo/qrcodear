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

  async getSummary(userId?: string | null, userRole?: string | null) {
    const isStudent = userRole === 'STUDENT' && userId;
    const userFilter: any = isStudent ? { userId } : {};

    const totalLogs = await this.prisma.activityLog.count({ where: userFilter });
    const totalScans = await this.prisma.activityLog.count({ where: { ...userFilter, action: 'SCAN_QR' } });
    const totalArViews = await this.prisma.activityLog.count({ where: { ...userFilter, action: 'VIEW_AR' } });
    const rawBakes = await this.prisma.activityLog.count({ where: { action: 'BAKE_GLB' } });
    const totalBakes = Math.max(rawBakes, 4); // minimum 4 preset GLB

    const totalQuizSubmissions = await this.prisma.quizAttempt.count({ where: isStudent ? { studentId: userId } : {} });

    const studentGroups = await this.prisma.quizAttempt.groupBy({
      by: ['studentId'],
    });
    const totalStudentsAttempted = studentGroups.length;

    const totalAssets = await this.prisma.asset.count();
    const totalScenes = await this.prisma.scene.count();
    const totalQuizzes = await this.prisma.quiz.count();
    const totalQuizAttempts = totalQuizSubmissions;

    return {
      success: true,
      summary: {
        totalLogs,
        totalScans,
        totalArViews,
        totalBakes,
        totalQuizSubmissions,
        totalStudentsAttempted,
        totalAssets,
        totalScenes,
        totalQuizzes,
        totalQuizAttempts,
      },
    };
  }


  async getLogs(page = 1, limit = 20, action?: string, userId?: string | null, userRole?: string | null) {
    const skip = (page - 1) * limit;
    const isStudent = userRole === 'STUDENT' && userId;

    const where: any = {};
    if (action) where.action = action;
    if (isStudent) where.userId = userId;

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

