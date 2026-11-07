export interface AppTopic {
  title: string;
  icon: string;
  theme: "cyan" | "sky" | "emerald" | "purple";
}

export interface AppInfo {
  name: string;
  badge: string;
  tagline: string;
  description: string;
  topics: AppTopic[];
  institution: string;
  faculty: string;
  version: string;
  minSplashDurationMs: number;
  fadeDurationMs: number;
}

export const APP_INFO: AppInfo = {
  name: "SiZat-ESD",
  badge: "Education for Sustainable Development",
  tagline: "Pencemaran Zat & Berpikir Sistem",
  description:
    "Media pembelajaran interaktif berbasis ESD untuk melatih kemampuan berpikir sistem dalam menganalisis dan memecahkan permasalahan pencemaran lingkungan.",
  topics: [
    { title: "Pencemaran Air", icon: "💧", theme: "cyan" },
    { title: "Pencemaran Udara", icon: "💨", theme: "sky" },
    { title: "Pencemaran Tanah", icon: "🌱", theme: "emerald" },
    { title: "Berpikir Sistem", icon: "🔄", theme: "purple" },
  ],
  institution: "Universitas Sebelas Maret",
  faculty: "S2 Pendidikan IPA",
  version: "v1.0.0",
  minSplashDurationMs: 2200,
  fadeDurationMs: 400,
};

/**
 * Calculates remaining splash screen display time ensuring minimum duration is respected.
 *
 * @param startTime Timestamp in milliseconds when the splash screen was mounted
 * @param currentTime Timestamp in milliseconds when readiness was achieved
 * @param minDuration Target minimum duration in milliseconds
 * @returns Non-negative milliseconds to wait
 */
export function calculateRemainingSplashTime(
  startTime: number,
  currentTime: number,
  minDuration: number = APP_INFO.minSplashDurationMs,
): number {
  if (isNaN(startTime) || isNaN(currentTime) || isNaN(minDuration)) {
    return 0;
  }
  const elapsed = Math.max(0, currentTime - startTime);
  return Math.max(0, minDuration - elapsed);
}
