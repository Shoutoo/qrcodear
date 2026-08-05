"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LessonsService = class LessonsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        let projectId = dto.projectId;
        if (!projectId) {
            const defaultProject = await this.prisma.project.findFirst();
            if (!defaultProject) {
                throw new common_1.NotFoundException('Project tidak ditemukan');
            }
            projectId = defaultProject.id;
        }
        const lesson = await this.prisma.lesson.create({
            data: {
                title: dto.title.trim(),
                content: dto.content || 'Materi AR Rantai Makanan',
                projectId,
            },
            include: {
                quizzes: true,
            },
        });
        return { success: true, lesson };
    }
    async findAll() {
        const lessons = await this.prisma.lesson.findMany({
            include: {
                quizzes: true,
            },
            orderBy: { id: 'desc' },
        });
        return { success: true, lessons };
    }
    async findOne(id) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
            include: {
                quizzes: true,
            },
        });
        if (!lesson) {
            throw new common_1.NotFoundException('Lesson tidak ditemukan');
        }
        return { success: true, lesson };
    }
    async update(id, dto) {
        const existing = await this.prisma.lesson.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Lesson tidak ditemukan');
        }
        const updated = await this.prisma.lesson.update({
            where: { id },
            data: {
                title: dto.title !== undefined ? dto.title.trim() : existing.title,
                content: dto.content !== undefined ? dto.content : existing.content,
            },
        });
        return { success: true, lesson: updated };
    }
    async remove(id) {
        const existing = await this.prisma.lesson.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Lesson tidak ditemukan');
        }
        await this.prisma.quiz.deleteMany({ where: { lessonId: id } });
        await this.prisma.lesson.delete({ where: { id } });
        return { success: true, message: 'Lesson berhasil dihapus' };
    }
};
exports.LessonsService = LessonsService;
exports.LessonsService = LessonsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LessonsService);
//# sourceMappingURL=lessons.service.js.map