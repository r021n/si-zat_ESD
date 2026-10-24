import type { Quiz } from "../../types/quiz";
import { formatDurationFriendly } from "../../utils/time";
import { getQuizImageUrl } from "../../utils/quizImage";
import QuizScoreResultCard from "./QuizScoreResultCard";

interface QuizScoreReviewViewProps {
  quiz: Quiz;
  answers: Record<string, number[]>;
  score: number;
  correct: number;
  total: number;
  answeredCount: number;
  emptyCount: number;
  duration: number;
  showReview: boolean;
  onSetShowReview: (show: boolean) => void;
  onBackToLobby: () => void;
  viewingHistory: boolean;
}

export default function QuizScoreReviewView({
  quiz,
  answers,
  score,
  correct,
  total,
  answeredCount,
  emptyCount,
  duration,
  showReview,
  onSetShowReview,
  onBackToLobby,
  viewingHistory,
}: QuizScoreReviewViewProps) {
  // If not in review mode, show the gamified result card matching score_example design
  if (!showReview) {
    return (
      <QuizScoreResultCard
        quiz={quiz}
        score={score}
        correct={correct}
        total={total}
        onViewReview={() => onSetShowReview(true)}
        onBackToLobby={onBackToLobby}
      />
    );
  }

  // Question-by-question review mode
  return (
    <div className="w-full bg-white rounded-[28px] p-5 shadow-md border border-[#F0EDFF] flex flex-col gap-4">
      <div className="flex justify-between items-center pb-2 border-b border-[#F0EDFF]">
        <span className="text-[10px] font-extrabold text-[#9C98A6] uppercase tracking-wider">
          Review Jawaban
        </span>
        <button
          onClick={() => {
            if (viewingHistory) {
              onBackToLobby();
              onSetShowReview(false);
            } else {
              onSetShowReview(false);
            }
          }}
          className="text-xs font-extrabold text-[#8C66FF] cursor-pointer hover:underline"
        >
          Kembali
        </button>
      </div>

      {/* Summary Info */}
      <div className="bg-[#FAF9FF] p-3.5 rounded-2xl border border-[#F0EDFF]/50 flex flex-col gap-1.5 text-[10px] font-semibold text-[#9C98A6]">
        <div className="flex justify-between items-center">
          <span>Durasi Pengerjaan:</span>
          <span className="font-black text-[#8C66FF]">{formatDurationFriendly(duration)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Soal Terjawab / Kosong:</span>
          <span>
            <strong className="text-[#2C8578] font-black">{answeredCount}</strong>
            <span className="mx-1.5 text-[#D0CDE0]">/</span>
            <strong className="text-[#FF5E8C] font-black">{emptyCount}</strong>
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="max-h-95 overflow-y-auto space-y-4 pr-1 no-scrollbar">
        {quiz.questions.map((q, idx) => {
          const userAns = answers[q.id] || [];
          const correctAns = q.correctAnswers;
          const isCorrect =
            userAns.length === correctAns.length &&
            userAns.every((v) => correctAns.includes(v));

          const userAnsText =
            userAns.length > 0
              ? userAns.map((i) => String.fromCharCode(65 + i)).join(", ")
              : "Tidak dijawab";

          const correctAnsText = correctAns.map((i) => String.fromCharCode(65 + i)).join(", ");

          return (
            <div key={q.id} className={`pt-4 ${idx === 0 ? "pt-0" : "border-t border-[#FAF9FF]"}`}>
              {q.images && q.images.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {q.images.map((img, imgIdx) => (
                    <img
                      key={imgIdx}
                      src={getQuizImageUrl(img)}
                      alt="Ilustrasi"
                      loading="lazy"
                      className="max-h-20 object-contain rounded-lg border border-[#F0EDFF]"
                    />
                  ))}
                </div>
              )}
              <p className="text-xs font-extrabold text-[#2C2B30] mb-2 leading-relaxed">
                {idx + 1}. {q.text}
              </p>
              <div className="text-[10px] font-semibold space-y-1.5 bg-[#FAF9FF] p-3 rounded-2xl">
                <p className="flex justify-between items-center">
                  <span className="text-[#9C98A6]">Jawaban Anda:</span>
                  <span className={`font-black ${isCorrect ? "text-[#2C8578]" : "text-[#FF5E8C]"}`}>
                    {userAnsText}
                  </span>
                </p>
                <p className="flex justify-between items-center">
                  <span className="text-[#9C98A6]">Jawaban Benar:</span>
                  <span className="font-black text-[#8C66FF]">{correctAnsText}</span>
                </p>
                <p className="flex justify-between items-center pt-1 border-t border-[#F0EDFF]/50 text-[9px] font-extrabold uppercase tracking-wider">
                  <span>Status:</span>
                  <span className={isCorrect ? "text-[#2C8578]" : "text-[#FF5E8C]"}>
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
          onBackToLobby();
          onSetShowReview(false);
        }}
        className="w-full py-3.5 bg-[#8C66FF] hover:bg-[#7844FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center active:scale-[0.99]"
      >
        Kembali ke Menu Tes
      </button>
    </div>
  );
}
