import {
  FiCheck as CheckIcon,
  FiX as XIcon,
  FiSend as SendIcon,
  FiRotateCcw as RotateCcwIcon,
} from "react-icons/fi";
import { PUZZLE_ITEMS } from "./constants";

interface Page7DockProps {
  assignedItemIds: string[];
  selectedLeftId: string | null;
  unassignedItemsCount: number;
  allAssigned: boolean;
  isSubmitted: boolean;
  isAllCorrect: boolean;
  onSelectLeft: (id: string | null) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export default function Page7Dock({
  assignedItemIds,
  selectedLeftId,
  unassignedItemsCount,
  allAssigned,
  isSubmitted,
  isAllCorrect,
  onSelectLeft,
  onSubmit,
  onReset,
}: Page7DockProps) {
  return (
    <div
      className="absolute flex flex-col justify-between z-10"
      style={{
        top: "60%",
        left: "9%",
        width: "82%",
        height: "17%",
      }}
    >
      {/* Piece Selector Dock */}
      <div className="bg-white/95 backdrop-blur-xs border border-purple-100 rounded-xl p-1.5 sm:p-2 shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[9px] sm:text-[10px] font-bold text-[#8C66FF]">
            Pilihan Partikel:
          </p>
          <p className="text-[7.5px] sm:text-[8.5px] text-[#9C98A6] italic">
            {isSubmitted
              ? "Lihat hasil penilaian di atas"
              : unassignedItemsCount > 0
              ? "Ketuk pilihan lalu pasangkan"
              : "Semua terpasang ✓"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-1 sm:gap-1.5 items-center">
          {PUZZLE_ITEMS.map((item) => {
            const isAssigned = assignedItemIds.includes(item.id);
            const isSelected = selectedLeftId === item.id;

            if (isAssigned) {
              return (
                <div
                  key={item.id}
                  className="h-8 sm:h-9 md:h-10 rounded-lg border border-dashed border-purple-200 bg-purple-50/50 flex flex-col items-center justify-center opacity-60"
                >
                  <span className="text-[8px] sm:text-[9px] text-purple-500 font-semibold">
                    Terpasang ✓
                  </span>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isSubmitted) return;
                  onSelectLeft(isSelected ? null : item.id);
                }}
                className={`relative bg-[#FEF0F0] border-2 rounded-lg p-0.5 h-8 sm:h-9 md:h-10 flex items-center justify-center cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#8C66FF] ring-2 ring-[#8C66FF]/40 scale-102 shadow-xs"
                    : "border-[#FA8E97] hover:border-[#FF6B81] hover:scale-[1.01] shadow-xs"
                }`}
              >
                <img
                  src={item.image}
                  alt={item.label}
                  className="w-full max-h-full object-contain pointer-events-none"
                />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FEF0F0] border-2 border-l-0 border-[#FA8E97] absolute -right-1.5 top-1/2 -translate-y-1/2 z-20" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Submission & Reset Controls */}
      {!isSubmitted ? (
        <div>
          <button
            type="button"
            disabled={!allAssigned}
            onClick={onSubmit}
            className={`w-full py-1.5 sm:py-2 px-3 rounded-xl font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
              allAssigned
                ? "bg-linear-to-r from-[#8C66FF] to-[#6039DF] text-white cursor-pointer hover:brightness-110 active:scale-98 shadow-purple-200"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            <SendIcon size={12} /> Kirim Jawaban
          </button>
        </div>
      ) : (
        <div
          className={`p-1.5 sm:p-2 rounded-xl border-2 shadow-xs animate-fade-in flex items-center justify-between gap-1.5 ${
            isAllCorrect
              ? "bg-[#E6F4EA] border-[#137333] text-[#137333]"
              : "bg-[#FCE8E6] border-[#C5221F] text-[#C5221F]"
          }`}
        >
          <div className="flex items-center gap-1 pl-0.5">
            {isAllCorrect ? (
              <CheckIcon size={14} className="text-[#137333] shrink-0" />
            ) : (
              <XIcon size={14} className="text-[#C5221F] shrink-0" />
            )}
            <span className="font-bold text-[9.5px] sm:text-[10.5px] leading-tight">
              {isAllCorrect
                ? "Benar semua! 🎉"
                : "Ada yang belum tepat, coba lagi!"}
            </span>
          </div>

          <button
            type="button"
            onClick={onReset}
            className={`px-2.5 py-1 font-extrabold text-[9.5px] sm:text-[10px] rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-xs active:scale-95 shrink-0 ${
              isAllCorrect
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-[#C5221F] text-white hover:bg-red-700"
            }`}
          >
            <RotateCcwIcon size={10} /> Ulangi
          </button>
        </div>
      )}
    </div>
  );
}
