import { FiX } from "react-icons/fi";

interface ZoomImageModalProps {
  imageUrl?: string | null;
  zoomImageUrl?: string | null;
  onClose: () => void;
}

export default function ZoomImageModal({
  imageUrl,
  zoomImageUrl,
  onClose,
}: ZoomImageModalProps) {
  const url = imageUrl || zoomImageUrl;
  if (!url) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
    >
      <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={url}
          alt="Lampiran Full"
          className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
        />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors"
        >
          <FiX size={16} />
        </button>
      </div>
    </div>
  );
}
