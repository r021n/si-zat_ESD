import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { useAppBack } from "../hooks/useAppBack";
import {
  LuPenTool,
  LuLock,
  LuChartBar,
  LuClock,
  LuEye,
  LuSettings,
  LuKeyRound,
} from "react-icons/lu";

import { FiArrowLeft } from "react-icons/fi";
import { getSiswaUsersApi, getSiswaAnalyticsApi } from "../api/api";

export default function AdminMenu() {
  const navigate = useNavigate();
  const goBack = useAppBack();
  const { user, token } = useAuthStore();

  const [showSiswaInsights, setShowSiswaInsights] = useState(false);
  const [siswaList, setSiswaList] = useState<any[]>([]);
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [siswaError, setSiswaError] = useState("");

  const [selectedSiswa, setSelectedSiswa] = useState<any | null>(null);
  const [siswaAnalyticsData, setSiswaAnalyticsData] = useState<
    { menuKey: string; count: number }[]
  >([]);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");

  const [searchSiswa, setSearchSiswa] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const isAdmin =
      user.status.toLowerCase() === "admin" ||
      user.email.toLowerCase().includes("admin");
    if (!isAdmin) {
      navigate("/menu");
    }
  }, [user, navigate]);

  const fetchSiswaList = useCallback(async () => {
    setLoadingSiswa(true);
    setSiswaError("");
    try {
      if (!token) return;
      const res = await getSiswaUsersApi(token);
      if (res && res.status === "success") {
        setSiswaList(res.users || []);
      }
    } catch (err: any) {
      setSiswaError(err.message || "Gagal mengambil daftar siswa");
    } finally {
      setLoadingSiswa(false);
    }
  }, [token]);

  useEffect(() => {
    if (showSiswaInsights && token) {
      fetchSiswaList();
    }
  }, [showSiswaInsights, token, fetchSiswaList]);

  const handleOpenAnalytics = async (siswa: any) => {
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
        rawData.forEach((item: any) => {
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
    } catch (err: any) {
      setAnalyticsError(err.message || "Gagal mengambil data analitik");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  if (!user) return null;

  const formatAbbreviatedTime = (seconds?: number) => {
    if (!seconds || seconds <= 0) return "0 detik";
    if (seconds < 60) return `${seconds} detik`;
    if (seconds < 3600) {
      const minutes = seconds / 60;
      const formatted = minutes.toFixed(1).replace(".", ",");
      return `${
        formatted.endsWith(",0") ? Math.round(minutes) : formatted
      } menit`;
    }
    const hours = seconds / 3600;
    const formatted = hours.toFixed(1).replace(".", ",");
    return `${formatted.endsWith(",0") ? Math.round(hours) : formatted} jam`;
  };

  const filteredSiswaList = siswaList.filter((s) => {
    if (!searchSiswa.trim()) return true;
    const q = searchSiswa.toLowerCase();
    const nama = (s.nama || "").toLowerCase();
    const email = (s.email || "").toLowerCase();
    const kelas = (s.kelas || "").toLowerCase();
    return nama.includes(q) || email.includes(q) || kelas.includes(q);
  });

  const adminMenus = [
    {
      id: "enrollment",
      label: "Enrollment",
      desc: "Generate kode enroll, set deadline, dan kelola siswa",
      icon: <LuKeyRound className="text-xl" />,
      bgIcon: "bg-[#E6F8F6]",
      textIcon: "text-[#2C8578]",
      path: "/admin/enrollment",
    },
    {
      id: "kuis",
      label: "Kelola Kuis",
      desc: "Kelola kuis, edit soal, dan analisis hasil",
      icon: <LuPenTool className="text-xl" />,
      bgIcon: "bg-[#FFEBF0]",
      textIcon: "text-[#D95276]",
      path: "/admin/kuis",
    },
    {
      id: "change-password",
      label: "Ubah Password Siswa",
      desc: "Ganti password akun siswa tanpa melihat password lama",
      icon: <LuLock className="text-xl" />,
      bgIcon: "bg-[#F0ECFF]",
      textIcon: "text-[#8C66FF]",
      path: "/admin/change-password",
    },
    {
      id: "access-control",
      label: "Kontrol Akses",
      desc: "Atur status kunci manual dan jadwal aktif aplikasi",
      icon: <LuSettings className="text-xl" />,
      bgIcon: "bg-[#FFF9E6]",
      textIcon: "text-[#FFC107]",
      path: "/admin/access-control",
    },
    {
      id: "siswa-insights",
      label: "Insight Aktivitas Siswa",
      desc: "Lihat kunjungan, durasi belajar, dan menu favorit siswa",
      icon: <LuChartBar className="text-xl" />,
      bgIcon: "bg-[#E6F8F6]",
      textIcon: "text-[#2C8578]",
      path: "#",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-start text-[#2C2B30] font-sans select-none relative py-4 md:py-8">
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-[#E9E4FF] rounded-full filter blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-[#E6F8F6] rounded-full filter blur-3xl opacity-40 pointer-events-none"></div>

      <div className="w-full max-w-107.5 md:max-w-5xl lg:max-w-6xl min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)] my-auto flex flex-col justify-between px-6 py-6 md:py-6 z-10 transition-all duration-300">
        {!showSiswaInsights ? (
          <div className="w-full flex-1 flex flex-col justify-between">
            {/* Header Section */}
            <div className="w-full flex items-center justify-between mt-2 md:mt-0 mb-6 pb-4 border-b border-[#F0EDFF]/70">
              <div className="flex items-center gap-3 md:gap-4">
                <button
                  onClick={() => goBack("/menu")}
                  className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 hover:bg-[#FAF9FF] transition-colors shrink-0"
                  title="Kembali ke Menu Utama"
                >
                  <FiArrowLeft size={20} />
                </button>
                <div>
                  <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#9C98A6] font-bold">
                    Panel Administrator
                  </p>
                  <h1 className="text-xl md:text-2xl font-extrabold text-[#2C2B30] leading-tight mt-0.5">
                    Menu Admin
                  </h1>
                </div>
              </div>

              {/* Admin profile pill for desktop */}
              <div className="hidden md:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-[#F0EDFF] shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-[#F0ECFF] text-[#8C66FF] font-black text-xs flex items-center justify-center">
                  AD
                </div>
                <div className="text-left">
                  <p className="text-xs font-extrabold text-[#2C2B30] leading-tight">
                    {user.nama || user.email.split("@")[0]}
                  </p>
                  <p className="text-[10px] text-[#9C98A6] font-bold uppercase tracking-wider">
                    Administrator SI-ZAT
                  </p>
                </div>
              </div>
            </div>

            {/* Menu List / Grid */}
            <div className="w-full flex flex-col gap-3 my-auto md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5 md:my-0 md:flex-1 md:content-start">
              {adminMenus.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => {
                    if (menu.id === "siswa-insights") {
                      setShowSiswaInsights(true);
                    } else {
                      navigate(menu.path, { state: { from: "/admin" } });
                    }
                  }}
                  className="w-full bg-white rounded-3xl p-4 md:p-6 flex items-center justify-between md:flex-col md:items-start md:justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] cursor-pointer text-left transition-colors duration-200 md:hover:border-[#8C66FF]/60 md:hover:bg-[#FAF9FF]/40 group"
                >
                  <div className="flex items-center gap-4 md:flex-col md:items-start md:w-full md:gap-4">
                    {/* Top row on desktop: icon + hover action arrow */}
                    <div className="flex items-center justify-between md:w-full">
                      <div
                        className={`w-12 h-12 md:w-13 md:h-13 rounded-2xl flex items-center justify-center shadow-inner ${menu.bgIcon} ${menu.textIcon}`}
                      >
                        {menu.icon}
                      </div>
                      <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-[#FAF9FF] text-[#8C66FF] border border-[#F0EDFF] opacity-70 group-hover:opacity-100 group-hover:bg-[#8C66FF] group-hover:text-white transition-colors duration-200">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm md:text-base font-extrabold text-[#2C2B30] tracking-wide group-hover:text-[#8C66FF] transition-colors">
                        {menu.label}
                      </h3>
                      <p className="text-[10px] md:text-xs text-[#9C98A6] font-medium mt-1 leading-relaxed">
                        {menu.desc}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Chevron Right */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 text-[#8C66FF] opacity-50 md:hidden shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col">
            {/* Header Section */}
            <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3 mt-2 md:mt-0 mb-4 pb-4 border-b border-[#F0EDFF]/70">
              <div className="flex items-center gap-3 md:gap-4">
                <button
                  onClick={() => setShowSiswaInsights(false)}
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

              {/* Search bar for desktop and mobile */}
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
                    onClick={fetchSiswaList}
                    className="mt-4 px-4 py-2 bg-[#8C66FF] text-white text-[10px] uppercase tracking-wider font-extrabold rounded-full cursor-pointer hover:bg-[#7b55f0]"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : filteredSiswaList.length === 0 ? (
                <p className="text-xs text-[#9C98A6] font-semibold text-center py-20 md:col-span-3">
                  {searchSiswa ? "Tidak ada siswa yang cocok dengan pencarian." : "Belum ada data siswa terdaftar."}
                </p>
              ) : (
                filteredSiswaList.map((siswa) => (
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

                    {/* Stats insight similar to MainMenu.tsx */}
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
                      onClick={() => handleOpenAnalytics(siswa)}
                      className="w-full py-3 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-inner cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 hover:bg-[#F0ECFF] hover:border-[#8C66FF]/40"
                    >
                      <LuChartBar className="text-xs" />
                      <span>Analitik Menu Favorit</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      {isAnalyticsModalOpen && selectedSiswa && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 md:p-6 backdrop-blur-xs">
          <div className="w-full max-w-85 md:max-w-xl bg-white rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-xl border border-[#F0EDFF] flex flex-col gap-4 animate-none select-none text-left">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm md:text-base font-extrabold text-[#2C2B30] tracking-wide uppercase flex items-center gap-2">
                  <LuChartBar className="text-[#8C66FF]" />
                  Analitik Aktivitas
                </h3>
                <p className="text-[10px] md:text-xs text-[#9C98A6] font-semibold mt-1">
                  Menu yang paling sering dikunjungi oleh:{" "}
                  <span className="text-[#2C2B30] font-bold">
                    {selectedSiswa.nama || selectedSiswa.email.split("@")[0]}
                  </span>
                </p>
              </div>
              <span className="text-[10px] px-3 py-1 bg-[#F0ECFF] text-[#8C66FF] font-extrabold rounded-full">
                Kelas {selectedSiswa.kelas || "-"}
              </span>
            </div>

            <div className="max-h-60 md:max-h-80 overflow-y-auto pr-1 flex flex-col gap-2.5 my-1 no-scrollbar">
              {loadingAnalytics ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-center">
                  <div className="w-6 h-6 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] text-[#9C98A6] font-bold uppercase tracking-widest animate-pulse">
                    Memuat Analitik...
                  </p>
                </div>
              ) : analyticsError ? (
                <p className="text-xs text-[#FF5E8C] font-semibold text-center py-4">
                  {analyticsError}
                </p>
              ) : siswaAnalyticsData.length === 0 ? (
                <p className="text-xs text-[#9C98A6] font-semibold text-center py-6">
                  Belum ada aktivitas menu yang tercatat.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {siswaAnalyticsData.map((item, index) => (
                    <div
                      key={item.menuKey}
                      className="w-full bg-[#FAF9FF] border border-[#F0EDFF]/70 rounded-xl px-4 py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[10px] font-black text-[#9C98A6] w-4">
                          {index + 1}.
                        </span>
                        <span className="text-xs font-bold text-[#2C2B30] truncate">
                          {item.menuKey}
                        </span>
                      </div>
                      <span className="text-xs font-black text-[#8C66FF] bg-[#F0ECFF] px-2.5 py-1 rounded-full shrink-0">
                        {item.count}x
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => setIsAnalyticsModalOpen(false)}
                className="w-full py-3.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer hover:bg-[#7b55f0] transition-colors flex items-center justify-center"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
