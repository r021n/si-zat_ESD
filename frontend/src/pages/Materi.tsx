import { useState, useEffect, useRef, type TouchEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppBack } from "../hooks/useAppBack";
import { MATERI_SLIDES } from "../components/materi/constants";
import { useMateriProgress } from "../components/materi/useMateriProgress";
import MateriHeader from "../components/materi/MateriHeader";
import MateriStage from "../components/materi/MateriStage";
import MateriBottomBar from "../components/materi/MateriBottomBar";
import MateriIndexDrawer from "../components/materi/MateriIndexDrawer";
import { FiLock as LockIcon } from "react-icons/fi";

export default function Materi() {
  const navigate = useNavigate();
  const goBack = useAppBack();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIndexDrawer, setShowIndexDrawer] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const {
    user,
    currentPage,
    maxUnlockedIndex,
    page4Selected,
    setPage4Selected,
    page4Submitted,
    setPage4Submitted,
    handleSubmitPage4,
    page7Assignments,
    setPage7Assignments,
    page7Submitted,
    setPage7Submitted,
    handleSubmitPage7,
    page14Assignments,
    setPage14Assignments,
    page14Submitted,
    setPage14Submitted,
    handleSubmitPage14,
    page17Selected,
    setPage17Selected,
    page17Submitted,
    setPage17Submitted,
    handleSubmitPage17,
    toastMessage,
    handleNext,
    handlePrev,
    handleJumpToPage,
    handleResetProgress,
  } = useMateriProgress();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

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
  }, [showIndexDrawer, handleNext, handlePrev]);

  // Touch swipe navigation
  const handleTouchStart = (e: TouchEvent) => {
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const handleTouchEnd = (e: TouchEvent) => {
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

  if (!user) return null;

  const currentSlide = MATERI_SLIDES[currentPage];
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
          isFullscreen ? "h-screen max-w-full p-3" : "max-w-115 h-screen px-4 py-4"
        } flex flex-col justify-between z-10 gap-3`}
      >
        <MateriHeader
          onBack={() => goBack("/menu")}
          onOpenIndex={() => setShowIndexDrawer(true)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        />

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
            <MateriStage
              currentPage={currentPage}
              currentSlide={currentSlide}
              page4Selected={page4Selected}
              setPage4Selected={setPage4Selected}
              page4Submitted={page4Submitted}
              onSubmitPage4={handleSubmitPage4}
              onResetPage4={() => {
                setPage4Submitted(false);
                setPage4Selected(null);
              }}
              page7Assignments={page7Assignments}
              setPage7Assignments={setPage7Assignments}
              page7Submitted={page7Submitted}
              onSubmitPage7={handleSubmitPage7}
              onResetPage7={() => {
                setPage7Submitted(false);
                setPage7Assignments({ "slot-padat": null, "slot-cair": null, "slot-gas": null });
              }}
              page14Assignments={page14Assignments}
              setPage14Assignments={setPage14Assignments}
              page14Submitted={page14Submitted}
              onSubmitPage14={handleSubmitPage14}
              onResetPage14={() => {
                setPage14Submitted(false);
                setPage14Assignments({
                  "slot-menguap": null,
                  "slot-mencair": null,
                  "slot-menyublim": null,
                  "slot-mengembun": null,
                });
              }}
              page17Selected={page17Selected}
              setPage17Selected={setPage17Selected}
              page17Submitted={page17Submitted}
              onSubmitPage17={handleSubmitPage17}
              onResetPage17={() => {
                setPage17Submitted(false);
                setPage17Selected(null);
              }}
            />
          </div>
        </div>

        <MateriBottomBar
          currentPage={currentPage}
          totalSlides={MATERI_SLIDES.length}
          isNextDisabled={isNextDisabled}
          onPrev={handlePrev}
          onNext={handleNext}
          onOpenIndex={() => setShowIndexDrawer(true)}
        />
      </div>

      {/* Slide Index Drawer Modal */}
      <MateriIndexDrawer
        show={showIndexDrawer}
        onClose={() => setShowIndexDrawer(false)}
        maxUnlockedIndex={maxUnlockedIndex}
        currentPage={currentPage}
        slides={MATERI_SLIDES}
        onJumpToPage={(index) => {
          if (handleJumpToPage(index)) {
            setShowIndexDrawer(false);
          }
        }}
        onResetProgress={() => {
          handleResetProgress();
          setShowIndexDrawer(false);
        }}
      />
    </div>
  );
}
