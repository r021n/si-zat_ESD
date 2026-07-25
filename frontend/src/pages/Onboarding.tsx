import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  LuGlobe,
  LuLeaf,
  LuGamepad,
  LuGraduationCap,
  LuBookOpen,
  LuAward,
} from "react-icons/lu";
import unsLogo from "../assets/uns_logo.webp";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleStart = () => {
    if (user) {
      navigate("/menu");
    } else {
      navigate("/auth");
    }
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsTransitioning(false);
      }, 250);
    } else {
      handleStart();
    }
  };

  const handleSkip = () => {
    handleStart();
  };

  const steps = [
    {
      title: "Pahami Lingkungan Kita",
      description:
        "Pelajari konsep pencemaran zat dan dampaknya bagi ekosistem sekitar kita untuk mewujudkan bumi yang lebih berkelanjutan.",
      icon: LuGlobe,
      iconColor: "text-[#66E0FF]", // cyan
      glowColor: "bg-[#66E0FF]/15",
      extra: (
        <div className="absolute -top-3 -right-3 bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-lg animate-float-delayed">
          <LuLeaf className="text-xl text-[#FFD066]" />
        </div>
      ),
    },
    {
      title: "Simulasi Interaktif",
      description:
        "Lakukan eksperimen virtual pencemaran air dan tanah secara langsung untuk melihat penyebaran zat secara dinamis.",
      icon: LuGamepad,
      iconColor: "text-[#FFD066]", // gold
      glowColor: "bg-[#FFD066]/15",
      extra: (
        <div className="absolute -bottom-2 -left-2 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow-lg animate-float">
          <LuLeaf className="text-xl text-[#66E0FF]" />
        </div>
      ),
    },
    {
      title: "Uji Kemampuanmu",
      description:
        "Evaluasi hasil belajarmu dengan kuis berpikir sistem serta dapatkan laporan analisis perkembangan belajarmu.",
      icon: LuGraduationCap,
      iconColor: "text-[#FF85A2]", // pink
      glowColor: "bg-[#FF85A2]/15",
      extra: (
        <>
          <div className="absolute -top-4 -left-4 bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-lg animate-float">
            <LuAward className="text-xl text-[#FF85A2]" />
          </div>
          <div className="absolute -bottom-2 -right-3 bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-lg animate-float-delayed">
            <LuBookOpen className="text-xl text-[#66E0FF]" />
          </div>
        </>
      ),
    },
  ];

  const ActiveIcon = steps[currentStep].icon;

  return (
    <div className="w-full h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2B2927] font-sans select-none overflow-hidden relative">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(4deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(8px) rotate(-4deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.15); opacity: 0.25; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 4.5s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
      `}</style>

      {/* Decorative Shapes for premium outer aesthetic */}
      <div className="absolute top-[-5%] left-[-15%] w-62.5 h-62.5 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-65"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-55 h-55 bg-[#FFEAEA] rounded-full filter blur-xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-107.5 h-screen bg-linear-to-b from-[#18113C] to-[#0A071E] flex flex-col justify-between overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.08)]">
        {/* Top Header Row (Step Indicators + Skip Button) */}
        <div className="w-full flex justify-between items-center px-6 pt-6 pb-2 z-20">
          {/* Step Indicators */}
          <div className="flex gap-2 items-center">
            {[0, 1, 2].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentStep === step ? "w-6 bg-[#FF5E8C]" : "w-2 bg-white/30"
                }`}
              />
            ))}
          </div>

          {/* UNS Logo (Standard colored card) */}
          <div className="h-9 px-3 bg-white rounded-xl flex items-center justify-center shadow-sm border border-[#F0EDFF]">
            <img
              src={unsLogo}
              alt="UNS"
              className="h-6 w-auto object-contain"
            />
          </div>

          {/* Skip Button */}
          {currentStep < 2 ? (
            <button
              onClick={handleSkip}
              className="text-xs font-extrabold text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              Skip
            </button>
          ) : (
            <div className="w-8" /> // spacing
          )}
        </div>

        {/* Top Illustration Section */}
        <div className="w-full grow flex-col items-center justify-center px-8 relative z-10">
          <div
            className={`relative w-64 h-64 flex items-center justify-center transition-all duration-300 ${
              isTransitioning ? "opacity-0 scale-90" : "opacity-100 scale-100"
            }`}
          >
            {/* Pulsing Glow Background */}
            <div
              className={`absolute w-52 h-52 rounded-full filter blur-3xl animate-pulse-glow ${steps[currentStep].glowColor}`}
            />

            {/* Orbit Circle Ring */}
            <div className="absolute w-48 h-48 rounded-full border border-dashed border-white/10 animate-spin-slow" />
            <div className="absolute w-36 h-36 rounded-full border border-white/5" />

            {/* Main Center Floating Card */}
            <div className="w-32 h-32 bg-white/5 backdrop-blur-xl rounded-4xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.3)] flex items-center justify-center animate-float relative z-10">
              <ActiveIcon
                className={`text-6xl ${steps[currentStep].iconColor}`}
              />
            </div>

            {/* Extra Floating Items */}
            {steps[currentStep].extra}
          </div>
        </div>

        {/* Bottom Content Card */}
        <div className="w-full bg-white rounded-t-[40px] px-8 pt-8 pb-8 shadow-[0_-12px_40px_rgba(0,0,0,0.15)] flex flex-col gap-6 relative z-20 min-h-80">
          {/* Text Content with Transition */}
          <div
            className={`grow flex flex-col justify-center transition-all duration-300 ${
              isTransitioning
                ? "opacity-0 translate-y-2"
                : "opacity-100 translate-y-0"
            }`}
          >
            <h1 className="text-2xl font-black text-[#2C2B30] text-center leading-tight tracking-wide">
              {steps[currentStep].title}
            </h1>
            <p className="text-xs font-semibold text-[#9C98A6] text-center mt-3.5 leading-relaxed px-1">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Action Button Section */}
          <div className="w-full">
            <button
              onClick={handleNext}
              className="w-full py-4 bg-[#FF5E8C] text-white font-extrabold uppercase tracking-widest text-xs rounded-full shadow-[0_8px_24px_rgba(255,94,140,0.35)] hover:bg-[#ff4d7e] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{currentStep === 2 ? "Mulai Belajar" : "Lanjut"}</span>
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
