import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate("/menu", { replace: true });
    }
  }, [user, navigate]);

  const handleStart = () => {
    navigate("/auth");
  };

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans select-none">
      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-8">
        
        {/* Top/Logo Section */}
        <div className="w-full flex flex-col items-center text-center mt-12">
          <div className="border-4 border-black p-4 mb-4 bg-black text-white font-mono text-3xl font-black tracking-widest uppercase">
            SI-ZAT
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Education for Sustainable Development
          </p>
        </div>

        {/* Middle/Content Section */}
        <div className="w-full flex flex-col gap-5 text-center my-auto">
          <h2 className="text-lg font-bold uppercase tracking-wide">
            Media Pembelajaran Pencemaran Lingkungan
          </h2>
          
          <div className="border border-black p-4 bg-white text-left font-mono text-xs leading-relaxed">
            <p className="mb-2 font-bold uppercase tracking-wider text-[10px] text-neutral-500">
              Aplikasi ini memuat:
            </p>
            <ul className="list-disc pl-4 space-y-1.5 text-neutral-800">
              <li>Materi Pencemaran Lingkungan</li>
              <li>Simulasi Interaktif Dampak Zat</li>
              <li>Evaluasi & Kuis Pemahaman</li>
              <li>Laporan Hasil Belajar Mandiri</li>
            </ul>
          </div>
          
          <p className="text-xs text-neutral-600 px-2">
            Pahami dampak zat pencemar di sekitar kita untuk menjaga bumi yang berkelanjutan.
          </p>
        </div>

        {/* Bottom/Action Button Section */}
        <div className="w-full mb-6">
          <button
            onClick={handleStart}
            className="w-full py-4 border border-black bg-black text-white font-bold uppercase tracking-wider text-xs active:bg-white active:text-black cursor-pointer"
          >
            Mulai Belajar
          </button>
        </div>

      </div>
    </div>
  );
}
