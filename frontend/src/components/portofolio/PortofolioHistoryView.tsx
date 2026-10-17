import { FiPaperclip } from "react-icons/fi";
import { LuTrash2, LuClock } from "react-icons/lu";
import type { TaskSubmission } from "./types";
import { API_URL } from "../../utils/constants";

interface PortofolioHistoryViewProps {
  mySubmissions: TaskSubmission[];
  onDeleteSubmission: (id: string, title?: string, studentName?: string) => void;
}

export default function PortofolioHistoryView({
  mySubmissions,
  onDeleteSubmission,
}: PortofolioHistoryViewProps) {
  return (
    <div className="w-full flex-1 flex flex-col gap-3 overflow-y-auto max-h-[72vh] pr-1 custom-scroll pb-4">
      <div className="w-full flex flex-col gap-3">
        <div className="flex justify-between items-center border-b border-[#F5F2FF] pb-2">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#2C2B30]">
            Riwayat Pengumpulan Saya
          </h2>
          <span className="text-[10px] font-bold bg-[#E8E5FF] text-[#635BFF] px-2.5 py-0.5 rounded-full">
            {mySubmissions.length} Tugas
          </span>
        </div>

        {mySubmissions.length === 0 ? (
          <div className="w-full py-12 flex flex-col items-center justify-center gap-2 bg-white border border-dashed border-[#F0EDFF] rounded-3xl shadow-sm text-center px-4">
            <p className="text-xs text-[#9C98A6] italic font-semibold">
              Belum ada tugas yang Anda kumpulkan.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {mySubmissions.map((sub) => (
              <div
                key={sub.id}
                className="w-full p-4.5 bg-white border border-[#F0EDFF] rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-extrabold text-[#2C2B30] tracking-wide leading-tight truncate max-w-55">
                    {sub.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => onDeleteSubmission(sub.id, sub.title, sub.studentName)}
                    className="text-[9px] font-bold uppercase text-[#D95276] hover:text-[#b53a59] cursor-pointer flex items-center gap-1 bg-[#FFEBF0] px-2.5 py-1 rounded-full transition-none active:bg-[#ffd1dd]"
                  >
                    <LuTrash2 size={10} /> Hapus
                  </button>
                </div>

                <p className="text-[11px] text-[#5C5A60] leading-relaxed whitespace-pre-wrap">
                  {sub.answer}
                </p>

                {sub.fileName && sub.fileName !== "Tidak ada berkas terlampir" && (
                  <div className="mt-2 border border-[#F0EDFF] bg-[#FAF9FF] p-2 rounded-2xl flex flex-col gap-1.5">
                    <div className="w-full bg-white border border-[#F0EDFF] rounded-xl flex justify-center items-center overflow-hidden max-h-30">
                      <img
                        src={`${API_URL}/api/tasks/submissions/${sub.id}/image`}
                        alt={sub.title}
                        className="max-h-30 w-auto object-contain cursor-pointer active:opacity-80"
                        onClick={() =>
                          window.open(
                            `${API_URL}/api/tasks/submissions/${sub.id}/image`,
                            "_blank",
                          )
                        }
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                    <span className="text-[9px] text-[#9C98A6] font-semibold truncate text-center flex items-center justify-center gap-1">
                      <FiPaperclip size={10} /> {sub.fileName}
                    </span>
                  </div>
                )}

                <div className="h-px bg-[#F5F2FF] w-full my-1"></div>

                <div className="flex justify-between items-center text-[9px] text-[#9C98A6] font-bold">
                  <span className="truncate max-w-37.5 flex items-center gap-1">
                    <FiPaperclip size={10} /> {sub.fileName}
                  </span>
                  <span className="flex items-center gap-1">
                    <LuClock size={10} /> {sub.submittedAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
