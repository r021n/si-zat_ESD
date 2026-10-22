import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { getMenuAnalyticsApi } from "../../api/api";

export function useProfileReport() {
  const navigate = useNavigate();
  const { user, updateProfile, loading, token } = useAuthStore();

  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [sekolah, setSekolah] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [analyticsData, setAnalyticsData] = useState<
    { menuKey: string; count: number }[]
  >([]);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setNama(user.nama || "");
    setKelas(user.kelas || "");
    setSekolah(user.sekolah || "");
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await updateProfile(kelas, nama, sekolah);
      setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal memperbarui profil.";
      setMessage({
        type: "error",
        text: errorMsg,
      });
    }
  };

  const handleOpenAnalytics = async () => {
    setIsAnalyticsModalOpen(true);
    setLoadingAnalytics(true);
    setAnalyticsError("");
    try {
      if (!token) return;
      const res = await getMenuAnalyticsApi(token);
      if (res && res.status === "success") {
        const rawData = res.data || [];
        const groupedMap = new Map<string, number>();
        rawData.forEach((item: { menuKey: string; count: number | string }) => {
          const key = item.menuKey;
          const count = Number(item.count) || 0;
          groupedMap.set(key, (groupedMap.get(key) || 0) + count);
        });
        const aggregated = Array.from(groupedMap.entries()).map(
          ([menuKey, count]) => ({
            menuKey,
            count,
          }),
        );
        aggregated.sort((a, b) => b.count - a.count);
        setAnalyticsData(aggregated);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal mengambil data analitik";
      setAnalyticsError(errorMsg);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  return {
    user,
    nama,
    kelas,
    sekolah,
    loading,
    message,
    analyticsData,
    isAnalyticsModalOpen,
    loadingAnalytics,
    analyticsError,
    setNama,
    setKelas,
    setSekolah,
    clearMessage: () => setMessage(null),
    setIsAnalyticsModalOpen,
    handleSubmit,
    handleOpenAnalytics,
  };
}
