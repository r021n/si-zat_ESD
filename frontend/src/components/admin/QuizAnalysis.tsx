import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { updateQuizKkmApi } from "../../api/api";
import {
  FiArrowLeft,
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiMinusCircle,
  FiAlertTriangle,
  FiSave,
  FiTrash2,
} from "react-icons/fi";

import type { Quiz, Submission } from "../../types/quiz";
import { formatDurationFriendly } from "../../utils/time";

interface QuizAnalysisProps {
  selectedQuiz: Quiz;
  submissions: Submission[];
  onClose: () => void;
  onKkmChange?: (kkm: number | null) => void;
}

export default function QuizAnalysis({
  selectedQuiz,
  submissions,
  onClose,
  onKkmChange,
}: QuizAnalysisProps) {
  const { token } = useAuthStore();
  const [analysisTab, setAnalysisTab] = useState<"SUMMARY" | "ITEMS">(
    "SUMMARY",
  );
  const [scoreSort, setScoreSort] = useState<
    "NAME_ASC" | "SCORE_DESC" | "SCORE_ASC" | "VIOLATION_DESC"
  >("NAME_ASC");
  const [itemSort, setItemSort] = useState<
    | "ORDER_ASC"
    | "ACCURACY_DESC"
    | "ACCURACY_ASC"
    | "ANSWERED_DESC"
    | "EMPTY_DESC"
  >("ORDER_ASC");
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  // KKM (Ketuntasan Minimal) states — bound to this quiz only
  const [kkmValue, setKkmValue] = useState<number | null>(
    selectedQuiz.kkm ?? null,
  );
  const [kkmInput, setKkmInput] = useState<string>(
    selectedQuiz.kkm !== null && selectedQuiz.kkm !== undefined
      ? String(selectedQuiz.kkm)
      : "",
  );
  const [savingKkm, setSavingKkm] = useState(false);
  const [kkmError, setKkmError] = useState<string | null>(null);
  const [kkmSavedFlash, setKkmSavedFlash] = useState(false);

  const kkmActive = kkmValue !== null;

  const handleSaveKkm = async () => {
    if (!token || savingKkm) return;
    const raw = kkmInput.trim();
    const kkmNum = Number(raw);
    if (raw === "" || !Number.isInteger(kkmNum) || kkmNum < 0 || kkmNum > 100) {
      setKkmError("KKM harus berupa angka bulat antara 0 dan 100.");
      return;
    }
    setKkmError(null);
    setSavingKkm(true);
    try {
      await updateQuizKkmApi(token, selectedQuiz.id, kkmNum);
      setKkmValue(kkmNum);
      onKkmChange?.(kkmNum);
      setKkmSavedFlash(true);
      setTimeout(() => setKkmSavedFlash(false), 2000);
    } catch (err: any) {
      setKkmError(err.message || "Gagal menyimpan KKM.");
    } finally {
      setSavingKkm(false);
    }
  };

  const handleClearKkm = async () => {
    if (!token || savingKkm) return;
    setKkmError(null);
    setSavingKkm(true);
    try {
      await updateQuizKkmApi(token, selectedQuiz.id, null);
      setKkmValue(null);
      setKkmInput("");
      onKkmChange?.(null);
    } catch (err: any) {
      setKkmError(err.message || "Gagal menghapus KKM.");
    } finally {
      setSavingKkm(false);
    }
  };

  const quizSubmissions = submissions.filter(
    (s) => s.quizId === selectedQuiz.id,
  );
  const avgScore =
    quizSubmissions.length > 0
      ? Math.round(
          quizSubmissions.reduce((sum, s) => sum + s.score, 0) /
            quizSubmissions.length,
        )
      : 0;
  const highestScore =
    quizSubmissions.length > 0
      ? Math.max(...quizSubmissions.map((s) => s.score))
      : 0;
  const lowestScore =
    quizSubmissions.length > 0
      ? Math.min(...quizSubmissions.map((s) => s.score))
      : 0;

  const belowKkmCount = kkmActive
    ? quizSubmissions.filter((s) => s.score < (kkmValue as number)).length
    : 0;

  // Sorting logic for student submissions
  const sortedSubmissions = [...quizSubmissions].sort((a, b) => {
    if (scoreSort === "SCORE_DESC") {
      return b.score - a.score;
    } else if (scoreSort === "SCORE_ASC") {
      return a.score - b.score;
    } else if (scoreSort === "VIOLATION_DESC") {
      return (b.violationCount ?? 0) - (a.violationCount ?? 0);
    } else {
      return a.studentName.localeCompare(b.studentName);
    }
  });

  // Calculate question stats and sort
  const processedQuestions = selectedQuiz.questions.map((q, qIdx) => {
    const correctCount = quizSubmissions.filter((sub) => {
      const ans = sub.answers[q.id] || [];
      const correct = q.correctAnswers;
      return (
        ans.length === correct.length && ans.every((v) => correct.includes(v))
      );
    }).length;

    const accuracy =
      quizSubmissions.length > 0
        ? Math.round((correctCount / quizSubmissions.length) * 100)
        : 0;

    const answeredCount = quizSubmissions.filter((sub) => {
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

  // Calculate detailed student result breakdown for the selected submission modal
  const studentResults = selectedSubmission
    ? selectedQuiz.questions.map((q, qIdx) => {
        const studentAns = selectedSubmission.answers[q.id] || [];
        const correct = q.correctAnswers || [];
        const isAnswered = studentAns.length > 0;
        const isCorrect =
          isAnswered &&
          studentAns.length === correct.length &&
          studentAns.every((v) => correct.includes(v));

        return {
          question: q,
          index: qIdx,
          studentAns,
          correct,
          isAnswered,
          isCorrect,
        };
      })
    : [];

  const studentCorrectCount = studentResults.filter((r) => r.isCorrect).length;

  return (
    <div className="w-full flex-1 flex flex-col justify-between overflow-hidden">
      <div className="w-full flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="w-full flex justify-between items-center mt-2 md:mt-0 pb-4 border-b border-[#F0EDFF]/70 shrink-0">
          <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
            <button
              onClick={onClose}
              className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 hover:bg-[#FAF9FF] transition-colors shrink-0"
              title="Kembali"
            >
              <FiArrowLeft size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#9C98A6] font-bold">
                Hasil Analisis Kuis
              </p>
              <h1 className="text-sm md:text-xl font-extrabold text-[#2C2B30] truncate leading-tight mt-0.5">
                {selectedQuiz.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Core Analytics Calculations */}
        <div className="w-full mt-4 flex-1 flex flex-col gap-4 overflow-hidden">
          {/* General Stats - 4 Columns on Desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 shrink-0">
            <div className="bg-white rounded-[20px] md:rounded-[24px] p-4 md:p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] text-center flex flex-col gap-1">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                Siswa Menjawab
              </span>
              <span className="text-2xl md:text-3xl font-black text-[#8C66FF]">
                {quizSubmissions.length}
              </span>
            </div>
            <div className="bg-white rounded-[20px] md:rounded-[24px] p-4 md:p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] text-center flex flex-col gap-1">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                Nilai Rata-Rata
              </span>
              <span className="text-2xl md:text-3xl font-black text-[#2C8578]">
                {avgScore}
              </span>
            </div>
            <div className="bg-white rounded-[20px] md:rounded-[24px] p-4 md:p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] text-center flex flex-col gap-1">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                Nilai Tertinggi
              </span>
              <span className="text-2xl md:text-3xl font-black text-[#8C66FF]">
                {highestScore}
              </span>
            </div>
            <div className="bg-white rounded-[20px] md:rounded-[24px] p-4 md:p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] text-center flex flex-col gap-1">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                Nilai Terendah
              </span>
              <span className="text-2xl md:text-3xl font-black text-[#D95276]">
                {lowestScore}
              </span>
            </div>
          </div>

          {/* KKM Setting Card */}
          <div className="bg-white rounded-[20px] md:rounded-[24px] p-4 md:p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] flex flex-col md:flex-row md:items-center gap-3 md:gap-5 shrink-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                  KKM (Ketuntasan Minimal)
                </span>
                {kkmActive && (
                  <span className="px-2.5 py-0.5 bg-[#F0ECFF] text-[#8C66FF] rounded-full text-[9px] md:text-[10px] font-black">
                    KKM: {kkmValue}
                  </span>
                )}
                {kkmSavedFlash && (
                  <span className="px-2.5 py-0.5 bg-[#E6F8F6] text-[#2C8578] rounded-full text-[9px] md:text-[10px] font-black flex items-center gap-1">
                    <FiCheckCircle size={11} /> Tersimpan
                  </span>
                )}
              </div>
              <p className="text-[10px] md:text-xs text-[#9C98A6] font-semibold mt-1 leading-relaxed">
                Siswa dengan skor di bawah KKM akan diberi label "Di Bawah KKM"
                pada daftar nilai.
                {kkmActive && belowKkmCount > 0 && (
                  <>
                    {" "}
                    <strong className="text-[#FF5E8C] font-extrabold">
                      {belowKkmCount} siswa
                    </strong>{" "}
                    saat ini di bawah KKM.
                  </>
                )}
              </p>
              {kkmError && (
                <p className="text-[10px] font-bold text-[#FF5E8C] mt-1.5">
                  {kkmError}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min={0}
                max={100}
                value={kkmInput}
                onChange={(e) => {
                  setKkmInput(e.target.value);
                  setKkmError(null);
                }}
                placeholder="70"
                className="w-20 md:w-24 border border-[#F0EDFF] bg-[#FAF9FF] text-[#2C2B30] px-3 py-2.5 text-sm md:text-base font-black rounded-xl outline-none text-center focus:border-[#8C66FF]"
              />
              <button
                onClick={handleSaveKkm}
                disabled={savingKkm}
                className="px-4 py-2.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave size={13} />
                {savingKkm ? "Menyimpan..." : "Simpan"}
              </button>
              {kkmActive && (
                <button
                  onClick={handleClearKkm}
                  disabled={savingKkm}
                  title="Hapus KKM"
                  className="px-3 py-2.5 bg-white border border-[#FFEAEA] text-[#FF5E8C] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiTrash2 size={13} />
                  Hapus
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 md:max-w-md bg-[#F0ECFF]/50 p-1.5 rounded-2xl border border-[#F0EDFF] shrink-0">
            <button
              onClick={() => setAnalysisTab("SUMMARY")}
              className={`py-2 px-4 rounded-xl cursor-pointer text-center text-xs font-extrabold uppercase transition-all ${
                analysisTab === "SUMMARY"
                  ? "bg-white text-[#8C66FF] shadow-sm"
                  : "bg-transparent text-[#9C98A6] hover:text-[#8C66FF]"
              }`}
            >
              Daftar Skor ({quizSubmissions.length})
            </button>
            <button
              onClick={() => setAnalysisTab("ITEMS")}
              className={`py-2 px-4 rounded-xl cursor-pointer text-center text-xs font-extrabold uppercase transition-all ${
                analysisTab === "ITEMS"
                  ? "bg-white text-[#8C66FF] shadow-sm"
                  : "bg-transparent text-[#9C98A6] hover:text-[#8C66FF]"
              }`}
            >
              Analisis Soal ({selectedQuiz.questions.length})
            </button>
          </div>

          {/* Empty State */}
          {quizSubmissions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#F0EDFF] p-12 text-center flex flex-col gap-2 items-center shadow-[0_4px_12px_rgba(0,0,0,0.02)] shrink-0">
              <p className="text-xs md:text-sm font-extrabold text-[#9C98A6] uppercase tracking-wider">
                Belum ada respon siswa untuk kuis ini.
              </p>
            </div>
          ) : (
            <div className="w-full flex-1 flex flex-col overflow-hidden">
              {/* TAB A: SUMMARY TABLE */}
              {analysisTab === "SUMMARY" && (
                <div className="flex flex-col gap-2 flex-1 overflow-hidden">
                  <div className="flex justify-between items-center text-[9px] md:text-[10px] font-bold text-[#9C98A6] uppercase px-1 shrink-0">
                    <span className="flex items-center gap-1.5 flex-wrap">
                      Daftar Nilai Siswa
                      {kkmActive && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black normal-case ${
                            belowKkmCount > 0
                              ? "bg-[#FFEBF0] text-[#FF5E8C]"
                              : "bg-[#E6F8F6] text-[#2C8578]"
                          }`}
                        >
                          {belowKkmCount > 0
                            ? `${belowKkmCount} di bawah KKM ${kkmValue}`
                            : `Semua tuntas (KKM ${kkmValue})`}
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>Urutan:</span>
                      <select
                        value={scoreSort}
                        onChange={(e) => setScoreSort(e.target.value as any)}
                        className="border border-[#F0EDFF] bg-white text-[#2C2B30] px-3 py-1.5 text-[9px] md:text-xs font-bold rounded-xl outline-none cursor-pointer shadow-xs"
                      >
                        <option value="NAME_ASC">Abjad</option>
                        <option value="SCORE_DESC">Skor Terbaik</option>
                        <option value="SCORE_ASC">Skor Terendah</option>
                        <option value="VIOLATION_DESC">Pelanggaran Terbanyak</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto border border-[#F0EDFF] rounded-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.02)] bg-white no-scrollbar">
                    <table className="w-full min-w-[580px] border-collapse text-left text-xs md:text-sm">
                      <thead className="sticky top-0 bg-[#FAF9FF] z-10">
                        <tr className="bg-[#FAF9FF] text-[#2C2B30] border-b border-[#F0EDFF] uppercase font-black text-[9px] md:text-[10px] tracking-wider">
                          <th className="p-3.5 md:p-4 border-r border-[#F0EDFF]/50 whitespace-nowrap">
                            Nama Siswa
                          </th>
                          <th className="p-3.5 md:p-4 border-r border-[#F0EDFF]/50 text-center whitespace-nowrap">
                            Kelas
                          </th>
                          <th className="p-3.5 md:p-4 border-r border-[#F0EDFF]/50 text-center whitespace-nowrap">
                            Durasi
                          </th>
                          <th className="p-3.5 md:p-4 border-r border-[#F0EDFF]/50 text-center whitespace-nowrap">
                            Terisi / Kosong
                          </th>
                          <th className="p-3.5 md:p-4 border-r border-[#F0EDFF]/50 text-center whitespace-nowrap">
                            Keluar App
                          </th>
                          <th className="p-3.5 md:p-4 text-center whitespace-nowrap">Skor Akhir</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedSubmissions.map((sub, sIdx) => {
                          const subAnsweredCount = Object.keys(
                            sub.answers,
                          ).filter(
                            (qId) =>
                              sub.answers[qId] && sub.answers[qId].length > 0,
                          ).length;
                          const subEmptyCount =
                            selectedQuiz.questions.length - subAnsweredCount;

                          return (
                            <tr
                              key={sub.id}
                              onClick={() => setSelectedSubmission(sub)}
                              className={`border-b border-[#F0EDFF]/40 cursor-pointer transition-colors hover:bg-[#F0ECFF]/60 active:bg-[#E9E4FF] ${
                                sIdx % 2 === 1 ? "bg-[#FAF9FF]/40" : "bg-white"
                              }`}
                              title="Klik untuk melihat detail lembar jawaban siswa"
                            >
                              <td className="p-3.5 md:p-4 font-bold whitespace-nowrap text-[#2C2B30]">
                                {sub.studentName}
                              </td>
                              <td className="p-3.5 md:p-4 text-center font-mono text-[#9C98A6] font-bold whitespace-nowrap">
                                {sub.studentClass}
                              </td>
                              <td className="p-3.5 md:p-4 text-center font-mono text-[#9C98A6] font-semibold whitespace-nowrap">
                                {formatDurationFriendly(sub.duration)}
                              </td>
                              <td className="p-3.5 md:p-4 text-center font-mono text-[#9C98A6] font-semibold whitespace-nowrap">
                                <span className="text-[#2C8578] font-bold">
                                   {subAnsweredCount}
                                </span>
                                <span className="text-[#9C98A6]"> / </span>
                                <span className="text-[#FF5E8C] font-bold">
                                   {subEmptyCount}
                                </span>
                              </td>
                              <td className="p-3.5 md:p-4 border-r border-[#F0EDFF]/50 text-center font-mono font-bold whitespace-nowrap">
                                {(sub.violationCount ?? 0) > 0 ? (
                                  <span className="text-[#FF5E8C]">
                                    {sub.violationCount}x
                                  </span>
                                ) : (
                                  <span className="text-[#9C98A6]">0</span>
                                )}
                              </td>
                              <td className="p-3.5 md:p-4 text-center font-mono font-black text-sm md:text-base text-[#8C66FF] whitespace-nowrap">
                                <div className="flex flex-col items-center gap-1">
                                  <span>{sub.score}</span>
                                  {kkmActive &&
                                    sub.score < (kkmValue as number) && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFEBF0] text-[#FF5E8C] rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-wider">
                                        <FiAlertTriangle size={9} />
                                        Di Bawah KKM
                                      </span>
                                    )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB B: ITEM ACCURACY ANALYSIS - 2 COLUMNS ON DESKTOP */}
              {analysisTab === "ITEMS" && (
                <div className="flex flex-col gap-3 flex-1 overflow-hidden">
                  <div className="flex justify-end items-center text-[9px] md:text-[10px] font-bold text-[#9C98A6] uppercase px-1 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span>Urutan:</span>
                      <select
                        value={itemSort}
                        onChange={(e) => setItemSort(e.target.value as any)}
                        className="border border-[#F0EDFF] bg-white text-[#2C2B30] px-3 py-1.5 text-[9px] md:text-xs font-bold rounded-xl outline-none cursor-pointer shadow-xs"
                      >
                        <option value="ORDER_ASC">Urutan Soal</option>
                        <option value="ACCURACY_DESC">Akurasi Terbaik</option>
                        <option value="ACCURACY_ASC">Akurasi Terburuk</option>
                        <option value="ANSWERED_DESC">
                          Paling Banyak Diisi
                        </option>
                        <option value="EMPTY_DESC">
                          Paling Banyak Dikosongi
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-5 overflow-y-auto pr-1 no-scrollbar md:content-start">
                    {sortedQuestions.map((q) => {
                      const correctCount = quizSubmissions.filter((sub) => {
                        const ans = sub.answers[q.id] || [];
                        const correct = q.correctAnswers;
                        return (
                          ans.length === correct.length &&
                          ans.every((v) => correct.includes(v))
                        );
                      }).length;

                      const accuracy =
                        quizSubmissions.length > 0
                          ? Math.round(
                              (correctCount / quizSubmissions.length) * 100,
                            )
                          : 0;

                      return (
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
                              Akurasi: {accuracy}%
                            </span>
                          </div>

                          <p className="text-xs md:text-sm font-bold leading-relaxed text-[#2C2B30] line-clamp-3">
                            {q.text}
                          </p>

                          {/* Choice distribution bar graphs */}
                          <div className="flex flex-col gap-2.5">
                            {q.options.map((opt, optIdx) => {
                              const isCorrect =
                                q.correctAnswers.includes(optIdx);
                              const letter = String.fromCharCode(65 + optIdx);
                              const chosenCount = quizSubmissions.filter(
                                (sub) => {
                                  const ans = sub.answers[q.id] || [];
                                  return ans.includes(optIdx);
                                },
                              ).length;

                              const percent =
                                quizSubmissions.length > 0
                                  ? Math.round(
                                      (chosenCount / quizSubmissions.length) *
                                        100,
                                    )
                                  : 0;

                              return (
                                <div
                                  key={optIdx}
                                  className="flex flex-col gap-1"
                                >
                                  <div className="flex justify-between text-[9px] md:text-[10px] font-bold">
                                    <span
                                      className={`truncate max-w-[200px] md:max-w-xs ${
                                        isCorrect
                                          ? "text-[#2C8578]"
                                          : "text-[#2C2B30]"
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
                                        isCorrect
                                          ? "bg-[#2C8578]"
                                          : "bg-[#8C66FF]"
                                      }`}
                                      style={{ width: `${percent}%` }}
                                    ></div>
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

      {/* MODAL DETAIL LEMBAR JAWABAN SISWA */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-3 sm:p-4 md:p-6 backdrop-blur-xs">
          <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-107.5 md:max-w-3xl lg:max-w-4xl max-h-[90vh] bg-[#FAF9FF] rounded-[24px] sm:rounded-[28px] md:rounded-[32px] shadow-2xl border border-[#F0EDFF] flex flex-col overflow-hidden animate-none select-none text-left">
            {/* Header Modal */}
            <div className="bg-white p-3.5 sm:p-4 md:p-5 border-b border-[#F0EDFF] flex justify-between items-center shrink-0">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#9C98A6]">
                  Lembar Jawaban Siswa
                </p>
                <h2 className="text-sm md:text-base font-black text-[#2C2B30] truncate mt-0.5">
                  {selectedSubmission.studentName}
                </h2>
                <p className="text-[10px] md:text-xs font-bold text-[#8C66FF]">
                  Kelas: {selectedSubmission.studentClass || "-"}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FAF9FF] border border-[#F0EDFF] text-[#2C2B30] flex items-center justify-center hover:bg-neutral-100 cursor-pointer shrink-0 transition-colors"
                title="Tutup"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Score & Summary Metrics */}
            <div className="p-2.5 sm:p-3.5 md:p-4 grid grid-cols-4 gap-2 sm:gap-2.5 md:gap-4 bg-white/70 border-b border-[#F0EDFF] shrink-0">
              <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-[#F0EDFF] text-center flex flex-col shadow-xs min-w-0">
                <span className="text-[7.5px] sm:text-[9px] uppercase tracking-wider font-extrabold text-[#9C98A6] truncate">
                  Skor Siswa
                </span>
                <span className="text-sm sm:text-base md:text-xl font-black text-[#8C66FF] mt-0.5 truncate">
                  {selectedSubmission.score}
                  <span className="text-[9px] sm:text-[10px] font-semibold text-[#9C98A6]">
                    /100
                  </span>
                </span>
                {kkmActive &&
                  selectedSubmission.score < (kkmValue as number) && (
                    <span className="mt-1 inline-flex items-center justify-center gap-1 px-2 py-0.5 bg-[#FFEBF0] text-[#FF5E8C] rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider shrink-0">
                      <FiAlertTriangle size={9} />
                      Di Bawah KKM
                    </span>
                  )}
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-[#F0EDFF] text-center flex flex-col shadow-xs min-w-0">
                <span className="text-[7.5px] sm:text-[9px] uppercase tracking-wider font-extrabold text-[#9C98A6] truncate">
                  Jumlah Benar
                </span>
                <span className="text-sm sm:text-base md:text-xl font-black text-[#2C8578] mt-0.5 truncate">
                  {studentCorrectCount}
                  <span className="text-[9px] sm:text-[10px] font-semibold text-[#9C98A6]">
                    /{selectedQuiz.questions.length}
                  </span>
                </span>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-[#F0EDFF] text-center flex flex-col shadow-xs min-w-0">
                <span className="text-[7.5px] sm:text-[9px] uppercase tracking-wider font-extrabold text-[#9C98A6] truncate">
                  Waktu
                </span>
                <span className="text-sm sm:text-base md:text-xl font-black text-[#2C2B30] mt-0.5 font-mono truncate">
                  {formatDurationFriendly(selectedSubmission.duration)}
                </span>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-[#F0EDFF] text-center flex flex-col shadow-xs min-w-0">
                <span className="text-[7.5px] sm:text-[9px] uppercase tracking-wider font-extrabold text-[#9C98A6] truncate">
                  Keluar App
                </span>
                <span
                  className={`text-sm sm:text-base md:text-xl font-black mt-0.5 truncate ${
                    (selectedSubmission.violationCount ?? 0) > 0
                      ? "text-[#FF5E8C]"
                      : "text-[#2C2B30]"
                  }`}
                >
                  {selectedSubmission.violationCount ?? 0}x
                </span>
              </div>
            </div>

            {/* Questions & Options List - 2 Columns on Desktop */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 flex flex-col md:grid md:grid-cols-2 md:gap-4 gap-3.5 no-scrollbar">
              {studentResults.map(
                ({
                  question: q,
                  index: qIdx,
                  studentAns,
                  correct,
                  isAnswered,
                  isCorrect,
                }) => (
                  <div
                    key={q.id}
                    className="bg-white rounded-2xl p-4 md:p-5 border border-[#F0EDFF] shadow-xs flex flex-col gap-3"
                  >
                    {/* Header Soal */}
                    <div className="flex justify-between items-start gap-2 border-b border-[#F0EDFF]/60 pb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-[#8C66FF]">
                          Soal #{qIdx + 1}
                        </span>
                        {q.questionType && (
                          <span className="px-2 py-0.5 bg-[#F0ECFF] text-[#8C66FF] rounded-md text-[9px] uppercase tracking-wider font-extrabold">
                            {q.questionType}
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      {isCorrect ? (
                        <span className="px-2.5 py-0.5 bg-[#E6F8F6] text-[#2C8578] rounded-full text-[10px] font-black flex items-center gap-1 shrink-0">
                          <FiCheckCircle size={12} />
                          Benar
                        </span>
                      ) : isAnswered ? (
                        <span className="px-2.5 py-0.5 bg-[#FFEBF0] text-[#FF5E8C] rounded-full text-[10px] font-black flex items-center gap-1 shrink-0">
                          <FiXCircle size={12} />
                          Salah
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-[#FAF9FF] text-[#9C98A6] border border-[#F0EDFF] rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0">
                          <FiMinusCircle size={12} />
                          Tidak Dijawab
                        </span>
                      )}
                    </div>

                    {/* Gambar Soal jika ada */}
                    {q.images && q.images.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto py-1">
                        {q.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`Soal ${qIdx + 1}`}
                            className="h-32 rounded-xl object-contain bg-neutral-50 border border-[#F0EDFF]"
                          />
                        ))}
                      </div>
                    )}

                    {/* Teks Soal */}
                    <p className="text-xs font-bold leading-relaxed text-[#2C2B30]">
                      {q.text}
                    </p>

                    {/* Pilihan Jawaban */}
                    <div className="flex flex-col gap-2 mt-1">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = studentAns.includes(optIdx);
                        const isCorrectOption = correct.includes(optIdx);
                        const letter = String.fromCharCode(65 + optIdx);

                        let containerStyle =
                          "bg-[#FAF9FF]/60 border-[#F0EDFF] text-[#6B6875]";

                        if (isCorrectOption) {
                          containerStyle =
                            "bg-[#E6F8F6] border-[#2C8578] text-[#2C8578] font-bold";
                        } else if (isChosen) {
                          containerStyle =
                            "bg-[#FFEBF0] border-[#FF5E8C] text-[#D95276] font-bold";
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border flex items-start gap-2 ${containerStyle}`}
                          >
                            <span className="font-black text-[11px] shrink-0 mt-0.5">
                              {letter}.
                            </span>
                            <span className="text-xs leading-snug break-words">
                              {opt}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* Tombol Tutup Footer */}
            <div className="p-3.5 md:p-4 bg-white border-t border-[#F0EDFF] shrink-0">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="w-full py-3 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] md:text-xs rounded-full shadow-md shadow-purple-100 cursor-pointer hover:bg-[#7b55f0] transition-colors flex items-center justify-center"
              >
                Tutup Lembar Jawaban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
