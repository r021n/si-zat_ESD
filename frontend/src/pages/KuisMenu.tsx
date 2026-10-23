import { useEffect } from "react";
import { FiArrowLeft, FiClock, FiShield } from "react-icons/fi";
import { useAppBack } from "../hooks/useAppBack";
import { useCustomDialog } from "../components/CustomDialog";
import { useQuizSession } from "../components/quiz/useQuizSession";
import QuizLobbyView from "../components/quiz/QuizLobbyView";
import QuizActivePlayerView from "../components/quiz/QuizActivePlayerView";
import QuizScoreReviewView from "../components/quiz/QuizScoreReviewView";

export default function KuisMenu() {
  const goBack = useAppBack();
  const { showConfirm } = useCustomDialog();

  const {
    user,
    quizzes,
    activeQuiz,
    setActiveQuiz,
    activeQuizRef,
    loading,
    currentIdx,
    answers,
    submitted,
    submittedRef,
    showReview,
    setShowReview,
    submittingRes,
    elapsedTime,
    historicDuration,
    viewingHistory,
    setViewingHistory,
    historySubmissions,
    loadingHistory,
    myLatestSubmissions,
    handleSelectQuiz,
    handleSelectHistory,
    handleSelectOption,
    handleNext,
    handlePrev,
    handleSubmit,
    correct,
    total,
    score,
    answeredCount,
    emptyCount,
    violationCount,
    stopLock,
    exitImmersive,
  } = useQuizSession();

  // Handle hardware / global back button during quiz
  useEffect(() => {
    const onKuisBack = async () => {
      if (activeQuizRef.current && !submittedRef.current) {
        const confirmExit = await showConfirm(
          "Batal mengerjakan dan kembali ke daftar tes? Progres Anda saat ini akan hilang.",
          "Konfirmasi Keluar Tes",
        );
        if (confirmExit) {
          await stopLock();
          await exitImmersive();
          setActiveQuiz(null);
        }
      } else if (viewingHistory) {
        setViewingHistory(false);
      } else {
        goBack("/menu");
      }
    };

    window.addEventListener("kuisBackButton", onKuisBack);
    return () => {
      window.removeEventListener("kuisBackButton", onKuisBack);
    };
  }, [viewingHistory, setViewingHistory, goBack, showConfirm, stopLock, exitImmersive, setActiveQuiz, activeQuizRef, submittedRef]);

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-10%] w-50 h-50 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      <div className="w-full max-w-107.5 min-h-screen flex flex-col justify-between px-6 py-6 z-10">
        {/* Header Section */}
        <div>
          <div className="w-full flex justify-between items-center mt-4 mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {!activeQuiz && (
                <button
                  onClick={() => {
                    if (viewingHistory) {
                      setViewingHistory(false);
                    } else {
                      goBack("/menu");
                    }
                  }}
                  title={viewingHistory ? "Kembali ke Daftar Tes" : "Kembali ke Menu Utama"}
                  className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer transition-none shrink-0"
                >
                  <FiArrowLeft size={20} />
                </button>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold flex items-center gap-1.5">
                  {activeQuiz ? (
                    submitted ? (
                      "Hasil Tes"
                    ) : (
                      <>
                        <span>Pengerjaan Tes</span>
                        <span className="text-[#8C66FF] font-black">•</span>
                        <span className="text-[#8C66FF] flex items-center gap-1 font-black">
                          <FiShield size={11} /> Mode Terkunci
                        </span>
                      </>
                    )
                  ) : (
                    "Evaluasi Pembelajaran"
                  )}
                </p>
                <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight mt-0.5 truncate">
                  {activeQuiz
                    ? activeQuiz.title
                    : viewingHistory
                    ? "Riwayat Tes"
                    : "Daftar Tes"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!activeQuiz && !viewingHistory && (
                <button
                  onClick={() => setViewingHistory(true)}
                  title="Riwayat Pengerjaan"
                  className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer transition-none"
                >
                  <FiClock size={18} />
                </button>
              )}

              {activeQuiz && !submitted && (
                <button
                  onClick={async () => {
                    if (
                      await showConfirm(
                        "Batal mengerjakan dan kembali ke daftar tes? Progres Anda saat ini akan hilang.",
                        "Konfirmasi Keluar Tes",
                      )
                    ) {
                      await stopLock();
                      await exitImmersive();
                      setActiveQuiz(null);
                    }
                  }}
                  className="px-4 py-2.5 bg-white border border-[#FFEAEA] text-[#FF5E8C] font-extrabold text-[10px] uppercase tracking-wider rounded-full shadow-sm cursor-pointer transition-none"
                >
                  Keluar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col justify-start my-4 overflow-y-auto no-scrollbar pr-0.5">
          {!activeQuiz ? (
            <QuizLobbyView
              viewingHistory={viewingHistory}
              loading={loading}
              loadingHistory={loadingHistory}
              quizzes={quizzes}
              historySubmissions={historySubmissions}
              myLatestSubmissions={myLatestSubmissions}
              onSelectQuiz={handleSelectQuiz}
              onSelectHistory={handleSelectHistory}
            />
          ) : submittingRes ? (
            <div className="w-full py-16 flex flex-col justify-center items-center gap-4 text-center">
              <div className="w-8 h-8 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#9C98A6]">
                Mengirimkan Jawaban...
              </p>
            </div>
          ) : !submitted ? (
            <QuizActivePlayerView
              quiz={activeQuiz}
              currentIdx={currentIdx}
              answers={answers}
              elapsedTime={elapsedTime}
              violationCount={violationCount}
              onSelectOption={handleSelectOption}
              onNext={handleNext}
              onPrev={handlePrev}
              onSubmit={handleSubmit}
            />
          ) : (
            <QuizScoreReviewView
              quiz={activeQuiz}
              answers={answers}
              score={score}
              correct={correct}
              total={total}
              answeredCount={answeredCount}
              emptyCount={emptyCount}
              duration={historicDuration !== null ? historicDuration : elapsedTime}
              showReview={showReview}
              onSetShowReview={setShowReview}
              onBackToLobby={() => setActiveQuiz(null)}
              viewingHistory={viewingHistory}
              onRetake={() => handleSelectQuiz(activeQuiz)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
