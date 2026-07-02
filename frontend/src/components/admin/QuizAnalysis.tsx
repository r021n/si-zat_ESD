import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswers: number[];
  images: string[];
  questionType?: string;
}

interface Quiz {
  id: string;
  title: string;
  createdAt: string;
  questions: Question[];
}

interface Submission {
  id: string;
  quizId: string;
  studentName: string;
  studentClass: string;
  answers: Record<string, number[]>;
  score: number;
  duration?: number;
  createdAt: string;
}

interface QuizAnalysisProps {
  selectedQuiz: Quiz;
  submissions: Submission[];
  onClose: () => void;
}

const formatDurationFriendly = (seconds?: number) => {
  if (seconds === undefined || seconds === null) return "-";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
};

export default function QuizAnalysis({
  selectedQuiz,
  submissions,
  onClose
}: QuizAnalysisProps) {
  const [analysisTab, setAnalysisTab] = useState<"SUMMARY" | "ITEMS">("SUMMARY");
  const [scoreSort, setScoreSort] = useState<"NAME_ASC" | "SCORE_DESC" | "SCORE_ASC">("NAME_ASC");
  const [itemSort, setItemSort] = useState<"ORDER_ASC" | "ACCURACY_DESC" | "ACCURACY_ASC" | "ANSWERED_DESC" | "EMPTY_DESC">("ORDER_ASC");

  const quizSubmissions = submissions.filter(s => s.quizId === selectedQuiz.id);
  const avgScore = quizSubmissions.length > 0 
    ? Math.round(quizSubmissions.reduce((sum, s) => sum + s.score, 0) / quizSubmissions.length)
    : 0;

  // Sorting logic for student submissions
  const sortedSubmissions = [...quizSubmissions].sort((a, b) => {
    if (scoreSort === "SCORE_DESC") {
      return b.score - a.score;
    } else if (scoreSort === "SCORE_ASC") {
      return a.score - b.score;
    } else {
      return a.studentName.localeCompare(b.studentName);
    }
  });

  // Calculate question stats and sort
  const processedQuestions = selectedQuiz.questions.map((q, qIdx) => {
    const correctCount = quizSubmissions.filter(sub => {
      const ans = sub.answers[q.id] || [];
      const correct = q.correctAnswers;
      return ans.length === correct.length && ans.every(v => correct.includes(v));
    }).length;

    const accuracy = quizSubmissions.length > 0
      ? Math.round((correctCount / quizSubmissions.length) * 100)
      : 0;

    const answeredCount = quizSubmissions.filter(sub => {
      const ans = sub.answers[q.id];
      return ans && ans.length > 0;
    }).length;

    const emptyCount = quizSubmissions.length - answeredCount;

    return {
      ...q,
      originalIndex: qIdx,
      accuracy,
      answeredCount,
      emptyCount,
    };
  });

  const sortedQuestions = [...processedQuestions].sort((a, b) => {
    if (itemSort === "ACCURACY_DESC") {
      return b.accuracy - a.accuracy;
    } else if (itemSort === "ACCURACY_ASC") {
      return a.accuracy - b.accuracy;
    } else if (itemSort === "ANSWERED_DESC") {
      return b.answeredCount - a.answeredCount;
    } else if (itemSort === "EMPTY_DESC") {
      return b.emptyCount - a.emptyCount;
    } else {
      return a.originalIndex - b.originalIndex;
    }
  });

  return (
    <div className="w-full flex-1 flex flex-col justify-between overflow-hidden">
      <div className="w-full flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="w-full flex justify-between items-center mt-4 pb-4 border-b border-[#F0EDFF]/50 flex-shrink-0">
          <div className="max-w-[70%]">
            <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">Hasil Analisis</p>
            <h1 className="text-sm font-extrabold text-[#2C2B30] truncate leading-tight mt-0.5">{selectedQuiz.title}</h1>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#FFEAEA] text-[#FF5E8C] text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-sm cursor-pointer transition-none flex-shrink-0"
          >
            Tutup
          </button>
        </div>

        {/* Core Analytics Calculations */}
        <div className="w-full mt-4 flex-1 flex flex-col gap-4 overflow-hidden">
          {/* General Stats */}
          <div className="grid grid-cols-2 gap-3 flex-shrink-0">
            <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] text-center flex flex-col gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#9C98A6]">Siswa Menjawab</span>
              <span className="text-2xl font-black text-[#8C66FF]">{quizSubmissions.length}</span>
            </div>
            <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] text-center flex flex-col gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#9C98A6]">Nilai Rata-Rata</span>
              <span className="text-2xl font-black text-[#2C8578]">{avgScore}</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 bg-[#F0ECFF]/50 p-1.5 rounded-2xl border border-[#F0EDFF] flex-shrink-0">
            <button
              onClick={() => setAnalysisTab("SUMMARY")}
              className={`py-2 px-4 rounded-xl cursor-pointer text-center text-xs font-extrabold uppercase transition-none ${
                analysisTab === "SUMMARY" 
                  ? "bg-white text-[#8C66FF] shadow-sm" 
                  : "bg-transparent text-[#9C98A6]"
              }`}
            >
              Daftar Skor
            </button>
            <button
              onClick={() => setAnalysisTab("ITEMS")}
              className={`py-2 px-4 rounded-xl cursor-pointer text-center text-xs font-extrabold uppercase transition-none ${
                analysisTab === "ITEMS" 
                  ? "bg-white text-[#8C66FF] shadow-sm" 
                  : "bg-transparent text-[#9C98A6]"
              }`}
            >
              Analisis Soal
            </button>
          </div>

          {/* Empty State */}
          {quizSubmissions.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-[#F0EDFF] p-8 text-center flex flex-col gap-2 items-center shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex-shrink-0">
              <p className="text-xs font-extrabold text-[#9C98A6] uppercase tracking-wider">Belum ada respon siswa.</p>
            </div>
          ) : (
            <div className="w-full flex-1 flex flex-col overflow-hidden">
              {/* TAB A: SUMMARY TABLE */}
              {analysisTab === "SUMMARY" && (
                <div className="flex flex-col gap-2 flex-1 overflow-hidden">
                  <div className="flex justify-between items-center text-[9px] font-bold text-[#9C98A6] uppercase px-1 flex-shrink-0">
                    <span>Daftar Nilai Siswa</span>
                    <div className="flex items-center gap-1.5">
                      <span>Urutan:</span>
                      <select
                        value={scoreSort}
                        onChange={(e) => setScoreSort(e.target.value as any)}
                        className="border border-[#F0EDFF] bg-white text-[#2C2B30] px-2.5 py-1 text-[9px] font-bold rounded-lg outline-none cursor-pointer"
                      >
                        <option value="NAME_ASC">Abjad</option>
                        <option value="SCORE_DESC">Skor Terbaik</option>
                        <option value="SCORE_ASC">Skor Terendah</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto border border-[#F0EDFF] rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.02)] bg-white overflow-hidden">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="sticky top-0 bg-[#FAF9FF] z-10">
                        <tr className="bg-[#FAF9FF] text-[#2C2B30] border-b border-[#F0EDFF] uppercase font-black text-[9px] tracking-wider">
                          <th className="p-3 border-r border-[#F0EDFF]/50">Nama</th>
                          <th className="p-3 border-r border-[#F0EDFF]/50 text-center">Kelas</th>
                          <th className="p-3 border-r border-[#F0EDFF]/50 text-center">Durasi</th>
                          <th className="p-3 border-r border-[#F0EDFF]/50 text-center">Soal (T/K)</th>
                          <th className="p-3 text-center">Skor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedSubmissions.map((sub, sIdx) => {
                          const subAnsweredCount = Object.keys(sub.answers).filter(
                            qId => sub.answers[qId] && sub.answers[qId].length > 0
                          ).length;
                          const subEmptyCount = selectedQuiz.questions.length - subAnsweredCount;
                          
                          return (
                            <tr key={sub.id} className={`border-b border-[#F0EDFF]/30 ${sIdx % 2 === 1 ? "bg-[#FAF9FF]/40" : "bg-white"}`}>
                              <td className="p-3 font-bold truncate max-w-[120px] text-[#2C2B30]">{sub.studentName}</td>
                              <td className="p-3 text-center font-mono text-[#9C98A6] font-bold">{sub.studentClass}</td>
                              <td className="p-3 text-center font-mono text-[#9C98A6] font-semibold">{formatDurationFriendly(sub.duration)}</td>
                              <td className="p-3 text-center font-mono text-[#9C98A6] font-semibold">
                                <span className="text-[#2C8578]">{subAnsweredCount}</span>
                                <span className="text-[#9C98A6]">/</span>
                                <span className="text-[#FF5E8C]">{subEmptyCount}</span>
                              </td>
                              <td className="p-3 text-center font-mono font-black text-sm text-[#8C66FF]">{sub.score}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB B: ITEM ACCURACY ANALYSIS */}
              {analysisTab === "ITEMS" && (
                <div className="flex flex-col gap-3 flex-1 overflow-hidden">
                  <div className="flex justify-end items-center text-[9px] font-bold text-[#9C98A6] uppercase px-1 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span>Urutan:</span>
                      <select
                        value={itemSort}
                        onChange={(e) => setItemSort(e.target.value as any)}
                        className="border border-[#F0EDFF] bg-white text-[#2C2B30] px-2.5 py-1 text-[9px] font-bold rounded-lg outline-none cursor-pointer"
                      >
                        <option value="ORDER_ASC">Urutan Soal</option>
                        <option value="ACCURACY_DESC">Akurasi Terbaik</option>
                        <option value="ACCURACY_ASC">Akurasi Terburuk</option>
                        <option value="ANSWERED_DESC">Paling Banyak Diisi</option>
                        <option value="EMPTY_DESC">Paling Banyak Dikosongi</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
                    {sortedQuestions.map((q) => {
                      const correctCount = quizSubmissions.filter(sub => {
                        const ans = sub.answers[q.id] || [];
                        const correct = q.correctAnswers;
                        return ans.length === correct.length && ans.every(v => correct.includes(v));
                      }).length;

                      const accuracy = quizSubmissions.length > 0
                        ? Math.round((correctCount / quizSubmissions.length) * 100)
                        : 0;

                      return (
                        <div key={q.id} className="bg-white rounded-[24px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-4 flex-shrink-0">
                          <div className="flex justify-between items-center border-b border-[#F0EDFF]/50 pb-2">
                            <span className="text-xs font-extrabold text-[#8C66FF]">
                              Soal #{q.originalIndex + 1}
                              {q.questionType && (
                                <span className="ml-1.5 px-2 py-0.5 bg-[#F0ECFF] text-[#8C66FF] rounded-md text-[9px] uppercase tracking-wider font-black">
                                  {q.questionType}
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#E6F8F6] text-[#2C8578] rounded-full">
                              Akurasi: {accuracy}%
                            </span>
                          </div>

                          <p className="text-xs font-bold leading-normal text-[#2C2B30] line-clamp-3">
                            {q.text}
                          </p>

                          {/* Choice distribution bar graphs */}
                          <div className="flex flex-col gap-2">
                            {q.options.map((opt, optIdx) => {
                              const isCorrect = q.correctAnswers.includes(optIdx);
                              const letter = String.fromCharCode(65 + optIdx);
                              const chosenCount = quizSubmissions.filter(sub => {
                                const ans = sub.answers[q.id] || [];
                                return ans.includes(optIdx);
                              }).length;

                              const percent = quizSubmissions.length > 0
                                ? Math.round((chosenCount / quizSubmissions.length) * 100)
                                : 0;

                              return (
                                <div key={optIdx} className="flex flex-col gap-1">
                                  <div className="flex justify-between text-[9px] font-bold">
                                    <span className={`truncate max-w-[200px] ${isCorrect ? "text-[#2C8578]" : "text-[#2C2B30]"}`}>
                                      {isCorrect ? "[✓] " : ""}{letter}. {opt}
                                    </span>
                                    <span className="font-mono text-[#9C98A6]">{chosenCount} mhs ({percent}%)</span>
                                  </div>
                                  <div className="w-full h-2 bg-[#FAF9FF] border border-[#F0EDFF] rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-none ${isCorrect ? "bg-[#2C8578]" : "bg-[#8C66FF]"}`} style={{ width: `${percent}%` }}></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="w-full mt-8 mb-2 flex flex-col gap-2 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-full py-4 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-xs rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center gap-2"
        >
          <FiArrowLeft className="text-sm" /> Kembali ke Daftar Kuis
        </button>
      </div>
    </div>
  );
}

