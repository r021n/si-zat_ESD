import { FiSave, FiTrash2, FiCheckCircle } from "react-icons/fi";

interface QuizKkmSettingCardProps {
  kkmActive: boolean;
  kkmValue: number | null;
  kkmSavedFlash: boolean;
  kkmError: string | null;
  belowKkmCount: number;
  kkmInput: string;
  onKkmInputChange: (val: string) => void;
  savingKkm: boolean;
  onSaveKkm: () => void;
  onClearKkm: () => void;
}

export default function QuizKkmSettingCard({
  kkmActive,
  kkmValue,
  kkmSavedFlash,
  kkmError,
  belowKkmCount,
  kkmInput,
  onKkmInputChange,
  savingKkm,
  onSaveKkm,
  onClearKkm,
}: QuizKkmSettingCardProps) {
  return (
    <div className="bg-white rounded-[20px] md:rounded-[24px] p-4 md:p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] flex flex-col md:flex-row md:items-center gap-3 md:gap-5 shrink-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
            KKM (Ketuntasan Minimal)
          </span>
          {kkmActive && (
            <span className="px-2.5 py-0.5 bg-[#F0ECFF] text-[#8C66FF] rounded-full text-[9px] md:text-[10px] font-black">
              KKM: {kkmValue}
            </span>
          )}
          {kkmSavedFlash && (
            <span className="px-2.5 py-0.5 bg-[#E6F8F6] text-[#2C8578] rounded-full text-[9px] md:text-[10px] font-black flex items-center gap-1">
              <FiCheckCircle size={11} /> Tersimpan
            </span>
          )}
        </div>
        <p className="text-[10px] md:text-xs text-[#9C98A6] font-semibold mt-1 leading-relaxed">
          Siswa dengan skor di bawah KKM akan diberi label "Di Bawah KKM" pada daftar nilai.
          {kkmActive && belowKkmCount > 0 && (
            <>
              {" "}
              <strong className="text-[#FF5E8C] font-extrabold">
                {belowKkmCount} siswa
              </strong>{" "}
              saat ini di bawah KKM.
            </>
          )}
        </p>
        {kkmError && (
          <p className="text-[10px] font-bold text-[#FF5E8C] mt-1.5">{kkmError}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="number"
          min={0}
          max={100}
          value={kkmInput}
          onChange={(e) => onKkmInputChange(e.target.value)}
          placeholder="70"
          className="w-20 md:w-24 border border-[#F0EDFF] bg-[#FAF9FF] text-[#2C2B30] px-3 py-2.5 text-sm md:text-base font-black rounded-xl outline-none text-center focus:border-[#8C66FF]"
        />
        <button
          onClick={onSaveKkm}
          disabled={savingKkm}
          className="px-4 py-2.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiSave size={13} />
          {savingKkm ? "Menyimpan..." : "Simpan"}
        </button>
        {kkmActive && (
          <button
            onClick={onClearKkm}
            disabled={savingKkm}
            title="Hapus KKM"
            className="px-3 py-2.5 bg-white border border-[#FFEAEA] text-[#FF5E8C] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiTrash2 size={13} />
            Hapus
          </button>
        )}
      </div>
    </div>
  );
}
