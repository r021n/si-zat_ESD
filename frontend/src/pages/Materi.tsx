import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useAppBack } from "../hooks/useAppBack";
import {
  getMateriProgressApi,
  updateMateriProgressApi,
  resetMateriProgressApi,
} from "../api/api";
import {
  FiArrowLeft as ArrowLeftIcon,
  FiChevronLeft as ChevronLeftIcon,
  FiChevronRight as ChevronRightIcon,
  FiGrid as GridIcon,
  FiMaximize2 as Maximize2Icon,
  FiMinimize2 as Minimize2Icon,
  FiLock as LockIcon,
} from "react-icons/fi";

import {
  LOCAL_STORAGE_KEY,
  MATERI_SLIDES,
  PUZZLE_SLOTS,
  PAGE14_PUZZLE_SLOTS,
} from "../components/materi/constants";
import Page4Interactive from "../components/materi/Page4Interactive";
import Page7Interactive from "../components/materi/Page7Interactive";
import Page10Interactive from "../components/materi/Page10Interactive";
import Page14Interactive from "../components/materi/Page14Interactive";
import Page17Interactive from "../components/materi/Page17Interactive";
import MateriIndexDrawer from "../components/materi/MateriIndexDrawer";

export default function Materi() {
  const navigate = useNavigate();
  const goBack = useAppBack();
  const { user, token } = useAuthStore();
  const isInitialLoadedRef = useRef<boolean>(false);

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

  const [page14Assignments, setPage14Assignments] = useState<
    Record<string, string | null>
  >(() => {
    const saved = localStorage.getItem("sizat_materi_p14_assignments");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      "slot-menguap": null,
      "slot-mencair": null,
      "slot-menyublim": null,
      "slot-mengembun": null,
    };
  });

  const [page14Submitted, setPage14Submitted] = useState<boolean>(() => {
    const saved = localStorage.getItem("sizat_materi_p14_submitted");
    if (saved === "true") return true;
    const savedMax = localStorage.getItem(LOCAL_STORAGE_KEY);
    const maxIdx = savedMax ? parseInt(savedMax, 10) : 0;
    return maxIdx >= 13;
  });

  const [page17Selected, setPage17Selected] = useState<string | null>(() => {
    return localStorage.getItem("sizat_materi_p17_selected") || null;
  });

  const [page17Submitted, setPage17Submitted] = useState<boolean>(() => {
    const saved = localStorage.getItem("sizat_materi_p17_submitted");
    if (saved === "true") return true;
    const savedMax = localStorage.getItem(LOCAL_STORAGE_KEY);
    const maxIdx = savedMax ? parseInt(savedMax, 10) : 0;
    return maxIdx >= 17;
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

  // Fetch reading progress from backend on mount
  useEffect(() => {
    const authToken = token || localStorage.getItem("token");
    if (!authToken) {
      isInitialLoadedRef.current = true;
      return;
    }

    getMateriProgressApi(authToken)
      .then((res) => {
        if (res && res.status === "success" && res.progress) {
          const { lastPage, maxUnlockedIndex: backendMaxUnlocked } = res.progress;
          const validLastPage = Math.min(
            Math.max(0, lastPage),
            MATERI_SLIDES.length - 1
          );
          const validMaxUnlocked = Math.min(
            Math.max(0, backendMaxUnlocked, validLastPage),
            MATERI_SLIDES.length - 1
          );

          setCurrentPage(validLastPage);
          setMaxUnlockedIndex((prev) => Math.max(prev, validMaxUnlocked));
        }
      })
      .catch((err) => {
        console.error("Gagal memuat progress bacaan dari backend:", err);
      })
      .finally(() => {
        isInitialLoadedRef.current = true;
      });
  }, [token]);

  // Sync reading progress to backend when currentPage or maxUnlockedIndex changes
  useEffect(() => {
    if (!isInitialLoadedRef.current) return;
    const authToken = token || localStorage.getItem("token");
    if (!authToken) return;

    const timer = setTimeout(() => {
      updateMateriProgressApi(authToken, {
        lastPage: currentPage,
        maxUnlockedIndex,
      }).catch((err) => {
        console.error("Gagal menyimpan progress bacaan ke backend:", err);
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [currentPage, maxUnlockedIndex, token]);


  // Immediately unlock next page when landing on current page (except interactive pages requiring correct answer)
  useEffect(() => {
    if (
      currentPage >= maxUnlockedIndex &&
      currentPage < MATERI_SLIDES.length - 1
    ) {
      if (currentPage === 3 && (!page4Submitted || page4Selected !== "B")) {
        return;
      }
      const isPage7Correct = PUZZLE_SLOTS.every(
        (slot) => page7Assignments[slot.id] === slot.correctItemId,
      );
      if (currentPage === 6 && (!page7Submitted || !isPage7Correct)) {
        return;
      }
      const isPage14Correct = PAGE14_PUZZLE_SLOTS.every(
        (slot) => page14Assignments[slot.id] === slot.correctItemId,
      );
      if (currentPage === 13 && (!page14Submitted || !isPage14Correct)) {
        return;
      }
      if (currentPage === 16 && (!page17Submitted || page17Selected !== "B")) {
        return;
      }
      setMaxUnlockedIndex(currentPage + 1);
    }
  }, [
    currentPage,
    maxUnlockedIndex,
    page4Submitted,
    page4Selected,
    page7Submitted,
    page7Assignments,
    page14Submitted,
    page14Assignments,
    page17Submitted,
    page17Selected,
  ]);

  // Persist unlocked state & page-specific selections to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, maxUnlockedIndex.toString());
  }, [maxUnlockedIndex]);

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

  useEffect(() => {
    localStorage.setItem(
      "sizat_materi_p7_assignments",
      JSON.stringify(page7Assignments),
    );
  }, [page7Assignments]);

  useEffect(() => {
    if (page7Submitted) {
      localStorage.setItem("sizat_materi_p7_submitted", "true");
    } else {
      localStorage.removeItem("sizat_materi_p7_submitted");
    }
  }, [page7Submitted]);

  useEffect(() => {
    localStorage.setItem(
      "sizat_materi_p14_assignments",
      JSON.stringify(page14Assignments),
    );
  }, [page14Assignments]);

  useEffect(() => {
    if (page14Submitted) {
      localStorage.setItem("sizat_materi_p14_submitted", "true");
    } else {
      localStorage.removeItem("sizat_materi_p14_submitted");
    }
  }, [page14Submitted]);

  useEffect(() => {
    if (page17Selected) {
      localStorage.setItem("sizat_materi_p17_selected", page17Selected);
    } else {
      localStorage.removeItem("sizat_materi_p17_selected");
    }
  }, [page17Selected]);

  useEffect(() => {
    if (page17Submitted) {
      localStorage.setItem("sizat_materi_p17_submitted", "true");
    } else {
      localStorage.removeItem("sizat_materi_p17_submitted");
    }
  }, [page17Submitted]);

  const handleSubmitPage4 = () => {
    if (!page4Selected) return;
    setPage4Submitted(true);
    if (page4Selected === "B" && maxUnlockedIndex < 4) {
      setMaxUnlockedIndex(4);
    }
  };

  const handleSubmitPage7 = () => {
    const allAssigned = Object.values(page7Assignments).every(
      (v) => v !== null,
    );
    if (!allAssigned) return;
    setPage7Submitted(true);
    const isAllCorrect = PUZZLE_SLOTS.every(
      (slot) => page7Assignments[slot.id] === slot.correctItemId,
    );
    if (isAllCorrect && maxUnlockedIndex < 7) {
      setMaxUnlockedIndex(7);
    }
  };

  const handleSubmitPage14 = () => {
    const allAssigned = Object.values(page14Assignments).every(
      (v) => v !== null,
    );
    if (!allAssigned) return;
    setPage14Submitted(true);
    const isAllCorrect = PAGE14_PUZZLE_SLOTS.every(
      (slot) => page14Assignments[slot.id] === slot.correctItemId,
    );
    if (isAllCorrect && maxUnlockedIndex < 13) {
      setMaxUnlockedIndex(13);
    }
  };

  const handleSubmitPage17 = () => {
    if (!page17Selected) return;
    setPage17Submitted(true);
    if (page17Selected === "B" && maxUnlockedIndex < 17) {
      setMaxUnlockedIndex(17);
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
    page4Selected,
    page7Submitted,
    page7Assignments,
    page14Submitted,
    page14Assignments,
    page17Submitted,
    page17Selected,
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
    if (currentPage === 3) {
      if (!page4Submitted) {
        showToast("Pilih dan kirim jawaban terlebih dahulu untuk melanjutkan!");
        return;
      }
      if (page4Selected !== "B") {
        showToast(
          "Jawabanmu masih kurang tepat! Tekan 'Ulangi' dan pilih jawaban yang benar.",
        );
        return;
      }
    }
    if (currentPage === 6) {
      if (!page7Submitted) {
        showToast(
          "Hubungkan semua potongan puzzle dan kirim jawaban terlebih dahulu!",
        );
        return;
      }
      const isAllCorrect = PUZZLE_SLOTS.every(
        (slot) => page7Assignments[slot.id] === slot.correctItemId,
      );
      if (!isAllCorrect) {
        showToast(
          "Jawaban puzzle masih kurang tepat! Tekan 'Ulangi' dan perbaiki posisinya.",
        );
        return;
      }
    }
    if (currentPage === 13) {
      if (!page14Submitted) {
        showToast(
          "Hubungkan semua potongan puzzle dan kirim jawaban terlebih dahulu!",
        );
        return;
      }
      const isAllCorrect = PAGE14_PUZZLE_SLOTS.every(
        (slot) => page14Assignments[slot.id] === slot.correctItemId,
      );
      if (!isAllCorrect) {
        showToast(
          "Jawaban puzzle masih kurang tepat! Tekan 'Ulangi' dan perbaiki posisinya.",
        );
        return;
      }
    }
    if (currentPage === 16) {
      if (!page17Submitted) {
        showToast("Pilih dan kirim jawaban terlebih dahulu untuk melanjutkan!");
        return;
      }
      if (page17Selected !== "B") {
        showToast(
          "Jawabanmu masih kurang tepat! Tekan 'Ulangi' dan pilih jawaban yang benar.",
        );
        return;
      }
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
    setPage14Assignments({
      "slot-menguap": null,
      "slot-mencair": null,
      "slot-menyublim": null,
      "slot-mengembun": null,
    });
    setPage14Submitted(false);
    setPage17Selected(null);
    setPage17Submitted(false);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem("sizat_materi_p4_selected");
    localStorage.removeItem("sizat_materi_p4_submitted");
    localStorage.removeItem("sizat_materi_p7_assignments");
    localStorage.removeItem("sizat_materi_p7_submitted");
    localStorage.removeItem("sizat_materi_p14_assignments");
    localStorage.removeItem("sizat_materi_p14_submitted");
    localStorage.removeItem("sizat_materi_p17_selected");
    localStorage.removeItem("sizat_materi_p17_submitted");

    const authToken = token || localStorage.getItem("token");
    if (authToken) {
      resetMateriProgressApi(authToken).catch(() => {});
    }

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
      <div className="absolute top-[-10%] right-[-10%] w-60 h-60 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-60 h-60 bg-[#F0ECFF] rounded-full filter blur-2xl opacity-50 pointer-events-none" />

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

        {/* Stage Container */}
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
            ) : currentPage === 9 ? (
              <Page10Interactive />
            ) : currentPage === 13 ? (
              <Page14Interactive
                assignments={page14Assignments}
                setAssignments={setPage14Assignments}
                isSubmitted={page14Submitted}
                onSubmit={handleSubmitPage14}
                onReset={() => {
                  setPage14Submitted(false);
                  setPage14Assignments({
                    "slot-menguap": null,
                    "slot-mencair": null,
                    "slot-menyublim": null,
                    "slot-mengembun": null,
                  });
                }}
              />
            ) : currentPage === 16 ? (
              <Page17Interactive
                selectedOption={page17Selected}
                setSelectedOption={setPage17Selected}
                isSubmitted={page17Submitted}
                onSubmit={handleSubmitPage17}
                onReset={() => {
                  setPage17Submitted(false);
                  setPage17Selected(null);
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

        {/* Bottom Control Bar */}
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

      {/* Slide Index Drawer Modal */}
      <MateriIndexDrawer
        show={showIndexDrawer}
        onClose={() => setShowIndexDrawer(false)}
        maxUnlockedIndex={maxUnlockedIndex}
        currentPage={currentPage}
        slides={MATERI_SLIDES}
        onJumpToPage={handleJumpToPage}
        onResetProgress={handleResetProgress}
      />
    </div>
  );
}
