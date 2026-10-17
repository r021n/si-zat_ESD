import type { Quiz, Submission, Question } from "../../../types/quiz";

export interface ProcessedQuestion extends Question {
  originalIndex: number;
  accuracy: number;
  answeredCount: number;
  emptyCount: number;
}

export interface StudentResultItem {
  question: Question;
  index: number;
  studentAns: number[];
  correct: number[];
  isAnswered: boolean;
  isCorrect: boolean;
}

export function calculateQuizGeneralStats(submissions: Submission[]) {
  const count = submissions.length;
  if (count === 0) {
    return { count: 0, avgScore: 0, highestScore: 0, lowestScore: 0 };
  }
  const avgScore = Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / count);
  const highestScore = Math.max(...submissions.map((s) => s.score));
  const lowestScore = Math.min(...submissions.map((s) => s.score));
  return { count, avgScore, highestScore, lowestScore };
}

export function sortSubmissions(
  submissions: Submission[],
  scoreSort: "NAME_ASC" | "SCORE_DESC" | "SCORE_ASC" | "VIOLATION_DESC",
): Submission[] {
  return [...submissions].sort((a, b) => {
    if (scoreSort === "SCORE_DESC") return b.score - a.score;
    if (scoreSort === "SCORE_ASC") return a.score - b.score;
    if (scoreSort === "VIOLATION_DESC") return (b.violationCount ?? 0) - (a.violationCount ?? 0);
    return a.studentName.localeCompare(b.studentName);
  });
}

export function processQuestions(
  questions: Question[],
  submissions: Submission[],
): ProcessedQuestion[] {
  return questions.map((q, qIdx) => {
    const correctCount = submissions.filter((sub) => {
      const ans = sub.answers[q.id] || [];
      const correct = q.correctAnswers;
      return ans.length === correct.length && ans.every((v) => correct.includes(v));
    }).length;

    const accuracy =
      submissions.length > 0 ? Math.round((correctCount / submissions.length) * 100) : 0;

    const answeredCount = submissions.filter((sub) => {
      const ans = sub.answers[q.id];
      return ans && ans.length > 0;
    }).length;

    const emptyCount = submissions.length - answeredCount;

    return {
      ...q,
      originalIndex: qIdx,
      accuracy,
      answeredCount,
      emptyCount,
    };
  });
}

export function sortProcessedQuestions(
  questions: ProcessedQuestion[],
  itemSort: "ORDER_ASC" | "ACCURACY_DESC" | "ACCURACY_ASC" | "ANSWERED_DESC" | "EMPTY_DESC",
): ProcessedQuestion[] {
  return [...questions].sort((a, b) => {
    if (itemSort === "ACCURACY_DESC") return b.accuracy - a.accuracy;
    if (itemSort === "ACCURACY_ASC") return a.accuracy - b.accuracy;
    if (itemSort === "ANSWERED_DESC") return b.answeredCount - a.answeredCount;
    if (itemSort === "EMPTY_DESC") return b.emptyCount - a.emptyCount;
    return a.originalIndex - b.originalIndex;
  });
}

export function calculateStudentResults(quiz: Quiz, submission: Submission | null): StudentResultItem[] {
  if (!submission) return [];
  return quiz.questions.map((q, qIdx) => {
    const studentAns = submission.answers[q.id] || [];
    const correct = q.correctAnswers || [];
    const isAnswered = studentAns.length > 0;
    const isCorrect =
      isAnswered &&
      studentAns.length === correct.length &&
      studentAns.every((v) => correct.includes(v));

    return {
      question: q,
      index: qIdx,
      studentAns,
      correct,
      isAnswered,
      isCorrect,
    };
  });
}
