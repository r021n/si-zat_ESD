import { FiX } from "react-icons/fi";
import { LuTrophy } from "react-icons/lu";
import type { AnnouncementItem, RankedStudent } from "../../../types/discussion";

interface AdminLeaderboardModalProps {
  announcement: AnnouncementItem;
  rankedStudents: RankedStudent[];
  loadingRanking: boolean;
  onClose: () => void;
}

export default function AdminLeaderboardModal({
  announcement,
  rankedStudents,
  loadingRanking,
  onClose,
}: AdminLeaderboardModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl bg-white rounded-3xl p-5 md:p-6 border border-[#F0EDFF] shadow-2xl flex flex-col gap-4 max-h-[90vh] animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start gap-3 pb-3 border-b border-[#F0EDFF] shrink-0">
          <div className="flex items-center gap-3 text-[#D97706] min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF9E6] flex items-center justify-center text-xl font-black shrink-0">
              <LuTrophy />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-black text-[#2C2B30] truncate">
                Ranking Siswa Paling Aktif
              </h3>
              <p className="text-[11px] text-[#9C98A6] font-semibold mt-0.5 truncate">
                {announcement.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF9FF] text-[#9C98A6] flex items-center justify-center hover:text-[#2C2B30] cursor-pointer shrink-0"
          >
            <FiX size={17} />
          </button>
        </div>

        {/* Ranking List */}
        <div className="flex-1 min-h-0 max-h-80 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
          {loadingRanking ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <div className="w-7 h-7 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-[#9C98A6] font-bold">Menghitung keaktifan siswa...</p>
            </div>
          ) : rankedStudents.length === 0 ? (
            <div className="py-12 text-center text-xs md:text-sm text-[#9C98A6]">
              Belum ada komentar siswa yang memenuhi kriteria keaktifan (&gt; 4 kata).
            </div>
          ) : (
            rankedStudents.map((item, index) => {
              let badgeColor = "bg-[#F3F4F6] text-[#4B5563]";
              let rankIcon = `#${index + 1}`;
              if (index === 0) {
                badgeColor = "bg-[#FEF3C7] text-[#D97706] font-black border border-[#FDE68A]";
                rankIcon = "🥇 1";
              } else if (index === 1) {
                badgeColor = "bg-[#F1F5F9] text-[#64748B] font-black border border-[#CBD5E1]";
                rankIcon = "🥈 2";
              } else if (index === 2) {
                badgeColor = "bg-[#FFEDD5] text-[#C2410C] font-black border border-[#FED7AA]";
                rankIcon = "🥉 3";
              }

              return (
                <div
                  key={item.userId}
                  className="w-full bg-[#FAF9FF] p-3.5 rounded-2xl border border-[#F0EDFF] flex items-center justify-between gap-3 hover:bg-[#F3EFFF] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={`w-10 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${badgeColor}`}
                    >
                      {rankIcon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-black text-[#2C2B30] truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] md:text-[11px] text-[#9C98A6] font-semibold truncate">
                        Kelas {item.studentClass}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs md:text-sm font-black text-[#8C66FF] shrink-0 whitespace-nowrap">
                    {item.validCommentsCount} argumen
                  </span>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#8C66FF] hover:bg-[#7b55f0] text-white font-extrabold text-xs md:text-sm rounded-2xl transition-colors cursor-pointer shrink-0"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
