interface EnrollModalProps {
  isOpen: boolean;
  isEnrolled: boolean | null;
  enrollDeadline: string | null;
  enrollSuccess: boolean;
  enrollLoading: boolean;
  enrollError: string;
  enrollCode: string;
  setEnrollCode: (code: string) => void;
  onClose: () => void;
  onEnroll: () => void;
}

export default function EnrollModal({
  isOpen,
  isEnrolled,
  enrollDeadline,
  enrollSuccess,
  enrollLoading,
  enrollError,
  enrollCode,
  setEnrollCode,
  onClose,
  onEnroll,
}: EnrollModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-6 backdrop-blur-xs">
      <div className="w-full max-w-85 bg-white rounded-[28px] p-6 shadow-xl border border-[#F0EDFF] flex flex-col gap-4 animate-none select-none text-left">
        {enrollSuccess ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 bg-[#E6F8F6] text-[#2C8578] rounded-2xl flex items-center justify-center shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide uppercase">
                Enroll Berhasil!
              </h3>
              <p className="text-xs text-[#9C98A6] font-medium mt-2">
                Anda sekarang bisa mengakses materi, kuis, dan simulasi.
              </p>
            </div>
          </div>
        ) : isEnrolled === null ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-8 h-8 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#9C98A6] font-medium">Memuat data enrollment...</p>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide uppercase">
                Enroll
              </h3>
              <p className="text-xs text-[#9C98A6] font-medium mt-2 leading-relaxed">
                Masukkan kode enroll dari guru Anda untuk mengakses materi,
                kuis, dan simulasi.
              </p>
            </div>

            {enrollDeadline && (
              <div className="w-full bg-[#F0ECFF]/50 border border-[#F0EDFF] text-[#8C66FF] text-[10px] font-bold py-2.5 px-4 rounded-xl">
                Batas waktu:{" "}
                {new Date(enrollDeadline).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}

            {!enrollDeadline && (
              <div className="w-full bg-[#FFF9E6]/50 border border-[#FFF9E6] text-[#FFC107] text-[10px] font-bold py-2.5 px-4 rounded-xl">
                Belum ada kode enroll yang tersedia. Hubungi administrator.
              </div>
            )}

            {enrollError && (
              <div className="w-full bg-[#FFEBF0]/50 border border-[#FFEBF0] text-[#D95276] text-[10px] font-bold py-2.5 px-4 rounded-xl">
                {enrollError}
              </div>
            )}

            <input
              type="text"
              value={enrollCode}
              onChange={(e) => setEnrollCode(e.target.value.toUpperCase())}
              placeholder="Masukkan kode enroll"
              disabled={enrollLoading || !enrollDeadline}
              className="w-full py-3.5 px-4 bg-[#FAF9FF] border border-[#F0EDFF] rounded-xl text-sm font-bold text-[#2C2B30] placeholder:text-[#9C98A6]/50 focus:outline-none focus:ring-2 focus:ring-[#8C66FF]/30 focus:border-[#8C66FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center tracking-[0.3em] uppercase"
              maxLength={8}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !enrollLoading && enrollDeadline) {
                  onEnroll();
                }
              }}
            />

            <div className="flex gap-2.5 mt-1">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center"
              >
                Batal
              </button>
              <button
                onClick={onEnroll}
                disabled={
                  enrollLoading || !enrollDeadline || !enrollCode.trim()
                }
                className="flex-1 py-3 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {enrollLoading ? "Memverifikasi..." : "Enroll"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
