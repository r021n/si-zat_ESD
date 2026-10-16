export function formatDurationMMSS(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export function formatDurationFriendly(
  seconds: number | undefined | null,
): string {
  if (seconds === undefined || seconds === null) return "-";
  if (seconds < 60) return `${seconds} detik`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins} menit`;
  return `${mins} menit ${secs} detik`;
}

export function formatAbbreviatedTime(seconds?: number): string {
  if (!seconds || seconds <= 0) return "0 detik";
  if (seconds < 60) return `${seconds} detik`;
  if (seconds < 3600) {
    const minutes = seconds / 60;
    const formatted = minutes.toFixed(1).replace(".", ",");
    return `${formatted.endsWith(",0") ? Math.round(minutes) : formatted} menit`;
  }
  const hours = seconds / 3600;
  const formatted = hours.toFixed(1).replace(".", ",");
  return `${formatted.endsWith(",0") ? Math.round(hours) : formatted} jam`;
}
