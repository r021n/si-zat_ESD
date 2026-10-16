export interface ScheduleItem {
  id: string;
  days: number[]; // 0 = Minggu, 1 = Senin, ... 6 = Sabtu
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  type: "allow" | "block";
}

export interface AccessSettings {
  isLocked: boolean;
  isScheduleEnabled: boolean;
  schedules: ScheduleItem[];
}
