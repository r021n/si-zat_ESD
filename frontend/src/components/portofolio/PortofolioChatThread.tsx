import { type FormEvent, type RefObject } from "react";
import { FiChevronDown, FiChevronUp, FiPaperclip, FiSend } from "react-icons/fi";
import { LuUser, LuTrash2, LuMessageSquare } from "react-icons/lu";
import type { TaskSubmission, Message } from "./types";
import { API_URL } from "../../utils/constants";

interface PortofolioChatThreadProps {
  submission: TaskSubmission;
  isTaskCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
  isAdmin: boolean;
  onDeleteSubmission: (id: string, title?: string, studentName?: string) => void;
  messages: Message[];
  loadingMessages: boolean;
  newMessage: string;
  onNewMessageChange: (val: string) => void;
  onSendMessage: (e: FormEvent) => void;
  displayName: string;
  chatEndRef: RefObject<HTMLDivElement | null>;
}

export default function PortofolioChatThread({
  submission,
  isTaskCollapsed,
  onToggleCollapse,
  isAdmin,
  onDeleteSubmission,
  messages,
  loadingMessages,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  displayName,
  chatEndRef,
}: PortofolioChatThreadProps) {
  return (
    <div className="w-full flex-1 flex flex-col gap-3 overflow-hidden min-h-0">
      {/* Task info box */}
      {isTaskCollapsed ? (
        <div
          onClick={() => onToggleCollapse(false)}
          className="w-full bg-white border border-[#F0EDFF] rounded-[20px] px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex justify-between items-center cursor-pointer active:bg-neutral-50"
        >
          <div className="flex items-center gap-2 truncate flex-1 min-w-0">
            <LuUser className="text-[#8C66FF] shrink-0" size={14} />
            <span className="text-[11px] font-extrabold text-[#2C2B30] truncate">
              Detail Tugas: "{submission.title}" ({submission.studentName})
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#8C66FF] text-[10px] font-bold shrink-0 ml-2">
            <span>Tampilkan</span>
            <FiChevronDown size={14} />
          </div>
        </div>
      ) : (
        <div className="w-full bg-white border border-[#F0EDFF] rounded-3xl p-4.5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex flex-col gap-2 max-h-[30vh] overflow-y-auto custom-scroll">
          <div className="flex justify-between items-center border-b border-[#F5F2FF] pb-2">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-widest text-[#9C98A6]">Tugas dari</p>
              <p className="text-[10px] font-extrabold text-[#2C2B30] flex items-center gap-1 mt-0.5">
                <LuUser size={12} className="text-[#8C66FF]" /> {submission.studentName} ({submission.studentClass})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-[#9C98A6] font-semibold">
                ⏱ {submission.submittedAt}
              </span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onDeleteSubmission(submission.id, submission.title, submission.studentName)}
                  className="text-[9px] font-bold uppercase text-[#D95276] hover:text-[#b53a59] cursor-pointer flex items-center gap-1 bg-[#FFEBF0] border border-[#FFD0DC] px-2 py-0.5 rounded-full transition-none active:bg-[#ffd1dd]"
                  title="Hapus tugas ini (Khusus Admin)"
                >
                  <LuTrash2 size={10} /> Hapus
                </button>
              )}
              <button
                type="button"
                onClick={() => onToggleCollapse(true)}
                className="text-[10px] font-extrabold uppercase text-[#8C66FF] flex items-center gap-0.5 cursor-pointer active:opacity-75"
                title="Sembunyikan detail tugas"
              >
                <span>Sembunyikan</span>
                <FiChevronUp size={12} />
              </button>
            </div>
          </div>

          <h2 className="text-xs font-extrabold text-[#2C2B30] tracking-wide mt-1">
            {submission.title}
          </h2>

          <p className="text-[11px] text-[#5C5A60] leading-relaxed whitespace-pre-wrap">
            {submission.answer}
          </p>

          {submission.fileName && submission.fileName !== "Tidak ada berkas terlampir" && (
            <div className="mt-2 border border-[#F0EDFF] bg-[#FAF9FF] p-2 rounded-2xl flex flex-col gap-1.5">
              <div className="w-full bg-white border border-[#F0EDFF] rounded-xl flex justify-center items-center overflow-hidden max-h-35">
                <img
                  src={`${API_URL}/api/tasks/submissions/${submission.id}/image`}
                  alt={submission.title}
                  className="max-h-35 w-auto object-contain cursor-pointer active:opacity-80"
                  onClick={() =>
                    window.open(
                      `${API_URL}/api/tasks/submissions/${submission.id}/image`,
                      "_blank",
                    )
                  }
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <span className="text-[9px] text-[#9C98A6] font-semibold truncate text-center flex items-center justify-center gap-1">
                <FiPaperclip size={10} /> {submission.fileName}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Chat Thread */}
      <div className="w-full flex-1 p-4 bg-white border border-[#F0EDFF] rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] overflow-y-auto flex flex-col gap-3 custom-scroll min-h-0">
        {loadingMessages && messages.length === 0 ? (
          <p className="text-xs text-[#9C98A6] italic text-center py-6">Memuat obrolan...</p>
        ) : messages.length === 0 ? (
          <div className="w-full py-8 flex flex-col items-center justify-center text-center gap-1.5 bg-[#FAF9FF] border border-dashed border-[#E9E4FF] rounded-2xl px-3">
            <LuMessageSquare size={20} className="text-[#8C66FF] opacity-60" />
            <p className="text-xs text-[#9C98A6] italic font-semibold">
              Belum ada diskusi untuk tugas ini. Tulis tanggapan Anda di bawah untuk memulai!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderName === displayName;
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 max-w-[85%] ${
                  isMe ? "self-end items-end" : "self-start items-start"
                }`}
              >
                <div className="flex gap-1.5 items-center text-[9px] text-[#9C98A6] font-bold">
                  <span className={`font-extrabold ${isMe ? "text-[#8C66FF]" : "text-[#2C2B30]"}`}>
                    {msg.senderName}
                  </span>
                  <span>[{msg.senderRole}]</span>
                </div>

                <div
                  className={`p-3 rounded-[20px] text-xs leading-relaxed font-medium transition-none ${
                    isMe
                      ? "bg-[#8C66FF] text-white rounded-tr-none text-left"
                      : "bg-[#FAF9FF] text-[#2C2B30] border border-[#F0EDFF] rounded-tl-none text-left"
                  }`}
                >
                  {msg.content}
                </div>

                <span className="text-[8px] text-[#9C98A6] font-semibold">{msg.createdAt}</span>
              </div>
            );
          })
        )}
        <div ref={chatEndRef}></div>
      </div>

      {/* Chat Input Form */}
      <form onSubmit={onSendMessage} className="w-full flex flex-col gap-1.5 mt-auto">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            placeholder="Tulis tanggapan..."
            className="flex-1 px-4 py-3 bg-white border border-[#F0EDFF] rounded-full text-xs font-semibold text-[#2C2B30] placeholder-[#9C98A6] focus:outline-none focus:border-[#8C66FF] transition-none shadow-sm animate-none"
            maxLength={250}
            required
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-[#8C66FF] text-white flex items-center justify-center shadow-md cursor-pointer active:bg-[#7752EB] transition-none shrink-0"
          >
            <FiSend size={16} />
          </button>
        </div>
        <div className="text-[8px] text-[#9C98A6] font-bold text-center">
          Maksimal 250 karakter.
        </div>
      </form>
    </div>
  );
}
