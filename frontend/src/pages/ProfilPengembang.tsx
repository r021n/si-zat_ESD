import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import { LuGraduationCap, LuAward } from "react-icons/lu";
import { FiArrowLeft } from "react-icons/fi";
import pengembangImg from "../assets/pengembang.jpg";
import unsLogo from "../assets/uns_logo.webp";

export default function ProfilPengembang() {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) return null;

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
                  Informasi Aplikasi
                </p>
                <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight mt-0.5">
                  Profil Pengembang
                </h1>
              </div>
            </div>
            {/* Logo UNS Card */}
            <div className="h-10 px-3 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] flex-shrink-0">
              <img
                src={unsLogo}
                alt="UNS Logo"
                className="h-6 w-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-0.5 my-2 flex flex-col gap-4 no-scrollbar">
          {/* Photo & Main Profile Card */}
          <div className="w-full bg-white rounded-[28px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col items-center text-center gap-4">
            {/* Photo Container */}
            <div className="w-32 h-32 rounded-[24px] overflow-hidden border-2 border-[#8C66FF] shadow-sm flex items-center justify-center bg-gray-100">
              <img
                src={pengembangImg}
                alt="Foto Pengembang"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h2 className="text-lg font-black text-[#2C2B30] leading-tight">
                [Nama Mahasiswa]
              </h2>
              <p className="text-xs text-[#8C66FF] font-extrabold mt-1 tracking-wider uppercase">
                [NIM Mahasiswa]
              </p>
              <p className="text-[11px] text-[#9C98A6] font-bold mt-0.5">
                Program Studi [Nama Program Studi]
              </p>
              <p className="text-[10px] text-[#9C98A6] font-medium">
                Universitas Sebelas Maret
              </p>
            </div>
          </div>

          {/* Dosen Pembimbing Card */}
          <div className="w-full bg-white rounded-[28px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F0EDFF]/50">
              <div className="w-8 h-8 rounded-lg bg-[#E6F8F6] text-[#2C8578] flex items-center justify-center">
                <LuGraduationCap className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                Dosen Pembimbing
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                  Dosen Pembimbing I
                </h4>
                <p className="text-xs font-bold text-[#2C2B30] mt-0.5">
                  [Nama Dosen Pembimbing I]
                </p>
                <p className="text-[10px] text-[#9C98A6] font-medium">
                  [NIP Dosen Pembimbing I]
                </p>
              </div>

              <div className="pt-2 border-t border-[#F0EDFF]/30">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                  Dosen Pembimbing II
                </h4>
                <p className="text-xs font-bold text-[#2C2B30] mt-0.5">
                  [Nama Dosen Pembimbing II]
                </p>
                <p className="text-[10px] text-[#9C98A6] font-medium">
                  [NIP Dosen Pembimbing II]
                </p>
              </div>
            </div>
          </div>

          {/* Application Info Card */}
          <div className="w-full bg-white rounded-[28px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F0EDFF]/50">
              <div className="w-8 h-8 rounded-lg bg-[#FFF4EB] text-[#FF9D42] flex items-center justify-center">
                <LuAward className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                Tentang SI-ZAT
              </p>
            </div>

            <p className="text-xs text-[#555555] font-medium leading-relaxed">
              SI-ZAT merupakan media pembelajaran interaktif berbasis web yang
              dikembangkan untuk mendukung pembelajaran mandiri mengenai konsep
              pencemaran lingkungan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
