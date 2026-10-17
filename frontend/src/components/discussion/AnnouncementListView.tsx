import { FiArrowLeft, FiRefreshCw, FiSearch, FiCheckCircle, FiChevronRight } from "react-icons/fi";
import { LuMessageSquare } from "react-icons/lu";
import type { AnnouncementItem } from "../../types/discussion";
import { API_URL, PLACEHOLDER_IMAGE_URL } from "../../utils/constants";

interface AnnouncementListViewProps {
  onBack: () => void;
  onRefresh: () => void;
  loadingList: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filteredAnnouncements: AnnouncementItem[];
  onSelectAnnouncement: (id: string) => void;
}

export default function AnnouncementListView({
  onBack,
  onRefresh,
  loadingList,
  searchQuery,
  onSearchChange,
  filteredAnnouncements,
  onSelectAnnouncement,
}: AnnouncementListViewProps) {
  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-[#F0EDFF]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-xs border border-[#F0EDFF] text-[#8C66FF] active:scale-95 transition-transform shrink-0 cursor-pointer"
            title="Kembali ke Menu"
          >
            <FiArrowLeft size={19} />
          </button>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">
              Forum Kolaborasi
            </p>
            <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight">
              Ruang Diskusi
            </h1>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loadingList}
          className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-[#F0EDFF] text-[#8C66FF] shadow-xs active:scale-95 transition-transform cursor-pointer"
          title="Refresh"
        >
          <FiRefreshCw
            size={15}
            className={loadingList ? "animate-spin" : ""}
          />
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full relative mb-3">
        <FiSearch
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C98A6]"
          size={15}
        />
        <input
          type="text"
          placeholder="Cari tugas atau diskusi..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#F0EDFF] rounded-2xl text-xs font-semibold text-[#2C2B30] placeholder:text-[#9C98A6] focus:outline-none focus:border-[#8C66FF] shadow-xs"
        />
      </div>

      {/* Announcements List */}
      <div className="flex-1 overflow-y-auto pr-0.5 space-y-3 no-scrollbar pb-6">
        {loadingList ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[11px] text-[#9C98A6] font-bold uppercase tracking-wider animate-pulse">
              Memuat Ruang Diskusi...
            </p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl p-6 border border-[#F0EDFF] shadow-xs">
            <div className="w-14 h-14 mx-auto mb-3 bg-[#F0ECFF] text-[#8C66FF] rounded-2xl flex items-center justify-center text-2xl">
              <LuMessageSquare />
            </div>
            <h3 className="text-sm font-extrabold text-[#2C2B30]">
              Belum Ada Topik Diskusi
            </h3>
            <p className="text-xs text-[#9C98A6] mt-1">
              Topik diskusi dan tugas dari guru akan tampil di sini.
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => {
            const isSubmitted = !!ann.mySubmission;
            const isGraded =
              ann.mySubmission?.grade !== undefined &&
              ann.mySubmission?.grade !== null;

            return (
              <div
                key={ann.id}
                onClick={() => onSelectAnnouncement(ann.id)}
                className="w-full bg-white rounded-2xl p-3.5 border border-[#F0EDFF] shadow-xs active:scale-[0.99] transition-all cursor-pointer hover:border-[#8C66FF]/50 flex items-center gap-3.5"
              >
                {/* Left Thumbnail */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#8C66FF] to-[#6366F1] flex items-center justify-center text-white text-xl shrink-0 shadow-xs overflow-hidden">
                  <img
                    src={
                      ann.hasImage
                        ? `${API_URL}/api/announcements/${ann.id}/image`
                        : PLACEHOLDER_IMAGE_URL
                    }
                    alt={ann.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Right Details */}
                <div className="flex-1 min-w-0 flex flex-col">
                  {/* Badges Row */}
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#8C66FF] bg-[#F0ECFF] px-2 py-0.5 rounded-md">
                      Tugas
                    </span>
                    {isGraded ? (
                      <span className="text-[9px] font-black text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <FiCheckCircle size={10} /> Nilai: {ann.mySubmission?.grade}
                      </span>
                    ) : isSubmitted ? (
                      <span className="text-[9px] font-bold text-[#3B82F6] bg-[#EFF6FF] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <FiCheckCircle size={10} /> Terkumpul
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-[#F59E0B] bg-[#FFFBEB] px-2 py-0.5 rounded-md">
                        Berlangsung
                      </span>
                    )}
                  </div>

                  <h2 className="text-xs font-extrabold text-[#2C2B30] leading-snug truncate">
                    {ann.title}
                  </h2>
                </div>

                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[#9C98A6] shrink-0">
                  <FiChevronRight size={16} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
