import { FiX, FiCheckCircle, FiEye } from "react-icons/fi";
import type { SubmissionItem } from "../../../types/discussion";
import { API_URL } from "../../../utils/constants";

interface AdminGradingModalProps {
  submission: SubmissionItem;
  gradeScore: string;
  onGradeScoreChange: (score: string) => void;
  gradeFeedback: string;
  onGradeFeedbackChange: (feedback: string) => void;
  savingGrade: boolean;
  onSaveGrade: () => void;
  onClose: () => void;
  onZoomImage: (url: string) => void;
}

export default function AdminGradingModal({
  submission,
  gradeScore,
  onGradeScoreChange,
  gradeFeedback,
  onGradeFeedbackChange,
  savingGrade,
  onSaveGrade,
  onClose,
  onZoomImage,
}: AdminGradingModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg md:max-w-3xl lg:max-w-4xl bg-white rounded-3xl p-5 md:p-6 border border-[#F0EDFF] shadow-2xl flex flex-col max-h-[90vh] animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start md:items-center gap-3 pb-3 border-b border-[#F0EDFF] shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm md:text-base font-black text-[#2C2B30]">
                Penilaian Tugas Siswa
              </h3>
              <span className="px-2 py-0.5 bg-[#F0ECFF] text-[#8C66FF] rounded-full text-[10px] font-bold shrink-0 whitespace-nowrap">
                Kelas {submission.studentClass}
              </span>
            </div>
            <p className="text-xs text-[#9C98A6] font-semibold mt-0.5 truncate">
              <strong className="text-[#2C2B30]">{submission.studentName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF9FF] text-[#9C98A6] flex items-center justify-center hover:text-[#2C2B30] hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
          >
            <FiX size={17} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 overflow-y-auto py-4 pr-1 no-scrollbar grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Column: Student Answer & Image */}
          <div className="md:col-span-7 flex flex-col gap-3.5">
            <div>
              <label className="text-xs font-black text-[#524F5D] block mb-1.5">
                Jawaban Tugas Siswa:
              </label>
              <div className="p-4 bg-[#FAF9FF] border border-[#E9E6F5] rounded-2xl text-xs md:text-sm font-medium text-[#2C2B30] leading-relaxed whitespace-pre-line max-h-64 md:max-h-80 overflow-y-auto">
                {submission.answer}
              </div>
            </div>

            {submission.hasImage && (
              <div>
                <label className="text-xs font-black text-[#524F5D] block mb-1.5">
                  Lampiran Foto Siswa:
                </label>
                <div
                  onClick={() =>
                    onZoomImage(`${API_URL}/api/announcements/submissions/${submission.id}/image`)
                  }
                  className="w-full h-44 bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0] relative cursor-pointer group"
                >
                  <img
                    src={`${API_URL}/api/announcements/submissions/${submission.id}/image`}
                    alt="Lampiran"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                    <FiEye size={15} />
                    <span>Klik untuk memperbesar gambar</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Teacher Score & Feedback Inputs */}
          <div className="md:col-span-5 flex flex-col justify-between gap-4 md:border-l md:border-[#F0EDFF] md:pl-5">
            <div className="space-y-4">
              <div>
                <label className="font-extrabold uppercase text-[#524F5D] tracking-wider text-[11px] block mb-1.5">
                  Nilai Tugas (Skala 0 - 100) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Contoh: 85"
                  value={gradeScore}
                  onChange={(e) => onGradeScoreChange(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF9FF] border border-[#E9E6F5] rounded-2xl font-black text-lg text-[#8C66FF] focus:outline-none focus:border-[#8C66FF] focus:bg-white transition-colors"
                />

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[60, 70, 75, 80, 85, 90, 95, 100].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => onGradeScoreChange(String(score))}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                        gradeScore === String(score)
                          ? "bg-[#8C66FF] text-white border-[#8C66FF]"
                          : "bg-[#FAF9FF] text-[#524F5D] border-[#E9E6F5] hover:bg-[#F0ECFF]"
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-extrabold uppercase text-[#524F5D] tracking-wider text-[11px] block mb-1.5">
                  Catatan & Masukan Guru (Opsional)
                </label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan apresiasi, saran, atau perbaikan untuk pemahaman siswa..."
                  value={gradeFeedback}
                  onChange={(e) => onGradeFeedbackChange(e.target.value)}
                  className="w-full p-3.5 bg-[#FAF9FF] border border-[#E9E6F5] rounded-2xl font-medium text-xs text-[#2C2B30] focus:outline-none focus:border-[#8C66FF] focus:bg-white transition-colors leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0EDFF] flex gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-[#FAF9FF] hover:bg-neutral-100 text-[#9C98A6] hover:text-[#2C2B30] font-bold text-xs rounded-2xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onSaveGrade}
                disabled={savingGrade}
                className="flex-1 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-100 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 min-w-0 whitespace-nowrap overflow-hidden"
              >
                <FiCheckCircle size={15} className="shrink-0" />
                <span className="truncate">
                  {savingGrade ? "Menyimpan..." : "Simpan Penilaian"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
