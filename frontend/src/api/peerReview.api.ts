import { apiClient } from "./client";
import type {
  PeerSubmissionsResponse,
  PeerCommentItem,
} from "../types/discussion";

// --- Peer Review APIs ---

export async function getPeerSubmissionsApi(
  token: string,
  announcementId: string,
): Promise<PeerSubmissionsResponse> {
  const res = await apiClient.get<{ status: string; data: PeerSubmissionsResponse }>(
    `/api/announcements/${announcementId}/peer-submissions`,
    { token },
  );
  return res.data;
}

export async function getPeerCommentsApi(
  token: string,
  submissionId: string,
): Promise<PeerCommentItem[]> {
  const res = await apiClient.get<{ status: string; data: PeerCommentItem[] }>(
    `/api/announcements/submissions/${submissionId}/peer-comments`,
    { token },
  );
  return res.data;
}

export async function sendPeerCommentApi(
  token: string,
  submissionId: string,
  content: string,
): Promise<{ comment: PeerCommentItem; myReviewedCount: number; isRequirementMet: boolean }> {
  const res = await apiClient.post<{
    status: string;
    message: string;
    data: {
      comment: PeerCommentItem;
      myReviewedCount: number;
      isRequirementMet: boolean;
    };
  }>(
    `/api/announcements/submissions/${submissionId}/peer-comments`,
    { content },
    { token },
  );
  return res.data;
}

export async function deletePeerCommentApi(token: string, commentId: string) {
  return apiClient.delete(
    `/api/announcements/submissions/peer-comments/${commentId}`,
    { token },
  );
}
