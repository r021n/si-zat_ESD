import { type FormEvent, type RefObject } from "react";
import { FiArrowLeft, FiCheckCircle, FiSend } from "react-icons/fi";
import { LuMessageSquare, LuClock, LuUpload, LuUsers } from "react-icons/lu";
import type {
  PeerSubmissionsResponse,
  PeerSubmissionItem,
  PeerCommentItem,
} from "../../types/discussion";
import type { User } from "../../types/auth";
import { API_URL } from "../../utils/constants";
import { formatDateIndo } from "../../utils/date";

interface PeerReviewTabProps {
  user: User | null;
  peerData: PeerSubmissionsResponse | null;
  loadingPeer: boolean;
  selectedPeerSub: PeerSubmissionItem | null;
  onSelectPeerSub: (sub: PeerSubmissionItem | null) => void;
  peerComments: PeerCommentItem[];
  loadingPeerComments: boolean;
  peerCommentInput: string;
  onPeerCommentInputChange: (val: string) => void;
  sendingPeerComment: boolean;
  onSendPeerComment: (e: FormEvent) => void;
  onDeletePeerComment: (commentId: string) => void;
  onOpenRiwayatTab: (openForm?: boolean) => void;
  onZoomImage: (url: string) => void;
  peerCommentBottomRef: RefObject<HTMLDivElement | null>;
}

export default function PeerReviewTab({
  user,
  peerData,
  loadingPeer,
  selectedPeerSub,
  onSelectPeerSub,
  peerComments,
  loadingPeerComments,
  peerCommentInput,
  onPeerCommentInputChange,
  sendingPeerComment,
  onSendPeerComment,
  onDeletePeerComment,
  onOpenRiwayatTab,
  onZoomImage,
  peerCommentBottomRef,
}: PeerReviewTabProps) {
  if (selectedPeerSub) {
    return (
      <div className="flex-1 flex flex-col bg-[#FAF9FF] rounded-2xl border border-[#F0EDFF] overflow-hidden shadow-xs h-[calc(100vh-14rem)]">
        {/* Top Bar inside Peer Detail */}
        <div className="w-full bg-white px-3.5 py-2.5 flex items-center justify-between border-b border-[#F0EDFF]">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => onSelectPeerSub(null)}
              className="w-7 h-7 rounded-lg bg-[#FAF9FF] border border-[#F0EDFF] flex items-center justify-center text-[#8C66FF] hover:bg-[#F0ECFF] transition-colors shrink-0 cursor-pointer"
              title="Kembali"
            >
              <FiArrowLeft size={14} />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#2C2B30] truncate">
                Tugas {selectedPeerSub.studentName}
              </p>
              <p className="text-[9px] text-[#9C98A6]">
                {selectedPeerSub.studentClass || "Siswa"} • {formatDateIndo(selectedPeerSub.submittedAt)}
              </p>
            </div>
          </div>
          {selectedPeerSub.hasReviewed && (
            <span className="text-[9px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
              <FiCheckCircle size={10} /> Direview
            </span>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 no-scrollbar">
          <div className="bg-white rounded-xl p-3 border border-[#F0EDFF] shadow-xs space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#9C98A6]">
              Jawaban Tugas:
            </p>
            <p className="text-xs text-[#2C2B30] font-medium leading-relaxed whitespace-pre-wrap">
              {selectedPeerSub.answer}
            </p>
            {selectedPeerSub.hasImage && (
              <div
                onClick={() =>
                  onZoomImage(
                    `${API_URL}/api/announcements/submissions/${selectedPeerSub.id}/image`,
                  )
                }
                className="w-16 h-16 bg-[#F8FAFC] rounded-lg overflow-hidden border border-[#E2E8F0] cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img
                  src={`${API_URL}/api/announcements/submissions/${selectedPeerSub.id}/image`}
                  alt="Lampiran Tugas"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] font-bold text-[#2C2B30] flex items-center gap-1.5">
              <LuMessageSquare size={12} className="text-[#8C66FF]" />
              <span>Komentar & Masukan</span>
              <span className="text-[10px] text-[#9C98A6]">({peerComments.length})</span>
            </p>
          </div>

          {loadingPeerComments ? (
            <div className="py-6 flex flex-col items-center justify-center gap-1.5">
              <div className="w-5 h-5 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] text-[#9C98A6] font-bold">Memuat tanggapan...</p>
            </div>
          ) : peerComments.length === 0 ? (
            <div className="py-6 text-center bg-white/60 rounded-xl p-3 border border-dashed border-[#DFDCF0]">
              <p className="text-xs font-bold text-[#2C2B30]">Belum ada tanggapan</p>
              <p className="text-[10px] text-[#9C98A6] mt-0.5">
                Jadilah yang pertama memberikan masukan atau apresiasi!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {peerComments.map((comment) => {
                const isMyComment = comment.userId === user?.id;
                return (
                  <div
                    key={comment.id}
                    className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                      isMyComment
                        ? "bg-[#EDE9FE]/50 border-[#DDD6FE]"
                        : "bg-white border-[#F0EDFF]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[11px] text-[#2C2B30]">
                          {comment.userName}
                        </span>
                        {comment.userRole === "ADMIN" ? (
                          <span className="text-[8px] font-black uppercase text-[#8C66FF] bg-[#F0ECFF] px-1.5 py-0.2 rounded">
                            Guru
                          </span>
                        ) : comment.userClass ? (
                          <span className="text-[9px] text-[#9C98A6]">
                            • Kelas {comment.userClass}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-[#9C98A6]">
                          {formatDateIndo(comment.createdAt)}
                        </span>
                        {isMyComment && (
                          <button
                            onClick={() => onDeletePeerComment(comment.id)}
                            className="text-[9px] text-[#E11D48] hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-[#524F5D] leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={peerCommentBottomRef} />
        </div>

        <form
          onSubmit={onSendPeerComment}
          className="w-full bg-white px-3 py-2 border-t border-[#F0EDFF] flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Tulis masukan untuk tugas teman..."
            value={peerCommentInput}
            onChange={(e) => onPeerCommentInputChange(e.target.value)}
            className="flex-1 bg-[#FAF9FF] border border-[#E9E6F5] rounded-full px-3.5 py-2 text-xs font-medium text-[#2C2B30] placeholder:text-[#9C98A6] focus:outline-none focus:border-[#8C66FF]"
          />
          <button
            type="submit"
            disabled={!peerCommentInput.trim() || sendingPeerComment}
            className="w-8 h-8 rounded-full bg-[#8C66FF] text-white flex items-center justify-center shrink-0 shadow-xs active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
          >
            <FiSend size={13} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pr-0.5 space-y-3 no-scrollbar pb-6">
      <div className="flex items-center justify-between pb-1">
        <p className="text-xs font-bold text-[#2C2B30]">
          Karya Teman ({peerData?.submissions.length || 0})
        </p>
        {peerData?.isRequirementMet ? (
          <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#10B981]/20">
            <FiCheckCircle size={11} /> Review Selesai ({peerData.myReviewedCount}/2)
          </span>
        ) : (
          <span className="text-[10px] font-bold text-[#8C66FF] bg-[#F0ECFF] px-2 py-0.5 rounded-full border border-[#8C66FF]/20">
            Review: {peerData?.myReviewedCount || 0}/2 Selesai
          </span>
        )}
      </div>

      {loadingPeer ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#9C98A6] font-bold">Memuat karya teman...</p>
        </div>
      ) : !peerData?.canView ? (
        <div className="py-14 text-center bg-white rounded-2xl p-5 border border-[#F0EDFF] shadow-xs space-y-2">
          <div className="w-12 h-12 mx-auto bg-[#F0ECFF] text-[#8C66FF] rounded-xl flex items-center justify-center text-xl">
            <LuClock />
          </div>
          <h4 className="text-xs font-bold text-[#2C2B30]">Kumpulkan Tugas Anda Dahulu</h4>
          <p className="text-[11px] text-[#9C98A6] leading-relaxed max-w-xs mx-auto">
            Setelah mengumpulkan tugas di tab Tugas, Anda dapat melihat dan mengulas hasil pekerjaan teman sekelas.
          </p>
          <button
            onClick={() => onOpenRiwayatTab(true)}
            className="mt-2 px-4 py-2 bg-[#8C66FF] text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LuUpload size={13} />
            <span>Kumpulkan Sekarang</span>
          </button>
        </div>
      ) : peerData.submissions.length === 0 ? (
        <div className="py-14 text-center bg-white rounded-2xl p-5 border border-[#F0EDFF] shadow-xs">
          <div className="w-12 h-12 mx-auto mb-2 bg-[#FAF9FF] text-[#9C98A6] rounded-xl flex items-center justify-center text-xl">
            <LuUsers />
          </div>
          <p className="text-xs font-bold text-[#2C2B30]">Belum ada teman yang mengumpulkan</p>
          <p className="text-[10px] text-[#9C98A6] mt-0.5">
            Tugas teman yang sudah dikumpulkan akan muncul di sini.
          </p>
        </div>
      ) : (
        peerData.submissions.map((sub) => (
          <div
            key={sub.id}
            onClick={() => onSelectPeerSub(sub)}
            className="w-full bg-white rounded-2xl p-3.5 border border-[#F0EDFF] shadow-xs active:scale-[0.99] transition-all cursor-pointer hover:border-[#8C66FF]/40 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#F0ECFF] text-[#8C66FF] font-black text-xs flex items-center justify-center">
                  {sub.studentName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2C2B30]">{sub.studentName}</p>
                  <p className="text-[10px] text-[#9C98A6]">{sub.studentClass || "Siswa"}</p>
                </div>
              </div>
              {sub.hasReviewed ? (
                <span className="text-[9px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-md flex items-center gap-1">
                  <FiCheckCircle size={10} /> Sudah Direview
                </span>
              ) : (
                <span className="text-[9px] font-bold text-[#8C66FF] bg-[#F0ECFF] px-2 py-0.5 rounded-md">
                  Beri Masukan
                </span>
              )}
            </div>

            <p className="text-xs text-[#524F5D] font-medium line-clamp-2 leading-relaxed">
              {sub.answer}
            </p>

            <div className="flex items-center justify-between text-[10px] text-[#9C98A6] pt-1.5 border-t border-[#FAF9FF]">
              <span className="flex items-center gap-1 text-[#8C66FF] font-semibold">
                <LuMessageSquare size={11} /> {sub.commentsCount} Tanggapan
              </span>
              <span>{formatDateIndo(sub.submittedAt)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
