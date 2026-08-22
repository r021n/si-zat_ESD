import { create } from "zustand";
import {
  loginApi,
  registerApi,
  getMeApi,
  updateProfileApi,
  loginWithGoogleApi,
  getEnrollStatusApi,
} from "../api/api";

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

interface AuthState {
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  initialized: false,
  error: null,
  isEnrolled: null,
  enrollDeadline: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await loginApi(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      // Check enrollment after login
      setTimeout(() => get().checkEnrollment(), 0);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  register: async (email, kelas, password) => {
    set({ loading: true, error: null });
    try {
      const data = await registerApi(email, kelas, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      // New users are not enrolled
      set({ isEnrolled: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  loginWithGoogle: async (idToken, kelas) => {
    set({ loading: true, error: null });
    try {
      const data = await loginWithGoogleApi(idToken, kelas);
      if (data.registered && data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        set({ user: data.user, token: data.token, loading: false });
      } else {
        set({ loading: false });
      }
      return data;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({
      user: null,
      token: null,
      error: null,
      isEnrolled: null,
      enrollDeadline: null,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token");
    const cachedUserStr = localStorage.getItem("user");
    let cachedUser = null;

    if (cachedUserStr) {
      try {
        cachedUser = JSON.parse(cachedUserStr);
      } catch (_e) {
        // ignore
      }
    }

    if (!token) {
      set({ initialized: true });
      return;
    }

    // Optimistically set user from cache so the interface loads immediately
    if (cachedUser) {
      set({ user: cachedUser, token });
    }

    try {
      const data = await getMeApi(token);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token, initialized: true });
      // Check enrollment after successful auth
      get().checkEnrollment();
    } catch (err: any) {
      // Check if it's a network/offline error
      const isNetworkError =
        err instanceof TypeError ||
        (err.message &&
          (err.message.includes("Failed to fetch") ||
            err.message.includes("network") ||
            err.message.includes("NetworkError") ||
            err.message.includes("Load failed")));

      if (!isNetworkError) {
        // Clear token and user ONLY if the token is invalid or expired
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ user: null, token: null, initialized: true });
      } else {
        // If it's a network error, keep using the cached user data but finish loading
        set({ initialized: true });
      }
    }
  },

  updateProfile: async (kelas, nama) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Tidak terautentikasi");

    set({ loading: true, error: null });
    try {
      const data = await updateProfileApi(token, { kelas, nama });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  checkEnrollment: async () => {
    const { token, user } = get();
    if (!token || !user) {
      set({ isEnrolled: null, enrollDeadline: null });
      return;
    }

    const isAdmin =
      user.status.toLowerCase() === "admin" ||
      user.email.toLowerCase().includes("admin");
    if (isAdmin) {
      set({ isEnrolled: true, enrollDeadline: null });
      return;
    }

    try {
      const data = await getEnrollStatusApi(token);
      set({ isEnrolled: data.isEnrolled, enrollDeadline: data.deadline });
    } catch {
      set({ isEnrolled: false, enrollDeadline: null });
    }
  },

  setEnrolled: (deadline: string) => {
    set({ isEnrolled: true, enrollDeadline: deadline });
  },
}));
