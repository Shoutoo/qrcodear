import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { UnityService } from './unity.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  CreateStructuredSceneDto,
  CreateSceneObjectDto,
  UpdateSceneObjectDto,
  CreateInteractivityDto,
  PublishUnitySceneDto,
} from './dto/unity-structured.dto';

@Controller('api/unity')
export class UnityController {
  constructor(private readonly unityService: UnityService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @Post('scenes')
  async createScene(@Body() dto: CreateStructuredSceneDto) {
    return this.unityService.createScene(dto);
  }

  @Get('scenes/:id')
  async getScene(@Param('id') id: string) {
    return this.unityService.getScene(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @Post('scenes/:sceneId/objects')
  async addObject(@Param('sceneId') sceneId: string, @Body() dto: CreateSceneObjectDto) {
    return this.unityService.addObject(sceneId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @Put('objects/:id')
  async updateObject(@Param('id') id: string, @Body() dto: UpdateSceneObjectDto) {
    return this.unityService.updateObject(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @Delete('objects/:id')
  async deleteObject(@Param('id') id: string) {
    return this.unityService.deleteObject(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @Post('scenes/:sceneId/interactivities')
  async addInteractivity(@Param('sceneId') sceneId: string, @Body() dto: CreateInteractivityDto) {
    return this.unityService.addInteractivity(sceneId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @Delete('interactivities/:id')
  async deleteInteractivity(@Param('id') id: string) {
    return this.unityService.deleteInteractivity(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @Post('publish/:sceneId')
  async publishScene(
    @Param('sceneId') sceneId: string,
    @Body() dto: PublishUnitySceneDto,
    @Req() req: any,
  ) {
    const hostHeader = req.get('host') || 'localhost:3001';
    const protocol = req.headers['x-forwarded-proto']?.toString() || req.protocol || 'http';
    return this.unityService.publishScene(sceneId, dto, hostHeader, protocol);
  }
}

