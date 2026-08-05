import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { R2Module } from './storage/r2.module';
import { AuthModule } from './auth/auth.module';
import { ScenesModule } from './scenes/scenes.module';
import { AssetsModule } from './assets/assets.module';
import { EcosystemModule } from './ecosystem/ecosystem.module';
import { LessonsModule } from './lessons/lessons.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UnityModule } from './unity/unity.module';
import { ViewsModule } from './views/views.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    R2Module,
    AuthModule,
    ScenesModule,
    AssetsModule,
    EcosystemModule,
    LessonsModule,
    QuizzesModule,
    AnalyticsModule,
    UnityModule,
    ViewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
