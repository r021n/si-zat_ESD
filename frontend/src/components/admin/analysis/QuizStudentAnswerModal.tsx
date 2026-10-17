import { FiX, FiCheckCircle, FiXCircle, FiMinusCircle, FiAlertTriangle } from "react-icons/fi";
import type { Submission } from "../../../types/quiz";
import type { StudentResultItem } from "./quizAnalysisStats";
import { formatDurationFriendly } from "../../../utils/time";

interface QuizStudentAnswerModalProps {
  submission: Submission | null;
  totalQuestions: number;
  studentResults: StudentResultItem[];
  kkmActive: boolean;
  kkmValue: number | null;
  onClose: () => void;
}

export default function QuizStudentAnswerModal({
  submission,
  totalQuestions,
  studentResults,
  kkmActive,
  kkmValue,
  onClose,
}: QuizStudentAnswerModalProps) {
  if (!submission) return null;

  const studentCorrectCount = studentResults.filter((r) => r.isCorrect).length;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-3 sm:p-4 md:p-6 backdrop-blur-xs">
      <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-107.5 md:max-w-3xl lg:max-w-4xl max-h-[90vh] bg-[#FAF9FF] rounded-[24px] sm:rounded-[28px] md:rounded-[32px] shadow-2xl border border-[#F0EDFF] flex flex-col overflow-hidden animate-none select-none text-left">
        {/* Header Modal */}
        <div className="bg-white p-3.5 sm:p-4 md:p-5 border-b border-[#F0EDFF] flex justify-between items-center shrink-0">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#9C98A6]">
              Lembar Jawaban Siswa
            </p>
            <h2 className="text-sm md:text-base font-black text-[#2C2B30] truncate mt-0.5">
              {submission.studentName}
            </h2>
            <p className="text-[10px] md:text-xs font-bold text-[#8C66FF]">
              Kelas: {submission.studentClass || "-"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FAF9FF] border border-[#F0EDFF] text-[#2C2B30] flex items-center justify-center hover:bg-neutral-100 cursor-pointer shrink-0 transition-colors"
            title="Tutup"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Score & Summary Metrics */}
        <div className="p-2.5 sm:p-3.5 md:p-4 grid grid-cols-4 gap-2 sm:gap-2.5 md:gap-4 bg-white/70 border-b border-[#F0EDFF] shrink-0">
          <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-[#F0EDFF] text-center flex flex-col shadow-xs min-w-0">
            <span className="text-[7.5px] sm:text-[9px] uppercase tracking-wider font-extrabold text-[#9C98A6] truncate">
              Skor Siswa
            </span>
            <span className="text-sm sm:text-base md:text-xl font-black text-[#8C66FF] mt-0.5 truncate">
              {submission.score}
              <span className="text-[9px] sm:text-[10px] font-semibold text-[#9C98A6]">/100</span>
            </span>
            {kkmActive && submission.score < (kkmValue as number) && (
              <span className="mt-1 inline-flex items-center justify-center gap-1 px-2 py-0.5 bg-[#FFEBF0] text-[#FF5E8C] rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider shrink-0">
                <FiAlertTriangle size={9} />
                Di Bawah KKM
              </span>
            )}
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-[#F0EDFF] text-center flex flex-col shadow-xs min-w-0">
            <span className="text-[7.5px] sm:text-[9px] uppercase tracking-wider font-extrabold text-[#9C98A6] truncate">
              Jumlah Benar
            </span>
            <span className="text-sm sm:text-base md:text-xl font-black text-[#2C8578] mt-0.5 truncate">
              {studentCorrectCount}
              <span className="text-[9px] sm:text-[10px] font-semibold text-[#9C98A6]">
                /{totalQuestions}
              </span>
            </span>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-[#F0EDFF] text-center flex flex-col shadow-xs min-w-0">
            <span className="text-[7.5px] sm:text-[9px] uppercase tracking-wider font-extrabold text-[#9C98A6] truncate">
              Waktu
            </span>
            <span className="text-sm sm:text-base md:text-xl font-black text-[#2C2B30] mt-0.5 font-mono truncate">
              {formatDurationFriendly(submission.duration)}
            </span>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-[#F0EDFF] text-center flex flex-col shadow-xs min-w-0">
            <span className="text-[7.5px] sm:text-[9px] uppercase tracking-wider font-extrabold text-[#9C98A6] truncate">
              Keluar App
            </span>
            <span
              className={`text-sm sm:text-base md:text-xl font-black mt-0.5 truncate ${
                (submission.violationCount ?? 0) > 0 ? "text-[#FF5E8C]" : "text-[#2C2B30]"
              }`}
            >
              {submission.violationCount ?? 0}x
            </span>
          </div>
        </div>

        {/* Questions & Options List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 flex flex-col md:grid md:grid-cols-2 md:gap-4 gap-3.5 no-scrollbar">
          {studentResults.map(({ question: q, index: qIdx, studentAns, correct, isAnswered, isCorrect }) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl p-4 md:p-5 border border-[#F0EDFF] shadow-xs flex flex-col gap-3"
            >
              <div className="flex justify-between items-start gap-2 border-b border-[#F0EDFF]/60 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-[#8C66FF]">Soal #{qIdx + 1}</span>
                  {q.questionType && (
                    <span className="px-2 py-0.5 bg-[#F0ECFF] text-[#8C66FF] rounded-md text-[9px] uppercase tracking-wider font-extrabold">
                      {q.questionType}
                    </span>
                  )}
                </div>

                {isCorrect ? (
                  <span className="px-2.5 py-0.5 bg-[#E6F8F6] text-[#2C8578] rounded-full text-[10px] font-black flex items-center gap-1 shrink-0">
                    <FiCheckCircle size={12} /> Benar
                  </span>
                ) : isAnswered ? (
                  <span className="px-2.5 py-0.5 bg-[#FFEBF0] text-[#FF5E8C] rounded-full text-[10px] font-black flex items-center gap-1 shrink-0">
                    <FiXCircle size={12} /> Salah
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-[#FAF9FF] text-[#9C98A6] border border-[#F0EDFF] rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0">
                    <FiMinusCircle size={12} /> Tidak Dijawab
                  </span>
                )}
              </div>

              {q.images && q.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-1">
                  {q.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Soal ${qIdx + 1}`}
                      className="h-32 rounded-xl object-contain bg-neutral-50 border border-[#F0EDFF]"
                    />
                  ))}
                </div>
              )}

              <p className="text-xs font-bold leading-relaxed text-[#2C2B30]">{q.text}</p>

              <div className="flex flex-col gap-2 mt-1">
                {q.options.map((opt, optIdx) => {
                  const isChosen = studentAns.includes(optIdx);
                  const isCorrectOption = correct.includes(optIdx);
                  const letter = String.fromCharCode(65 + optIdx);

                  let containerStyle = "bg-[#FAF9FF]/60 border-[#F0EDFF] text-[#6B6875]";
                  if (isCorrectOption) {
                    containerStyle = "bg-[#E6F8F6] border-[#2C8578] text-[#2C8578] font-bold";
                  } else if (isChosen) {
                    containerStyle = "bg-[#FFEBF0] border-[#FF5E8C] text-[#D95276] font-bold";
                  }

                  return (
                    <div
                      key={optIdx}
                      className={`p-2.5 rounded-xl border flex items-start gap-2 ${containerStyle}`}
                    >
                      <span className="font-black text-[11px] shrink-0 mt-0.5">{letter}.</span>
                      <span className="text-xs leading-snug break-words">{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 md:p-4 bg-white border-t border-[#F0EDFF] shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] md:text-xs rounded-full shadow-md shadow-purple-100 cursor-pointer hover:bg-[#7b55f0] transition-colors flex items-center justify-center"
          >
            Tutup Lembar Jawaban
          </button>
        </div>
      </div>
    </div>
  );
}
