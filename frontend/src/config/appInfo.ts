export interface AppInfo {
  name: string;
  tagline: string;
  institution: string;
  faculty: string;
  version: string;
  researchTitle: string;
  developers: string[];
  fadeDurationMs: number;
}

export const APP_INFO: AppInfo = {
  name: "SiZat-ESD",
  tagline: "Simulator Zat Berbasis ESD",
  institution: "Universitas Sebelas Maret",
  faculty: "S2 Pendidikan Ilmu Pengetahuan Alam",
  version: "v1.0.0",
  researchTitle:
    "Pengembangan Media SiZat-ESD (Simulator Zat Berbasis ESD) Berbantuan E-Assessment Learning Analytic untuk Meningkatkan Berpikir Sistem dan Hasil Belajar Siswa SMP",
  developers: [
    "Prof. Dr. Sri Yamtinah, S.Pd., M.Pd.",
    "Lina Mahardiani, S.T., M.M., M.Sc., Ph.D.",
    "Syahwa Adila Gepsi, S.Pd.",
  ],
  fadeDurationMs: 400,
};
