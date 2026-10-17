import { apiClient } from "./client";
import type { Quiz, Submission } from "../types/quiz";

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

let quizzesCache: (CacheItem<Quiz[]> & { token: string }) | null = null;
const DEFAULT_TTL_MS = 60 * 1000;

const quizSubmissionsCache = new Map<string, { data: any; timestamp: number }>();
const quizSubmissionsInflight = new Map<string, Promise<any>>();
const SUBMISSIONS_TTL_MS = 30 * 1000;

export function clearQuizSubmissionsCache() {
  quizSubmissionsCache.clear();
}

export function clearQuizzesCache() {
  quizzesCache = null;
  clearQuizSubmissionsCache();
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
  clearQuizzesCache();
  return apiClient.patch(`/api/quiz/${id}/kkm`, { kkm }, { token });
}

export async function deleteQuizSubmissionApi(
  token: string,
  submissionId: string,
): Promise<{ success: boolean; message?: string }> {
  clearQuizzesCache();
  return apiClient.delete<{ success: boolean; message?: string }>(
    `/api/quiz/submissions/${submissionId}`,
    { token },
  );
}

export function getQuizSubmissionsApi(
  token: string,
  id: string,
  forceRefresh?: boolean
): Promise<Submission[]>;
export function getQuizSubmissionsApi(
  token: string,
  id: string,
  forceRefresh: boolean,
  params: { page?: number; limit?: number }
): Promise<{ status: string; data: Submission[]; pagination: any }>;
export async function getQuizSubmissionsApi(
  token: string,
  id: string,
  forceRefresh = false,
  params?: { page?: number; limit?: number }
): Promise<any> {
  if (params && (params.page !== undefined || params.limit !== undefined)) {
    return apiClient.get(`/api/quiz/${id}/submissions`, { token, params });
  }

  const now = Date.now();
  if (!forceRefresh) {
    const cached = quizSubmissionsCache.get(id);
    if (cached && now - cached.timestamp < SUBMISSIONS_TTL_MS) {
      return cached.data;
    }
    const inflight = quizSubmissionsInflight.get(id);
    if (inflight) {
      return inflight;
    }
  }

  const promise = (async () => {
    const res = await apiClient.get<Submission[]>(`/api/quiz/${id}/submissions`, { token });
    quizSubmissionsCache.set(id, { data: res, timestamp: Date.now() });
    return res;
  })();

  quizSubmissionsInflight.set(id, promise);
  const cleanup = () => {
    if (quizSubmissionsInflight.get(id) === promise) {
      quizSubmissionsInflight.delete(id);
    }
  };
  promise.then(cleanup, cleanup);
  return promise;
}

export async function getMySubmissionsApi(token: string): Promise<Submission[]> {
  return apiClient.get<Submission[]>("/api/quiz/my-submissions", { token });
}
