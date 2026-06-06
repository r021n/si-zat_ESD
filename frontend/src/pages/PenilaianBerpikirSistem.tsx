import { useNavigate } from "react-router-dom";

export default function PenilaianBerpikirSistem() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans">
      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-8">
        
        {/* Header Section */}
        <div className="w-full flex flex-col gap-1 mt-6">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Evaluasi Pembelajaran</p>
          <h1 className="text-xl font-bold uppercase tracking-wide">Berpikir Sistem</h1>
          <div className="h-[2px] bg-black w-12 mt-2"></div>
        </div>

        {/* Menu Options Stack */}
        <div className="w-full flex flex-col gap-4 my-auto">
          <button
            onClick={() => navigate("/kuis/berpikir-sistem/tugas")}
            className="w-full py-4 px-5 border border-black bg-white text-black text-left font-medium active:bg-black active:text-white transition-none text-sm tracking-wide cursor-pointer flex flex-col gap-1"
          >
            <span className="font-bold uppercase text-xs">Pengumpulan Tugas</span>
            <span className="text-xs text-neutral-600">Unggah berkas atau ketik jawaban tugas</span>
          </button>

          <button
            onClick={() => navigate("/kuis/berpikir-sistem/diskusi")}
            className="w-full py-4 px-5 border border-black bg-white text-black text-left font-medium active:bg-black active:text-white transition-none text-sm tracking-wide cursor-pointer flex flex-col gap-1"
          >
            <span className="font-bold uppercase text-xs">Diskusi</span>
            <span className="text-xs text-neutral-600">Forum chat diskusi berpikir sistem</span>
          </button>
        </div>

        {/* Footer Section with Back Button */}
        <div className="w-full mt-8 mb-2">
          <button
            onClick={() => navigate("/kuis")}
            className="w-full py-3 border border-black bg-black text-white font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black transition-none cursor-pointer"
          >
            Kembali ke Menu Kuis
          </button>
        </div>

      </div>
    </div>
  );
}
