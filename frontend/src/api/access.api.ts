import { apiClient } from "./client";
import type { AccessSettings, ScheduleItem } from "../types/access";

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

let accessStatusCache: CacheItem<{ isLocked: boolean }> | null = null;
const ACCESS_STATUS_TTL_MS = 15 * 1000;

export function clearAccessStatusCache() {
  accessStatusCache = null;
}

export async function getAccessStatusApi(forceRefresh = false): Promise<{ isLocked: boolean }> {
  const now = Date.now();
  if (
    !forceRefresh &&
    accessStatusCache &&
    now - accessStatusCache.timestamp < ACCESS_STATUS_TTL_MS
  ) {
    return accessStatusCache.data;
  }

  const data = await apiClient.get<{ isLocked: boolean }>("/api/access/status");
  accessStatusCache = { data, timestamp: now };
  return data;
}

export async function getAccessSettingsApi(token: string): Promise<{ status: string; settings: AccessSettings }> {
  return apiClient.get<{ status: string; settings: AccessSettings }>("/api/access/settings", { token });
}

export async function updateAccessSettingsApi(
  token: string,
  settingsData: { isLocked: boolean; isScheduleEnabled: boolean; schedules: ScheduleItem[] },
) {
  clearAccessStatusCache();
  return apiClient.post("/api/access/settings", settingsData, { token });
}
