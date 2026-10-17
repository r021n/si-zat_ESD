import { FiX } from "react-icons/fi";
import type { SubmissionItem } from "../../../types/discussion";

interface AdminCommentedUsersModalProps {
  submission: SubmissionItem;
  onClose: () => void;
}

export default function AdminCommentedUsersModal({
  submission,
  onClose,
}: AdminCommentedUsersModalProps) {
  const users = submission.commentedUsers || [];

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl p-5 border border-[#F0EDFF] shadow-xl flex flex-col gap-3 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-2 border-b border-[#F0EDFF]">
          <div>
            <h3 className="text-sm font-extrabold text-[#2C2B30]">
              User yang Dikomentari
            </h3>
            <p className="text-[11px] text-[#9C98A6] font-medium mt-0.5">
              Oleh {submission.studentName} ({submission.studentClass})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#FAF9FF] text-[#9C98A6] hover:text-[#2C2B30] flex items-center justify-center cursor-pointer transition-colors"
          >
            <FiX size={15} />
          </button>
        </div>

        {/* List */}
        <div className="max-h-60 overflow-y-auto space-y-2 py-1 no-scrollbar">
          {users.length === 0 ? (
            <p className="text-xs text-[#9C98A6] text-center py-4 font-medium">
              Belum ada user yang dikomentari.
            </p>
          ) : (
            users.map((u) => {
              const initials = (u.studentName || "S")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <div
                  key={u.userId}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#FAF9FF] border border-[#F0EDFF]/80"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] text-[#8C66FF] font-black text-[11px] flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#2C2B30] truncate">
                      {u.studentName}
                    </p>
                    {u.studentClass && (
                      <p className="text-[10px] text-[#9C98A6] font-medium truncate">
                        Kelas {u.studentClass}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2 bg-[#FAF9FF] hover:bg-[#F0ECFF] text-[#8C66FF] font-bold text-xs rounded-xl border border-[#F0EDFF] transition-colors cursor-pointer mt-1"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
