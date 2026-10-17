import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import type { PuzzlePair } from "./QuizPuzzleComponent";

interface QuizPuzzleBoardProps {
  pairs: PuzzlePair[];
  shuffledRight: { pairId: string; text: string }[];
  selectedLeftId: string | null;
  matchedPairs: Record<string, string>;
  submitted: boolean;
  getPairColor: (leftId: string) => { bg: string; border: string; text: string };
  onSelectLeft: (id: string) => void;
  onSelectRight: (id: string) => void;
}

export default function QuizPuzzleBoard({
  pairs,
  shuffledRight,
  selectedLeftId,
  matchedPairs,
  submitted,
  getPairColor,
  onSelectLeft,
  onSelectRight,
}: QuizPuzzleBoardProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-1 w-full min-w-0">
      {/* Left Column - Key / Concept Cards */}
      <div className="flex flex-col gap-2 min-w-0 w-full">
        <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#9C98A6] text-center mb-0.5 truncate">
          Istilah
        </span>
        {pairs?.map((pair, idx) => {
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
              onClick={() => onSelectLeft(pair.id)}
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
              onClick={() => onSelectRight(rItem.pairId)}
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
  );
}
