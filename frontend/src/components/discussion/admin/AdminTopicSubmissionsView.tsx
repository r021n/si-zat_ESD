import {
  FiArrowLeft,
  FiSearch,
  FiRefreshCw,
  FiFileText,
  FiChevronDown,
  FiChevronUp,
  FiSliders,
} from "react-icons/fi";
import { LuBookOpen } from "react-icons/lu";
import type { AnnouncementItem, SubmissionItem } from "../../../types/discussion";
import AdminSubmissionTable from "./AdminSubmissionTable";

interface AdminTopicSubmissionsViewProps {
  announcement: AnnouncementItem;
  onBack: () => void;
  onRefresh: () => void;
  loadingSubmissions: boolean;
  showTopicDetails: boolean;
  onToggleTopicDetails: () => void;
  searchSubmissionQuery: string;
  onSearchSubmissionChange: (q: string) => void;
  submissionFilterStatus: "all" | "graded" | "ungraded";
  onFilterStatusChange: (status: "all" | "graded" | "ungraded") => void;
  totalSubmissionsCount: number;
  gradedCount: number;
  ungradedCount: number;
  submissionSort: "newest" | "oldest" | "highest" | "lowest" | "name";
  onSortChange: (sort: "newest" | "oldest" | "highest" | "lowest" | "name") => void;
  sortedSubmissions: SubmissionItem[];
  paginatedSubmissions: SubmissionItem[];
  submissionPage: number;
  totalSubmissionPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onOpenGrading: (sub: SubmissionItem) => void;
  onOpenAnswerPreview: (sub: SubmissionItem) => void;
  onZoomImage: (url: string) => void;
}

export default function AdminTopicSubmissionsView({
  announcement,
  onBack,
  onRefresh,
  loadingSubmissions,
  showTopicDetails,
  onToggleTopicDetails,
  searchSubmissionQuery,
  onSearchSubmissionChange,
  submissionFilterStatus,
  onFilterStatusChange,
  totalSubmissionsCount,
  gradedCount,
  ungradedCount,
  submissionSort,
  onSortChange,
  sortedSubmissions,
  paginatedSubmissions,
  submissionPage,
  totalSubmissionPages,
  pageSize,
  onPageChange,
  onOpenGrading,
  onOpenAnswerPreview,
  onZoomImage,
}: AdminTopicSubmissionsViewProps) {
  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Header */}
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between pb-4 mb-4 border-b border-[#F0EDFF]/80 gap-3">
        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-2xl flex items-center justify-center shadow-xs border border-[#F0EDFF] text-[#8C66FF] active:scale-95 hover:bg-[#FAF9FF] transition-all shrink-0 cursor-pointer"
            title="Kembali ke Daftar Topik Diskusi"
          >
            <FiArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#9C98A6] font-bold truncate">
              Penilaian Pengumpulan Tugas Siswa
            </p>
            <h2 className="text-base md:text-xl font-black text-[#2C2B30] truncate mt-0.5">
              {announcement.title}
            </h2>
          </div>
        </div>

        {/* Toggle Soal & Action */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={onToggleTopicDetails}
            className="px-3.5 py-2 bg-white hover:bg-[#FAF9FF] border border-[#F0EDFF] text-[#8C66FF] text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <LuBookOpen size={14} />
            <span>{showTopicDetails ? "Tutup Detail Soal" : "Lihat Soal"}</span>
            {showTopicDetails ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>

          <button
            onClick={onRefresh}
            disabled={loadingSubmissions}
            className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-[#F0EDFF] text-[#8C66FF] shadow-xs active:scale-95 hover:bg-[#FAF9FF] transition-all cursor-pointer"
            title="Refresh Pengumpulan"
          >
            <FiRefreshCw size={14} className={loadingSubmissions ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Collapsible Details */}
      {showTopicDetails && (
        <div className="w-full bg-white rounded-3xl p-5 md:p-6 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(0,0,0,0.02)] mb-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#F0EDFF]">
            <h3 className="text-xs md:text-sm font-black text-[#2C2B30] flex items-center gap-2">
              <LuBookOpen className="text-[#8C66FF]" />
              <span>Soal & Kasus Diskusi</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {announcement.problem && (
              <div className="bg-[#FAF9FF] p-3.5 rounded-2xl border border-[#F0EDFF]">
                <span className="font-black text-[#8C66FF] block mb-1">
                  📌 Soal / Permasalahan:
                </span>
                <p className="text-[#524F5D] leading-relaxed whitespace-pre-line">
                  {announcement.problem}
                </p>
              </div>
            )}

            {announcement.question && (
              <div className="bg-[#FAF9FF] p-3.5 rounded-2xl border border-[#F0EDFF]">
                <span className="font-black text-[#8C66FF] block mb-1">
                  ❓ Pertanyaan Analisis:
                </span>
                <p className="text-[#524F5D] leading-relaxed whitespace-pre-line">
                  {announcement.question}
                </p>
              </div>
            )}

            {announcement.taskInfo && (
              <div className="bg-[#FAF9FF] p-3.5 rounded-2xl border border-[#F0EDFF]">
                <span className="font-black text-[#8C66FF] block mb-1">
                  📋 Info & Batas Waktu Tugas:
                </span>
                <p className="text-[#524F5D] leading-relaxed">{announcement.taskInfo}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="w-full flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <div className="w-full md:flex-1 relative min-w-0">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C98A6]" size={15} />
          <input
            type="text"
            placeholder="Cari nama atau kelas siswa..."
            value={searchSubmissionQuery}
            onChange={(e) => onSearchSubmissionChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#F0EDFF] rounded-2xl text-xs md:text-sm font-semibold text-[#2C2B30] placeholder:text-[#9C98A6] focus:outline-none focus:border-[#8C66FF] shadow-xs"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-white p-1 rounded-2xl border border-[#F0EDFF] shadow-xs max-w-full overflow-x-auto no-scrollbar">
            <button
              onClick={() => onFilterStatusChange("all")}
              className={`px-2.5 md:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                submissionFilterStatus === "all"
                  ? "bg-[#8C66FF] text-white shadow-xs"
                  : "text-[#9C98A6] hover:text-[#2C2B30]"
              }`}
            >
              Semua ({totalSubmissionsCount})
            </button>
            <button
              onClick={() => onFilterStatusChange("ungraded")}
              className={`px-2.5 md:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                submissionFilterStatus === "ungraded"
                  ? "bg-[#D97706] text-white shadow-xs"
                  : "text-[#9C98A6] hover:text-[#2C2B30]"
              }`}
            >
              <span className="md:hidden">Belum</span>
              <span className="hidden md:inline">Belum Dinilai</span> ({ungradedCount})
            </button>
            <button
              onClick={() => onFilterStatusChange("graded")}
              className={`px-2.5 md:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                submissionFilterStatus === "graded"
                  ? "bg-[#10B981] text-white shadow-xs"
                  : "text-[#9C98A6] hover:text-[#2C2B30]"
              }`}
            >
              <span className="md:hidden">Sudah</span>
              <span className="hidden md:inline">Sudah Dinilai</span> ({gradedCount})
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-2xl border border-[#F0EDFF] shadow-xs shrink-0">
            <FiSliders size={13} className="text-[#9C98A6] shrink-0" />
            <select
              value={submissionSort}
              onChange={(e: any) => onSortChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#2C2B30] focus:outline-none cursor-pointer max-w-[150px]"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="highest">Nilai Tertinggi</option>
              <option value="lowest">Nilai Terendah</option>
              <option value="name">Nama (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List Content */}
      <div className="flex-1 pb-8">
        {loadingSubmissions ? (
          <div className="py-24 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#9C98A6] font-bold">Memuat data tugas siswa...</p>
          </div>
        ) : sortedSubmissions.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl p-8 border border-[#F0EDFF] max-w-md mx-auto">
            <div className="w-14 h-14 mx-auto mb-3 bg-[#FAF9FF] text-[#9C98A6] rounded-2xl flex items-center justify-center text-2xl">
              <FiFileText />
            </div>
            <h4 className="text-sm font-bold text-[#2C2B30]">Tidak Ada Tugas Ditemukan</h4>
            <p className="text-xs text-[#9C98A6] mt-1">
              {searchSubmissionQuery || submissionFilterStatus !== "all"
                ? "Tidak ada tugas siswa yang sesuai dengan filter atau kata kunci pencarian Anda."
                : "Belum ada siswa yang mengumpulkan tugas untuk topik diskusi ini."}
            </p>
            {(searchSubmissionQuery || submissionFilterStatus !== "all") && (
              <button
                onClick={() => {
                  onSearchSubmissionChange("");
                  onFilterStatusChange("all");
                }}
                className="mt-4 px-4 py-2 bg-[#FAF9FF] text-[#8C66FF] hover:bg-[#F0ECFF] text-xs font-bold rounded-xl border border-[#F0EDFF] transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <AdminSubmissionTable
            submissions={paginatedSubmissions}
            currentPage={submissionPage}
            totalPages={totalSubmissionPages}
            totalItems={sortedSubmissions.length}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onOpenGrading={onOpenGrading}
            onOpenAnswerPreview={onOpenAnswerPreview}
            onZoomImage={onZoomImage}
          />
        )}
      </div>
    </div>
  );
}
