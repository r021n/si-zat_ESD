interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function LogoutModal({
  isOpen,
  onClose,
  onLogout,
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-6 backdrop-blur-xs">
      <div className="w-full max-w-85 bg-white rounded-[28px] p-6 shadow-xl border border-[#F0EDFF] flex flex-col gap-4 animate-none select-none text-left">
        <div>
          <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide uppercase">
            Keluar Sesi
          </h3>
          <p className="text-xs text-[#9C98A6] font-medium mt-2 leading-relaxed">
            Apakah Anda yakin ingin keluar dari aplikasi SiZat-ESD?
          </p>
        </div>
        <div className="flex gap-2.5 mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex-1 py-3 bg-[#FF5E8C] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-red-100 cursor-pointer transition-none flex items-center justify-center"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
