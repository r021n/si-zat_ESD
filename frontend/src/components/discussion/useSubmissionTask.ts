import { useState, useCallback, type ChangeEvent } from "react";
import {
  getAnnouncementSubmissionsApi,
  submitAnnouncementTaskApi,
  deleteAnnouncementSubmissionApi,
} from "../../api/api";
import type { SubmissionItem, AnnouncementItem } from "../../types/discussion";
import { compressImage } from "../../utils/image";
import { API_URL } from "../../utils/constants";

export function useSubmissionTask(
  token: string | null,
  selectedAnnouncement: AnnouncementItem | null,
  setSelectedAnnouncement: React.Dispatch<React.SetStateAction<AnnouncementItem | null>>,
  fetchAnnouncements: () => void,
  setLoadedPeerFor: (id: string | null) => void,
  showAlert: (msg: string, title?: string) => void,
  showConfirm: (msg: string, title?: string) => Promise<boolean>,
) {
  const [mySubmission, setMySubmission] = useState<SubmissionItem | null>(null);
  const [loadingSubmission, setLoadingSubmission] = useState<boolean>(false);
  const [loadedSubmissionsFor, setLoadedSubmissionsFor] = useState<string | null>(null);

  const [taskAnswer, setTaskAnswer] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [compressingImage, setCompressingImage] = useState<boolean>(false);
  const [submittingTask, setSubmittingTask] = useState<boolean>(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState<boolean>(false);

  const fetchSubmissions = useCallback(
    async (annId: string, force = false) => {
      if (!token) return;
      setLoadingSubmission(true);
      try {
        const subs: SubmissionItem[] = await getAnnouncementSubmissionsApi(token, annId, force);
        if (subs && subs.length > 0) {
          setMySubmission(subs[0]);
        } else {
          setMySubmission(null);
        }
        setLoadedSubmissionsFor(annId);
      } catch (err) {
        console.error("Error fetching submissions:", err);
      } finally {
        setLoadingSubmission(false);
      }
    },
    [token],
  );

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
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

      const res = await submitAnnouncementTaskApi(token, selectedAnnouncement.id, formData);
      showAlert("Tugas Anda telah berhasil disimpan dan dikirimkan.", "Berhasil Mengumpulkan!");

      setShowSubmissionForm(false);
      setTaskAnswer("");
      handleClearImage();

      const prev = mySubmission;
      const raw = res?.data;
      if (raw) {
        setMySubmission({
          ...raw,
          announcementId: selectedAnnouncement.id,
          grade: raw.grade ?? prev?.grade,
          feedback: raw.feedback ?? prev?.feedback,
          gradedAt: raw.gradedAt ?? prev?.gradedAt,
          gradedBy: raw.gradedBy ?? prev?.gradedBy,
        } as SubmissionItem);
        setLoadedSubmissionsFor(selectedAnnouncement.id);
      } else {
        fetchSubmissions(selectedAnnouncement.id);
      }
      fetchAnnouncements();
      setLoadedPeerFor(null);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Terjadi kendala saat mengirimkan tugas.";
      showAlert(errorMsg, "Gagal Mengumpulkan");
    } finally {
      setSubmittingTask(false);
    }
  };

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
      setLoadedSubmissionsFor(mySubmission.announcementId);
      setSelectedAnnouncement((prev) => (prev ? { ...prev, mySubmission: null } : prev));
      fetchAnnouncements();
      setLoadedPeerFor(null);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal menghapus pengumpulan tugas.";
      showAlert(errorMsg, "Gagal Menghapus");
    }
  };

  const handlePrepareEditSubmission = () => {
    if (!mySubmission) return;
    setTaskAnswer(mySubmission.answer || "");
    setSelectedFile(null);
    setImagePreviewUrl(
      mySubmission.hasImage
        ? `${API_URL}/api/announcements/submissions/${mySubmission.id}/image`
        : "",
    );
    setShowSubmissionForm(true);
  };

  const resetSubmissionState = () => {
    setMySubmission(null);
    setLoadedSubmissionsFor(null);
  };

  return {
    mySubmission,
    setMySubmission,
    loadingSubmission,
    loadedSubmissionsFor,
    setLoadedSubmissionsFor,
    taskAnswer,
    setTaskAnswer,
    imagePreviewUrl,
    compressingImage,
    submittingTask,
    showSubmissionForm,
    setShowSubmissionForm,
    fetchSubmissions,
    handleImageSelect,
    handleClearImage,
    handleSubmitTask,
    handleDeleteSubmission,
    handlePrepareEditSubmission,
    resetSubmissionState,
  };
}
