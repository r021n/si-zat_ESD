import { LuUpload, LuClock, LuUser, LuTrash2, LuImage, LuAward } from "react-icons/lu";
import type { TaskSubmission } from "./types";

interface PortofolioSubmissionsListProps {
  submissions: TaskSubmission[];
  loadingSubmissions: boolean;
  mySubmissionsCount: number;
  isAdmin: boolean;
  onSelectSubmission: (sub: TaskSubmission) => void;
  onGoToUpload: () => void;
  onGoToHistory: () => void;
  onDeleteSubmission: (id: string, title?: string, studentName?: string) => void;
  onShowTaskContributors: (id: string, title: string) => void;
}

export default function PortofolioSubmissionsList({
  submissions,
  loadingSubmissions,
  mySubmissionsCount,
  isAdmin,
  onSelectSubmission,
  onGoToUpload,
  onGoToHistory,
  onDeleteSubmission,
  onShowTaskContributors,
}: PortofolioSubmissionsListProps) {
  return (
    <div className="w-full flex-1 flex flex-col gap-3">
      {/* Quick Action Navigation Grid */}
      <div className="w-full flex gap-3 mb-2">
        <button
          onClick={onGoToUpload}
          className="flex-1 bg-white rounded-[20px] p-4 flex flex-col items-center justify-center shadow-sm border border-[#F0EDFF] cursor-pointer transition-none text-center active:bg-neutral-50"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#E6F8F6] text-[#2C8578] mb-2 shadow-inner">
            <LuUpload className="text-lg" />
          </div>
          <span className="text-xs font-bold text-[#2C2B30]">Unggah Tugas</span>
          <span className="text-[9px] text-[#9C98A6] mt-0.5">Kirim analisis baru</span>
        </button>

        <button
          onClick={onGoToHistory}
          className="flex-1 bg-white rounded-[20px] p-4 flex flex-col items-center justify-center shadow-sm border border-[#F0EDFF] cursor-pointer transition-none text-center active:bg-neutral-50"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FFEBF0] text-[#D95276] mb-2 shadow-inner">
            <LuClock className="text-lg" />
          </div>
          <span className="text-xs font-bold text-[#2C2B30]">Tugas Saya</span>
          <span className="text-[9px] text-[#9C98A6] mt-0.5">
            Riwayat & hapus ({mySubmissionsCount})
          </span>
        </button>
      </div>

      {/* Submissions list */}
      <div className="w-full flex-1 flex flex-col gap-3 overflow-y-auto max-h-[58vh] pr-1 custom-scroll">
        <p className="text-[10px] text-[#9C98A6] font-semibold leading-relaxed bg-[#F5F2FF] border border-[#E9E4FF] p-3 rounded-2xl">
          💡 Pilih salah satu tugas di bawah ini untuk membuka forum obrolan dan mendiskusikan
          hasil analisis keterampilan berpikir sistem mereka.
        </p>

        {loadingSubmissions ? (
          <div className="w-full py-12 flex flex-col items-center justify-center gap-2 bg-white border border-dashed border-[#F0EDFF] rounded-3xl shadow-sm">
            <div className="w-6 h-6 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold text-[#9C98A6] uppercase tracking-wider">
              Memuat daftar tugas...
            </p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="w-full py-12 flex flex-col items-center justify-center gap-2 bg-white border border-dashed border-[#F0EDFF] rounded-3xl shadow-sm text-center px-4">
            <p className="text-xs text-[#9C98A6] italic font-semibold">
              Belum ada tugas yang dikumpulkan untuk didiskusikan.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {submissions.map((sub) => {
              const hasImage = sub.fileName && sub.fileName !== "Tidak ada berkas terlampir";
              return (
                <div
                  key={sub.id}
                  onClick={() => onSelectSubmission(sub)}
                  className="w-full p-4.5 bg-white rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] border border-[#F0EDFF] cursor-pointer active:bg-neutral-50 transition-none flex flex-col gap-2 relative"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase bg-[#E8E5FF] text-[#635BFF] px-2.5 py-0.5 rounded-full">
                      Kelas {sub.studentClass}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-[#9C98A6] font-semibold">
                        {sub.submittedAt.split(",")[0]}
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          title="Hapus Submission (Khusus Admin)"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSubmission(sub.id, sub.title, sub.studentName);
                          }}
                          className="w-6.5 h-6.5 rounded-lg bg-[#FFF0F3] hover:bg-[#FFE0E6] text-[#D95276] border border-[#FFD0DC] flex items-center justify-center transition-colors cursor-pointer active:scale-90 shrink-0"
                        >
                          <LuTrash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xs font-extrabold text-[#2C2B30] tracking-wide leading-snug">
                    {sub.title}
                  </h3>

                  <p className="text-[11px] text-[#5C5A60] leading-relaxed line-clamp-2">
                    {sub.answer}
                  </p>

                  <div className="h-px bg-[#F5F2FF] w-full my-1"></div>

                  <div className="flex justify-between items-center text-[10px] text-[#9C98A6] font-bold">
                    <span className="text-[#2C2B30] flex items-center gap-1">
                      <LuUser size={12} className="text-[#8C66FF]" /> {sub.studentName}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        title="Statistik Kontributor Komentar"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowTaskContributors(sub.id, sub.title);
                        }}
                        className="text-[#8C66FF] hover:bg-[#F5F3FF] p-1 rounded-md transition-colors flex items-center justify-center border border-[#E9E4FF] cursor-pointer"
                      >
                        <LuAward size={13} />
                      </button>
                      {hasImage && (
                        <span className="text-[#2C8578] flex items-center gap-1 bg-[#E6F8F6] px-2 py-0.5 rounded-md text-[9px]">
                          <LuImage size={11} /> Lampiran
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
