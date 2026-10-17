import { FiArrowLeft, FiPlus, FiSearch, FiRefreshCw } from "react-icons/fi";
import { LuMessageSquare } from "react-icons/lu";
import type { AnnouncementItem } from "../../../types/discussion";
import AdminAnnouncementCard from "./AdminAnnouncementCard";

interface AdminTopicListViewProps {
  onBack: () => void;
  onRefresh: () => void;
  loadingList: boolean;
  onCreateClick: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filteredAnnouncements: AnnouncementItem[];
  onEditAnnouncement: (ann: AnnouncementItem) => void;
  onDeleteAnnouncement: (id: string, title: string) => void;
  onOpenSubmissions: (ann: AnnouncementItem) => void;
  onOpenRanking: (ann: AnnouncementItem) => void;
  onZoomImage: (url: string) => void;
}

export default function AdminTopicListView({
  onBack,
  onRefresh,
  loadingList,
  onCreateClick,
  searchQuery,
  onSearchChange,
  filteredAnnouncements,
  onEditAnnouncement,
  onDeleteAnnouncement,
  onOpenSubmissions,
  onOpenRanking,
  onZoomImage,
}: AdminTopicListViewProps) {
  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Header */}
      <div className="w-full flex items-center justify-between gap-3 pb-4 mb-4 border-b border-[#F0EDFF]/80">
        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-2xl flex items-center justify-center shadow-xs border border-[#F0EDFF] text-[#8C66FF] active:scale-95 hover:bg-[#FAF9FF] transition-all shrink-0 cursor-pointer"
            title="Kembali ke Panel Admin"
          >
            <FiArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#9C98A6] font-bold truncate">
              Panel Guru & Administrator
            </p>
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#2C2B30] leading-tight mt-0.5 truncate">
              Kelola Ruang Diskusi
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRefresh}
            disabled={loadingList}
            className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-[#F0EDFF] text-[#8C66FF] shadow-xs active:scale-95 hover:bg-[#FAF9FF] transition-all cursor-pointer shrink-0"
            title="Segarkan Data Topik"
          >
            <FiRefreshCw size={16} className={loadingList ? "animate-spin" : ""} />
          </button>
          <button
            onClick={onCreateClick}
            className="px-3.5 md:px-5 py-2.5 bg-[#8C66FF] hover:bg-[#7b55f0] text-white text-xs md:text-sm font-black rounded-2xl flex items-center gap-2 shadow-md shadow-purple-200 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <FiPlus size={16} className="shrink-0" />
            <span className="hidden sm:inline">Buat Topik Baru</span>
            <span className="sm:hidden">Buat</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9C98A6]" size={16} />
          <input
            type="text"
            placeholder="Cari judul topik diskusi..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#F0EDFF] rounded-2xl text-xs md:text-sm font-semibold text-[#2C2B30] placeholder:text-[#9C98A6] focus:outline-none focus:border-[#8C66FF] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="px-3.5 py-3 bg-white hover:bg-neutral-50 text-[#9C98A6] text-xs font-bold rounded-2xl border border-[#F0EDFF] shadow-xs cursor-pointer transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Announcements Grid */}
      <div className="flex-1 pb-8">
        {loadingList ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#9C98A6] font-black uppercase tracking-wider animate-pulse">
              Memuat data topik diskusi...
            </p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl p-8 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(0,0,0,0.02)] max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#F0ECFF] text-[#8C66FF] rounded-3xl flex items-center justify-center text-3xl">
              <LuMessageSquare />
            </div>
            <h3 className="text-base font-extrabold text-[#2C2B30]">
              {searchQuery ? "Topik Tidak Ditemukan" : "Belum Ada Topik Diskusi"}
            </h3>
            <p className="text-xs md:text-sm text-[#9C98A6] mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? `Tidak ditemukan topik dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : "Mulai buat topik diskusi atau tugas analisis baru untuk siswa Anda."}
            </p>
            <button
              onClick={searchQuery ? () => onSearchChange("") : onCreateClick}
              className="px-5 py-3 bg-[#8C66FF] hover:bg-[#7b55f0] text-white text-xs md:text-sm font-bold rounded-2xl shadow-md shadow-purple-100 cursor-pointer active:scale-95 transition-all"
            >
              {searchQuery ? "Hapus Pencarian" : "+ Buat Topik Sekarang"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAnnouncements.map((ann) => (
              <AdminAnnouncementCard
                key={ann.id}
                ann={ann}
                onEdit={onEditAnnouncement}
                onDelete={onDeleteAnnouncement}
                onOpenSubmissions={onOpenSubmissions}
                onOpenRanking={onOpenRanking}
                onZoomImage={onZoomImage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
