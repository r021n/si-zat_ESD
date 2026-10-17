import type { ProcessedQuestion } from "./quizAnalysisStats";
import type { Submission } from "../../../types/quiz";

interface QuizItemAnalysisGridProps {
  questions: ProcessedQuestion[];
  quizSubmissions: Submission[];
  itemSort: "ORDER_ASC" | "ACCURACY_DESC" | "ACCURACY_ASC" | "ANSWERED_DESC" | "EMPTY_DESC";
  onItemSortChange: (sort: "ORDER_ASC" | "ACCURACY_DESC" | "ACCURACY_ASC" | "ANSWERED_DESC" | "EMPTY_DESC") => void;
}

export default function QuizItemAnalysisGrid({
  questions,
  quizSubmissions,
  itemSort,
  onItemSortChange,
}: QuizItemAnalysisGridProps) {
  return (
    <div className="flex flex-col gap-3 flex-1 overflow-hidden">
      <div className="flex justify-end items-center text-[9px] md:text-[10px] font-bold text-[#9C98A6] uppercase px-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <span>Urutan:</span>
          <select
            value={itemSort}
            onChange={(e: any) => onItemSortChange(e.target.value)}
            className="border border-[#F0EDFF] bg-white text-[#2C2B30] px-3 py-1.5 text-[9px] md:text-xs font-bold rounded-xl outline-none cursor-pointer shadow-xs"
          >
            <option value="ORDER_ASC">Urutan Soal</option>
            <option value="ACCURACY_DESC">Akurasi Terbaik</option>
            <option value="ACCURACY_ASC">Akurasi Terburuk</option>
            <option value="ANSWERED_DESC">Paling Banyak Diisi</option>
            <option value="EMPTY_DESC">Paling Banyak Dikosongi</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-5 overflow-y-auto pr-1 no-scrollbar md:content-start">
        {questions.map((q) => (
          <div
            key={q.id}
            className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] flex flex-col gap-4 shrink-0"
          >
            <div className="flex justify-between items-center border-b border-[#F0EDFF]/70 pb-2.5">
              <span className="text-xs md:text-sm font-extrabold text-[#8C66FF]">
                Soal #{q.originalIndex + 1}
                {q.questionType && (
                  <span className="ml-2 px-2.5 py-0.5 bg-[#F0ECFF] text-[#8C66FF] rounded-md text-[9px] md:text-[10px] uppercase tracking-wider font-black">
                    {q.questionType}
                  </span>
                )}
              </span>
              <span className="text-[10px] md:text-xs font-mono font-bold px-2.5 py-1 bg-[#E6F8F6] text-[#2C8578] rounded-full">
                Akurasi: {q.accuracy}%
              </span>
            </div>

            <p className="text-xs md:text-sm font-bold leading-relaxed text-[#2C2B30] line-clamp-3">
              {q.text}
            </p>

            {/* Choice distribution bar graphs */}
            <div className="flex flex-col gap-2.5">
              {q.options.map((opt, optIdx) => {
                const isCorrect = q.correctAnswers.includes(optIdx);
                const letter = String.fromCharCode(65 + optIdx);
                const chosenCount = quizSubmissions.filter((sub) => {
                  const ans = sub.answers[q.id] || [];
                  return ans.includes(optIdx);
                }).length;

                const percent =
                  quizSubmissions.length > 0
                    ? Math.round((chosenCount / quizSubmissions.length) * 100)
                    : 0;

                return (
                  <div key={optIdx} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[9px] md:text-[10px] font-bold">
                      <span
                        className={`truncate max-w-[200px] md:max-w-xs ${
                          isCorrect ? "text-[#2C8578]" : "text-[#2C2B30]"
                        }`}
                      >
                        {isCorrect ? "[✓] " : ""}
                        {letter}. {opt}
                      </span>
                      <span className="font-mono text-[#9C98A6]">
                        {chosenCount} siswa ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#FAF9FF] border border-[#F0EDFF] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCorrect ? "bg-[#2C8578]" : "bg-[#8C66FF]"
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
