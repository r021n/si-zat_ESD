import { useState, useEffect, useMemo } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiZap,
  FiLayers,
  FiSmile,
  FiRotateCcw,
} from "react-icons/fi";

export interface PuzzlePair {
  id: string;
  left: string;
  right: string;
}

export interface PuzzleData {
  instruction: string;
  pairs: PuzzlePair[];
}

interface QuizPuzzleComponentProps {
  data: PuzzleData;
  blockIndex?: number;
}

// Color palettes for matched pairs
const PAIR_COLORS = [
  { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700" },
  { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700" },
  {
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-700",
  },
  { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700" },
  { bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-700" },
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (
    arr.length > 1 &&
    arr.every(
      (item, idx) => (item as any).pairId === (array[idx] as any).pairId,
    )
  ) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

export default function QuizPuzzleComponent({
  data,
  blockIndex,
}: QuizPuzzleComponentProps) {
  const [shuffledRight, setShuffledRight] = useState<
    { pairId: string; text: string }[]
  >([]);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  // Map leftPairId -> matched rightPairId
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Shuffle right items whenever data.pairs changes or component mounts
  useEffect(() => {
    if (data?.pairs && data.pairs.length > 0) {
      const rights = data.pairs.map((p) => ({ pairId: p.id, text: p.right }));
      setShuffledRight(shuffleArray(rights));
    }
  }, [data?.pairs]);

  const handleSelectLeft = (pairId: string) => {
    if (submitted) return;
    if (matchedPairs[pairId]) {
      // Unmatch if tapped again
      const newMatches = { ...matchedPairs };
      delete newMatches[pairId];
      setMatchedPairs(newMatches);
      setSelectedLeftId(null);
      return;
    }
    setSelectedLeftId(pairId);
  };

  const handleSelectRight = (rightPairId: string) => {
    if (submitted || !selectedLeftId) return;

    // Check if this right item is already matched to another left item
    const existingLeft = Object.keys(matchedPairs).find(
      (k) => matchedPairs[k] === rightPairId,
    );

    const newMatches = { ...matchedPairs };
    if (existingLeft) {
      delete newMatches[existingLeft];
    }

    newMatches[selectedLeftId] = rightPairId;
    setMatchedPairs(newMatches);
    setSelectedLeftId(null);
  };

  const isAllMatched =
    data?.pairs?.length > 0 &&
    Object.keys(matchedPairs).length === data.pairs.length;

  const correctCount = useMemo(() => {
    let count = 0;
    Object.entries(matchedPairs).forEach(([leftId, rightId]) => {
      if (leftId === rightId) count++;
    });
    return count;
  }, [matchedPairs]);

  const isFullyCorrect =
    data?.pairs?.length > 0 && correctCount === data.pairs.length;

  const handleSubmit = () => {
    if (!isAllMatched) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setMatchedPairs({});
    setSelectedLeftId(null);
    setSubmitted(false);
    if (data?.pairs) {
      const rights = data.pairs.map((p) => ({ pairId: p.id, text: p.right }));
      setShuffledRight(shuffleArray(rights));
    }
  };

  // Find color index for a matched pair
  const getPairColor = (leftId: string) => {
    const pairIndex = data.pairs.findIndex((p) => p.id === leftId);
    return PAIR_COLORS[pairIndex % PAIR_COLORS.length];
  };

  return (
    <div className="w-full min-w-0 bg-white rounded-2xl sm:rounded-3xl border border-[#F0EDFF] p-3.5 sm:p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col gap-3 sm:gap-4 text-left select-none">
      {/* Header Badge */}
      <div className="flex justify-between items-center pb-2 border-b border-[#F0EDFF]/80 w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 rounded-xl bg-[#F0ECFF] text-[#8C66FF] flex items-center justify-center text-xs font-black shrink-0">
            <FiLayers size={14} />
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8C66FF] truncate">
            Mencocokkan Pasangan{" "}
            {blockIndex !== undefined ? `#${blockIndex}` : ""}
          </span>
        </div>
        {submitted && (
          <span
            className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${
              isFullyCorrect
                ? "bg-[#E6F8F6] text-[#2C8578]"
                : "bg-[#FFEAEA] text-[#FF5E8C]"
            }`}
          >
            {isFullyCorrect ? (
              <FiCheckCircle size={12} />
            ) : (
              <FiXCircle size={12} />
            )}
            {correctCount} / {data.pairs.length} Benar
          </span>
        )}
      </div>

      {/* Instruction */}
      <div className="flex items-center gap-2 w-full min-w-0">
        <FiZap className="text-[#8C66FF] shrink-0" size={14} />
        <h3 className="text-xs font-extrabold text-[#2C2B30] leading-relaxed wrap-break-word min-w-0 flex-1">
          {data.instruction || "Cocokkan pasangan di bawah ini!"}
        </h3>
      </div>

      <p className="text-[10px] text-[#9C98A6] font-medium italic -mt-2 leading-tight">
        {submitted
          ? "Hasil pemeriksaan pasangan Anda:"
          : "Klik kartu di kiri, lalu klik kartu pasangan yang sesuai di kanan."}
      </p>

      {/* Cards Board Grid - Explicit 50% 50% min-w-0 grid columns */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-1 w-full min-w-0">
        {/* Left Column - Key / Concept Cards */}
        <div className="flex flex-col gap-2 min-w-0 w-full">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#9C98A6] text-center mb-0.5 truncate">
            Istilah
          </span>
          {data.pairs?.map((pair, idx) => {
            const isSelected = selectedLeftId === pair.id;
            const matchedRightId = matchedPairs[pair.id];
            const color = getPairColor(pair.id);

            let borderStyle = "border-[#F0EDFF] bg-[#FAF9FF] text-[#2C2B30]";
            if (submitted) {
              if (matchedRightId === pair.id) {
                borderStyle =
                  "border-[#2C8578] bg-[#E6F8F6] text-[#2C8578] font-bold";
              } else {
                borderStyle =
                  "border-[#FF5E8C] bg-[#FFEAEA] text-[#FF5E8C] font-bold";
              }
            } else if (matchedRightId) {
              borderStyle = `${color.border} ${color.bg} ${color.text} font-bold shadow-sm`;
            } else if (isSelected) {
              borderStyle =
                "border-[#8C66FF] bg-[#F0ECFF] text-[#8C66FF] font-bold ring-2 ring-[#8C66FF]/30 scale-[1.01]";
            }

            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => handleSelectLeft(pair.id)}
                disabled={submitted}
                className={`w-full p-2.5 sm:p-3 border rounded-xl sm:rounded-2xl transition-all cursor-pointer flex items-start justify-between min-h-11.5 shadow-xs min-w-0 ${borderStyle}`}
              >
                <div className="flex items-start gap-1.5 sm:gap-2 min-w-0 w-full">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/80 border border-current text-[9px] sm:text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-left flex-1 wrap-break-word min-w-0 leading-snug text-[11px] sm:text-xs font-medium">
                    {pair.left}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column - Definition / Value Cards */}
        <div className="flex flex-col gap-2 min-w-0 w-full">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#9C98A6] text-center mb-0.5 truncate">
            Pasangan
          </span>
          {shuffledRight.map((rItem, idx) => {
            // Find if any left item matched this right item
            const matchedLeftId = Object.keys(matchedPairs).find(
              (k) => matchedPairs[k] === rItem.pairId,
            );

            const color = matchedLeftId ? getPairColor(matchedLeftId) : null;

            let borderStyle = "border-[#F0EDFF] bg-[#FAF9FF] text-[#2C2B30]";
            if (submitted) {
              if (matchedLeftId === rItem.pairId) {
                borderStyle =
                  "border-[#2C8578] bg-[#E6F8F6] text-[#2C8578] font-bold";
              } else if (matchedLeftId) {
                borderStyle =
                  "border-[#FF5E8C] bg-[#FFEAEA] text-[#FF5E8C] font-bold";
              } else {
                borderStyle = "border-[#F0EDFF] bg-gray-50 opacity-40";
              }
            } else if (matchedLeftId && color) {
              borderStyle = `${color.border} ${color.bg} ${color.text} font-bold shadow-sm`;
            } else if (selectedLeftId) {
              borderStyle =
                "border-[#8C66FF]/60 bg-purple-50/50 hover:bg-[#F0ECFF] hover:border-[#8C66FF]";
            }

            return (
              <button
                key={rItem.pairId + idx}
                type="button"
                onClick={() => handleSelectRight(rItem.pairId)}
                disabled={submitted}
                className={`w-full p-2.5 sm:p-3 border rounded-xl sm:rounded-2xl transition-all cursor-pointer flex items-start justify-between min-h-11.5 shadow-xs min-w-0 ${borderStyle}`}
              >
                <div className="flex items-start justify-between gap-1 min-w-0 w-full">
                  <span className="text-left flex-1 wrap-break-word min-w-0 leading-snug text-[11px] sm:text-xs font-medium">
                    {rItem.text}
                  </span>

                  {submitted && matchedLeftId === rItem.pairId && (
                    <FiCheckCircle
                      className="shrink-0 text-[#2C8578] ml-1 mt-0.5"
                      size={13}
                    />
                  )}
                  {submitted &&
                    matchedLeftId &&
                    matchedLeftId !== rItem.pairId && (
                      <FiXCircle
                        className="shrink-0 text-[#FF5E8C] ml-1 mt-0.5"
                        size={13}
                      />
                    )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isAllMatched}
          className="w-full py-3 mt-1 bg-linear-to-br from-[#8C66FF] to-[#6039DF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-2xl shadow-md shadow-purple-100 disabled:opacity-40 cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          {isAllMatched
            ? "Periksa Jawaban"
            : `Pasangkan Semua (${Object.keys(matchedPairs).length}/${
                data.pairs?.length || 0
              })`}
        </button>
      ) : (
        <div className="flex flex-col gap-2 mt-1">
          <div
            className={`p-3 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 ${
              isFullyCorrect
                ? "bg-[#E6F8F6] text-[#2C8578] border border-[#2C8578]/20"
                : "bg-[#FFEAEA] text-[#FF5E8C] border border-[#FF5E8C]/20"
            }`}
          >
            {isFullyCorrect ? (
              <>
                <FiSmile size={16} /> Luar Biasa! Semua Pasangan Cocok!
              </>
            ) : (
              <>
                <FiRotateCcw size={14} /> Cobalah Lagi Untuk Mencapai 100%!
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-2.5 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-[10px] rounded-2xl shadow-sm hover:bg-[#FAF9FF] active:bg-[#F0ECFF] cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            <FiRefreshCw size={12} /> Coba Pasangkan Lagi
          </button>
        </div>
      )}
    </div>
  );
}
