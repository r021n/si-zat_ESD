import { apiClient } from "./client";
import type { Quiz, Submission } from "../types/quiz";

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

let quizzesCache: (CacheItem<Quiz[]> & { token: string }) | null = null;
const DEFAULT_TTL_MS = 60 * 1000;

export function clearQuizzesCache() {
  quizzesCache = null;
}

export async function getQuizzesApi(token: string, forceRefresh = false): Promise<Quiz[]> {
  const now = Date.now();
  if (
    !forceRefresh &&
    quizzesCache &&
    quizzesCache.token === token &&
    now - quizzesCache.timestamp < DEFAULT_TTL_MS
  ) {
    return quizzesCache.data;
  }

  const data = await apiClient.get<Quiz[]>("/api/quiz", { token });
  quizzesCache = { data, timestamp: now, token };
  return data;
}

export async function createQuizApi(token: string, quizData: any): Promise<{ quiz: Quiz }> {
  clearQuizzesCache();
  return apiClient.post<{ quiz: Quiz }>("/api/quiz", quizData, { token });
}

export async function updateQuizApi(token: string, id: string, quizData: any): Promise<{ quiz: Quiz }> {
  clearQuizzesCache();
  return apiClient.put<{ quiz: Quiz }>(`/api/quiz/${id}`, quizData, { token });
}

export async function deleteQuizApi(token: string, id: string): Promise<{ success: boolean }> {
  clearQuizzesCache();
  return apiClient.delete<{ success: boolean }>(`/api/quiz/${id}`, { token });
}

export async function submitQuizAnswersApi(
  token: string,
  id: string,
  answersData: { answers: any; score: number; createdAt?: string; duration?: number; violationCount?: number },
): Promise<{ success: boolean; submission?: Submission; [key: string]: any }> {
  clearQuizzesCache();
  return apiClient.post(`/api/quiz/${id}/submit`, answersData, { token });
}

export async function updateQuizKkmApi(
  token: string,
  id: string,
  kkm: number | null,
): Promise<{ success: boolean; kkm?: number | null }> {
  return apiClient.patch(`/api/quiz/${id}/kkm`, { kkm }, { token });
}

export async function getQuizSubmissionsApi(token: string, id: string): Promise<Submission[]> {
  return apiClient.get<Submission[]>(`/api/quiz/${id}/submissions`, { token });
}

export async function getMySubmissionsApi(token: string): Promise<Submission[]> {
  return apiClient.get<Submission[]>("/api/quiz/my-submissions", { token });
}
