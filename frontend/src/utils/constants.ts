export const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:8787";

export const PLACEHOLDER_IMAGE_URL =
  "https://placehold.co/800x400/e8e8e8/9C98A6?text=Tidak%20Ada%20Gambar";

export const DAYS_OF_WEEK = [
  { value: 1, label: "S", fullName: "Senin" },
  { value: 2, label: "S", fullName: "Selasa" },
  { value: 3, label: "R", fullName: "Rabu" },
  { value: 4, label: "K", fullName: "Kamis" },
  { value: 5, label: "J", fullName: "Jumat" },
  { value: 6, label: "S", fullName: "Sabtu" },
  { value: 0, label: "M", fullName: "Minggu" },
] as const;
