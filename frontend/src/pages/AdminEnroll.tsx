import { useAppBack } from "../hooks/useAppBack";
import { FiArrowLeft } from "react-icons/fi";
import { useAdminEnroll } from "../components/admin/enroll/useAdminEnroll";
import ActiveCodeCard from "../components/admin/enroll/ActiveCodeCard";
import GenerateCodeCard from "../components/admin/enroll/GenerateCodeCard";
import StudentEnrollListCard from "../components/admin/enroll/StudentEnrollListCard";

export default function AdminEnroll() {
  const goBack = useAppBack();
  const {
    loading,
    generating,
    error,
    successMsg,
    currentCode,
    currentDeadline,
    newDeadline,
    setNewDeadline,
    enrollList,
    enrolledCount,
    filterStatus,
    setFilterStatus,
    revokingId,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    PAGE_SIZE,
    filteredList,
    totalPages,
    paginatedList,
    isExpired,
    handleGenerate,
    handleRevoke,
    handleCopyCode,
  } = useAdminEnroll();

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] md:text-xs text-[#9C98A6] font-bold uppercase tracking-widest animate-pulse">
            Memuat Data Enrollment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-start text-[#2C2B30] font-sans select-none relative py-4 md:py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-[#E9E4FF] rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-[#E6F8F6] rounded-full filter blur-3xl opacity-40"></div>
      </div>

      <div className="w-full max-w-107.5 md:max-w-5xl lg:max-w-6xl min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)] my-auto flex flex-col justify-between px-6 py-6 md:py-6 z-10 transition-all duration-300">
        <div>
          {/* Header */}
          <div className="w-full flex items-center justify-between mt-2 md:mt-0 mb-6 pb-4 border-b border-[#F0EDFF]/70">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => goBack("/admin")}
                className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 hover:bg-[#FAF9FF] transition-colors shrink-0"
                title="Kembali"
              >
                <FiArrowLeft size={20} />
              </button>
              <div>
                <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#9C98A6] font-bold">
                  Panel Administrator
                </p>
                <h1 className="text-xl md:text-2xl font-extrabold text-[#2C2B30] leading-tight mt-0.5">
                  Enrollment
                </h1>
              </div>
            </div>

            {/* Desktop Metrics Pills */}
            <div className="hidden md:flex items-center gap-2.5">
              <span className="px-3.5 py-1.5 bg-white border border-[#F0EDFF] text-xs font-bold text-[#2C2B30] rounded-full shadow-xs">
                Total: <strong className="text-[#8C66FF]">{enrollList.length}</strong> Siswa
              </span>
              <span className="px-3.5 py-1.5 bg-[#E6F8F6] text-[#2C8578] text-xs font-bold rounded-full">
                Enrolled: {enrolledCount}
              </span>
              <span className="px-3.5 py-1.5 bg-[#FFEBF0] text-[#D95276] text-xs font-bold rounded-full">
                Belum: {enrollList.length - enrolledCount}
              </span>
            </div>
          </div>

          {error && (
            <div className="w-full bg-[#FFEBF0] border border-[#FFEBF0] text-[#D95276] text-xs font-semibold p-4 rounded-2xl mb-4">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="w-full bg-[#E6F8F6] border border-[#E6F8F6] text-[#2C8578] text-xs font-bold p-4 rounded-2xl mb-4 animate-fade-in">
              {successMsg}
            </div>
          )}

          {/* 2-Column Responsive Dashboard Layout */}
          <div className="flex flex-col gap-5 md:grid md:grid-cols-12 md:gap-6 md:items-start overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-none md:overflow-visible pr-0.5 no-scrollbar">
            {/* LEFT COLUMN: CODE & GENERATOR */}
            <div className="flex flex-col gap-5 md:col-span-5 lg:col-span-4">
              <ActiveCodeCard
                currentCode={currentCode}
                currentDeadline={currentDeadline}
                isExpired={isExpired}
                enrolledCount={enrolledCount}
                totalStudents={enrollList.length}
                onCopyCode={handleCopyCode}
              />

              <GenerateCodeCard
                newDeadline={newDeadline}
                generating={generating}
                setNewDeadline={setNewDeadline}
                onGenerate={handleGenerate}
              />
            </div>

            {/* RIGHT COLUMN: STUDENT LIST */}
            <div className="flex flex-col gap-5 md:col-span-7 lg:col-span-8">
              <StudentEnrollListCard
                enrollList={enrollList}
                enrolledCount={enrolledCount}
                filteredList={filteredList}
                paginatedList={paginatedList}
                filterStatus={filterStatus}
                searchQuery={searchQuery}
                revokingId={revokingId}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={PAGE_SIZE}
                setFilterStatus={setFilterStatus}
                setSearchQuery={setSearchQuery}
                setCurrentPage={setCurrentPage}
                onRevoke={handleRevoke}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
