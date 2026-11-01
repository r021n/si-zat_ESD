import type { ChangeEvent } from "react";
import { FiImage, FiPlus, FiX, FiEye } from "react-icons/fi";

export interface GalleryAttachmentItem {
  id: string;
  url: string;
  name?: string;
}

interface SubmissionImageGalleryProps {
  // Edit mode props
  isEditMode?: boolean;
  attachments?: GalleryAttachmentItem[];
  onRemoveAttachment?: (id: string) => void;
  onSelectFiles?: (e: ChangeEvent<HTMLInputElement>) => void;
  compressing?: boolean;
  compressionProgress?: string;
  maxFiles?: number;

  // View/Read-only mode props
  images?: GalleryAttachmentItem[];
  onZoomImage?: (url: string, index?: number, allUrls?: string[]) => void;
}

export default function SubmissionImageGallery({
  isEditMode = false,
  attachments = [],
  onRemoveAttachment,
  onSelectFiles,
  compressing = false,
  compressionProgress = "",
  maxFiles = 10,
  images = [],
  onZoomImage,
}: SubmissionImageGalleryProps) {
  // READ-ONLY / DISPLAY MODE
  if (!isEditMode) {
    if (!images || images.length === 0) return null;

    const allUrls = images.map((img) => img.url);

    return (
      <div className="space-y-1.5">
        {images.length > 1 && (
          <span className="text-[10px] font-bold text-[#8C66FF] block">
            {images.length} Lampiran Foto
          </span>
        )}
        <div className="flex flex-wrap gap-2">
          {images.map((img, index) => (
            <div
              key={img.id || index}
              onClick={() => onZoomImage?.(img.url, index, allUrls)}
              className="relative w-14 h-14 bg-white rounded-lg overflow-hidden border border-[#E2E8F0] cursor-pointer hover:opacity-80 transition-opacity group shrink-0"
              title={img.name || `Lampiran ${index + 1}`}
            >
              <img
                src={img.url}
                alt={img.name || `Lampiran ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <FiEye size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // EDIT / UPLOAD MODE
  const canAddMore = attachments.length < maxFiles;
  const allUrls = attachments.map((a) => a.url);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#524F5D]">
          Lampiran Foto ({attachments.length}/{maxFiles})
        </span>
        {compressing && (
          <span className="text-[11px] font-semibold text-[#8C66FF] animate-pulse">
            {compressionProgress || "Memproses kompresi..."}
          </span>
        )}
      </div>

      {attachments.length === 0 ? (
        <label
          className={`w-full py-2.5 px-3 border border-dashed rounded-xl flex items-center gap-2 transition-colors ${
            compressing
              ? "opacity-60 cursor-not-allowed border-[#DFDCF0] bg-[#FAF9FF]"
              : "border-[#DFDCF0] hover:border-[#8C66FF] cursor-pointer bg-[#FAF9FF]"
          }`}
        >
          <FiImage className="text-[#8C66FF]" size={16} />
          <span className="text-xs font-bold text-[#524F5D]">
            {compressing ? compressionProgress || "Memproses..." : `Lampirkan Foto (Maksimal ${maxFiles})`}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={compressing}
            onClick={(e) => {
              (e.target as HTMLInputElement).value = "";
            }}
            onChange={onSelectFiles}
            className="hidden"
          />
        </label>
      ) : (
        <div className="flex flex-wrap gap-2 items-center">
          {attachments.map((item, index) => (
            <div
              key={item.id}
              className="relative w-16 h-16 bg-[#F8FAFC] rounded-xl overflow-hidden border border-[#E2E8F0] shrink-0 group"
            >
              <img
                src={item.url}
                alt={item.name || `Preview ${index + 1}`}
                onClick={() => onZoomImage?.(item.url, index, allUrls)}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              />
              {onRemoveAttachment && (
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(item.id)}
                  disabled={compressing}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  title="Hapus foto ini"
                >
                  <FiX size={11} />
                </button>
              )}
            </div>
          ))}

          {canAddMore && (
            <label
              className={`w-16 h-16 border border-dashed border-[#DFDCF0] hover:border-[#8C66FF] rounded-xl flex flex-col items-center justify-center gap-1 bg-[#FAF9FF] transition-colors shrink-0 ${
                compressing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              title="Tambah foto lagi"
            >
              {compressing ? (
                <div className="w-4 h-4 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiPlus className="text-[#8C66FF]" size={18} />
                  <span className="text-[9px] font-bold text-[#8C66FF]">Tambah</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={compressing}
                onClick={(e) => {
                  (e.target as HTMLInputElement).value = "";
                }}
                onChange={onSelectFiles}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
