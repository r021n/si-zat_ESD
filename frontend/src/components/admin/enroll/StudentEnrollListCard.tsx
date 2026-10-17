import { LuKeyRound, LuCircleCheck, LuCircleX, LuTrash2 } from "react-icons/lu";
import Pagination from "../../common/Pagination";
import type { EnrollStudent } from "./useAdminEnroll";

interface StudentEnrollListCardProps {
  enrollList: EnrollStudent[];
  enrolledCount: number;
  filteredList: EnrollStudent[];
  paginatedList: EnrollStudent[];
  filterStatus: "all" | "enrolled" | "not-enrolled";
  searchQuery: string;
  revokingId: number | null;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  setFilterStatus: (status: "all" | "enrolled" | "not-enrolled") => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  onRevoke: (userId: number, name: string) => void;
}

export default function StudentEnrollListCard({
  enrollList,
  enrolledCount,
  filteredList,
  paginatedList,
  filterStatus,
  searchQuery,
  revokingId,
  currentPage,
  totalPages,
  pageSize,
  setFilterStatus,
  setSearchQuery,
  setCurrentPage,
  onRevoke,
}: StudentEnrollListCardProps) {
  return (
    <div className="w-full bg-white rounded-[28px] p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-11 md:h-11 bg-[#FFEBF0] text-[#D95276] rounded-xl flex items-center justify-center shadow-inner">
            <LuKeyRound size={20} />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-extrabold text-[#2C2B30] tracking-wide">
              Status Siswa ({filteredList.length})
            </h3>
            <p className="text-[9px] md:text-xs text-[#9C98A6] font-medium mt-0.5">
              Kelola dan pantau status enrollment siswa
            </p>
          </div>
        </div>

        {/* Search box */}
        <div className="w-full sm:w-56">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari siswa/kelas..."
            className="w-full px-3.5 py-2 bg-[#FAF9FF] border border-[#F0EDFF] rounded-xl text-xs font-bold text-[#2C2B30] placeholder:text-[#9C98A6] focus:outline-none focus:border-[#8C66FF]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "enrolled", "not-enrolled"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`flex-1 py-2 text-[9px] md:text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              filterStatus === status
                ? "bg-[#8C66FF] text-white shadow-md shadow-purple-100"
                : "bg-[#FAF9FF] border border-[#F0EDFF] text-[#9C98A6] hover:border-[#8C66FF]/40"
            }`}
          >
            {status === "all"
              ? `Semua (${enrollList.length})`
              : status === "enrolled"
              ? `Enrolled (${enrolledCount})`
              : `Belum (${enrollList.length - enrolledCount})`}
          </button>
        ))}
      </div>

      {/* Student Items (Responsive grid on desktop) */}
      <div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
        {filteredList.length === 0 ? (
          <p className="text-xs text-[#9C98A6] font-semibold text-center py-12 md:col-span-2 bg-[#FAF9FF] border border-dashed border-[#F0EDFF] rounded-2xl">
            {searchQuery
              ? "Tidak ada siswa yang cocok dengan kata kunci."
              : "Tidak ada data siswa."}
          </p>
        ) : (
          paginatedList.map((siswa) => (
            <div
              key={siswa.id}
              className="w-full bg-[#FAF9FF] border border-[#F0EDFF] rounded-2xl p-3.5 flex justify-between items-center gap-2 hover:border-[#8C66FF]/30 transition-colors"
            >
              <div className="flex flex-col gap-1 truncate min-w-0">
                <span className="text-xs font-extrabold text-[#2C2B30] truncate">
                  {siswa.nama || siswa.email.split("@")[0]}
                </span>
                <span className="text-[10px] text-[#9C98A6] font-bold truncate">
                  {siswa.email} - Kelas {siswa.kelas || "-"}
                </span>
                {siswa.isEnrolled && siswa.enrolledAt && (
                  <span className="text-[9px] text-[#2C8578] font-bold">
                    Enrolled:{" "}
                    {new Date(siswa.enrolledAt).toLocaleDateString("id-ID")}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    siswa.isEnrolled
                      ? "bg-[#E6F8F6] text-[#2C8578]"
                      : "bg-[#FFEBF0] text-[#D95276]"
                  }`}
                >
                  {siswa.isEnrolled ? (
                    <span className="flex items-center gap-1">
                      <LuCircleCheck size={10} /> Enrolled
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <LuCircleX size={10} /> Belum
                    </span>
                  )}
                </span>

                {siswa.isEnrolled && (
                  <button
                    onClick={() =>
                      onRevoke(siswa.id, siswa.nama || siswa.email)
                    }
                    disabled={revokingId === siswa.id}
                    className="w-8 h-8 bg-white text-[#D95276] border border-[#FFEBF0] rounded-xl flex items-center justify-center shadow-xs cursor-pointer hover:bg-[#FFEBF0] transition-colors disabled:opacity-50"
                    title="Cabut Enrollment"
                  >
                    {revokingId === siswa.id ? (
                      <div className="w-3 h-3 border-2 border-[#D95276] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <LuTrash2 size={13} />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredList.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        className="mt-3"
      />
    </div>
  );
}
