import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ScenesService } from './scenes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api')
export class ScenesController {
  constructor(private readonly scenesService: ScenesService) {}

  @Get('scenes')
  async getAllScenes() {
    const scenes = await this.scenesService.findAll();
    return { success: true, scenes };
  }

  @Get('scenes/:id')
  async getSceneById(@Param('id') id: string) {
    const scene = await this.scenesService.findOne(id);
    return { success: true, scene };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @Post('studio/publish/:id')
  async publishStudioScene(
    @Param('id') id: string,
    @Body('sceneData') sceneData: any,
    @Req() req: any,
  ) {
    const hostHeader = req.get('host') || 'localhost:3001';
    const protocol = req.headers['x-forwarded-proto']?.toString() || req.protocol || 'http';
    return this.scenesService.publishScene(id, sceneData, hostHeader, protocol);
  }
}

