import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, SubmitAnswerDto } from './dto/create-quiz.dto';
export declare class QuizzesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateQuizDto): Promise<{
        success: boolean;
        quiz: {
            id: string;
            lessonId: string;
            question: string;
            options: import(".prisma/client").Prisma.JsonValue;
            correctAnswer: string;
        };
    }>;
    findByLesson(lessonId: string): Promise<{
        success: boolean;
        quizzes: {
            id: string;
            lessonId: string;
            question: string;
            options: import(".prisma/client").Prisma.JsonValue;
            correctAnswer: string;
        }[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        quiz: {
            id: string;
            lessonId: string;
            question: string;
            options: import(".prisma/client").Prisma.JsonValue;
            correctAnswer: string;
        };
    }>;
    submitAnswer(quizId: string, studentId: string, dto: SubmitAnswerDto): Promise<{
        success: boolean;
        isCorrect: boolean;
        correctAnswer: string;
        attemptId: string;
        attemptedAt: Date;
    }>;
    getStudentAttempts(studentId: string): Promise<{
        success: boolean;
        score: number;
        totalAttempts: number;
        correctAnswers: number;
        attempts: ({
            quiz: {
                id: string;
                lessonId: string;
                question: string;
                options: import(".prisma/client").Prisma.JsonValue;
                correctAnswer: string;
            };
        } & {
            id: string;
            quizId: string;
            studentId: string;
            answer: string;
            isCorrect: boolean;
            attemptedAt: Date;
        })[];
    }>;
}
