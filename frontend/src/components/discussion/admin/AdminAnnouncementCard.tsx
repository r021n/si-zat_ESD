import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { LuAward, LuTrophy } from "react-icons/lu";
import type { AnnouncementItem } from "../../../types/discussion";
import { API_URL, PLACEHOLDER_IMAGE_URL } from "../../../utils/constants";

interface AdminAnnouncementCardProps {
  ann: AnnouncementItem;
  onEdit: (ann: AnnouncementItem) => void;
  onDelete: (id: string, title: string) => void;
  onOpenSubmissions: (ann: AnnouncementItem) => void;
  onOpenRanking: (ann: AnnouncementItem) => void;
  onZoomImage: (url: string) => void;
}

export default function AdminAnnouncementCard({
  ann,
  onEdit,
  onDelete,
  onOpenSubmissions,
  onOpenRanking,
  onZoomImage,
}: AdminAnnouncementCardProps) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(140,102,255,0.05)] hover:border-[#8C66FF]/50 hover:shadow-[0_8px_24px_rgba(140,102,255,0.1)] transition-all duration-200 flex flex-col justify-between gap-4 group">
      <div className="flex flex-col gap-3">
        {/* Top Row: Title, Actions */}
        <div className="flex justify-between items-start gap-2 min-w-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm md:text-base font-black text-[#2C2B30] leading-snug line-clamp-2 group-hover:text-[#8C66FF] transition-colors break-words">
              {ann.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onEdit(ann)}
              className="w-8 h-8 rounded-xl bg-[#FAF9FF] border border-[#F0EDFF] text-[#8C66FF] flex items-center justify-center hover:bg-[#F0ECFF] active:scale-95 transition-all cursor-pointer"
              title="Edit Topik Diskusi"
            >
              <FiEdit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(ann.id, ann.title)}
              className="w-8 h-8 rounded-xl bg-[#FFF1F2] border border-[#FFE4E6] text-[#E11D48] flex items-center justify-center hover:bg-[#FFE4E6] active:scale-95 transition-all cursor-pointer"
              title="Hapus Topik Diskusi"
            >
              <FiTrash2 size={13} />
            </button>
          </div>
        </div>

        {/* Banner Preview */}
        <div
          onClick={() => {
            if (ann.hasImage) {
              onZoomImage(`${API_URL}/api/announcements/${ann.id}/image`);
            }
          }}
          className={`w-full h-36 rounded-2xl overflow-hidden border border-[#F0EDFF] relative group/img ${
            ann.hasImage ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <img
            src={
              ann.hasImage
                ? `${API_URL}/api/announcements/${ann.id}/image`
                : PLACEHOLDER_IMAGE_URL
            }
            alt={ann.title}
            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
          />
          {ann.hasImage && (
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold">
              Klik untuk memperbesar
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Action Buttons */}
      <div className="flex flex-col gap-3 pt-2 border-t border-[#F0EDFF]/70">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenSubmissions(ann)}
            className="py-2.5 px-2 md:px-3 bg-[#8C66FF] hover:bg-[#7b55f0] text-white text-[11px] md:text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer min-w-0 whitespace-nowrap overflow-hidden"
          >
            <LuAward size={15} className="shrink-0" />
            <span className="truncate">Nilai ({ann.submissionsCount || 0})</span>
          </button>

          <button
            onClick={() => onOpenRanking(ann)}
            className="py-2.5 px-2 md:px-3 bg-[#FFF9E6] border border-[#FDE68A] text-[#D97706] hover:bg-[#FEF3C7] text-[11px] md:text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer min-w-0 whitespace-nowrap overflow-hidden"
          >
            <LuTrophy size={15} className="shrink-0" />
            <span className="truncate">Ranking</span>
          </button>
        </div>
      </div>
    </div>
  );
}
