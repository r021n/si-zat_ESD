import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { LuEye, LuClock, LuChartBar } from "react-icons/lu";
import { FiArrowLeft } from "react-icons/fi";
import { getMenuAnalyticsApi } from "../api/api";

export default function ProfileReport() {
  const navigate = useNavigate();
  const { user, updateProfile, loading, checkAuth, token } = useAuthStore();

  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
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
        setAnalyticsData(aggregated);
      }
    } catch (err: any) {
      setAnalyticsError(err.message || "Gagal mengambil data analitik");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setNama(user.nama || "");
    setKelas(user.kelas || "");
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await updateProfile(kelas, nama);
      setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Gagal memperbarui profil.",
      });
    }
  };

  if (!user) return null;

  const formatCreatedAt = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatUsageTime = (seconds?: number) => {
    if (!seconds) return "0 detik";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const parts = [];
    if (h > 0) parts.push(`${h} jam`);
    if (m > 0) parts.push(`${m} menit`);
    if (s > 0 || parts.length === 0) parts.push(`${s} detik`);

    return parts.join(" ");
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      {/* Decorative Blur Bubble */}
      <div className="absolute top-[-10%] right-[-10%] w-[200px] h-[200px] bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-6 z-10">
        {/* Top Header Section */}
        <div>
          <div className="w-full flex justify-between items-center mt-4 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/menu")}
                className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 transition-none flex-shrink-0"
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
          {/* Profile Card (matches MainMenu) */}
          <div className="w-full bg-gradient-to-br from-[#8C66FF] to-[#6039DF] text-white rounded-[28px] p-5 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            {/* Card Background elements */}
            <div className="absolute right-[-10%] top-[-25%] w-[130px] h-[130px] bg-white/10 rounded-full blur-md"></div>
            <div className="absolute right-[15%] bottom-[-20%] w-[90px] h-[90px] bg-white/5 rounded-full blur-sm"></div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16 opacity-10 absolute right-4 bottom-4 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>

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
          <form
            onSubmit={handleSubmit}
            className="w-full bg-white rounded-[28px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-4"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6] mb-1">
              Perbarui Profil
            </p>

            {/* Custom Inline Alert Banner */}
            {message && (
              <div
                className={`p-4 border text-xs font-bold rounded-[20px] transition-none flex items-center gap-2 ${
                  message.type === "success"
                    ? "border-[#E6F8F6] bg-[#E6F8F6] text-[#2C8578]"
                    : "border-[#FFEAEA] bg-[#FFEAEA] text-[#FF5E8C]"
                }`}
              >
                {message.type === "success" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-4 h-4 shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-4 h-4 shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Nama Lengkap Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value);
                  if (message) setMessage(null);
                }}
                required
                className="w-full p-4 border border-[#F0EDFF] bg-[#FAF9FF] text-[#2C2B30] text-xs font-bold focus:outline-none focus:border-[#8C66FF] transition-none rounded-2xl"
              />
            </div>

            {/* Kelas Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                Kelas
              </label>
              <input
                type="text"
                value={kelas}
                onChange={(e) => {
                  setKelas(e.target.value);
                  if (message) setMessage(null);
                }}
                required
                className="w-full p-4 border border-[#F0EDFF] bg-[#FAF9FF] text-[#2C2B30] text-xs font-bold focus:outline-none focus:border-[#8C66FF] transition-none rounded-2xl"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 bg-gradient-to-br from-[#8C66FF] to-[#6039DF] text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </form>

          {/* Details & Statistics Card */}
          <div className="w-full bg-white rounded-[28px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                Informasi Sistem & Statistik
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* ID Pengguna */}
              <div className="flex justify-between items-center py-2 border-b border-[#F0EDFF]/50">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                    ID Pengguna
                  </h4>
                  <p className="text-[11px] font-mono text-[#2C2B30] mt-0.5 select-all">
                    {user.id}
                  </p>
                </div>
                <span className="text-[9px] font-bold px-2.5 py-1 bg-[#F5F5F7] text-[#555555] rounded-md">
                  ReadOnly
                </span>
              </div>

              {/* Terdaftar Sejak */}
              <div className="flex justify-between items-center py-2 border-b border-[#F0EDFF]/50">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                    Terdaftar Sejak
                  </h4>
                  <p className="text-xs font-bold text-[#2C2B30] mt-0.5">
                    {formatCreatedAt(user.createdAt)}
                  </p>
                </div>
              </div>

              {/* Frekuensi Dibuka */}
              <div className="flex justify-between items-center py-2 border-b border-[#F0EDFF]/50">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                    Frekuensi Dibuka
                  </h4>
                  <p className="text-xs font-bold text-[#2C2B30] mt-0.5">
                    {user.openCount ?? 0} Kali
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#E6F8F6] text-[#2C8578] flex items-center justify-center">
                  <LuEye className="w-4 h-4" />
                </div>
              </div>

              {/* Total Durasi Penggunaan */}
              <div className="flex justify-between items-center py-2 border-b border-[#F0EDFF]/50">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                    Durasi Penggunaan
                  </h4>
                  <p className="text-xs font-bold text-[#2C2B30] mt-0.5">
                    {formatUsageTime(user.totalUsageTime)}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#FFF4EB] text-[#FF9D42] flex items-center justify-center">
                  <LuClock className="w-4 h-4" />
                </div>
              </div>

              {/* Analitik Aktivitas */}
              <div
                className="flex justify-between items-center py-2 cursor-pointer"
                onClick={handleOpenAnalytics}
              >
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#8C66FF]">
                    Analitik Aktivitas
                  </h4>
                  <p className="text-xs font-bold text-[#8C66FF] mt-0.5 underline">
                    Lihat menu yang sering dibuka
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#EBF3FF] text-[#4285F4] flex items-center justify-center">
                  <LuChartBar className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Modal */}
      {isAnalyticsModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-6 backdrop-blur-xs">
          <div className="w-full max-w-[340px] bg-white rounded-[28px] p-6 shadow-xl border border-[#F0EDFF] flex flex-col gap-4 animate-none select-none text-left">
            <div>
              <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide uppercase flex items-center gap-2">
                <LuChartBar className="text-[#8C66FF]" />
                Analitik Aktivitas
              </h3>
              <p className="text-[10px] text-[#9C98A6] font-semibold mt-1">
                Menu yang paling sering Anda kunjungi
              </p>
            </div>

            <div className="max-h-[220px] overflow-y-auto pr-1 flex flex-col gap-2.5 my-1 no-scrollbar">
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
              ) : analyticsData.length === 0 ? (
                <p className="text-xs text-[#9C98A6] font-semibold text-center py-6">
                  Belum ada aktivitas menu yang tercatat.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {analyticsData.map((item, index) => (
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

            <div className="flex gap-2.5 mt-1">
              <button
                onClick={() => setIsAnalyticsModalOpen(false)}
                className="w-full py-3.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center"
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
