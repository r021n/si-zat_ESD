import type { ChangeEvent } from "react";
import { FiCheckCircle, FiX, FiImage } from "react-icons/fi";
import { LuUpload } from "react-icons/lu";
import type { SubmissionItem } from "../../types/discussion";
import { API_URL } from "../../utils/constants";
import { formatDateIndo } from "../../utils/date";

interface SubmissionHistoryTabProps {
  loadingSubmission: boolean;
  mySubmission: SubmissionItem | null;
  showSubmissionForm: boolean;
  onSetShowSubmissionForm: (show: boolean) => void;
  taskAnswer: string;
  onTaskAnswerChange: (val: string) => void;
  imagePreviewUrl: string;
  onClearImage: () => void;
  compressingImage: boolean;
  onImageSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  submittingTask: boolean;
  onSubmitTask: () => void;
  onDeleteSubmission: () => void;
  onPrepareEditSubmission: () => void;
  onZoomImage: (url: string) => void;
}

export default function SubmissionHistoryTab({
  loadingSubmission,
  mySubmission,
  showSubmissionForm,
  onSetShowSubmissionForm,
  taskAnswer,
  onTaskAnswerChange,
  imagePreviewUrl,
  onClearImage,
  compressingImage,
  onImageSelect,
  submittingTask,
  onSubmitTask,
  onDeleteSubmission,
  onPrepareEditSubmission,
  onZoomImage,
}: SubmissionHistoryTabProps) {
  return (
    <div className="flex-1 overflow-y-auto pr-0.5 space-y-4 no-scrollbar pb-6">
      {loadingSubmission ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <div className="w-7 h-7 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#9C98A6] font-bold">
            Memuat riwayat pengumpulan...
          </p>
        </div>
      ) : mySubmission && !showSubmissionForm ? (
        <div className="w-full bg-white rounded-2xl p-4 border border-[#F0EDFF] shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#F0EDFF]">
            <div className="flex items-center gap-1.5 min-w-0">
              <FiCheckCircle
                size={15}
                className={
                  mySubmission.grade !== undefined && mySubmission.grade !== null
                    ? "text-[#10B981] shrink-0"
                    : "text-[#F59E0B] shrink-0"
                }
              />
              <span className="text-[11px] font-bold text-[#2C2B30] truncate">
                {mySubmission.grade !== undefined && mySubmission.grade !== null
                  ? `Nilai: ${mySubmission.grade}/100`
                  : "Menunggu Penilaian"}
              </span>
            </div>
            <span className="text-[10px] text-[#9C98A6] shrink-0">
              {formatDateIndo(mySubmission.submittedAt)}
            </span>
          </div>

          {mySubmission.feedback && (
            <div className="p-2.5 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0]/80">
              <p className="text-xs text-[#1E293B] italic font-medium leading-relaxed">
                "{mySubmission.feedback}"
              </p>
            </div>
          )}

          <div className="text-xs text-[#2C2B30] font-medium leading-relaxed whitespace-pre-line bg-[#FAF9FF] p-3 rounded-xl border border-[#F0EDFF]">
            {mySubmission.answer}
          </div>

          {mySubmission.hasImage && (
            <div
              onClick={() =>
                onZoomImage(
                  `${API_URL}/api/announcements/submissions/${mySubmission.id}/image`,
                )
              }
              className="w-14 h-14 bg-white rounded-lg overflow-hidden border border-[#E2E8F0] cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                src={`${API_URL}/api/announcements/submissions/${mySubmission.id}/image`}
                alt="Lampiran"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0EDFF]">
            <button
              onClick={onDeleteSubmission}
              className="px-3 py-1.5 text-[#E11D48] hover:bg-[#FFF1F2] rounded-xl text-xs font-bold transition-colors active:scale-95 cursor-pointer"
            >
              Hapus
            </button>
            <button
              onClick={onPrepareEditSubmission}
              className="px-3.5 py-1.5 bg-[#FAF9FF] border border-[#8C66FF]/30 text-[#8C66FF] hover:bg-[#F0ECFF] rounded-xl text-xs font-bold transition-colors active:scale-95 cursor-pointer"
            >
              Perbarui
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full bg-white rounded-2xl p-4 border border-[#F0EDFF] shadow-xs flex flex-col gap-3">
          <div className="flex justify-between items-center pb-2 border-b border-[#F0EDFF]">
            <h3 className="text-xs font-extrabold text-[#2C2B30]">
              {mySubmission ? "Perbarui Jawaban" : "Kumpulkan Tugas"}
            </h3>
            {showSubmissionForm && mySubmission && (
              <button
                onClick={() => onSetShowSubmissionForm(false)}
                className="text-xs text-[#9C98A6] font-bold hover:text-[#2C2B30] px-2 py-1 cursor-pointer"
              >
                Batal
              </button>
            )}
          </div>

          <textarea
            rows={4}
            placeholder="Ketikkan jawaban Anda di sini..."
            value={taskAnswer}
            onChange={(e) => onTaskAnswerChange(e.target.value)}
            className="w-full p-3 bg-[#FAF9FF] border border-[#E9E6F5] rounded-xl text-xs font-medium text-[#2C2B30] placeholder:text-[#9C98A6] focus:outline-none focus:border-[#8C66FF] leading-relaxed resize-none"
          />

          {imagePreviewUrl ? (
            <div className="relative w-full h-24 bg-[#F8FAFC] rounded-xl overflow-hidden border border-[#E2E8F0]">
              <img
                src={imagePreviewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={onClearImage}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
              >
                <FiX size={12} />
              </button>
            </div>
          ) : (
            <label className="w-full py-2.5 px-3 border border-dashed border-[#DFDCF0] hover:border-[#8C66FF] rounded-xl flex items-center gap-2 cursor-pointer bg-[#FAF9FF] transition-colors">
              <FiImage className="text-[#8C66FF]" size={16} />
              <span className="text-xs font-bold text-[#524F5D]">
                {compressingImage ? "Memproses..." : "Lampirkan Foto"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={onImageSelect}
                className="hidden"
              />
            </label>
          )}

          <button
            type="button"
            onClick={onSubmitTask}
            disabled={submittingTask || compressingImage}
            className="w-full py-2.5 bg-gradient-to-r from-[#8C66FF] to-[#6366F1] text-white text-xs font-bold rounded-xl shadow-xs active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {submittingTask ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <LuUpload size={14} />
                <span>{mySubmission ? "Simpan Perubahan" : "Kirim Tugas"}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
