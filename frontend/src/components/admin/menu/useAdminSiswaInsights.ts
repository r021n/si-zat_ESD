import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../../../store/authStore";
import { getSiswaUsersApi, getSiswaAnalyticsApi } from "../../../api/api";
import { useDebounce } from "../../../hooks/useDebounce";

export interface SiswaUser {
  id: number;
  email: string;
  nama: string;
  kelas: string;
  openCount?: number;
  totalUsageTime?: number;
}

export function useAdminSiswaInsights(showSiswaInsights: boolean) {
  const { token } = useAuthStore();

  const [siswaList, setSiswaList] = useState<SiswaUser[]>([]);
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [siswaError, setSiswaError] = useState("");

  const [selectedSiswa, setSelectedSiswa] = useState<SiswaUser | null>(null);
  const [siswaAnalyticsData, setSiswaAnalyticsData] = useState<
    { menuKey: string; count: number }[]
  >([]);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");

  const [searchSiswa, setSearchSiswa] = useState("");
  const debouncedSearchSiswa = useDebounce(searchSiswa, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchSiswa]);

  const fetchSiswaList = useCallback(async () => {
    setLoadingSiswa(true);
    setSiswaError("");
    try {
      if (!token) return;
      const res = await getSiswaUsersApi(token);
      if (res && res.status === "success") {
        setSiswaList(res.users || []);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal mengambil daftar siswa";
      setSiswaError(errorMsg);
    } finally {
      setLoadingSiswa(false);
    }
  }, [token]);

  useEffect(() => {
    if (showSiswaInsights && token) {
      fetchSiswaList();
    }
  }, [showSiswaInsights, token, fetchSiswaList]);

  const handleOpenAnalytics = async (siswa: SiswaUser) => {
    setSelectedSiswa(siswa);
    setIsAnalyticsModalOpen(true);
    setLoadingAnalytics(true);
    setAnalyticsError("");
    try {
      if (!token) return;
      const res = await getSiswaAnalyticsApi(token, siswa.id);
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
        setSiswaAnalyticsData(aggregated);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal mengambil data analitik";
      setAnalyticsError(errorMsg);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const filteredSiswaList = siswaList.filter((s) => {
    if (!debouncedSearchSiswa.trim()) return true;
    const q = debouncedSearchSiswa.toLowerCase();
    const nama = (s.nama || "").toLowerCase();
    const email = (s.email || "").toLowerCase();
    const kelas = (s.kelas || "").toLowerCase();
    return nama.includes(q) || email.includes(q) || kelas.includes(q);
  });

  const totalPages = Math.ceil(filteredSiswaList.length / PAGE_SIZE) || 1;
  const paginatedSiswaList = filteredSiswaList.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return {
    siswaList,
    loadingSiswa,
    siswaError,
    fetchSiswaList,
    selectedSiswa,
    setSelectedSiswa,
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
  };
}
