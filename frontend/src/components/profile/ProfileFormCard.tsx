import { type FormEvent } from "react";

interface ProfileFormCardProps {
  nama: string;
  kelas: string;
  loading: boolean;
  message: { type: "success" | "error"; text: string } | null;
  setNama: (val: string) => void;
  setKelas: (val: string) => void;
  clearMessage: () => void;
  onSubmit: (e: FormEvent) => void;
}

export default function ProfileFormCard({
  nama,
  kelas,
  loading,
  message,
  setNama,
  setKelas,
  clearMessage,
  onSubmit,
}: ProfileFormCardProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full bg-white rounded-[28px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-4"
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6] mb-1">
        Perbarui Profil
      </p>

      {/* Custom Inline Alert Banner */}
      {message && (
        <div
          className={`p-4 border text-xs font-bold rounded-[20px] transition-none flex items-center gap-2 ${
            message.type === "success"
              ? "border-[#E6F8F6] bg-[#E6F8F6] text-[#2C8578]"
              : "border-[#FFEAEA] bg-[#FFEAEA] text-[#FF5E8C]"
          }`}
        >
          {message.type === "success" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Nama Lengkap Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
          Nama Lengkap
        </label>
        <input
          type="text"
          value={nama}
          onChange={(e) => {
            setNama(e.target.value);
            clearMessage();
          }}
          required
          className="w-full p-4 border border-[#F0EDFF] bg-[#FAF9FF] text-[#2C2B30] text-xs font-bold focus:outline-none focus:border-[#8C66FF] transition-none rounded-2xl"
        />
      </div>

      {/* Kelas Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
          Kelas
        </label>
        <input
          type="text"
          value={kelas}
          onChange={(e) => {
            setKelas(e.target.value);
            clearMessage();
          }}
          required
          className="w-full p-4 border border-[#F0EDFF] bg-[#FAF9FF] text-[#2C2B30] text-xs font-bold focus:outline-none focus:border-[#8C66FF] transition-none rounded-2xl"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-4 bg-linear-to-br from-[#8C66FF] to-[#6039DF] text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Menyimpan...</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            <span>Simpan Perubahan</span>
          </>
        )}
      </button>
    </form>
  );
}
