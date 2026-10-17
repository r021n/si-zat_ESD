import { FiTrash2 } from "react-icons/fi";
import { LuClock } from "react-icons/lu";
import type { ScheduleItem } from "../../../types/access";
import { formatDays } from "./accessUtils";

interface ScheduleListProps {
  schedules: ScheduleItem[];
  onDeleteSchedule: (id: string) => void;
}

export default function ScheduleList({
  schedules,
  onDeleteSchedule,
}: ScheduleListProps) {
  if (schedules.length === 0) {
    return (
      <p className="text-xs text-[#9C98A6] font-semibold text-center py-8 bg-[#FAF9FF] border border-dashed border-[#F0EDFF] rounded-2xl leading-relaxed px-4">
        Belum ada aturan jadwal yang dikonfigurasi. Klik "+ Tambah Jadwal" di atas untuk membuat aturan baru.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {schedules.map((item) => (
        <div
          key={item.id}
          className="w-full bg-[#FAF9FF] border border-[#F0EDFF] rounded-2xl p-4 flex justify-between items-center gap-3 hover:border-[#8C66FF]/40 transition-colors"
        >
          <div className="flex flex-col gap-1 truncate">
            <span className="text-xs md:text-sm font-extrabold text-[#2C2B30] truncate">
              {formatDays(item.days)}
            </span>
            <span className="text-[10px] md:text-xs text-[#9C98A6] font-bold flex items-center gap-1.5">
              <LuClock size={13} className="text-[#8C66FF]" />
              {item.startTime} - {item.endTime} WIB
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span
              className={`text-[9px] md:text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${
                item.type === "allow"
                  ? "bg-[#E6F8F6] text-[#2C8578]"
                  : "bg-[#FFEBF0] text-[#D95276]"
              }`}
            >
              {item.type === "allow" ? "Bisa Diakses" : "Terkunci"}
            </span>

            <button
              onClick={() => onDeleteSchedule(item.id)}
              className="w-8 h-8 bg-white text-[#D95276] border border-[#FFEBF0] rounded-xl flex items-center justify-center shadow-xs cursor-pointer hover:bg-[#FFEBF0] transition-colors"
              title="Hapus Aturan"
            >
              <FiTrash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
