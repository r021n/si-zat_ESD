export interface AnnouncementItem {
  id: string;
  title: string;
  problem: string;
  question: string;
  taskInfo: string;
  instruction: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
  hasImage?: boolean;
  discussionsCount?: number;
  submissionsCount?: number;
  mySubmission?: SubmissionItem | null;
}

export interface DiscussionMessage {
  id: string;
  announcementId: string;
  submissionId?: string;
  userId: number;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
  studentClass?: string;
}

export interface SubmissionItem {
  id: string;
  announcementId: string;
  userId: number;
  studentName: string;
  studentClass: string;
  answer: string;
  fileName: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
  hasImage?: boolean;
}

export interface RankedStudent {
  userId: number;
  name: string;
  studentClass: string;
  validCommentsCount: number;
  totalCommentsCount: number;
}

export interface ContributorData {
  name: string;
  detail?: string;
  count: number;
}

export interface PeerSubmissionItem {
  id: string;
  announcementId: string;
  userId: number;
  studentName: string;
  studentClass: string;
  answer: string;
  fileName: string;
  submittedAt: string;
  hasImage?: boolean;
  commentsCount: number;
  hasReviewed: boolean;
}

export interface PeerSubmissionsResponse {
  hasSubmittedOwn: boolean;
  canView: boolean;
  myReviewedCount: number;
  targetReviewedCount: number;
  isRequirementMet: boolean;
  submissions: PeerSubmissionItem[];
}

export interface PeerCommentItem {
  id: string;
  submissionId: string;
  announcementId: string;
  userId: number;
  userName: string;
  userRole: string;
  userClass: string;
  content: string;
  createdAt: string;
}

