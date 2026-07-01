import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { LuFileText, LuMessageSquare } from "react-icons/lu";

export default function PenilaianBerpikirSistem() {
  const navigate = useNavigate();

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
              <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">Evaluasi Pembelajaran</p>
              <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight mt-0.5">Berpikir Sistem</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Back Button */}
              <button
                onClick={() => navigate("/menu")}
                className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer transition-none"
                title="Kembali ke Menu Utama"
              >
                <FiArrowLeft size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Menu Options Stack */}
        <div className="w-full flex flex-col gap-3 my-auto">
          <button
            onClick={() => navigate("/kuis/berpikir-sistem/tugas")}
            className="w-full bg-white rounded-[24px] p-5 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] cursor-pointer text-left transition-none"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner bg-[#E6F8F6] text-[#2C8578]">
                <LuFileText className="text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide">Pengumpulan Tugas</h3>
                <p className="text-[10px] text-[#9C98A6] font-semibold mt-0.5">
                  Unggah berkas atau ketik jawaban tugas Anda
                </p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#8C66FF] opacity-50 flex-shrink-0 ml-2">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            onClick={() => navigate("/kuis/berpikir-sistem/diskusi")}
            className="w-full bg-white rounded-[24px] p-5 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] cursor-pointer text-left transition-none"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner bg-[#FFEBF0] text-[#D95276]">
                <LuMessageSquare className="text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide">Diskusi</h3>
                <p className="text-[10px] text-[#9C98A6] font-semibold mt-0.5">
                  Forum chat diskusi berpikir sistem bersama teman
                </p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#8C66FF] opacity-50 flex-shrink-0 ml-2">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Footer Section with Back Button */}
        <div className="w-full mt-6 mb-2">
          <button
            onClick={() => navigate("/menu")}
            className="w-full py-3.5 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center gap-1.5"
          >
            <FiArrowLeft /> Kembali ke Menu Utama
          </button>
        </div>

      </div>
    </div>
  );
}
