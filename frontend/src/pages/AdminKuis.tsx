import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useAppBack } from "../hooks/useAppBack";

import QuizList from "../components/admin/QuizList";
import QuizForm from "../components/admin/QuizForm";
import QuizAnalysis from "../components/admin/QuizAnalysis";

import {
  getQuizzesApi,
  createQuizApi,
  updateQuizApi,
  deleteQuizApi,
  getQuizSubmissionsApi,
} from "../api/api";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswers: number[];
  images: string[];
  questionType?: string;
}

interface Quiz {
  id: string;
  title: string;
  createdAt: string;
  questions: Question[];
  submissionsCount?: number;
}

interface Submission {
  id: string;
  quizId: string;
  studentName: string;
  studentClass: string;
  answers: Record<string, number[]>;
  score: number;
  duration?: number;
  createdAt: string;
}

type ViewMode = "LIST" | "FORM" | "ANALYSIS";

export default function AdminKuis() {
  const navigate = useNavigate();
  const goBack = useAppBack();
  const { user, token } = useAuthStore();

  // Mode & States
  const [mode, setMode] = useState<ViewMode>("LIST");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  // Form States
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

  // Analysis States
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "alert" | "confirm";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });

  const showAlert = (
    message: string,
    title = "Info",
    onConfirm?: () => void,
  ) => {
    setModal({
      isOpen: true,
      type: "alert",
      title,
      message,
      onConfirm,
    });
  };

  const showConfirm = (
    message: string,
    onConfirm: () => void,
    title = "Konfirmasi",
  ) => {
    setModal({
      isOpen: true,
      type: "confirm",
      title,
      message,
      onConfirm,
    });
  };

  // Authentication & Admin Check
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const isAdmin =
      user.status.toLowerCase() === "admin" ||
      user.email.toLowerCase().includes("admin");
    if (!isAdmin) {
      navigate("/menu");
    }
  }, [user, navigate]);

  // Load and Seed Backend Data
  const loadQuizzes = async () => {
    if (!token) return;
    setLoading(true);
    try {
      let serverQuizzes = await getQuizzesApi(token);

      // If backend database has no quizzes, seed it automatically!
      if (serverQuizzes.length === 0) {
        const defaultQuizzes: Quiz[] = [
          {
            id: "default-1",
            title: "Penilaian Hasil Belajar (Eutrofikasi & Pencemaran)",
            createdAt: new Date().toLocaleDateString("id-ID"),
            questions: [
              {
                id: "q-1-1",
                text: "Apa dampak utama dari fenomena eutrofikasi pada ekosistem perairan?",
                options: [
                  "Meningkatnya kadar oksigen terlarut (DO) secara drastis",
                  "Ledakan populasi alga (blooming) yang menutupi permukaan air",
                  "Berkurangnya keasaman air sehingga biota air lebih sehat",
                  "Penurunan populasi bakteri pengurai bahan organik",
                  "Air menjadi lebih jernih dan aman dikonsumsi langsung",
                ],
                correctAnswers: [1], // Index 1 (B)
                images: [],
              },
              {
                id: "q-1-2",
                text: "Manakah dari gas berikut yang paling berkontribusi secara langsung pada efek rumah kaca global?",
                options: [
                  "Oksigen (O2)",
                  "Nitrogen (N2)",
                  "Karbon Dioksida (CO2)",
                  "Helium (He)",
                  "Argon (Ar)",
                ],
                correctAnswers: [2], // Index 2 (C)
                images: [],
              },
              {
                id: "q-1-3",
                text: "Apa fungsi utama pemasangan catalytic converter pada knalpot kendaraan bermotor?",
                options: [
                  "Meningkatkan konsumsi bahan bakar agar kendaraan lebih cepat",
                  "Mengurangi emisi gas beracun seperti Karbon Monoksida (CO) menjadi CO2",
                  "Mengubah gas nitrogen menjadi senyawa nitrogen organik",
                  "Meredam kebisingan suara knalpot secara mekanis",
                  "Menyaring partikel debu halus PM2.5 secara fisik",
                ],
                correctAnswers: [1], // Index 1 (B)
                images: [],
              },
              {
                id: "q-1-4",
                text: "Pencemaran tanah akibat logam berat seperti timbal (Pb) paling tepat ditangani secara ekologis menggunakan metode...",
                options: [
                  "Pembakaran tanah tercemar dengan suhu di atas 1000 derajat Celcius",
                  "Fitoremediasi menggunakan tanaman akumulator logam",
                  "Penimbunan tanah tercemar langsung ke dalam dasar laut terdalam",
                  "Penyiraman deterjen atau air sabun secara berkala",
                  "Penutupan permukaan tanah tercemar dengan pasir kuarsa tebal",
                ],
                correctAnswers: [1], // Index 1 (B)
                images: [],
              },
              {
                id: "q-1-5",
                text: "Bagaimana cara berpikir sistem membantu dalam menyelesaikan krisis pencemaran lingkungan?",
                options: [
                  "Fokus hanya pada penyelesaian jangka pendek tanpa melihat masa depan",
                  "Memahami hubungan sebab-akibat yang kompleks antar-komponen lingkungan",
                  "Mengabaikan aspek sosial dan berfokus pada teknologi murni",
                  "Menyelesaikan masalah secara terpisah tanpa koordinasi antar sektor",
                  "Mengurangi keterlibatan masyarakat dalam menjaga keseimbangan alam",
                ],
                correctAnswers: [1], // Index 1 (B)
                images: [],
              },
            ],
          },
          {
            id: "default-2",
            title: "Kuis Eksperimental Sistem Pencemaran",
            createdAt: new Date().toLocaleDateString("id-ID"),
            questions: [
              {
                id: "q-2-1",
                text: "Manakah tindakan di bawah ini yang dapat mengurangi dampak pencemaran air sekaligus tanah secara terintegrasi? (Pilih semua jawaban yang benar)",
                options: [
                  "Mengurangi penggunaan plastik sekali pakai dan membuangnya ke sungai",
                  "Menerapkan pertanian organik dengan pupuk alami ramah lingkungan",
                  "Mendaur ulang oli bekas dan tidak membuangnya ke tanah atau saluran air",
                  "Melakukan pembakaran sampah rumah tangga secara massal",
                ],
                correctAnswers: [1, 2], // Index 1 and 2 (B and C)
                images: [],
              },
            ],
          },
        ];

        // Seed quizzes to backend
        for (const quiz of defaultQuizzes) {
          await createQuizApi(token, quiz);
        }
        // Fetch again
        serverQuizzes = await getQuizzesApi(token);
      }

      setQuizzes(serverQuizzes);
    } catch (err: any) {
      console.error("Failed to load quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, [token]);

  if (!user) return null;

  // --- ACTIONS ---

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
          setQuizzes(quizzes.filter((q) => q.id !== id));
          showAlert("Kuis berhasil dihapus.", "Sukses");
        } catch (err: any) {
          showAlert(err.message || "Gagal menghapus kuis.", "Gagal");
        }
      },
      "Hapus Kuis",
    );
  };

  const handleOpenAnalysis = async (quiz: Quiz) => {
    if (!token) return;
    try {
      const quizSubmissions = await getQuizSubmissionsApi(token, quiz.id);
      setSubmissions(quizSubmissions);
      setSelectedQuiz(quiz);
      setMode("ANALYSIS");
    } catch (err: any) {
      showAlert(err.message || "Gagal mengambil data analisis.", "Gagal");
    }
  };

  // --- FORM BUILDER MUTATIONS ---

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}-${questions.length + 1}`,
      text: "",
      options: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
      correctAnswers: [0],
      images: [],
      questionType: "C1",
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (questionId: string) => {
    if (questions.length <= 1) {
      showAlert("Kuis harus memiliki minimal 1 soal.", "Peringatan");
      return;
    }
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  const handleQuestionTextChange = (questionId: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return { ...q, text };
        }
        return q;
      }),
    );
  };

  const handleQuestionTypeChange = (
    questionId: string,
    questionType: string,
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return { ...q, questionType };
        }
        return q;
      }),
    );
  };

  const handleOptionCountChange = (questionId: string, newCount: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          let currentOptions = [...q.options];
          if (newCount > currentOptions.length) {
            const letters = ["A", "B", "C", "D", "E"];
            while (currentOptions.length < newCount) {
              const letter = letters[currentOptions.length];
              currentOptions.push(`Pilihan ${letter}`);
            }
          } else if (newCount < currentOptions.length) {
            currentOptions = currentOptions.slice(0, newCount);
          }

          const correctAnswers = q.correctAnswers.filter(
            (idx) => idx < newCount,
          );
          const finalCorrectAnswers =
            correctAnswers.length === 0 ? [0] : correctAnswers;

          return {
            ...q,
            options: currentOptions,
            correctAnswers: finalCorrectAnswers,
          };
        }
        return q;
      }),
    );
  };

  const handleOptionTextChange = (
    questionId: string,
    optIdx: number,
    text: string,
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optIdx] = text;
          return { ...q, options: newOptions };
        }
        return q;
      }),
    );
  };

  const handleToggleCorrectAnswer = (questionId: string, optIdx: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const isSelected = q.correctAnswers.includes(optIdx);
          let newCorrect: number[];
          if (isSelected) {
            if (q.correctAnswers.length <= 1) {
              showAlert("Harus ada minimal 1 jawaban benar.", "Peringatan");
              return q;
            }
            newCorrect = q.correctAnswers.filter((idx) => idx !== optIdx);
          } else {
            newCorrect = [...q.correctAnswers, optIdx].sort();
          }
          return { ...q, correctAnswers: newCorrect };
        }
        return q;
      }),
    );
  };

  const handleImageUpload = (questionId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const readPromises = Array.from(files).map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises)
      .then((base64Images) => {
        setQuestions((prev) =>
          prev.map((q) => {
            if (q.id === questionId) {
              return {
                ...q,
                images: [...(q.images || []), ...base64Images],
              };
            }
            return q;
          }),
        );
      })
      .catch((err) => {
        console.error(err);
        showAlert("Gagal membaca gambar.", "Gagal");
      });
  };

  const handleRemoveImage = (questionId: string, imgIdx: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            images: q.images.filter((_, i) => i !== imgIdx),
          };
        }
        return q;
      }),
    );
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
            `Pilihan ${String.fromCharCode(65 + j)} pada Soal #${
              i + 1
            } tidak boleh kosong.`,
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

      await loadQuizzes();
      setMode("LIST");
      setEditingQuizId(null);
      setQuizTitle("");
      setQuestions([]);
      showAlert("Kuis berhasil disimpan!", "Sukses");
    } catch (err: any) {
      showAlert(err.message || "Gagal menyimpan kuis.", "Gagal");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      {/* Decorative Blur Bubble */}
      <div className="absolute top-[-10%] right-[-10%] w-50 h-50 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-107.5 min-h-screen flex flex-col justify-between px-6 py-6 z-10">
        {loading ? (
          <div className="w-full flex-1 flex flex-col justify-center items-center gap-3 text-center">
            <div className="w-8 h-8 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] uppercase font-black tracking-widest text-[#9C98A6]">
              Sinkronisasi data server...
            </p>
          </div>
        ) : (
          <>
            {mode === "LIST" && (
              <QuizList
                quizzes={quizzes}
                submissions={submissions}
                onCreateNewQuiz={handleCreateNewQuiz}
                onOpenAnalysis={handleOpenAnalysis}
                onEditQuiz={handleEditQuiz}
                onDeleteQuiz={handleDeleteQuiz}
                onBack={() => goBack("/admin")}
              />
            )}

            {mode === "FORM" && (
              <QuizForm
                editingQuizId={editingQuizId}
                quizTitle={quizTitle}
                setQuizTitle={setQuizTitle}
                questions={questions}
                onAddQuestion={handleAddQuestion}
                onRemoveQuestion={handleRemoveQuestion}
                onQuestionTextChange={handleQuestionTextChange}
                onQuestionTypeChange={handleQuestionTypeChange}
                onOptionCountChange={handleOptionCountChange}
                onOptionTextChange={handleOptionTextChange}
                onToggleCorrectAnswer={handleToggleCorrectAnswer}
                onImageUpload={handleImageUpload}
                onRemoveImage={handleRemoveImage}
                onSave={handleSaveQuiz}
                onCancel={() => {
                  showConfirm(
                    "Batal mengedit dan buang perubahan?",
                    () => {
                      setMode("LIST");
                    },
                    "Batal Edit",
                  );
                }}
              />
            )}

            {mode === "ANALYSIS" && selectedQuiz && (
              <QuizAnalysis
                selectedQuiz={selectedQuiz}
                submissions={submissions}
                onClose={() => {
                  setMode("LIST");
                  setSelectedQuiz(null);
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Styled custom modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-6 backdrop-blur-xs">
          <div className="w-full max-w-85 bg-white rounded-[28px] p-6 shadow-xl border border-[#F0EDFF] flex flex-col gap-4 animate-none select-none text-left">
            <div>
              <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide uppercase">
                {modal.title}
              </h3>
              <p className="text-xs text-[#9C98A6] font-medium mt-2 leading-relaxed">
                {modal.message}
              </p>
            </div>
            <div className="flex gap-2.5 mt-2">
              {modal.type === "confirm" && (
                <button
                  onClick={() =>
                    setModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="flex-1 py-3 bg-white border border-[#FFEAEA] text-[#FF5E8C] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center"
                >
                  Batal
                </button>
              )}
              <button
                onClick={() => {
                  setModal((prev) => ({ ...prev, isOpen: false }));
                  if (modal.onConfirm) modal.onConfirm();
                }}
                className="flex-1 py-3 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
