import { FiArrowLeft, FiSave, FiCheck } from "react-icons/fi";
import AnnouncementFormBanner from "./announcement/AnnouncementFormBanner";
import AnnouncementQuestionList from "./announcement/AnnouncementQuestionList";
import AnnouncementInstructionList from "./announcement/AnnouncementInstructionList";
import {
  useAnnouncementForm,
  type AnnouncementItemLike,
} from "./announcement/useAnnouncementForm";

export type { AnnouncementItemLike };

export interface AnnouncementFormProps {
  initialData?: AnnouncementItemLike | null;
  onSave: (payload: FormData) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

export default function AnnouncementForm({
  initialData,
  onSave,
  onCancel,
  submitting = false,
}: AnnouncementFormProps) {
  const {
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
  } = useAnnouncementForm({
    initialData,
    onSave,
    onCancel,
    externalSubmitting: submitting,
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9FF] flex justify-center items-start text-[#2C2B30] font-sans select-none overflow-y-auto overflow-x-hidden py-4 md:py-8">
      {/* Decorative Blur Bubble */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-[#E9E4FF] rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-[#FFEBF0] rounded-full filter blur-3xl opacity-40"></div>
      </div>

      {/* Main Full-Screen Responsive Container */}
      <div className="w-full min-w-0 max-w-107.5 md:max-w-5xl lg:max-w-6xl xl:max-w-7xl min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)] my-auto flex flex-col justify-between px-4 sm:px-6 md:px-8 py-4 md:py-6 z-10 transition-all duration-300">
        <div className="w-full flex-1 flex flex-col">
          {/* Header */}
          <div className="w-full flex items-center justify-between gap-3 pb-4 border-b border-[#F0EDFF]/80 shrink-0">
            <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
              <button
                type="button"
                onClick={handleCancel}
                className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-2xl flex items-center justify-center shadow-xs border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:scale-95 hover:bg-[#FAF9FF] transition-all shrink-0"
                title="Kembali"
              >
                <FiArrowLeft size={20} />
              </button>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#9C98A6] font-bold truncate">
                  Panel Guru & Admin
                </p>
                <h1 className="text-base sm:text-lg md:text-2xl font-extrabold text-[#2C2B30] leading-tight mt-0.5 truncate">
                  {initialData ? "Edit Topik Diskusi" : "Buat Topik Diskusi Baru"}
                </h1>
              </div>
            </div>

            {/* Desktop Action Buttons in Header */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 bg-white text-[#9C98A6] hover:text-[#2C2B30] text-xs font-bold rounded-2xl border border-[#F0EDFF] shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || compressingImage}
                className="px-6 py-2.5 bg-[#8C66FF] hover:bg-[#7b55f0] text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-md shadow-purple-200 active:scale-95 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                <FiSave size={15} className="shrink-0" />
                <span>{isSubmitting ? "Menyimpan..." : "Simpan Topik Diskusi"}</span>
              </button>
            </div>
          </div>

          {/* Form Content Cards: 2-Column Responsive Desktop Grid */}
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 flex-1 items-start">
            {/* LEFT COLUMN: Metadata, Banner, & Task Info */}
            <div className="lg:col-span-5 space-y-5">
              {/* Judul Topik */}
              <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
                <label className="text-xs md:text-sm font-black text-[#2C2B30] block mb-1">
                  Judul Topik Diskusi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Analisis Kritis Masalah Pencemaran Air di Sungai Bengawan Solo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-3 bg-[#FAF9FF] border border-[#E9E6F5] rounded-xl md:rounded-2xl text-xs md:text-sm font-semibold text-[#2C2B30] focus:outline-none focus:border-[#8C66FF] focus:bg-white transition-colors"
                />
              </div>

              {/* Banner / Foto Sampul Topik */}
              <AnnouncementFormBanner
                imagePreviewUrl={imagePreviewUrl}
                selectedImageFile={selectedImageFile}
                compressingImage={compressingImage}
                onImageSelect={handleImageSelect}
                onRemoveImage={handleRemoveImage}
              />

              {/* Informasi Tugas */}
              <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
                <label className="text-xs md:text-sm font-black text-[#2C2B30] block mb-1">
                  📋 Informasi Tugas (Batas Waktu & Format)
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Batas pengumpulan: Jumat, 25 September 2026 pukul 23:59 WIB. Format: Ringkasan teks jawaban dan unggahan bagan/konsep."
                  value={taskInfo}
                  onChange={(e) => setTaskInfo(e.target.value)}
                  className="w-full p-3.5 bg-[#FAF9FF] border border-[#E9E6F5] rounded-xl md:rounded-2xl text-xs md:text-sm font-medium text-[#2C2B30] focus:outline-none focus:border-[#8C66FF] focus:bg-white transition-colors leading-relaxed"
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Problem Statement, Questions, Instructions */}
            <div className="lg:col-span-7 space-y-5">
              {/* Permasalahan Lingkungan */}
              <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
                <label className="text-xs md:text-sm font-black text-[#2C2B30] block mb-1">
                  📌 Soal / Permasalahan Lingkungan
                </label>
                <textarea
                  rows={4}
                  placeholder="Deskripsikan kasus atau permasalahan lingkungan yang dibahas secara mendalam..."
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="w-full p-3.5 bg-[#FAF9FF] border border-[#E9E6F5] rounded-xl md:rounded-2xl text-xs md:text-sm font-medium text-[#2C2B30] focus:outline-none focus:border-[#8C66FF] focus:bg-white transition-colors leading-relaxed"
                />
              </div>

              {/* Pertanyaan Analisis */}
              <AnnouncementQuestionList
                questions={questions}
                validQuestionsCount={validQuestionsCount}
                onAddQuestion={handleAddQuestion}
                onUpdateQuestion={handleUpdateQuestion}
                onRemoveQuestion={handleRemoveQuestion}
              />

              {/* Petunjuk Pengerjaan */}
              <AnnouncementInstructionList
                instructions={instructions}
                validInstructionsCount={validInstructionsCount}
                onAddInstruction={handleAddInstruction}
                onUpdateInstruction={handleUpdateInstruction}
                onRemoveInstruction={handleRemoveInstruction}
              />
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
              className="flex-1 sm:flex-initial sm:px-10 py-3 bg-[#8C66FF] hover:bg-[#7b55f0] text-white font-extrabold text-xs md:text-sm rounded-2xl shadow-md shadow-purple-200 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 min-w-0 whitespace-nowrap overflow-hidden"
            >
              <FiCheck size={16} className="shrink-0" />
              <span className="truncate">
                {isSubmitting ? "Menyimpan..." : "Simpan Topik Diskusi"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
