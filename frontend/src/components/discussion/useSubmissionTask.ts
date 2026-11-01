import { useState, useCallback, type ChangeEvent } from "react";
import {
  getAnnouncementSubmissionsApi,
  submitAnnouncementTaskApi,
  deleteAnnouncementSubmissionApi,
} from "../../api/api";
import type { SubmissionItem, AnnouncementItem } from "../../types/discussion";
import { compressImagesBatch } from "../../utils/image";
import { getSubmissionImageUrl } from "./discussionUtils";

export interface SubmissionAttachmentItem {
  id: string;
  url: string;
  file?: File;
  isExisting?: boolean;
  name?: string;
}

const MAX_SUBMISSION_IMAGES = 10;

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
  const [attachments, setAttachments] = useState<SubmissionAttachmentItem[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [compressingImage, setCompressingImage] = useState<boolean>(false);
  const [compressionProgress, setCompressionProgress] = useState<string>("");
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
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length < files.length) {
      showAlert(
        "Beberapa file diabaikan karena bukan format gambar yang didukung (JPG, PNG, WebP).",
        "Format File",
      );
    }
    if (validFiles.length === 0) return;

    const currentCount = attachments.length;
    const availableSlots = MAX_SUBMISSION_IMAGES - currentCount;
    if (availableSlots <= 0) {
      showAlert(
        `Maksimal ${MAX_SUBMISSION_IMAGES} gambar yang dapat dilampirkan.`,
        "Batas Maksimal Gambar",
      );
      return;
    }

    const filesToProcess = validFiles.slice(0, availableSlots);
    if (validFiles.length > availableSlots) {
      showAlert(
        `Hanya ${availableSlots} gambar pertama yang ditambahkan karena batas maksimal ${MAX_SUBMISSION_IMAGES} gambar.`,
        "Batas Maksimal Gambar",
      );
    }

    setCompressingImage(true);
    setCompressionProgress(`Mengompresi 1/${filesToProcess.length}...`);
    try {
      const compressedFiles = await compressImagesBatch(
        filesToProcess,
        250 * 1024,
        1200,
        (completed, total) => {
          setCompressionProgress(`Mengompresi ${completed}/${total}...`);
        },
      );

      const newItems: SubmissionAttachmentItem[] = compressedFiles.map((file, idx) => ({
        id: `blob-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        url: URL.createObjectURL(file),
        file,
        isExisting: false,
        name: file.name,
      }));

      setAttachments((prev) => [...prev, ...newItems]);
    } catch (err) {
      console.error("Batch compression error:", err);
      showAlert("Gagal memproses kompresi gambar.", "Error");
    } finally {
      setCompressingImage(false);
      setCompressionProgress("");
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target && !target.isExisting && target.url.startsWith("blob:")) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((a) => a.id !== id);
    });

    const target = attachments.find((a) => a.id === id);
    if (target?.isExisting) {
      setRemovedImageIds((prev) => [...prev, id]);
    }
  };

  const handleClearAttachments = () => {
    attachments.forEach((a) => {
      if (!a.isExisting && a.url.startsWith("blob:")) {
        URL.revokeObjectURL(a.url);
      }
    });
    setAttachments([]);
    setRemovedImageIds([]);
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

      const newFiles = attachments
        .filter((a) => !a.isExisting && a.file)
        .map((a) => a.file as File);

      for (const file of newFiles) {
        formData.append("files", file);
      }

      if (removedImageIds.length > 0) {
        formData.append("removedImageIds", JSON.stringify(removedImageIds));
      }

      if (attachments.length === 0 && mySubmission?.hasImage) {
        formData.append("removeImage", "true");
      }

      const res = await submitAnnouncementTaskApi(token, selectedAnnouncement.id, formData);
      showAlert("Tugas Anda telah berhasil disimpan dan dikirimkan.", "Berhasil Mengumpulkan!");

      setShowSubmissionForm(false);
      setTaskAnswer("");
      handleClearAttachments();

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

    // Clear prior local blob urls
    attachments.forEach((a) => {
      if (!a.isExisting && a.url.startsWith("blob:")) {
        URL.revokeObjectURL(a.url);
      }
    });
    setRemovedImageIds([]);

    const existingItems: SubmissionAttachmentItem[] = [];
    if (mySubmission.images && mySubmission.images.length > 0) {
      mySubmission.images.forEach((img, idx) => {
        existingItems.push({
          id: img.id,
          url: getSubmissionImageUrl(mySubmission.id, mySubmission.submittedAt, img.id),
          isExisting: true,
          name: img.fileName || `Lampiran ${idx + 1}`,
        });
      });
    } else if (mySubmission.hasImage) {
      existingItems.push({
        id: "legacy",
        url: getSubmissionImageUrl(mySubmission.id, mySubmission.submittedAt),
        isExisting: true,
        name: mySubmission.fileName || "Lampiran",
      });
    }

    setAttachments(existingItems);
    setShowSubmissionForm(true);
  };

  const resetSubmissionState = () => {
    attachments.forEach((a) => {
      if (!a.isExisting && a.url.startsWith("blob:")) {
        URL.revokeObjectURL(a.url);
      }
    });
    setAttachments([]);
    setRemovedImageIds([]);
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
    attachments,
    imagePreviewUrl: attachments[0]?.url || "",
    compressingImage,
    compressionProgress,
    submittingTask,
    showSubmissionForm,
    setShowSubmissionForm,
    fetchSubmissions,
    handleImageSelect,
    handleRemoveAttachment,
    handleClearAttachments,
    handleClearImage: handleClearAttachments,
    handleSubmitTask,
    handleDeleteSubmission,
    handlePrepareEditSubmission,
    resetSubmissionState,
  };
}
