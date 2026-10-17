import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import {
  getQuizzesApi,
  createQuizApi,
  updateQuizApi,
  deleteQuizApi,
  getQuizSubmissionsApi,
} from "../../../api/api";
import type { Quiz, Submission, QuizViewMode } from "../../../types/quiz";
import { isAdmin } from "../../../utils/auth";
import { defaultQuizzes } from "./defaultQuizzes";
import { useQuizQuestionsBuilder } from "./useQuizQuestionsBuilder";

export interface AdminModalState {
  isOpen: boolean;
  type: "alert" | "confirm";
  title: string;
  message: string;
  onConfirm?: () => void;
}

export function useAdminKuis() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  const [mode, setMode] = useState<QuizViewMode>("LIST");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  const submissionsCache = useRef<Record<string, Submission[]>>({});

  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const [modal, setModal] = useState<AdminModalState>({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });

  const showAlert = (message: string, title = "Info", onConfirm?: () => void) => {
    setModal({
      isOpen: true,
      type: "alert",
      title,
      message,
      onConfirm,
    });
  };

  const showConfirm = (message: string, onConfirm: () => void, title = "Konfirmasi") => {
    setModal({
      isOpen: true,
      type: "confirm",
      title,
      message,
      onConfirm,
    });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const {
    questions,
    setQuestions,
    handleAddQuestion,
    handleRemoveQuestion,
    handleQuestionTextChange,
    handleQuestionTypeChange,
    handleOptionCountChange,
    handleOptionTextChange,
    handleToggleCorrectAnswer,
    handleImageUpload,
    handleRemoveImage,
  } = useQuizQuestionsBuilder(showAlert);

  useEffect(() => {
    if (!user || !isAdmin(user)) {
      navigate(!user ? "/auth" : "/menu");
    }
  }, [user, navigate]);

  const loadQuizzes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      let serverQuizzes = await getQuizzesApi(token);

      if (serverQuizzes.length === 0) {
        for (const quiz of defaultQuizzes) {
          await createQuizApi(token, quiz);
        }
        serverQuizzes = await getQuizzesApi(token);
      }

      setQuizzes(serverQuizzes);
    } catch (err: unknown) {
      console.error("Failed to load quizzes:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const handleCreateNewQuiz = () => {
    setEditingQuizId(null);
    setQuizTitle("");
    setQuestions([
      {
        id: `q-${Date.now()}-1`,
        text: "",
        options: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
        correctAnswers: [0],
        images: [],
        questionType: "C1",
      },
    ]);
    setMode("FORM");
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuizId(quiz.id);
    setQuizTitle(quiz.title);
    setQuestions(JSON.parse(JSON.stringify(quiz.questions)));
    setMode("FORM");
  };

  const handleDeleteQuiz = async (id: string) => {
    showConfirm(
      "Apakah Anda yakin ingin menghapus kuis ini?",
      async () => {
        if (!token) return;
        try {
          await deleteQuizApi(token, id);
          delete submissionsCache.current[id];
          setQuizzes((prev) => prev.filter((q) => q.id !== id));
          showAlert("Kuis berhasil dihapus.", "Sukses");
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : "Gagal menghapus kuis.";
          showAlert(errorMsg, "Gagal");
        }
      },
      "Hapus Kuis",
    );
  };

  const handleOpenAnalysis = async (quiz: Quiz) => {
    if (!token) return;
    try {
      if (submissionsCache.current[quiz.id]) {
        setSubmissions(submissionsCache.current[quiz.id]);
        setSelectedQuiz(quiz);
        setMode("ANALYSIS");
        return;
      }

      setLoading(true);
      const quizSubmissions = await getQuizSubmissionsApi(token, quiz.id);
      submissionsCache.current[quiz.id] = quizSubmissions;
      setSubmissions(quizSubmissions);
      setSelectedQuiz(quiz);
      setMode("ANALYSIS");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Gagal mengambil data analisis.";
      showAlert(errorMsg, "Gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle.trim()) {
      showAlert("Judul kuis harus diisi!", "Peringatan");
      return;
    }
    if (!token) return;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        showAlert(`Teks Soal #${i + 1} tidak boleh kosong.`, "Peringatan");
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          showAlert(
            `Pilihan ${String.fromCharCode(65 + j)} pada Soal #${i + 1} tidak boleh kosong.`,
            "Peringatan",
          );
          return;
        }
      }
      if (q.correctAnswers.length === 0) {
        showAlert(
          `Soal #${i + 1} harus memiliki minimal 1 jawaban benar.`,
          "Peringatan",
        );
        return;
      }
    }

    try {
      if (editingQuizId) {
        const payload = { title: quizTitle, questions };
        await updateQuizApi(token, editingQuizId, payload);
      } else {
        const payload = {
          id: `quiz-${Date.now()}`,
          title: quizTitle,
          createdAt: new Date().toLocaleDateString("id-ID"),
          questions,
        };
        await createQuizApi(token, payload);
      }

      if (editingQuizId) {
        delete submissionsCache.current[editingQuizId];
      }

      await loadQuizzes();
      setMode("LIST");
      setEditingQuizId(null);
      setQuizTitle("");
      setQuestions([]);
      showAlert("Kuis berhasil disimpan!", "Sukses");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Gagal menyimpan kuis.";
      showAlert(errorMsg, "Gagal");
    }
  };

  return {
    user,
    mode,
    setMode,
    quizzes,
    setQuizzes,
    submissions,
    loading,
    editingQuizId,
    quizTitle,
    setQuizTitle,
    questions,
    selectedQuiz,
    setSelectedQuiz,
    modal,
    closeModal,
    showAlert,
    showConfirm,
    handleCreateNewQuiz,
    handleEditQuiz,
    handleDeleteQuiz,
    handleOpenAnalysis,
    handleAddQuestion,
    handleRemoveQuestion,
    handleQuestionTextChange,
    handleQuestionTypeChange,
    handleOptionCountChange,
    handleOptionTextChange,
    handleToggleCorrectAnswer,
    handleImageUpload,
    handleRemoveImage,
    handleSaveQuiz,
  };
}
