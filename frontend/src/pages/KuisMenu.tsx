import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useCustomDialog } from "../components/CustomDialog";
import { useAppBack } from "../hooks/useAppBack";
import {
  getQuizzesApi,
  submitQuizAnswersApi,
  getMySubmissionsApi,
} from "../api/api";
import { FiArrowLeft, FiClock } from "react-icons/fi";
import { LuPenTool, LuChartBar } from "react-icons/lu";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswers: number[];
  images: string[];
}

interface Quiz {
  id: string;
  title: string;
  createdAt: string;
  questions: Question[];
}

const formatDurationMMSS = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const formatDurationFriendly = (seconds: number | undefined | null) => {
  if (seconds === undefined || seconds === null) return "-";
  if (seconds < 60) return `${seconds} detik`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins} menit`;
  return `${mins} menit ${secs} detik`;
};

export default function KuisMenu() {
  const goBack = useAppBack();
  const { token, user } = useAuthStore();
  const { showAlert, showConfirm } = useCustomDialog();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);

  // Quiz Player States
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [submittingRes, setSubmittingRes] = useState<boolean>(false);

  // Timer States
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [historicDuration, setHistoricDuration] = useState<number | null>(null);

  // History States
  const [viewingHistory, setViewingHistory] = useState<boolean>(false);
  const [historySubmissions, setHistorySubmissions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Timer Effect
  useEffect(() => {
    if (!activeQuiz || submitted || submittingRes) return;
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuiz, submitted, submittingRes]);

  // Fetch history submissions when viewing history
  useEffect(() => {
    if (!token || !viewingHistory) return;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const data = await getMySubmissionsApi(token);
        setHistorySubmissions(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [token, viewingHistory]);

  const handleSelectHistory = (sub: any, quiz: Quiz | undefined) => {
    if (!quiz) return;
    setActiveQuiz(quiz);
    setAnswers(sub.answers);
    setSubmitted(true);
    setShowReview(true);
    setHistoricDuration(sub.duration !== undefined ? sub.duration : null);
  };

  // Fetch quizzes on load
  useEffect(() => {
    if (!token) return;
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const data = await getQuizzesApi(token);
        setQuizzes(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [token]);

  if (!user) return null;

  const handleSelectQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentIdx(0);
    setAnswers({});
    setSubmitted(false);
    setShowReview(false);
    setElapsedTime(0);
    setHistoricDuration(null);
  };

  const handleSelectOption = (
    questionId: string,
    optIdx: number,
    isMulti: boolean,
  ) => {
    if (submitted) return;
    const current = answers[questionId] || [];

    if (isMulti) {
      const updated = current.includes(optIdx)
        ? current.filter((i) => i !== optIdx)
        : [...current, optIdx].sort();
      setAnswers({ ...answers, [questionId]: updated });
    } else {
      setAnswers({ ...answers, [questionId]: [optIdx] });
    }
  };

  const handleNext = () => {
    if (activeQuiz && currentIdx < activeQuiz.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    if (!activeQuiz || !token) return;

    // Check if all questions are answered
    const answeredCount = Object.keys(answers).filter(
      (key) => answers[key] && answers[key].length > 0,
    ).length;

    if (answeredCount < activeQuiz.questions.length) {
      const confirmSubmit = await showConfirm(
        "Anda belum menjawab semua soal. Apakah yakin ingin mengirimkan jawaban?",
      );
      if (!confirmSubmit) return;
    }

    setSubmittingRes(true);
    try {
      // Calculate Score
      let correctCount = 0;
      activeQuiz.questions.forEach((q) => {
        const userAns = answers[q.id] || [];
        const correct = q.correctAnswers;
        const isCorrect =
          userAns.length === correct.length &&
          userAns.every((v) => correct.includes(v));
        if (isCorrect) correctCount++;
      });

      const score = Math.round(
        (correctCount / activeQuiz.questions.length) * 100,
      );

      // Save submission to database
      await submitQuizAnswersApi(token, activeQuiz.id, {
        answers,
        score,
        duration: elapsedTime,
        createdAt: new Date().toLocaleString("id-ID"),
      });

      setSubmitted(true);
    } catch (err: any) {
      await showAlert(
        err.message ||
          "Gagal mengirimkan jawaban ke server. Silakan coba lagi.",
      );
    } finally {
      setSubmittingRes(false);
    }
  };

  const calculateScore = () => {
    if (!activeQuiz) return { correct: 0, total: 0, score: 0 };
    let correctCount = 0;
    activeQuiz.questions.forEach((q) => {
      const userAns = answers[q.id] || [];
      const correct = q.correctAnswers;
      const isCorrect =
        userAns.length === correct.length &&
        userAns.every((v) => correct.includes(v));
      if (isCorrect) correctCount++;
    });
    return {
      correct: correctCount,
      total: activeQuiz.questions.length,
      score: Math.round((correctCount / activeQuiz.questions.length) * 100),
    };
  };

  const { correct, total, score } = calculateScore();

  const answeredCount = Object.keys(answers).filter(
    (key) => answers[key] && answers[key].length > 0,
  ).length;
  const emptyCount = total - answeredCount;

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      {/* Decorative Blur Bubble */}
      <div className="absolute top-[-10%] right-[-10%] w-[200px] h-[200px] bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-6 z-10">
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
                  title={
                    viewingHistory
                      ? "Kembali ke Daftar Kuis"
                      : "Kembali ke Menu Utama"
                  }
                  className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer transition-none flex-shrink-0"
                >
                  <FiArrowLeft size={20} />
                </button>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">
                  {activeQuiz
                    ? submitted
                      ? "Hasil Kuis"
                      : "Pengerjaan Kuis"
                    : "Evaluasi Pembelajaran"}
                </p>
                <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight mt-0.5 truncate">
                  {activeQuiz
                    ? activeQuiz.title
                    : viewingHistory
                      ? "Riwayat Kuis"
                      : "Daftar Kuis"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
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
                        "Batal mengerjakan dan kembali ke daftar kuis? Progres Anda saat ini akan hilang.",
                      )
                    ) {
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
          {/* VIEW 1: QUIZ SELECTOR */}
          {!activeQuiz && !viewingHistory && (
            <div className="w-full flex flex-col gap-3">
              {loading ? (
                <div className="text-center py-12 bg-white rounded-[24px] border border-[#F0EDFF] shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col gap-3 justify-center items-center">
                  <div className="w-6 h-6 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C98A6]">
                    Memuat Kuis...
                  </span>
                </div>
              ) : quizzes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-[24px] border border-[#F0EDFF] shadow-[0_4px_12px_rgba(0,0,0,0.02)] text-xs text-[#9C98A6] font-bold uppercase">
                  Belum ada kuis yang tersedia.
                </div>
              ) : (
                quizzes.map((quiz) => (
                  <button
                    key={quiz.id}
                    onClick={() => handleSelectQuiz(quiz)}
                    className="w-full bg-white rounded-[24px] p-5 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] cursor-pointer text-left transition-none"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner bg-[#FFEBF0] text-[#D95276]">
                        <LuPenTool className="text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide truncate">
                          {quiz.title}
                        </h3>
                        <p className="text-[10px] text-[#9C98A6] font-semibold mt-0.5">
                          {quiz.questions.length} Soal &bull; Pilihan Ganda
                        </p>
                      </div>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5 text-[#8C66FF] opacity-50 flex-shrink-0 ml-2"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                ))
              )}
            </div>
          )}

          {/* VIEW 2: HISTORY LIST */}
          {!activeQuiz && viewingHistory && (
            <div className="w-full flex flex-col gap-3">
              {loadingHistory ? (
                <div className="text-center py-12 bg-white rounded-[24px] border border-[#F0EDFF] shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col gap-3 justify-center items-center">
                  <div className="w-6 h-6 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C98A6]">
                    Memuat Riwayat...
                  </span>
                </div>
              ) : historySubmissions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-[24px] border border-[#F0EDFF] shadow-[0_4px_12px_rgba(0,0,0,0.02)] text-xs text-[#9C98A6] font-bold uppercase">
                  Belum ada riwayat pengerjaan.
                </div>
              ) : (
                historySubmissions.map((sub) => {
                  const quiz = quizzes.find((q) => q.id === sub.quizId);
                  const title = quiz ? quiz.title : "Kuis Tidak Dikenal";
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSelectHistory(sub, quiz)}
                      disabled={!quiz}
                      className="w-full bg-white rounded-[24px] p-4 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] cursor-pointer text-left transition-none disabled:opacity-50"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner bg-[#F0ECFF] text-[#8C66FF]">
                          <LuChartBar className="text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide truncate">
                            {title}
                          </h3>
                          <p className="text-[9px] text-[#9C98A6] font-semibold mt-0.5 flex flex-wrap items-center gap-1">
                            <span>{sub.createdAt}</span>
                            {sub.duration !== undefined &&
                              sub.duration !== null && (
                                <>
                                  <span>&bull;</span>
                                  <span className="flex items-center gap-0.5 text-[#8C66FF]/80">
                                    <FiClock size={10} />
                                    {formatDurationFriendly(sub.duration)}
                                  </span>
                                </>
                              )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-[11px] font-extrabold px-3 py-1 bg-[#E6F8F6] text-[#2C8578] rounded-full">
                          {sub.score}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW 3: ACTIVE QUIZ PLAYER */}
          {activeQuiz && (
            <div className="w-full flex-1 flex flex-col justify-start">
              {submittingRes ? (
                <div className="w-full py-16 flex flex-col justify-center items-center gap-4 text-center">
                  <div className="w-8 h-8 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#9C98A6]">
                    Mengirimkan Jawaban...
                  </p>
                </div>
              ) : !submitted ? (
                // Play Mode
                (() => {
                  const currentQuestion = activeQuiz.questions[currentIdx];
                  const userAnswers = answers[currentQuestion.id] || [];
                  const isMulti = currentQuestion.correctAnswers.length > 1;

                  return (
                    <div className="w-full flex flex-col gap-4">
                      <div className="flex justify-between items-center text-[10px] font-extrabold text-[#9C98A6] uppercase tracking-wide px-1">
                        <span>
                          Soal {currentIdx + 1} dari{" "}
                          {activeQuiz.questions.length}
                        </span>
                        <div className="flex items-center gap-1 text-[#8C66FF] font-black">
                          <FiClock size={12} />
                          <span>{formatDurationMMSS(elapsedTime)}</span>
                        </div>
                        <span>
                          Terjawab:{" "}
                          {
                            Object.keys(answers).filter(
                              (k) => answers[k] && answers[k].length > 0,
                            ).length
                          }
                        </span>
                      </div>

                      {/* Question Text */}
                      <div className="w-full bg-white rounded-[24px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-3">
                        {currentQuestion.images &&
                          currentQuestion.images.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center mb-1">
                              {currentQuestion.images.map((img, imgIdx) => (
                                <img
                                  key={imgIdx}
                                  src={img}
                                  alt={`Ilustrasi Soal ${imgIdx + 1}`}
                                  className="max-h-[140px] max-w-full object-contain rounded-xl border border-[#F0EDFF]"
                                />
                              ))}
                            </div>
                          )}
                        <p className="text-xs font-extrabold text-[#2C2B30] leading-relaxed">
                          {currentQuestion.text}
                        </p>
                        {isMulti && (
                          <span className="text-[9px] font-extrabold tracking-wider text-[#9C98A6] uppercase">
                            (Pilih semua opsi yang benar)
                          </span>
                        )}
                      </div>

                      {/* Options */}
                      <div className="flex flex-col gap-3">
                        {currentQuestion.options.map((opt, optIdx) => {
                          const optionLetter = String.fromCharCode(65 + optIdx);
                          const isSelected = userAnswers.includes(optIdx);

                          return (
                            <button
                              key={optIdx}
                              onClick={() =>
                                handleSelectOption(
                                  currentQuestion.id,
                                  optIdx,
                                  isMulti,
                                )
                              }
                              className={`w-full p-4 rounded-[20px] border text-left text-xs font-semibold cursor-pointer flex gap-4 items-center transition-none shadow-[0_2px_8px_rgba(0,0,0,0.01)] ${
                                isSelected
                                  ? "bg-[#8C66FF] text-white border-[#8C66FF]"
                                  : "bg-white text-[#2C2B30] border-[#F0EDFF]"
                              }`}
                            >
                              <span
                                className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs border ${
                                  isSelected
                                    ? "bg-white/20 border-white/30 text-white"
                                    : "bg-[#FAF9FF] border-[#F0EDFF] text-[#8C66FF]"
                                }`}
                              >
                                {optionLetter}
                              </span>
                              <span className="leading-tight flex-1 font-extrabold">
                                {opt}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Navigation Controls */}
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={handlePrev}
                          disabled={currentIdx === 0}
                          className="flex-1 py-3.5 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Sebelumnya
                        </button>

                        {currentIdx < activeQuiz.questions.length - 1 ? (
                          <button
                            onClick={handleNext}
                            className="flex-1 py-3.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center"
                          >
                            Selanjutnya
                          </button>
                        ) : (
                          <button
                            onClick={handleSubmit}
                            className="flex-1 py-3.5 bg-[#FF5E8C] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-red-100 cursor-pointer transition-none flex items-center justify-center"
                          >
                            Kirim Jawaban
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                // Score Results & Review Modes
                <div className="w-full">
                  {!showReview ? (
                    <div className="w-full bg-white rounded-[28px] p-6 shadow-md border border-[#F0EDFF] text-center flex flex-col gap-5">
                      <div>
                        <p className="text-[10px] font-extrabold uppercase text-[#9C98A6] tracking-wider">
                          Hasil Kuis
                        </p>
                        <div className="text-6xl font-black tracking-tight text-[#8C66FF] my-4">
                          {score}
                        </div>
                        <p className="text-xs text-[#9C98A6] font-semibold leading-relaxed">
                          Anda menjawab dengan benar{" "}
                          <strong className="text-[#2C2B30] font-bold">
                            {correct}
                          </strong>{" "}
                          dari{" "}
                          <strong className="text-[#2C2B30] font-bold">
                            {total}
                          </strong>{" "}
                          soal.
                        </p>
                        <p className="text-[11px] text-[#9C98A6] font-semibold mt-2 flex items-center justify-center gap-3">
                          <span>
                            Terjawab:{" "}
                            <strong className="text-[#2C8578] font-extrabold">
                              {answeredCount}
                            </strong>
                          </span>
                          <span className="text-[#F0EDFF]">&bull;</span>
                          <span>
                            Kosong:{" "}
                            <strong className="text-[#FF5E8C] font-extrabold">
                              {emptyCount}
                            </strong>
                          </span>
                        </p>
                        <p className="text-xs text-[#9C98A6] font-semibold mt-2 flex items-center justify-center gap-1.5">
                          <FiClock size={12} className="text-[#8C66FF]" />
                          <span>
                            Durasi Pengerjaan:{" "}
                            <strong className="text-[#8C66FF] font-extrabold">
                              {formatDurationFriendly(
                                historicDuration !== null
                                  ? historicDuration
                                  : elapsedTime,
                              )}
                            </strong>
                          </span>
                        </p>
                      </div>
                      <div className="h-[1px] bg-[#F0EDFF] w-full"></div>
                      <div className="flex flex-col gap-2.5">
                        <button
                          onClick={() => setShowReview(true)}
                          className="w-full py-3.5 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center"
                        >
                          Tinjau Jawaban
                        </button>
                        <button
                          onClick={() => setActiveQuiz(null)}
                          className="w-full py-3.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center"
                        >
                          Kembali ke Daftar Kuis
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Review Details Mode
                    <div className="w-full bg-white rounded-[28px] p-5 shadow-md border border-[#F0EDFF] flex flex-col gap-4">
                      <div className="flex justify-between items-center pb-2 border-b border-[#F0EDFF]">
                        <span className="text-[10px] font-extrabold text-[#9C98A6] uppercase tracking-wider">
                          Review Jawaban
                        </span>
                        <button
                          onClick={() => {
                            if (viewingHistory) {
                              setActiveQuiz(null);
                              setShowReview(false);
                            } else {
                              setShowReview(false);
                            }
                          }}
                          className="text-xs font-extrabold text-[#8C66FF] cursor-pointer"
                        >
                          Kembali
                        </button>
                      </div>

                      {/* Summary Info */}
                      <div className="bg-[#FAF9FF] p-3.5 rounded-2xl border border-[#F0EDFF]/50 flex flex-col gap-1.5 text-[10px] font-semibold text-[#9C98A6]">
                        <div className="flex justify-between items-center">
                          <span>Durasi Pengerjaan:</span>
                          <span className="font-black text-[#8C66FF]">
                            {formatDurationFriendly(
                              historicDuration !== null
                                ? historicDuration
                                : elapsedTime,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Soal Terjawab / Kosong:</span>
                          <span>
                            <strong className="text-[#2C8578] font-black">
                              {answeredCount}
                            </strong>
                            <span className="mx-1.5 text-[#D0CDE0]">/</span>
                            <strong className="text-[#FF5E8C] font-black">
                              {emptyCount}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="max-h-[380px] overflow-y-auto space-y-4 pr-1 no-scrollbar">
                        {activeQuiz.questions.map((q, idx) => {
                          const userAns = answers[q.id] || [];
                          const correctAns = q.correctAnswers;
                          const isCorrect =
                            userAns.length === correctAns.length &&
                            userAns.every((v) => correctAns.includes(v));

                          const userAnsText =
                            userAns.length > 0
                              ? userAns
                                  .map((i) => String.fromCharCode(65 + i))
                                  .join(", ")
                              : "Tidak dijawab";

                          const correctAnsText = correctAns
                            .map((i) => String.fromCharCode(65 + i))
                            .join(", ");

                          return (
                            <div
                              key={q.id}
                              className={`pt-4 ${idx === 0 ? "pt-0" : "border-t border-[#FAF9FF]"}`}
                            >
                              {q.images && q.images.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {q.images.map((img, imgIdx) => (
                                    <img
                                      key={imgIdx}
                                      src={img}
                                      alt="Ilustrasi"
                                      className="max-h-[80px] object-contain rounded-lg border border-[#F0EDFF]"
                                    />
                                  ))}
                                </div>
                              )}
                              <p className="text-xs font-extrabold text-[#2C2B30] mb-2 leading-relaxed">
                                {idx + 1}. {q.text}
                              </p>
                              <div className="text-[10px] font-semibold space-y-1.5 bg-[#FAF9FF] p-3 rounded-2xl">
                                <p className="flex justify-between items-center">
                                  <span className="text-[#9C98A6]">
                                    Jawaban Anda:
                                  </span>
                                  <span
                                    className={`font-black ${isCorrect ? "text-[#2C8578]" : "text-[#FF5E8C]"}`}
                                  >
                                    {userAnsText}
                                  </span>
                                </p>
                                <p className="flex justify-between items-center">
                                  <span className="text-[#9C98A6]">
                                    Jawaban Benar:
                                  </span>
                                  <span className="font-black text-[#8C66FF]">
                                    {correctAnsText}
                                  </span>
                                </p>
                                <p className="flex justify-between items-center pt-1 border-t border-[#F0EDFF]/50 text-[9px] font-extrabold uppercase tracking-wider">
                                  <span>Status:</span>
                                  <span
                                    className={
                                      isCorrect
                                        ? "text-[#2C8578]"
                                        : "text-[#FF5E8C]"
                                    }
                                  >
                                    {isCorrect ? "BENAR [✓]" : "SALAH [✗]"}
                                  </span>
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => {
                          setActiveQuiz(null);
                          setShowReview(false);
                        }}
                        className="w-full py-3.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center"
                      >
                        Kembali ke Menu Kuis
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
