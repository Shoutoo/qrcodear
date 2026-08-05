import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';
export declare class LessonsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateLessonDto): Promise<{
        success: boolean;
        lesson: {
            quizzes: {
                id: string;
                lessonId: string;
                question: string;
                options: import(".prisma/client").Prisma.JsonValue;
                correctAnswer: string;
            }[];
        } & {
            id: string;
            projectId: string;
            title: string;
            content: string;
        };
    }>;
    findAll(): Promise<{
        success: boolean;
        lessons: ({
            quizzes: {
                id: string;
                lessonId: string;
                question: string;
                options: import(".prisma/client").Prisma.JsonValue;
                correctAnswer: string;
            }[];
        } & {
            id: string;
            projectId: string;
            title: string;
            content: string;
        })[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        lesson: {
            quizzes: {
                id: string;
                lessonId: string;
                question: string;
                options: import(".prisma/client").Prisma.JsonValue;
                correctAnswer: string;
            }[];
        } & {
            id: string;
            projectId: string;
            title: string;
            content: string;
        };
    }>;
    update(id: string, dto: UpdateLessonDto): Promise<{
        success: boolean;
        lesson: {
            id: string;
            projectId: string;
            title: string;
            content: string;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
