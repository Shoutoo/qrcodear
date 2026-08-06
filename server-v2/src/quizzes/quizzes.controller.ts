import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateQuizDto, UpdateQuizDto, SubmitAnswerDto } from './dto/create-quiz.dto';

@Controller('api/quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  // ─── PUBLIC: Diagnostic & Manual Seed ─────────────────────────────────
  @Get('health')
  async diagnose() {
    return this.quizzesService.diagnose();
  }

  @Post('force-seed')
  async forceSeed() {
    return this.quizzesService.forceSeed();
  }

  // ─── PUBLIC: Read Quizzes ──────────────────────────────────────────────
  @Get()
  async findAll() {
    return this.quizzesService.findAll();
  }

  @Get('lesson/:lessonId')
  async findByLesson(@Param('lessonId') lessonId: string) {
    return this.quizzesService.findByLesson(lessonId);
  }

  // ─── STUDENT: My Attempts ─────────────────────────────────────────────
  @Get('attempts/my')
  @UseGuards(JwtAuthGuard)
  async getMyAttempts(@Req() req: any) {
    return this.quizzesService.getStudentAttempts(req.user.id);
  }

  // ─── TEACHER: Recap ───────────────────────────────────────────────────
  @Get('attempts/recap')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  async getRecap() {
    return this.quizzesService.getRecap();
  }

  // ─── TEACHER: Create / Update / Delete ────────────────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateQuizDto) {
    return this.quizzesService.create(dto, req.user?.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateQuizDto) {
    return this.quizzesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.quizzesService.delete(id);
  }

  // ─── STUDENT: Submit Answer ────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post(':id/attempt')
  async submitAnswer(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.quizzesService.submitAnswer(id, req.user.id, dto);
  }

  // ─── Get Single Quiz (must be LAST to avoid route conflict) ───────────
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }
}
