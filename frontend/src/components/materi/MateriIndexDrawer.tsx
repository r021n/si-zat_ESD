import {
  FiLock as LockIcon,
  FiCheckCircle as CheckCircleIcon,
  FiRotateCcw as RotateCcwIcon,
} from "react-icons/fi";
import type { MateriIndexDrawerProps } from "./types";

export default function MateriIndexDrawer({
  show,
  onClose,
  maxUnlockedIndex,
  currentPage,
  slides,
  onJumpToPage,
  onResetProgress,
}: MateriIndexDrawerProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-end sm:items-center z-50 p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-107.5 bg-white rounded-t-4xl sm:rounded-4xl p-6 shadow-2xl border border-[#F0EDFF] flex flex-col max-h-[85vh] text-left">
        <div className="flex justify-between items-center pb-3 border-b border-[#F0EDFF]">
          <div>
            <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide uppercase">
              Daftar Halaman Materi
            </h3>
            <p className="text-[10px] text-[#9C98A6] font-semibold mt-0.5">
              Pilih halaman (Terbuka hingga hal. {maxUnlockedIndex + 1})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF9FF] text-[#9C98A6] font-bold text-sm flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto my-4 pr-1 grid grid-cols-4 gap-2.5 no-scrollbar">
          {slides.map((slide, idx) => {
            const isUnlocked = idx <= maxUnlockedIndex;
            const isCurrent = idx === currentPage;

            return (
              <button
                key={slide.id}
                onClick={() => onJumpToPage(idx)}
                disabled={!isUnlocked}
                className={`aspect-square rounded-2xl border flex flex-col items-center justify-center p-1.5 relative transition-all ${
                  isCurrent
                    ? "bg-[#8C66FF] border-[#8C66FF] text-white shadow-md shadow-purple-200 scale-105"
                    : isUnlocked
                    ? "bg-[#FAF9FF] border-[#F0EDFF] text-[#2C2B30] hover:bg-purple-50 cursor-pointer"
                    : "bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed opacity-60"
                }`}
              >
                <span className="text-xs font-black">{idx + 1}</span>
                <span className="text-[8px] font-bold uppercase mt-0.5">
                  {slide.type === "video" ? "Vid" : "Img"}
                </span>

                <div className="absolute top-1 right-1">
                  {isUnlocked ? (
                    !isCurrent && (
                      <CheckCircleIcon
                        size={10}
                        className="text-[#8C66FF]"
                      />
                    )
                  ) : (
                    <LockIcon size={10} className="text-neutral-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-[#F0EDFF] flex gap-2">
          <button
            onClick={onResetProgress}
            className="flex-1 py-3 bg-[#FFEBF0] text-[#D95276] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-sm cursor-pointer flex items-center justify-center gap-1 hover:bg-red-100"
          >
            <RotateCcwIcon size={12} /> Reset Progres
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer flex items-center justify-center"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
