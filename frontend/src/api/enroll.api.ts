import { apiClient } from "./client";

export async function getEnrollStatusApi(token: string): Promise<{ isEnrolled: boolean; deadline: string | null }> {
  return apiClient.get<{ isEnrolled: boolean; deadline: string | null }>("/api/enroll/status", { token });
}

export async function verifyEnrollCodeApi(token: string, code: string): Promise<{ status: string; deadline: string }> {
  return apiClient.post<{ status: string; deadline: string }>("/api/enroll/verify", { code }, { token });
}

export async function getEnrollConfigApi(token: string) {
  return apiClient.get("/api/enroll/config", { token });
}

export async function generateEnrollCodeApi(token: string, deadline: string) {
  return apiClient.post("/api/enroll/generate", { deadline }, { token });
}

export async function getEnrollListApi(token: string) {
  return apiClient.get("/api/enroll/list", { token });
}

export async function revokeEnrollApi(token: string, userId: number) {
  return apiClient.post(`/api/enroll/revoke/${userId}`, {}, { token });
}
