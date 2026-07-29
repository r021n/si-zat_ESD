import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useAppBack } from "../hooks/useAppBack";
import {
  FiArrowLeft as ArrowLeftIcon,
  FiChevronLeft as ChevronLeftIcon,
  FiChevronRight as ChevronRightIcon,
  FiGrid as GridIcon,
  FiMaximize2 as Maximize2Icon,
  FiMinimize2 as Minimize2Icon,
  FiRotateCcw as RotateCcwIcon,
  FiLock as LockIcon,
  FiCheckCircle as CheckCircleIcon,
  FiBookOpen as BookOpenIcon,
  FiCheck as CheckIcon,
  FiX as XIcon,
  FiSend as SendIcon,
} from "react-icons/fi";

interface SlideItem {
  id: number;
  type: "video" | "image";
  src: string;
}

// 34 static slides in public/materi (1.mp4, 2.mp4, 3.png ... 34.png)
const MATERI_SLIDES: SlideItem[] = Array.from({ length: 34 }, (_, i) => {
  const pageNum = i + 1;
  const isVideo = pageNum === 1 || pageNum === 2;
  const ext = isVideo ? "mp4" : "png";
  return {
    id: pageNum,
    type: isVideo ? "video" : "image",
    src:
      pageNum === 4
        ? "/materi/4_polos.png"
        : pageNum === 7
        ? "/materi/7_polos.png"
        : `/materi/${pageNum}.${ext}`,
  };
});

const LOCAL_STORAGE_KEY = "sizat_materi_max_unlocked_v2";

export default function Materi() {
  const navigate = useNavigate();
  const goBack = useAppBack();
  const { user } = useAuthStore();

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [maxUnlockedIndex, setMaxUnlockedIndex] = useState<number>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? Math.min(parseInt(saved, 10), MATERI_SLIDES.length - 1) : 0;
  });

  const [page4Selected, setPage4Selected] = useState<string | null>(() => {
    return localStorage.getItem("sizat_materi_p4_selected") || null;
  });

  const [page4Submitted, setPage4Submitted] = useState<boolean>(() => {
    const saved = localStorage.getItem("sizat_materi_p4_submitted");
    if (saved === "true") return true;
    const savedMax = localStorage.getItem(LOCAL_STORAGE_KEY);
    const maxIdx = savedMax ? parseInt(savedMax, 10) : 0;
    return maxIdx >= 4;
  });

  const [page7Assignments, setPage7Assignments] = useState<
    Record<string, string | null>
  >(() => {
    const saved = localStorage.getItem("sizat_materi_p7_assignments");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return { "slot-padat": null, "slot-cair": null, "slot-gas": null };
  });

  const [page7Submitted, setPage7Submitted] = useState<boolean>(() => {
    const saved = localStorage.getItem("sizat_materi_p7_submitted");
    if (saved === "true") return true;
    const savedMax = localStorage.getItem(LOCAL_STORAGE_KEY);
    const maxIdx = savedMax ? parseInt(savedMax, 10) : 0;
    return maxIdx >= 7;
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIndexDrawer, setShowIndexDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Immediately unlock next page when landing on current page (except page 4 & page 7 which require answering)
  useEffect(() => {
    if (
      currentPage >= maxUnlockedIndex &&
      currentPage < MATERI_SLIDES.length - 1
    ) {
      if (currentPage === 3 && !page4Submitted) {
        return;
      }
      if (currentPage === 6 && !page7Submitted) {
        return;
      }
      setMaxUnlockedIndex(currentPage + 1);
    }
  }, [currentPage, maxUnlockedIndex, page4Submitted, page7Submitted]);

  // Persist unlocked state to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, maxUnlockedIndex.toString());
  }, [maxUnlockedIndex]);

  // Persist Page 4 selection & submission
  useEffect(() => {
    if (page4Selected) {
      localStorage.setItem("sizat_materi_p4_selected", page4Selected);
    } else {
      localStorage.removeItem("sizat_materi_p4_selected");
    }
  }, [page4Selected]);

  useEffect(() => {
    if (page4Submitted) {
      localStorage.setItem("sizat_materi_p4_submitted", "true");
    } else {
      localStorage.removeItem("sizat_materi_p4_submitted");
    }
  }, [page4Submitted]);

  // Persist Page 7 assignments & submission
  useEffect(() => {
    localStorage.setItem(
      "sizat_materi_p7_assignments",
      JSON.stringify(page7Assignments)
    );
  }, [page7Assignments]);

  useEffect(() => {
    if (page7Submitted) {
      localStorage.setItem("sizat_materi_p7_submitted", "true");
    } else {
      localStorage.removeItem("sizat_materi_p7_submitted");
    }
  }, [page7Submitted]);

  const handleSubmitPage4 = () => {
    if (!page4Selected) return;
    setPage4Submitted(true);
    if (maxUnlockedIndex < 4) {
      setMaxUnlockedIndex(4);
    }
  };

  const handleSubmitPage7 = () => {
    const allAssigned = Object.values(page7Assignments).every(
      (v) => v !== null
    );
    if (!allAssigned) return;
    setPage7Submitted(true);
    if (maxUnlockedIndex < 7) {
      setMaxUnlockedIndex(7);
    }
  };

  // Autoplay video on current page
  const currentSlide = MATERI_SLIDES[currentPage];
  useEffect(() => {
    if (currentSlide.type === "video" && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentPage, currentSlide.type]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showIndexDrawer) return;
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentPage,
    maxUnlockedIndex,
    showIndexDrawer,
    page4Submitted,
    page7Submitted,
  ]);

  // Touch swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartRef.current.x - touchEndX;
    const diffY = touchStartRef.current.y - touchEndY;

    if (Math.abs(diffX) > Math.abs(diffY) * 1.2 && Math.abs(diffX) > 50) {
      if (diffX > 50) {
        handleNext();
      } else if (diffX < -50) {
        handlePrev();
      }
    }
    touchStartRef.current = null;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleNext = () => {
    if (currentPage === 3 && !page4Submitted) {
      showToast("Pilih dan kirim jawaban terlebih dahulu untuk melanjutkan!");
      return;
    }
    if (currentPage === 6 && !page7Submitted) {
      showToast(
        "Hubungkan semua potongan puzzle dan kirim jawaban terlebih dahulu!"
      );
      return;
    }
    if (currentPage < MATERI_SLIDES.length - 1) {
      if (currentPage <= maxUnlockedIndex) {
        setCurrentPage((prev) => prev + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleJumpToPage = (index: number) => {
    if (index <= maxUnlockedIndex) {
      setCurrentPage(index);
      setShowIndexDrawer(false);
    } else {
      showToast("Halaman ini belum terbuka. Selesaikan slide sebelumnya!");
    }
  };

  const handleResetProgress = () => {
    setMaxUnlockedIndex(0);
    setCurrentPage(0);
    setPage4Selected(null);
    setPage4Submitted(false);
    setPage7Assignments({
      "slot-padat": null,
      "slot-cair": null,
      "slot-gas": null,
    });
    setPage7Submitted(false);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem("sizat_materi_p4_selected");
    localStorage.removeItem("sizat_materi_p4_submitted");
    localStorage.removeItem("sizat_materi_p7_assignments");
    localStorage.removeItem("sizat_materi_p7_submitted");
    setShowIndexDrawer(false);
    showToast("Progres direset ke halaman awal.");
  };

  if (!user) return null;

  const isNextDisabled = currentPage >= MATERI_SLIDES.length - 1;

  return (
    <div
      className={`w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative ${
        isFullscreen ? "p-0" : ""
      }`}
    >
      {/* Background Decorative Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-60 h-60 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-60 h-60 bg-[#F0ECFF] rounded-full filter blur-2xl opacity-50 pointer-events-none"></div>

      {/* Main Container */}
      <div
        className={`w-full ${
          isFullscreen
            ? "h-screen max-w-full p-3"
            : "max-w-115 h-screen px-4 py-4"
        } flex flex-col justify-between z-10 gap-3`}
      >
        {/* Minimal Header */}
        <div className="w-full flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => goBack("/menu")}
              className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:scale-95 transition-all shrink-0"
              title="Kembali"
            >
              <ArrowLeftIcon size={20} />
            </button>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-[#9C98A6] font-bold">
                Pembelajaran
              </p>
              <h1 className="text-base font-extrabold text-[#2C2B30] leading-tight">
                Materi Belajar
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIndexDrawer(true)}
              className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:scale-95 transition-all shrink-0"
              title="Daftar Halaman"
            >
              <GridIcon size={18} />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:scale-95 transition-all shrink-0"
              title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            >
              {isFullscreen ? (
                <Minimize2Icon size={18} />
              ) : (
                <Maximize2Icon size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-[#2C2B30] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-purple-400/30 flex items-center gap-2 animate-fade-in">
            <LockIcon className="text-[#FF5E8C] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* High-Height Minimal Flipbook Stage */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex-1 w-full flex flex-col items-center justify-center relative select-none min-h-0"
        >
          <div className="w-full h-full rounded-3xl bg-white shadow-[0_8px_30px_rgba(140,102,255,0.08)] border border-[#F0EDFF] overflow-hidden flex items-center justify-center p-1.5 relative">
            {currentPage === 3 ? (
              <Page4Interactive
                selectedOption={page4Selected}
                setSelectedOption={setPage4Selected}
                isSubmitted={page4Submitted}
                onSubmit={handleSubmitPage4}
                onReset={() => {
                  setPage4Submitted(false);
                  setPage4Selected(null);
                }}
              />
            ) : currentPage === 6 ? (
              <Page7Interactive
                assignments={page7Assignments}
                setAssignments={setPage7Assignments}
                isSubmitted={page7Submitted}
                onSubmit={handleSubmitPage7}
                onReset={() => {
                  setPage7Submitted(false);
                  setPage7Assignments({
                    "slot-padat": null,
                    "slot-cair": null,
                    "slot-gas": null,
                  });
                }}
              />
            ) : currentSlide.type === "video" ? (
              <div className="w-full h-full flex items-center justify-center bg-black rounded-2xl overflow-hidden">
                <video
                  ref={videoRef}
                  key={currentSlide.src}
                  src={currentSlide.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white rounded-2xl overflow-hidden">
                <img
                  src={currentSlide.src}
                  alt={`Halaman ${currentPage + 1}`}
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Minimal Bottom Control Bar */}
        <div className="w-full shrink-0">
          <div className="flex items-center justify-between gap-3">
            <button
              disabled={currentPage === 0}
              onClick={handlePrev}
              className="flex-1 py-3 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-xs rounded-2xl shadow-sm disabled:opacity-30 cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <ChevronLeftIcon size={16} /> Prev
            </button>

            <button
              onClick={() => setShowIndexDrawer(true)}
              className="px-4 py-3 bg-[#F0ECFF] text-[#8C66FF] font-black text-xs rounded-2xl cursor-pointer hover:bg-purple-100 transition-all border border-[#F0EDFF]"
            >
              {currentPage + 1} / {MATERI_SLIDES.length}
            </button>

            <button
              disabled={isNextDisabled}
              onClick={handleNext}
              className="flex-1 py-3 bg-linear-to-r from-[#8C66FF] to-[#6039DF] text-white font-extrabold uppercase tracking-wider text-xs rounded-2xl shadow-md shadow-purple-200 disabled:opacity-30 cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              Next <ChevronRightIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Index Drawer */}
      {showIndexDrawer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-end sm:items-center z-50 p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-107.5 bg-white rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl border border-[#F0EDFF] flex flex-col max-h-[85vh] text-left">
            <div className="flex justify-between items-center pb-3 border-b border-[#F0EDFF]">
              <div>
                <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide uppercase">
                  Daftar Halaman Materi
                </h3>
                <p className="text-[10px] text-[#9C98A6] font-semibold mt-0.5">
                  Pilih halaman (Terbuka hingga hal. {maxUnlockedIndex + 1})
                </p>
              </div>
              <button
                onClick={() => setShowIndexDrawer(false)}
                className="w-8 h-8 rounded-full bg-[#FAF9FF] text-[#9C98A6] font-bold text-sm flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 pr-1 grid grid-cols-4 gap-2.5 no-scrollbar">
              {MATERI_SLIDES.map((slide, idx) => {
                const isUnlocked = idx <= maxUnlockedIndex;
                const isCurrent = idx === currentPage;

                return (
                  <button
                    key={slide.id}
                    onClick={() => handleJumpToPage(idx)}
                    disabled={!isUnlocked}
                    className={`aspect-square rounded-2xl border flex flex-col items-center justify-center p-1.5 relative transition-all ${
                      isCurrent
                        ? "bg-[#8C66FF] border-[#8C66FF] text-white shadow-md shadow-purple-200 scale-105"
                        : isUnlocked
                          ? "bg-[#FAF9FF] border-[#F0EDFF] text-[#2C2B30] hover:bg-purple-50 cursor-pointer"
                          : "bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span className="text-xs font-black">{idx + 1}</span>
                    <span className="text-[8px] font-bold uppercase mt-0.5">
                      {slide.type === "video" ? "Vid" : "Img"}
                    </span>

                    <div className="absolute top-1 right-1">
                      {isUnlocked ? (
                        !isCurrent && (
                          <CheckCircleIcon
                            size={10}
                            className="text-[#8C66FF]"
                          />
                        )
                      ) : (
                        <LockIcon size={10} className="text-neutral-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#F0EDFF] flex gap-2">
              <button
                onClick={handleResetProgress}
                className="flex-1 py-3 bg-[#FFEBF0] text-[#D95276] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-sm cursor-pointer flex items-center justify-center gap-1 hover:bg-red-100"
              >
                <RotateCcwIcon size={12} /> Reset Progres
              </button>
              <button
                onClick={() => setShowIndexDrawer(false)}
                className="flex-1 py-3 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer flex items-center justify-center"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface Page4InteractiveProps {
  selectedOption: string | null;
  setSelectedOption: (opt: string) => void;
  isSubmitted: boolean;
  onSubmit: () => void;
  onReset: () => void;
}

const PAGE4_OPTIONS = [
  {
    id: "A",
    text: "Air hujan tidak menempati ruang sehingga dapat masuk ke mana saja.",
  },
  {
    id: "B",
    text: "Air hujan memiliki massa, menempati ruang, dan bentuknya mengikuti tempat yang ditempatinya.",
  },
  {
    id: "C",
    text: "Air hujan berubah bentuk karena terkena sinar matahari.",
  },
  {
    id: "D",
    text: "Air hujan berubah menjadi zat baru setelah jatuh ke tanah.",
  },
];

function Page4Interactive({
  selectedOption,
  setSelectedOption,
  isSubmitted,
  onSubmit,
  onReset,
}: Page4InteractiveProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white rounded-2xl overflow-hidden">
      <div className="relative max-h-full max-w-full aspect-[9/16] flex items-center justify-center">
        <img
          src="/materi/4_polos.png"
          alt="Halaman 4"
          className="w-full h-full object-contain pointer-events-none select-none"
        />

        {/* Overlay interactive content inside the white space of 4_polos.png */}
        <div
          className="absolute flex flex-col justify-between overflow-y-auto text-left p-2.5 sm:p-3 text-[#2C2B30] z-10 custom-scrollbar"
          style={{
            top: "42.2%",
            left: "8.8%",
            width: "82.4%",
            height: "49.2%",
          }}
        >
          <div className="space-y-2">
            {/* Question title */}
            <p className="text-[11px] sm:text-xs font-bold text-[#1E293B] leading-snug">
              Menurutmu apa alasan yang tepat untuk menjawab pertanyaan Andi tersebut ?
            </p>

            {/* Options list */}
            <div className="space-y-1.5">
              {PAGE4_OPTIONS.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isCorrect = opt.id === "B";

                let cardStyle =
                  "bg-[#DDF0FF] hover:bg-[#D0E8FF] border border-[#BDE0FE] text-[#1E293B]";
                let badgeStyle = "bg-[#1E40AF] text-white";

                if (isSubmitted) {
                  if (isCorrect) {
                    cardStyle =
                      "bg-[#E6F4EA] border-2 border-[#137333] text-[#137333] font-semibold shadow-xs";
                    badgeStyle = "bg-[#137333] text-white";
                  } else if (isSelected && !isCorrect) {
                    cardStyle =
                      "bg-[#FCE8E6] border-2 border-[#C5221F] text-[#C5221F] font-semibold shadow-xs";
                    badgeStyle = "bg-[#C5221F] text-white";
                  } else {
                    cardStyle =
                      "bg-[#F1F5F9] border border-[#E2E8F0] text-[#94A3B8] opacity-70";
                    badgeStyle = "bg-[#94A3B8] text-white";
                  }
                } else if (isSelected) {
                  cardStyle =
                    "bg-[#D0E8FF] border-2 border-[#1E40AF] text-[#1E293B] font-semibold shadow-sm scale-[1.01]";
                  badgeStyle =
                    "bg-[#1E40AF] text-white ring-2 ring-[#1E40AF]/30";
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`w-full p-1.5 sm:p-2 rounded-xl flex items-center gap-2 text-left transition-all ${
                      isSubmitted
                        ? "cursor-default"
                        : "cursor-pointer active:scale-[0.99]"
                    } ${cardStyle}`}
                  >
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg font-black flex items-center justify-center text-[10px] sm:text-xs shrink-0 transition-transform ${badgeStyle}`}
                    >
                      {isSubmitted && isCorrect ? (
                        <CheckIcon size={14} />
                      ) : isSubmitted && isSelected && !isCorrect ? (
                        <XIcon size={14} />
                      ) : (
                        opt.id
                      )}
                    </div>
                    <span className="text-[9.5px] sm:text-[10.5px] leading-tight flex-1 font-medium">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Submit button (if not submitted) */}
            {!isSubmitted && (
              <div className="pt-1">
                <button
                  type="button"
                  disabled={!selectedOption}
                  onClick={onSubmit}
                  className={`w-full py-2 px-3 rounded-xl font-extrabold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    selectedOption
                      ? "bg-gradient-to-r from-[#1E40AF] to-[#2563EB] text-white cursor-pointer hover:brightness-110 active:scale-95 shadow-blue-300/50"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  <SendIcon size={13} /> Kirim Jawaban
                </button>
              </div>
            )}
          </div>

            {/* Pembahasan Card (shown after submission) */}
            {isSubmitted && (
              <div className="mt-2 bg-white border-2 border-[#1E3A8A] rounded-xl p-2.5 sm:p-3 shadow-md flex flex-col justify-between animate-fade-in shrink-0">
                <div>
                  <div className="flex items-center justify-between border-b border-blue-100 pb-1 mb-1.5">
                    <div className="flex items-center gap-1.5 text-[#1E3A8A]">
                      <BookOpenIcon size={15} className="shrink-0" />
                      <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                        Pembahasan
                      </span>
                    </div>
                    <span className="bg-[#1E3A8A] text-white font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                      Jawaban B
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-[#1E293B] font-medium leading-relaxed">
                    Air hujan merupakan salah satu contoh zat yang memiliki massa karena memiliki berat dan dipengaruhi oleh gravitasi, menempati ruang karena air membutuhkan tempat dan mengisi ruang kosong, seperti halaman rumah dan jalanan, dan dapat berubah bentuk, itulah mengapa air yang awalnya berbentuk rintikan di udara akan berubah bentuk menyerupai selokan atau halaman saat jatuh di permukaan.
                  </p>
                </div>

                <div className="pt-2 mt-1.5 border-t border-blue-50 flex justify-between items-center text-[9.5px] sm:text-[10.5px]">
                  <span
                    className={`font-bold ${
                      selectedOption === "B"
                        ? "text-emerald-700"
                        : "text-rose-600"
                    }`}
                  >
                    {selectedOption === "B"
                      ? "Benar! 🎉"
                      : `Jawabanmu (${selectedOption || "-"}) kurang tepat`}
                  </span>
                  <button
                    type="button"
                    onClick={onReset}
                    className="px-2.5 py-1 bg-[#F0ECFF] text-[#8C66FF] border border-[#DCD6F7] hover:bg-purple-100 font-extrabold rounded-lg cursor-pointer transition-all flex items-center gap-1 text-[9.5px] active:scale-95"
                  >
                    <RotateCcwIcon size={10} /> Ulangi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

interface Page7InteractiveProps {
  assignments: Record<string, string | null>;
  setAssignments: React.Dispatch<
    React.SetStateAction<Record<string, string | null>>
  >;
  isSubmitted: boolean;
  onSubmit: () => void;
  onReset: () => void;
}

const PUZZLE_ITEMS = [
  {
    id: "gas",
    image: "/materi/7_kiri_1.png",
    correctSlotId: "slot-gas",
    label: "Partikel Gas",
  },
  {
    id: "padat",
    image: "/materi/7_kiri_2.png",
    correctSlotId: "slot-padat",
    label: "Partikel Padat",
  },
  {
    id: "cair",
    image: "/materi/7_kiri_3.png",
    correctSlotId: "slot-cair",
    label: "Partikel Cair",
  },
];

const PUZZLE_SLOTS = [
  { id: "slot-padat", title: "Zat Padat", correctItemId: "padat" },
  { id: "slot-cair", title: "Zat Cair", correctItemId: "cair" },
  { id: "slot-gas", title: "Zat Gas", correctItemId: "gas" },
];

function Page7Interactive({
  assignments,
  setAssignments,
  isSubmitted,
  onSubmit,
  onReset,
}: Page7InteractiveProps) {
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);

  const assignedItemIds = Object.values(assignments).filter(
    Boolean
  ) as string[];
  const unassignedItems = PUZZLE_ITEMS.filter(
    (item) => !assignedItemIds.includes(item.id)
  );

  const handleAssign = (slotId: string, itemId: string) => {
    if (isSubmitted) return;

    setAssignments((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key] === itemId) next[key] = null;
      });
      next[slotId] = itemId;
      return next;
    });

    setSelectedLeftId(null);
  };

  const handleUnassign = (slotId: string) => {
    if (isSubmitted) return;
    setAssignments((prev) => ({ ...prev, [slotId]: null }));
  };

  const handleSlotClick = (slotId: string) => {
    if (isSubmitted) return;
    if (selectedLeftId) {
      handleAssign(slotId, selectedLeftId);
    } else if (assignments[slotId]) {
      handleUnassign(slotId);
    }
  };

  const allAssigned = Object.values(assignments).every((v) => v !== null);

  const isAllCorrect =
    isSubmitted &&
    PUZZLE_SLOTS.every((slot) => assignments[slot.id] === slot.correctItemId);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white rounded-2xl overflow-hidden">
      <div className="relative max-h-full max-w-full aspect-[9/16] flex items-center justify-center">
        <img
          src="/materi/7_polos.png"
          alt="Halaman 7"
          className="w-full h-full object-contain pointer-events-none select-none"
        />

        {/* Minimalist interactive overlay over 7_polos.png */}
        <div
          className="absolute flex flex-col justify-between overflow-y-auto text-left p-3 text-[#2C2B30] z-10 custom-scrollbar space-y-2.5"
          style={{
            top: "13%",
            left: "5%",
            width: "90%",
            height: "80%",
          }}
        >
          {/* Unassigned Pieces Pool */}
          <div className="bg-[#FAF9FF] border border-[#F0EDFF] rounded-2xl p-2 shadow-xs">
            <p className="text-[10px] sm:text-[11px] font-bold text-[#8C66FF] mb-1">
              Partikel:
            </p>

            <div className="grid grid-cols-3 gap-2 min-h-12 items-center">
              {unassignedItems.length === 0 ? (
                <div className="col-span-3 text-center py-1.5 text-[9.5px] text-emerald-600 font-semibold italic bg-emerald-50 rounded-xl border border-emerald-100">
                  Terpasang semua ✓
                </div>
              ) : (
                unassignedItems.map((item) => {
                  const isSelected = selectedLeftId === item.id;
                  return (
                    <div
                      key={item.id}
                      draggable={!isSubmitted}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("itemId", item.id);
                      }}
                      onClick={() => {
                        if (isSubmitted) return;
                        setSelectedLeftId(isSelected ? null : item.id);
                      }}
                      className={`relative bg-[#FFF0F3] border-2 rounded-xl p-1 flex items-center justify-center cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#8C66FF] ring-2 ring-[#8C66FF]/40 scale-105 shadow-md"
                          : "border-[#FFB3C1] hover:border-[#FF8FA3] hover:scale-102 shadow-xs"
                      }`}
                    >
                      <img
                        src={item.image}
                        alt={item.label}
                        className="w-full h-7 sm:h-9 object-contain pointer-events-none"
                      />
                      {/* Semi-circle tab on right edge */}
                      <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#FFF0F3] border-2 border-l-0 border-[#FFB3C1] absolute -right-1.5 top-1/2 -translate-y-1/2 z-20" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Puzzle Target Rows */}
          <div className="space-y-2 flex-1 flex flex-col justify-center">
            {PUZZLE_SLOTS.map((slot) => {
              const assignedItemId = assignments[slot.id];
              const assignedItem = PUZZLE_ITEMS.find(
                (it) => it.id === assignedItemId
              );
              const isCorrectSlot =
                isSubmitted && assignedItemId === slot.correctItemId;
              const isWrongSlot =
                isSubmitted &&
                assignedItemId !== null &&
                assignedItemId !== slot.correctItemId;

              return (
                <div
                  key={slot.id}
                  className="flex items-center gap-1.5 w-full"
                >
                  {/* Left Drop Zone Slot */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const itemId = e.dataTransfer.getData("itemId");
                      if (itemId) handleAssign(slot.id, itemId);
                    }}
                    onClick={() => handleSlotClick(slot.id)}
                    className={`flex-1 h-11 sm:h-13 rounded-2xl relative flex items-center justify-center p-1 transition-all border-2 ${
                      isSubmitted
                        ? isCorrectSlot
                          ? "bg-[#E6F4EA] border-[#137333]"
                          : isWrongSlot
                            ? "bg-[#FCE8E6] border-[#C5221F]"
                            : "bg-[#F8F9FA] border-slate-200"
                        : assignedItem
                          ? "bg-[#FFF0F3] border-[#FFB3C1] shadow-sm cursor-pointer hover:brightness-95"
                          : "bg-[#FAF9FF] border-dashed border-[#DCD6F7] cursor-pointer hover:bg-purple-50/50"
                    }`}
                  >
                    {assignedItem ? (
                      <div className="w-full h-full flex items-center justify-center relative">
                        <img
                          src={assignedItem.image}
                          alt={assignedItem.label}
                          className="w-full h-7 sm:h-9 object-contain pointer-events-none"
                        />
                        {/* Semi-circle tab sticking out right to snap into right slot cutout */}
                        <div
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-l-0 absolute -right-2.5 sm:-right-3 top-1/2 -translate-y-1/2 z-20 ${
                            isSubmitted
                              ? isCorrectSlot
                                ? "bg-[#E6F4EA] border-[#137333]"
                                : isWrongSlot
                                  ? "bg-[#FCE8E6] border-[#C5221F]"
                                  : "bg-[#FFF0F3] border-[#FFB3C1]"
                              : "bg-[#FFF0F3] border-[#FFB3C1]"
                          }`}
                        />
                      </div>
                    ) : (
                      <span className="text-[9px] sm:text-[10px] text-[#9C98A6] font-semibold text-center">
                        Tarik ke sini
                      </span>
                    )}
                  </div>

                  {/* Right Target Card ("Zat Padat" / "Zat Cair" / "Zat Gas") */}
                  <div
                    className={`w-[48%] h-11 sm:h-13 rounded-2xl relative flex items-center justify-center p-2 text-center transition-all border-2 ${
                      isSubmitted
                        ? isCorrectSlot
                          ? "bg-[#E6F4EA] border-[#137333] text-[#137333]"
                          : isWrongSlot
                            ? "bg-[#FCE8E6] border-[#C5221F] text-[#C5221F]"
                            : "bg-[#FFF0F3] border-[#FFB3C1] text-[#2C2B30]"
                        : "bg-[#FFF0F3] border-[#FFB3C1] text-[#2C2B30]"
                    }`}
                  >
                    {/* Semi-circle cutout on left edge for tab entry */}
                    <div
                      className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-r-0 absolute -left-1.5 sm:-left-2 top-1/2 -translate-y-1/2 z-10 ${
                        isSubmitted
                          ? isCorrectSlot
                            ? "bg-[#E6F4EA] border-[#137333]"
                            : isWrongSlot
                              ? "bg-[#FCE8E6] border-[#C5221F]"
                              : "bg-white border-[#FFB3C1]"
                          : "bg-white border-[#FFB3C1]"
                      }`}
                    />

                    <span className="font-extrabold text-xs sm:text-sm tracking-wide z-20">
                      {slot.title}
                    </span>

                    {/* Status Badge Icon */}
                    {isSubmitted && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {isCorrectSlot ? (
                          <CheckIcon size={15} className="text-[#137333]" />
                        ) : isWrongSlot ? (
                          <XIcon size={15} className="text-[#C5221F]" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls & Submission Result Feedback */}
          {!isSubmitted ? (
            <div className="pt-0.5">
              <button
                type="button"
                disabled={!allAssigned}
                onClick={onSubmit}
                className={`w-full py-2 px-3 rounded-xl font-extrabold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                  allAssigned
                    ? "bg-gradient-to-r from-[#8C66FF] to-[#6039DF] text-white cursor-pointer hover:brightness-110 active:scale-95 shadow-purple-200"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                <SendIcon size={13} /> Kirim Jawaban
              </button>
            </div>
          ) : (
            <div
              className={`p-2 rounded-xl border-2 shadow-xs animate-fade-in flex items-center justify-between gap-2 ${
                isAllCorrect
                  ? "bg-[#E6F4EA] border-[#137333] text-[#137333]"
                  : "bg-[#FCE8E6] border-[#C5221F] text-[#C5221F]"
              }`}
            >
              <span className="font-bold text-[10.5px] sm:text-xs pl-1">
                {isAllCorrect ? "Benar semua! 🎉" : "Ada yang kurang tepat"}
              </span>

              <button
                type="button"
                onClick={onReset}
                className={`px-3 py-1 font-extrabold text-[10px] rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-xs active:scale-95 ${
                  isAllCorrect
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-[#C5221F] text-white hover:bg-red-700"
                }`}
              >
                <RotateCcwIcon size={10} /> Ulangi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
