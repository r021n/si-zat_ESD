import { FiPlus, FiTrash2 } from "react-icons/fi";

interface AnnouncementQuestionListProps {
  questions: string[];
  validQuestionsCount: number;
  onAddQuestion: () => void;
  onUpdateQuestion: (index: number, val: string) => void;
  onRemoveQuestion: (index: number) => void;
}

export default function AnnouncementQuestionList({
  questions,
  validQuestionsCount,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
}: AnnouncementQuestionListProps) {
  return (
    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-3">
      <div className="flex justify-between items-center gap-2 flex-wrap pb-2 border-b border-[#F0EDFF]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs md:text-sm font-black text-[#2C2B30]">
              ❓ Pertanyaan Analisis
            </label>
            <span className="text-[10px] md:text-xs bg-[#EDE9FE] text-[#8C66FF] font-black px-2.5 py-0.5 rounded-full">
              {validQuestionsCount} butir
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onAddQuestion}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F0FF] hover:bg-[#EDE9FE] text-[#8C66FF] font-bold text-xs rounded-xl transition-colors active:scale-95 cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
        >
          <FiPlus size={14} />
          <span>Tambah Butir</span>
        </button>
      </div>

      <div className="space-y-3 pt-1">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-3 bg-[#FAF9FF] border border-[#F0EDFF] rounded-2xl focus-within:border-[#8C66FF] focus-within:bg-white transition-colors min-w-0"
          >
            <span className="w-7 h-7 rounded-xl bg-[#EDE9FE] text-[#8C66FF] font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#DDD6FE]/60 shadow-2xs">
              {idx + 1}
            </span>
            <textarea
              rows={2}
              placeholder={
                idx === 0
                  ? "Contoh: Apa saja kemungkinan penyebab utama pencemaran sungai tersebut?"
                  : idx === 1
                    ? "Contoh: Bagaimana dampak pencemaran tersebut terhadap ekosistem perairan dan masyarakat sekitar?"
                    : `Tulis butir pertanyaan analisis ke-${idx + 1}...`
              }
              value={q}
              onChange={(e) => onUpdateQuestion(idx, e.target.value)}
              className="flex-1 min-w-0 bg-transparent font-medium text-[#2C2B30] focus:outline-none leading-relaxed text-xs md:text-sm resize-none"
            />
            <button
              type="button"
              onClick={() => onRemoveQuestion(idx)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9C98A6] hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors shrink-0 mt-0.5 active:scale-90 cursor-pointer"
              title={
                questions.length === 1 && idx === 0
                  ? "Kosongkan butir ini"
                  : "Hapus butir pertanyaan ini"
              }
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {questions.length > 0 && (
        <button
          type="button"
          onClick={onAddQuestion}
          className="w-full py-2.5 border border-dashed border-[#8C66FF]/40 bg-[#FAF8FF] hover:bg-[#F3EFFF] text-[#8C66FF] font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98 mt-2"
        >
          <FiPlus size={14} />
          <span>Tambah Butir Pertanyaan Baru</span>
        </button>
      )}
    </div>
  );
}
