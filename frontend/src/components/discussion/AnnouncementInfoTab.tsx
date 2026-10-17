import { FiCheckCircle } from "react-icons/fi";
import { LuPin, LuCircleHelp, LuLightbulb, LuClipboardList, LuUpload } from "react-icons/lu";
import type { AnnouncementItem } from "../../types/discussion";
import { API_URL, PLACEHOLDER_IMAGE_URL } from "../../utils/constants";

interface AnnouncementInfoTabProps {
  announcement: AnnouncementItem;
  hasSubmission: boolean;
  onOpenRiwayatTab: (openForm?: boolean) => void;
  parseListItems: (text: string) => string[];
}

export default function AnnouncementInfoTab({
  announcement,
  hasSubmission,
  onOpenRiwayatTab,
  parseListItems,
}: AnnouncementInfoTabProps) {
  return (
    <div className="flex-1 overflow-y-auto pr-0.5 space-y-4 no-scrollbar pb-6">
      {/* 1. Cover Illustration Banner */}
      <div className="w-full h-36 rounded-2xl bg-gradient-to-tr from-[#6366F1] via-[#8C66FF] to-[#A78BFA] p-4 flex flex-col justify-end relative overflow-hidden shadow-xs">
        <img
          src={
            announcement.hasImage
              ? `${API_URL}/api/announcements/${announcement.id}/image`
              : PLACEHOLDER_IMAGE_URL
          }
          alt={announcement.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>
      </div>

      {/* 2. Main Content Card */}
      <div className="w-full bg-white rounded-2xl p-5 border border-[#F0EDFF] shadow-xs space-y-5">
        <div className="border-b border-[#F0EDFF] pb-3">
          <h1 className="text-base font-extrabold text-[#2C2B30] leading-snug">
            {announcement.title}
          </h1>
        </div>

        {/* Soal / Permasalahan */}
        {announcement.problem && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#8C66FF]">
              <LuPin size={14} className="shrink-0" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#2C2B30]">
                Soal / Permasalahan
              </h3>
            </div>
            <p className="text-xs text-[#524F5D] font-medium leading-relaxed whitespace-pre-line pl-0.5">
              {announcement.problem}
            </p>
          </div>
        )}

        {/* Pertanyaan */}
        {announcement.question && (
          <div className="space-y-2 pt-2 border-t border-[#F8F7FC]">
            <div className="flex items-center gap-1.5 text-[#3B82F6]">
              <LuCircleHelp size={14} className="shrink-0" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#2C2B30]">
                Pertanyaan
              </h3>
            </div>
            <ol className="space-y-2 pl-0.5">
              {parseListItems(announcement.question).map((qItem, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-[#2C2B30] leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-[#EDE9FE] text-[#8C66FF] font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5 border border-[#DDD6FE]/60">
                    {idx + 1}
                  </span>
                  <span className="flex-1 font-semibold">{qItem}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Petunjuk Pengerjaan */}
        {announcement.instruction && (
          <div className="space-y-2 pt-2 border-t border-[#F8F7FC]">
            <div className="flex items-center gap-1.5 text-[#F59E0B]">
              <LuLightbulb size={14} className="shrink-0" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#2C2B30]">
                Petunjuk Pengerjaan
              </h3>
            </div>
            <ul className="space-y-1.5 pl-0.5">
              {parseListItems(announcement.instruction).map((instItem, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-[#524F5D] leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8C66FF] shrink-0 mt-2"></span>
                  <span className="flex-1 font-medium">{instItem}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Catatan Tambahan */}
        {announcement.taskInfo && (
          <div className="pt-2 border-t border-[#F8F7FC]">
            <div className="p-3 bg-[#FFF8F8] rounded-xl border border-[#FFE4E6] space-y-1">
              <div className="flex items-center gap-1.5 text-[#E11D48]">
                <LuClipboardList size={14} className="shrink-0" />
                <h4 className="text-[11px] font-black uppercase tracking-wider text-[#E11D48]">
                  Catatan Tambahan
                </h4>
              </div>
              <p className="text-xs text-[#524F5D] font-medium leading-relaxed whitespace-pre-line pl-0.5">
                {announcement.taskInfo}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action CTA Button */}
      <div className="pt-2">
        {hasSubmission ? (
          <button
            onClick={() => onOpenRiwayatTab(false)}
            className="w-full py-3.5 bg-[#ECFDF5] border border-[#10B981]/30 text-[#065F46] font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
          >
            <FiCheckCircle size={16} className="text-[#10B981]" />
            <span>Lihat Riwayat & Nilai Tugas Anda</span>
          </button>
        ) : (
          <button
            onClick={() => onOpenRiwayatTab(true)}
            className="w-full py-3.5 bg-gradient-to-r from-[#8C66FF] to-[#6366F1] text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-purple-200 active:scale-[0.99] transition-all cursor-pointer"
          >
            <LuUpload size={16} />
            <span>Kumpulkan Jawaban Tugas Sekarang</span>
          </button>
        )}
      </div>
    </div>
  );
}
