import { type FormEvent } from "react";

interface GoogleClassModalProps {
  isOpen: boolean;
  inputKelas: string;
  isSubmitting: boolean;
  setInputKelas: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
}

export default function GoogleClassModal({
  isOpen,
  inputKelas,
  isSubmitting,
  setInputKelas,
  onClose,
  onSubmit,
}: GoogleClassModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-6 backdrop-blur-xs">
      <div className="w-full max-w-90 bg-white rounded-[28px] p-6 shadow-xl border border-[#F0EDFF] flex flex-col gap-4 text-left animate-none">
        <div>
          <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide uppercase">
            Satu Langkah Lagi!
          </h3>
          <p className="text-[10px] text-[#9C98A6] font-semibold mt-1">
            Silakan masukkan Kelas Anda untuk menyelesaikan pendaftaran dengan
            Google.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          translate="no"
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="modal-input-kelas"
              className="text-[9px] font-extrabold uppercase tracking-widest text-[#9C98A6] pl-1"
            >
              Kelas
            </label>
            <input
              id="modal-input-kelas"
              name="kelas"
              type="text"
              dir="ltr"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={inputKelas}
              onChange={(e) => setInputKelas(e.target.value)}
              placeholder="Contoh: XII MIPA 1"
              required
              className="w-full px-4 py-3.5 bg-[#F5F3FF] text-[#2C2B30] border-0 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#8C66FF] text-sm font-medium shadow-sm transition-none"
            />
          </div>

          <div className="flex gap-2.5 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#F5F3FF] text-[#9C98A6] font-extrabold uppercase tracking-wider text-[10px] rounded-full cursor-pointer hover:bg-neutral-100 transition-none"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#FF5E8C] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-pink-100 cursor-pointer disabled:opacity-50 transition-none"
            >
              {isSubmitting ? "Memproses..." : "Selesai"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
