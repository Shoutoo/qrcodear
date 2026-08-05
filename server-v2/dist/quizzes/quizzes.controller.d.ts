import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, SubmitAnswerDto } from './dto/create-quiz.dto';
export declare class QuizzesController {
    private readonly quizzesService;
    constructor(quizzesService: QuizzesService);
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
    submitAnswer(id: string, req: any, dto: SubmitAnswerDto): Promise<{
        success: boolean;
        isCorrect: boolean;
        correctAnswer: string;
        attemptId: string;
        attemptedAt: Date;
    }>;
}
