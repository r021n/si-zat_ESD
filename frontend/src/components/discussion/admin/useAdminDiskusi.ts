import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { useAppBack } from "../../../hooks/useAppBack";
import { useCustomDialog } from "../../CustomDialog";
import {
  getAnnouncementsApi,
  createAnnouncementApi,
  updateAnnouncementApi,
  deleteAnnouncementApi,
  getAnnouncementSubmissionsApi,
  gradeAnnouncementSubmissionApi,
} from "../../../api/api";
import type { AnnouncementItem, SubmissionItem } from "../../../types/discussion";
import { useDebounce } from "../../../hooks/useDebounce";
import { isAdmin } from "../../../utils/auth";
import { useAdminDiskusiRanking } from "./useAdminDiskusiRanking";
import { useAdminSubmissionsFilter, SUBMISSION_PAGE_SIZE } from "./useAdminSubmissionsFilter";

export { SUBMISSION_PAGE_SIZE };

export function useAdminDiskusi() {
  const navigate = useNavigate();
  const goBack = useAppBack();
  const { user, token } = useAuthStore();
  const { showAlert, showConfirm } = useCustomDialog();

  // Announcements List
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);

  // Submissions State
  const [selectedForSubmissions, setSelectedForSubmissions] = useState<AnnouncementItem | null>(null);
  const [submissionsList, setSubmissionsList] = useState<SubmissionItem[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(false);
  const [showTopicDetails, setShowTopicDetails] = useState<boolean>(false);

  // Single Submission Grading Modal
  const [gradingSubmission, setGradingSubmission] = useState<SubmissionItem | null>(null);
  const [gradeScore, setGradeScore] = useState<string>("");
  const [gradeFeedback, setGradeFeedback] = useState<string>("");
  const [savingGrade, setSavingGrade] = useState<boolean>(false);

  // Full Answer Preview Modal
  const [viewingAnswerSub, setViewingAnswerSub] = useState<SubmissionItem | null>(null);

  // Zoom Image
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  // Ranking hook
  const {
    rankingAnnouncement,
    setRankingAnnouncement,
    loadingRanking,
    rankedStudents,
    handleOpenRanking,
  } = useAdminDiskusiRanking(token, showAlert);

  // Submissions Filter, Sorting, Pagination hook
  const {
    searchSubmissionQuery,
    setSearchSubmissionQuery,
    submissionFilterStatus,
    setSubmissionFilterStatus,
    submissionSort,
    setSubmissionSort,
    submissionPage,
    setSubmissionPage,
    totalSubmissionsCount,
    gradedCount,
    ungradedCount,
    sortedSubmissions,
    totalSubmissionPages,
    paginatedSubmissions,
  } = useAdminSubmissionsFilter(submissionsList, selectedForSubmissions);

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
      } catch (err: unknown) {
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

  const handleOpenCreateForm = () => {
    setEditingAnnouncement(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (ann: AnnouncementItem) => {
    setEditingAnnouncement(ann);
    setIsFormOpen(true);
  };

  const handleSaveAnnouncement = async (payload: FormData) => {
    if (!token) return;
    try {
      if (editingAnnouncement) {
        await updateAnnouncementApi(token, editingAnnouncement.id, payload);
        showAlert("Topik diskusi berhasil diubah.", "Berhasil Diperbarui");
      } else {
        await createAnnouncementApi(token, payload);
        showAlert("Topik dan ruang diskusi baru berhasil dibuat.", "Berhasil Dibuat");
      }
      setIsFormOpen(false);
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Terjadi kendala saat menyimpan topik diskusi.";
      showAlert(errorMsg, "Gagal Menyimpan");
    }
  };

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
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal menghapus topik diskusi.";
      showAlert(errorMsg, "Gagal Menghapus");
    }
  };

  const handleOpenSubmissions = async (ann: AnnouncementItem, force = false) => {
    if (!token) return;
    setSelectedForSubmissions(ann);
    setLoadingSubmissions(true);
    try {
      const data = await getAnnouncementSubmissionsApi(token, ann.id, force);
      setSubmissionsList(data || []);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal mengambil data pengumpulan tugas.";
      showAlert(errorMsg, "Gagal Membuka");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleOpenGradingModal = (sub: SubmissionItem) => {
    setGradingSubmission(sub);
    setGradeScore(sub.grade !== undefined && sub.grade !== null ? String(sub.grade) : "");
    setGradeFeedback(sub.feedback || "");
  };

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

      showAlert(
        `Tugas milik ${gradingSubmission.studentName} berhasil dinilai.`,
        "Nilai Disimpan",
      );

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
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal menyimpan penilaian tugas.";
      showAlert(errorMsg, "Gagal Menyimpan Nilai");
    } finally {
      setSavingGrade(false);
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    if (!debouncedSearchQuery.trim()) return true;
    const q = debouncedSearchQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.problem.toLowerCase().includes(q);
  });

  return {
    goBack,
    announcements,
    loadingList,
    searchQuery,
    setSearchQuery,
    filteredAnnouncements,
    isFormOpen,
    setIsFormOpen,
    editingAnnouncement,
    setEditingAnnouncement,
    selectedForSubmissions,
    setSelectedForSubmissions,
    submissionsList,
    loadingSubmissions,
    searchSubmissionQuery,
    setSearchSubmissionQuery,
    submissionFilterStatus,
    setSubmissionFilterStatus,
    submissionSort,
    setSubmissionSort,
    submissionPage,
    setSubmissionPage,
    showTopicDetails,
    setShowTopicDetails,
    gradingSubmission,
    setGradingSubmission,
    gradeScore,
    setGradeScore,
    gradeFeedback,
    setGradeFeedback,
    savingGrade,
    viewingAnswerSub,
    setViewingAnswerSub,
    rankingAnnouncement,
    setRankingAnnouncement,
    loadingRanking,
    zoomImageUrl,
    setZoomImageUrl,
    fetchAnnouncements,
    handleOpenCreateForm,
    handleOpenEditForm,
    handleSaveAnnouncement,
    handleDeleteAnnouncement,
    handleOpenSubmissions,
    handleOpenGradingModal,
    handleSaveGrade,
    handleOpenRanking,
    rankedStudents,
    totalSubmissionsCount,
    gradedCount,
    ungradedCount,
    sortedSubmissions,
    totalSubmissionPages,
    paginatedSubmissions,
  };
}
