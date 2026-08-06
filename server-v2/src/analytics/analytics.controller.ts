import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { LogActivityDto } from './dto/log-activity.dto';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('log')
  async logActivity(@Body() dto: LogActivityDto, @Req() req: any) {
    const userId = req.user?.id || null;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.analyticsService.log(userId, {
      ...dto,
      ipAddress: dto.ipAddress || ipAddress,
      userAgent: dto.userAgent || userAgent,
    });
  }

  @Get('summary')
  async getSummary(@Req() req: any) {
    const userId = req.user?.id || null;
    const userRole = req.user?.role || null;
    return this.analyticsService.getSummary(userId, userRole);
  }

  @Get('logs')
  async getLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('action') action?: string,
    @Req() req?: any,
  ) {
    const userId = req.user?.id || null;
    const userRole = req.user?.role || null;
    return this.analyticsService.getLogs(page || 1, limit || 20, action, userId, userRole);
  }
}

