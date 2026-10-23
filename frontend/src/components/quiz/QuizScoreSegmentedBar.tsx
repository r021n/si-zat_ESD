interface QuizScoreSegmentedBarProps {
  correct: number;
  total: number;
  score: number;
  kkmQuestions: number;
  kkmScore: number;
  barFillColor: string;
  barEmptyColor: string;
}

export default function QuizScoreSegmentedBar({
  correct,
  total,
  score,
  kkmQuestions,
  kkmScore,
  barFillColor,
  barEmptyColor,
}: QuizScoreSegmentedBarProps) {
  // Percentage position of the KKM boundary
  const kkmPercentage = Math.min(100, Math.max(0, (kkmQuestions / total) * 100));

  return (
    <div className="w-full flex flex-col gap-1.5 select-none">
      {/* Top KKM Indicator Marker */}
      <div className="relative w-full h-4">
        <div
          className="absolute -translate-x-1/2 flex flex-col items-center pointer-events-none"
          style={{ left: `${kkmPercentage}%` }}
        >
          <span className="text-[9px] font-black text-[#6E38F7] tracking-wider uppercase leading-none">
            KKM
          </span>
        </div>
      </div>

      {/* Segmented Bar Row with vertical KKM separator */}
      <div className="relative w-full">
        <div className="w-full flex items-center gap-1 sm:gap-1.5 h-6.5 sm:h-7">
          {Array.from({ length: total }).map((_, idx) => {
            const isFilled = idx < correct;
            return (
              <div
                key={idx}
                className={`flex-1 h-full rounded-[4px] transition-all duration-300 ${
                  isFilled ? barFillColor : barEmptyColor
                }`}
                title={`Soal ${idx + 1}: ${isFilled ? "Benar" : "Belum Benar"}`}
              />
            );
          })}
        </div>

        {/* Vertical KKM Indicator Line spanning through segments */}
        <div
          className="absolute -top-1 bottom-[-4px] w-[2px] bg-[#6E38F7] -translate-x-1/2 pointer-events-none rounded-full shadow-[0_0_2px_rgba(110,56,247,0.5)] z-10"
          style={{ left: `${kkmPercentage}%` }}
        />
      </div>

      {/* Sub-text Information */}
      <div className="flex justify-between items-center text-[10.5px] sm:text-[11px] text-[#64748B] font-semibold mt-1">
        <div>
          <span className="font-extrabold text-[#1E293B]">{correct}</span> dari {total} soal benar{" "}
          <span className="text-[#94A3B8]">&bull;</span> nilai{" "}
          <span className="font-extrabold text-[#1E293B]">{score}</span>
        </div>
        <div>
          KKM = <span className="font-bold text-[#1E293B]">{kkmScore}</span>
        </div>
      </div>
    </div>
  );
}
