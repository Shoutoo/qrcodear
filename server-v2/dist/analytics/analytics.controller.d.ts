import { AnalyticsService } from './analytics.service';
import { LogActivityDto } from './dto/log-activity.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    logActivity(dto: LogActivityDto, req: any): Promise<{
        success: boolean;
        logId: string;
    }>;
    getSummary(req: any): Promise<{
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
    getLogs(page?: number, limit?: number, action?: string, req?: any): Promise<{
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
