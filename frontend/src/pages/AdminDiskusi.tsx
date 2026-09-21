import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useAppBack } from "../hooks/useAppBack";
import { useCustomDialog } from "../components/CustomDialog";
import {
  FiArrowLeft,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiImage,
  FiCalendar,
  FiRefreshCw,
} from "react-icons/fi";
import {
  LuMessageSquare,
  LuFileText,
  LuTrophy,
  LuAward,
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

interface RankedStudent {
  userId: number;
  name: string;
  studentClass: string;
  validCommentsCount: number;
  totalCommentsCount: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

export default function AdminDiskusi() {
  const navigate = useNavigate();
  const goBack = useAppBack();
  const { user, token } = useAuthStore();
  const { showAlert, showConfirm } = useCustomDialog();

  // Announcements List
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Create / Edit Announcement Modal
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>("");
  const [formProblem, setFormProblem] = useState<string>("");
  const [formQuestion, setFormQuestion] = useState<string>("");
  const [formTaskInfo, setFormTaskInfo] = useState<string>("");
  const [formInstruction, setFormInstruction] = useState<string>("");
  const [submittingForm, setSubmittingForm] = useState<boolean>(false);

  // Submissions Grading View
  const [selectedForSubmissions, setSelectedForSubmissions] = useState<AnnouncementItem | null>(null);
  const [submissionsList, setSubmissionsList] = useState<SubmissionItem[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(false);
  const [searchSubmissionQuery, setSearchSubmissionQuery] = useState<string>("");
  const [submissionFilterStatus, setSubmissionFilterStatus] = useState<"all" | "graded" | "ungraded">("all");

  // Single Submission Grading Modal
  const [gradingSubmission, setGradingSubmission] = useState<SubmissionItem | null>(null);
  const [gradeScore, setGradeScore] = useState<string>("");
  const [gradeFeedback, setGradeFeedback] = useState<string>("");
  const [savingGrade, setSavingGrade] = useState<boolean>(false);

  // Ranking Modal
  const [rankingAnnouncement, setRankingAnnouncement] = useState<AnnouncementItem | null>(null);
  const [rankingMessages, setRankingMessages] = useState<DiscussionMessage[]>([]);
  const [loadingRanking, setLoadingRanking] = useState<boolean>(false);

  // Zoom Image
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const isAdmin =
      user.status?.toLowerCase() === "admin" ||
      user.email?.toLowerCase().includes("admin");
    if (!isAdmin) {
      navigate("/menu");
    }
  }, [user, navigate]);

  const fetchAnnouncements = useCallback(async (force = false) => {
    if (!token) return;
    setLoadingList(true);
    try {
      const data = await getAnnouncementsApi(token, force);
      setAnnouncements(data || []);
    } catch (err: any) {
      console.error("Gagal mengambil data pengumuman:", err);
    } finally {
      setLoadingList(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Open Form for Create
  const handleOpenCreateForm = () => {
    setEditingId(null);
    setFormTitle("");
    setFormProblem("");
    setFormQuestion("");
    setFormTaskInfo("");
    setFormInstruction("");
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleOpenEditForm = (ann: AnnouncementItem) => {
    setEditingId(ann.id);
    setFormTitle(ann.title);
    setFormProblem(ann.problem || "");
    setFormQuestion(ann.question || "");
    setFormTaskInfo(ann.taskInfo || "");
    setFormInstruction(ann.instruction || "");
    setIsFormOpen(true);
  };

  // Save (Create or Update) Announcement
  const handleSaveAnnouncement = async () => {
    if (!formTitle.trim()) {
      showAlert("Silakan masukkan judul pengumuman / topik diskusi.", "Judul Kosong");
      return;
    }

    if (!token) return;
    setSubmittingForm(true);

    try {
      const payload = {
        title: formTitle.trim(),
        problem: formProblem.trim(),
        question: formQuestion.trim(),
        taskInfo: formTaskInfo.trim(),
        instruction: formInstruction.trim(),
      };

      if (editingId) {
        await updateAnnouncementApi(token, editingId, payload);
        showAlert("Pengumuman berhasil diubah.", "Berhasil Diperbarui");
      } else {
        await createAnnouncementApi(token, payload);
        showAlert("Pengumuman dan ruang diskusi baru berhasil dibuat.", "Berhasil Dibuat");
      }

      setIsFormOpen(false);
      fetchAnnouncements();
    } catch (err: any) {
      showAlert(err.message || "Terjadi kendala saat menyimpan pengumuman.", "Gagal Menyimpan");
    } finally {
      setSubmittingForm(false);
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
      showAlert("Pengumuman berhasil dihapus.", "Dihapus");
      fetchAnnouncements();
    } catch (err: any) {
      showAlert(err.message || "Gagal menghapus pengumuman.", "Gagal Menghapus");
    }
  };

  // Open Submissions List for an Announcement
  const handleOpenSubmissions = async (ann: AnnouncementItem) => {
    if (!token) return;
    setSelectedForSubmissions(ann);
    setLoadingSubmissions(true);
    try {
      const data = await getAnnouncementSubmissionsApi(token, ann.id);
      setSubmissionsList(data || []);
    } catch (err: any) {
      showAlert(err.message || "Gagal mengambil data pengumpulan tugas.", "Gagal Membuka");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Open Grading Modal
  const handleOpenGradingModal = (sub: SubmissionItem) => {
    setGradingSubmission(sub);
    setGradeScore(sub.grade !== undefined && sub.grade !== null ? String(sub.grade) : "");
    setGradeFeedback(sub.feedback || "");
  };

  // Submit Grade
  const handleSaveGrade = async () => {
    if (!gradingSubmission || !token) return;

    const numScore = Number(gradeScore);
    if (gradeScore === "" || isNaN(numScore) || numScore < 0 || numScore > 100) {
      showAlert("Masukkan nilai angka antara 0 hingga 100.", "Nilai Tidak Valid");
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

      showAlert(`Tugas milik ${gradingSubmission.studentName} berhasil dinilai.`, "Nilai Disimpan");

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
      showAlert(err.message || "Gagal menyimpan penilaian tugas.", "Gagal Menyimpan Nilai");
    } finally {
      setSavingGrade(false);
    }
  };

  // Open Ranking Modal (Filtered on frontend: comments > 4 words)
  const handleOpenRanking = async (ann: AnnouncementItem) => {
    if (!token) return;
    setRankingAnnouncement(ann);
    setLoadingRanking(true);
    try {
      const data = await getAnnouncementDiscussionsApi(token, ann.id);
      setRankingMessages(data || []);
    } catch (err: any) {
      showAlert(err.message || "Gagal memuat pesan diskusi.", "Gagal Membuka Ranking");
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

  const filteredAnnouncements = announcements.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.problem.toLowerCase().includes(q)
    );
  });

  const filteredSubmissions = submissionsList.filter((s) => {
    if (submissionFilterStatus === "graded" && (s.grade === undefined || s.grade === null)) return false;
    if (submissionFilterStatus === "ungraded" && s.grade !== undefined && s.grade !== null) return false;

    if (!searchSubmissionQuery.trim()) return true;
    const q = searchSubmissionQuery.toLowerCase();
    return (
      s.studentName.toLowerCase().includes(q) ||
      (s.studentClass || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      {/* Decorative Blur Bubble */}
      <div className="absolute top-[-10%] right-[-10%] w-50 h-50 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-107.5 min-h-screen flex flex-col justify-between px-6 py-6 z-10">
        
        {/* ==================== VIEW 1: ANNOUNCEMENTS MANAGEMENT ==================== */}
        {!selectedForSubmissions ? (
          <div className="w-full flex-1 flex flex-col">
            {/* Header */}
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-[#F0EDFF]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => goBack("/admin")}
                  className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-xs border border-[#F0EDFF] text-[#8C66FF] active:scale-95 transition-transform shrink-0"
                  title="Kembali ke Panel Admin"
                >
                  <FiArrowLeft size={19} />
                </button>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">
                    Panel Guru & Admin
                  </p>
                  <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight">
                    Kelola Ruang Diskusi
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchAnnouncements(true)}
                  disabled={loadingList}
                  className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-[#F0EDFF] text-[#8C66FF] shadow-xs active:scale-95 transition-transform cursor-pointer"
                  title="Refresh Pengumuman"
                >
                  <FiRefreshCw size={14} className={loadingList ? "animate-spin" : ""} />
                </button>
                <button
                  onClick={handleOpenCreateForm}
                  className="px-3 py-2 bg-[#8C66FF] text-white text-xs font-black rounded-2xl flex items-center gap-1.5 shadow-md shadow-purple-200 active:scale-95 transition-transform cursor-pointer"
                >
                  <FiPlus size={16} />
                  <span>Buat Topik</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="w-full relative mb-3">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C98A6]" size={15} />
              <input
                type="text"
                placeholder="Cari pengumuman diskusi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#F0EDFF] rounded-2xl text-xs font-semibold text-[#2C2B30] placeholder:text-[#9C98A6] focus:outline-none focus:border-[#8C66FF] shadow-xs"
              />
            </div>

            {/* Announcements List */}
            <div className="flex-1 overflow-y-auto pr-0.5 space-y-3.5 no-scrollbar pb-6">
              {loadingList ? (
                <div className="py-20 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-[#9C98A6] font-bold uppercase tracking-wider">
                    Memuat Pengumuman...
                  </p>
                </div>
              ) : filteredAnnouncements.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-3xl p-6 border border-[#F0EDFF] shadow-xs">
                  <div className="w-14 h-14 mx-auto mb-3 bg-[#F0ECFF] text-[#8C66FF] rounded-2xl flex items-center justify-center text-2xl">
                    <LuMessageSquare />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#2C2B30]">
                    Belum Ada Pengumuman Diskusi
                  </h3>
                  <p className="text-xs text-[#9C98A6] mt-1 mb-4">
                    Mulai dengan membuat pengumuman diskusi atau tugas pertama Anda.
                  </p>
                  <button
                    onClick={handleOpenCreateForm}
                    className="px-4 py-2.5 bg-[#8C66FF] text-white text-xs font-bold rounded-full shadow-md shadow-purple-100"
                  >
                    + Buat Topik Sekarang
                  </button>
                </div>
              ) : (
                filteredAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="w-full bg-white rounded-3xl p-4.5 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(140,102,255,0.05)] flex flex-col gap-3"
                  >
                    {/* Top Row: Title & Actions */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[9px] uppercase font-black tracking-wider bg-[#F0ECFF] text-[#8C66FF] px-2.5 py-0.5 rounded-full inline-block mb-1">
                          Topik Pengumuman
                        </span>
                        <h2 className="text-sm font-black text-[#2C2B30] leading-snug">
                          {ann.title}
                        </h2>
                        <p className="text-[10px] text-[#9C98A6] font-semibold mt-0.5 flex items-center gap-1">
                          <FiCalendar size={11} /> {formatDateIndo(ann.createdAt)}
                        </p>
                      </div>

                      {/* Edit / Delete Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenEditForm(ann)}
                          className="w-8 h-8 rounded-xl bg-[#FAF9FF] border border-[#F0EDFF] text-[#8C66FF] flex items-center justify-center hover:bg-[#F0ECFF] transition-colors"
                          title="Edit Pengumuman"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                          className="w-8 h-8 rounded-xl bg-[#FFF1F2] border border-[#FFE4E6] text-[#E11D48] flex items-center justify-center hover:bg-[#FFE4E6] transition-colors"
                          title="Hapus Pengumuman"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Problem Snippet */}
                    {ann.problem && (
                      <p className="text-xs text-[#524F5D] line-clamp-2 leading-relaxed bg-[#FAF9FF] p-2.5 rounded-xl border border-[#F0EDFF]/80">
                        {ann.problem}
                      </p>
                    )}

                    {/* Stats Badges */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[#F0EDFF]">
                      <span className="text-[10px] font-bold text-[#3B82F6] bg-[#EFF6FF] px-2.5 py-1 rounded-full flex items-center gap-1">
                        <LuFileText size={12} />
                        {ann.submissionsCount || 0} Siswa Mengumpulkan
                      </span>
                      <span className="text-[10px] font-bold text-[#8C66FF] bg-[#F0ECFF] px-2.5 py-1 rounded-full flex items-center gap-1">
                        <LuMessageSquare size={12} />
                        {ann.discussionsCount || 0} Pesan Diskusi
                      </span>
                    </div>

                    {/* Admin Action Buttons (Penilaian & Ranking Keaktifan) */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleOpenSubmissions(ann)}
                        className="py-2.5 px-3 bg-[#8C66FF] text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#7B55F0] active:scale-95 transition-all cursor-pointer"
                      >
                        <LuAward size={14} />
                        <span>Nilai Tugas ({ann.submissionsCount || 0})</span>
                      </button>

                      <button
                        onClick={() => handleOpenRanking(ann)}
                        className="py-2.5 px-3 bg-[#FFF9E6] border border-[#FDE68A] text-[#D97706] text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#FEF3C7] active:scale-95 transition-all cursor-pointer"
                      >
                        <LuTrophy size={14} />
                        <span>Ranking Keaktifan</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* ==================== VIEW 2: SUBMISSIONS & GRADING ==================== */
          <div className="w-full flex-1 flex flex-col">
            {/* Header for Submissions View */}
            <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-[#F0EDFF]">
              <div className="flex items-center gap-3 truncate">
                <button
                  onClick={() => setSelectedForSubmissions(null)}
                  className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-xs border border-[#F0EDFF] text-[#8C66FF] active:scale-95 transition-transform shrink-0"
                  title="Kembali ke Daftar Topik"
                >
                  <FiArrowLeft size={19} />
                </button>
                <div className="truncate">
                  <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">
                    Penilaian Pengumpulan Tugas
                  </p>
                  <h2 className="text-base font-black text-[#2C2B30] truncate">
                    {selectedForSubmissions.title}
                  </h2>
                </div>
              </div>
            </div>

            {/* Filter and Search inside Submissions */}
            <div className="w-full flex gap-2 mb-3">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C98A6]" size={14} />
                <input
                  type="text"
                  placeholder="Cari siswa atau kelas..."
                  value={searchSubmissionQuery}
                  onChange={(e) => setSearchSubmissionQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#F0EDFF] rounded-xl text-xs font-semibold text-[#2C2B30] placeholder:text-[#9C98A6] focus:outline-none focus:border-[#8C66FF]"
                />
              </div>

              {/* Status Filter */}
              <select
                value={submissionFilterStatus}
                onChange={(e: any) => setSubmissionFilterStatus(e.target.value)}
                className="bg-white border border-[#F0EDFF] rounded-xl px-2 py-2 text-xs font-bold text-[#2C2B30] focus:outline-none focus:border-[#8C66FF]"
              >
                <option value="all">Semua ({submissionsList.length})</option>
                <option value="ungraded">Belum Dinilai</option>
                <option value="graded">Sudah Dinilai</option>
              </select>
            </div>

            {/* Submissions List */}
            <div className="flex-1 overflow-y-auto pr-0.5 space-y-3 no-scrollbar pb-6">
              {loadingSubmissions ? (
                <div className="py-20 flex flex-col items-center justify-center gap-2">
                  <div className="w-7 h-7 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-[#9C98A6] font-bold">Memuat data tugas siswa...</p>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-3xl p-6 border border-[#F0EDFF]">
                  <p className="text-xs font-bold text-[#9C98A6]">
                    Tidak ada tugas siswa yang sesuai dengan filter.
                  </p>
                </div>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isGraded = sub.grade !== undefined && sub.grade !== null;

                  return (
                    <div
                      key={sub.id}
                      className="w-full bg-white rounded-3xl p-4 border border-[#F0EDFF] shadow-xs flex flex-col gap-2.5"
                    >
                      {/* Student Info & Grade Badge */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xs font-black text-[#2C2B30]">
                            {sub.studentName}
                          </h3>
                          <p className="text-[10px] text-[#9C98A6] font-semibold">
                            Kelas {sub.studentClass} • {formatDateIndo(sub.submittedAt)}
                          </p>
                        </div>

                        {isGraded ? (
                          <span className="text-xs font-black text-[#10B981] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 rounded-full">
                            Nilai: {sub.grade}
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-1 rounded-full">
                            Belum Dinilai
                          </span>
                        )}
                      </div>

                      {/* Answer Snippet */}
                      <div className="text-xs text-[#524F5D] line-clamp-3 bg-[#FAF9FF] p-3 rounded-2xl border border-[#F0EDFF]/80 leading-relaxed whitespace-pre-line font-medium">
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
                          className="flex items-center gap-1.5 text-[11px] font-bold text-[#8C66FF] cursor-pointer hover:underline"
                        >
                          <FiImage size={13} />
                          <span>Lihat Foto Lampiran Siswa</span>
                        </div>
                      )}

                      {/* Feedback snippet if graded */}
                      {isGraded && sub.feedback && (
                        <p className="text-[10px] text-[#059669] italic bg-[#ECFDF5]/50 px-2.5 py-1.5 rounded-xl">
                          Catatan Guru: "{sub.feedback}"
                        </p>
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
                        <LuAward size={14} />
                        <span>{isGraded ? "Edit Nilai & Catatan" : "Beri Nilai Siswa"}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==================== MODAL: CREATE / EDIT ANNOUNCEMENT ==================== */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 border border-[#F0EDFF] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center pb-2.5 border-b border-[#F0EDFF]">
              <h3 className="text-sm font-black text-[#2C2B30]">
                {editingId ? "Edit Topik Pengumuman" : "Buat Topik Pengumuman Baru"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-7 h-7 rounded-full bg-[#FAF9FF] text-[#9C98A6] flex items-center justify-center hover:text-[#2C2B30]"
              >
                <FiX size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 no-scrollbar text-xs">
              {/* Judul */}
              <div>
                <label className="font-bold text-[#524F5D] block mb-1">
                  Judul Topik / Pengumuman *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Diskusi Pencemaran Air Sungai Bengawan Solo"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#FAF9FF] border border-[#E9E6F5] rounded-xl font-semibold text-[#2C2B30] focus:outline-none focus:border-[#8C66FF]"
                />
              </div>

              {/* Soal / Permasalahan */}
              <div>
                <label className="font-bold text-[#524F5D] block mb-1">
                  📌 Soal / Permasalahan Lingkungan
                </label>
                <textarea
                  rows={3}
                  placeholder="Deskripsikan kasus atau permasalahan lingkungan yang dibahas..."
                  value={formProblem}
                  onChange={(e) => setFormProblem(e.target.value)}
                  className="w-full p-3 bg-[#FAF9FF] border border-[#E9E6F5] rounded-xl font-medium text-[#2C2B30] focus:outline-none focus:border-[#8C66FF] leading-relaxed"
                />
              </div>

              {/* Pertanyaan */}
              <div>
                <label className="font-bold text-[#524F5D] block mb-1">
                  ❓ Pertanyaan Analisis
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: 1. Apa zat pencemar utama? 2. Bagaimana solusinya?"
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  className="w-full p-3 bg-[#FAF9FF] border border-[#E9E6F5] rounded-xl font-medium text-[#2C2B30] focus:outline-none focus:border-[#8C66FF] leading-relaxed"
                />
              </div>

              {/* Informasi Tugas */}
              <div>
                <label className="font-bold text-[#524F5D] block mb-1">
                  📋 Informasi Tugas (Batas Waktu & Format)
                </label>
                <textarea
                  rows={2}
                  placeholder="Batas pengumpulan: Jumat, 25 September 2026. Format: Teks & foto bagan."
                  value={formTaskInfo}
                  onChange={(e) => setFormTaskInfo(e.target.value)}
                  className="w-full p-3 bg-[#FAF9FF] border border-[#E9E6F5] rounded-xl font-medium text-[#2C2B30] focus:outline-none focus:border-[#8C66FF] leading-relaxed"
                />
              </div>

              {/* Petunjuk */}
              <div>
                <label className="font-bold text-[#524F5D] block mb-1">
                  💡 Petunjuk Pengerjaan
                </label>
                <textarea
                  rows={2}
                  placeholder="Gunakan prinsip berpikir sistem dalam mengurai dampak pencemaran."
                  value={formInstruction}
                  onChange={(e) => setFormInstruction(e.target.value)}
                  className="w-full p-3 bg-[#FAF9FF] border border-[#E9E6F5] rounded-xl font-medium text-[#2C2B30] focus:outline-none focus:border-[#8C66FF] leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#F0EDFF] flex gap-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 py-2.5 bg-[#FAF9FF] text-[#9C98A6] font-bold text-xs rounded-2xl hover:text-[#2C2B30]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAnnouncement}
                disabled={submittingForm}
                className="flex-1 py-2.5 bg-[#8C66FF] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-purple-200 active:scale-95 disabled:opacity-50"
              >
                {submittingForm ? "Menyimpan..." : "Simpan Pengumuman"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: GRADING SUBMISSION ==================== */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 border border-[#F0EDFF] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center pb-2.5 border-b border-[#F0EDFF]">
              <div>
                <h3 className="text-sm font-black text-[#2C2B30]">
                  Penilaian Tugas Siswa
                </h3>
                <p className="text-[10px] text-[#9C98A6] font-semibold">
                  {gradingSubmission.studentName} (Kelas {gradingSubmission.studentClass})
                </p>
              </div>
              <button
                onClick={() => setGradingSubmission(null)}
                className="w-7 h-7 rounded-full bg-[#FAF9FF] text-[#9C98A6] flex items-center justify-center hover:text-[#2C2B30]"
              >
                <FiX size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 no-scrollbar text-xs">
              {/* Answer Content */}
              <div>
                <label className="font-bold text-[#524F5D] block mb-1">
                  Jawaban Siswa:
                </label>
                <div className="p-3 bg-[#FAF9FF] border border-[#E9E6F5] rounded-2xl text-xs font-medium text-[#2C2B30] leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
                  {gradingSubmission.answer}
                </div>
              </div>

              {/* Attachment Preview if any */}
              {gradingSubmission.hasImage && (
                <div>
                  <label className="font-bold text-[#524F5D] block mb-1">
                    Lampiran Foto Siswa:
                  </label>
                  <div
                    onClick={() =>
                      setZoomImageUrl(
                        `${API_URL}/api/announcements/submissions/${gradingSubmission.id}/image`,
                      )
                    }
                    className="w-full h-36 bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0] relative cursor-pointer group"
                  >
                    <img
                      src={`${API_URL}/api/announcements/submissions/${gradingSubmission.id}/image`}
                      alt="Lampiran"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      Klik untuk memperbesar
                    </div>
                  </div>
                </div>
              )}

              {/* Nilai Input (0 - 100) */}
              <div>
                <label className="font-extrabold uppercase text-[#524F5D] tracking-wider block mb-1">
                  Nilai Tugas (0 - 100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Contoh: 85"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9FF] border border-[#E9E6F5] rounded-xl font-black text-sm text-[#8C66FF] focus:outline-none focus:border-[#8C66FF]"
                />
              </div>

              {/* Feedback Textarea */}
              <div>
                <label className="font-extrabold uppercase text-[#524F5D] tracking-wider block mb-1">
                  Catatan & Masukan Guru (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan apresiasi atau perbaikan untuk siswa..."
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full p-3 bg-[#FAF9FF] border border-[#E9E6F5] rounded-xl font-medium text-xs text-[#2C2B30] focus:outline-none focus:border-[#8C66FF] leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#F0EDFF] flex gap-2">
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="flex-1 py-2.5 bg-[#FAF9FF] text-[#9C98A6] font-bold text-xs rounded-2xl hover:text-[#2C2B30]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveGrade}
                disabled={savingGrade}
                className="flex-1 py-2.5 bg-[#10B981] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-100 active:scale-95 disabled:opacity-50"
              >
                {savingGrade ? "Menyimpan..." : "Simpan Penilaian"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: RANKING KEAKTIFAN DISKUSI (> 4 WORDS FILTER) ==================== */}
      {rankingAnnouncement && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#F0EDFF] shadow-2xl flex flex-col gap-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-[#F0EDFF]">
              <div className="flex items-center gap-2 text-[#D97706]">
                <div className="w-8 h-8 rounded-xl bg-[#FFF9E6] flex items-center justify-center text-base font-black">
                  <LuTrophy />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#2C2B30]">
                    Ranking Siswa Teraktif
                  </h3>
                  <p className="text-[10px] text-[#9C98A6] font-semibold">
                    Topik: {rankingAnnouncement.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRankingAnnouncement(null)}
                className="w-7 h-7 rounded-full bg-[#FAF9FF] text-[#9C98A6] flex items-center justify-center hover:text-[#2C2B30]"
              >
                <FiX size={15} />
              </button>
            </div>

            {/* Filter Explanation Card */}
            <div className="p-2.5 bg-[#FFFBEB] rounded-2xl border border-[#FDE68A] text-[10px] text-[#92400E] font-medium leading-relaxed">
              💡 <strong>Ketentuan Ranking:</strong> Berdasarkan filter sistem di frontend,
              hanya komentar siswa yang memiliki <strong>lebih dari 4 kata</strong> yang dihitung ke dalam ranking keaktifan.
            </div>

            {/* Ranking List */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {loadingRanking ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] text-[#9C98A6] font-bold">Menghitung keaktifan...</p>
                </div>
              ) : rankedStudents.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#9C98A6]">
                  Belum ada komentar siswa yang memiliki lebih dari 4 kata pada topik ini.
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
                            Kelas {item.studentClass} • Total {item.totalCommentsCount} pesan
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
              onClick={() => setRankingAnnouncement(null)}
              className="w-full py-2.5 bg-[#8C66FF] text-white font-extrabold text-xs rounded-2xl hover:bg-[#7B55F0] transition-colors"
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
