export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswers: number[];
  images: string[];
  questionType?: string;
}

export interface Quiz {
  id: string;
  title: string;
  createdAt: string;
  questions: Question[];
  submissionsCount?: number;
  kkm?: number | null;
  hasSubmitted?: boolean;
}

export interface Submission {
  id: string;
  quizId: string;
  studentName: string;
  studentClass: string;
  answers: Record<string, number[]>;
  score: number;
  duration?: number;
  violationCount?: number;
  createdAt: string;
}

export type QuizViewMode = "LIST" | "FORM" | "ANALYSIS";
