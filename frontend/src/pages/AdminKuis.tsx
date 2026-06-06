import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

import QuizList from "../components/admin/QuizList";
import QuizForm from "../components/admin/QuizForm";
import QuizAnalysis from "../components/admin/QuizAnalysis";

import {
  getQuizzesApi,
  createQuizApi,
  updateQuizApi,
  deleteQuizApi,
  getQuizSubmissionsApi
} from "../api/api";

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
  submissionsCount?: number;
}

interface Submission {
  id: string;
  quizId: string;
  studentName: string;
  studentClass: string;
  answers: Record<string, number[]>;
  score: number;
  createdAt: string;
}

type ViewMode = "LIST" | "FORM" | "ANALYSIS";

export default function AdminKuis() {
  const navigate = useNavigate();
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

  // Authentication & Admin Check
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const isAdmin = user.status.toLowerCase() === "admin" || user.email.toLowerCase().includes("admin");
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
                  "Air menjadi lebih jernih dan aman dikonsumsi langsung"
                ],
                correctAnswers: [1], // Index 1 (B)
                images: []
              },
              {
                id: "q-1-2",
                text: "Manakah dari gas berikut yang paling berkontribusi secara langsung pada efek rumah kaca global?",
                options: [
                  "Oksigen (O2)",
                  "Nitrogen (N2)",
                  "Karbon Dioksida (CO2)",
                  "Helium (He)",
                  "Argon (Ar)"
                ],
                correctAnswers: [2], // Index 2 (C)
                images: []
              },
              {
                id: "q-1-3",
                text: "Apa fungsi utama pemasangan catalytic converter pada knalpot kendaraan bermotor?",
                options: [
                  "Meningkatkan konsumsi bahan bakar agar kendaraan lebih cepat",
                  "Mengurangi emisi gas beracun seperti Karbon Monoksida (CO) menjadi CO2",
                  "Mengubah gas nitrogen menjadi senyawa nitrogen organik",
                  "Meredam kebisingan suara knalpot secara mekanis",
                  "Menyaring partikel debu halus PM2.5 secara fisik"
                ],
                correctAnswers: [1], // Index 1 (B)
                images: []
              },
              {
                id: "q-1-4",
                text: "Pencemaran tanah akibat logam berat seperti timbal (Pb) paling tepat ditangani secara ekologis menggunakan metode...",
                options: [
                  "Pembakaran tanah tercemar dengan suhu di atas 1000 derajat Celcius",
                  "Fitoremediasi menggunakan tanaman akumulator logam",
                  "Penimbunan tanah tercemar langsung ke dalam dasar laut terdalam",
                  "Penyiraman deterjen atau air sabun secara berkala",
                  "Penutupan permukaan tanah tercemar dengan pasir kuarsa tebal"
                ],
                correctAnswers: [1], // Index 1 (B)
                images: []
              },
              {
                id: "q-1-5",
                text: "Bagaimana cara berpikir sistem membantu dalam menyelesaikan krisis pencemaran lingkungan?",
                options: [
                  "Fokus hanya pada penyelesaian jangka pendek tanpa melihat masa depan",
                  "Memahami hubungan sebab-akibat yang kompleks antar-komponen lingkungan",
                  "Mengabaikan aspek sosial dan berfokus pada teknologi murni",
                  "Menyelesaikan masalah secara terpisah tanpa koordinasi antar sektor",
                  "Mengurangi keterlibatan masyarakat dalam menjaga keseimbangan alam"
                ],
                correctAnswers: [1], // Index 1 (B)
                images: []
              }
            ]
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
                  "Melakukan pembakaran sampah rumah tangga secara massal"
                ],
                correctAnswers: [1, 2], // Index 1 and 2 (B and C)
                images: []
              }
            ]
          }
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
        images: []
      }
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
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus kuis ini?");
    if (!confirmDelete || !token) return;

    try {
      await deleteQuizApi(token, id);
      setQuizzes(quizzes.filter(q => q.id !== id));
      alert("Kuis berhasil dihapus.");
    } catch (err: any) {
      alert(err.message || "Gagal menghapus kuis.");
    }
  };

  const handleOpenAnalysis = async (quiz: Quiz) => {
    if (!token) return;
    try {
      const quizSubmissions = await getQuizSubmissionsApi(token, quiz.id);
      setSubmissions(quizSubmissions);
      setSelectedQuiz(quiz);
      setMode("ANALYSIS");
    } catch (err: any) {
      alert(err.message || "Gagal mengambil data analisis.");
    }
  };

  // --- FORM BUILDER MUTATIONS ---

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}-${questions.length + 1}`,
      text: "",
      options: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
      correctAnswers: [0],
      images: []
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (questionId: string) => {
    if (questions.length <= 1) {
      alert("Kuis harus memiliki minimal 1 soal.");
      return;
    }
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleQuestionTextChange = (questionId: string, text: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return { ...q, text };
      }
      return q;
    }));
  };

  const handleOptionCountChange = (questionId: string, newCount: number) => {
    setQuestions(prev => prev.map(q => {
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

        const correctAnswers = q.correctAnswers.filter(idx => idx < newCount);
        const finalCorrectAnswers = correctAnswers.length === 0 ? [0] : correctAnswers;

        return {
          ...q,
          options: currentOptions,
          correctAnswers: finalCorrectAnswers
        };
      }
      return q;
    }));
  };

  const handleOptionTextChange = (questionId: string, optIdx: number, text: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optIdx] = text;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleToggleCorrectAnswer = (questionId: string, optIdx: number) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const isSelected = q.correctAnswers.includes(optIdx);
        let newCorrect: number[];
        if (isSelected) {
          if (q.correctAnswers.length <= 1) {
            alert("Harus ada minimal 1 jawaban benar.");
            return q;
          }
          newCorrect = q.correctAnswers.filter(idx => idx !== optIdx);
        } else {
          newCorrect = [...q.correctAnswers, optIdx].sort();
        }
        return { ...q, correctAnswers: newCorrect };
      }
      return q;
    }));
  };

  const handleImageUpload = (questionId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const readPromises = Array.from(files).map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then(base64Images => {
      setQuestions(prev => prev.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            images: [...(q.images || []), ...base64Images]
          };
        }
        return q;
      }));
    }).catch(err => {
      console.error(err);
      alert("Gagal membaca gambar.");
    });
  };

  const handleRemoveImage = (questionId: string, imgIdx: number) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          images: q.images.filter((_, i) => i !== imgIdx)
        };
      }
      return q;
    }));
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle.trim()) {
      alert("Judul kuis harus diisi!");
      return;
    }
    if (!token) return;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        alert(`Teks Soal #${i + 1} tidak boleh kosong.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          alert(`Pilihan ${String.fromCharCode(65 + j)} pada Soal #${i + 1} tidak boleh kosong.`);
          return;
        }
      }
      if (q.correctAnswers.length === 0) {
        alert(`Soal #${i + 1} harus memiliki minimal 1 jawaban benar.`);
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
          questions
        };
        await createQuizApi(token, payload);
      }

      await loadQuizzes();
      setMode("LIST");
      setEditingQuizId(null);
      setQuizTitle("");
      setQuestions([]);
      alert("Kuis berhasil disimpan!");
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan kuis.");
    }
  };
  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans select-none">
      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-8">
        
        {loading ? (
          <div className="w-full flex-1 flex flex-col justify-center items-center gap-4 text-center">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
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
                onBack={() => navigate("/admin")}
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
                onOptionCountChange={handleOptionCountChange}
                onOptionTextChange={handleOptionTextChange}
                onToggleCorrectAnswer={handleToggleCorrectAnswer}
                onImageUpload={handleImageUpload}
                onRemoveImage={handleRemoveImage}
                onSave={handleSaveQuiz}
                onCancel={() => {
                  if (window.confirm("Batal mengedit dan buang perubahan?")) {
                    setMode("LIST");
                  }
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

        {/* Footer Info */}
        <div className="w-full text-center mt-6">
          <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
            SI-ZAT ESD &bull; Panel Admin Kuis
          </p>
        </div>

      </div>
    </div>
  );
}
