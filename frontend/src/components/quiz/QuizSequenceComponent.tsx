import { useState, useMemo } from "react";
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiArrowUp, FiArrowDown, FiHelpCircle, FiList } from "react-icons/fi";

export interface SequenceData {
  instruction: string;
  items: string[]; // Correct sequence in original order
  explanation?: string;
}

interface QuizSequenceComponentProps {
  data: SequenceData;
  blockIndex?: number;
}

export default function QuizSequenceComponent({ data, blockIndex }: QuizSequenceComponentProps) {
  // Shuffle sequence initially
  const initialShuffledItems = useMemo(() => {
    const original = data.items.map((text, idx) => ({ originalIdx: idx, text }));
    // If length > 1, shuffle until it's not identical to original
    let shuffled = [...original].sort(() => Math.random() - 0.5);
    if (data.items.length > 1 && shuffled.every((item, i) => item.originalIdx === i)) {
      shuffled = [...shuffled].reverse();
    }
    return shuffled;
  }, [data.items]);

  const [currentSequence, setCurrentSequence] = useState(initialShuffledItems);
  const [submitted, setSubmitted] = useState(false);

  const moveItem = (index: number, direction: "up" | "down") => {
    if (submitted) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentSequence.length) return;

    const updated = [...currentSequence];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setCurrentSequence(updated);
  };

  const correctCount = useMemo(() => {
    let count = 0;
    currentSequence.forEach((item, currentPos) => {
      if (item.originalIdx === currentPos) count++;
    });
    return count;
  }, [currentSequence]);

  const isFullyCorrect = correctCount === data.items.length;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setCurrentSequence([...initialShuffledItems].sort(() => Math.random() - 0.5));
  };

  return (
    <div className="w-full bg-white rounded-[24px] border border-[#F0EDFF] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col gap-4 text-left select-none">
      {/* Header Badge */}
      <div className="flex justify-between items-center pb-2 border-b border-[#F0EDFF]/80">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-[#F0ECFF] text-[#8C66FF] flex items-center justify-center text-xs font-black">
            <FiList size={14} />
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8C66FF]">
            Urutkan Tahapan {blockIndex !== undefined ? `#${blockIndex}` : ""}
          </span>
        </div>
        {submitted && (
          <span
            className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 ${
              isFullyCorrect
                ? "bg-[#E6F8F6] text-[#2C8578]"
                : "bg-[#FFEAEA] text-[#FF5E8C]"
            }`}
          >
            {isFullyCorrect ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
            {correctCount} / {data.items.length} Urutan Benar
          </span>
        )}
      </div>

      {/* Instruction */}
      <h3 className="text-xs font-extrabold text-[#2C2B30] leading-relaxed">
        {data.instruction || "Urutkan tahapan-tahapan di bawah ini!"}
      </h3>

      <p className="text-[10px] text-[#9C98A6] font-medium italic -mt-2">
        Gunakan tombol panah ke atas/bawah untuk memindahkan posisi urutan.
      </p>

      {/* Item Sequence List */}
      <div className="flex flex-col gap-2.5">
        {currentSequence.map((item, idx) => {
          const isPosCorrect = item.originalIdx === idx;

          let borderStyle = "border-[#F0EDFF] bg-[#FAF9FF] text-[#2C2B30]";
          if (submitted) {
            if (isPosCorrect) {
              borderStyle = "border-[#2C8578] bg-[#E6F8F6] text-[#2C8578] font-bold";
            } else {
              borderStyle = "border-[#FF5E8C] bg-[#FFEAEA] text-[#FF5E8C] font-bold";
            }
          }

          return (
            <div
              key={item.text + idx}
              className={`w-full p-3 border rounded-2xl text-xs transition-all flex items-start justify-between gap-3 shadow-sm ${borderStyle}`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="w-6 h-6 rounded-lg bg-[#8C66FF] text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed text-left break-words whitespace-normal font-medium flex-1">
                  {item.text}
                </span>
              </div>

              {/* Up / Down Action buttons */}
              {!submitted ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, "up")}
                    className="w-7 h-7 bg-white border border-[#F0EDFF] rounded-lg text-[#8C66FF] flex items-center justify-center disabled:opacity-30 hover:bg-[#F0ECFF] cursor-pointer transition-all"
                  >
                    <FiArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === currentSequence.length - 1}
                    onClick={() => moveItem(idx, "down")}
                    className="w-7 h-7 bg-white border border-[#F0EDFF] rounded-lg text-[#8C66FF] flex items-center justify-center disabled:opacity-30 hover:bg-[#F0ECFF] cursor-pointer transition-all"
                  >
                    <FiArrowDown size={12} />
                  </button>
                </div>
              ) : (
                <div className="shrink-0">
                  {isPosCorrect ? (
                    <FiCheckCircle className="text-[#2C8578]" size={16} />
                  ) : (
                    <FiXCircle className="text-[#FF5E8C]" size={16} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Check / Reset Buttons */}
      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3 mt-1 bg-gradient-to-br from-[#8C66FF] to-[#6039DF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-2xl shadow-md shadow-purple-100 cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          Periksa Urutan
        </button>
      ) : (
        <div className="flex flex-col gap-3 mt-1">
          {data.explanation && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex gap-2.5 items-start ${
                isFullyCorrect
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
            <FiRefreshCw size={12} /> Acak & Susun Ulang
          </button>
        </div>
      )}
    </div>
  );
}
