import { PrismaService } from '../prisma/prisma.service';
import { LogActivityDto } from './dto/log-activity.dto';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    log(userId: string | null, dto: LogActivityDto): Promise<{
        success: boolean;
        logId: string;
    }>;
    getSummary(userId?: string | null, userRole?: string | null): Promise<{
        success: boolean;
        summary: {
            totalLogs: number;
            totalScans: number;
            totalArViews: number;
            totalBakes: number;
            totalQuizSubmissions: number;
            totalAssets: number;
            totalScenes: number;
            totalQuizzes: number;
            totalQuizAttempts: number;
        };
    }>;
    getLogs(page?: number, limit?: number, action?: string, userId?: string | null, userRole?: string | null): Promise<{
        success: boolean;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        logs: ({
            user: {
                name: string;
                id: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
            } | null;
        } & {
            id: string;
            userId: string | null;
            action: string;
            entityType: string | null;
            entityId: string | null;
            metadata: import(".prisma/client").Prisma.JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            createdAt: Date;
        })[];
    }>;
}
