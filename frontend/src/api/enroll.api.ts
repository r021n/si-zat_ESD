import { apiClient } from "./client";

let enrollListCache: { data: any; timestamp: number } | null = null;
let enrollListInflight: Promise<any> | null = null;
const ENROLL_LIST_TTL_MS = 45 * 1000;

export function clearEnrollCache() {
  enrollListCache = null;
}

export async function getEnrollStatusApi(token: string): Promise<{ isEnrolled: boolean; deadline: string | null }> {
  return apiClient.get<{ isEnrolled: boolean; deadline: string | null }>("/api/enroll/status", { token });
}

export async function verifyEnrollCodeApi(token: string, code: string): Promise<{ status: string; deadline: string }> {
  clearEnrollCache();
  return apiClient.post<{ status: string; deadline: string }>("/api/enroll/verify", { code }, { token });
}

export async function getEnrollConfigApi(token: string) {
  return apiClient.get("/api/enroll/config", { token });
}

export async function generateEnrollCodeApi(token: string, deadline: string) {
  clearEnrollCache();
  return apiClient.post("/api/enroll/generate", { deadline }, { token });
}

export async function getEnrollListApi(
  token: string,
  forceRefresh = false,
  params?: { page?: number; limit?: number; search?: string; status?: string }
) {
  if (params && (params.page !== undefined || params.limit !== undefined || params.search || params.status)) {
    return apiClient.get("/api/enroll/list", { token, params });
  }

  const now = Date.now();
  if (!forceRefresh) {
    if (enrollListCache && now - enrollListCache.timestamp < ENROLL_LIST_TTL_MS) {
      return enrollListCache.data;
    }
    if (enrollListInflight) {
      return enrollListInflight;
    }
  }

  const promise = (async () => {
    const res = await apiClient.get("/api/enroll/list", { token });
    enrollListCache = { data: res, timestamp: Date.now() };
    return res;
  })();

  enrollListInflight = promise;
  const cleanup = () => {
    if (enrollListInflight === promise) enrollListInflight = null;
  };
  promise.then(cleanup, cleanup);
  return promise;
}

export async function revokeEnrollApi(token: string, userId: number) {
  clearEnrollCache();
  return apiClient.post(`/api/enroll/revoke/${userId}`, {}, { token });
}
