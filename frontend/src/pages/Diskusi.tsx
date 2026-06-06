import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface Message {
  id: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
}

const DEFAULT_MESSAGES: Message[] = [
  {
    id: "seed-1",
    senderName: "Budi Santoso",
    senderRole: "SISWA",
    content: "Menurut saya, krisis pencemaran air di sekitar perumahan kita sangat terkait erat dengan kebiasaan membuang sampah rumah tangga dan limbah detergen langsung ke parit.",
    timestamp: "06/06/2026, 08:30:15"
  },
  {
    id: "seed-2",
    senderName: "Siti Rahma",
    senderRole: "SISWA",
    content: "Setuju dengan Budi. Kalau dilihat secara sistem, hal ini juga dipengaruhi oleh kurangnya tempat pembuangan sampah akhir dan kurangnya sosialisasi mengenai bahaya zat kimia detergen.",
    timestamp: "06/06/2026, 08:45:22"
  },
  {
    id: "seed-3",
    senderName: "Rian Hidayat",
    senderRole: "SISWA",
    content: "Apakah ada solusi jangka panjang untuk fitoremediasi kolam di dekat sekolah kita? Tanaman apa yang paling cocok untuk menyerap zat fosfat berlebih?",
    timestamp: "06/06/2026, 09:02:10"
  }
];

export default function Diskusi() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const displayName = user ? (user.nama || user.email.split("@")[0]) : "Pengguna";
  const displayRole = user ? user.status.toUpperCase() : "SISWA";

  useEffect(() => {
    const cached = localStorage.getItem("sizat_discussion_messages");
    if (cached) {
      try {
        setMessages(JSON.parse(cached));
      } catch (e) {
        setMessages(DEFAULT_MESSAGES);
      }
    } else {
      setMessages(DEFAULT_MESSAGES);
      localStorage.setItem("sizat_discussion_messages", JSON.stringify(DEFAULT_MESSAGES));
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    chatEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: Date.now().toString(),
      senderName: displayName,
      senderRole: displayRole,
      content: newMessage.trim(),
      timestamp: new Date().toLocaleString("id-ID")
    };

    const updated = [...messages, msg];
    setMessages(updated);
    localStorage.setItem("sizat_discussion_messages", JSON.stringify(updated));
    setNewMessage("");
  };

  const handleClearChat = () => {
    const confirmClear = window.confirm("Apakah Anda yakin ingin menyetel ulang riwayat diskusi?");
    if (!confirmClear) return;
    setMessages(DEFAULT_MESSAGES);
    localStorage.setItem("sizat_discussion_messages", JSON.stringify(DEFAULT_MESSAGES));
  };

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans">
      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-8">
        
        {/* Header Section */}
        <div className="w-full flex justify-between items-center mt-4 border-b border-black pb-3">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Berpikir Sistem</p>
            <h1 className="text-sm font-bold uppercase tracking-wide">Forum Diskusi</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleClearChat}
              className="px-2 py-1 border border-neutral-300 text-[9px] font-bold uppercase tracking-wider bg-white active:bg-neutral-100 transition-none cursor-pointer"
              title="Reset Chat"
            >
              Reset
            </button>
            <button 
              onClick={() => navigate("/kuis/berpikir-sistem")}
              className="px-2.5 py-1 border border-black text-[10px] font-bold uppercase tracking-wider bg-white active:bg-black active:text-white transition-none cursor-pointer"
            >
              Kembali
            </button>
          </div>
        </div>

        {/* Chat Messages Log */}
        <div className="w-full flex-1 my-4 p-3 border border-black bg-neutral-50 overflow-y-auto max-h-[55vh] flex flex-col gap-3 custom-scroll">
          {messages.map((msg) => {
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
                  {msg.timestamp}
                </span>
              </div>
            );
          })}
          <div ref={chatEndRef}></div>
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="w-full flex flex-col gap-2 mt-auto">
          <div className="flex gap-2">
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tulis pesan diskusi..."
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
    </div>
  );
}
