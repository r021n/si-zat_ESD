import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useAppBack } from "../hooks/useAppBack";
import { useCustomDialog } from "../components/CustomDialog";
import AnnouncementForm from "../components/admin/AnnouncementForm";
import {
  FiArrowLeft,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiImage,
  // FiCalendar,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiEye,
  FiChevronDown,
  FiChevronUp,
  FiSliders,
} from "react-icons/fi";
import {
  LuMessageSquare,
  LuTrophy,
  LuAward,
  LuBookOpen,
} from "react-icons/lu";
import {
  getAnnouncementsApi,
  createAnnouncementApi,
  updateAnnouncementApi,
  deleteAnnouncementApi,
  getAnnouncementSubmissionsApi,
  getAnnouncementDiscussionsApi,
  gradeAnnouncementSubmissionApi,
} from "../api/api";
import type {
  AnnouncementItem,
  SubmissionItem,
  DiscussionMessage,
  RankedStudent,
} from "../types/discussion";
import { API_URL, PLACEHOLDER_IMAGE_URL } from "../utils/constants";
import { isAdmin } from "../utils/auth";
import { formatDateIndo } from "../utils/date";

export default function AdminDiskusi() {
  const navigate = useNavigate();
  const goBack = useAppBack();
  const { user, token } = useAuthStore();
  const { showAlert, showConfirm } = useCustomDialog();

  // Announcements List
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Create / Edit Announcement Fullscreen Form
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<AnnouncementItem | null>(null);

  // Submissions Grading View
  const [selectedForSubmissions, setSelectedForSubmissions] =
    useState<AnnouncementItem | null>(null);
  const [submissionsList, setSubmissionsList] = useState<SubmissionItem[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(false);
  const [searchSubmissionQuery, setSearchSubmissionQuery] =
    useState<string>("");
  const [submissionFilterStatus, setSubmissionFilterStatus] = useState<
    "all" | "graded" | "ungraded"
  >("all");
  const [submissionSort, setSubmissionSort] = useState<
    "newest" | "oldest" | "highest" | "lowest" | "name"
  >("newest");
  const [showTopicDetails, setShowTopicDetails] = useState<boolean>(false);

  // Single Submission Grading Modal
  const [gradingSubmission, setGradingSubmission] =
    useState<SubmissionItem | null>(null);
  const [gradeScore, setGradeScore] = useState<string>("");
  const [gradeFeedback, setGradeFeedback] = useState<string>("");
  const [savingGrade, setSavingGrade] = useState<boolean>(false);

  // Full Answer Preview Modal
  const [viewingAnswerSub, setViewingAnswerSub] =
    useState<SubmissionItem | null>(null);

  // Ranking Modal
  const [rankingAnnouncement, setRankingAnnouncement] =
    useState<AnnouncementItem | null>(null);
  const [rankingMessages, setRankingMessages] = useState<DiscussionMessage[]>(
    [],
  );
  const [loadingRanking, setLoadingRanking] = useState<boolean>(false);

  // Zoom Image
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isAdmin(user)) {
      navigate(!user ? "/auth" : "/menu");
    }
  }, [user, navigate]);

  const fetchAnnouncements = useCallback(
    async (force = false) => {
      if (!token) return;
      setLoadingList(true);
      try {
        const data = await getAnnouncementsApi(token, force);
        setAnnouncements(data || []);
      } catch (err: any) {
        console.error("Gagal mengambil data diskusi:", err);
      } finally {
        setLoadingList(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Open Create Form
  const handleOpenCreateForm = () => {
    setEditingAnnouncement(null);
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEditForm = (ann: AnnouncementItem) => {
    setEditingAnnouncement(ann);
    setIsFormOpen(true);
  };

  // Save (Create or Update) Announcement
  const handleSaveAnnouncement = async (payload: FormData) => {
    if (!token) return;

    try {
      if (editingAnnouncement) {
        await updateAnnouncementApi(token, editingAnnouncement.id, payload);
        showAlert("Topik diskusi berhasil diubah.", "Berhasil Diperbarui");
      } else {
        await createAnnouncementApi(token, payload);
        showAlert(
          "Topik dan ruang diskusi baru berhasil dibuat.",
          "Berhasil Dibuat",
        );
      }

      setIsFormOpen(false);
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch (err: any) {
      showAlert(
        err.message || "Terjadi kendala saat menyimpan topik diskusi.",
        "Gagal Menyimpan",
      );
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id: string, title: string) => {
    if (!token) return;
    const confirmed = await showConfirm(
      `Apakah Anda yakin ingin menghapus topik "${title}" beserta seluruh diskusi dan pengumpulan tugasnya?`,
    );
    if (!confirmed) return;

    try {
      await deleteAnnouncementApi(token, id);
      showAlert("Topik diskusi berhasil dihapus.", "Dihapus");
      fetchAnnouncements();
    } catch (err: any) {
      showAlert(
        err.message || "Gagal menghapus topik diskusi.",
        "Gagal Menghapus",
      );
    }
  };

  // Open Submissions List for an Announcement (force=true bypasses 30s cache)
  const handleOpenSubmissions = async (
    ann: AnnouncementItem,
    force = false,
  ) => {
    if (!token) return;
    setSelectedForSubmissions(ann);
    setLoadingSubmissions(true);
    try {
      const data = await getAnnouncementSubmissionsApi(token, ann.id, force);
      setSubmissionsList(data || []);
    } catch (err: any) {
      showAlert(
        err.message || "Gagal mengambil data pengumpulan tugas.",
        "Gagal Membuka",
      );
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Open Grading Modal
  const handleOpenGradingModal = (sub: SubmissionItem) => {
    setGradingSubmission(sub);
    setGradeScore(
      sub.grade !== undefined && sub.grade !== null ? String(sub.grade) : "",
    );
    setGradeFeedback(sub.feedback || "");
  };

  // Submit Grade
  const handleSaveGrade = async () => {
    if (!gradingSubmission || !token) return;

    const numScore = Number(gradeScore);
    if (
      gradeScore === "" ||
      isNaN(numScore) ||
      numScore < 0 ||
      numScore > 100
    ) {
      showAlert(
        "Masukkan nilai angka antara 0 hingga 100.",
        "Nilai Tidak Valid",
      );
      return;
    }

    setSavingGrade(true);
    try {
      await gradeAnnouncementSubmissionApi(
        token,
        gradingSubmission.id,
        numScore,
        gradeFeedback.trim(),
      );

      showAlert(
        `Tugas milik ${gradingSubmission.studentName} berhasil dinilai.`,
        "Nilai Disimpan",
      );

      // Update in local submissions list
      setSubmissionsList((prev) =>
        prev.map((s) =>
          s.id === gradingSubmission.id
            ? {
                ...s,
                grade: numScore,
                feedback: gradeFeedback.trim(),
                gradedAt: new Date().toISOString(),
                gradedBy: user?.nama || "Guru",
              }
            : s,
        ),
      );

      setGradingSubmission(null);
    } catch (err: any) {
      showAlert(
        err.message || "Gagal menyimpan penilaian tugas.",
        "Gagal Menyimpan Nilai",
      );
    } finally {
      setSavingGrade(false);
    }
  };

  // Open Ranking Modal (Filtered on frontend: comments > 4 words)
  // Uses the discussions cache (8s TTL) to avoid duplicate fetches
  const handleOpenRanking = async (ann: AnnouncementItem) => {
    if (!token) return;
    setRankingAnnouncement(ann);
    setLoadingRanking(true);
    try {
      const data = await getAnnouncementDiscussionsApi(token, ann.id);
      setRankingMessages(data || []);
    } catch (err: any) {
      showAlert(
        err.message || "Gagal memuat pesan diskusi.",
        "Gagal Membuka Ranking",
      );
    } finally {
      setLoadingRanking(false);
    }
  };

  // Filter Ranking calculation in Frontend (> 4 words rule)
  const countWords = (text: string) => {
    return (text || "").trim().split(/\s+/).filter(Boolean).length;
  };

  const calculateAdminRanking = (): RankedStudent[] => {
    const studentMessages = rankingMessages.filter(
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

  const rankedStudents = calculateAdminRanking();


  const filteredAnnouncements = announcements.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.problem.toLowerCase().includes(q)
    );
  });

  // Submissions computed stats for View 2
  const totalSubmissionsCount = submissionsList.length;
  const gradedCount = submissionsList.filter(
    (s) => s.grade !== undefined && s.grade !== null,
  ).length;
  const ungradedCount = totalSubmissionsCount - gradedCount;

  const filteredSubmissions = submissionsList.filter((s) => {
    if (
      submissionFilterStatus === "graded" &&
      (s.grade === undefined || s.grade === null)
    )
      return false;
    if (
      submissionFilterStatus === "ungraded" &&
      s.grade !== undefined &&
      s.grade !== null
    )
      return false;

    if (!searchSubmissionQuery.trim()) return true;
    const q = searchSubmissionQuery.toLowerCase();
    return (
      s.studentName.toLowerCase().includes(q) ||
      (s.studentClass || "").toLowerCase().includes(q)
    );
  });

  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    if (submissionSort === "name") {
      return a.studentName.localeCompare(b.studentName);
    }
    if (submissionSort === "highest") {
      const scoreA = a.grade ?? -1;
      const scoreB = b.grade ?? -1;
      return scoreB - scoreA;
    }
    if (submissionSort === "lowest") {
      const scoreA = a.grade ?? 999;
      const scoreB = b.grade ?? 999;
      return scoreA - scoreB;
    }
    if (submissionSort === "oldest") {
      return (
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      );
    }
    return (
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  });

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-start text-[#2C2B30] font-sans select-none relative py-4 md:py-8 overflow-x-hidden">
      {/* Decorative Blur Bubbles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 md:w-96 md:h-96 bg-[#E9E4FF] rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 md:w-96 md:h-96 bg-[#FFF9E6] rounded-full filter blur-3xl opacity-40"></div>
      </div>

      {/* Main Responsive Desktop & Mobile Container */}
      <div className="w-full min-w-0 max-w-107.5 md:max-w-5xl lg:max-w-6xl xl:max-w-7xl min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)] my-auto flex flex-col justify-between px-4 sm:px-6 md:px-8 py-4 md:py-6 z-10 transition-all duration-300">
        {/* ==================== VIEW 1: ANNOUNCEMENTS MANAGEMENT ==================== */}
        {!selectedForSubmissions ? (
          <div className="w-full flex-1 flex flex-col">
            {/* Header */}
            <div className="w-full flex items-center justify-between gap-3 pb-4 mb-4 border-b border-[#F0EDFF]/80">
              <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                <button
                  onClick={() => goBack("/admin")}
                  className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-2xl flex items-center justify-center shadow-xs border border-[#F0EDFF] text-[#8C66FF] active:scale-95 hover:bg-[#FAF9FF] transition-all shrink-0 cursor-pointer"
                  title="Kembali ke Panel Admin"
                >
                  <FiArrowLeft size={20} />
                </button>
                <div className="min-w-0">
                  <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#9C98A6] font-bold truncate">
                    Panel Guru & Administrator
                  </p>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#2C2B30] leading-tight mt-0.5 truncate">
                    Kelola Ruang Diskusi
                  </h1>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => fetchAnnouncements(true)}
                  disabled={loadingList}
                  className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-[#F0EDFF] text-[#8C66FF] shadow-xs active:scale-95 hover:bg-[#FAF9FF] transition-all cursor-pointer shrink-0"
                  title="Segarkan Data Topik"
                >
                  <FiRefreshCw
                    size={16}
                    className={loadingList ? "animate-spin" : ""}
                  />
                </button>
                <button
                  onClick={handleOpenCreateForm}
                  className="px-3.5 md:px-5 py-2.5 bg-[#8C66FF] hover:bg-[#7b55f0] text-white text-xs md:text-sm font-black rounded-2xl flex items-center gap-2 shadow-md shadow-purple-200 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <FiPlus size={16} className="shrink-0" />
                  <span className="hidden sm:inline">Buat Topik Baru</span>
                  <span className="sm:hidden">Buat</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="w-full flex items-center gap-3 mb-5">
              <div className="flex-1 relative">
                <FiSearch
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9C98A6]"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Cari judul topik diskusi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#F0EDFF] rounded-2xl text-xs md:text-sm font-semibold text-[#2C2B30] placeholder:text-[#9C98A6] focus:outline-none focus:border-[#8C66FF] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all"
                />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-3.5 py-3 bg-white hover:bg-neutral-50 text-[#9C98A6] text-xs font-bold rounded-2xl border border-[#F0EDFF] shadow-xs cursor-pointer transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Announcements Desktop Grid / Mobile List */}
            <div className="flex-1 pb-8">
              {loadingList ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3">
                  <div className="w-9 h-9 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-[#9C98A6] font-black uppercase tracking-wider animate-pulse">
                    Memuat data topik diskusi...
                  </p>
                </div>
              ) : filteredAnnouncements.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl p-8 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(0,0,0,0.02)] max-w-lg mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#F0ECFF] text-[#8C66FF] rounded-3xl flex items-center justify-center text-3xl">
                    <LuMessageSquare />
                  </div>
                  <h3 className="text-base font-extrabold text-[#2C2B30]">
                    {searchQuery
                      ? "Topik Tidak Ditemukan"
                      : "Belum Ada Topik Diskusi"}
                  </h3>
                  <p className="text-xs md:text-sm text-[#9C98A6] mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">
                    {searchQuery
                      ? `Tidak ditemukan topik dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                      : "Mulai buat topik diskusi atau tugas analisis baru untuk siswa Anda."}
                  </p>
                  <button
                    onClick={
                      searchQuery
                        ? () => setSearchQuery("")
                        : handleOpenCreateForm
                    }
                    className="px-5 py-3 bg-[#8C66FF] hover:bg-[#7b55f0] text-white text-xs md:text-sm font-bold rounded-2xl shadow-md shadow-purple-100 cursor-pointer active:scale-95 transition-all"
                  >
                    {searchQuery ? "Hapus Pencarian" : "+ Buat Topik Sekarang"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredAnnouncements.map((ann) => (
                    <div
                      key={ann.id}
                      className="bg-white rounded-3xl p-5 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(140,102,255,0.05)] hover:border-[#8C66FF]/50 hover:shadow-[0_8px_24px_rgba(140,102,255,0.1)] transition-all duration-200 flex flex-col justify-between gap-4 group"
                    >
                      <div className="flex flex-col gap-3">
                        {/* Top Row: Title, Date, Actions */}
                        <div className="flex justify-between items-start gap-2 min-w-0">
                          <div className="flex-1 min-w-0">
                            <h2 className="text-sm md:text-base font-black text-[#2C2B30] leading-snug line-clamp-2 group-hover:text-[#8C66FF] transition-colors break-words">
                              {ann.title}
                            </h2>
                            {/* <p className="text-[11px] text-[#9C98A6] font-semibold mt-1 flex items-center gap-1.5 min-w-0">
                              <FiCalendar size={12} className="shrink-0" />
                              <span className="truncate">
                                {formatDateIndo(ann.createdAt)}
                              </span>
                            </p> */}
                          </div>

                          {/* Edit / Delete Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleOpenEditForm(ann)}
                              className="w-8 h-8 rounded-xl bg-[#FAF9FF] border border-[#F0EDFF] text-[#8C66FF] flex items-center justify-center hover:bg-[#F0ECFF] active:scale-95 transition-all cursor-pointer"
                              title="Edit Topik Diskusi"
                            >
                              <FiEdit2 size={13} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteAnnouncement(ann.id, ann.title)
                              }
                              className="w-8 h-8 rounded-xl bg-[#FFF1F2] border border-[#FFE4E6] text-[#E11D48] flex items-center justify-center hover:bg-[#FFE4E6] active:scale-95 transition-all cursor-pointer"
                              title="Hapus Topik Diskusi"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Banner Preview (placeholder when no image) */}
                        <div
                          onClick={() => {
                            if (ann.hasImage)
                              setZoomImageUrl(
                                `${API_URL}/api/announcements/${ann.id}/image`,
                              );
                          }}
                          className={`w-full h-36 rounded-2xl overflow-hidden border border-[#F0EDFF] relative group/img ${
                            ann.hasImage ? "cursor-pointer" : "cursor-default"
                          }`}
                        >
                          <img
                            src={
                              ann.hasImage
                                ? `${API_URL}/api/announcements/${ann.id}/image`
                                : PLACEHOLDER_IMAGE_URL
                            }
                            alt={ann.title}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                          />
                          {ann.hasImage && (
                            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold">
                              Klik untuk memperbesar
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: Action Buttons */}
                      <div className="flex flex-col gap-3 pt-2 border-t border-[#F0EDFF]/70">
                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleOpenSubmissions(ann)}
                            className="py-2.5 px-2 md:px-3 bg-[#8C66FF] hover:bg-[#7b55f0] text-white text-[11px] md:text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer min-w-0 whitespace-nowrap overflow-hidden"
                          >
                            <LuAward size={15} className="shrink-0" />
                            <span className="truncate">
                              Nilai ({ann.submissionsCount || 0})
                            </span>
                          </button>

                          <button
                            onClick={() => handleOpenRanking(ann)}
                            className="py-2.5 px-2 md:px-3 bg-[#FFF9E6] border border-[#FDE68A] text-[#D97706] hover:bg-[#FEF3C7] text-[11px] md:text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer min-w-0 whitespace-nowrap overflow-hidden"
                          >
                            <LuTrophy size={15} className="shrink-0" />
                            <span className="truncate">Ranking</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ==================== VIEW 2: SUBMISSIONS & GRADING (DESKTOP TABLE) ==================== */
          <div className="w-full flex-1 flex flex-col">
            {/* Header for Submissions View */}
            <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between pb-4 mb-4 border-b border-[#F0EDFF]/80 gap-3">
              <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                <button
                  onClick={() => setSelectedForSubmissions(null)}
                  className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-2xl flex items-center justify-center shadow-xs border border-[#F0EDFF] text-[#8C66FF] active:scale-95 hover:bg-[#FAF9FF] transition-all shrink-0 cursor-pointer"
                  title="Kembali ke Daftar Topik Diskusi"
                >
                  <FiArrowLeft size={20} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#9C98A6] font-bold truncate">
                    Penilaian Pengumpulan Tugas Siswa
                  </p>
                  <h2 className="text-base md:text-xl font-black text-[#2C2B30] truncate mt-0.5">
                    {selectedForSubmissions.title}
                  </h2>
                </div>
              </div>

              {/* Toggle Soal & Action */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  onClick={() => setShowTopicDetails(!showTopicDetails)}
                  className="px-3.5 py-2 bg-white hover:bg-[#FAF9FF] border border-[#F0EDFF] text-[#8C66FF] text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  <LuBookOpen size={14} />
                  <span>
                    {showTopicDetails ? "Tutup Detail Soal" : "Lihat Soal"}
                  </span>
                  {showTopicDetails ? (
                    <FiChevronUp size={14} />
                  ) : (
                    <FiChevronDown size={14} />
                  )}
                </button>

                <button
                  onClick={() =>
                    handleOpenSubmissions(selectedForSubmissions, true)
                  }
                  disabled={loadingSubmissions}
                  className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-[#F0EDFF] text-[#8C66FF] shadow-xs active:scale-95 hover:bg-[#FAF9FF] transition-all cursor-pointer"
                  title="Refresh Pengumpulan"
                >
                  <FiRefreshCw
                    size={14}
                    className={loadingSubmissions ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>

            {/* Collapsible Topic Details Preview */}
            {showTopicDetails && (
              <div className="w-full bg-white rounded-3xl p-5 md:p-6 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(0,0,0,0.02)] mb-5 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0EDFF]">
                  <h3 className="text-xs md:text-sm font-black text-[#2C2B30] flex items-center gap-2">
                    <LuBookOpen className="text-[#8C66FF]" />
                    <span>Soal & Kasus Diskusi</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {selectedForSubmissions.problem && (
                    <div className="bg-[#FAF9FF] p-3.5 rounded-2xl border border-[#F0EDFF]">
                      <span className="font-black text-[#8C66FF] block mb-1">
                        📌 Soal / Permasalahan:
                      </span>
                      <p className="text-[#524F5D] leading-relaxed whitespace-pre-line">
                        {selectedForSubmissions.problem}
                      </p>
                    </div>
                  )}

                  {selectedForSubmissions.question && (
                    <div className="bg-[#FAF9FF] p-3.5 rounded-2xl border border-[#F0EDFF]">
                      <span className="font-black text-[#8C66FF] block mb-1">
                        ❓ Pertanyaan Analisis:
                      </span>
                      <p className="text-[#524F5D] leading-relaxed whitespace-pre-line">
                        {selectedForSubmissions.question}
                      </p>
                    </div>
                  )}

                  {selectedForSubmissions.taskInfo && (
                    <div className="bg-[#FAF9FF] p-3.5 rounded-2xl border border-[#F0EDFF]">
                      <span className="font-black text-[#8C66FF] block mb-1">
                        📋 Info & Batas Waktu Tugas:
                      </span>
                      <p className="text-[#524F5D] leading-relaxed">
                        {selectedForSubmissions.taskInfo}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Filter and Search Bar for Submissions */}
            <div className="w-full flex flex-col md:flex-row md:items-center gap-3 mb-5">
              {/* Search Bar */}
              <div className="w-full md:flex-1 relative min-w-0">
                <FiSearch
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C98A6]"
                  size={15}
                />
                <input
                  type="text"
                  placeholder="Cari nama atau kelas siswa..."
                  value={searchSubmissionQuery}
                  onChange={(e) => setSearchSubmissionQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#F0EDFF] rounded-2xl text-xs md:text-sm font-semibold text-[#2C2B30] placeholder:text-[#9C98A6] focus:outline-none focus:border-[#8C66FF] shadow-xs"
                />
              </div>

              {/* Status Tabs & Sort Controls */}
              <div className="w-full md:w-auto flex items-center gap-2.5 flex-wrap">
                {/* Status Segmented Buttons */}
                <div className="flex items-center bg-white p-1 rounded-2xl border border-[#F0EDFF] shadow-xs max-w-full overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setSubmissionFilterStatus("all")}
                    className={`px-2.5 md:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      submissionFilterStatus === "all"
                        ? "bg-[#8C66FF] text-white shadow-xs"
                        : "text-[#9C98A6] hover:text-[#2C2B30]"
                    }`}
                  >
                    Semua ({submissionsList.length})
                  </button>
                  <button
                    onClick={() => setSubmissionFilterStatus("ungraded")}
                    className={`px-2.5 md:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      submissionFilterStatus === "ungraded"
                        ? "bg-[#D97706] text-white shadow-xs"
                        : "text-[#9C98A6] hover:text-[#2C2B30]"
                    }`}
                  >
                    <span className="md:hidden">Belum</span>
                    <span className="hidden md:inline">Belum Dinilai</span>
                    {" "}
                    ({ungradedCount})
                  </button>
                  <button
                    onClick={() => setSubmissionFilterStatus("graded")}
                    className={`px-2.5 md:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      submissionFilterStatus === "graded"
                        ? "bg-[#10B981] text-white shadow-xs"
                        : "text-[#9C98A6] hover:text-[#2C2B30]"
                    }`}
                  >
                    <span className="md:hidden">Sudah</span>
                    <span className="hidden md:inline">Sudah Dinilai</span>
                    {" "}
                    ({gradedCount})
                  </button>
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-2xl border border-[#F0EDFF] shadow-xs shrink-0">
                  <FiSliders size={13} className="text-[#9C98A6] shrink-0" />
                  <select
                    value={submissionSort}
                    onChange={(e: any) => setSubmissionSort(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[#2C2B30] focus:outline-none cursor-pointer max-w-[150px]"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="oldest">Terlama</option>
                    <option value="highest">Nilai Tertinggi</option>
                    <option value="lowest">Nilai Terendah</option>
                    <option value="name">Nama (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submissions Content: Responsive Desktop Table & Mobile Cards */}
            <div className="flex-1 pb-8">
              {loadingSubmissions ? (
                <div className="py-24 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-[#9C98A6] font-bold">
                    Memuat data tugas siswa...
                  </p>
                </div>
              ) : sortedSubmissions.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl p-8 border border-[#F0EDFF] max-w-md mx-auto">
                  <div className="w-14 h-14 mx-auto mb-3 bg-[#FAF9FF] text-[#9C98A6] rounded-2xl flex items-center justify-center text-2xl">
                    <FiFileText />
                  </div>
                  <h4 className="text-sm font-bold text-[#2C2B30]">
                    Tidak Ada Tugas Ditemukan
                  </h4>
                  <p className="text-xs text-[#9C98A6] mt-1">
                    {searchSubmissionQuery || submissionFilterStatus !== "all"
                      ? "Tidak ada tugas siswa yang sesuai dengan filter atau kata kunci pencarian Anda."
                      : "Belum ada siswa yang mengumpulkan tugas untuk topik diskusi ini."}
                  </p>
                  {(searchSubmissionQuery ||
                    submissionFilterStatus !== "all") && (
                    <button
                      onClick={() => {
                        setSearchSubmissionQuery("");
                        setSubmissionFilterStatus("all");
                      }}
                      className="mt-4 px-4 py-2 bg-[#FAF9FF] text-[#8C66FF] hover:bg-[#F0ECFF] text-xs font-bold rounded-xl border border-[#F0EDFF] transition-colors cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* ================= DESKTOP DISPLAY: RICH DATA TABLE ================= */}
                  <div className="hidden md:block overflow-hidden border border-[#F0EDFF] rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] text-left text-xs md:text-sm border-collapse">
                        <thead>
                          <tr className="bg-[#FAF9FF] text-[#2C2B30] border-b border-[#F0EDFF] uppercase font-black text-[10px] md:text-[11px] tracking-wider">
                            <th className="p-4 border-r border-[#F0EDFF]/50 whitespace-nowrap">
                              Siswa & Kelas
                            </th>
                            <th className="p-4 border-r border-[#F0EDFF]/50 text-center whitespace-nowrap">
                              Waktu Kirim
                            </th>
                            <th className="p-4 border-r border-[#F0EDFF]/50 min-w-[280px]">
                              Jawaban Siswa
                            </th>
                            <th className="p-4 border-r border-[#F0EDFF]/50 text-center whitespace-nowrap">
                              Lampiran
                            </th>
                            <th className="p-4 border-r border-[#F0EDFF]/50 text-center whitespace-nowrap">
                              Nilai
                            </th>
                            <th className="p-4 text-center whitespace-nowrap">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedSubmissions.map((sub, sIdx) => {
                            const isGraded =
                              sub.grade !== undefined && sub.grade !== null;
                            const initials = (sub.studentName || "S")
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase();

                            return (
                              <tr
                                key={sub.id}
                                className={`border-b border-[#F0EDFF]/60 transition-colors hover:bg-[#F9F7FF] ${
                                  sIdx % 2 === 1
                                    ? "bg-[#FAF9FF]/40"
                                    : "bg-white"
                                }`}
                              >
                                {/* Student info */}
                                <td className="p-4 border-r border-[#F0EDFF]/40 min-w-[160px] max-w-[220px]">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-2xl bg-[#EDE9FE] text-[#8C66FF] font-black text-xs flex items-center justify-center shrink-0 border border-[#DDD6FE]/60 shadow-2xs">
                                      {initials}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-extrabold text-[#2C2B30] text-xs md:text-sm truncate">
                                        {sub.studentName}
                                      </p>
                                      <p className="text-[11px] text-[#9C98A6] font-semibold mt-0.5 truncate">
                                        Kelas {sub.studentClass}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* Submitted at */}
                                <td className="p-4 text-center border-r border-[#F0EDFF]/40 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#524F5D] bg-[#FAF9FF] px-2.5 py-1 rounded-xl border border-[#F0EDFF]">
                                    <FiClock size={11} className="text-[#9C98A6]" />
                                    <span>{formatDateIndo(sub.submittedAt)}</span>
                                  </span>
                                </td>

                                {/* Answer Snippet & View Modal trigger */}
                                <td className="p-4 border-r border-[#F0EDFF]/40">
                                  <div className="flex flex-col gap-1">
                                    <p className="text-xs text-[#524F5D] line-clamp-2 leading-relaxed font-medium break-words">
                                      {sub.answer}
                                    </p>
                                    <button
                                      onClick={() => setViewingAnswerSub(sub)}
                                      className="text-[11px] font-bold text-[#8C66FF] hover:underline self-start flex items-center gap-1 mt-0.5 cursor-pointer"
                                    >
                                      <FiEye size={12} />
                                      <span>Buka Jawaban Lengkap</span>
                                    </button>
                                  </div>
                                </td>

                                {/* Attachment */}
                                <td className="p-4 text-center border-r border-[#F0EDFF]/40">
                                  {sub.hasImage ? (
                                    <button
                                      onClick={() =>
                                        setZoomImageUrl(
                                          `${API_URL}/api/announcements/submissions/${sub.id}/image`,
                                        )
                                      }
                                      className="group/img relative inline-block w-12 h-12 rounded-xl overflow-hidden border border-[#E9E6F5] cursor-pointer hover:border-[#8C66FF] transition-all"
                                      title="Klik untuk melihat foto lampiran"
                                    >
                                      <img
                                        src={`${API_URL}/api/announcements/submissions/${sub.id}/image`}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover group-hover/img:scale-110 transition-transform"
                                      />
                                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                                        <FiEye size={14} />
                                      </div>
                                    </button>
                                  ) : (
                                    <span className="text-xs text-[#9C98A6] font-semibold">
                                      -
                                    </span>
                                  )}
                                </td>

                                {/* Grade & Status */}
                                <td className="p-4 text-center border-r border-[#F0EDFF]/40 whitespace-nowrap">
                                  {isGraded ? (
                                    <span className="text-xs md:text-sm font-black text-[#10B981] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 rounded-full shadow-2xs">
                                      {sub.grade}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-extrabold text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-1 rounded-full">
                                      Belum Dinilai
                                    </span>
                                  )}
                                </td>

                                {/* Action Button */}
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() => handleOpenGradingModal(sub)}
                                    className={`px-3.5 py-2 text-xs font-black rounded-xl inline-flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer ${
                                      isGraded
                                        ? "bg-[#FAF9FF] border border-[#8C66FF]/30 text-[#8C66FF] hover:bg-[#F0ECFF]"
                                        : "bg-[#8C66FF] hover:bg-[#7b55f0] text-white shadow-purple-200"
                                    }`}
                                  >
                                    <LuAward size={14} />
                                    <span>
                                      {isGraded ? "Ubah Nilai" : "Beri Nilai"}
                                    </span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ================= MOBILE DISPLAY: RESPONSIVE CARDS ================= */}
                  <div className="block md:hidden space-y-3.5">
                    {sortedSubmissions.map((sub) => {
                      const isGraded =
                        sub.grade !== undefined && sub.grade !== null;

                      return (
                        <div
                          key={sub.id}
                          className="w-full bg-white rounded-3xl p-4.5 border border-[#F0EDFF] shadow-xs flex flex-col gap-3"
                        >
                          {/* Student Info & Grade Badge */}
                          <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-black text-[#2C2B30] truncate">
                                {sub.studentName}
                              </h3>
                              <p className="text-[11px] text-[#9C98A6] font-semibold mt-0.5 truncate">
                                Kelas {sub.studentClass} •{" "}
                                {formatDateIndo(sub.submittedAt)}
                              </p>
                            </div>

                            {isGraded ? (
                              <span className="text-xs font-black text-[#10B981] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 rounded-full shrink-0 whitespace-nowrap">
                                Nilai: {sub.grade}
                              </span>
                            ) : (
                              <span className="text-[10px] font-extrabold text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
                                Belum Dinilai
                              </span>
                            )}
                          </div>

                          {/* Answer Snippet */}
                          <div className="text-xs text-[#524F5D] line-clamp-3 bg-[#FAF9FF] p-3 rounded-2xl border border-[#F0EDFF]/80 leading-relaxed whitespace-pre-line font-medium break-words overflow-hidden">
                            {sub.answer}
                          </div>

                          {/* Attachment indicator if image exists */}
                          {sub.hasImage && (
                            <div
                              onClick={() =>
                                setZoomImageUrl(
                                  `${API_URL}/api/announcements/submissions/${sub.id}/image`,
                                )
                              }
                              className="flex items-center gap-1.5 text-xs font-bold text-[#8C66FF] cursor-pointer hover:underline"
                            >
                              <FiImage size={14} />
                              <span>Lihat Foto Lampiran Siswa</span>
                            </div>
                          )}

                          {/* Grade Button */}
                          <button
                            onClick={() => handleOpenGradingModal(sub)}
                            className={`w-full py-2.5 text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer ${
                              isGraded
                                ? "bg-[#FAF9FF] border border-[#8C66FF]/30 text-[#8C66FF] hover:bg-[#F0ECFF]"
                                : "bg-[#8C66FF] text-white hover:bg-[#7B55F0]"
                            }`}
                          >
                            <LuAward size={15} />
                            <span>
                              {isGraded
                                ? "Edit Nilai & Catatan"
                                : "Beri Nilai Siswa"}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==================== FULLSCREEN: CREATE / EDIT ANNOUNCEMENT ==================== */}
      {isFormOpen && (
        <AnnouncementForm
          initialData={editingAnnouncement}
          onSave={handleSaveAnnouncement}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingAnnouncement(null);
          }}
        />
      )}

      {/* ==================== MODAL: GRADING SUBMISSION (DESKTOP 2-COLUMN) ==================== */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg md:max-w-3xl lg:max-w-4xl bg-white rounded-3xl p-5 md:p-6 border border-[#F0EDFF] shadow-2xl flex flex-col max-h-[90vh] animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start md:items-center gap-3 pb-3 border-b border-[#F0EDFF] shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm md:text-base font-black text-[#2C2B30]">
                    Penilaian Tugas Siswa
                  </h3>
                  <span className="px-2 py-0.5 bg-[#F0ECFF] text-[#8C66FF] rounded-full text-[10px] font-bold shrink-0 whitespace-nowrap">
                    Kelas {gradingSubmission.studentClass}
                  </span>
                </div>
                <p className="text-xs text-[#9C98A6] font-semibold mt-0.5 truncate">
                  <strong className="text-[#2C2B30]">
                    {gradingSubmission.studentName}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setGradingSubmission(null)}
                className="w-8 h-8 rounded-full bg-[#FAF9FF] text-[#9C98A6] flex items-center justify-center hover:text-[#2C2B30] hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
              >
                <FiX size={17} />
              </button>
            </div>

            {/* Modal Body: Responsive 2 Columns on Desktop */}
            <div className="flex-1 min-h-0 overflow-y-auto py-4 pr-1 no-scrollbar grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: Student Answer & Image */}
              <div className="md:col-span-7 flex flex-col gap-3.5">
                <div>
                  <label className="text-xs font-black text-[#524F5D] block mb-1.5">
                    Jawaban Tugas Siswa:
                  </label>
                  <div className="p-4 bg-[#FAF9FF] border border-[#E9E6F5] rounded-2xl text-xs md:text-sm font-medium text-[#2C2B30] leading-relaxed whitespace-pre-line max-h-64 md:max-h-80 overflow-y-auto">
                    {gradingSubmission.answer}
                  </div>
                </div>

                {/* Attachment Preview if any */}
                {gradingSubmission.hasImage && (
                  <div>
                    <label className="text-xs font-black text-[#524F5D] block mb-1.5">
                      Lampiran Foto Siswa:
                    </label>
                    <div
                      onClick={() =>
                        setZoomImageUrl(
                          `${API_URL}/api/announcements/submissions/${gradingSubmission.id}/image`,
                        )
                      }
                      className="w-full h-44 bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0] relative cursor-pointer group"
                    >
                      <img
                        src={`${API_URL}/api/announcements/submissions/${gradingSubmission.id}/image`}
                        alt="Lampiran"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <FiEye size={15} />
                        <span>Klik untuk memperbesar gambar</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Teacher Score & Feedback Inputs */}
              <div className="md:col-span-5 flex flex-col justify-between gap-4 md:border-l md:border-[#F0EDFF] md:pl-5">
                <div className="space-y-4">
                  {/* Nilai Input (0 - 100) */}
                  <div>
                    <label className="font-extrabold uppercase text-[#524F5D] tracking-wider text-[11px] block mb-1.5">
                      Nilai Tugas (Skala 0 - 100) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Contoh: 85"
                      value={gradeScore}
                      onChange={(e) => setGradeScore(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAF9FF] border border-[#E9E6F5] rounded-2xl font-black text-lg text-[#8C66FF] focus:outline-none focus:border-[#8C66FF] focus:bg-white transition-colors"
                    />

                    {/* Quick Score Chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[60, 70, 75, 80, 85, 90, 95, 100].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setGradeScore(String(score))}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                            gradeScore === String(score)
                              ? "bg-[#8C66FF] text-white border-[#8C66FF]"
                              : "bg-[#FAF9FF] text-[#524F5D] border-[#E9E6F5] hover:bg-[#F0ECFF]"
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Textarea */}
                  <div>
                    <label className="font-extrabold uppercase text-[#524F5D] tracking-wider text-[11px] block mb-1.5">
                      Catatan & Masukan Guru (Opsional)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Tuliskan apresiasi, saran, atau perbaikan untuk pemahaman siswa..."
                      value={gradeFeedback}
                      onChange={(e) => setGradeFeedback(e.target.value)}
                      className="w-full p-3.5 bg-[#FAF9FF] border border-[#E9E6F5] rounded-2xl font-medium text-xs text-[#2C2B30] focus:outline-none focus:border-[#8C66FF] focus:bg-white transition-colors leading-relaxed"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-[#F0EDFF] flex gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setGradingSubmission(null)}
                    className="flex-1 py-3 bg-[#FAF9FF] hover:bg-neutral-100 text-[#9C98A6] hover:text-[#2C2B30] font-bold text-xs rounded-2xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveGrade}
                    disabled={savingGrade}
                    className="flex-1 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-100 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 min-w-0 whitespace-nowrap overflow-hidden"
                  >
                    <FiCheckCircle size={15} className="shrink-0" />
                    <span className="truncate">
                      {savingGrade ? "Menyimpan..." : "Simpan Penilaian"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: PREVIEW COMPLETE ANSWER ==================== */}
      {viewingAnswerSub && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg md:max-w-2xl bg-white rounded-3xl p-5 md:p-6 border border-[#F0EDFF] shadow-2xl flex flex-col max-h-[85vh] animate-fade-in overflow-hidden">
            <div className="flex justify-between items-start gap-3 pb-3 border-b border-[#F0EDFF] shrink-0">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm md:text-base font-black text-[#2C2B30] truncate">
                  Jawaban Tugas: {viewingAnswerSub.studentName}
                </h3>
                <p className="text-xs text-[#9C98A6] font-semibold mt-0.5 truncate">
                  Kelas {viewingAnswerSub.studentClass} •{" "}
                  {formatDateIndo(viewingAnswerSub.submittedAt)}
                </p>
              </div>
              <button
                onClick={() => setViewingAnswerSub(null)}
                className="w-8 h-8 rounded-full bg-[#FAF9FF] text-[#9C98A6] flex items-center justify-center hover:text-[#2C2B30] cursor-pointer shrink-0"
              >
                <FiX size={17} />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto py-4 space-y-4 no-scrollbar">
              <div className="p-4 bg-[#FAF9FF] border border-[#E9E6F5] rounded-2xl text-xs md:text-sm font-medium text-[#2C2B30] leading-relaxed whitespace-pre-line">
                {viewingAnswerSub.answer}
              </div>

              {viewingAnswerSub.hasImage && (
                <div>
                  <p className="text-xs font-black text-[#524F5D] mb-1.5">
                    Lampiran Foto:
                  </p>
                  <div
                    onClick={() =>
                      setZoomImageUrl(
                        `${API_URL}/api/announcements/submissions/${viewingAnswerSub.id}/image`,
                      )
                    }
                    className="w-full h-52 bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0] relative cursor-pointer group"
                  >
                    <img
                      src={`${API_URL}/api/announcements/submissions/${viewingAnswerSub.id}/image`}
                      alt="Lampiran"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                      <FiEye size={15} />
                      <span>Klik untuk memperbesar</span>
                    </div>
                  </div>
                </div>
              )}

              {viewingAnswerSub.feedback && (
                <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl text-xs text-[#065F46]">
                  <strong className="block mb-0.5">Catatan Guru:</strong>
                  <p className="italic">"{viewingAnswerSub.feedback}"</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#F0EDFF] flex gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewingAnswerSub(null)}
                className="flex-1 py-2.5 bg-[#FAF9FF] text-[#9C98A6] hover:text-[#2C2B30] font-bold text-xs rounded-2xl cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const subToGrade = viewingAnswerSub;
                  setViewingAnswerSub(null);
                  handleOpenGradingModal(subToGrade);
                }}
                className="flex-1 py-2.5 bg-[#8C66FF] hover:bg-[#7b55f0] text-white font-black text-xs rounded-2xl shadow-md shadow-purple-200 cursor-pointer flex items-center justify-center gap-1.5 min-w-0 whitespace-nowrap overflow-hidden"
              >
                <LuAward size={15} className="shrink-0" />
                <span className="truncate">
                  {viewingAnswerSub.grade !== undefined &&
                  viewingAnswerSub.grade !== null
                    ? "Edit Nilai Tugas"
                    : "Beri Nilai Siswa"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: RANKING KEAKTIFAN DISKUSI (> 4 WORDS FILTER) ==================== */}
      {rankingAnnouncement && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl bg-white rounded-3xl p-5 md:p-6 border border-[#F0EDFF] shadow-2xl flex flex-col gap-4 max-h-[90vh] animate-fade-in overflow-hidden">
            <div className="flex justify-between items-start gap-3 pb-3 border-b border-[#F0EDFF] shrink-0">
              <div className="flex items-center gap-3 text-[#D97706] min-w-0 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF9E6] flex items-center justify-center text-xl font-black shrink-0">
                  <LuTrophy />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm md:text-base font-black text-[#2C2B30] truncate">
                    Ranking Siswa Paling Aktif
                  </h3>
                  <p className="text-[11px] text-[#9C98A6] font-semibold mt-0.5 truncate">
                    {rankingAnnouncement.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRankingAnnouncement(null)}
                className="w-8 h-8 rounded-full bg-[#FAF9FF] text-[#9C98A6] flex items-center justify-center hover:text-[#2C2B30] cursor-pointer shrink-0"
              >
                <FiX size={17} />
              </button>
            </div>

            {/* Ranking Content */}
            <div className="flex-1 min-h-0 max-h-80 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
              {loadingRanking ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <div className="w-7 h-7 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-[#9C98A6] font-bold">
                    Menghitung keaktifan siswa...
                  </p>
                </div>
              ) : rankedStudents.length === 0 ? (
                <div className="py-12 text-center text-xs md:text-sm text-[#9C98A6]">
                  Belum ada komentar siswa yang memenuhi kriteria keaktifan (&gt; 4 kata).
                </div>
              ) : (
                rankedStudents.map((item, index) => {
                  let badgeColor = "bg-[#F3F4F6] text-[#4B5563]";
                  let rankIcon = `#${index + 1}`;
                  if (index === 0) {
                    badgeColor = "bg-[#FEF3C7] text-[#D97706] font-black border border-[#FDE68A]";
                    rankIcon = "🥇 1";
                  } else if (index === 1) {
                    badgeColor = "bg-[#F1F5F9] text-[#64748B] font-black border border-[#CBD5E1]";
                    rankIcon = "🥈 2";
                  } else if (index === 2) {
                    badgeColor = "bg-[#FFEDD5] text-[#C2410C] font-black border border-[#FED7AA]";
                    rankIcon = "🥉 3";
                  }

                  return (
                    <div
                      key={item.userId}
                      className="w-full bg-[#FAF9FF] p-3.5 rounded-2xl border border-[#F0EDFF] flex items-center justify-between gap-3 hover:bg-[#F3EFFF] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span
                          className={`w-10 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${badgeColor}`}
                        >
                          {rankIcon}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-black text-[#2C2B30] truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] md:text-[11px] text-[#9C98A6] font-semibold truncate">
                            Kelas {item.studentClass}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs md:text-sm font-black text-[#8C66FF] shrink-0 whitespace-nowrap">
                        {item.validCommentsCount} argumen
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setRankingAnnouncement(null)}
              className="w-full py-3 bg-[#8C66FF] hover:bg-[#7b55f0] text-white font-extrabold text-xs md:text-sm rounded-2xl transition-colors cursor-pointer shrink-0"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Zoom Image Modal */}
      {zoomImageUrl && (
        <div
          onClick={() => setZoomImageUrl(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer animate-fade-in"
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={zoomImageUrl}
              alt="Lampiran Full"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setZoomImageUrl(null)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
