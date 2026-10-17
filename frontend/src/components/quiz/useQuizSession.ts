import { useState, useEffect, useMemo, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import { useCustomDialog } from "../CustomDialog";
import {
  getQuizzesApi,
  submitQuizAnswersApi,
  getMySubmissionsApi,
} from "../../api/api";
import type { Quiz } from "../../types/quiz";
import { useQuizAntiCheat } from "./useQuizAntiCheat";

export function useQuizSession() {
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

  // Anti-Cheat Integration
  const {
    violationCount,
    violationCountRef,
    resetViolations,
    startLock,
    stopLock,
    enterImmersive,
    exitImmersive,
  } = useQuizAntiCheat({ activeQuiz, submitted });

  // Timer States
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [historicDuration, setHistoricDuration] = useState<number | null>(null);

  // History States
  const [viewingHistory, setViewingHistory] = useState<boolean>(false);
  const [historySubmissions, setHistorySubmissions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const activeQuizRef = useRef<Quiz | null>(null);
  const submittedRef = useRef<boolean>(false);

  useEffect(() => {
    activeQuizRef.current = activeQuiz;
  }, [activeQuiz]);

  useEffect(() => {
    submittedRef.current = submitted;
  }, [submitted]);

  // Timer Effect
  useEffect(() => {
    if (!activeQuiz || submitted || submittingRes) return;
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuiz, submitted, submittingRes]);

  // Fetch history submissions on load and when viewing history
  useEffect(() => {
    if (!token) return;
    const fetchHistory = async () => {
      if (viewingHistory) setLoadingHistory(true);
      try {
        const data = await getMySubmissionsApi(token);
        setHistorySubmissions(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        if (viewingHistory) setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [token, viewingHistory]);

  const myLatestSubmissions = useMemo(() => {
    const map: Record<string, any> = {};
    for (const sub of historySubmissions) {
      if (!map[sub.quizId]) map[sub.quizId] = sub;
    }
    return map;
  }, [historySubmissions]);

  // Fetch quizzes on load
  useEffect(() => {
    if (!token) return;
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const data = await getQuizzesApi(token, true);
        setQuizzes(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [token]);

  const handleSelectQuiz = (quiz: Quiz) => {
    if (quiz.hasSubmitted || myLatestSubmissions[quiz.id]) {
      showAlert(
        "Anda sudah pernah mengerjakan tes ini. Kuis hanya dapat dikerjakan satu kali.",
      );
      return;
    }
    setActiveQuiz(quiz);
    setCurrentIdx(0);
    setAnswers({});
    setSubmitted(false);
    setShowReview(false);
    setElapsedTime(0);
    setHistoricDuration(null);
    resetViolations(0);
  };

  const handleSelectHistory = (sub: any, quiz: Quiz | undefined) => {
    if (!quiz) return;
    setActiveQuiz(quiz);
    setAnswers(sub.answers);
    setSubmitted(true);
    setShowReview(true);
    setHistoricDuration(sub.duration !== undefined ? sub.duration : null);
    resetViolations(sub.violationCount || 0);
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
      const submittedAt = new Date().toLocaleString("id-ID");

      await submitQuizAnswersApi(token, activeQuiz.id, {
        answers,
        score,
        duration: elapsedTime,
        violationCount: violationCountRef.current,
        createdAt: submittedAt,
      });

      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === activeQuiz.id ? { ...q, hasSubmitted: true } : q,
        ),
      );
      setHistorySubmissions((prev) => [
        {
          id: `local-${activeQuiz.id}-${Date.now()}`,
          quizId: activeQuiz.id,
          answers,
          score,
          duration: elapsedTime,
          violationCount: violationCountRef.current,
          createdAt: submittedAt,
        },
        ...prev,
      ]);

      setSubmitted(true);
      await stopLock();
      await exitImmersive();
    } catch (err: any) {
      await showAlert(
        err.message || "Gagal mengirimkan jawaban ke server. Silakan coba lagi.",
      );
      if (err?.status === 409) {
        setActiveQuiz(null);
        try {
          const data = await getQuizzesApi(token, true);
          setQuizzes(data);
        } catch (refreshErr) {
          console.error(refreshErr);
        }
      }
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

  return {
    user,
    token,
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
    violationCountRef,
    resetViolations,
    startLock,
    stopLock,
    enterImmersive,
    exitImmersive,
  };
}
