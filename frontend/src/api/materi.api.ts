import { apiClient } from "./client";

export async function getMateriProgressApi(
  token: string,
): Promise<{ status: string; progress: { lastPage: number; maxUnlockedIndex: number } }> {
  return apiClient.get<{ status: string; progress: { lastPage: number; maxUnlockedIndex: number } }>("/api/materi/progress", { token });
}

export async function updateMateriProgressApi(
  token: string,
  progress: { lastPage: number; maxUnlockedIndex?: number },
) {
  return apiClient.post("/api/materi/progress", progress, { token });
}

export async function resetMateriProgressApi(token: string) {
  return apiClient.post("/api/materi/progress/reset", {}, { token });
}
