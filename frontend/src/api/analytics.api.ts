import { apiClient } from "./client";

export async function recordOpenApi(token: string) {
  return apiClient.post("/api/auth/record-open", {}, { token });
}

export async function recordUsageApi(token: string, seconds: number) {
  return apiClient.post("/api/auth/record-usage", { seconds }, { token });
}

export async function recordMenuClickApi(token: string, menuKey: string) {
  return apiClient.post("/api/analytics/record", { menuKey }, { token });
}

export async function getMenuAnalyticsApi(token: string): Promise<{ status: string; data: { menuKey: string; count: number }[] }> {
  return apiClient.get<{ status: string; data: { menuKey: string; count: number }[] }>("/api/analytics", { token });
}

export async function getSiswaAnalyticsApi(
  token: string,
  userId: number,
): Promise<{ status: string; data: { menuKey: string; count: number }[] }> {
  return apiClient.get<{ status: string; data: { menuKey: string; count: number }[] }>(`/api/analytics/user/${userId}`, { token });
}
