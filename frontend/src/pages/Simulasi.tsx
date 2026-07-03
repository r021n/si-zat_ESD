import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  LuGamepad,
  LuDroplets,
  LuFish,
  LuSprout,
  LuWind,
} from "react-icons/lu";
import { FiArrowLeft } from "react-icons/fi";

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
    {
      id: "air",
      label: "Pencemaran Air",
      desc: "Simulasi dampak polutan terhadap ekosistem air",
      icon: <LuDroplets className="text-xl" />,
      bgIcon: "bg-[#E6F3FF]",
      textIcon: "text-[#2F80ED]",
    },
    {
      id: "eutrofikasi",
      label: "Eutrofikasi",
      desc: "Simulasi akumulasi nutrisi berlebih pada badan air",
      icon: <LuFish className="text-xl" />,
      bgIcon: "bg-[#E6F8F6]",
      textIcon: "text-[#2C8578]",
    },
    {
      id: "tanah",
      label: "Pencemaran Tanah",
      desc: "Simulasi akumulasi zat kimia berbahaya di tanah",
      icon: <LuSprout className="text-xl" />,
      bgIcon: "bg-[#FFF4EB]",
      textIcon: "text-[#FF9D42]",
    },
    {
      id: "udara",
      label: "Pencemaran Udara",
      desc: "Simulasi emisi gas berbahaya dan dampaknya pada udara",
      icon: <LuWind className="text-xl" />,
      bgIcon: "bg-[#FFEBF0]",
      textIcon: "text-[#D95276]",
    },
  ];

  const handleOptionClick = (id: string) => {
    navigate(`/simulasi/${id}`);
  };

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      {/* Decorative Blur Bubble */}
      <div className="absolute top-[-10%] right-[-10%] w-[200px] h-[200px] bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-6 z-10">
        {/* Header Section */}
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
                  Pilihan belajar
                </p>
                <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight mt-0.5">
                  Pilihan Simulasi
                </h1>
              </div>
            </div>
            {/* Header Icon */}
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] flex-shrink-0">
              <LuGamepad className="text-xl" />
            </div>
          </div>
          <p className="text-xs text-[#9C98A6] mb-6">
            Pilih salah satu topik simulasi interaktif di bawah ini untuk
            memulai eksperimen.
          </p>
        </div>

        {/* Simulation Buttons Stack */}
        <div className="w-full flex flex-col gap-3 my-auto">
          {simulationOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className="w-full bg-white rounded-[24px] p-4 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] cursor-pointer text-left transition-none active:bg-slate-50"
            >
              <div className="flex items-center gap-4">
                {/* Rounded icon box */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${option.bgIcon} ${option.textIcon}`}
                >
                  {option.icon}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide">
                    {option.label}
                  </h3>
                  <p className="text-[10px] text-[#9C98A6] font-medium mt-0.5">
                    {option.desc}
                  </p>
                </div>
              </div>
              {/* Chevron Right */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-[#8C66FF] opacity-50 flex-shrink-0"
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
    </div>
  );
}
