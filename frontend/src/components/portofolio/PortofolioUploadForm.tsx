import type { FormEvent, ChangeEvent } from "react";
import { FiPaperclip } from "react-icons/fi";
import { LuImage } from "react-icons/lu";

interface PortofolioUploadFormProps {
  title: string;
  onTitleChange: (val: string) => void;
  answer: string;
  onAnswerChange: (val: string) => void;
  fileName: string;
  compressing: boolean;
  originalSize: string;
  compressedSize: string;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

export default function PortofolioUploadForm({
  title,
  onTitleChange,
  answer,
  onAnswerChange,
  fileName,
  compressing,
  originalSize,
  compressedSize,
  onFileChange,
  onClearFile,
  onSubmit,
  onCancel,
}: PortofolioUploadFormProps) {
  return (
    <div className="w-full flex-1 flex flex-col gap-4 overflow-y-auto max-h-[72vh] pr-1 custom-scroll pb-4">
      <form
        onSubmit={onSubmit}
        className="w-full flex flex-col gap-4 bg-white border border-[#F0EDFF] rounded-3xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
      >
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#2C2B30] border-b border-[#F5F2FF] pb-2">
          Form Pengumpulan Tugas
        </h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase text-[#9C98A6]">Judul Tugas</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
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
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Tuliskan analisis Anda secara mendalam..."
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
              <span className="text-xs font-bold text-[#8C66FF]">Pilih File Gambar</span>
              <span className="text-[9px] text-[#9C98A6] mt-0.5 font-semibold">
                Maksimal 200 KB (Otomatis dikompres)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
                disabled={compressing}
              />
            </label>
          ) : (
            <div className="w-full border border-[#F0EDFF] bg-[#FAF9FF] rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 truncate flex-1">
                  <FiPaperclip className="text-[#8C66FF] shrink-0" />
                  <span className="text-xs font-bold truncate text-[#2C2B30]">{fileName}</span>
                </div>
                <button
                  type="button"
                  onClick={onClearFile}
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
                  Ukuran: {originalSize} &rarr; {compressedSize} (&lt; 200 KB)
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
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
  );
}
