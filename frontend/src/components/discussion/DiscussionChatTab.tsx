import { type FormEvent, type RefObject } from "react";
import { FiCheck, FiSend } from "react-icons/fi";
import { LuMessageSquare } from "react-icons/lu";
import type { DiscussionMessage } from "../../types/discussion";
import type { User } from "../../types/auth";

interface DiscussionChatTabProps {
  user: User | null;
  discussions: DiscussionMessage[];
  loadingDiscussions: boolean;
  chatInput: string;
  onChatInputChange: (val: string) => void;
  sendingChat: boolean;
  onSendMessage: (e: FormEvent) => void;
  chatBottomRef: RefObject<HTMLDivElement | null>;
  formatChatTime: (d: string) => string;
}

export default function DiscussionChatTab({
  user,
  discussions,
  loadingDiscussions,
  chatInput,
  onChatInputChange,
  sendingChat,
  onSendMessage,
  chatBottomRef,
  formatChatTime,
}: DiscussionChatTabProps) {
  return (
    <div className="flex-1 flex flex-col bg-[#F3F2F8] rounded-3xl border border-[#E9E6F5] overflow-hidden shadow-inner relative h-[calc(100vh-14rem)]">
      {/* Top Banner */}
      <div className="w-full bg-[#EAE8F5] px-3.5 py-2 flex items-center justify-between border-b border-[#DFDCF0]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#8C66FF] text-white flex items-center justify-center text-xs font-black">
            💬
          </div>
          <div>
            <p className="text-[11px] font-black text-[#2C2B30]">
              Forum Diskusi Topik
            </p>
            <p className="text-[9px] text-[#7A768A]">
              {discussions.length} pesan terkirim
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar">
        {loadingDiscussions ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] text-[#9C98A6] font-bold">
              Memuat pesan diskusi...
            </p>
          </div>
        ) : discussions.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 mx-auto mb-2 bg-white rounded-2xl flex items-center justify-center text-[#8C66FF] text-xl shadow-xs">
              <LuMessageSquare />
            </div>
            <p className="text-xs font-extrabold text-[#2C2B30]">
              Belum ada pesan diskusi
            </p>
            <p className="text-[10px] text-[#9C98A6] mt-0.5">
              Jadilah yang pertama menyampaikan argumen atau pertanyaan!
            </p>
          </div>
        ) : (
          discussions.map((msg) => {
            const isMe = msg.userId === user?.id;
            const isGuru = (msg.senderRole || "").toUpperCase() === "ADMIN";

            return (
              <div
                key={msg.id}
                className={`w-full flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 shadow-xs text-xs relative ${
                    isMe
                      ? "bg-[#EDE9FE] text-[#1E1B2E] rounded-tr-xs border border-[#DDD6FE]"
                      : "bg-white text-[#2C2B30] rounded-tl-xs border border-[#F0EDFF]"
                  }`}
                >
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`text-[10px] font-black ${
                          isGuru ? "text-[#8C66FF]" : "text-[#059669]"
                        }`}
                      >
                        {msg.senderName}
                      </span>
                      {isGuru ? (
                        <span className="text-[8px] uppercase font-black bg-[#F0ECFF] text-[#8C66FF] px-1.5 py-0.2 rounded-md">
                          Guru
                        </span>
                      ) : msg.studentClass ? (
                        <span className="text-[8px] font-semibold text-[#9C98A6]">
                          • Kelas {msg.studentClass}
                        </span>
                      ) : null}
                    </div>
                  )}

                  <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>

                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-[#9C98A6]">
                    <span>{formatChatTime(msg.createdAt)}</span>
                    {isMe && <FiCheck size={12} className="text-[#8C66FF]" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={onSendMessage}
        className="w-full bg-white px-3 py-2 border-t border-[#E9E6F5] flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Tulis pendapat atau pertanyaan..."
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          className="flex-1 bg-[#FAF9FF] border border-[#E9E6F5] rounded-full px-4 py-2 text-xs font-semibold text-[#2C2B30] placeholder:text-[#9C98A6] focus:outline-none focus:border-[#8C66FF]"
        />
        <button
          type="submit"
          disabled={!chatInput.trim() || sendingChat}
          className="w-9 h-9 rounded-full bg-[#8C66FF] text-white flex items-center justify-center shrink-0 shadow-xs active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all cursor-pointer"
        >
          <FiSend size={15} />
        </button>
      </form>
    </div>
  );
}
