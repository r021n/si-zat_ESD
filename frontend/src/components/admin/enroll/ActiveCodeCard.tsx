import { LuKeyRound, LuCopy, LuClock, LuCircleCheck } from "react-icons/lu";
import { formatDateIndo } from "../../../utils/date";

interface ActiveCodeCardProps {
  currentCode: string;
  currentDeadline: string;
  isExpired: boolean;
  enrolledCount: number;
  totalStudents: number;
  onCopyCode: () => void;
}

export default function ActiveCodeCard({
  currentCode,
  currentDeadline,
  isExpired,
  enrolledCount,
  totalStudents,
  onCopyCode,
}: ActiveCodeCardProps) {
  const formatDeadline = (deadline: string) => formatDateIndo(deadline, true);

  return (
    <div className="w-full bg-white rounded-[28px] p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 md:w-11 md:h-11 bg-[#E6F8F6] text-[#2C8578] rounded-xl flex items-center justify-center shadow-inner">
          <LuKeyRound size={20} />
        </div>
        <div>
          <h3 className="text-sm md:text-base font-extrabold text-[#2C2B30] tracking-wide">
            Kode Aktif
          </h3>
          <p className="text-[9px] md:text-xs text-[#9C98A6] font-medium mt-0.5">
            Kode yang digunakan siswa untuk enroll
          </p>
        </div>
      </div>

      {currentCode ? (
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center gap-2 bg-[#FAF9FF] border border-[#F0EDFF] rounded-2xl p-4">
            <span className="text-xl md:text-2xl font-black text-[#8C66FF] tracking-[0.3em] flex-1 text-center font-mono">
              {currentCode}
            </span>
            <button
              onClick={onCopyCode}
              className="w-10 h-10 bg-[#F0ECFF] text-[#8C66FF] rounded-xl flex items-center justify-center cursor-pointer hover:bg-[#8C66FF] hover:text-white transition-colors shadow-xs"
              title="Salin Kode"
            >
              <LuCopy size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] md:text-xs">
            <LuClock size={14} className="text-[#9C98A6] shrink-0" />
            <span
              className={`font-bold ${
                isExpired ? "text-[#D95276]" : "text-[#9C98A6]"
              }`}
            >
              {isExpired ? "Kedaluwarsa" : "Berlaku hingga:"}{" "}
              {formatDeadline(currentDeadline)}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] md:text-xs font-bold text-[#9C98A6]">
              <span className="flex items-center gap-1.5">
                <LuCircleCheck size={14} className="text-[#2C8578]" />
                Progres Siswa
              </span>
              <span>
                {enrolledCount} / {totalStudents} (
                {totalStudents > 0
                  ? Math.round((enrolledCount / totalStudents) * 100)
                  : 0}
                %)
              </span>
            </div>
            <div className="w-full h-2 bg-[#FAF9FF] border border-[#F0EDFF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2C8578] rounded-full transition-all"
                style={{
                  width: `${
                    totalStudents > 0
                      ? (enrolledCount / totalStudents) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFF9E6]/50 border border-[#FFF9E6] text-[#FFC107] text-xs font-bold py-4 px-4 rounded-xl text-center">
          Belum ada kode enroll yang dibuat.
        </div>
      )}
    </div>
  );
}
