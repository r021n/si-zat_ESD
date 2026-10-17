import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useAppBack } from "../hooks/useAppBack";
import { isAdmin } from "../utils/auth";
import AnalyticsModal from "../components/common/AnalyticsModal";
import AdminNavGrid from "../components/admin/menu/AdminNavGrid";
import SiswaInsightsView from "../components/admin/menu/SiswaInsightsView";
import { useAdminSiswaInsights } from "../components/admin/menu/useAdminSiswaInsights";

export default function AdminMenu() {
  const navigate = useNavigate();
  const goBack = useAppBack();
  const { user } = useAuthStore();

  const [showSiswaInsights, setShowSiswaInsights] = useState(false);

  const {
    loadingSiswa,
    siswaError,
    fetchSiswaList,
    selectedSiswa,
    siswaAnalyticsData,
    isAnalyticsModalOpen,
    setIsAnalyticsModalOpen,
    loadingAnalytics,
    analyticsError,
    searchSiswa,
    setSearchSiswa,
    currentPage,
    setCurrentPage,
    PAGE_SIZE,
    filteredSiswaList,
    totalPages,
    paginatedSiswaList,
    handleOpenAnalytics,
  } = useAdminSiswaInsights(showSiswaInsights);

  useEffect(() => {
    if (!user || !isAdmin(user)) {
      navigate(!user ? "/auth" : "/menu");
    }
  }, [user, navigate]);

  if (!user) return null;

  const displayName = user.nama || user.email.split("@")[0];

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-start text-[#2C2B30] font-sans select-none relative py-4 md:py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-[#E9E4FF] rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-[#E6F8F6] rounded-full filter blur-3xl opacity-40"></div>
      </div>

      <div className="w-full max-w-107.5 md:max-w-5xl lg:max-w-6xl min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)] my-auto flex flex-col justify-between px-6 py-6 md:py-6 z-10 transition-all duration-300">
        {!showSiswaInsights ? (
          <AdminNavGrid
            userName={displayName}
            onBack={() => goBack("/menu")}
            onNavigate={(path) => navigate(path, { state: { from: "/admin" } })}
            onOpenSiswaInsights={() => setShowSiswaInsights(true)}
          />
        ) : (
          <SiswaInsightsView
            filteredSiswaList={filteredSiswaList}
            paginatedSiswaList={paginatedSiswaList}
            loadingSiswa={loadingSiswa}
            siswaError={siswaError}
            searchSiswa={searchSiswa}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            setSearchSiswa={setSearchSiswa}
            setCurrentPage={setCurrentPage}
            onBack={() => setShowSiswaInsights(false)}
            onFetchSiswaList={fetchSiswaList}
            onOpenAnalytics={handleOpenAnalytics}
          />
        )}
      </div>

      {/* Analytics Modal */}
      {selectedSiswa && (
        <AnalyticsModal
          isOpen={isAnalyticsModalOpen}
          onClose={() => setIsAnalyticsModalOpen(false)}
          loading={loadingAnalytics}
          error={analyticsError}
          analyticsData={siswaAnalyticsData}
          subtitle={
            <>
              Menu yang paling sering dikunjungi oleh:{" "}
              <span className="text-[#2C2B30] font-bold">
                {selectedSiswa.nama || selectedSiswa.email.split("@")[0]}
              </span>
            </>
          }
          badgeText={`Kelas ${selectedSiswa.kelas || "-"}`}
        />
      )}
    </div>
  );
}
