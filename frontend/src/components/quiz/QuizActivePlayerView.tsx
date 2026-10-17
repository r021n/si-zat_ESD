import { FiClock, FiAlertTriangle } from "react-icons/fi";
import type { Quiz } from "../../types/quiz";
import { formatDurationMMSS } from "../../utils/time";
import { getQuizImageUrl } from "../../utils/quizImage";

interface QuizActivePlayerViewProps {
  quiz: Quiz;
  currentIdx: number;
  answers: Record<string, number[]>;
  elapsedTime: number;
  violationCount: number;
  onSelectOption: (questionId: string, optIdx: number, isMulti: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
}

export default function QuizActivePlayerView({
  quiz,
  currentIdx,
  answers,
  elapsedTime,
  violationCount,
  onSelectOption,
  onNext,
  onPrev,
  onSubmit,
}: QuizActivePlayerViewProps) {
  const currentQuestion = quiz.questions[currentIdx];
  const userAnswers = answers[currentQuestion.id] || [];
  const isMulti = currentQuestion.correctAnswers.length > 1;

  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] && answers[k].length > 0,
  ).length;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Quiz Progress & Timer Header */}
      <div className="flex justify-between items-center text-[10px] font-extrabold text-[#9C98A6] uppercase tracking-wide px-1">
        <span>
          Soal {currentIdx + 1} dari {quiz.questions.length}
        </span>
        <div className="flex items-center gap-1 text-[#8C66FF] font-black">
          <FiClock size={12} />
          <span>{formatDurationMMSS(elapsedTime)}</span>
        </div>
        <span>Terjawab: {answeredCount}</span>
      </div>

      {/* Violation Alert Badge */}
      {violationCount > 0 && (
        <div className="w-full bg-[#FFF0F3] border border-[#FFD6E0] rounded-2xl px-4 py-2.5 flex items-center justify-between text-[#FF5E8C] text-[11px] font-bold">
          <span className="flex items-center gap-1.5">
            <FiAlertTriangle size={14} className="shrink-0" />
            <span>Peringatan: Terdeteksi keluar aplikasi</span>
          </span>
          <span className="bg-[#FF5E8C] text-white px-2 py-0.5 rounded-full text-[10px] font-black shrink-0">
            {violationCount}x
          </span>
        </div>
      )}

      {/* Question Text & Images */}
      <div className="w-full bg-white rounded-3xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-3">
        {currentQuestion.images && currentQuestion.images.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-1">
            {currentQuestion.images.map((img, imgIdx) => (
              <img
                key={imgIdx}
                src={getQuizImageUrl(img)}
                alt={`Ilustrasi Soal ${imgIdx + 1}`}
                loading="lazy"
                className="max-h-35 max-w-full object-contain rounded-xl border border-[#F0EDFF]"
              />
            ))}
          </div>
        )}
        <p className="text-xs font-extrabold text-[#2C2B30] leading-relaxed">
          {currentQuestion.text}
        </p>
        {isMulti && (
          <span className="text-[9px] font-extrabold tracking-wider text-[#9C98A6] uppercase">
            (Pilih semua opsi yang benar)
          </span>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {currentQuestion.options.map((opt, optIdx) => {
          const optionLetter = String.fromCharCode(65 + optIdx);
          const isSelected = userAnswers.includes(optIdx);

          return (
            <button
              key={optIdx}
              onClick={() => onSelectOption(currentQuestion.id, optIdx, isMulti)}
              className={`w-full p-4 rounded-[20px] border text-left text-xs font-semibold cursor-pointer flex gap-4 items-center transition-none shadow-[0_2px_8px_rgba(0,0,0,0.01)] ${
                isSelected
                  ? "bg-[#8C66FF] text-white border-[#8C66FF]"
                  : "bg-white text-[#2C2B30] border-[#F0EDFF]"
              }`}
            >
              <span
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs border ${
                  isSelected
                    ? "bg-white/20 border-white/30 text-white"
                    : "bg-[#FAF9FF] border-[#F0EDFF] text-[#8C66FF]"
                }`}
              >
                {optionLetter}
              </span>
              <span className="leading-tight flex-1 font-extrabold">{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onPrev}
          disabled={currentIdx === 0}
          className="flex-1 py-3.5 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Sebelumnya
        </button>

        {currentIdx < quiz.questions.length - 1 ? (
          <button
            onClick={onNext}
            className="flex-1 py-3.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center"
          >
            Selanjutnya
          </button>
        ) : (
          <button
            onClick={onSubmit}
            className="flex-1 py-3.5 bg-[#FF5E8C] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-red-100 cursor-pointer transition-none flex items-center justify-center"
          >
            Kirim Jawaban
          </button>
        )}
      </div>
    </div>
  );
}
