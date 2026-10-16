export interface User {
  id: number;
  email: string;
  kelas: string;
  nama: string;
  status: string;
  createdAt?: string;
  openCount?: number;
  totalUsageTime?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  isEnrolled: boolean | null;
  enrollDeadline: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, kelas: string, password: string) => Promise<void>;
  loginWithGoogle: (
    idToken: string,
    kelas?: string,
  ) => Promise<{ registered: boolean; email?: string; nama?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (kelas: string, nama: string) => Promise<void>;
  checkEnrollment: () => Promise<void>;
  setEnrolled: (deadline: string) => void;
}
