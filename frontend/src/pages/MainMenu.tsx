import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  LuBookOpen,
  LuGamepad,
  LuPenTool,
  LuChartBar,
  LuSettings,
  LuGraduationCap,
  LuUser,
  LuAward,
} from "react-icons/lu";
import unsLogo from "../assets/uns_logo.webp";

interface MainMenuProps {
  onNavigate?: (menu: string) => void;
}

export default function MainMenu({ onNavigate }: MainMenuProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [statsDetailModal, setStatsDetailModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleMenuClick = (menuId: string) => {
    if (onNavigate) {
      onNavigate(menuId);
    } else {
      navigate(`/${menuId}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const formatAbbreviatedTime = (seconds?: number) => {
    if (!seconds || seconds <= 0) return "0 detik";
    if (seconds < 60) return `${seconds} detik`;
    if (seconds < 3600) {
      const minutes = seconds / 60;
      const formatted = minutes.toFixed(1).replace(".", ",");
      return `${formatted.endsWith(",0") ? Math.round(minutes) : formatted} menit`;
    }
    const hours = seconds / 3600;
    const formatted = hours.toFixed(1).replace(".", ",");
    return `${formatted.endsWith(",0") ? Math.round(hours) : formatted} jam`;
  };

  const formatFullUsageTime = (seconds?: number) => {
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

  const handleOpenStatsDetail = (type: "openCount" | "usageTime") => {
    if (!user) return;
    if (type === "openCount") {
      setStatsDetailModal({
        isOpen: true,
        title: "Detail Kunjungan",
        message: `Aplikasi SiZat-ESD ini telah dibuka sebanyak ${user.openCount ?? 0} kali oleh akun Anda.`,
      });
    } else {
      setStatsDetailModal({
        isOpen: true,
        title: "Detail Lama Belajar",
        message: `Total waktu belajar Anda menggunakan media interaktif ini adalah ${formatFullUsageTime(user.totalUsageTime)}.`,
      });
    }
  };

  if (!user) return null;

  const displayName = user.nama || user.email.split("@")[0];
  const displayStatus = user.status.toUpperCase();

  const menus = [
    {
      id: "materi",
      label: "Materi",
      desc: "Pelajari konsep pencemaran lingkungan",
      icon: <LuBookOpen className="text-xl" />,
      bgIcon: "bg-[#FFF4EB]",
      textIcon: "text-[#FF9D42]",
    },
    {
      id: "simulasi",
      label: "Simulasi",
      desc: "Eksperimen interaktif dampak zat",
      icon: <LuGamepad className="text-xl" />,
      bgIcon: "bg-[#E6F8F6]",
      textIcon: "text-[#2C8578]",
    },
    {
      id: "kuis",
      label: "Kuis",
      desc: "Uji tingkat pemahaman belajarmu",
      icon: <LuPenTool className="text-xl" />,
      bgIcon: "bg-[#FFEBF0]",
      textIcon: "text-[#D95276]",
    },
    {
      id: "kuis/berpikir-sistem",
      label: "Berpikir Sistem",
      desc: "Kumpulkan tugas & forum diskusi",
      icon: <LuAward className="text-xl" />,
      bgIcon: "bg-[#EBF3FF]",
      textIcon: "text-[#4285F4]",
    },
    {
      id: "profile-report",
      label: "Profil & Report",
      desc: "Lihat progres & hasil nilaimu",
      icon: <LuChartBar className="text-xl" />,
      bgIcon: "bg-[#F0ECFF]",
      textIcon: "text-[#8C66FF]",
    },
    {
      id: "profil-pengembang",
      label: "Profil Pengembang",
      desc: "Lihat informasi profil pengembang",
      icon: <LuUser className="text-xl" />,
      bgIcon: "bg-[#FFF9E6]",
      textIcon: "text-[#FFC107]",
    },
  ];

  const isAdmin =
    user.status.toLowerCase() === "admin" ||
    user.email.toLowerCase().includes("admin");
  if (isAdmin) {
    menus.push({
      id: "admin",
      label: "Admin Panel",
      desc: "Kelola data & materi aplikasi",
      icon: <LuSettings className="text-xl" />,
      bgIcon: "bg-[#F5F5F7]",
      textIcon: "text-[#555555]",
    });
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      {/* Decorative Blur Bubble */}
      <div className="absolute top-[-10%] right-[-10%] w-[200px] h-[200px] bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-6 z-10">
        {/* Top Header Section */}
        <div>
          <div className="w-full flex justify-between items-center mt-4 mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">
                Selamat datang,
              </p>
              <h1 className="text-xl font-extrabold truncate text-[#2C2B30] leading-tight mt-0.5">
                Hi, {displayName}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Logo UNS Card */}
              <div className="h-12 px-4 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF]">
                <img
                  src={unsLogo}
                  alt="UNS Logo"
                  className="h-8 w-auto object-contain"
                />
              </div>

              {/* Logout Button (Replacing Search Icon) */}
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#FFEAEA] text-[#FF5E8C] cursor-pointer transition-none"
                title="Keluar Sesi"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Glassmorphic Promo/Profile Card (matches Unlimited Storage card in mockup) */}
          <div className="w-full bg-gradient-to-br from-[#8C66FF] to-[#6039DF] text-white rounded-[28px] p-5 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            {/* Card Background elements */}
            <div className="absolute right-[-10%] top-[-25%] w-[130px] h-[130px] bg-white/10 rounded-full blur-md"></div>
            <div className="absolute right-[15%] bottom-[-20%] w-[90px] h-[90px] bg-white/5 rounded-full blur-sm"></div>
            <LuGraduationCap className="text-5xl opacity-15 absolute right-4 bottom-4 text-white" />

            <div>
              <p className="text-[10px] text-purple-200 uppercase tracking-widest font-extrabold">
                SiZat-ESD Portal
              </p>
              <h2 className="text-lg font-black text-white leading-tight mt-1 truncate">
                Media Belajar Mandiri
              </h2>
            </div>

            <div className="mt-4 flex flex-col gap-1">
              <p className="text-[9px] text-purple-200 font-bold uppercase tracking-wide truncate">
                Siswa: {user.email}
              </p>
              <div className="flex gap-2 mt-1">
                <span className="inline-block text-[9px] px-3 py-1 bg-[#FF5E8C] text-white font-extrabold rounded-full shadow-sm">
                  {displayStatus}
                </span>
                <span className="inline-block text-[9px] px-3 py-1 bg-white/20 text-white font-extrabold rounded-full">
                  Kelas: {user.kelas}
                </span>
              </div>
            </div>
          </div>

          {/* Menus Section Title */}
          <p className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6] mt-6 mb-3">
            Modul Aktivitas
          </p>

          {/* Menu Buttons Stack (mockup third page style) */}
          <div className="w-full flex flex-col gap-3">
            {menus.map((menu) => (
              <button
                key={menu.id}
                onClick={() => handleMenuClick(menu.id)}
                className="w-full bg-white rounded-[24px] p-4 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] cursor-pointer text-left transition-none"
              >
                <div className="flex items-center gap-4">
                  {/* Rounded icon box */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${menu.bgIcon} ${menu.textIcon}`}
                  >
                    {menu.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide">
                      {menu.label}
                    </h3>
                    <p className="text-[10px] text-[#9C98A6] font-medium mt-0.5">
                      {menu.desc}
                    </p>
                  </div>
                </div>

                {/* Chevron Right */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 text-[#8C66FF] opacity-50"
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

        {/* Footer Section with Stats Report */}
        <div className="w-full mt-6 mb-2 bg-white rounded-[24px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex items-center justify-between">
          <div
            className="flex-1 flex flex-col items-center border-r border-[#F0EDFF]/70 cursor-pointer"
            onClick={() => handleOpenStatsDetail("openCount")}
          >
            <p className="text-[9px] uppercase tracking-wider text-[#9C98A6] font-bold">
              Kunjungan
            </p>
            <h4 className="text-sm font-extrabold text-[#2C2B30] mt-1 hover:text-[#8C66FF] active:text-[#8C66FF] cursor-pointer transition-none">
              {user.openCount ?? 0} Kali
            </h4>
          </div>
          <div
            className="flex-1 flex flex-col items-center cursor-pointer"
            onClick={() => handleOpenStatsDetail("usageTime")}
          >
            <p className="text-[9px] uppercase tracking-wider text-[#9C98A6] font-bold">
              Lama Belajar
            </p>
            <h4 className="text-sm font-extrabold text-[#2C2B30] mt-1 hover:text-[#8C66FF] active:text-[#8C66FF] cursor-pointer transition-none">
              {formatAbbreviatedTime(user.totalUsageTime)}
            </h4>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-6 backdrop-blur-xs">
          <div className="w-full max-w-[340px] bg-white rounded-[28px] p-6 shadow-xl border border-[#F0EDFF] flex flex-col gap-4 animate-none select-none text-left">
            <div>
              <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide uppercase">
                Keluar Sesi
              </h3>
              <p className="text-xs text-[#9C98A6] font-medium mt-2 leading-relaxed">
                Apakah Anda yakin ingin keluar dari aplikasi SiZat-ESD?
              </p>
            </div>
            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  handleLogout();
                }}
                className="flex-1 py-3 bg-[#FF5E8C] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-red-100 cursor-pointer transition-none flex items-center justify-center"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Detail Modal */}
      {statsDetailModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-6 backdrop-blur-xs">
          <div className="w-full max-w-[340px] bg-white rounded-[28px] p-6 shadow-xl border border-[#F0EDFF] flex flex-col gap-4 animate-none select-none text-left">
            <div>
              <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide uppercase">
                {statsDetailModal.title}
              </h3>
              <p className="text-xs text-[#9C98A6] font-semibold mt-3 leading-relaxed">
                {statsDetailModal.message}
              </p>
            </div>
            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() =>
                  setStatsDetailModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="flex-1 py-3 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center"
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
