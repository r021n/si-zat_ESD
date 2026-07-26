import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { useCustomDialog } from "../components/CustomDialog";
import {
  FiArrowLeft,
  FiRefreshCw,
  FiSend,
  FiPaperclip,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useAppBack } from "../hooks/useAppBack";
import {
  LuUpload,
  LuClock,
  LuUser,
  LuTrash2,
  LuImage,
  LuMessageSquare,
  LuAward,
} from "react-icons/lu";
import {
  getTaskSubmissionsApi,
  createTaskSubmissionApi,
  deleteTaskSubmissionApi,
  getTaskDiscussionsApi,
  sendTaskDiscussionApi,
  getOverallContributorsApi,
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

interface ContributorData {
  name: string;
  detail?: string;
  count: number;
}

// Canvas-based image compression helper
function compressImage(
  file: File,
  maxSizeBytes: number = 200 * 1024,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      resolve(file); // Fallback to original if not an image
      return;
    }

    if (file.size <= maxSizeBytes) {
      resolve(file); // No compression needed
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Downscale image dimensions if too large to limit memory
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
          resolve(file); // Fallback
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.9;
        const attemptCompression = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file); // Fallback
                return;
              }

              if (blob.size <= maxSizeBytes || quality <= 0.1) {
                resolve(blob);
              } else {
                quality -= 0.1;
                // If quality is low, also scale down resolution
                if (quality < 0.5) {
                  canvas.width = Math.round(canvas.width * 0.85);
                  canvas.height = Math.round(canvas.height * 0.85);
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
                attemptCompression();
              }
            },
            "image/jpeg",
            quality,
          );
        };

        attemptCompression();
      };
      img.onerror = () => reject(new Error("Gagal membaca gambar"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

export default function PenilaianBerpikirSistem() {
  const goBack = useAppBack();
  const { user, token } = useAuthStore();
  const { showAlert, showConfirm } = useCustomDialog();

  // Active view: "list" | "detail" | "upload" | "history"
  const [activeView, setActiveView] = useState<
    "list" | "detail" | "upload" | "history"
  >("list");

  // Submissions list state
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(true);

  // Selected submission for detail/discussion view
  const [selectedSubmission, setSelectedSubmission] =
    useState<TaskSubmission | null>(null);

  // Toggle collapse/expand for task details in discussion
  const [isTaskCollapsed, setIsTaskCollapsed] = useState<boolean>(false);

  // Discussion state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Upload Form State
  const [title, setTitle] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);

  // Compressing indicators
  const [compressing, setCompressing] = useState<boolean>(false);
  const [originalSize, setOriginalSize] = useState<string>("");
  const [compressedSize, setCompressedSize] = useState<string>("");

  // Contributor Modal State
  const [isContributorModalOpen, setIsContributorModalOpen] =
    useState<boolean>(false);
  const [contributorModalType, setContributorModalType] = useState<
    "overall" | "task"
  >("overall");
  const [contributorModalTaskTitle, setContributorModalTaskTitle] =
    useState<string>("");
  const [contributorModalSubmissionId, setContributorModalSubmissionId] =
    useState<string>("");
  const [loadingContributors, setLoadingContributors] =
    useState<boolean>(false);
  const [contributorsData, setContributorsData] = useState<ContributorData[]>(
    [],
  );
  const [contributorsError, setContributorsError] = useState<string | null>(
    null,
  );

  const displayName = user ? user.nama || user.email.split("@")[0] : "Pengguna";
  const isAdmin = user
    ? user.status.toLowerCase() === "admin" ||
      user.email.toLowerCase().includes("admin")
    : false;

  const handleShowTaskContributors = (
    submissionId: string,
    taskTitle: string,
  ) => {
    setContributorModalType("task");
    setContributorModalSubmissionId(submissionId);
    setContributorModalTaskTitle(taskTitle);
    setIsContributorModalOpen(true);
  };

  const handleShowOverallContributors = () => {
    setContributorModalType("overall");
    setContributorModalSubmissionId("");
    setContributorModalTaskTitle("Keseluruhan");
    setIsContributorModalOpen(true);
  };

  // Fetch contributor data after modal is opened
  useEffect(() => {
    if (!isContributorModalOpen) return;

    let active = true;

    const fetchContributors = async () => {
      setLoadingContributors(true);
      setContributorsError(null);
      setContributorsData([]);

      try {
        if (contributorModalType === "overall") {
          const data = await getOverallContributorsApi(token || "");
          if (!active) return;
          const formatted = data.map((item: any) => ({
            name: item.name,
            detail: `Kelas ${item.studentClass}`,
            count: item.count,
          }));
          setContributorsData(formatted);
        } else {
          let dataToProcess: any[] = [];
          if (
            selectedSubmission &&
            selectedSubmission.id === contributorModalSubmissionId &&
            messages.length > 0
          ) {
            dataToProcess = messages;
          } else {
            dataToProcess = await getTaskDiscussionsApi(
              token || "",
              contributorModalSubmissionId,
            );
          }
          if (!active) return;

          const counts: Record<string, { name: string; count: number }> = {};
          dataToProcess.forEach((comment: any) => {
            const role = comment.senderRole?.toLowerCase();
            if (role === "siswa") {
              const key = comment.senderName;
              if (!counts[key]) {
                counts[key] = { name: comment.senderName, count: 0 };
              }
              counts[key].count++;
            }
          });

          const sorted = Object.values(counts)
            .sort((a: any, b: any) => b.count - a.count)
            .map((item: any) => ({
              name: item.name,
              count: item.count,
            }));

          setContributorsData(sorted);
        }
      } catch (err: any) {
        if (!active) return;
        console.error(err);
        setContributorsError(err.message || "Gagal memuat data kontributor.");
      } finally {
        if (active) {
          setLoadingContributors(false);
        }
      }
    };

    fetchContributors();

    return () => {
      active = false;
    };
  }, [
    isContributorModalOpen,
    contributorModalType,
    contributorModalSubmissionId,
    token,
    selectedSubmission,
    messages,
  ]);

  // Fetch all submissions
  const fetchSubmissions = async (showLoading = true) => {
    try {
      if (showLoading) setLoadingSubmissions(true);
      const data = await getTaskSubmissionsApi(token || "");
      setSubmissions(data);
    } catch (err) {
      console.error("Gagal memuat tugas diskusi:", err);
    } finally {
      if (showLoading) setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSubmissions();
    }
  }, [token]);

  // Fetch messages with polling every 5s if in detail view and window is active
  useEffect(() => {
    if (activeView !== "detail" || !selectedSubmission) {
      setMessages([]);
      return;
    }

    const fetchMessages = async (showLoading = false) => {
      try {
        if (showLoading) setLoadingMessages(true);
        const data = await getTaskDiscussionsApi(
          token || "",
          selectedSubmission.id,
        );
        setMessages(data);
      } catch (err) {
        console.error("Gagal memuat pesan diskusi:", err);
      } finally {
        if (showLoading) setLoadingMessages(false);
      }
    };

    fetchMessages(true);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchMessages(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeView, selectedSubmission, token]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSubmission) return;

    const textToSend = newMessage.trim();
    setNewMessage("");

    try {
      const response = await sendTaskDiscussionApi(
        token || "",
        selectedSubmission.id,
        textToSend,
      );
      setMessages((prev) => [...prev, response.comment]);
    } catch (err: any) {
      await showAlert(err.message || "Gagal mengirimkan pesan diskusi.");
    }
  };

  // Handle file change in upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileName(selectedFile.name);
      setOriginalSize((selectedFile.size / 1024).toFixed(1) + " KB");
      setCompressing(true);

      try {
        const compressed = await compressImage(selectedFile);
        setFileBlob(compressed);
        setCompressedSize((compressed.size / 1024).toFixed(1) + " KB");
      } catch (err) {
        console.error("Gagal mengompresi gambar:", err);
        setFileBlob(selectedFile); // Fallback
        setCompressedSize((selectedFile.size / 1024).toFixed(1) + " KB");
      } finally {
        setCompressing(false);
      }
    }
  };

  // Handle submit new task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !answer.trim()) {
      await showAlert("Mohon isi judul dan jawaban tugas.");
      return;
    }

    if (compressing) {
      await showAlert("Sedang mengompresi gambar, mohon tunggu sebentar...");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("answer", answer.trim());

      if (fileBlob) {
        const uploadName = fileName.replace(/\.[^/.]+$/, "") + ".jpg";
        formData.append("file", fileBlob, uploadName);
        formData.append("fileName", uploadName);
      } else {
        formData.append("fileName", "Tidak ada berkas terlampir");
      }

      await createTaskSubmissionApi(token || "", formData);

      // Reset form
      setTitle("");
      setAnswer("");
      setFileName("");
      setFileBlob(null);
      setOriginalSize("");
      setCompressedSize("");

      await showAlert("Tugas berhasil dikumpulkan!");

      // Refresh list
      await fetchSubmissions(false);

      // Redirect back to list
      setActiveView("list");
    } catch (err: any) {
      await showAlert(err.message || "Gagal mengumpulkan tugas.");
    }
  };

  // Handle delete task
  const handleDelete = async (id: string) => {
    const confirmDelete = await showConfirm(
      "Apakah Anda yakin ingin menghapus pengumpulan tugas ini?",
    );
    if (!confirmDelete) return;

    try {
      await deleteTaskSubmissionApi(token || "", id);
      setSubmissions(submissions.filter((s) => s.id !== id));
      await showAlert("Tugas berhasil dihapus!");
    } catch (err: any) {
      await showAlert(err.message || "Gagal menghapus tugas.");
    }
  };

  // Filter user submissions for history
  const mySubmissions = submissions.filter((sub) => sub.userId === user?.id);

  return (
    <div className="w-full h-screen max-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      {/* Decorative Blur Bubble */}
      <div className="absolute top-[-10%] right-[-10%] w-50 h-50 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-107.5 h-full max-h-screen flex flex-col justify-between px-6 py-6 z-10 overflow-hidden">
        {/* Top Header Section */}
        <div>
          <div className="w-full flex justify-between items-center mt-4 mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={() => {
                  if (activeView === "list") {
                    goBack("/menu");
                  } else if (activeView === "detail") {
                    setSelectedSubmission(null);
                    setActiveView("list");
                  } else {
                    setActiveView("list");
                  }
                }}
                className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 transition-none shrink-0"
                title="Kembali"
              >
                <FiArrowLeft size={20} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">
                  {activeView === "list" && "Evaluasi Pembelajaran"}
                  {activeView === "detail" && "Forum Diskusi"}
                  {activeView === "upload" && "Pengumpulan Tugas"}
                  {activeView === "history" && "Riwayat Pengumpulan"}
                </p>
                <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight mt-0.5 truncate">
                  {activeView === "list" && "Berpikir Sistem"}
                  {activeView === "detail" && "Diskusi Tugas"}
                  {activeView === "upload" && "Kirim Tugas"}
                  {activeView === "history" && "Tugas Saya"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Refresh button - only visible on list view */}
              {activeView === "list" && (
                <button
                  onClick={() => fetchSubmissions(true)}
                  disabled={loadingSubmissions}
                  className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 transition-none"
                  title="Segarkan data"
                >
                  <FiRefreshCw
                    size={16}
                    className={loadingSubmissions ? "animate-spin" : ""}
                  />
                </button>
              )}

              {/* Overall Contributors statistics button - only visible to admin on list view */}
              {activeView === "list" && isAdmin && (
                <button
                  onClick={handleShowOverallContributors}
                  className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 transition-none"
                  title="Kontributor Terbanyak (Keseluruhan)"
                >
                  <LuAward size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View switching content container */}
        <div className="w-full flex-1 flex flex-col justify-start my-2 overflow-hidden">
          {/* LIST VIEW */}
          {activeView === "list" && (
            <div className="w-full flex-1 flex flex-col gap-3">
              {/* Quick Action Navigation Grid */}
              <div className="w-full flex gap-3 mb-2">
                <button
                  onClick={() => setActiveView("upload")}
                  className="flex-1 bg-white rounded-[20px] p-4 flex flex-col items-center justify-center shadow-sm border border-[#F0EDFF] cursor-pointer transition-none text-center active:bg-neutral-50"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#E6F8F6] text-[#2C8578] mb-2 shadow-inner">
                    <LuUpload className="text-lg" />
                  </div>
                  <span className="text-xs font-bold text-[#2C2B30]">
                    Unggah Tugas
                  </span>
                  <span className="text-[9px] text-[#9C98A6] mt-0.5">
                    Kirim analisis baru
                  </span>
                </button>

                <button
                  onClick={() => setActiveView("history")}
                  className="flex-1 bg-white rounded-[20px] p-4 flex flex-col items-center justify-center shadow-sm border border-[#F0EDFF] cursor-pointer transition-none text-center active:bg-neutral-50"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FFEBF0] text-[#D95276] mb-2 shadow-inner">
                    <LuClock className="text-lg" />
                  </div>
                  <span className="text-xs font-bold text-[#2C2B30]">
                    Tugas Saya
                  </span>
                  <span className="text-[9px] text-[#9C98A6] mt-0.5">
                    Riwayat & hapus ({mySubmissions.length})
                  </span>
                </button>
              </div>

              {/* Submissions list */}
              <div className="w-full flex-1 flex flex-col gap-3 overflow-y-auto max-h-[58vh] pr-1 custom-scroll">
                <p className="text-[10px] text-[#9C98A6] font-semibold leading-relaxed bg-[#F5F2FF] border border-[#E9E4FF] p-3 rounded-2xl">
                  💡 Pilih salah satu tugas di bawah ini untuk membuka forum
                  obrolan dan mendiskusikan hasil analisis berpikir sistem
                  mereka.
                </p>

                {loadingSubmissions ? (
                  <div className="w-full py-12 flex flex-col items-center justify-center gap-2 bg-white border border-dashed border-[#F0EDFF] rounded-3xl shadow-sm">
                    <div className="w-6 h-6 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold text-[#9C98A6] uppercase tracking-wider">
                      Memuat daftar tugas...
                    </p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="w-full py-12 flex flex-col items-center justify-center gap-2 bg-white border border-dashed border-[#F0EDFF] rounded-3xl shadow-sm text-center px-4">
                    <p className="text-xs text-[#9C98A6] italic font-semibold">
                      Belum ada tugas yang dikumpulkan untuk didiskusikan.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 pb-4">
                    {submissions.map((sub) => {
                      const hasImage =
                        sub.fileName &&
                        sub.fileName !== "Tidak ada berkas terlampir";
                      return (
                        <div
                          key={sub.id}
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setActiveView("detail");
                          }}
                          className="w-full p-4.5 bg-white rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] border border-[#F0EDFF] cursor-pointer active:bg-neutral-50 transition-none flex flex-col gap-2 relative"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold uppercase bg-[#E8E5FF] text-[#635BFF] px-2.5 py-0.5 rounded-full">
                              Kelas {sub.studentClass}
                            </span>
                            <span className="text-[9px] text-[#9C98A6] font-semibold">
                              {sub.submittedAt.split(",")[0]}
                            </span>
                          </div>

                          <h3 className="text-xs font-extrabold text-[#2C2B30] tracking-wide leading-snug">
                            {sub.title}
                          </h3>

                          <p className="text-[11px] text-[#5C5A60] leading-relaxed line-clamp-2">
                            {sub.answer}
                          </p>

                          <div className="h-px bg-[#F5F2FF] w-full my-1"></div>

                          <div className="flex justify-between items-center text-[10px] text-[#9C98A6] font-bold">
                            <span className="text-[#2C2B30] flex items-center gap-1">
                              <LuUser size={12} className="text-[#8C66FF]" />{" "}
                              {sub.studentName}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                title="Statistik Kontributor Komentar"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShowTaskContributors(sub.id, sub.title);
                                }}
                                className="text-[#8C66FF] hover:bg-[#F5F3FF] p-1 rounded-md transition-colors flex items-center justify-center border border-[#E9E4FF] cursor-pointer"
                              >
                                <LuAward size={13} />
                              </button>
                              {hasImage && (
                                <span className="text-[#2C8578] flex items-center gap-1 bg-[#E6F8F6] px-2 py-0.5 rounded-md text-[9px]">
                                  <LuImage size={11} /> Lampiran
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DETAIL / DISCUSSION THREAD VIEW */}
          {activeView === "detail" && selectedSubmission && (
            <div className="w-full flex-1 flex flex-col gap-3 overflow-hidden min-h-0">
              {/* Task info box */}
              {isTaskCollapsed ? (
                <div
                  onClick={() => setIsTaskCollapsed(false)}
                  className="w-full bg-white border border-[#F0EDFF] rounded-[20px] px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex justify-between items-center cursor-pointer active:bg-neutral-50"
                >
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                    <LuUser className="text-[#8C66FF] shrink-0" size={14} />
                    <span className="text-[11px] font-extrabold text-[#2C2B30] truncate">
                      Detail Tugas: "{selectedSubmission.title}" (
                      {selectedSubmission.studentName})
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
                      <p className="text-[8px] font-bold uppercase tracking-widest text-[#9C98A6]">
                        Tugas dari
                      </p>
                      <p className="text-[10px] font-extrabold text-[#2C2B30] flex items-center gap-1 mt-0.5">
                        <LuUser size={12} className="text-[#8C66FF]" />{" "}
                        {selectedSubmission.studentName} (
                        {selectedSubmission.studentClass})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-[#9C98A6] font-semibold">
                        ⏱ {selectedSubmission.submittedAt}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsTaskCollapsed(true)}
                        className="text-[10px] font-extrabold uppercase text-[#8C66FF] flex items-center gap-0.5 cursor-pointer active:opacity-75"
                        title="Sembunyikan detail tugas"
                      >
                        <span>Sembunyikan</span>
                        <FiChevronUp size={12} />
                      </button>
                    </div>
                  </div>

                  <h2 className="text-xs font-extrabold text-[#2C2B30] tracking-wide mt-1">
                    {selectedSubmission.title}
                  </h2>

                  <p className="text-[11px] text-[#5C5A60] leading-relaxed whitespace-pre-wrap">
                    {selectedSubmission.answer}
                  </p>

                  {selectedSubmission.fileName &&
                    selectedSubmission.fileName !==
                      "Tidak ada berkas terlampir" && (
                      <div className="mt-2 border border-[#F0EDFF] bg-[#FAF9FF] p-2 rounded-2xl flex flex-col gap-1.5">
                        <div className="w-full bg-white border border-[#F0EDFF] rounded-xl flex justify-center items-center overflow-hidden max-h-35">
                          <img
                            src={`${API_URL}/api/tasks/submissions/${selectedSubmission.id}/image`}
                            alt={selectedSubmission.title}
                            className="max-h-35 w-auto object-contain cursor-pointer active:opacity-80"
                            onClick={() =>
                              window.open(
                                `${API_URL}/api/tasks/submissions/${selectedSubmission.id}/image`,
                                "_blank",
                              )
                            }
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                        <span className="text-[9px] text-[#9C98A6] font-semibold truncate text-center flex items-center justify-center gap-1">
                          <FiPaperclip size={10} />{" "}
                          {selectedSubmission.fileName}
                        </span>
                      </div>
                    )}
                </div>
              )}

              {/* Chat Thread */}
              <div className="w-full flex-1 p-4 bg-white border border-[#F0EDFF] rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] overflow-y-auto flex flex-col gap-3 custom-scroll min-h-0">
                {loadingMessages && messages.length === 0 ? (
                  <p className="text-xs text-[#9C98A6] italic text-center py-6">
                    Memuat obrolan...
                  </p>
                ) : messages.length === 0 ? (
                  <div className="w-full py-8 flex flex-col items-center justify-center text-center gap-1.5 bg-[#FAF9FF] border border-dashed border-[#E9E4FF] rounded-2xl px-3">
                    <LuMessageSquare
                      size={20}
                      className="text-[#8C66FF] opacity-60"
                    />
                    <p className="text-xs text-[#9C98A6] italic font-semibold">
                      Belum ada diskusi untuk tugas ini. Tulis tanggapan Anda di
                      bawah untuk memulai!
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
                          <span
                            className={`font-extrabold ${
                              isMe ? "text-[#8C66FF]" : "text-[#2C2B30]"
                            }`}
                          >
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

                        <span className="text-[8px] text-[#9C98A6] font-semibold">
                          {msg.createdAt}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef}></div>
              </div>

              {/* Chat Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="w-full flex flex-col gap-1.5 mt-auto"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
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
          )}

          {/* UPLOAD FORM VIEW */}
          {activeView === "upload" && (
            <div className="w-full flex-1 flex flex-col gap-4 overflow-y-auto max-h-[72vh] pr-1 custom-scroll pb-4">
              <form
                onSubmit={handleSubmit}
                className="w-full flex flex-col gap-4 bg-white border border-[#F0EDFF] rounded-3xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
              >
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#2C2B30] border-b border-[#F5F2FF] pb-2">
                  Form Pengumpulan Tugas
                </h2>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-[#9C98A6]">
                    Judul Tugas
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Analisis Lingkungan Udara"
                    className="w-full px-4 py-3 bg-[#FAF9FF] border border-[#F0EDFF] rounded-2xl text-xs font-semibold text-[#2C2B30] placeholder-[#9C98A6] focus:outline-none focus:bg-white focus:border-[#8C66FF] transition-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-[#9C98A6]">
                    Jawaban / Analisis Deskriptif
                  </label>
                  <textarea
                    rows={6}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Tuliskan analisis berpikir sistem Anda secara mendalam..."
                    className="w-full px-4 py-3 bg-[#FAF9FF] border border-[#F0EDFF] rounded-2xl text-xs font-semibold text-[#2C2B30] placeholder-[#9C98A6] focus:outline-none focus:bg-white focus:border-[#8C66FF] resize-none transition-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-[#9C98A6]">
                    Unggah Lampiran Gambar (Opsional)
                  </label>

                  {!fileName ? (
                    <label className="w-full border-2 border-dashed border-[#E9E4FF] hover:border-[#8C66FF] rounded-2xl p-6 flex flex-col items-center justify-center bg-[#FAF9FF] cursor-pointer active:bg-[#F3F0FF] transition-none">
                      <LuImage className="text-3xl text-[#8C66FF] mb-1.5" />
                      <span className="text-xs font-bold text-[#8C66FF]">
                        Pilih File Gambar
                      </span>
                      <span className="text-[9px] text-[#9C98A6] mt-0.5 font-semibold">
                        Maksimal 200 KB (Otomatis dikompres)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={compressing}
                      />
                    </label>
                  ) : (
                    <div className="w-full border border-[#F0EDFF] bg-[#FAF9FF] rounded-2xl p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 truncate flex-1">
                          <FiPaperclip className="text-[#8C66FF] shrink-0" />
                          <span className="text-xs font-bold truncate text-[#2C2B30]">
                            {fileName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFileName("");
                            setFileBlob(null);
                            setOriginalSize("");
                            setCompressedSize("");
                          }}
                          className="text-[10px] font-extrabold uppercase text-[#D95276] border-b border-transparent hover:border-[#D95276] cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                      {compressing && (
                        <p className="text-[9px] font-mono text-[#8C66FF] font-bold animate-pulse">
                          Mengompresi gambar...
                        </p>
                      )}
                      {compressedSize && !compressing && (
                        <p className="text-[9px] font-mono text-[#2C8578] font-bold">
                          Ukuran: {originalSize} &rarr; {compressedSize} (&lt;
                          200 KB)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setActiveView("list")}
                    className="flex-1 py-3.5 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-sm cursor-pointer transition-none text-center active:bg-neutral-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={compressing}
                    className={`flex-1 py-3.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md cursor-pointer transition-none text-center active:bg-[#7752EB] ${
                      compressing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {compressing ? "Memproses..." : "Kirim Tugas"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* HISTORY VIEW */}
          {activeView === "history" && (
            <div className="w-full flex-1 flex flex-col gap-3 overflow-y-auto max-h-[72vh] pr-1 custom-scroll pb-4">
              <div className="w-full flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-[#F5F2FF] pb-2">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#2C2B30]">
                    Riwayat Pengumpulan Saya
                  </h2>
                  <span className="text-[10px] font-bold bg-[#E8E5FF] text-[#635BFF] px-2.5 py-0.5 rounded-full">
                    {mySubmissions.length} Tugas
                  </span>
                </div>

                {mySubmissions.length === 0 ? (
                  <div className="w-full py-12 flex flex-col items-center justify-center gap-2 bg-white border border-dashed border-[#F0EDFF] rounded-3xl shadow-sm text-center px-4">
                    <p className="text-xs text-[#9C98A6] italic font-semibold">
                      Belum ada tugas yang Anda kumpulkan.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {mySubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="w-full p-4.5 bg-white border border-[#F0EDFF] rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex flex-col gap-2"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-xs font-extrabold text-[#2C2B30] tracking-wide leading-tight truncate max-w-55">
                            {sub.title}
                          </h3>
                          <button
                            type="button"
                            onClick={() => handleDelete(sub.id)}
                            className="text-[9px] font-bold uppercase text-[#D95276] hover:text-[#b53a59] cursor-pointer flex items-center gap-1 bg-[#FFEBF0] px-2.5 py-1 rounded-full transition-none active:bg-[#ffd1dd]"
                          >
                            <LuTrash2 size={10} /> Hapus
                          </button>
                        </div>

                        <p className="text-[11px] text-[#5C5A60] leading-relaxed whitespace-pre-wrap">
                          {sub.answer}
                        </p>

                        {sub.fileName &&
                          sub.fileName !== "Tidak ada berkas terlampir" && (
                            <div className="mt-2 border border-[#F0EDFF] bg-[#FAF9FF] p-2 rounded-2xl flex flex-col gap-1.5">
                              <div className="w-full bg-white border border-[#F0EDFF] rounded-xl flex justify-center items-center overflow-hidden max-h-30">
                                <img
                                  src={`${API_URL}/api/tasks/submissions/${sub.id}/image`}
                                  alt={sub.title}
                                  className="max-h-30 w-auto object-contain cursor-pointer active:opacity-80"
                                  onClick={() =>
                                    window.open(
                                      `${API_URL}/api/tasks/submissions/${sub.id}/image`,
                                      "_blank",
                                    )
                                  }
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display =
                                      "none";
                                  }}
                                />
                              </div>
                              <span className="text-[9px] text-[#9C98A6] font-semibold truncate text-center flex items-center justify-center gap-1">
                                <FiPaperclip size={10} /> {sub.fileName}
                              </span>
                            </div>
                          )}

                        <div className="h-px bg-[#F5F2FF] w-full my-1"></div>

                        <div className="flex justify-between items-center text-[9px] text-[#9C98A6] font-bold">
                          <span className="truncate max-w-37.5 flex items-center gap-1">
                            <FiPaperclip size={10} /> {sub.fileName}
                          </span>
                          <span className="flex items-center gap-1">
                            <LuClock size={10} /> {sub.submittedAt}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Contributor Modal */}
        {isContributorModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-6 backdrop-blur-xs">
            <div className="w-full max-w-85 bg-white rounded-[28px] p-6 shadow-xl border border-[#F0EDFF] flex flex-col gap-4 animate-none select-none text-left">
              <div>
                <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide uppercase flex items-center gap-2">
                  <LuAward className="text-[#8C66FF]" />
                  Kontributor Terbanyak
                </h3>
                <p className="text-[10px] text-[#9C98A6] font-semibold mt-1 line-clamp-2">
                  {contributorModalType === "overall"
                    ? "Berdasarkan keseluruhan topik diskusi"
                    : `Tugas: "${contributorModalTaskTitle}"`}
                </p>
              </div>

              <div className="max-h-55 overflow-y-auto pr-1 flex flex-col gap-2.5 my-1 no-scrollbar">
                {loadingContributors ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-center">
                    <div className="w-6 h-6 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] text-[#9C98A6] font-bold uppercase tracking-widest animate-pulse">
                      Memuat Kontributor...
                    </p>
                  </div>
                ) : contributorsError ? (
                  <p className="text-xs text-[#FF5E8C] font-semibold text-center py-4">
                    {contributorsError}
                  </p>
                ) : contributorsData.length === 0 ? (
                  <p className="text-xs text-[#9C98A6] font-semibold text-center py-6">
                    Belum ada komentar/diskusi yang tercatat.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {contributorsData.map((item, index) => (
                      <div
                        key={index}
                        className="w-full bg-[#FAF9FF] border border-[#F0EDFF]/70 rounded-xl px-4 py-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 truncate min-w-0">
                          <span className="text-[10px] font-black text-[#9C98A6] w-4 shrink-0">
                            {index + 1}.
                          </span>
                          <div className="flex flex-col truncate min-w-0">
                            <span className="text-xs font-bold text-[#2C2B30] truncate">
                              {item.name}
                            </span>
                            {item.detail && (
                              <span className="text-[9px] text-[#9C98A6] font-semibold mt-0.5">
                                {item.detail}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-black text-[#8C66FF] bg-[#F0ECFF] px-2.5 py-1 rounded-full shrink-0">
                          {item.count}x
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 mt-1">
                <button
                  onClick={() => setIsContributorModalOpen(false)}
                  className="w-full py-3.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
