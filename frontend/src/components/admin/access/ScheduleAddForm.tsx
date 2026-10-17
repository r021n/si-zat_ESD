import { useState } from "react";
import type { ScheduleItem } from "../../../types/access";
import { DAYS_OF_WEEK } from "../../../utils/constants";

interface ScheduleAddFormProps {
  onAddSchedule: (schedule: ScheduleItem) => void;
  onCancel: () => void;
}

export default function ScheduleAddForm({
  onAddSchedule,
  onCancel,
}: ScheduleAddFormProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("14:00");
  const [ruleType, setRuleType] = useState<"allow" | "block">("allow");
  const [formError, setFormError] = useState("");

  const handleToggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayValue));
    } else {
      setSelectedDays([...selectedDays, dayValue]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (selectedDays.length === 0) {
      setFormError("Pilih minimal satu hari.");
      return;
    }

    if (!startTime || !endTime) {
      setFormError("Jam mulai dan selesai harus diisi.");
      return;
    }

    if (startTime >= endTime) {
      setFormError("Jam mulai harus sebelum jam selesai.");
      return;
    }

    const newSchedule: ScheduleItem = {
      id: `sched-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      days: [...selectedDays].sort(),
      startTime,
      endTime,
      type: ruleType,
    };

    onAddSchedule(newSchedule);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#FAF9FF] border border-[#F0EDFF] rounded-[24px] p-5 flex flex-col gap-4 animate-slide-down"
    >
      <div className="flex justify-between items-center">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#8C66FF]">
          Konfigurasi Aturan Baru
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-bold text-[#D95276] cursor-pointer hover:underline"
        >
          Batal
        </button>
      </div>

      {formError && (
        <p className="text-[10px] text-[#D95276] font-bold">
          {formError}
        </p>
      )}

      {/* Day Selectors */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] md:text-[10px] font-extrabold uppercase text-[#9C98A6]">
          Hari Efektif
        </label>
        <div className="flex flex-wrap gap-2 mt-1">
          {DAYS_OF_WEEK.map((day) => {
            const active = selectedDays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => handleToggleDay(day.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  active
                    ? "bg-[#8C66FF] text-white shadow-md shadow-purple-100"
                    : "bg-white border border-[#F0EDFF] text-[#9C98A6] hover:border-[#8C66FF]/40"
                }`}
                title={day.fullName}
              >
                {day.fullName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Inputs */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="flex flex-col gap-1 text-left">
          <label className="text-[9px] md:text-[10px] font-extrabold uppercase text-[#9C98A6]">
            Jam Mulai
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full bg-white border border-[#F0EDFF] rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-[#8C66FF]"
          />
        </div>
        <div className="flex flex-col gap-1 text-left">
          <label className="text-[9px] md:text-[10px] font-extrabold uppercase text-[#9C98A6]">
            Jam Selesai
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full bg-white border border-[#F0EDFF] rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-[#8C66FF]"
          />
        </div>
      </div>

      {/* Rule Type Option */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] md:text-[10px] font-extrabold uppercase text-[#9C98A6]">
          Tindakan
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRuleType("allow")}
            className={`py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
              ruleType === "allow"
                ? "bg-[#E6F8F6] text-[#2C8578] border border-[#2C8578] shadow-xs"
                : "bg-white border border-[#F0EDFF] text-[#9C98A6]"
            }`}
          >
            Bisa Diakses
          </button>
          <button
            type="button"
            onClick={() => setRuleType("block")}
            className={`py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
              ruleType === "block"
                ? "bg-[#FFEBF0] text-[#D95276] border border-[#D95276] shadow-xs"
                : "bg-white border border-[#F0EDFF] text-[#9C98A6]"
            }`}
          >
            Tidak Bisa Diakses
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full mt-2 py-3 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-xs rounded-xl shadow-md shadow-purple-50 cursor-pointer hover:bg-[#7b55f0] transition-colors"
      >
        Tambahkan Jadwal
      </button>
    </form>
  );
}
