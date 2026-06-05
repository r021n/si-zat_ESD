import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Simulasi() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    // Clear all simulation reload flags when entering the menu
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith("refreshed-")) {
        sessionStorage.removeItem(key);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const simulationOptions = [
    { id: "air", label: "Pencemaran Air", desc: "Simulasi dampak polutan terhadap ekosistem air" },
    { id: "eutrofikasi", label: "Eutrofikasi", desc: "Simulasi akumulasi nutrisi berlebih pada badan air" },
    { id: "tanah", label: "Pencemaran Tanah", desc: "Simulasi akumulasi zat kimia berbahaya di tanah" },
    { id: "udara", label: "Pencemaran Udara", desc: "Simulasi emisi gas berbahaya dan dampaknya pada udara" },
  ];

  const handleOptionClick = (id: string) => {
    navigate(`/simulasi/${id}`);
  };

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans">
      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-8">
        
        {/* Header Section */}
        <div className="w-full flex flex-col gap-1 mt-6 mb-6">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Pilihan belajar</p>
          <h1 className="text-xl font-bold leading-tight uppercase tracking-wide">PILIHAN SIMULASI</h1>
          <p className="text-xs text-neutral-600">Pilih salah satu topik simulasi interaktif di bawah ini.</p>
        </div>

        {/* Simulation Buttons Stack */}
        <div className="w-full flex flex-col gap-4 my-auto">
          {simulationOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className="w-full py-4 px-5 border border-black bg-white text-black text-left active:bg-black active:text-white transition-colors duration-100 cursor-pointer group"
            >
              <div className="font-bold text-sm tracking-wide uppercase">{option.label}</div>
              <div className="text-[11px] text-neutral-500 group-active:text-neutral-300 mt-1 font-normal leading-relaxed">
                {option.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Navigation Back Footer */}
        <div className="w-full mt-8 mb-2">
          <button
            onClick={() => navigate("/menu")}
            className="w-full py-3 border border-black bg-black text-white font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black transition-colors duration-150 cursor-pointer"
          >
            Kembali ke Menu
          </button>
        </div>

      </div>
    </div>
  );
}
