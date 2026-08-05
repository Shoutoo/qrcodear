export class CreateLessonDto {
  title!: string;
  content?: string;
  projectId?: string;
}

export class UpdateLessonDto {
  title?: string;
  content?: string;
}
