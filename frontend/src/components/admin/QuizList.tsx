import { FiPlus, FiBarChart2, FiEdit2, FiTrash2, FiArrowLeft } from "react-icons/fi";

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
  onBack
}: QuizListProps) {
  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="w-full flex justify-between items-center mt-4 pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">Panel Admin</p>
            <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight">Kelola Kuis</h1>
          </div>
          <button
            onClick={onCreateNewQuiz}
            className="px-4 py-2.5 bg-gradient-to-br from-[#8C66FF] to-[#6039DF] text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md shadow-purple-100 cursor-pointer flex items-center gap-1.5 transition-none"
          >
            <FiPlus className="text-xs" /> Buat Kuis
          </button>
        </div>

        {/* List */}
        <div className="mt-6 flex flex-col gap-4">
          {quizzes.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-[24px] border border-[#F0EDFF] shadow-[0_4px_12px_rgba(0,0,0,0.02)] text-xs text-[#9C98A6] uppercase font-bold tracking-wider">
              Belum ada kuis yang dibuat.
            </div>
          ) : (
            quizzes.map(quiz => {
              const subCount = quiz.submissionsCount !== undefined 
                ? quiz.submissionsCount 
                : submissions.filter(s => s.quizId === quiz.id).length;
              return (
                <div key={quiz.id} className="w-full bg-white rounded-[24px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-extrabold text-sm text-[#2C2B30] tracking-wide line-clamp-2 leading-snug">{quiz.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-[#9C98A6] font-bold uppercase tracking-wide">
                      <span className="px-2 py-0.5 bg-[#F0ECFF] text-[#8C66FF] rounded-full">{quiz.questions.length} Soal</span>
                      <span>&bull;</span>
                      <span className="px-2 py-0.5 bg-[#FFEBF0] text-[#D95276] rounded-full">{subCount} Respon</span>
                      <span>&bull;</span>
                      <span>Dibuat: {quiz.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-[#F0EDFF]/50">
                    <button
                      onClick={() => onOpenAnalysis(quiz)}
                      className="w-10 h-10 rounded-xl bg-[#F0ECFF] text-[#8C66FF] active:bg-[#8C66FF] active:text-white cursor-pointer flex items-center justify-center text-sm transition-none"
                      title="Analisis"
                    >
                      <FiBarChart2 />
                    </button>
                    
                    <button
                      onClick={() => onEditQuiz(quiz)}
                      className="w-10 h-10 rounded-xl bg-[#FFF4EB] text-[#FF9D42] active:bg-[#FF9D42] active:text-white cursor-pointer flex items-center justify-center text-sm transition-none"
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      onClick={() => onDeleteQuiz(quiz.id)}
                      className="w-10 h-10 rounded-xl bg-[#FFEAEA] text-[#FF5E8C] active:bg-[#FF5E8C] active:text-white cursor-pointer flex items-center justify-center text-sm ml-auto transition-none"
                      title="Hapus"
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

      {/* Back Button */}
      <div className="w-full mt-8 mb-2">
        <button
          onClick={onBack}
          className="w-full py-4 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-xs rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center gap-2"
        >
          <FiArrowLeft /> Kembali ke Menu Admin
        </button>
      </div>
    </div>
  );
}

