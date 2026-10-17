import { FiArrowLeft } from "react-icons/fi";
import { useAppBack } from "../hooks/useAppBack";
import AnalyticsModal from "../components/common/AnalyticsModal";
import ProfileFormCard from "../components/profile/ProfileFormCard";
import ProfileStatsCard from "../components/profile/ProfileStatsCard";
import { useProfileReport } from "../components/profile/useProfileReport";

export default function ProfileReport() {
  const goBack = useAppBack();
  const {
    user,
    nama,
    kelas,
    loading,
    message,
    analyticsData,
    isAnalyticsModalOpen,
    loadingAnalytics,
    analyticsError,
    setNama,
    setKelas,
    clearMessage,
    setIsAnalyticsModalOpen,
    handleSubmit,
    handleOpenAnalytics,
  } = useProfileReport();

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      {/* Decorative Blur Bubble */}
      <div className="absolute top-[-10%] right-[-10%] w-50 h-50 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-107.5 min-h-screen flex flex-col justify-between px-6 py-6 z-10">
        {/* Top Header Section */}
        <div>
          <div className="w-full flex justify-between items-center mt-4 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => goBack("/menu")}
                className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 transition-none shrink-0"
                title="Kembali"
              >
                <FiArrowLeft size={20} />
              </button>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">
                  Pengaturan Pengguna
                </p>
                <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight mt-0.5">
                  Profil & Report
                </h1>
              </div>
            </div>
            {/* Profile Icon Header */}
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Scrollable Form & Info Area */}
        <div className="flex-1 overflow-y-auto pr-0.5 my-2 flex flex-col gap-4 no-scrollbar">
          {/* Profile Card */}
          <div className="w-full bg-linear-to-br from-[#8C66FF] to-[#6039DF] text-white rounded-[28px] p-5 shadow-md relative overflow-hidden flex flex-col justify-between min-h-35">
            <div className="absolute right-[-10%] top-[-25%] w-32.5 h-32.5 bg-white/10 rounded-full blur-md"></div>
            <div className="absolute right-[15%] bottom-[-20%] w-22.5 h-22.5 bg-white/5 rounded-full blur-sm"></div>

            <div>
              <p className="text-[10px] text-purple-200 uppercase tracking-widest font-extrabold">
                Akun Aktif
              </p>
              <h2 className="text-lg font-black text-white leading-tight mt-1 truncate">
                Hi, {user.nama || user.email.split("@")[0]}
              </h2>
            </div>

            <div className="mt-4 flex flex-col gap-1">
              <p className="text-[9px] text-purple-200 font-bold uppercase tracking-wide truncate">
                Email: {user.email}
              </p>
              <div className="flex gap-2 mt-1">
                <span className="inline-block text-[9px] px-3 py-1 bg-[#FF5E8C] text-white font-extrabold rounded-full shadow-sm">
                  {user.status.toUpperCase()}
                </span>
                <span className="inline-block text-[9px] px-3 py-1 bg-white/20 text-white font-extrabold rounded-full">
                  Kelas: {user.kelas || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields Card */}
          <ProfileFormCard
            nama={nama}
            kelas={kelas}
            loading={loading}
            message={message}
            setNama={setNama}
            setKelas={setKelas}
            clearMessage={clearMessage}
            onSubmit={handleSubmit}
          />

          {/* Details & Statistics Card */}
          <ProfileStatsCard
            userId={user.id}
            createdAt={user.createdAt}
            openCount={user.openCount}
            totalUsageTime={user.totalUsageTime}
            onOpenAnalytics={handleOpenAnalytics}
          />
        </div>
      </div>

      {/* Analytics Modal */}
      <AnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        loading={loadingAnalytics}
        error={analyticsError}
        analyticsData={analyticsData}
      />
    </div>
  );
}
