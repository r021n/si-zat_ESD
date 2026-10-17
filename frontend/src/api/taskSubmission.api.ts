import { apiClient } from "./client";
import type { ContributorData } from "../types/discussion";

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
