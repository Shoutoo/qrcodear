"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const r2_module_1 = require("./storage/r2.module");
const auth_module_1 = require("./auth/auth.module");
const scenes_module_1 = require("./scenes/scenes.module");
const assets_module_1 = require("./assets/assets.module");
const ecosystem_module_1 = require("./ecosystem/ecosystem.module");
const lessons_module_1 = require("./lessons/lessons.module");
const quizzes_module_1 = require("./quizzes/quizzes.module");
const analytics_module_1 = require("./analytics/analytics.module");
const unity_module_1 = require("./unity/unity.module");
const views_module_1 = require("./views/views.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            prisma_module_1.PrismaModule,
            r2_module_1.R2Module,
            auth_module_1.AuthModule,
            scenes_module_1.ScenesModule,
            assets_module_1.AssetsModule,
            ecosystem_module_1.EcosystemModule,
            lessons_module_1.LessonsModule,
            quizzes_module_1.QuizzesModule,
            analytics_module_1.AnalyticsModule,
            unity_module_1.UnityModule,
            views_module_1.ViewsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map