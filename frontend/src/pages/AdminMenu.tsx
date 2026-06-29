import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { LuPenTool, LuBookOpen, LuLock } from "react-icons/lu";

export default function AdminMenu() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const isAdmin = user.status.toLowerCase() === "admin" || user.email.toLowerCase().includes("admin");
    if (!isAdmin) {
      navigate("/menu");
    }
  }, [user, navigate]);

  if (!user) return null;

  const adminMenus = [
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
      id: "materi",
      label: "Kelola Materi",
      desc: "Kelola materi pembelajaran (tambah, edit, dan hapus)",
      icon: <LuBookOpen className="text-xl" />,
      bgIcon: "bg-[#FFF4EB]",
      textIcon: "text-[#FF9D42]",
      path: "/materi",
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
  ];

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      {/* Decorative Blur Bubble */}
      <div className="absolute top-[-10%] right-[-10%] w-[200px] h-[200px] bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-6 z-10">
        
        {/* Header Section */}
        <div className="w-full flex flex-col gap-1 mt-6">
          <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">Panel Administrator</p>
          <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight">Menu Admin</h1>
        </div>

        {/* Menu Options Stack */}
        <div className="w-full flex flex-col gap-3 my-auto">
          {adminMenus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => navigate(menu.path)}
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

        {/* Footer Section with Back Button */}
        <div className="w-full mt-6 mb-2">
          <button
            onClick={() => navigate("/menu")}
            className="w-full py-4 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-xs rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>Kembali ke Menu Utama</span>
          </button>
        </div>

      </div>
    </div>
  );
}

