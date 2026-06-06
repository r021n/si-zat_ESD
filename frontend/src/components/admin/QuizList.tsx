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
        <div className="w-full flex justify-between items-center mt-4 border-b border-black pb-3">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Panel Admin</p>
            <h1 className="text-sm font-bold uppercase tracking-wide">Kelola Kuis</h1>
          </div>
          <button
            onClick={onCreateNewQuiz}
            className="px-2.5 py-1.5 border border-black text-[9px] font-bold uppercase tracking-wider bg-white active:bg-black active:text-white cursor-pointer flex items-center gap-1"
          >
            <FiPlus /> Buat Kuis
          </button>
        </div>

        {/* List */}
        <div className="mt-6 flex flex-col gap-4">
          {quizzes.length === 0 ? (
            <div className="text-center py-12 border border-black border-dashed text-xs text-neutral-500 uppercase font-bold">
              Belum ada kuis yang dibuat.
            </div>
          ) : (
            quizzes.map(quiz => {
              const subCount = quiz.submissionsCount !== undefined 
                ? quiz.submissionsCount 
                : submissions.filter(s => s.quizId === quiz.id).length;
              return (
                <div key={quiz.id} className="w-full border border-black p-4 bg-white flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-xs uppercase tracking-wide line-clamp-2">{quiz.title}</h3>
                    <div className="flex gap-2 text-[9px] font-mono text-neutral-500 uppercase font-bold">
                      <span>{quiz.questions.length} Soal</span>
                      <span>&bull;</span>
                      <span>{subCount} Respon</span>
                      <span>&bull;</span>
                      <span>Dibuat: {quiz.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onOpenAnalysis(quiz)}
                      className="w-10 h-10 border border-black bg-white text-black active:bg-black active:text-white cursor-pointer flex items-center justify-center text-sm"
                      title="Analisis"
                    >
                      <FiBarChart2 />
                    </button>
                    
                    <button
                      onClick={() => onEditQuiz(quiz)}
                      className="w-10 h-10 border border-black bg-white text-black active:bg-black active:text-white cursor-pointer flex items-center justify-center text-sm"
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      onClick={() => onDeleteQuiz(quiz.id)}
                      className="w-10 h-10 border border-black bg-white text-black active:bg-black active:text-white cursor-pointer flex items-center justify-center text-sm ml-auto"
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
          className="w-full py-3 border border-black bg-black text-white font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black cursor-pointer flex items-center justify-center gap-1.5"
        >
          <FiArrowLeft /> Kembali ke Menu Admin
        </button>
      </div>
    </div>
  );
}
