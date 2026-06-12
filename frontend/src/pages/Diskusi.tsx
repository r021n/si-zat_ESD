import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { 
  getTaskSubmissionsApi, 
  getTaskDiscussionsApi, 
  sendTaskDiscussionApi 
} from "../api/api";

interface Message {
  id: string;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

interface TaskSubmission {
  id: string;
  userId: number;
  studentName: string;
  studentClass: string;
  title: string;
  answer: string;
  fileName: string;
  submittedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

export default function Diskusi() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  
  // List of submissions
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(true);
  
  // Active selected submission for discussion
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);
  
  // Discussion chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const displayName = user ? (user.nama || user.email.split("@")[0]) : "Pengguna";

  // Fetch submissions list on mount
  const fetchSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const data = await getTaskSubmissionsApi(token || "");
      setSubmissions(data);
    } catch (err) {
      console.error("Gagal memuat tugas diskusi:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSubmissions();
    }
  }, [token]);

  // Fetch messages with automatic polling (every 5 seconds) when a submission is selected
  useEffect(() => {
    if (!selectedSubmission) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const data = await getTaskDiscussionsApi(token || "", selectedSubmission.id);
        setMessages(data);
      } catch (err) {
        console.error("Gagal memuat pesan diskusi:", err);
      }
    };

    // Initial load
    setLoadingMessages(true);
    fetchMessages().finally(() => setLoadingMessages(false));

    // Polling setup
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedSubmission, token]);

  useEffect(() => {
    // Scroll to bottom when messages change
    chatEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSubmission) return;

    const textToSend = newMessage.trim();
    setNewMessage(""); // Clear early for better UX

    try {
      const response = await sendTaskDiscussionApi(token || "", selectedSubmission.id, textToSend);
      setMessages((prev) => [...prev, response.comment]);
    } catch (err: any) {
      alert(err.message || "Gagal mengirimkan pesan diskusi.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans">
      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-8">
        
        {/* Header Section */}
        <div className="w-full flex justify-between items-center mt-4 border-b border-black pb-3">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Berpikir Sistem</p>
            <h1 className="text-sm font-bold uppercase tracking-wide">
              {selectedSubmission ? "Diskusi Tugas" : "Forum Diskusi"}
            </h1>
          </div>
          <div className="flex gap-2">
            {selectedSubmission ? (
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="px-2.5 py-1 border border-black text-[10px] font-bold uppercase tracking-wider bg-white active:bg-black active:text-white transition-none cursor-pointer"
              >
                Daftar Tugas
              </button>
            ) : (
              <button 
                onClick={fetchSubmissions}
                className="px-2 py-1 border border-neutral-300 text-[9px] font-bold uppercase tracking-wider bg-white active:bg-neutral-100 transition-none cursor-pointer"
                title="Segarkan data"
              >
                Refresh
              </button>
            )}
            <button 
              onClick={() => navigate("/kuis/berpikir-sistem")}
              className="px-2.5 py-1 border border-black text-[10px] font-bold uppercase tracking-wider bg-white active:bg-black active:text-white transition-none cursor-pointer"
            >
              Kembali
            </button>
          </div>
        </div>

        {/* List View: Submissions to discuss */}
        {!selectedSubmission ? (
          <div className="w-full flex-1 my-4 flex flex-col gap-3 overflow-y-auto max-h-[70vh] custom-scroll">
            <p className="text-[11px] text-neutral-600 font-medium leading-relaxed bg-neutral-50 border border-black p-3">
              Pilih salah satu tugas siswa di bawah ini untuk membuka ruang obrolan dan mendiskusikan hasil analisis berpikir sistem mereka.
            </p>

            {loadingSubmissions ? (
              <div className="w-full py-12 flex flex-col items-center justify-center gap-2 border border-dashed border-neutral-300">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Memuat daftar tugas...</p>
              </div>
            ) : submissions.length === 0 ? (
              <p className="text-xs text-neutral-500 italic text-center py-12 border border-dashed border-neutral-300 bg-neutral-50">
                Belum ada tugas yang dikumpulkan untuk didiskusikan.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {submissions.map((sub) => {
                  const hasImage = sub.fileName && sub.fileName !== "Tidak ada berkas terlampir";
                  return (
                    <div 
                      key={sub.id} 
                      onClick={() => setSelectedSubmission(sub)}
                      className="w-full p-4 border border-black bg-white hover:bg-neutral-50 active:bg-neutral-100 transition-none cursor-pointer flex flex-col gap-2 relative group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-mono font-bold uppercase bg-black text-white px-1.5 py-0.5">
                          {sub.studentClass}
                        </span>
                        <span className="text-[8px] font-mono text-neutral-400">{sub.submittedAt.split(",")[0]}</span>
                      </div>

                      <h3 className="text-xs font-bold uppercase tracking-wide leading-tight group-hover:underline">
                        {sub.title}
                      </h3>

                      <p className="text-[11px] text-neutral-600 font-serif leading-relaxed line-clamp-2">
                        {sub.answer}
                      </p>

                      <div className="h-[1px] bg-neutral-100 w-full my-0.5"></div>

                      <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500">
                        <span className="font-bold text-neutral-800">👤 {sub.studentName}</span>
                        {hasImage && <span className="text-black font-bold">📷 Lampiran</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Detail View: Discussion Thread */
          <div className="w-full flex-1 flex flex-col gap-3 my-4 overflow-hidden max-h-[70vh]">
            
            {/* Top Area: Selected Task Metadata & Description & Image */}
            <div className="w-full border border-black p-3.5 bg-neutral-50 flex flex-col gap-2 max-h-[28vh] overflow-y-auto custom-scroll">
              <div className="flex justify-between items-center border-b border-black pb-1.5">
                <div>
                  <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest font-bold">
                    Tugas dari
                  </p>
                  <p className="text-[10px] font-bold uppercase text-neutral-900 leading-tight">
                    👤 {selectedSubmission.studentName} ({selectedSubmission.studentClass})
                  </p>
                </div>
                <span className="text-[8px] font-mono text-neutral-400 text-right">
                  ⏱ {selectedSubmission.submittedAt}
                </span>
              </div>

              <h2 className="text-xs font-black uppercase tracking-wider text-black">
                {selectedSubmission.title}
              </h2>

              <p className="text-[11px] text-neutral-700 leading-relaxed font-serif whitespace-pre-wrap">
                {selectedSubmission.answer}
              </p>

              {selectedSubmission.fileName && selectedSubmission.fileName !== "Tidak ada berkas terlampir" && (
                <div className="mt-1 border border-neutral-300 bg-white p-1.5 flex flex-col gap-1.5 rounded-none">
                  <div className="w-full bg-neutral-100 flex justify-center items-center overflow-hidden max-h-[140px]">
                    <img 
                      src={`${API_URL}/api/tasks/submissions/${selectedSubmission.id}/image`}
                      alt={selectedSubmission.title}
                      className="max-h-[140px] w-auto object-contain cursor-pointer hover:opacity-90"
                      onClick={() => window.open(`${API_URL}/api/tasks/submissions/${selectedSubmission.id}/image`, "_blank")}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="text-[8px] font-mono text-neutral-400 truncate text-center">
                    📎 {selectedSubmission.fileName}
                  </span>
                </div>
              )}
            </div>

            {/* Middle Area: Chat Log per Task */}
            <div className="w-full flex-1 p-3 border border-black bg-neutral-50 overflow-y-auto flex flex-col gap-3 custom-scroll">
              {loadingMessages && messages.length === 0 ? (
                <p className="text-xs text-neutral-400 italic text-center py-6">Memuat obrolan...</p>
              ) : messages.length === 0 ? (
                <p className="text-xs text-neutral-500 italic text-center py-8 border border-dashed border-neutral-300 bg-white">
                  Belum ada diskusi untuk tugas ini. Tulis tanggapan Anda di bawah untuk memulai!
                </p>
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
                      {/* Meta Sender */}
                      <div className="flex gap-1.5 items-center text-[9px] font-mono text-neutral-500">
                        <span className={`font-bold ${isMe ? "text-black border-b border-black" : "text-neutral-700"}`}>
                          {msg.senderName}
                        </span>
                        <span>[{msg.senderRole}]</span>
                      </div>

                      {/* Message Bubble */}
                      <div className={`p-2.5 border text-xs leading-relaxed font-medium transition-none ${
                        isMe 
                          ? "bg-black text-white border-black text-right" 
                          : "bg-white text-black border-black text-left"
                      }`}>
                        {msg.content}
                      </div>

                      {/* Timestamp */}
                      <span className="text-[8px] font-mono text-neutral-400">
                        {msg.createdAt}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef}></div>
            </div>

            {/* Bottom Area: Discussion Chat Input */}
            <form onSubmit={handleSendMessage} className="w-full flex flex-col gap-2 mt-auto">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tulis tanggapan / pesan diskusi..."
                  className="flex-1 p-2.5 border border-black text-xs font-medium focus:outline-none focus:bg-neutral-50 transition-none"
                  maxLength={250}
                  required
                />
                <button 
                  type="submit"
                  className="px-4 py-2 border border-black bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-none cursor-pointer"
                >
                  Kirim
                </button>
              </div>
              <div className="text-[8px] text-neutral-400 font-mono text-center">
                Pesan dibatasi maksimal 250 karakter.
              </div>
            </form>
          </div>
        )}



      </div>
    </div>
  );
}

