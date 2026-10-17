import { DAYS_OF_WEEK } from "../../../utils/constants";

export const formatDays = (days: number[]): string => {
  if (days.length === 7) return "Setiap Hari";
  if (
    days.length === 5 &&
    [1, 2, 3, 4, 5].every((val) => days.includes(val))
  ) {
    return "Senin - Jumat";
  }
  if (days.length === 2 && [0, 6].every((val) => days.includes(val))) {
    return "Sabtu & Minggu";
  }

  return days
    .map((d) => DAYS_OF_WEEK.find((item) => item.value === d)?.fullName)
    .filter(Boolean)
    .join(", ");
};
