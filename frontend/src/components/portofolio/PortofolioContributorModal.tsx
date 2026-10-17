import { LuAward } from "react-icons/lu";
import type { ContributorData } from "../../types/discussion";

interface PortofolioContributorModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "overall" | "task";
  taskTitle: string;
  loading: boolean;
  error: string | null;
  contributors: ContributorData[];
}

export default function PortofolioContributorModal({
  isOpen,
  onClose,
  type,
  taskTitle,
  loading,
  error,
  contributors,
}: PortofolioContributorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-6 backdrop-blur-xs">
      <div className="w-full max-w-85 bg-white rounded-[28px] p-6 shadow-xl border border-[#F0EDFF] flex flex-col gap-4 animate-none select-none text-left">
        <div>
          <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide uppercase flex items-center gap-2">
            <LuAward className="text-[#8C66FF]" />
            Kontributor Terbanyak
          </h3>
          <p className="text-[10px] text-[#9C98A6] font-semibold mt-1 line-clamp-2">
            {type === "overall"
              ? "Berdasarkan keseluruhan topik diskusi"
              : `Tugas: "${taskTitle}"`}
          </p>
        </div>

        <div className="max-h-55 overflow-y-auto pr-1 flex flex-col gap-2.5 my-1 no-scrollbar">
          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-6 h-6 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] text-[#9C98A6] font-bold uppercase tracking-widest animate-pulse">
                Memuat Kontributor...
              </p>
            </div>
          ) : error ? (
            <p className="text-xs text-[#FF5E8C] font-semibold text-center py-4">
              {error}
            </p>
          ) : contributors.length === 0 ? (
            <p className="text-xs text-[#9C98A6] font-semibold text-center py-6">
              Belum ada kontribusi yang tercatat.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {contributors.map((item, index) => (
                <div
                  key={index}
                  className="w-full bg-[#FAF9FF] border border-[#F0EDFF]/70 rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <span className="text-[10px] font-black text-[#9C98A6] w-4 shrink-0">
                      {index + 1}.
                    </span>
                    <div className="flex flex-col truncate min-w-0">
                      <span className="text-xs font-bold text-[#2C2B30] truncate">
                        {item.name}
                      </span>
                      {item.detail && (
                        <span className="text-[9px] text-[#9C98A6] font-semibold mt-0.5">
                          {item.detail}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#8C66FF] bg-[#F0ECFF] px-2.5 py-1 rounded-full shrink-0">
                    {item.count}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2.5 mt-1">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
