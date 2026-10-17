import { FiArrowLeft } from "react-icons/fi";
import { LuEye, LuClock, LuChartBar } from "react-icons/lu";
import Pagination from "../../common/Pagination";
import type { SiswaUser } from "./useAdminSiswaInsights";
import { formatAbbreviatedTime } from "../../../utils/time";

interface SiswaInsightsViewProps {
  filteredSiswaList: SiswaUser[];
  paginatedSiswaList: SiswaUser[];
  loadingSiswa: boolean;
  siswaError: string;
  searchSiswa: string;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  setSearchSiswa: (val: string) => void;
  setCurrentPage: (page: number) => void;
  onBack: () => void;
  onFetchSiswaList: () => void;
  onOpenAnalytics: (siswa: SiswaUser) => void;
}

export default function SiswaInsightsView({
  filteredSiswaList,
  paginatedSiswaList,
  loadingSiswa,
  siswaError,
  searchSiswa,
  currentPage,
  totalPages,
  pageSize,
  setSearchSiswa,
  setCurrentPage,
  onBack,
  onFetchSiswaList,
  onOpenAnalytics,
}: SiswaInsightsViewProps) {
  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Header Section */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3 mt-2 md:mt-0 mb-4 pb-4 border-b border-[#F0EDFF]/70">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 md:w-11 md:h-11 bg-white border border-[#F0EDFF] text-[#8C66FF] rounded-2xl flex items-center justify-center shadow-sm cursor-pointer transition-colors hover:bg-[#FAF9FF] active:bg-neutral-50 shrink-0"
            title="Kembali"
          >
            <FiArrowLeft className="text-lg md:text-xl" />
          </button>
          <div>
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#9C98A6] font-bold">
              Insight Aktivitas
            </p>
            <h1 className="text-lg md:text-2xl font-extrabold text-[#2C2B30] leading-tight mt-0.5">
              Data Siswa ({filteredSiswaList.length})
            </h1>
          </div>
        </div>

        {/* Search bar */}
        <div className="w-full md:w-72">
          <input
            type="text"
            value={searchSiswa}
            onChange={(e) => setSearchSiswa(e.target.value)}
            placeholder="Cari siswa, email, kelas..."
            className="w-full px-4 py-2.5 bg-white border border-[#F0EDFF] rounded-2xl text-xs font-bold text-[#2C2B30] placeholder:text-[#9C98A6] focus:outline-none focus:border-[#8C66FF] shadow-xs"
          />
        </div>
      </div>

      {/* Scrollable list / Grid on desktop */}
      <div className="flex-1 overflow-y-auto md:overflow-visible pr-0.5 my-2 flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5 md:content-start no-scrollbar">
        {loadingSiswa ? (
          <div className="py-20 md:col-span-3 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-8 h-8 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] md:text-xs text-[#9C98A6] font-bold uppercase tracking-widest animate-pulse">
              Memuat Data Siswa...
            </p>
          </div>
        ) : siswaError ? (
          <div className="py-12 md:col-span-3 text-center">
            <p className="text-xs text-[#FF5E8C] font-semibold">
              {siswaError}
            </p>
            <button
              onClick={onFetchSiswaList}
              className="mt-4 px-4 py-2 bg-[#8C66FF] text-white text-[10px] uppercase tracking-wider font-extrabold rounded-full cursor-pointer hover:bg-[#7b55f0]"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredSiswaList.length === 0 ? (
          <p className="text-xs text-[#9C98A6] font-semibold text-center py-20 md:col-span-3">
            {searchSiswa
              ? "Tidak ada siswa yang cocok dengan pencarian."
              : "Belum ada data siswa terdaftar."}
          </p>
        ) : (
          paginatedSiswaList.map((siswa) => (
            <div
              key={siswa.id}
              className="w-full bg-white rounded-[28px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] flex flex-col gap-4 hover:border-[#8C66FF]/50 transition-colors duration-200"
            >
              {/* Header: Name and Class */}
              <div className="flex justify-between items-start">
                <div className="truncate pr-2">
                  <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide truncate">
                    {siswa.nama || siswa.email.split("@")[0]}
                  </h3>
                  <p className="text-[9px] md:text-[10px] text-[#9C98A6] font-semibold truncate mt-0.5">
                    {siswa.email}
                  </p>
                </div>
                <span className="inline-block text-[9px] px-3 py-1 bg-[#F0ECFF] text-[#8C66FF] font-extrabold rounded-full shrink-0">
                  Kelas {siswa.kelas || "-"}
                </span>
              </div>

              {/* Stats insight */}
              <div className="w-full bg-[#FAF9FF] rounded-[20px] p-3 border border-[#F0EDFF]/70 flex items-center justify-between">
                <div className="flex-1 flex flex-col items-center border-r border-[#F0EDFF]/70">
                  <p className="text-[8px] uppercase tracking-wider text-[#9C98A6] font-bold flex items-center gap-1">
                    <LuEye className="text-[10px]" /> Kunjungan
                  </p>
                  <h4 className="text-xs font-black text-[#2C2B30] mt-1">
                    {siswa.openCount ?? 0} Kali
                  </h4>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <p className="text-[8px] uppercase tracking-wider text-[#9C98A6] font-bold flex items-center gap-1">
                    <LuClock className="text-[10px]" /> Lama Belajar
                  </p>
                  <h4 className="text-xs font-black text-[#2C2B30] mt-1">
                    {formatAbbreviatedTime(siswa.totalUsageTime)}
                  </h4>
                </div>
              </div>

              {/* Analytics Action Button */}
              <button
                onClick={() => onOpenAnalytics(siswa)}
                className="w-full py-3 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-inner cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 hover:bg-[#F0ECFF] hover:border-[#8C66FF]/40"
              >
                <LuChartBar className="text-xs" />
                <span>Analitik Menu Favorit</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredSiswaList.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        className="mt-4"
      />
    </div>
  );
}
