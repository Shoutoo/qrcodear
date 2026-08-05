import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateQuizDto, SubmitAnswerDto } from './dto/create-quiz.dto';

@Controller('api/quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @Post()
  async create(@Body() dto: CreateQuizDto) {
    return this.quizzesService.create(dto);
  }

  @Get('lesson/:lessonId')
  async findByLesson(@Param('lessonId') lessonId: string) {
    return this.quizzesService.findByLesson(lessonId);
  }

  @Get('attempts/my')
  @UseGuards(JwtAuthGuard)
  async getMyAttempts(@Req() req: any) {
    return this.quizzesService.getStudentAttempts(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/attempt')
  async submitAnswer(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.quizzesService.submitAnswer(id, req.user.id, dto);
  }
}
