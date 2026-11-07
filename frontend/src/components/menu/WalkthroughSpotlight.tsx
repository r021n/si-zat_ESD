import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import {
  LuX,
  LuArrowLeft,
  LuArrowRight,
  LuCheck,
  LuUser,
  LuBookOpen,
  LuAward,
  LuSettings,
  LuChartBar,
  LuCircleHelp,
  LuGamepad,
  LuPenTool,
  LuMessageSquare,
  LuKeyRound,
} from "react-icons/lu";
import type { WalkthroughStep, WalkthroughStepId } from "../../config/walkthroughSteps";

interface WalkthroughSpotlightProps {
  isOpen: boolean;
  currentStep: number;
  steps: WalkthroughStep[];
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSelectStep: (step: number) => void;
}

const STEP_ICONS: Record<
  WalkthroughStepId,
  { icon: React.ReactNode; bg: string; text: string }
> = {
  "promo-card": {
    icon: <LuUser className="text-xl" />,
    bg: "bg-[#F0ECFF]",
    text: "text-[#8C66FF]",
  },
  "menu-enroll": {
    icon: <LuKeyRound className="text-xl" />,
    bg: "bg-[#FFEBF0]",
    text: "text-[#FF5E8C]",
  },
  "menu-materi": {
    icon: <LuBookOpen className="text-xl" />,
    bg: "bg-[#FFF4EB]",
    text: "text-[#FF9D42]",
  },
  "menu-simulasi": {
    icon: <LuGamepad className="text-xl" />,
    bg: "bg-[#E6F8F6]",
    text: "text-[#2C8578]",
  },
  "menu-kuis": {
    icon: <LuPenTool className="text-xl" />,
    bg: "bg-[#FFEBF0]",
    text: "text-[#D95276]",
  },
  "menu-ruang-diskusi": {
    icon: <LuMessageSquare className="text-xl" />,
    bg: "bg-[#EBF3FF]",
    text: "text-[#3B82F6]",
  },
  "menu-berpikir-sistem": {
    icon: <LuAward className="text-xl" />,
    bg: "bg-[#EBF3FF]",
    text: "text-[#4285F4]",
  },
  "menu-profile-report": {
    icon: <LuChartBar className="text-xl" />,
    bg: "bg-[#F0ECFF]",
    text: "text-[#8C66FF]",
  },
  "menu-profil-pengembang": {
    icon: <LuUser className="text-xl" />,
    bg: "bg-[#FFF9E6]",
    text: "text-[#FFC107]",
  },
  "menu-admin": {
    icon: <LuSettings className="text-xl" />,
    bg: "bg-[#F5F5F7]",
    text: "text-[#555555]",
  },
  "stats-footer": {
    icon: <LuChartBar className="text-xl" />,
    bg: "bg-[#E6F8F6]",
    text: "text-[#2C8578]",
  },
  "help-button": {
    icon: <LuCircleHelp className="text-xl" />,
    bg: "bg-[#F0ECFF]",
    text: "text-[#8C66FF]",
  },
};

interface SpotlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
}

export default function WalkthroughSpotlight({
  isOpen,
  currentStep,
  steps,
  onClose,
  onNext,
  onPrev,
  onSelectStep,
}: WalkthroughSpotlightProps) {
  const [targetRect, setTargetRect] = useState<SpotlightRect | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 375,
    height: typeof window !== "undefined" ? window.innerHeight : 667,
  });

  const step = steps[currentStep] || steps[0];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const iconConfig = STEP_ICONS[step?.id] || STEP_ICONS["promo-card"];

  const updateCoordinates = useCallback(() => {
    if (!isOpen || !step) {
      setTargetRect(null);
      return;
    }

    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const el = document.querySelector(step.targetSelector);
    if (!el) {
      setTargetRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = 6;
    const cornerRadius = rect.height > 60 ? 24 : 18;

    setTargetRect({
      x: Math.max(0, rect.left - padding),
      y: Math.max(0, rect.top - padding),
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      rx: cornerRadius,
    });
  }, [isOpen, step]);

  // Scroll target ke view & pantau perubahan posisi
  useLayoutEffect(() => {
    if (!isOpen || !step) return;

    const el = document.querySelector(step.targetSelector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    updateCoordinates();
    const timer1 = setTimeout(updateCoordinates, 120);
    const timer2 = setTimeout(updateCoordinates, 320);
    const timer3 = setTimeout(updateCoordinates, 520);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen, step, updateCoordinates]);

  // Listener resize & scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleWindowChange = () => {
      updateCoordinates();
    };

    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, true);

    return () => {
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
    };
  }, [isOpen, updateCoordinates]);

  if (!isOpen || steps.length === 0) return null;

  // Kalkulasi posisi Popover (di atas atau di bawah target)
  const popoverWidth = Math.min(340, windowDimensions.width - 32);
  let popoverPlacement: "top" | "bottom" | "center";
  let popoverStyle: React.CSSProperties;
  let arrowOffset = popoverWidth / 2;

  if (targetRect) {
    const targetCenterX = targetRect.x + targetRect.width / 2;
    const popoverLeft = Math.max(
      16,
      Math.min(windowDimensions.width - popoverWidth - 16, targetCenterX - popoverWidth / 2)
    );
    arrowOffset = Math.max(20, Math.min(popoverWidth - 20, targetCenterX - popoverLeft));

    const spaceBelow = windowDimensions.height - (targetRect.y + targetRect.height);
    const spaceAbove = targetRect.y;

    if (spaceBelow >= 250) {
      popoverPlacement = "bottom";
      popoverStyle = {
        top: `${targetRect.y + targetRect.height + 14}px`,
        left: `${popoverLeft}px`,
        width: `${popoverWidth}px`,
      };
    } else if (spaceAbove >= 230) {
      popoverPlacement = "top";
      popoverStyle = {
        bottom: `${windowDimensions.height - targetRect.y + 14}px`,
        left: `${popoverLeft}px`,
        width: `${popoverWidth}px`,
      };
    } else {
      // Jika ruang sempit di kedua sisi, pilih sisi yang lebih lega
      if (spaceBelow >= spaceAbove) {
        popoverPlacement = "bottom";
        popoverStyle = {
          top: `${targetRect.y + targetRect.height + 10}px`,
          left: `${popoverLeft}px`,
          width: `${popoverWidth}px`,
        };
      } else {
        popoverPlacement = "top";
        popoverStyle = {
          bottom: `${windowDimensions.height - targetRect.y + 10}px`,
          left: `${popoverLeft}px`,
          width: `${popoverWidth}px`,
        };
      }
    }
  } else {
    // Fallback: Posisi tengah layar jika elemen target tidak terdeteksi
    popoverPlacement = "center";
    popoverStyle = {
      width: `${popoverWidth}px`,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="walkthrough-title"
      className="fixed inset-0 z-50 select-none overflow-hidden"
    >
      {/* SVG Mask Spotlight Overlay */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="walkthrough-spotlight-mask">
            {/* Latar belakang putih = gelap menutupi layar */}
            <rect width="100%" height="100%" fill="white" />
            {/* Lubang hitam = spotlight transparan yang menyorot elemen */}
            {targetRect && (
              <rect
                x={targetRect.x}
                y={targetRect.y}
                width={targetRect.width}
                height={targetRect.height}
                rx={targetRect.rx}
                ry={targetRect.rx}
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>

        {/* Backdrop dengan mask lubang spotlight */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(18, 16, 26, 0.65)"
          mask="url(#walkthrough-spotlight-mask)"
        />

        {/* Garis batas spotlight beranimasi halus */}
        {targetRect && (
          <rect
            x={targetRect.x}
            y={targetRect.y}
            width={targetRect.width}
            height={targetRect.height}
            rx={targetRect.rx}
            ry={targetRect.rx}
            fill="none"
            stroke="#8C66FF"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            className="transition-all duration-300 ease-out animate-pulse"
          />
        )}
      </svg>

      {/* Popover Card Menempel ke Target */}
      <div
        style={popoverStyle}
        className="fixed z-10 bg-white rounded-3xl p-5 shadow-2xl border border-[#F0EDFF] transition-all duration-200 ease-out animate-in fade-in zoom-in-95"
      >
        {/* Panah Petunjuk (Arrow Pointer) */}
        {popoverPlacement === "bottom" && (
          <div
            style={{ left: `${arrowOffset}px` }}
            className="absolute -top-2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-[#F0EDFF] rotate-45"
          />
        )}
        {popoverPlacement === "top" && (
          <div
            style={{ left: `${arrowOffset}px` }}
            className="absolute -bottom-2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-[#F0EDFF] rotate-45"
          />
        )}

        {/* Tombol Tutup Silang (✕) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#FAF9FF] border border-[#F0EDFF] flex items-center justify-center text-[#9C98A6] hover:text-[#2C2B30] hover:bg-[#F0EDFF] transition-colors cursor-pointer"
          title="Tutup panduan"
          aria-label="Tutup panduan"
        >
          <LuX className="text-sm" />
        </button>

        {/* Header Langkah */}
        <div className="flex items-center gap-3 pr-8">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0 ${iconConfig.bg} ${iconConfig.text}`}
          >
            {iconConfig.icon}
          </div>
          <div className="text-left">
            <span className="inline-block text-[9px] font-extrabold uppercase tracking-widest text-[#8C66FF] bg-[#F0ECFF] px-2.5 py-0.5 rounded-full mb-0.5">
              {step.badge}
            </span>
            <h3
              id="walkthrough-title"
              className="text-sm font-black text-[#2C2B30] tracking-tight leading-tight"
            >
              {step.title}
            </h3>
          </div>
        </div>

        {/* Deskripsi Langkah */}
        <p className="text-xs text-[#6B6877] font-medium mt-2.5 leading-relaxed text-left">
          {step.description}
        </p>

        {/* Tip Singkat jika ada */}
        {step.tip && (
          <div className="w-full mt-2.5 px-3 py-1.5 bg-[#FAF9FF] border border-[#F0EDFF] rounded-xl text-[10px] font-semibold text-[#8C66FF] text-left">
            💡 {step.tip}
          </div>
        )}

        {/* Indikator Titik (Dots) */}
        <div className="flex items-center gap-1.5 my-3.5 justify-center">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onSelectStep(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStep ? "w-5 bg-[#8C66FF]" : "w-1.5 bg-[#E5E0F5]"
              }`}
              title={`Langkah ${idx + 1}`}
              aria-label={`Ke langkah ${idx + 1}`}
            />
          ))}
        </div>

        {/* Tombol Aksi Bawah */}
        <div className="w-full flex items-center justify-between gap-2 pt-2 border-t border-[#F0EDFF]/80">
          {isFirstStep ? (
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-bold text-[#9C98A6] hover:text-[#2C2B30] cursor-pointer transition-colors"
            >
              Lewati
            </button>
          ) : (
            <button
              onClick={onPrev}
              className="px-3 py-2 text-xs font-bold text-[#6B6877] hover:text-[#2C2B30] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <LuArrowLeft className="text-xs" />
              Kembali
            </button>
          )}

          <button
            onClick={onNext}
            className="flex-1 max-w-32 py-2 px-3 bg-linear-to-r from-[#8C66FF] to-[#744BE4] text-white text-xs font-extrabold rounded-xl shadow-sm flex items-center justify-center gap-1 cursor-pointer hover:opacity-95 active:scale-98 transition-all"
          >
            {isLastStep ? (
              <>
                <LuCheck className="text-xs" />
                Selesai
              </>
            ) : (
              <>
                Lanjut
                <LuArrowRight className="text-xs" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
