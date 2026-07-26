import { useState } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiHelpCircle,
} from "react-icons/fi";

export interface McqData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizMcqComponentProps {
  data: McqData;
  blockIndex?: number;
}

export default function QuizMcqComponent({
  data,
  blockIndex,
}: QuizMcqComponentProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selectedIndex === data.correctIndex;

  const handleSelect = (index: number) => {
    if (submitted) return;
    setSelectedIndex(index);
  };

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedIndex(null);
    setSubmitted(false);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-[#F0EDFF] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col gap-4 text-left select-none">
      {/* Header Badge */}
      <div className="flex justify-between items-center pb-2 border-b border-[#F0EDFF]/80">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-[#F0ECFF] text-[#8C66FF] flex items-center justify-center text-xs font-black">
            ?
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8C66FF]">
            Kuis Pilihan Ganda{" "}
            {blockIndex !== undefined ? `#${blockIndex}` : ""}
          </span>
        </div>
        {submitted && (
          <span
            className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 ${
              isCorrect
                ? "bg-[#E6F8F6] text-[#2C8578]"
                : "bg-[#FFEAEA] text-[#FF5E8C]"
            }`}
          >
            {isCorrect ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
            {isCorrect ? "Benar!" : "Belum Tepat"}
          </span>
        )}
      </div>

      {/* Pertanyaan */}
      <h3 className="text-xs font-extrabold text-[#2C2B30] leading-relaxed">
        {data.question || "Pertanyaan Kuis"}
      </h3>

      {/* Opsi Jawaban */}
      <div className="flex flex-col gap-2.5">
        {data.options.map((opt, idx) => {
          let optionStyle =
            "border-[#F0EDFF] bg-[#FAF9FF] text-[#2C2B30] hover:border-[#8C66FF]/40 hover:bg-[#F8F6FF]";
          let badgeStyle = "bg-white border-[#F0EDFF] text-[#9C98A6]";

          if (submitted) {
            if (idx === data.correctIndex) {
              optionStyle =
                "border-[#2C8578] bg-[#E6F8F6] text-[#2C8578] font-bold shadow-sm";
              badgeStyle = "bg-[#2C8578] text-white border-transparent";
            } else if (idx === selectedIndex && !isCorrect) {
              optionStyle =
                "border-[#FF5E8C] bg-[#FFEAEA] text-[#FF5E8C] font-bold";
              badgeStyle = "bg-[#FF5E8C] text-white border-transparent";
            } else {
              optionStyle =
                "border-[#F0EDFF] bg-gray-50 opacity-50 text-[#9C98A6]";
            }
          } else if (selectedIndex === idx) {
            optionStyle =
              "border-[#8C66FF] bg-[#F0ECFF] text-[#8C66FF] font-bold shadow-sm";
            badgeStyle = "bg-[#8C66FF] text-white border-transparent";
          }

          const optionLabels = ["A", "B", "C", "D", "E", "F"];

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(idx)}
              disabled={submitted}
              className={`w-full p-3 border rounded-2xl flex items-start justify-between gap-3 text-xs transition-all cursor-pointer ${optionStyle}`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span
                  className={`w-6 h-6 rounded-lg border text-[10px] font-black flex items-center justify-center shrink-0 transition-all mt-0.5 ${badgeStyle}`}
                >
                  {optionLabels[idx] || idx + 1}
                </span>
                <span className="leading-relaxed text-left wrap-break-word whitespace-normal font-medium flex-1">
                  {opt}
                </span>
              </div>
              {submitted && idx === data.correctIndex && (
                <FiCheckCircle className="shrink-0 text-[#2C8578]" size={16} />
              )}
              {submitted && idx === selectedIndex && !isCorrect && (
                <FiXCircle className="shrink-0 text-[#FF5E8C]" size={16} />
              )}
            </button>
          );
        })}
      </div>

      {/* Periksa Jawaban / Coba Lagi */}
      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selectedIndex === null}
          className="w-full py-3 mt-1 bg-linear-to-br from-[#8C66FF] to-[#6039DF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-2xl shadow-md shadow-purple-100 disabled:opacity-40 cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          Periksa Jawaban
        </button>
      ) : (
        <div className="flex flex-col gap-3 mt-1">
          {data.explanation && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex gap-2.5 items-start ${
                isCorrect
                  ? "bg-[#E6F8F6]/60 border border-[#2C8578]/20 text-[#2C8578]"
                  : "bg-[#FFF9EA] border border-[#FFE8A3] text-[#B8860B]"
              }`}
            >
              <FiHelpCircle size={16} className="shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-extrabold block text-[10px] uppercase tracking-wider mb-0.5">
                  Penjelasan:
                </span>
                {data.explanation}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-2.5 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-[10px] rounded-2xl shadow-sm hover:bg-[#FAF9FF] active:bg-[#F0ECFF] cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            <FiRefreshCw size={12} /> Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
}
