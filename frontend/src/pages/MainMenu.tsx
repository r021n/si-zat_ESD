import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { LuBookOpen, LuGamepad, LuPenTool, LuChartBar, LuSettings, LuGraduationCap } from "react-icons/lu";

interface MainMenuProps {
  onNavigate?: (menu: string) => void;
}

export default function MainMenu({ onNavigate }: MainMenuProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

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
      id: "profile-report",
      label: "Profil & Report",
      desc: "Lihat progres & hasil nilaimu",
      icon: <LuChartBar className="text-xl" />,
      bgIcon: "bg-[#F0ECFF]",
      textIcon: "text-[#8C66FF]",
    },
  ];

  const isAdmin = user.status.toLowerCase() === "admin" || user.email.toLowerCase().includes("admin");
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
              <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">Selamat datang,</p>
              <h1 className="text-xl font-extrabold truncate text-[#2C2B30] leading-tight mt-0.5">Hi, {displayName}</h1>
            </div>
            {/* Search Icon placeholder matching middle mockup */}
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>

          {/* Glassmorphic Promo/Profile Card (matches Unlimited Storage card in mockup) */}
          <div className="w-full bg-gradient-to-br from-[#8C66FF] to-[#6039DF] text-white rounded-[28px] p-5 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            {/* Card Background elements */}
            <div className="absolute right-[-10%] top-[-25%] w-[130px] h-[130px] bg-white/10 rounded-full blur-md"></div>
            <div className="absolute right-[15%] bottom-[-20%] w-[90px] h-[90px] bg-white/5 rounded-full blur-sm"></div>
            <LuGraduationCap className="text-5xl opacity-15 absolute right-4 bottom-4 text-white" />

            <div>
              <p className="text-[10px] text-purple-200 uppercase tracking-widest font-extrabold">SI-ZAT Portal</p>
              <h2 className="text-lg font-black text-white leading-tight mt-1 truncate">Media Belajar Mandiri</h2>
            </div>

            <div className="mt-4 flex flex-col gap-1">
              <p className="text-[9px] text-purple-200 font-bold uppercase tracking-wide truncate">Siswa: {user.email}</p>
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
          <p className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6] mt-6 mb-3">Modul Aktivitas</p>

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
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${menu.bgIcon} ${menu.textIcon}`}>
                    {menu.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide">{menu.label}</h3>
                    <p className="text-[10px] text-[#9C98A6] font-medium mt-0.5">{menu.desc}</p>
                  </div>
                </div>

                {/* Chevron Right */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#8C66FF] opacity-50">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Section with Logout */}
        <div className="w-full mt-6 mb-2">
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-white border border-[#FFEAEA] text-[#FF5E8C] font-extrabold uppercase tracking-wider text-xs rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span>Keluar Sesi</span>
          </button>
        </div>

      </div>
    </div>
  );
}

