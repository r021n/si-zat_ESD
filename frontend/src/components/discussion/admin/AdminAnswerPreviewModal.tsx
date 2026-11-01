import { FiX } from "react-icons/fi";
import { LuAward } from "react-icons/lu";
import type { SubmissionItem } from "../../../types/discussion";
import { getSubmissionImageUrl } from "../discussionUtils";
import { formatDateIndo } from "../../../utils/date";
import SubmissionImageGallery, {
  type GalleryAttachmentItem,
} from "../SubmissionImageGallery";

interface AdminAnswerPreviewModalProps {
  submission: SubmissionItem;
  onClose: () => void;
  onOpenGrading: (sub: SubmissionItem) => void;
  onZoomImage: (url: string, index?: number, allUrls?: string[]) => void;
}

export default function AdminAnswerPreviewModal({
  submission,
  onClose,
  onOpenGrading,
  onZoomImage,
}: AdminAnswerPreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg md:max-w-2xl bg-white rounded-3xl p-5 md:p-6 border border-[#F0EDFF] shadow-2xl flex flex-col max-h-[85vh] animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start gap-3 pb-3 border-b border-[#F0EDFF] shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm md:text-base font-black text-[#2C2B30] truncate">
              Jawaban Tugas: {submission.studentName}
            </h3>
            <p className="text-xs text-[#9C98A6] font-semibold mt-0.5 truncate">
              Kelas {submission.studentClass} • {formatDateIndo(submission.submittedAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF9FF] text-[#9C98A6] flex items-center justify-center hover:text-[#2C2B30] cursor-pointer shrink-0"
          >
            <FiX size={17} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto py-4 space-y-4 no-scrollbar">
          <div className="p-4 bg-[#FAF9FF] border border-[#E9E6F5] rounded-2xl text-xs md:text-sm font-medium text-[#2C2B30] leading-relaxed whitespace-pre-line">
            {submission.answer}
          </div>

          {(() => {
            const adminImages: GalleryAttachmentItem[] =
              submission.images && submission.images.length > 0
                ? submission.images.map((img, idx) => ({
                    id: img.id,
                    url: getSubmissionImageUrl(
                      submission.id,
                      submission.submittedAt,
                      img.id,
                    ),
                    name: img.fileName || `Lampiran ${idx + 1}`,
                  }))
                : submission.hasImage
                ? [
                    {
                      id: "legacy",
                      url: getSubmissionImageUrl(
                        submission.id,
                        submission.submittedAt,
                      ),
                      name: submission.fileName || "Lampiran",
                    },
                  ]
                : [];

            return (
              adminImages.length > 0 && (
                <div>
                  <p className="text-xs font-black text-[#524F5D] mb-1.5">
                    Lampiran Foto ({adminImages.length}):
                  </p>
                  <SubmissionImageGallery
                    isEditMode={false}
                    images={adminImages}
                    onZoomImage={onZoomImage}
                  />
                </div>
              )
            );
          })()}

          {submission.feedback && (
            <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl text-xs text-[#065F46]">
              <strong className="block mb-0.5">Catatan Guru:</strong>
              <p className="italic">"{submission.feedback}"</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#F0EDFF] flex gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#FAF9FF] text-[#9C98A6] hover:text-[#2C2B30] font-bold text-xs rounded-2xl cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenGrading(submission);
            }}
            className="flex-1 py-2.5 bg-[#8C66FF] hover:bg-[#7b55f0] text-white font-black text-xs rounded-2xl shadow-md shadow-purple-200 cursor-pointer flex items-center justify-center gap-1.5 min-w-0 whitespace-nowrap overflow-hidden"
          >
            <LuAward size={15} className="shrink-0" />
            <span className="truncate">
              {submission.grade !== undefined && submission.grade !== null
                ? "Edit Nilai Tugas"
                : "Beri Nilai Siswa"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
