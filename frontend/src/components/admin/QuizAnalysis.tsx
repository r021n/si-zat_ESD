import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswers: number[];
  images: string[];
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
  createdAt: string;
}

interface QuizAnalysisProps {
  selectedQuiz: Quiz;
  submissions: Submission[];
  onClose: () => void;
}

export default function QuizAnalysis({
  selectedQuiz,
  submissions,
  onClose
}: QuizAnalysisProps) {
  const [analysisTab, setAnalysisTab] = useState<"SUMMARY" | "ITEMS">("SUMMARY");
  const [scoreSort, setScoreSort] = useState<"NAME_ASC" | "SCORE_DESC" | "SCORE_ASC">("NAME_ASC");
  const [itemSort, setItemSort] = useState<"ORDER_ASC" | "ACCURACY_DESC" | "ACCURACY_ASC">("ORDER_ASC");

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

    return {
      ...q,
      originalIndex: qIdx,
      accuracy,
    };
  });

  const sortedQuestions = [...processedQuestions].sort((a, b) => {
    if (itemSort === "ACCURACY_DESC") {
      return b.accuracy - a.accuracy;
    } else if (itemSort === "ACCURACY_ASC") {
      return a.accuracy - b.accuracy;
    } else {
      return a.originalIndex - b.originalIndex;
    }
  });

  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="w-full flex justify-between items-center mt-4 border-b border-black pb-3">
          <div className="max-w-[70%]">
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Hasil Analisis</p>
            <h1 className="text-xs font-bold uppercase tracking-wide truncate">{selectedQuiz.title}</h1>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1.5 border border-black text-[9px] font-bold uppercase tracking-wider bg-white active:bg-black active:text-white cursor-pointer"
          >
            Tutup
          </button>
        </div>

        {/* Core Analytics Calculations */}
        <div className="w-full mt-4 flex flex-col gap-4">
          {/* General Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-black p-3 bg-neutral-50 text-center flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Siswa Menjawab</span>
              <span className="text-xl font-extrabold">{quizSubmissions.length}</span>
            </div>
            <div className="border border-black p-3 bg-neutral-50 text-center flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Nilai Rata-Rata</span>
              <span className="text-xl font-extrabold">{avgScore}</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 border border-black text-[10px] font-bold uppercase">
            <button
              onClick={() => setAnalysisTab("SUMMARY")}
              className={`py-2 cursor-pointer text-center ${
                analysisTab === "SUMMARY" ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              Daftar Skor
            </button>
            <button
              onClick={() => setAnalysisTab("ITEMS")}
              className={`py-2 cursor-pointer text-center ${
                analysisTab === "ITEMS" ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              Analisis Soal
            </button>
          </div>

          {/* Empty State */}
          {quizSubmissions.length === 0 ? (
            <div className="border border-black p-6 bg-neutral-50 text-center flex flex-col gap-2 items-center">
              <p className="text-xs font-bold text-neutral-500 uppercase">Belum ada respon siswa.</p>
            </div>
          ) : (
            <div className="w-full">
              {/* TAB A: SUMMARY TABLE */}
              {analysisTab === "SUMMARY" && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[9px] font-bold text-neutral-500 uppercase px-1">
                    <span>Daftar Nilai Siswa</span>
                    <div className="flex items-center gap-1">
                      <span>Urutkan:</span>
                      <select
                        value={scoreSort}
                        onChange={(e) => setScoreSort(e.target.value as any)}
                        className="border border-black bg-white text-black px-1 py-0.5 text-[8px] font-bold outline-none cursor-pointer"
                      >
                        <option value="NAME_ASC">Abjad (Default)</option>
                        <option value="SCORE_DESC">Skor Terbaik</option>
                        <option value="SCORE_ASC">Skor Terendah</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="max-h-[220px] overflow-y-auto border border-black">
                    <table className="w-full border-collapse text-left text-[10px]">
                      <thead>
                        <tr className="bg-black text-white uppercase font-bold text-[9px]">
                          <th className="p-2 border-r border-white">Nama</th>
                          <th className="p-2 border-r border-white text-center">Kelas</th>
                          <th className="p-2 text-center">Skor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedSubmissions.map((sub, sIdx) => (
                          <tr key={sub.id} className={`border-b border-black ${sIdx % 2 === 1 ? "bg-neutral-50" : "bg-white"}`}>
                            <td className="p-2 font-bold truncate max-w-[120px]">{sub.studentName}</td>
                            <td className="p-2 text-center font-mono">{sub.studentClass}</td>
                            <td className="p-2 text-center font-mono font-bold text-xs">{sub.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB B: ITEM ACCURACY ANALYSIS */}
              {analysisTab === "ITEMS" && (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-end items-center text-[9px] font-bold text-neutral-500 uppercase px-1">
                    <div className="flex items-center gap-1">
                      <span>Urutkan:</span>
                      <select
                        value={itemSort}
                        onChange={(e) => setItemSort(e.target.value as any)}
                        className="border border-black bg-white text-black px-1 py-0.5 text-[8px] font-bold outline-none cursor-pointer"
                      >
                        <option value="ORDER_ASC">Urutan Soal (Default)</option>
                        <option value="ACCURACY_DESC">Akurasi Terbaik</option>
                        <option value="ACCURACY_ASC">Akurasi Terburuk</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 max-h-[220px] overflow-y-auto pr-1">
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
                        <div key={q.id} className="border border-black p-3 bg-white flex flex-col gap-3">
                          <div className="flex justify-between items-start border-b border-neutral-200 pb-1.5">
                            <span className="text-xs font-bold">Soal #{q.originalIndex + 1}</span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-black bg-neutral-50">
                              Akurasi: {accuracy}%
                            </span>
                          </div>

                          <p className="text-xs font-bold leading-normal text-neutral-800 line-clamp-3">
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
                                <div key={optIdx} className="flex flex-col gap-0.5">
                                  <div className="flex justify-between text-[9px] font-bold text-neutral-700">
                                    <span className="truncate max-w-[200px]">
                                      {isCorrect ? "[✓] " : ""}{letter}. {opt}
                                    </span>
                                    <span className="font-mono">{chosenCount} mhs ({percent}%)</span>
                                  </div>
                                  <div className="w-full h-2 border border-black bg-white">
                                    <div className="bg-black h-full" style={{ width: `${percent}%` }}></div>
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
      <div className="w-full mt-8 mb-2 flex flex-col gap-2">
        <button
          onClick={onClose}
          className="w-full py-3 border border-black bg-black text-white font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black cursor-pointer flex items-center justify-center gap-1.5"
        >
          <FiArrowLeft /> Kembali ke Daftar Kuis
        </button>
      </div>
    </div>
  );
}
