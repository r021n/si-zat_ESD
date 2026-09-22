import { useState, useEffect, useRef } from "react";
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiSave,
  FiCheck,
  FiImage,
  FiUpload,
} from "react-icons/fi";
import { useCustomDialog } from "../CustomDialog";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

export interface AnnouncementFormData {
  title: string;
  problem: string;
  question: string;
  taskInfo: string;
  instruction: string;
}

export interface AnnouncementItemLike {
  id: string;
  title: string;
  problem: string;
  question: string;
  taskInfo: string;
  instruction: string;
  authorName?: string;
  createdAt?: string;
  hasImage?: boolean;
  discussionsCount?: number;
  submissionsCount?: number;
}

interface AnnouncementFormProps {
  initialData?: AnnouncementItemLike | null;
  onSave: (payload: FormData) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

// Canvas-based image compression helper (strictly <= 400KB)
function compressImage(
  file: File,
  maxSizeBytes: number = 400 * 1024,
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

        const MAX_DIM = 1600;
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

        let quality = 0.88;
        const attempt = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              if (blob.size <= maxSizeBytes || quality <= 0.15) {
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
      img.onerror = () => reject(new Error("Gagal memproses file gambar"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file gambar"));
    reader.readAsDataURL(file);
  });
}

export default function AnnouncementForm({
  initialData,
  onSave,
  onCancel,
  submitting: externalSubmitting = false,
}: AnnouncementFormProps) {
  const { showAlert, showConfirm } = useCustomDialog();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseToList = (text?: string): string[] => {
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
  };

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
        setImagePreviewUrl(
          `${API_URL}/api/announcements/${initialData.id}/image?t=${Date.now()}`,
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

  // Question helpers
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

  // Instruction helpers
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

  // Banner image handlers
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
      // Compress to strictly <= 400KB
      const compressedBlob = await compressImage(file, 400 * 1024);
      const compressedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type || "image/jpeg",
      });
      setSelectedImageFile(compressedFile);
      setImagePreviewUrl(URL.createObjectURL(compressedFile));
      setRemoveExistingImage(false);
    } catch (err: any) {
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

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9FF] flex justify-center items-start text-[#2C2B30] font-sans select-none overflow-y-auto py-4 md:py-8">
      {/* Decorative Blur Bubble */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-[#E9E4FF] rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-[#FFEBF0] rounded-full filter blur-3xl opacity-40"></div>
      </div>

      {/* Main Full-Screen Responsive Container */}
      <div className="w-full max-w-107.5 md:max-w-5xl lg:max-w-6xl xl:max-w-7xl min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)] my-auto flex flex-col justify-between px-4 sm:px-6 md:px-8 py-4 md:py-6 z-10 transition-all duration-300">
        <div className="w-full flex-1 flex flex-col">
          {/* Header */}
          <div className="w-full flex items-center justify-between pb-4 border-b border-[#F0EDFF]/80 shrink-0">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-2xl flex items-center justify-center shadow-xs border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:scale-95 hover:bg-[#FAF9FF] transition-all shrink-0"
                title="Kembali"
              >
                <FiArrowLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#9C98A6] font-bold">
                    Panel Guru & Admin
                  </p>
                  <span className="hidden md:inline-block px-2 py-0.5 bg-[#F0ECFF] text-[#8C66FF] rounded-full text-[10px] font-extrabold">
                    Ruang Diskusi
                  </span>
                </div>
                <h1 className="text-lg md:text-2xl font-extrabold text-[#2C2B30] leading-tight mt-0.5">
                  {initialData ? "Edit Topik Diskusi" : "Buat Topik Diskusi Baru"}
                </h1>
              </div>
            </div>

            {/* Desktop Action Buttons in Header */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 bg-white text-[#9C98A6] hover:text-[#2C2B30] text-xs font-bold rounded-2xl border border-[#F0EDFF] shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || compressingImage}
                className="px-6 py-2.5 bg-[#8C66FF] hover:bg-[#7b55f0] text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-md shadow-purple-200 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <FiSave size={15} />
                <span>{isSubmitting ? "Menyimpan..." : "Simpan Topik Diskusi"}</span>
              </button>
            </div>
          </div>

          {/* Form Content Cards: 2-Column Responsive Desktop Grid */}
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 flex-1 items-start">
            {/* ================= LEFT COLUMN: Metadata, Banner, & Task Info ================= */}
            <div className="lg:col-span-5 space-y-5">
              {/* 1. Judul Topik */}
              <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
                <label className="text-xs md:text-sm font-black text-[#2C2B30] block mb-1">
                  Judul Topik Diskusi <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] md:text-xs text-[#9C98A6] mb-2.5">
                  Tulis judul utama topik diskusi yang menarik dan jelas bagi siswa.
                </p>
                <input
                  type="text"
                  placeholder="Contoh: Analisis Kritis Masalah Pencemaran Air di Sungai Bengawan Solo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-3 bg-[#FAF9FF] border border-[#E9E6F5] rounded-xl md:rounded-2xl text-xs md:text-sm font-semibold text-[#2C2B30] focus:outline-none focus:border-[#8C66FF] focus:bg-white transition-colors"
                />
              </div>

              {/* 2. Banner / Foto Sampul Topik (Opsional) */}
              <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs md:text-sm font-black text-[#2C2B30]">
                        🖼️ Foto / Banner Sampul Topik
                      </label>
                      <span className="text-[10px] md:text-xs bg-[#F4F0FF] text-[#8C66FF] font-black px-2 py-0.5 rounded-full">
                        Opsional
                      </span>
                    </div>
                    <p className="text-[11px] md:text-xs text-[#9C98A6] mt-0.5">
                      Visualisasi topik diskusi (maks. 400 KB, otomatis dikompres).
                    </p>
                  </div>

                  {imagePreviewUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-red-500 hover:bg-red-50 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-100 active:scale-95"
                    >
                      <FiTrash2 size={13} />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {imagePreviewUrl ? (
                  <div className="relative w-full h-44 md:h-52 rounded-2xl overflow-hidden border border-[#E9E6F5] bg-[#FAF9FF] group">
                    <img
                      src={imagePreviewUrl}
                      alt="Preview Banner Topik"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 bg-white/95 hover:bg-white text-[#2C2B30] text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <FiUpload size={14} />
                        <span>Ganti Gambar</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3.5 py-2 bg-red-500/90 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <FiTrash2 size={14} />
                        <span>Hapus</span>
                      </button>
                    </div>
                    {selectedImageFile && (
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg pointer-events-none">
                        {(selectedImageFile.size / 1024).toFixed(0)} KB (Telah Dikompres)
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-7 border-2 border-dashed border-[#DDD6FE] hover:border-[#8C66FF] bg-[#FAF8FF] hover:bg-[#F4F0FF] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#EDE9FE] text-[#8C66FF] flex items-center justify-center shadow-2xs">
                      <FiImage size={22} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-[#2C2B30]">
                        {compressingImage
                          ? "Sedang Mengompres Gambar..."
                          : "Klik untuk unggah foto sampul"}
                      </p>
                      <p className="text-[10px] text-[#9C98A6] mt-0.5">
                        JPG, PNG, atau WebP (otomatis dikompres &le; 400 KB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Informasi Tugas */}
              <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
                <label className="text-xs md:text-sm font-black text-[#2C2B30] block mb-1">
                  📋 Informasi Tugas (Batas Waktu & Format)
                </label>
                <p className="text-[11px] md:text-xs text-[#9C98A6] mb-2.5">
                  Tentukan tenggat waktu pengumpulan dan format pengiriman tugas oleh siswa.
                </p>
                <textarea
                  rows={3}
                  placeholder="Contoh: Batas pengumpulan: Jumat, 25 September 2026 pukul 23:59 WIB. Format: Ringkasan teks jawaban dan unggahan bagan/konsep."
                  value={taskInfo}
                  onChange={(e) => setTaskInfo(e.target.value)}
                  className="w-full p-3.5 bg-[#FAF9FF] border border-[#E9E6F5] rounded-xl md:rounded-2xl text-xs md:text-sm font-medium text-[#2C2B30] focus:outline-none focus:border-[#8C66FF] focus:bg-white transition-colors leading-relaxed"
                />
              </div>
            </div>

            {/* ================= RIGHT COLUMN: Problem Statement, Questions, Instructions ================= */}
            <div className="lg:col-span-7 space-y-5">
              {/* 4. Soal / Permasalahan Lingkungan */}
              <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
                <label className="text-xs md:text-sm font-black text-[#2C2B30] block mb-1">
                  📌 Soal / Permasalahan Lingkungan
                </label>
                <p className="text-[11px] md:text-xs text-[#9C98A6] mb-2.5">
                  Deskripsikan narasi studi kasus, fenomena nyata, atau permasalahan lingkungan yang akan dianalisis siswa.
                </p>
                <textarea
                  rows={4}
                  placeholder="Deskripsikan kasus atau permasalahan lingkungan yang dibahas secara mendalam..."
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="w-full p-3.5 bg-[#FAF9FF] border border-[#E9E6F5] rounded-xl md:rounded-2xl text-xs md:text-sm font-medium text-[#2C2B30] focus:outline-none focus:border-[#8C66FF] focus:bg-white transition-colors leading-relaxed"
                />
              </div>

              {/* 5. Pertanyaan Analisis */}
              <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#F0EDFF]">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs md:text-sm font-black text-[#2C2B30]">
                        ❓ Pertanyaan Analisis
                      </label>
                      <span className="text-[10px] md:text-xs bg-[#EDE9FE] text-[#8C66FF] font-black px-2.5 py-0.5 rounded-full">
                        {validQuestionsCount} butir
                      </span>
                    </div>
                    <p className="text-[11px] md:text-xs text-[#9C98A6] mt-0.5">
                      Butir pertanyaan pemantik untuk melatih cara berpikir kritis dan sistem siswa.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F0FF] hover:bg-[#EDE9FE] text-[#8C66FF] font-bold text-xs rounded-xl transition-colors active:scale-95 cursor-pointer shadow-2xs shrink-0"
                  >
                    <FiPlus size={14} />
                    <span>Tambah Butir</span>
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  {questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 bg-[#FAF9FF] border border-[#F0EDFF] rounded-2xl focus-within:border-[#8C66FF] focus-within:bg-white transition-colors"
                    >
                      <span className="w-7 h-7 rounded-xl bg-[#EDE9FE] text-[#8C66FF] font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#DDD6FE]/60 shadow-2xs">
                        {idx + 1}
                      </span>
                      <textarea
                        rows={2}
                        placeholder={
                          idx === 0
                            ? "Contoh: Apa saja kemungkinan penyebab utama pencemaran sungai tersebut?"
                            : idx === 1
                              ? "Contoh: Bagaimana dampak pencemaran tersebut terhadap ekosistem perairan dan masyarakat sekitar?"
                              : `Tulis butir pertanyaan analisis ke-${idx + 1}...`
                        }
                        value={q}
                        onChange={(e) => handleUpdateQuestion(idx, e.target.value)}
                        className="flex-1 bg-transparent font-medium text-[#2C2B30] focus:outline-none leading-relaxed text-xs md:text-sm resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9C98A6] hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors shrink-0 mt-0.5 active:scale-90 cursor-pointer"
                        title={
                          questions.length === 1 && idx === 0
                            ? "Kosongkan butir ini"
                            : "Hapus butir pertanyaan ini"
                        }
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {questions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="w-full py-2.5 border border-dashed border-[#8C66FF]/40 bg-[#FAF8FF] hover:bg-[#F3EFFF] text-[#8C66FF] font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98 mt-2"
                  >
                    <FiPlus size={14} />
                    <span>Tambah Butir Pertanyaan Baru</span>
                  </button>
                )}
              </div>

              {/* 6. Petunjuk Pengerjaan */}
              <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#F0EDFF]">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs md:text-sm font-black text-[#2C2B30]">
                        💡 Petunjuk Pengerjaan
                      </label>
                      <span className="text-[10px] md:text-xs bg-[#ECFDF5] text-[#059669] font-black px-2.5 py-0.5 rounded-full">
                        {validInstructionsCount} poin
                      </span>
                    </div>
                    <p className="text-[11px] md:text-xs text-[#9C98A6] mt-0.5">
                      Panduan teknis dan tips yang memudahkan siswa dalam berdiskusi & menyelesaikan tugas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddInstruction}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] font-bold text-xs rounded-xl transition-colors active:scale-95 cursor-pointer shadow-2xs shrink-0"
                  >
                    <FiPlus size={14} />
                    <span>Tambah Poin</span>
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  {instructions.map((inst, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 bg-[#FAF9FF] border border-[#F0EDFF] rounded-2xl focus-within:border-[#059669] focus-within:bg-white transition-colors"
                    >
                      <span className="w-7 h-7 rounded-xl bg-[#ECFDF5] text-[#059669] font-black text-sm flex items-center justify-center shrink-0 mt-0.5 border border-[#A7F3D0]/60 shadow-2xs">
                        •
                      </span>
                      <textarea
                        rows={2}
                        placeholder={
                          idx === 0
                            ? "Contoh: Gunakan data dari materi, hasil pengamatan simulasi, atau sumber ilmiah relevan."
                            : idx === 1
                              ? "Contoh: Berikan tanggapan aktif minimal 5 kata pada pendapat rekan sekelompok."
                              : `Tulis poin petunjuk pengerjaan ke-${idx + 1}...`
                        }
                        value={inst}
                        onChange={(e) => handleUpdateInstruction(idx, e.target.value)}
                        className="flex-1 bg-transparent font-medium text-[#2C2B30] focus:outline-none leading-relaxed text-xs md:text-sm resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveInstruction(idx)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9C98A6] hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors shrink-0 mt-0.5 active:scale-90 cursor-pointer"
                        title={
                          instructions.length === 1 && idx === 0
                            ? "Kosongkan poin ini"
                            : "Hapus poin petunjuk ini"
                        }
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {instructions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddInstruction}
                    className="w-full py-2.5 border border-dashed border-[#059669]/40 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#059669] font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98 mt-2"
                  >
                    <FiPlus size={14} />
                    <span>Tambah Poin Petunjuk Baru</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action Footer (Mobile & Desktop fallback) */}
          <div className="mt-6 pt-4 border-t border-[#F0EDFF] flex gap-3 pb-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 sm:flex-none sm:px-8 py-3 bg-white text-[#9C98A6] hover:text-[#2C2B30] font-bold text-xs md:text-sm rounded-2xl border border-[#F0EDFF] shadow-xs active:scale-95 transition-all cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || compressingImage}
              className="flex-1 sm:flex-initial sm:px-10 py-3 bg-[#8C66FF] hover:bg-[#7b55f0] text-white font-extrabold text-xs md:text-sm rounded-2xl shadow-md shadow-purple-200 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiCheck size={16} />
              <span>{isSubmitting ? "Menyimpan..." : "Simpan Topik Diskusi"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

