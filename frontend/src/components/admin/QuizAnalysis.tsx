import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { updateQuizKkmApi } from "../../api/api";
import { FiArrowLeft } from "react-icons/fi";
import type { Quiz, Submission } from "../../types/quiz";

import {
  calculateQuizGeneralStats,
  sortSubmissions,
  processQuestions,
  sortProcessedQuestions,
  calculateStudentResults,
} from "./analysis/quizAnalysisStats";
import QuizSummaryCards from "./analysis/QuizSummaryCards";
import QuizKkmSettingCard from "./analysis/QuizKkmSettingCard";
import QuizStudentScoreTable from "./analysis/QuizStudentScoreTable";
import QuizItemAnalysisGrid from "./analysis/QuizItemAnalysisGrid";
import QuizStudentAnswerModal from "./analysis/QuizStudentAnswerModal";

interface QuizAnalysisProps {
  selectedQuiz: Quiz;
  submissions: Submission[];
  onClose: () => void;
  onKkmChange?: (kkm: number | null) => void;
  onDeleteSubmission?: (submissionId: string) => void;
}

export default function QuizAnalysis({
  selectedQuiz,
  submissions,
  onClose,
  onKkmChange,
  onDeleteSubmission,
}: QuizAnalysisProps) {
  const { token } = useAuthStore();
  const [analysisTab, setAnalysisTab] = useState<"SUMMARY" | "ITEMS">("SUMMARY");
  const [scoreSort, setScoreSort] = useState<
    "NAME_ASC" | "SCORE_DESC" | "SCORE_ASC" | "VIOLATION_DESC"
  >("NAME_ASC");
  const [itemSort, setItemSort] = useState<
    "ORDER_ASC" | "ACCURACY_DESC" | "ACCURACY_ASC" | "ANSWERED_DESC" | "EMPTY_DESC"
  >("ORDER_ASC");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [summaryPage, setSummaryPage] = useState(1);
  const SUMMARY_PAGE_SIZE = 10;

  useEffect(() => {
    setSummaryPage(1);
  }, [scoreSort, searchQuery]);

  // KKM states
  const [kkmValue, setKkmValue] = useState<number | null>(selectedQuiz.kkm ?? null);
  const [kkmInput, setKkmInput] = useState<string>(
    selectedQuiz.kkm !== null && selectedQuiz.kkm !== undefined ? String(selectedQuiz.kkm) : "",
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

  // Stats calculation
  const quizSubmissions = submissions.filter((s) => s.quizId === selectedQuiz.id);
  const { avgScore, highestScore, lowestScore } = calculateQuizGeneralStats(quizSubmissions);

  const belowKkmCount = kkmActive
    ? quizSubmissions.filter((s) => s.score < (kkmValue as number)).length
    : 0;

  const filteredSubmissions = quizSubmissions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      s.studentName.toLowerCase().includes(q) ||
      (s.studentSchool || "").toLowerCase().includes(q)
    );
  });

  const sortedSubmissions = sortSubmissions(filteredSubmissions, scoreSort);
  const totalSummaryPages = Math.ceil(sortedSubmissions.length / SUMMARY_PAGE_SIZE) || 1;
  const paginatedSummarySubmissions = sortedSubmissions.slice(
    (summaryPage - 1) * SUMMARY_PAGE_SIZE,
    summaryPage * SUMMARY_PAGE_SIZE,
  );

  const processedQuestions = processQuestions(selectedQuiz.questions, quizSubmissions);
  const sortedQuestions = sortProcessedQuestions(processedQuestions, itemSort);
  const studentResults = calculateStudentResults(selectedQuiz, selectedSubmission);

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
          {/* General Stats Cards */}
          <QuizSummaryCards
            totalSubmissions={quizSubmissions.length}
            avgScore={avgScore}
            highestScore={highestScore}
            lowestScore={lowestScore}
          />

          {/* KKM Setting Card */}
          <QuizKkmSettingCard
            kkmActive={kkmActive}
            kkmValue={kkmValue}
            kkmSavedFlash={kkmSavedFlash}
            kkmError={kkmError}
            belowKkmCount={belowKkmCount}
            kkmInput={kkmInput}
            onKkmInputChange={(val) => {
              setKkmInput(val);
              setKkmError(null);
            }}
            savingKkm={savingKkm}
            onSaveKkm={handleSaveKkm}
            onClearKkm={handleClearKkm}
          />

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
                <QuizStudentScoreTable
                  quizTitle={selectedQuiz.title}
                  allSubmissions={sortedSubmissions}
                  submissions={paginatedSummarySubmissions}
                  totalQuestions={selectedQuiz.questions.length}
                  kkmActive={kkmActive}
                  kkmValue={kkmValue}
                  belowKkmCount={belowKkmCount}
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  scoreSort={scoreSort}
                  onScoreSortChange={setScoreSort}
                  currentPage={summaryPage}
                  totalPages={totalSummaryPages}
                  totalItems={sortedSubmissions.length}
                  pageSize={SUMMARY_PAGE_SIZE}
                  onPageChange={setSummaryPage}
                  onSelectSubmission={setSelectedSubmission}
                  onDeleteSubmission={(sub) => {
                    if (selectedSubmission?.id === sub.id) {
                      setSelectedSubmission(null);
                    }
                    onDeleteSubmission?.(sub.id);
                  }}
                />
              )}

              {/* TAB B: ITEM ACCURACY ANALYSIS */}
              {analysisTab === "ITEMS" && (
                <QuizItemAnalysisGrid
                  questions={sortedQuestions}
                  quizSubmissions={quizSubmissions}
                  itemSort={itemSort}
                  onItemSortChange={setItemSort}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETAIL LEMBAR JAWABAN SISWA */}
      <QuizStudentAnswerModal
        submission={selectedSubmission}
        totalQuestions={selectedQuiz.questions.length}
        studentResults={studentResults}
        kkmActive={kkmActive}
        kkmValue={kkmValue}
        onClose={() => setSelectedSubmission(null)}
      />
    </div>
  );
}
