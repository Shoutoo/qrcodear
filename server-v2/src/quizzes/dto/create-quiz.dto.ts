export class CreateQuizDto {
  lessonId?: string;
  question!: string;
  options!: string[];
  correctAnswer!: string;
}

export class UpdateQuizDto {
  lessonId?: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
}

export class SubmitAnswerDto {
  answer!: string;
}

