import { FiClock, FiCheckCircle } from "react-icons/fi";
import { LuPenTool, LuChartBar } from "react-icons/lu";
import type { Quiz } from "../../types/quiz";
import { formatDurationFriendly } from "../../utils/time";

interface QuizLobbyViewProps {
  viewingHistory: boolean;
  loading: boolean;
  loadingHistory: boolean;
  quizzes: Quiz[];
  historySubmissions: any[];
  myLatestSubmissions: Record<string, any>;
  onSelectQuiz: (quiz: Quiz) => void;
  onSelectHistory: (sub: any, quiz: Quiz | undefined) => void;
}

export default function QuizLobbyView({
  viewingHistory,
  loading,
  loadingHistory,
  quizzes,
  historySubmissions,
  myLatestSubmissions,
  onSelectQuiz,
  onSelectHistory,
}: QuizLobbyViewProps) {
  if (viewingHistory) {
    return (
      <div className="w-full flex flex-col gap-3">
        {loadingHistory ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#F0EDFF] shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col gap-3 justify-center items-center">
            <div className="w-6 h-6 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C98A6]">
              Memuat Riwayat...
            </span>
          </div>
        ) : historySubmissions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#F0EDFF] shadow-[0_4px_12px_rgba(0,0,0,0.02)] text-xs text-[#9C98A6] font-bold uppercase">
            Belum ada riwayat pengerjaan.
          </div>
        ) : (
          historySubmissions.map((sub) => {
            const quiz = quizzes.find((q) => q.id === sub.quizId);
            const title = quiz ? quiz.title : "Tes Tidak Dikenal";
            return (
              <button
                key={sub.id}
                onClick={() => onSelectHistory(sub, quiz)}
                disabled={!quiz}
                className="w-full bg-white rounded-3xl p-4 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] cursor-pointer text-left transition-none disabled:opacity-50"
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
                      {sub.duration !== undefined && sub.duration !== null && (
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
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {loading ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-[#F0EDFF] shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col gap-3 justify-center items-center">
          <div className="w-6 h-6 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C98A6]">
            Memuat Tes...
          </span>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-[#F0EDFF] shadow-[0_4px_12px_rgba(0,0,0,0.02)] text-xs text-[#9C98A6] font-bold uppercase">
          Belum ada tes yang tersedia.
        </div>
      ) : (
        quizzes.map((quiz) => {
          const mySub = myLatestSubmissions[quiz.id];
          const isDone = quiz.hasSubmitted || !!mySub;

          return (
            <button
              key={quiz.id}
              onClick={() => {
                if (isDone && mySub) {
                  onSelectHistory(mySub, quiz);
                } else {
                  onSelectQuiz(quiz);
                }
              }}
              className="w-full bg-white rounded-3xl p-5 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] cursor-pointer text-left transition-none"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                    isDone ? "bg-[#E6F8F6] text-[#2C8578]" : "bg-[#FFEBF0] text-[#D95276]"
                  }`}
                >
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
              {isDone ? (
                <span className="flex items-center gap-1.5 shrink-0 ml-2 px-3 py-1.5 bg-[#E6F8F6] text-[#2C8578] rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  <FiCheckCircle size={12} />
                  Selesai
                  {mySub ? (
                    <span className="bg-[#2C8578] text-white px-1.5 py-0.5 rounded-full text-[9px] font-black">
                      {mySub.score}
                    </span>
                  ) : null}
                </span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 text-[#8C66FF] opacity-50 shrink-0 ml-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}
