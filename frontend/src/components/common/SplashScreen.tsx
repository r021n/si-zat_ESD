import React, { useState, useEffect } from "react";
import unsLogo from "../../assets/uns_logo.webp";
import { APP_INFO } from "../../config/appInfo";

interface SplashScreenProps {
  isFading?: boolean;
  isInitializing?: boolean;
  onSkip?: () => void;
}

export default function SplashScreen({
  isFading = false,
  isInitializing = false,
  onSkip,
}: SplashScreenProps): React.JSX.Element {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(100);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <aside
      aria-label="Layar pembuka SiZat-ESD"
      role={!isInitializing && onSkip ? "button" : undefined}
      tabIndex={!isInitializing && onSkip ? 0 : -1}
      onClick={!isInitializing && onSkip ? onSkip : undefined}
      onKeyDown={(e) => {
        if (!isInitializing && onSkip && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSkip();
        }
      }}
      className={`fixed inset-0 z-50 flex justify-center items-center select-none overflow-hidden bg-[#FAF9FF] transition-opacity duration-300 ease-out ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      } ${!isInitializing && onSkip ? "cursor-pointer" : ""}`}
    >
      <div className="w-full max-w-107.5 min-h-screen h-full flex flex-col justify-between items-center px-6 py-10 text-center relative z-10">
        {/* Top: Academic Seal & Institution Attribution */}
        <header className="flex flex-col items-center gap-2 pt-2">
          <img
            src={unsLogo}
            alt="Logo Universitas Sebelas Maret"
            className="h-12 w-auto object-contain"
          />
          <div className="leading-tight">
            <p className="text-xs font-bold text-[#1F2937]">
              {APP_INFO.institution}
            </p>
            <p className="text-[11px] font-medium text-[#6B7280] mt-0.5">
              Program Pascasarjana • {APP_INFO.faculty}
            </p>
          </div>
        </header>

        {/* Center: Educational Presentation Card */}
        <main className="w-full flex flex-col items-center my-auto py-4">
          <div className="w-full bg-white rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(140,102,255,0.06)] border border-[#ECE8FF] text-center">
            {/* Context Badge */}
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-[#6039DF] bg-[#F5F3FF]">
              Media Pembelajaran Interaktif IPA
            </span>

            {/* App Wordmark */}
            <h1 className="text-2xl sm:text-3xl font-black text-[#1F2937] tracking-normal mt-3">
              {APP_INFO.name}
            </h1>

            {/* Tagline & ESD Subtitle */}
            <p className="text-sm font-semibold text-[#4B5563] mt-1">
              {APP_INFO.tagline}
            </p>
            <p className="text-xs font-medium text-[#6B7280] mt-0.5">
              {APP_INFO.badge}
            </p>

            {/* Subtle Hairline Divider */}
            <div className="h-px bg-[#F3F0FF] my-4" aria-hidden="true" />

            {/* Concise Mission / Description */}
            <p className="text-xs sm:text-[13px] text-[#4B5563] leading-relaxed font-normal text-balance">
              {APP_INFO.description}
            </p>

            {/* Curricular Focus Pillars (Clean Semantic Chips) */}
            <div
              className="mt-5 flex flex-wrap justify-center gap-1.5 sm:gap-2"
              aria-label="Cakupan Materi Pembelajaran"
            >
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EFF6FF] text-[#1D4ED8]">
                Pencemaran Air
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F0FDF4] text-[#15803D]">
                Pencemaran Udara
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#FEFCE8] text-[#854D0E]">
                Pencemaran Tanah
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F5F3FF] text-[#6D28D9]">
                Berpikir Sistem
              </span>
            </div>
          </div>
        </main>

        {/* Bottom: Solid Brand Loading Progress & Version */}
        <footer className="w-full flex flex-col items-center pb-2">
          {/* Progress bar in solid brand purple */}
          <div className="w-44 h-1.5 bg-[#EDE9FE] rounded-full overflow-hidden mb-2.5">
            <div
              className="h-full bg-[#8C66FF] rounded-full transition-all duration-[2100ms] ease-out"
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            />
          </div>

          {isInitializing ? (
            <p className="text-xs text-[#6B7280] font-medium">
              Menyiapkan materi pembelajaran...
            </p>
          ) : (
            <p className="text-xs text-[#6039DF] font-semibold">
              Ketuk layar untuk mulai →
            </p>
          )}

          <p className="text-[11px] text-[#9CA3AF] mt-2 font-normal">
            v{APP_INFO.version} • Pendidikan untuk Pembangunan Berkelanjutan
          </p>
        </footer>
      </div>
    </aside>
  );
}
