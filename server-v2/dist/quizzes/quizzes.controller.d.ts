import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, UpdateQuizDto, SubmitAnswerDto } from './dto/create-quiz.dto';
export declare class QuizzesController {
    private readonly quizzesService;
    constructor(quizzesService: QuizzesService);
    diagnose(): Promise<{
        status: string;
        timestamp: string;
        env: string;
        database: {
            url_preview: string;
            is_pooled_connection: boolean;
            quizzes: number;
            lessons: number;
            projects: number;
            users: number;
        };
        quiz_bank_embedded: number;
        message: string;
        error?: undefined;
        hint?: undefined;
    } | {
        status: string;
        error: any;
        hint: string;
        timestamp?: undefined;
        env?: undefined;
        database?: undefined;
        quiz_bank_embedded?: undefined;
        message?: undefined;
    }>;
    forceSeed(): Promise<{
        success: boolean;
        skipped: boolean;
        message: string;
        count: number;
        seeded?: undefined;
        total?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        seeded: number;
        total: number;
        message: string;
        skipped?: undefined;
        count?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        skipped?: undefined;
        message?: undefined;
        count?: undefined;
        seeded?: undefined;
        total?: undefined;
    }>;
    findAll(): Promise<{
        success: boolean;
        quizzes: ({
            lesson: {
                id: string;
                title: string;
            };
        } & {
            id: string;
            lessonId: string;
            question: string;
            options: import(".prisma/client").Prisma.JsonValue;
            correctAnswer: string;
        })[];
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
    getMyAttempts(req: any): Promise<{
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
    getRecap(): Promise<{
        success: boolean;
        totalAttempts: number;
        attempts: ({
            quiz: {
                lesson: {
                    id: string;
                    title: string;
                };
                id: string;
                question: string;
                correctAnswer: string;
            };
            student: {
                name: string;
                id: string;
                email: string;
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
    create(req: any, dto: CreateQuizDto): Promise<{
        success: boolean;
        quiz: {
            id: string;
            lessonId: string;
            question: string;
            options: import(".prisma/client").Prisma.JsonValue;
            correctAnswer: string;
        };
    }>;
    update(id: string, dto: UpdateQuizDto): Promise<{
        success: boolean;
        quiz: {
            id: string;
            lessonId: string;
            question: string;
            options: import(".prisma/client").Prisma.JsonValue;
            correctAnswer: string;
        };
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    submitAnswer(id: string, req: any, dto: SubmitAnswerDto): Promise<{
        success: boolean;
        isCorrect: boolean;
        correctAnswer: string;
        attemptId: string;
        attemptedAt: Date;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        quiz: {
            lesson: {
                id: string;
                projectId: string;
                title: string;
                content: string;
            };
        } & {
            id: string;
            lessonId: string;
            question: string;
            options: import(".prisma/client").Prisma.JsonValue;
            correctAnswer: string;
        };
    }>;
}
