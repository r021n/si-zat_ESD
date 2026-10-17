import { FiClock, FiEye, FiImage } from "react-icons/fi";
import { LuAward } from "react-icons/lu";
import type { SubmissionItem } from "../../../types/discussion";
import { API_URL } from "../../../utils/constants";
import { formatDateIndo } from "../../../utils/date";
import Pagination from "../../common/Pagination";

interface AdminSubmissionTableProps {
  submissions: SubmissionItem[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onOpenGrading: (sub: SubmissionItem) => void;
  onOpenAnswerPreview: (sub: SubmissionItem) => void;
  onZoomImage: (url: string) => void;
}

export default function AdminSubmissionTable({
  submissions,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onOpenGrading,
  onOpenAnswerPreview,
  onZoomImage,
}: AdminSubmissionTableProps) {
  return (
    <>
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-hidden border border-[#F0EDFF] rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr className="bg-[#FAF9FF] text-[#2C2B30] border-b border-[#F0EDFF] uppercase font-black text-[10px] md:text-[11px] tracking-wider">
                <th className="p-4 border-r border-[#F0EDFF]/50 whitespace-nowrap">Siswa & Kelas</th>
                <th className="p-4 border-r border-[#F0EDFF]/50 text-center whitespace-nowrap">Waktu Kirim</th>
                <th className="p-4 border-r border-[#F0EDFF]/50 min-w-[280px]">Jawaban Siswa</th>
                <th className="p-4 border-r border-[#F0EDFF]/50 text-center whitespace-nowrap">Lampiran</th>
                <th className="p-4 border-r border-[#F0EDFF]/50 text-center whitespace-nowrap">Nilai</th>
                <th className="p-4 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, sIdx) => {
                const isGraded = sub.grade !== undefined && sub.grade !== null;
                const initials = (sub.studentName || "S")
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <tr
                    key={sub.id}
                    className={`border-b border-[#F0EDFF]/60 transition-colors hover:bg-[#F9F7FF] ${
                      sIdx % 2 === 1 ? "bg-[#FAF9FF]/40" : "bg-white"
                    }`}
                  >
                    {/* Student info */}
                    <td className="p-4 border-r border-[#F0EDFF]/40 min-w-[160px] max-w-[220px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-2xl bg-[#EDE9FE] text-[#8C66FF] font-black text-xs flex items-center justify-center shrink-0 border border-[#DDD6FE]/60 shadow-2xs">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-[#2C2B30] text-xs md:text-sm truncate">
                            {sub.studentName}
                          </p>
                          <p className="text-[11px] text-[#9C98A6] font-semibold mt-0.5 truncate">
                            Kelas {sub.studentClass}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Submitted at */}
                    <td className="p-4 text-center border-r border-[#F0EDFF]/40 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#524F5D] bg-[#FAF9FF] px-2.5 py-1 rounded-xl border border-[#F0EDFF]">
                        <FiClock size={11} className="text-[#9C98A6]" />
                        <span>{formatDateIndo(sub.submittedAt)}</span>
                      </span>
                    </td>

                    {/* Answer Snippet */}
                    <td className="p-4 border-r border-[#F0EDFF]/40">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-[#524F5D] line-clamp-2 leading-relaxed font-medium break-words">
                          {sub.answer}
                        </p>
                        <button
                          onClick={() => onOpenAnswerPreview(sub)}
                          className="text-[11px] font-bold text-[#8C66FF] hover:underline self-start flex items-center gap-1 mt-0.5 cursor-pointer"
                        >
                          <FiEye size={12} />
                          <span>Buka Jawaban Lengkap</span>
                        </button>
                      </div>
                    </td>

                    {/* Attachment */}
                    <td className="p-4 text-center border-r border-[#F0EDFF]/40">
                      {sub.hasImage ? (
                        <button
                          onClick={() =>
                            onZoomImage(`${API_URL}/api/announcements/submissions/${sub.id}/image`)
                          }
                          className="group/img relative inline-block w-12 h-12 rounded-xl overflow-hidden border border-[#E9E6F5] cursor-pointer hover:border-[#8C66FF] transition-all"
                          title="Klik untuk melihat foto lampiran"
                        >
                          <img
                            src={`${API_URL}/api/announcements/submissions/${sub.id}/image`}
                            alt="Thumbnail"
                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <FiEye size={14} />
                          </div>
                        </button>
                      ) : (
                        <span className="text-xs text-[#9C98A6] font-semibold">-</span>
                      )}
                    </td>

                    {/* Grade */}
                    <td className="p-4 text-center border-r border-[#F0EDFF]/40 whitespace-nowrap">
                      {isGraded ? (
                        <span className="text-xs md:text-sm font-black text-[#10B981] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 rounded-full shadow-2xs">
                          {sub.grade}
                        </span>
                      ) : (
                        <span className="text-[11px] font-extrabold text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-1 rounded-full">
                          Belum Dinilai
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onOpenGrading(sub)}
                        className={`px-3.5 py-2 text-xs font-black rounded-xl inline-flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer ${
                          isGraded
                            ? "bg-[#FAF9FF] border border-[#8C66FF]/30 text-[#8C66FF] hover:bg-[#F0ECFF]"
                            : "bg-[#8C66FF] hover:bg-[#7b55f0] text-white shadow-purple-200"
                        }`}
                      >
                        <LuAward size={14} />
                        <span>{isGraded ? "Ubah Nilai" : "Beri Nilai"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="block md:hidden space-y-3.5">
        {submissions.map((sub) => {
          const isGraded = sub.grade !== undefined && sub.grade !== null;

          return (
            <div
              key={sub.id}
              className="w-full bg-white rounded-3xl p-4.5 border border-[#F0EDFF] shadow-xs flex flex-col gap-3"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-black text-[#2C2B30] truncate">{sub.studentName}</h3>
                  <p className="text-[11px] text-[#9C98A6] font-semibold mt-0.5 truncate">
                    Kelas {sub.studentClass} • {formatDateIndo(sub.submittedAt)}
                  </p>
                </div>

                {isGraded ? (
                  <span className="text-xs font-black text-[#10B981] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 rounded-full shrink-0 whitespace-nowrap">
                    Nilai: {sub.grade}
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
                    Belum Dinilai
                  </span>
                )}
              </div>

              <div className="text-xs text-[#524F5D] line-clamp-3 bg-[#FAF9FF] p-3 rounded-2xl border border-[#F0EDFF]/80 leading-relaxed whitespace-pre-line font-medium break-words overflow-hidden">
                {sub.answer}
              </div>

              {sub.hasImage && (
                <div
                  onClick={() =>
                    onZoomImage(`${API_URL}/api/announcements/submissions/${sub.id}/image`)
                  }
                  className="flex items-center gap-1.5 text-xs font-bold text-[#8C66FF] cursor-pointer hover:underline"
                >
                  <FiImage size={14} />
                  <span>Lihat Foto Lampiran Siswa</span>
                </div>
              )}

              <button
                onClick={() => onOpenGrading(sub)}
                className={`w-full py-2.5 text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer ${
                  isGraded
                    ? "bg-[#FAF9FF] border border-[#8C66FF]/30 text-[#8C66FF] hover:bg-[#F0ECFF]"
                    : "bg-[#8C66FF] text-white hover:bg-[#7B55F0]"
                }`}
              >
                <LuAward size={15} />
                <span>{isGraded ? "Edit Nilai & Catatan" : "Beri Nilai Siswa"}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Submissions Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        className="mt-4"
      />
    </>
  );
}
