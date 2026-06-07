import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getQuizzesApi, submitQuizAnswersApi, getMySubmissionsApi } from "../api/api";
import { FiArrowLeft, FiClock } from "react-icons/fi";

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

export default function PenilaianHasilBelajar() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);

  // Quiz Player States
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [submittingRes, setSubmittingRes] = useState<boolean>(false);

  // History States
  const [viewingHistory, setViewingHistory] = useState<boolean>(false);
  const [historySubmissions, setHistorySubmissions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

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
  };

  const handleSelectOption = (questionId: string, optIdx: number, isMulti: boolean) => {
    if (submitted) return;
    const current = answers[questionId] || [];
    
    if (isMulti) {
      const updated = current.includes(optIdx)
        ? current.filter(i => i !== optIdx)
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
      key => answers[key] && answers[key].length > 0
    ).length;

    if (answeredCount < activeQuiz.questions.length) {
      const confirmSubmit = window.confirm(
        "Anda belum menjawab semua soal. Apakah yakin ingin mengirimkan jawaban?"
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
        const isCorrect = userAns.length === correct.length && userAns.every(v => correct.includes(v));
        if (isCorrect) correctCount++;
      });
      
      const score = Math.round((correctCount / activeQuiz.questions.length) * 100);

      // Save submission to database
      await submitQuizAnswersApi(token, activeQuiz.id, {
        answers,
        score,
        createdAt: new Date().toLocaleString("id-ID")
      });

      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || "Gagal mengirimkan jawaban ke server. Silakan coba lagi.");
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
      const isCorrect = userAns.length === correct.length && userAns.every(v => correct.includes(v));
      if (isCorrect) correctCount++;
    });
    return {
      correct: correctCount,
      total: activeQuiz.questions.length,
      score: Math.round((correctCount / activeQuiz.questions.length) * 100)
    };
  };

  const { correct, total, score } = calculateScore();

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans select-none">
      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-8">
        
        {/* VIEW 1: QUIZ SELECTOR */}
        {!activeQuiz && !viewingHistory && (
          <div className="w-full flex-1 flex flex-col justify-between">
            <div>
              {/* Header Section */}
              <div className="w-full flex justify-between items-start mt-6">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Evaluasi Pembelajaran</p>
                  <h1 className="text-xl font-bold uppercase tracking-wide">Penilaian Hasil Belajar</h1>
                  <div className="h-[2px] bg-black w-12 mt-2"></div>
                </div>
                <button
                  onClick={() => setViewingHistory(true)}
                  title="Riwayat Pengerjaan"
                  className="p-2 border border-black bg-white hover:bg-black hover:text-white cursor-pointer active:bg-black active:text-white transition-none mt-2 flex items-center justify-center"
                >
                  <FiClock size={18} />
                </button>
              </div>

              {/* Quiz List Stack */}
              <div className="w-full flex flex-col gap-4 mt-8">
                {loading ? (
                  <div className="text-center py-12 border border-black border-dashed flex flex-col gap-3 justify-center items-center">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Memuat Kuis...</span>
                  </div>
                ) : quizzes.length === 0 ? (
                  <div className="text-center py-12 border border-black border-dashed text-xs text-neutral-500 uppercase font-bold">
                    Belum ada kuis yang tersedia.
                  </div>
                ) : (
                  quizzes.map((quiz) => (
                    <button
                      key={quiz.id}
                      onClick={() => handleSelectQuiz(quiz)}
                      className="w-full py-4 px-5 border border-black bg-white text-black text-left font-medium active:bg-black active:text-white transition-none text-sm tracking-wide cursor-pointer flex flex-col gap-1"
                    >
                      <span className="font-bold uppercase text-xs">{quiz.title}</span>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold">
                        {quiz.questions.length} Soal &bull; Pilihan Ganda
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Back Button */}
            <div className="w-full mt-8 mb-2">
              <button
                onClick={() => navigate("/kuis")}
                className="w-full py-3 border border-black bg-black text-white font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FiArrowLeft /> Kembali ke Menu Kuis
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: HISTORY LIST */}
        {!activeQuiz && viewingHistory && (
          <div className="w-full flex-1 flex flex-col justify-between">
            <div>
              {/* Header Section */}
              <div className="w-full flex flex-col gap-1 mt-6">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Evaluasi Pembelajaran</p>
                <h1 className="text-xl font-bold uppercase tracking-wide">Riwayat Pengerjaan</h1>
                <div className="h-[2px] bg-black w-12 mt-2"></div>
              </div>

              {/* History Submissions List */}
              <div className="w-full flex flex-col gap-4 mt-8">
                {loadingHistory ? (
                  <div className="text-center py-12 border border-black border-dashed flex flex-col gap-3 justify-center items-center">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Memuat Riwayat...</span>
                  </div>
                ) : historySubmissions.length === 0 ? (
                  <div className="text-center py-12 border border-black border-dashed text-xs text-neutral-500 uppercase font-bold">
                    Belum ada riwayat pengerjaan.
                  </div>
                ) : (
                  <div className="max-h-[380px] overflow-y-auto space-y-3 pr-1">
                    {historySubmissions.map((sub) => {
                      const quiz = quizzes.find((q) => q.id === sub.quizId);
                      const title = quiz ? quiz.title : "Kuis Tidak Dikenal";
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleSelectHistory(sub, quiz)}
                          disabled={!quiz}
                          className="w-full py-3 px-4 border border-black bg-white text-black text-left font-medium active:bg-black active:text-white transition-none text-sm tracking-wide cursor-pointer flex flex-col gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex justify-between items-start w-full">
                            <span className="font-bold uppercase text-xs truncate max-w-[75%]">{title}</span>
                            <span className="font-mono text-xs font-bold border border-black px-1.5 py-0.5 bg-neutral-50 text-black">
                              {sub.score}
                            </span>
                          </div>
                          <div className="flex justify-between items-center w-full mt-1">
                            <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold">
                              {sub.createdAt}
                            </span>
                            {!quiz && (
                              <span className="text-[8px] text-neutral-500 uppercase font-mono">Soal Terhapus</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Back Button */}
            <div className="w-full mt-8 mb-2">
              <button
                onClick={() => setViewingHistory(false)}
                className="w-full py-3 border border-black bg-black text-white font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FiArrowLeft /> Kembali ke Daftar Kuis
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: ACTIVE QUIZ PLAYER */}
        {activeQuiz && (
          <div className="w-full flex-1 flex flex-col justify-between">
            {/* Header Section */}
            <div className="w-full flex justify-between items-center mt-4 border-b border-black pb-3">
              <div className="max-w-[70%]">
                <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">
                  {viewingHistory ? "Riwayat Pengerjaan" : "Pengerjaan Kuis"}
                </p>
                <h1 className="text-xs font-bold uppercase tracking-wide truncate">{activeQuiz.title}</h1>
              </div>
              {!submitted && (
                <button 
                  onClick={() => {
                    if (window.confirm("Batal mengerjakan dan kembali ke daftar kuis? Progres Anda saat ini akan hilang.")) {
                      setActiveQuiz(null);
                    }
                  }}
                  className="px-2.5 py-1 border border-black text-[10px] font-bold uppercase tracking-wider bg-white active:bg-black active:text-white cursor-pointer"
                >
                  Keluar
                </button>
              )}
            </div>

            {/* Main Content Area */}
            <div className="w-full flex-1 flex flex-col justify-center py-6">
              {submittingRes ? (
                <div className="w-full flex flex-col justify-center items-center gap-4 text-center">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
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
                      <div className="flex justify-between items-center text-[10px] font-bold text-neutral-500 uppercase">
                        <span>Soal {currentIdx + 1} dari {activeQuiz.questions.length}</span>
                        <span>
                          Terjawab: {Object.keys(answers).filter(k => answers[k] && answers[k].length > 0).length}
                        </span>
                      </div>

                      {/* Render Images Stack if Any */}
                      {currentQuestion.images && currentQuestion.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center mb-1">
                          {currentQuestion.images.map((img, imgIdx) => (
                            <img 
                              key={imgIdx} 
                              src={img} 
                              alt={`Ilustrasi Soal ${imgIdx + 1}`} 
                              className="max-h-[140px] max-w-full object-contain border border-black" 
                            />
                          ))}
                        </div>
                      )}

                      {/* Question Text */}
                      <p className="text-xs font-bold leading-relaxed border border-black p-3 bg-neutral-50">
                        {currentQuestion.text}
                        {isMulti && (
                          <span className="block mt-1.5 text-[9px] font-mono text-neutral-500 uppercase">
                            (Pilih semua opsi yang benar)
                          </span>
                        )}
                      </p>

                      {/* Options */}
                      <div className="flex flex-col gap-2">
                        {currentQuestion.options.map((opt, optIdx) => {
                          const optionLetter = String.fromCharCode(65 + optIdx);
                          const isSelected = userAnswers.includes(optIdx);

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(currentQuestion.id, optIdx, isMulti)}
                              className={`w-full p-2.5 border text-left text-xs font-medium cursor-pointer flex gap-3 items-start ${
                                isSelected
                                  ? "bg-black text-white border-black"
                                  : "bg-white text-black border-black hover:bg-neutral-50"
                              }`}
                            >
                              <span className="font-bold border border-current px-1.5 py-0.5 text-[9px]">
                                {optionLetter}
                              </span>
                              <span className="leading-tight flex-1">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Navigation Controls */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <button
                          onClick={handlePrev}
                          disabled={currentIdx === 0}
                          className="py-2.5 border border-black bg-white text-black text-xs font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Sebelumnya
                        </button>

                        {currentIdx < activeQuiz.questions.length - 1 ? (
                          <button
                            onClick={handleNext}
                            className="py-2.5 border border-black bg-white text-black text-xs font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Selanjutnya
                          </button>
                        ) : (
                          <button
                            onClick={handleSubmit}
                            className="py-2.5 border border-black bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black cursor-pointer"
                          >
                            Kirim Jawaban
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                // Score Results Mode
                <div className="w-full flex flex-col gap-4">
                  {!showReview ? (
                    <div className="text-center py-6 border border-black px-4 bg-neutral-50 flex flex-col gap-4">
                      <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Hasil Kuis</span>
                      <div className="text-5xl font-extrabold tracking-tight font-mono">{score}</div>
                      <div className="text-xs text-neutral-600 font-medium leading-relaxed">
                        Anda menjawab dengan benar <strong className="text-black font-extrabold">{correct}</strong> dari <strong className="text-black font-extrabold">{total}</strong> soal.
                      </div>
                      <div className="h-[1px] bg-neutral-300 w-full my-1"></div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setShowReview(true)}
                          className="w-full py-2.5 border border-black bg-white text-black text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Tinjau Jawaban
                        </button>
                        <button
                          onClick={() => setActiveQuiz(null)}
                          className="w-full py-2.5 border border-black bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black cursor-pointer"
                        >
                          Kembali ke Daftar Kuis
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Review Details Mode
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center text-[10px] font-bold text-neutral-500 uppercase">
                        <span>Review Jawaban {viewingHistory && "(Riwayat)"}</span>
                        {viewingHistory ? (
                          <button
                            onClick={() => {
                              setActiveQuiz(null);
                              setShowReview(false);
                            }}
                            className="text-black border-b border-black font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Kembali ke Riwayat
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowReview(false)}
                            className="text-black border-b border-black font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Kembali ke Skor
                          </button>
                        )}
                      </div>

                      <div className="max-h-[340px] overflow-y-auto border border-black p-3 space-y-4 divide-y divide-neutral-200">
                        {activeQuiz.questions.map((q, idx) => {
                          const userAns = answers[q.id] || [];
                          const correctAns = q.correctAnswers;
                          const isCorrect = userAns.length === correctAns.length && userAns.every(v => correctAns.includes(v));
                          
                          const userAnsText = userAns.length > 0 
                            ? userAns.map(i => String.fromCharCode(65 + i)).join(", ") 
                            : "Tidak dijawab";
                          
                          const correctAnsText = correctAns.map(i => String.fromCharCode(65 + i)).join(", ");

                          return (
                            <div key={q.id} className={`pt-3 ${idx === 0 ? "pt-0" : ""}`}>
                              {q.images && q.images.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {q.images.map((img, imgIdx) => (
                                    <img 
                                      key={imgIdx} 
                                      src={img} 
                                      alt="Ilustrasi" 
                                      className="max-h-[60px] object-contain border border-black" 
                                    />
                                  ))}
                                </div>
                              )}
                              <p className="text-xs font-bold mb-2 leading-relaxed">
                                {idx + 1}. {q.text}
                              </p>
                              <div className="text-[11px] space-y-1">
                                <p className="flex justify-between">
                                  <span>Jawaban Anda:</span>
                                  <span className={`font-bold ${isCorrect ? "text-neutral-800" : "text-neutral-500"}`}>
                                    {userAnsText}
                                  </span>
                                </p>
                                <p className="flex justify-between">
                                  <span>Jawaban Benar:</span>
                                  <span className="font-bold border-b border-black">
                                    {correctAnsText}
                                  </span>
                                </p>
                                <p className={`font-mono text-[9px] uppercase tracking-wide font-extrabold ${isCorrect ? "text-neutral-800" : "text-neutral-500"}`}>
                                  Status: {isCorrect ? "BENAR [✓]" : "SALAH [✗]"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {viewingHistory ? (
                        <button
                          onClick={() => {
                            setActiveQuiz(null);
                            setShowReview(false);
                          }}
                          className="w-full py-2.5 border border-black bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black cursor-pointer"
                        >
                          Kembali ke Riwayat
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveQuiz(null)}
                          className="w-full py-2.5 border border-black bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black cursor-pointer"
                        >
                          Kembali ke Daftar Kuis
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="w-full text-center mt-4">
              <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
                SI-ZAT ESD &bull; {activeQuiz.title.substring(0, 20)}...
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
