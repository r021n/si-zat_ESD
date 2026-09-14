import {
  FiPlus,
  FiBarChart2,
  FiEdit2,
  FiTrash2,
  FiArrowLeft,
} from "react-icons/fi";

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
  duration?: number;
  createdAt: string;
}

interface QuizListProps {
  quizzes: Quiz[];
  submissions: Submission[];
  onCreateNewQuiz: () => void;
  onOpenAnalysis: (quiz: Quiz) => void;
  onEditQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (id: string) => void;
  onBack: () => void;
}

export default function QuizList({
  quizzes,
  submissions,
  onCreateNewQuiz,
  onOpenAnalysis,
  onEditQuiz,
  onDeleteQuiz,
  onBack,
}: QuizListProps) {
  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="w-full flex justify-between items-center mt-2 md:mt-0 pb-4 border-b border-[#F0EDFF]/70">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 hover:bg-[#FAF9FF] transition-colors shrink-0"
              title="Kembali"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#9C98A6] font-bold">
                Panel Admin
              </p>
              <h1 className="text-xl md:text-2xl font-extrabold text-[#2C2B30] leading-tight mt-0.5">
                Kelola Kuis
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-block text-xs font-bold text-[#9C98A6] bg-white px-3 py-1.5 rounded-full border border-[#F0EDFF]">
              Total: <strong className="text-[#8C66FF]">{quizzes.length}</strong> Kuis
            </span>
            <button
              onClick={onCreateNewQuiz}
              className="px-4 md:px-5 py-2.5 md:py-3 bg-[#8C66FF] text-white text-[10px] md:text-xs font-extrabold uppercase tracking-wider rounded-full shadow-md shadow-purple-100 cursor-pointer hover:bg-[#7b55f0] transition-colors flex items-center gap-2 shrink-0"
            >
              <FiPlus className="text-xs md:text-sm" /> <span>Buat Kuis Baru</span>
            </button>
          </div>
        </div>

        {/* List / Grid on Desktop */}
        <div className="mt-6 flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {quizzes.length === 0 ? (
            <div className="md:col-span-3 text-center py-16 px-4 bg-white rounded-3xl border border-[#F0EDFF] shadow-[0_4px_12px_rgba(0,0,0,0.02)] text-xs text-[#9C98A6] uppercase font-bold tracking-wider">
              Belum ada kuis yang dibuat. Klik tombol "Buat Kuis Baru" di atas untuk menambahkan.
            </div>
          ) : (
            quizzes.map((quiz) => {
              const subCount =
                quiz.submissionsCount !== undefined
                  ? quiz.submissionsCount
                  : submissions.filter((s) => s.quizId === quiz.id).length;
              return (
                <div
                  key={quiz.id}
                  className="w-full bg-white rounded-3xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] flex flex-col justify-between gap-4 hover:border-[#8C66FF]/60 transition-colors duration-200"
                >
                  <div className="flex flex-col gap-2.5">
                    <h3 className="font-extrabold text-sm md:text-base text-[#2C2B30] tracking-wide line-clamp-2 leading-snug">
                      {quiz.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] md:text-[10px] text-[#9C98A6] font-bold uppercase tracking-wide">
                      <span className="px-2.5 py-0.5 bg-[#F0ECFF] text-[#8C66FF] rounded-full">
                        {quiz.questions.length} Soal
                      </span>
                      <span>&bull;</span>
                      <span className="px-2.5 py-0.5 bg-[#FFEBF0] text-[#D95276] rounded-full">
                        {subCount} Respon
                      </span>
                      <span>&bull;</span>
                      <span>{quiz.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-[#F0EDFF]/70">
                    <button
                      onClick={() => onOpenAnalysis(quiz)}
                      className="flex-1 md:flex-initial px-3 py-2 rounded-xl bg-[#F0ECFF] text-[#8C66FF] hover:bg-[#8C66FF] hover:text-white cursor-pointer flex items-center justify-center gap-1.5 text-xs font-extrabold transition-colors"
                      title="Analisis Kuis"
                    >
                      <FiBarChart2 />
                      <span className="hidden md:inline">Analisis</span>
                    </button>

                    <button
                      onClick={() => onEditQuiz(quiz)}
                      className="flex-1 md:flex-initial px-3 py-2 rounded-xl bg-[#FFF4EB] text-[#FF9D42] hover:bg-[#FF9D42] hover:text-white cursor-pointer flex items-center justify-center gap-1.5 text-xs font-extrabold transition-colors"
                      title="Edit Kuis"
                    >
                      <FiEdit2 />
                      <span className="hidden md:inline">Edit</span>
                    </button>

                    <button
                      onClick={() => onDeleteQuiz(quiz.id)}
                      className="w-9 h-9 md:w-9 md:h-9 rounded-xl bg-[#FFEAEA] text-[#FF5E8C] hover:bg-[#FF5E8C] hover:text-white cursor-pointer flex items-center justify-center text-xs ml-auto transition-colors"
                      title="Hapus Kuis"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
