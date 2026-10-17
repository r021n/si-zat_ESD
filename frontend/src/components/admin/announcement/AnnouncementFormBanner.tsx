import React, { useRef } from "react";
import { FiImage, FiUpload, FiTrash2 } from "react-icons/fi";

interface AnnouncementFormBannerProps {
  imagePreviewUrl: string;
  selectedImageFile: File | null;
  compressingImage: boolean;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export default function AnnouncementFormBanner({
  imagePreviewUrl,
  selectedImageFile,
  compressingImage,
  onImageSelect,
  onRemoveImage,
}: AnnouncementFormBannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-3">
      <div className="flex justify-between items-start gap-2 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs md:text-sm font-black text-[#2C2B30]">
              🖼️ Foto / Banner Sampul Topik
            </label>
            <span className="text-[10px] md:text-xs bg-[#F4F0FF] text-[#8C66FF] font-black px-2 py-0.5 rounded-full">
              Opsional
            </span>
          </div>
        </div>

        {imagePreviewUrl && (
          <button
            type="button"
            onClick={onRemoveImage}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-red-500 hover:bg-red-50 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-100 active:scale-95 shrink-0"
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
        onChange={onImageSelect}
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
              onClick={onRemoveImage}
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
  );
}
