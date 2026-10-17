import { useState, useEffect, useRef, useCallback, type FormEvent, type ChangeEvent } from "react";
import { useAuthStore } from "../../store/authStore";
import { useCustomDialog } from "../CustomDialog";
import {
  getTaskSubmissionsApi,
  createTaskSubmissionApi,
  deleteTaskSubmissionApi,
  getTaskDiscussionsApi,
  sendTaskDiscussionApi,
} from "../../api/api";
import { isAdmin as checkIsAdmin } from "../../utils/auth";
import { compressImage } from "../../utils/image";
import type { TaskSubmission, Message } from "./types";
import { usePortofolioContributors } from "./usePortofolioContributors";

export function usePenilaianBerpikirSistem() {
  const { user, token } = useAuthStore();
  const { showAlert, showConfirm } = useCustomDialog();

  const [activeView, setActiveView] = useState<"list" | "detail" | "upload" | "history">("list");
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(true);
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);
  const [isTaskCollapsed, setIsTaskCollapsed] = useState<boolean>(false);

  // Discussion state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const prevMessagesLengthRef = useRef<number>(0);

  // Upload Form State
  const [title, setTitle] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [compressing, setCompressing] = useState<boolean>(false);
  const [originalSize, setOriginalSize] = useState<string>("");
  const [compressedSize, setCompressedSize] = useState<string>("");

  const displayName = user ? user.nama || user.email.split("@")[0] : "Pengguna";
  const isAdmin = checkIsAdmin(user);

  const {
    isContributorModalOpen,
    setIsContributorModalOpen,
    contributorModalType,
    contributorModalTaskTitle,
    loadingContributors,
    contributorsData,
    contributorsError,
    handleShowTaskContributors,
    handleShowOverallContributors,
  } = usePortofolioContributors(token, selectedSubmission, messages);

  const fetchSubmissions = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoadingSubmissions(true);
        const data = await getTaskSubmissionsApi(token || "");
        setSubmissions(data);
      } catch (err) {
        console.error("Gagal memuat tugas diskusi:", err);
      } finally {
        if (showLoading) setLoadingSubmissions(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (token) {
      fetchSubmissions();
    }
  }, [token, fetchSubmissions]);

  useEffect(() => {
    if (activeView !== "detail" || !selectedSubmission) {
      setMessages([]);
      prevMessagesLengthRef.current = 0;
      return;
    }

    prevMessagesLengthRef.current = 0;

    const fetchMessages = async (showLoading = false) => {
      try {
        if (showLoading) setLoadingMessages(true);
        const data = await getTaskDiscussionsApi(token || "", selectedSubmission.id);
        setMessages((prev) => {
          if (
            prev.length === data.length &&
            (prev.length === 0 || prev[prev.length - 1]?.id === data[data.length - 1]?.id)
          ) {
            return prev;
          }
          return data;
        });
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

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSubmission) return;

    const textToSend = newMessage.trim();
    setNewMessage("");

    try {
      const response = await sendTaskDiscussionApi(token || "", selectedSubmission.id, textToSend);
      setMessages((prev) => [...prev, response.comment]);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal mengirimkan pesan diskusi.";
      await showAlert(errorMsg);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
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
        setFileBlob(selectedFile);
        setCompressedSize((selectedFile.size / 1024).toFixed(1) + " KB");
      } finally {
        setCompressing(false);
      }
    }
  };

  const handleClearFile = () => {
    setFileName("");
    setFileBlob(null);
    setOriginalSize("");
    setCompressedSize("");
  };

  const handleSubmit = async (e: FormEvent) => {
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

      setTitle("");
      setAnswer("");
      setFileName("");
      setFileBlob(null);
      setOriginalSize("");
      setCompressedSize("");

      await showAlert("Tugas berhasil dikumpulkan!");
      await fetchSubmissions(false);
      setActiveView("list");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal mengumpulkan tugas.";
      await showAlert(errorMsg);
    }
  };

  const handleDelete = async (id: string, taskTitle?: string, studentName?: string) => {
    const confirmMessage = taskTitle
      ? `Apakah Anda yakin ingin menghapus pengumpulan tugas "${taskTitle}"${
          studentName ? ` oleh ${studentName}` : ""
        }? Seluruh diskusi terkait tugas ini juga akan terhapus.`
      : "Apakah Anda yakin ingin menghapus pengumpulan tugas ini?";

    const confirmDelete = await showConfirm(confirmMessage, "Konfirmasi Hapus Tugas");
    if (!confirmDelete) return;

    try {
      await deleteTaskSubmissionApi(token || "", id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null);
        setActiveView("list");
      }
      await showAlert("Tugas berhasil dihapus!");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal menghapus tugas.";
      await showAlert(errorMsg);
    }
  };

  const mySubmissions = submissions.filter((sub) => sub.userId === user?.id);

  return {
    displayName,
    isAdmin,
    activeView,
    setActiveView,
    submissions,
    loadingSubmissions,
    fetchSubmissions,
    selectedSubmission,
    setSelectedSubmission,
    isTaskCollapsed,
    setIsTaskCollapsed,
    messages,
    newMessage,
    setNewMessage,
    loadingMessages,
    chatEndRef,
    handleSendMessage,
    title,
    setTitle,
    answer,
    setAnswer,
    fileName,
    compressing,
    originalSize,
    compressedSize,
    handleFileChange,
    handleClearFile,
    handleSubmit,
    handleDelete,
    mySubmissions,
    isContributorModalOpen,
    setIsContributorModalOpen,
    contributorModalType,
    contributorModalTaskTitle,
    loadingContributors,
    contributorsData,
    contributorsError,
    handleShowTaskContributors,
    handleShowOverallContributors,
  };
}
