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

export async function getSiswaUsersApi(token: string): Promise<{ status: string; users: User[] }> {
  return apiClient.get<{ status: string; users: User[] }>("/api/auth/users", { token });
}

export async function changeSiswaPasswordApi(
  token: string,
  id: number,
  newPassword: string,
): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(`/api/auth/users/${id}/change-password`, { password: newPassword }, { token });
}
