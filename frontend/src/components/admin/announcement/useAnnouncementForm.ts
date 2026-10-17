import { useState, useEffect } from "react";
import { useCustomDialog } from "../../CustomDialog";
import { API_URL } from "../../../utils/constants";
import { compressImage } from "../../../utils/image";

export interface AnnouncementItemLike {
  id: string;
  title: string;
  problem: string;
  question: string;
  taskInfo: string;
  instruction: string;
  authorName?: string;
  createdAt?: string;
  updatedAt?: string;
  hasImage?: boolean;
  discussionsCount?: number;
  submissionsCount?: number;
}

export function parseToList(text?: string): string[] {
  if (!text || !text.trim()) return [""];
  const lines = text
    .split("\n")
    .map((line) =>
      line
        .trim()
        .replace(/^(\d+[.)]\s*|[-*•]\s*)/, "")
        .trim(),
    )
    .filter((line) => line.length > 0);
  return lines.length > 0 ? lines : [""];
}

interface UseAnnouncementFormProps {
  initialData?: AnnouncementItemLike | null;
  onSave: (payload: FormData) => Promise<void>;
  onCancel: () => void;
  externalSubmitting?: boolean;
}

export function useAnnouncementForm({
  initialData,
  onSave,
  onCancel,
  externalSubmitting = false,
}: UseAnnouncementFormProps) {
  const { showAlert, showConfirm } = useCustomDialog();

  const [title, setTitle] = useState<string>("");
  const [problem, setProblem] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>([""]);
  const [taskInfo, setTaskInfo] = useState<string>("");
  const [instructions, setInstructions] = useState<string[]>([""]);

  // Banner image states
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [removeExistingImage, setRemoveExistingImage] = useState<boolean>(false);
  const [compressingImage, setCompressingImage] = useState<boolean>(false);

  const [internalSubmitting, setInternalSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setProblem(initialData.problem || "");
      setQuestions(parseToList(initialData.question));
      setTaskInfo(initialData.taskInfo || "");
      setInstructions(parseToList(initialData.instruction));
      if (initialData.hasImage) {
        const version = initialData.updatedAt || initialData.createdAt || "";
        setImagePreviewUrl(
          `${API_URL}/api/announcements/${initialData.id}/image${version ? `?v=${encodeURIComponent(version)}` : ""}`,
        );
      } else {
        setImagePreviewUrl("");
      }
      setSelectedImageFile(null);
      setRemoveExistingImage(false);
    } else {
      setTitle("");
      setProblem("");
      setQuestions([""]);
      setTaskInfo("");
      setInstructions([""]);
      setImagePreviewUrl("");
      setSelectedImageFile(null);
      setRemoveExistingImage(false);
    }
  }, [initialData]);

  const isSubmitting = externalSubmitting || internalSubmitting;

  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, ""]);
  };

  const handleUpdateQuestion = (index: number, val: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      return filtered.length > 0 ? filtered : [""];
    });
  };

  const handleAddInstruction = () => {
    setInstructions((prev) => [...prev, ""]);
  };

  const handleUpdateInstruction = (index: number, val: string) => {
    setInstructions((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handleRemoveInstruction = (index: number) => {
    setInstructions((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      return filtered.length > 0 ? filtered : [""];
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showAlert(
        "Hanya file gambar (JPG, PNG, WebP) yang dapat diunggah.",
        "Format Tidak Didukung",
      );
      return;
    }

    setCompressingImage(true);
    try {
      const compressedBlob = await compressImage(file, 400 * 1024);
      const compressedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type || "image/jpeg",
      });
      setSelectedImageFile(compressedFile);
      setImagePreviewUrl(URL.createObjectURL(compressedFile));
      setRemoveExistingImage(false);
    } catch (err: unknown) {
      console.error("Compression error:", err);
      showAlert("Gagal memproses gambar banner.", "Error Kompresi");
    } finally {
      setCompressingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl("");
    setRemoveExistingImage(true);
  };

  const handleCancel = async () => {
    const initialQuestions = parseToList(initialData?.question);
    const initialInstructions = parseToList(initialData?.instruction);

    const questionsChanged =
      JSON.stringify(questions.map((q) => q.trim())) !==
      JSON.stringify(initialQuestions.map((q) => q.trim()));
    const instructionsChanged =
      JSON.stringify(instructions.map((i) => i.trim())) !==
      JSON.stringify(initialInstructions.map((i) => i.trim()));

    const hasChanges =
      title.trim() !== (initialData?.title || "").trim() ||
      problem.trim() !== (initialData?.problem || "").trim() ||
      taskInfo.trim() !== (initialData?.taskInfo || "").trim() ||
      questionsChanged ||
      instructionsChanged ||
      selectedImageFile !== null ||
      removeExistingImage;

    if (hasChanges) {
      const confirmed = await showConfirm(
        "Batal dan buang perubahan pada topik diskusi ini?",
        "Batal",
      );
      if (confirmed) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showAlert("Silakan masukkan judul topik diskusi.", "Judul Kosong");
      return;
    }

    const questionPayload = questions
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .join("\n");

    const instructionPayload = instructions
      .map((inst) => inst.trim())
      .filter((inst) => inst.length > 0)
      .join("\n");

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("problem", problem.trim());
    formData.append("question", questionPayload);
    formData.append("taskInfo", taskInfo.trim());
    formData.append("instruction", instructionPayload);

    if (selectedImageFile) {
      formData.append("file", selectedImageFile);
    } else if (removeExistingImage) {
      formData.append("removeImage", "true");
    }

    setInternalSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setInternalSubmitting(false);
    }
  };

  const validQuestionsCount = questions.filter((q) => q.trim().length > 0).length;
  const validInstructionsCount = instructions.filter(
    (inst) => inst.trim().length > 0,
  ).length;

  return {
    title,
    setTitle,
    problem,
    setProblem,
    questions,
    taskInfo,
    setTaskInfo,
    instructions,
    selectedImageFile,
    imagePreviewUrl,
    compressingImage,
    isSubmitting,
    validQuestionsCount,
    validInstructionsCount,
    handleAddQuestion,
    handleUpdateQuestion,
    handleRemoveQuestion,
    handleAddInstruction,
    handleUpdateInstruction,
    handleRemoveInstruction,
    handleImageSelect,
    handleRemoveImage,
    handleCancel,
    handleSubmit,
  };
}
