import {
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiZap,
  FiLayers,
  FiSmile,
  FiRotateCcw,
} from "react-icons/fi";
import { useQuizPuzzle } from "./useQuizPuzzle";
import QuizPuzzleBoard from "./QuizPuzzleBoard";

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

export default function QuizPuzzleComponent({
  data,
  blockIndex,
}: QuizPuzzleComponentProps) {
  const {
    shuffledRight,
    selectedLeftId,
    matchedPairs,
    submitted,
    isAllMatched,
    correctCount,
    isFullyCorrect,
    handleSelectLeft,
    handleSelectRight,
    handleSubmit,
    handleReset,
    getPairColor,
  } = useQuizPuzzle(data);

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

      {/* Cards Board Grid */}
      <QuizPuzzleBoard
        pairs={data.pairs}
        shuffledRight={shuffledRight}
        selectedLeftId={selectedLeftId}
        matchedPairs={matchedPairs}
        submitted={submitted}
        getPairColor={getPairColor}
        onSelectLeft={handleSelectLeft}
        onSelectRight={handleSelectRight}
      />

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
