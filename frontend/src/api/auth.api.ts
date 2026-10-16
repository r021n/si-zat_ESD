import { apiClient } from "./client";
import type { User } from "../types/auth";

export async function loginApi(email: string, password: string): Promise<{ token: string; user: User }> {
  return apiClient.post<{ token: string; user: User }>("/api/auth/login", { email, password });
}

export async function registerApi(
  email: string,
  kelas: string,
  password: string,
): Promise<{ token: string; user: User }> {
  return apiClient.post<{ token: string; user: User }>("/api/auth/register", { email, kelas, password });
}

export async function loginWithGoogleApi(
  idToken: string,
  kelas?: string,
): Promise<{ registered: boolean; token?: string; user?: User; email?: string; nama?: string }> {
  return apiClient.post("/api/auth/google", { idToken, kelas });
}

export async function getMeApi(token: string): Promise<{ user: User }> {
  return apiClient.get<{ user: User }>("/api/auth/me", { token });
}

export async function updateProfileApi(
  token: string,
  profileData: { kelas: string; nama: string },
): Promise<{ token: string; user: User }> {
  return apiClient.put<{ token: string; user: User }>("/api/auth/me", profileData, { token });
}

let siswaUsersCache: { data: { status: string; users: User[] }; timestamp: number } | null = null;
let siswaUsersInflight: Promise<{ status: string; users: User[] }> | null = null;
const SISWA_USERS_TTL_MS = 60 * 1000;

export function clearSiswaUsersCache() {
  siswaUsersCache = null;
}

export async function getSiswaUsersApi(
  token: string,
  forceRefresh = false,
  params?: { page?: number; limit?: number; search?: string }
): Promise<{ status: string; users: User[]; pagination?: any }> {
  // If params are passed (pagination/search), skip the base cache
  if (params && (params.page !== undefined || params.limit !== undefined || params.search)) {
    return apiClient.get<{ status: string; users: User[]; pagination?: any }>("/api/auth/users", { token, params });
  }

  const now = Date.now();
  if (!forceRefresh) {
    if (siswaUsersCache && now - siswaUsersCache.timestamp < SISWA_USERS_TTL_MS) {
      return siswaUsersCache.data;
    }
    if (siswaUsersInflight) {
      return siswaUsersInflight;
    }
  }

  const promise = (async () => {
    const res = await apiClient.get<{ status: string; users: User[] }>("/api/auth/users", { token });
    siswaUsersCache = { data: res, timestamp: Date.now() };
    return res;
  })();

  siswaUsersInflight = promise;
  const cleanup = () => {
    if (siswaUsersInflight === promise) siswaUsersInflight = null;
  };
  promise.then(cleanup, cleanup);
  return promise;
}

export async function changeSiswaPasswordApi(
  token: string,
  id: number,
  newPassword: string,
): Promise<{ message: string }> {
  clearSiswaUsersCache();
  return apiClient.post<{ message: string }>(`/api/auth/users/${id}/change-password`, { password: newPassword }, { token });
}
