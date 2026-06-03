import { create } from "zustand";
import { loginApi, registerApi, getMeApi, updateProfileApi } from "../api/api";

export interface User {
  id: number;
  email: string;
  kelas: string;
  nama: string;
  status: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, kelas: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (kelas: string, nama: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  initialized: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await loginApi(email, password);
      localStorage.setItem("token", data.token);
      set({ user: data.user, token: data.token, loading: false });
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
      set({ user: data.user, token: data.token, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, error: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ initialized: true });
      return;
    }

    try {
      const data = await getMeApi(token);
      set({ user: data.user, token, initialized: true });
    } catch (err) {
      // Clear token if invalid or expired
      localStorage.removeItem("token");
      set({ user: null, token: null, initialized: true });
    }
  },

  updateProfile: async (kelas, nama) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Tidak terautentikasi");

    set({ loading: true, error: null });
    try {
      const data = await updateProfileApi(token, { kelas, nama });
      localStorage.setItem("token", data.token);
      set({ user: data.user, token: data.token, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
