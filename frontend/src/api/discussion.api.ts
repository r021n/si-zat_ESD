import { apiClient } from "./client";
import type {
  AnnouncementItem,
  DiscussionMessage,
  SubmissionItem,
  ContributorData,
} from "../types/discussion";

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

let announcementsCache: CacheItem<any> | null = null;
const announcementDetailCache = new Map<string, CacheItem<any>>();
const announcementDiscussionsCache = new Map<string, CacheItem<any>>();
const announcementSubmissionsCache = new Map<string, CacheItem<any>>();

let announcementsInflight: Promise<any> | null = null;
const announcementDetailInflight = new Map<string, Promise<any>>();
const announcementDiscussionsInflight = new Map<string, Promise<any>>();
const announcementSubmissionsInflight = new Map<string, Promise<any>>();

const ANNOUNCEMENT_TTL_MS = 60 * 1000;
const DISCUSSION_TTL_MS = 8 * 1000;
const SUBMISSION_TTL_MS = 30 * 1000;

export function clearAnnouncementsCache() {
  announcementsCache = null;
  announcementDetailCache.clear();
  announcementDiscussionsCache.clear();
  announcementSubmissionsCache.clear();
}

export async function getAnnouncementsApi(token: string, forceRefresh = false): Promise<AnnouncementItem[]> {
  const now = Date.now();
  if (!forceRefresh) {
    if (announcementsCache && now - announcementsCache.timestamp < ANNOUNCEMENT_TTL_MS) {
      return announcementsCache.data;
    }
    if (announcementsInflight) {
      return announcementsInflight;
    }
  }

  const promise = (async () => {
    const res = await apiClient.get<{ data: AnnouncementItem[] }>("/api/announcements", { token });
    announcementsCache = { data: res.data, timestamp: Date.now() };
    return res.data;
  })();

  announcementsInflight = promise;
  const cleanup = () => {
    if (announcementsInflight === promise) {
      announcementsInflight = null;
    }
  };
  promise.then(cleanup, cleanup);
  return promise;
}

export async function getAnnouncementDetailApi(token: string, id: string, forceRefresh = false): Promise<AnnouncementItem> {
  const now = Date.now();
  if (!forceRefresh) {
    const cached = announcementDetailCache.get(id);
    if (cached && now - cached.timestamp < ANNOUNCEMENT_TTL_MS) {
      return cached.data;
    }
    const inflight = announcementDetailInflight.get(id);
    if (inflight) {
      return inflight;
    }
  }

  const promise = (async () => {
    const res = await apiClient.get<{ data: AnnouncementItem }>(`/api/announcements/${id}`, { token });
    announcementDetailCache.set(id, { data: res.data, timestamp: Date.now() });
    return res.data;
  })();

  announcementDetailInflight.set(id, promise);
  const cleanup = () => {
    if (announcementDetailInflight.get(id) === promise) {
      announcementDetailInflight.delete(id);
    }
  };
  promise.then(cleanup, cleanup);
  return promise;
}

export async function createAnnouncementApi(
  token: string,
  body: FormData | {
    title: string;
    problem: string;
    question: string;
    taskInfo: string;
    instruction: string;
  },
) {
  clearAnnouncementsCache();
  return apiClient.post("/api/announcements", body, { token });
}

export async function updateAnnouncementApi(
  token: string,
  id: string,
  body: FormData | {
    title: string;
    problem: string;
    question: string;
    taskInfo: string;
    instruction: string;
    removeImage?: boolean;
  },
) {
  clearAnnouncementsCache();
  return apiClient.put(`/api/announcements/${id}`, body, { token });
}

export async function deleteAnnouncementApi(token: string, id: string) {
  clearAnnouncementsCache();
  return apiClient.delete(`/api/announcements/${id}`, { token });
}

export function getAnnouncementDiscussionsApi(
  token: string,
  id: string,
  forceRefresh?: boolean
): Promise<DiscussionMessage[]>;
export function getAnnouncementDiscussionsApi(
  token: string,
  id: string,
  forceRefresh: boolean,
  params: { page?: number; limit?: number }
): Promise<{ status: string; data: DiscussionMessage[]; pagination: any }>;
export async function getAnnouncementDiscussionsApi(
  token: string,
  id: string,
  forceRefresh = false,
  params?: { page?: number; limit?: number }
): Promise<any> {
  if (params && (params.page !== undefined || params.limit !== undefined)) {
    return apiClient.get(`/api/announcements/${id}/discussions`, { token, params });
  }

  const now = Date.now();
  if (!forceRefresh) {
    const cached = announcementDiscussionsCache.get(id);
    if (cached && now - cached.timestamp < DISCUSSION_TTL_MS) {
      return cached.data;
    }
    const inflight = announcementDiscussionsInflight.get(id);
    if (inflight) {
      return inflight;
    }
  }

  const promise = (async () => {
    const res = await apiClient.get<{ data: DiscussionMessage[] }>(
      `/api/announcements/${id}/discussions`,
      { token },
    );
    announcementDiscussionsCache.set(id, { data: res.data, timestamp: Date.now() });
    return res.data;
  })();

  announcementDiscussionsInflight.set(id, promise);
  const cleanup = () => {
    if (announcementDiscussionsInflight.get(id) === promise) {
      announcementDiscussionsInflight.delete(id);
    }
  };
  promise.then(cleanup, cleanup);
  return promise;
}

export async function sendAnnouncementDiscussionApi(token: string, id: string, content: string): Promise<DiscussionMessage> {
  announcementDiscussionsCache.delete(id);
  const res = await apiClient.post<{ data: DiscussionMessage }>(
    `/api/announcements/${id}/discussions`,
    { content },
    { token },
  );
  return res.data;
}

export function getAnnouncementSubmissionsApi(
  token: string,
  id: string,
  forceRefresh?: boolean
): Promise<SubmissionItem[]>;
export function getAnnouncementSubmissionsApi(
  token: string,
  id: string,
  forceRefresh: boolean,
  params: { page?: number; limit?: number; search?: string; status?: string }
): Promise<{ status: string; data: SubmissionItem[]; pagination: any }>;
export async function getAnnouncementSubmissionsApi(
  token: string,
  id: string,
  forceRefresh = false,
  params?: { page?: number; limit?: number; search?: string; status?: string }
): Promise<any> {
  if (params && (params.page !== undefined || params.limit !== undefined || params.search || params.status)) {
    return apiClient.get(`/api/announcements/${id}/submissions`, { token, params });
  }

  const now = Date.now();
  if (!forceRefresh) {
    const cached = announcementSubmissionsCache.get(id);
    if (cached && now - cached.timestamp < SUBMISSION_TTL_MS) {
      return cached.data;
    }
    const inflight = announcementSubmissionsInflight.get(id);
    if (inflight) {
      return inflight;
    }
  }

  const promise = (async () => {
    const res = await apiClient.get<{ data: SubmissionItem[] }>(`/api/announcements/${id}/submissions`, { token });
    announcementSubmissionsCache.set(id, { data: res.data, timestamp: Date.now() });
    return res.data;
  })();

  announcementSubmissionsInflight.set(id, promise);
  const cleanup = () => {
    if (announcementSubmissionsInflight.get(id) === promise) {
      announcementSubmissionsInflight.delete(id);
    }
  };
  promise.then(cleanup, cleanup);
  return promise;
}

export async function submitAnnouncementTaskApi(token: string, id: string, formData: FormData) {
  announcementsCache = null;
  announcementDetailCache.delete(id);
  announcementSubmissionsCache.delete(id);
  return apiClient.post(`/api/announcements/${id}/submissions`, formData, { token });
}

export async function deleteAnnouncementSubmissionApi(token: string, submissionId: string) {
  clearAnnouncementsCache();
  return apiClient.delete(`/api/announcements/submissions/${submissionId}`, { token });
}

export async function gradeAnnouncementSubmissionApi(
  token: string,
  submissionId: string,
  grade: number,
  feedback?: string,
) {
  clearAnnouncementsCache();
  return apiClient.post(
    `/api/announcements/submissions/${submissionId}/grade`,
    { grade, feedback },
    { token },
  );
}

// --- Systems Thinking / Task Submission APIs ---

export async function getTaskSubmissionsApi(token: string) {
  return apiClient.get("/api/tasks/submissions", { token });
}

export async function createTaskSubmissionApi(token: string, formData: FormData) {
  return apiClient.post("/api/tasks/submissions", formData, { token });
}

export async function deleteTaskSubmissionApi(token: string, id: string) {
  return apiClient.delete(`/api/tasks/submissions/${id}`, { token });
}

export async function getTaskDiscussionsApi(token: string, submissionId: string) {
  return apiClient.get(`/api/tasks/submissions/${submissionId}/discussions`, { token });
}

export async function getOverallContributorsApi(token: string): Promise<ContributorData[]> {
  return apiClient.get<ContributorData[]>("/api/tasks/discussions/overall-contributors", { token });
}

export async function sendTaskDiscussionApi(token: string, submissionId: string, content: string) {
  return apiClient.post(
    `/api/tasks/submissions/${submissionId}/discussions`,
    { content },
    { token },
  );
}
