export interface Message {
  id: string;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

export interface TaskSubmission {
  id: string;
  userId: number;
  studentName: string;
  studentClass: string;
  title: string;
  answer: string;
  fileName: string;
  submittedAt: string;
}
