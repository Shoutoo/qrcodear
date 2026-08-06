export declare class CreateQuizDto {
    lessonId?: string;
    question: string;
    options: string[];
    correctAnswer: string;
}
export declare class UpdateQuizDto {
    lessonId?: string;
    question?: string;
    options?: string[];
    correctAnswer?: string;
}
export declare class SubmitAnswerDto {
    answer: string;
}
