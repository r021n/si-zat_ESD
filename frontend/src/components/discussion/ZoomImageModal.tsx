import { useState, useEffect } from "react";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface ZoomImageModalProps {
  imageUrl?: string | null;
  zoomImageUrl?: string | null;
  images?: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function ZoomImageModal({
  imageUrl,
  zoomImageUrl,
  images,
  initialIndex = 0,
  onClose,
}: ZoomImageModalProps) {
  const singleUrl = imageUrl || zoomImageUrl;
  const list = images && images.length > 0 ? images : singleUrl ? [singleUrl] : [];

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);

  useEffect(() => {
    if (initialIndex >= 0 && initialIndex < list.length) {
      setCurrentIndex(initialIndex);
    } else {
      setCurrentIndex(0);
    }
  }, [initialIndex, list.length]);

  useEffect(() => {
    if (!singleUrl) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && list.length > 1) {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
      } else if (e.key === "ArrowRight" && list.length > 1) {
        setCurrentIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [list.length, singleUrl, onClose]);

  if (!singleUrl || list.length === 0) return null;

  const currentUrl = list[currentIndex] || list[0];
  const hasMultiple = list.length > 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer select-none"
    >
      <div
        className="relative max-w-full max-h-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentUrl}
          alt={`Lampiran Full ${hasMultiple ? currentIndex + 1 : ""}`}
          className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl transition-transform"
        />

        {hasMultiple && (
          <div className="absolute bottom-3 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-xs">
            {currentIndex + 1} / {list.length}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/90 transition-colors shadow-md"
          title="Tutup (Esc)"
        >
          <FiX size={16} />
        </button>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/90 transition-colors shadow-md"
              title="Foto sebelumnya"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/90 transition-colors shadow-md"
              title="Foto berikutnya"
            >
              <FiChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
