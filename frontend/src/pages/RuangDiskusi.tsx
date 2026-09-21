import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useAppBack } from "../hooks/useAppBack";
import { useCustomDialog } from "../components/CustomDialog";
import {
  FiArrowLeft,
  FiSend,
  FiImage,
  FiX,
  FiRefreshCw,
  FiCheck,
  FiCheckCircle,
  FiSearch,
  FiChevronRight,
  FiCalendar,
} from "react-icons/fi";
import {
  LuMessageSquare,
  LuClock,
  LuFileText,
  LuInfo,
  LuUpload,
  LuTrophy,
  LuSparkles,
} from "react-icons/lu";
import {
  getAnnouncementsApi,
  getAnnouncementDetailApi,
  getAnnouncementDiscussionsApi,
  sendAnnouncementDiscussionApi,
  getAnnouncementSubmissionsApi,
  submitAnnouncementTaskApi,
  deleteAnnouncementSubmissionApi,
} from "../api/api";

interface AnnouncementItem {
  id: string;
  title: string;
  problem: string;
  question: string;
  taskInfo: string;
  instruction: string;
  authorName: string;
  createdAt: string;
  discussionsCount?: number;
  submissionsCount?: number;
  mySubmission?: {
    id: string;
    submittedAt: string;
    grade?: number;
    feedback?: string;
  } | null;
}

interface DiscussionMessage {
  id: string;
  announcementId: string;
  userId: number;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
  studentClass?: string;
}

interface SubmissionItem {
  id: string;
  announcementId: string;
  userId: number;
  studentName: string;
  studentClass: string;
  answer: string;
  fileName: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
  hasImage?: boolean;
}

interface RankedStudent {
  userId: number;
  name: string;
  studentClass: string;
  validCommentsCount: number;
  totalCommentsCount: number;
}

// Canvas-based image compression helper (<200KB for safe mobile uploads)
function compressImage(
  file: File,
  maxSizeBytes: number = 200 * 1024,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    if (file.size <= maxSizeBytes) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        const MAX_DIM = 1200;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.9;
        const attempt = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              if (blob.size <= maxSizeBytes || quality <= 0.1) {
                resolve(blob);
              } else {
                quality -= 0.1;
                if (quality < 0.5) {
                  canvas.width = Math.round(canvas.width * 0.85);
                  canvas.height = Math.round(canvas.height * 0.85);
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
                attempt();
              }
            },
            "image/jpeg",
            quality,
          );
        };
        attempt();
      };
      img.onerror = () => reject(new Error("Gagal membaca gambar"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

export default function RuangDiskusi() {
  const { id: paramAnnouncementId } = useParams();
  const navigate = useNavigate();
  const goBack = useAppBack();
  const { user, token } = useAuthStore();
  const { showAlert, showConfirm } = useCustomDialog();

  // Announcements List State
  const [announcementsList, setAnnouncementsList] = useState<AnnouncementItem[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selected Announcement Detail
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);

  // Active Tab: 1 = Informasi (Default), 2 = Diskusi, 3 = Riwayat
  const [activeTab, setActiveTab] = useState<"informasi" | "diskusi" | "riwayat">("informasi");

  // Discussion State
  const [discussions, setDiscussions] = useState<DiscussionMessage[]>([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [sendingChat, setSendingChat] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Submission State
  const [mySubmission, setMySubmission] = useState<SubmissionItem | null>(null);
  const [loadingSubmission, setLoadingSubmission] = useState<boolean>(false);

  // Submission Form State
  const [taskAnswer, setTaskAnswer] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [compressingImage, setCompressingImage] = useState<boolean>(false);
  const [submittingTask, setSubmittingTask] = useState<boolean>(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState<boolean>(false);

  // Fullscreen Image Modal
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  // Ranking Modal State
  const [showRankingModal, setShowRankingModal] = useState<boolean>(false);

  // Fetch Announcements List
  const fetchAnnouncements = useCallback(async (force = false) => {
    if (!token) return;
    setLoadingList(true);
    try {
      const data = await getAnnouncementsApi(token, force);
      setAnnouncementsList(data || []);
    } catch (err: any) {
      console.error("Error fetching announcements:", err);
    } finally {
      setLoadingList(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Load selected announcement if param is present
  useEffect(() => {
    if (paramAnnouncementId && token) {
      handleSelectAnnouncement(paramAnnouncementId);
    }
  }, [paramAnnouncementId, token]);

  const handleSelectAnnouncement = async (annId: string, force = false) => {
    if (!token) return;
    try {
      const detail = await getAnnouncementDetailApi(token, annId, force);
      setSelectedAnnouncement(detail);
      setActiveTab("informasi"); // Default tab: Informasi!
      setShowSubmissionForm(false);

      // Also fetch discussions and submissions
      fetchDiscussions(annId, force);
      fetchSubmissions(annId, force);
    } catch (err: any) {
      showAlert(err.message || "Gagal memuat detail pengumuman.", "Gagal Membuka");
    }
  };

  const fetchDiscussions = async (annId: string, force = false) => {
    if (!token) return;
    setLoadingDiscussions(true);
    try {
      const data = await getAnnouncementDiscussionsApi(token, annId, force);
      setDiscussions(data || []);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (err) {
      console.error("Error fetching discussions:", err);
    } finally {
      setLoadingDiscussions(false);
    }
  };

  const fetchSubmissions = async (annId: string, force = false) => {
    if (!token) return;
    setLoadingSubmission(true);
    try {
      const subs: SubmissionItem[] = await getAnnouncementSubmissionsApi(token, annId, force);
      if (subs && subs.length > 0) {
        setMySubmission(subs[0]);
      } else {
        setMySubmission(null);
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoadingSubmission(false);
    }
  };

  // Send Discussion Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !selectedAnnouncement || !token || sendingChat) return;

    const content = chatInput.trim();
    setChatInput("");
    setSendingChat(true);

    try {
      const newMsg = await sendAnnouncementDiscussionApi(token, selectedAnnouncement.id, content);
      setDiscussions((prev) => [...prev, newMsg]);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      showAlert(err.message || "Gagal mengirim pesan diskusi.", "Gagal Mengirim");
      setChatInput(content); // Restore content on fail
    } finally {
      setSendingChat(false);
    }
  };

  // Handle Image Selection with Canvas Compression
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showAlert("Hanya file gambar (JPG, PNG, WebP) yang dapat dilampirkan.", "Format Tidak Didukung");
      return;
    }

    setCompressingImage(true);
    try {
      const compressedBlob = await compressImage(file, 250 * 1024);
      const compressedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type || "image/jpeg",
      });
      setSelectedFile(compressedFile);
      setImagePreviewUrl(URL.createObjectURL(compressedFile));
    } catch (err) {
      console.error("Compression error:", err);
      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } finally {
      setCompressingImage(false);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl("");
    }
  };

  // Submit Task Answer
  const handleSubmitTask = async () => {
    if (!taskAnswer.trim()) {
      showAlert("Silakan ketikkan jawaban tugas Anda terlebih dahulu.", "Jawaban Kosong");
      return;
    }

    if (!selectedAnnouncement || !token) return;

    setSubmittingTask(true);
    try {
      const formData = new FormData();
      formData.append("answer", taskAnswer.trim());
      if (selectedFile) {
        formData.append("file", selectedFile);
        formData.append("fileName", selectedFile.name);
      }

      await submitAnnouncementTaskApi(token, selectedAnnouncement.id, formData);

      showAlert("Tugas Anda telah berhasil disimpan dan dikirimkan.", "Berhasil Mengumpulkan!");

      setShowSubmissionForm(false);
      setTaskAnswer("");
      handleClearImage();

      // Refresh announcement detail & submission
      fetchSubmissions(selectedAnnouncement.id);
      fetchAnnouncements();
    } catch (err: any) {
      showAlert(err.message || "Terjadi kendala saat mengirimkan tugas.", "Gagal Mengumpulkan");
    } finally {
      setSubmittingTask(false);
    }
  };

  // Delete own submission
  const handleDeleteSubmission = async () => {
    if (!mySubmission || !token) return;
    const confirmed = await showConfirm(
      "Apakah Anda yakin ingin menghapus tugas yang sudah dikumpulkan ini? Tindakan ini tidak dapat dibatalkan.",
    );
    if (!confirmed) return;

    try {
      await deleteAnnouncementSubmissionApi(token, mySubmission.id);
      showAlert("Pengumpulan tugas berhasil dibatalkan.", "Tugas Dihapus");
      setMySubmission(null);
      if (selectedAnnouncement) {
        fetchSubmissions(selectedAnnouncement.id);
        fetchAnnouncements();
      }
    } catch (err: any) {
      showAlert(err.message || "Gagal menghapus pengumpulan tugas.", "Gagal Menghapus");
    }
  };

  // Helper: Count words in text
  const countWords = (text: string) => {
    return (text || "").trim().split(/\s+/).filter(Boolean).length;
  };

  // Filter Ranking: ONLY count student comments with MORE THAN 4 WORDS!
  const calculateRanking = (): RankedStudent[] => {
    const studentMessages = discussions.filter(
      (msg) => (msg.senderRole || "").toLowerCase() === "siswa",
    );

    const map: Record<string, RankedStudent> = {};

    studentMessages.forEach((msg) => {
      const wCount = countWords(msg.content);
      const isValid = wCount > 4; // Requirement: > 4 words!

      const key = `${msg.userId}_${msg.senderName}`;
      if (!map[key]) {
        map[key] = {
          userId: msg.userId,
          name: msg.senderName,
          studentClass: msg.studentClass || "Siswa",
          validCommentsCount: 0,
          totalCommentsCount: 0,
        };
      }

      map[key].totalCommentsCount++;
      if (isValid) {
        map[key].validCommentsCount++;
      }
    });

    return Object.values(map)
      .filter((s) => s.validCommentsCount > 0)
      .sort((a, b) => b.validCommentsCount - a.validCommentsCount);
  };

  const rankedStudents = calculateRanking();

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const formatChatTime = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const filteredAnnouncements = announcementsList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.problem.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      {/* Decorative Blur Bubble */}
      <div className="absolute top-[-10%] right-[-10%] w-50 h-50 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-107.5 min-h-screen flex flex-col justify-between px-6 py-6 z-10">
        
        {/* ==================== VIEW 1: LIST OF ANNOUNCEMENTS ==================== */}
        {!selectedAnnouncement ? (
          <div className="w-full flex-1 flex flex-col">
            {/* Header */}
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-[#F0EDFF]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => goBack("/menu")}
                  className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-xs border border-[#F0EDFF] text-[#8C66FF] active:scale-95 transition-transform shrink-0"
                  title="Kembali ke Menu"
                >
                  <FiArrowLeft size={19} />
                </button>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">
                    Forum & Tugas
                  </p>
                  <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight">
                    Ruang Diskusi
                  </h1>
                </div>
              </div>

              <button
                onClick={() => fetchAnnouncements(true)}
                disabled={loadingList}
                className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-[#F0EDFF] text-[#8C66FF] shadow-xs active:scale-95 transition-transform cursor-pointer"
                title="Refresh"
              >
                <FiRefreshCw size={15} className={loadingList ? "animate-spin" : ""} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="w-full relative mb-3">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C98A6]" size={15} />
              <input
                type="text"
                placeholder="Cari topik diskusi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#F0EDFF] rounded-2xl text-xs font-semibold text-[#2C2B30] placeholder:text-[#9C98A6] focus:outline-none focus:border-[#8C66FF] shadow-xs"
              />
            </div>

            {/* Announcements List */}
            <div className="flex-1 overflow-y-auto pr-0.5 space-y-3 no-scrollbar pb-6">
              {loadingList ? (
                <div className="py-20 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[11px] text-[#9C98A6] font-bold uppercase tracking-wider animate-pulse">
                    Memuat Ruang Diskusi...
                  </p>
                </div>
              ) : filteredAnnouncements.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-3xl p-6 border border-[#F0EDFF] shadow-xs">
                  <div className="w-14 h-14 mx-auto mb-3 bg-[#F0ECFF] text-[#8C66FF] rounded-2xl flex items-center justify-center text-2xl">
                    <LuMessageSquare />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#2C2B30]">
                    Belum Ada Topik Diskusi
                  </h3>
                  <p className="text-xs text-[#9C98A6] mt-1">
                    Topik diskusi dan tugas dari guru akan tampil di sini.
                  </p>
                </div>
              ) : (
                filteredAnnouncements.map((ann) => {
                  const isSubmitted = !!ann.mySubmission;
                  const isGraded = ann.mySubmission?.grade !== undefined && ann.mySubmission?.grade !== null;

                  return (
                    <div
                      key={ann.id}
                      onClick={() => handleSelectAnnouncement(ann.id)}
                      className="w-full bg-white rounded-3xl overflow-hidden border border-[#F0EDFF] shadow-[0_4px_16px_rgba(140,102,255,0.06)] active:scale-[0.99] transition-all cursor-pointer hover:border-[#8C66FF]/50 flex flex-col"
                    >
                      {/* Card Header Banner (Google Classroom style) */}
                      <div className="w-full bg-gradient-to-r from-[#6366F1] to-[#8C66FF] p-4 text-white relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-xs"></div>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[9px] uppercase font-black tracking-wider bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                            Pengumuman Tugas
                          </span>
                          <span className="text-[10px] text-white/80 font-medium flex items-center gap-1">
                            <FiCalendar size={11} />
                            {formatDateIndo(ann.createdAt)}
                          </span>
                        </div>
                        <h2 className="text-base font-black leading-snug mt-1.5 drop-shadow-xs">
                          {ann.title}
                        </h2>
                        <p className="text-[11px] text-white/90 font-semibold mt-1">
                          Oleh: {ann.authorName || "Guru"}
                        </p>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex flex-col gap-3">
                        {ann.problem ? (
                          <p className="text-xs text-[#524F5D] line-clamp-2 leading-relaxed">
                            {ann.problem}
                          </p>
                        ) : null}

                        {/* Badges & Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#F0EDFF]/80">
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold text-[#8C66FF] flex items-center gap-1 bg-[#F0ECFF] px-2.5 py-1 rounded-full">
                              <LuMessageSquare size={13} />
                              {ann.discussionsCount || 0} Diskusi
                            </span>

                            {isGraded ? (
                              <span className="text-[10px] font-extrabold text-[#10B981] bg-[#ECFDF5] px-2.5 py-1 rounded-full flex items-center gap-1">
                                <FiCheckCircle size={12} />
                                Nilai: {ann.mySubmission?.grade}
                              </span>
                            ) : isSubmitted ? (
                              <span className="text-[10px] font-bold text-[#3B82F6] bg-[#EFF6FF] px-2.5 py-1 rounded-full flex items-center gap-1">
                                <FiCheckCircle size={12} />
                                Terkumpul
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-[#9C98A6] bg-[#FAF9FF] border border-[#F0EDFF] px-2 py-1 rounded-full">
                                Belum Kumpul
                              </span>
                            )}
                          </div>

                          <div className="w-7 h-7 rounded-full bg-[#FAF9FF] text-[#8C66FF] border border-[#F0EDFF] flex items-center justify-center">
                            <FiChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* ==================== VIEW 2: ANNOUNCEMENT DETAIL (3 TABS) ==================== */
          <div className="w-full flex-1 flex flex-col h-full">
            {/* Top Bar inside Detail */}
            <div className="w-full flex items-center justify-between pb-2.5 mb-2 border-b border-[#F0EDFF]">
              <div className="flex items-center gap-2.5 truncate">
                <button
                  onClick={() => {
                    setSelectedAnnouncement(null);
                    if (paramAnnouncementId) navigate("/ruang-diskusi");
                  }}
                  className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-[#F0EDFF] text-[#8C66FF] shadow-xs active:scale-95 transition-transform shrink-0"
                  title="Kembali ke Daftar"
                >
                  <FiArrowLeft size={18} />
                </button>
                <div className="truncate">
                  <h2 className="text-sm font-extrabold text-[#2C2B30] truncate">
                    {selectedAnnouncement.title}
                  </h2>
                  <p className="text-[10px] text-[#9C98A6] font-semibold truncate">
                    {selectedAnnouncement.authorName || "Guru"} • {formatDateIndo(selectedAnnouncement.createdAt)}
                  </p>
                </div>
              </div>

              {/* Ranking shortcut button */}
              <button
                onClick={() => setShowRankingModal(true)}
                className="px-2.5 py-1.5 bg-[#FFF9E6] text-[#D97706] border border-[#FDE68A] text-[10px] font-extrabold rounded-xl flex items-center gap-1 shrink-0 shadow-2xs active:scale-95"
                title="Lihat Ranking Keaktifan Diskusi"
              >
                <LuTrophy size={13} />
                <span className="hidden sm:inline">Ranking</span>
              </button>
            </div>

            {/* 3 Tabs Bar (Google Classroom inspired) */}
            <div className="w-full grid grid-cols-3 bg-white p-1 rounded-2xl border border-[#F0EDFF] shadow-xs mb-3">
              <button
                onClick={() => setActiveTab("informasi")}
                className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "informasi"
                    ? "bg-[#8C66FF] text-white shadow-xs"
                    : "text-[#9C98A6] hover:text-[#2C2B30]"
                }`}
              >
                <LuInfo size={14} />
                <span>Informasi</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("diskusi");
                  setTimeout(() => {
                    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
                  }, 150);
                }}
                className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 relative ${
                  activeTab === "diskusi"
                    ? "bg-[#8C66FF] text-white shadow-xs"
                    : "text-[#9C98A6] hover:text-[#2C2B30]"
                }`}
              >
                <LuMessageSquare size={14} />
                <span>Diskusi</span>
                {discussions.length > 0 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                      activeTab === "diskusi"
                        ? "bg-white text-[#8C66FF]"
                        : "bg-[#F0ECFF] text-[#8C66FF]"
                    }`}
                  >
                    {discussions.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("riwayat")}
                className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "riwayat"
                    ? "bg-[#8C66FF] text-white shadow-xs"
                    : "text-[#9C98A6] hover:text-[#2C2B30]"
                }`}
              >
                <LuClock size={14} />
                <span>Riwayat</span>
                {mySubmission && (
                  <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                )}
              </button>
            </div>

            {/* TAB CONTENT 1: INFORMASI (DEFAULT) */}
            {activeTab === "informasi" && (
              <div className="flex-1 overflow-y-auto pr-0.5 space-y-3.5 no-scrollbar pb-6">
                {/* 1. Soal / Permasalahan */}
                <div className="w-full bg-white rounded-3xl p-4.5 border border-[#F0EDFF] shadow-xs">
                  <div className="flex items-center gap-2 mb-2 text-[#8C66FF]">
                    <div className="w-7 h-7 rounded-xl bg-[#F0ECFF] flex items-center justify-center text-sm">
                      📌
                    </div>
                    <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#2C2B30]">
                      Soal & Permasalahan
                    </h3>
                  </div>
                  <div className="text-xs text-[#2C2B30] font-medium leading-relaxed whitespace-pre-line bg-[#FAF9FF] p-3.5 rounded-2xl border border-[#F0EDFF]/80">
                    {selectedAnnouncement.problem || "Tidak ada rincian soal/permasalahan."}
                  </div>
                </div>

                {/* 2. Pertanyaan */}
                {selectedAnnouncement.question && (
                  <div className="w-full bg-white rounded-3xl p-4.5 border border-[#F0EDFF] shadow-xs">
                    <div className="flex items-center gap-2 mb-2 text-[#3B82F6]">
                      <div className="w-7 h-7 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-sm">
                        ❓
                      </div>
                      <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#2C2B30]">
                        Pertanyaan Analisis
                      </h3>
                    </div>
                    <div className="text-xs text-[#2C2B30] font-medium leading-relaxed whitespace-pre-line bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0]/70">
                      {selectedAnnouncement.question}
                    </div>
                  </div>
                )}

                {/* 3. Informasi Tugas */}
                {selectedAnnouncement.taskInfo && (
                  <div className="w-full bg-white rounded-3xl p-4.5 border border-[#F0EDFF] shadow-xs">
                    <div className="flex items-center gap-2 mb-2 text-[#E11D48]">
                      <div className="w-7 h-7 rounded-xl bg-[#FFE4E6] flex items-center justify-center text-sm">
                        📋
                      </div>
                      <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#2C2B30]">
                        Informasi Tugas
                      </h3>
                    </div>
                    <div className="text-xs text-[#2C2B30] font-medium leading-relaxed whitespace-pre-line bg-[#FFF1F2] p-3.5 rounded-2xl border border-[#FFE4E6]">
                      {selectedAnnouncement.taskInfo}
                    </div>
                  </div>
                )}

                {/* 4. Petunjuk Pengerjaan */}
                {selectedAnnouncement.instruction && (
                  <div className="w-full bg-white rounded-3xl p-4.5 border border-[#F0EDFF] shadow-xs">
                    <div className="flex items-center gap-2 mb-2 text-[#059669]">
                      <div className="w-7 h-7 rounded-xl bg-[#D1FAE5] flex items-center justify-center text-sm">
                        💡
                      </div>
                      <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#2C2B30]">
                        Petunjuk Pengerjaan
                      </h3>
                    </div>
                    <div className="text-xs text-[#2C2B30] font-medium leading-relaxed whitespace-pre-line bg-[#F0FDF4] p-3.5 rounded-2xl border border-[#D1FAE5]">
                      {selectedAnnouncement.instruction}
                    </div>
                  </div>
                )}

                {/* Action CTA Button on Tab Informasi */}
                <div className="pt-2">
                  {mySubmission ? (
                    <button
                      onClick={() => setActiveTab("riwayat")}
                      className="w-full py-3.5 bg-[#ECFDF5] border border-[#10B981]/30 text-[#065F46] font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <FiCheckCircle size={16} className="text-[#10B981]" />
                      <span>Lihat Riwayat & Nilai Tugas Anda</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveTab("riwayat");
                        setShowSubmissionForm(true);
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-[#8C66FF] to-[#6366F1] text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-purple-200 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <LuUpload size={16} />
                      <span>Kumpulkan Jawaban Tugas Sekarang</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: DISKUSI (WHATSAPP GROUP CHAT UI) */}
            {activeTab === "diskusi" && (
              <div className="flex-1 flex flex-col bg-[#F3F2F8] rounded-3xl border border-[#E9E6F5] overflow-hidden shadow-inner relative h-[calc(100vh-14rem)]">
                {/* Chat Top Banner (Group info & active ranking badge) */}
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

                  <button
                    onClick={() => setShowRankingModal(true)}
                    className="px-2.5 py-1 bg-white border border-[#DFDCF0] rounded-full text-[9px] font-black text-[#8C66FF] flex items-center gap-1 shadow-2xs hover:bg-[#F0ECFF]"
                  >
                    <LuSparkles size={11} />
                    <span>Ranking Keaktifan</span>
                  </button>
                </div>

                {/* WhatsApp Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar">
                  {loadingDiscussions ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] text-[#9C98A6] font-bold">Memuat pesan diskusi...</p>
                    </div>
                  ) : discussions.length === 0 ? (
                    <div className="py-16 text-center px-4">
                      <div className="w-12 h-12 mx-auto mb-2 bg-white rounded-2xl flex items-center justify-center text-[#8C66FF] text-xl shadow-xs">
                        <LuMessageSquare />
                      </div>
                      <p className="text-xs font-extrabold text-[#2C2B30]">Belum ada pesan diskusi</p>
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
                            {/* Sender Info (For others) */}
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

                            {/* Message Content */}
                            <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>

                            {/* Timestamp & Read Indicator */}
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

                {/* WhatsApp Style Sticky Bottom Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="w-full bg-white px-3 py-2 border-t border-[#E9E6F5] flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Tulis pendapat atau pertanyaan..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
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
            )}

            {/* TAB CONTENT 3: RIWAYAT PENGUMPULAN TUGAS */}
            {activeTab === "riwayat" && (
              <div className="flex-1 overflow-y-auto pr-0.5 space-y-4 no-scrollbar pb-6">
                {loadingSubmission ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-2">
                    <div className="w-7 h-7 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-[#9C98A6] font-bold">Memuat riwayat pengumpulan...</p>
                  </div>
                ) : mySubmission && !showSubmissionForm ? (
                  /* Existing Submission Display */
                  <div className="space-y-3.5">
                    {/* Status & Grade Banner */}
                    <div
                      className={`w-full rounded-3xl p-4.5 border flex flex-col gap-2 ${
                        mySubmission.grade !== undefined && mySubmission.grade !== null
                          ? "bg-[#ECFDF5] border-[#A7F3D0]"
                          : "bg-[#FFFBEB] border-[#FDE68A]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiCheckCircle
                            size={18}
                            className={
                              mySubmission.grade !== undefined && mySubmission.grade !== null
                                ? "text-[#10B981]"
                                : "text-[#F59E0B]"
                            }
                          />
                          <span className="text-xs uppercase font-extrabold tracking-wider text-[#2C2B30]">
                            {mySubmission.grade !== undefined && mySubmission.grade !== null
                              ? "Sudah Dinilai oleh Guru"
                              : "Menunggu Penilaian Guru"}
                          </span>
                        </div>

                        {mySubmission.grade !== undefined && mySubmission.grade !== null && (
                          <div className="px-3 py-1 bg-[#10B981] text-white font-black text-sm rounded-full shadow-2xs">
                            Nilai: {mySubmission.grade} / 100
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-[#524F5D]">
                        Dikumpulkan pada:{" "}
                        <span className="font-bold">{formatDateIndo(mySubmission.submittedAt)}</span>
                      </p>

                      {/* Teacher Feedback if graded */}
                      {mySubmission.feedback && (
                        <div className="mt-2 p-3 bg-white rounded-2xl border border-[#A7F3D0] shadow-2xs">
                          <p className="text-[10px] font-black uppercase text-[#059669] mb-0.5">
                            Catatan & Masukan Guru:
                          </p>
                          <p className="text-xs text-[#2C2B30] italic font-medium leading-relaxed">
                            "{mySubmission.feedback}"
                          </p>
                          {mySubmission.gradedBy && (
                            <p className="text-[9px] text-[#9C98A6] font-semibold mt-1 text-right">
                              Penilai: {mySubmission.gradedBy}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Submitted Answer Card */}
                    <div className="w-full bg-white rounded-3xl p-4.5 border border-[#F0EDFF] shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#2C2B30] flex items-center gap-1.5">
                          <LuFileText className="text-[#8C66FF]" />
                          Jawaban yang Dikumpulkan
                        </h3>
                        <span className="text-[10px] font-bold text-[#8C66FF] bg-[#F0ECFF] px-2.5 py-0.5 rounded-full">
                          Kelas {mySubmission.studentClass || user?.kelas || "-"}
                        </span>
                      </div>

                      <div className="text-xs text-[#2C2B30] font-medium leading-relaxed whitespace-pre-line bg-[#FAF9FF] p-3.5 rounded-2xl border border-[#F0EDFF]/80">
                        {mySubmission.answer}
                      </div>

                      {/* Attachment preview if any */}
                      {mySubmission.hasImage && (
                        <div className="mt-3">
                          <p className="text-[10px] font-bold text-[#9C98A6] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <FiImage /> Lampiran Foto / Gambar
                          </p>
                          <div
                            onClick={() =>
                              setZoomImageUrl(
                                `${API_URL}/api/announcements/submissions/${mySubmission.id}/image`,
                              )
                            }
                            className="w-full h-44 bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0] relative cursor-pointer group"
                          >
                            <img
                              src={`${API_URL}/api/announcements/submissions/${mySubmission.id}/image`}
                              alt="Lampiran Tugas"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                              Klik untuk memperbesar
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-4 pt-3 border-t border-[#F0EDFF]">
                        <button
                          onClick={() => {
                            setTaskAnswer(mySubmission.answer);
                            setShowSubmissionForm(true);
                          }}
                          className="flex-1 py-2.5 bg-[#FAF9FF] border border-[#8C66FF]/30 text-[#8C66FF] text-xs font-bold rounded-2xl hover:bg-[#F0ECFF] transition-colors active:scale-95"
                        >
                          Perbarui Jawaban
                        </button>
                        <button
                          onClick={handleDeleteSubmission}
                          className="px-4 py-2.5 bg-[#FFF1F2] border border-[#FFE4E6] text-[#E11D48] text-xs font-bold rounded-2xl hover:bg-[#FFE4E6] transition-colors active:scale-95"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Submission Form (When not submitted or editing) */
                  <div className="w-full bg-white rounded-3xl p-5 border border-[#F0EDFF] shadow-xs flex flex-col gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-sm font-black text-[#2C2B30]">
                          {mySubmission ? "Perbarui Jawaban Tugas" : "Kumpulkan Tugas"}
                        </h3>
                        {showSubmissionForm && mySubmission && (
                          <button
                            onClick={() => setShowSubmissionForm(false)}
                            className="text-xs text-[#9C98A6] font-bold hover:text-[#2C2B30]"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-[#9C98A6]">
                        Tuliskan jawaban Anda secara rinci berdasarkan petunjuk soal.
                      </p>
                    </div>

                    {/* Answer Textarea */}
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#524F5D] block mb-1.5">
                        Jawaban Tugas *
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Ketikkan hasil analisis dan jawaban Anda di sini..."
                        value={taskAnswer}
                        onChange={(e) => setTaskAnswer(e.target.value)}
                        className="w-full p-3.5 bg-[#FAF9FF] border border-[#E9E6F5] rounded-2xl text-xs font-medium text-[#2C2B30] placeholder:text-[#9C98A6] focus:outline-none focus:border-[#8C66FF] leading-relaxed"
                      />
                    </div>

                    {/* Image Attachment */}
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#524F5D] block mb-1.5">
                        Lampiran Foto / Diagram (Opsional)
                      </label>

                      {imagePreviewUrl ? (
                        <div className="relative w-full h-36 bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0] mb-2">
                          <img
                            src={imagePreviewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleClearImage}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="w-full py-4 border-2 border-dashed border-[#DFDCF0] hover:border-[#8C66FF] rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-[#FAF9FF] transition-colors">
                          <FiImage className="text-[#8C66FF]" size={20} />
                          <span className="text-xs font-bold text-[#8C66FF]">
                            {compressingImage ? "Memproses Gambar..." : "Pilih Foto / Gambar"}
                          </span>
                          <span className="text-[9px] text-[#9C98A6]">
                            Otomatis dikompres agar hemat kuota
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="button"
                      onClick={handleSubmitTask}
                      disabled={submittingTask || compressingImage}
                      className="w-full py-3.5 bg-gradient-to-r from-[#8C66FF] to-[#6366F1] text-white text-xs font-extrabold rounded-2xl shadow-md shadow-purple-200 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      {submittingTask ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Mengirimkan Tugas...</span>
                        </>
                      ) : (
                        <>
                          <LuUpload size={16} />
                          <span>Kirim Jawaban Tugas</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================== RANKING MODAL (FRONTEND FILTER > 4 WORDS) ==================== */}
      {showRankingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#F0EDFF] shadow-2xl flex flex-col gap-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-[#F0EDFF]">
              <div className="flex items-center gap-2 text-[#D97706]">
                <div className="w-8 h-8 rounded-xl bg-[#FFF9E6] flex items-center justify-center text-base font-black">
                  <LuTrophy />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#2C2B30]">
                    Ranking Keaktifan Diskusi
                  </h3>
                  <p className="text-[10px] text-[#9C98A6] font-semibold">
                    Filter: Komentar dengan &gt; 4 kata
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRankingModal(false)}
                className="w-7 h-7 rounded-full bg-[#FAF9FF] text-[#9C98A6] flex items-center justify-center hover:text-[#2C2B30]"
              >
                <FiX size={15} />
              </button>
            </div>

            {/* Note about rule */}
            <div className="p-2.5 bg-[#FFFBEB] rounded-2xl border border-[#FDE68A] text-[10px] text-[#92400E] font-medium leading-relaxed">
              💡 <strong>Aturan Keaktifan:</strong> Hanya komentar siswa yang memiliki{" "}
              <strong>lebih dari 4 kata</strong> yang dihitung ke dalam ranking.
            </div>

            {/* Ranking list */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {rankedStudents.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#9C98A6]">
                  Belum ada siswa yang berdiskusi dengan lebih dari 4 kata.
                </div>
              ) : (
                rankedStudents.map((item, index) => {
                  let badgeColor = "bg-[#F3F4F6] text-[#4B5563]";
                  let rankIcon = `#${index + 1}`;
                  if (index === 0) {
                    badgeColor = "bg-[#FEF3C7] text-[#D97706] font-black";
                    rankIcon = "🥇 1";
                  } else if (index === 1) {
                    badgeColor = "bg-[#F1F5F9] text-[#64748B] font-black";
                    rankIcon = "🥈 2";
                  } else if (index === 2) {
                    badgeColor = "bg-[#FFEDD5] text-[#C2410C] font-black";
                    rankIcon = "🥉 3";
                  }

                  return (
                    <div
                      key={item.userId}
                      className="w-full bg-[#FAF9FF] p-3 rounded-2xl border border-[#F0EDFF] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={`w-9 h-7 rounded-xl flex items-center justify-center text-[10px] shrink-0 ${badgeColor}`}
                        >
                          {rankIcon}
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-black text-[#2C2B30] truncate">
                            {item.name}
                          </p>
                          <p className="text-[9px] text-[#9C98A6] font-semibold">
                            Kelas {item.studentClass}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-[#8C66FF]">
                          {item.validCommentsCount}
                        </span>
                        <span className="text-[9px] text-[#9C98A6] block">
                          argumen aktif
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setShowRankingModal(false)}
              className="w-full py-2.5 bg-[#8C66FF] text-white font-extrabold text-xs rounded-2xl hover:bg-[#7B55F0] transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Zoom Image Modal */}
      {zoomImageUrl && (
        <div
          onClick={() => setZoomImageUrl(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={zoomImageUrl}
              alt="Lampiran Full"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setZoomImageUrl(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
