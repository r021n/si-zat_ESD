import { FiArrowLeft } from "react-icons/fi";
import {
  LuPenTool,
  LuLock,
  LuChartBar,
  LuSettings,
  LuKeyRound,
  LuMessageSquare,
} from "react-icons/lu";

interface AdminNavGridProps {
  userName: string;
  onBack: () => void;
  onNavigate: (path: string) => void;
  onOpenSiswaInsights: () => void;
}

export default function AdminNavGrid({
  userName,
  onBack,
  onNavigate,
  onOpenSiswaInsights,
}: AdminNavGridProps) {
  const adminMenus = [
    {
      id: "diskusi-admin",
      label: "Kelola Ruang Diskusi",
      desc: "Buat topik diskusi, nilai tugas siswa, dan pantau ranking keaktifan",
      icon: <LuMessageSquare className="text-xl" />,
      bgIcon: "bg-[#EBF3FF]",
      textIcon: "text-[#3B82F6]",
      path: "/admin/diskusi",
    },
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
    <div className="w-full flex-1 flex flex-col justify-between">
      {/* Header Section */}
      <div className="w-full flex items-center justify-between mt-2 md:mt-0 mb-6 pb-4 border-b border-[#F0EDFF]/70">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onBack}
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
              {userName}
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
                onOpenSiswaInsights();
              } else {
                onNavigate(menu.path);
              }
            }}
            className="w-full bg-white rounded-3xl p-4 md:p-6 flex items-center justify-between md:flex-col md:items-start md:justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] cursor-pointer text-left transition-colors duration-200 md:hover:border-[#8C66FF]/60 md:hover:bg-[#FAF9FF]/40 group"
          >
            <div className="flex items-center gap-4 md:flex-col md:items-start md:w-full md:gap-4">
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
  );
}
