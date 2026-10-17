import { FiAlertTriangle } from "react-icons/fi";
import type { Submission } from "../../../types/quiz";
import { formatDurationFriendly } from "../../../utils/time";
import Pagination from "../../common/Pagination";

interface QuizStudentScoreTableProps {
  submissions: Submission[];
  totalQuestions: number;
  kkmActive: boolean;
  kkmValue: number | null;
  belowKkmCount: number;
  scoreSort: "NAME_ASC" | "SCORE_DESC" | "SCORE_ASC" | "VIOLATION_DESC";
  onScoreSortChange: (sort: "NAME_ASC" | "SCORE_DESC" | "SCORE_ASC" | "VIOLATION_DESC") => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSelectSubmission: (sub: Submission) => void;
}

export default function QuizStudentScoreTable({
  submissions,
  totalQuestions,
  kkmActive,
  kkmValue,
  belowKkmCount,
  scoreSort,
  onScoreSortChange,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onSelectSubmission,
}: QuizStudentScoreTableProps) {
  return (
    <div className="flex flex-col gap-2 flex-1 overflow-hidden">
      <div className="flex justify-between items-center text-[9px] md:text-[10px] font-bold text-[#9C98A6] uppercase px-1 shrink-0">
        <span className="flex items-center gap-1.5 flex-wrap">
          Daftar Nilai Siswa
          {kkmActive && (
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-black normal-case ${
                belowKkmCount > 0 ? "bg-[#FFEBF0] text-[#FF5E8C]" : "bg-[#E6F8F6] text-[#2C8578]"
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
            onChange={(e: any) => onScoreSortChange(e.target.value)}
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
              <th className="p-3.5 md:p-4 border-r border-[#F0EDFF]/50 whitespace-nowrap">Nama Siswa</th>
              <th className="p-3.5 md:p-4 border-r border-[#F0EDFF]/50 text-center whitespace-nowrap">Kelas</th>
              <th className="p-3.5 md:p-4 border-r border-[#F0EDFF]/50 text-center whitespace-nowrap">Durasi</th>
              <th className="p-3.5 md:p-4 border-r border-[#F0EDFF]/50 text-center whitespace-nowrap">Terisi / Kosong</th>
              <th className="p-3.5 md:p-4 border-r border-[#F0EDFF]/50 text-center whitespace-nowrap">Keluar App</th>
              <th className="p-3.5 md:p-4 text-center whitespace-nowrap">Skor Akhir</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub, sIdx) => {
              const subAnsweredCount = Object.keys(sub.answers).filter(
                (qId) => sub.answers[qId] && sub.answers[qId].length > 0,
              ).length;
              const subEmptyCount = totalQuestions - subAnsweredCount;

              return (
                <tr
                  key={sub.id}
                  onClick={() => onSelectSubmission(sub)}
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
                    <span className="text-[#2C8578] font-bold">{subAnsweredCount}</span>
                    <span className="text-[#9C98A6]"> / </span>
                    <span className="text-[#FF5E8C] font-bold">{subEmptyCount}</span>
                  </td>
                  <td className="p-3.5 md:p-4 border-r border-[#F0EDFF]/50 text-center font-mono font-bold whitespace-nowrap">
                    {(sub.violationCount ?? 0) > 0 ? (
                      <span className="text-[#FF5E8C]">{sub.violationCount}x</span>
                    ) : (
                      <span className="text-[#9C98A6]">0</span>
                    )}
                  </td>
                  <td className="p-3.5 md:p-4 text-center font-mono font-black text-sm md:text-base text-[#8C66FF] whitespace-nowrap">
                    <div className="flex flex-col items-center gap-1">
                      <span>{sub.score}</span>
                      {kkmActive && sub.score < (kkmValue as number) && (
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        className="mt-2 shrink-0"
      />
    </div>
  );
}
