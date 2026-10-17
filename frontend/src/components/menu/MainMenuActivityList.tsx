import {
  LuBookOpen,
  LuGamepad,
  LuPenTool,
  LuChartBar,
  LuSettings,
  LuUser,
  LuAward,
  LuKeyRound,
  LuMessageSquare,
} from "react-icons/lu";

interface MainMenuActivityListProps {
  isEnrolled: boolean | null;
  userIsAdmin: boolean;
  onOpenEnrollModal: () => void;
  onMenuClick: (id: string) => void;
}

export default function MainMenuActivityList({
  isEnrolled,
  userIsAdmin,
  onOpenEnrollModal,
  onMenuClick,
}: MainMenuActivityListProps) {
  const menus = [
    ...(isEnrolled || userIsAdmin
      ? [
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
            label: "Tes Hasil Belajar",
            desc: "Uji tingkat pemahaman belajarmu",
            icon: <LuPenTool className="text-xl" />,
            bgIcon: "bg-[#FFEBF0]",
            textIcon: "text-[#D95276]",
          },
          {
            id: "ruang-diskusi",
            label: "Ruang Diskusi",
            desc: "Forum diskusi & tugas siswa",
            icon: <LuMessageSquare className="text-xl" />,
            bgIcon: "bg-[#EBF3FF]",
            textIcon: "text-[#3B82F6]",
          },
          {
            id: "kuis/berpikir-sistem",
            label: "Tes Keterampilan Berpikir Sistem",
            desc: "Kumpulkan tugas & forum diskusi",
            icon: <LuAward className="text-xl" />,
            bgIcon: "bg-[#EBF3FF]",
            textIcon: "text-[#4285F4]",
          },
        ]
      : []),
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

  if (userIsAdmin) {
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
    <>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6] mt-6 mb-3">
        Modul Aktivitas
      </p>

      {isEnrolled !== null && !isEnrolled && !userIsAdmin && (
        <button
          onClick={onOpenEnrollModal}
          className="w-full bg-linear-to-br from-[#FF5E8C] to-[#D95276] text-white rounded-3xl p-4 flex items-center justify-between shadow-[0_4px_12px_rgba(219,82,118,0.15)] border border-[#FF8FAD] cursor-pointer text-left transition-none mb-3"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner bg-white/20">
              <LuKeyRound className="text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-wide">
                Enroll Sekarang
              </h3>
              <p className="text-[10px] text-white/80 font-medium mt-0.5">
                Masukkan kode untuk akses materi, tes & simulasi
              </p>
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-white opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      <div className="w-full flex flex-col gap-3">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => onMenuClick(menu.id)}
            className="w-full bg-white rounded-3xl p-4 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] cursor-pointer text-left transition-none"
          >
            <div className="flex items-center gap-4">
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
    </>
  );
}
