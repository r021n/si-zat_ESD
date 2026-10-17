import { LuRefreshCw } from "react-icons/lu";

interface GenerateCodeCardProps {
  newDeadline: string;
  generating: boolean;
  setNewDeadline: (val: string) => void;
  onGenerate: () => void;
}

export default function GenerateCodeCard({
  newDeadline,
  generating,
  setNewDeadline,
  onGenerate,
}: GenerateCodeCardProps) {
  return (
    <div className="w-full bg-white rounded-[28px] p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 md:w-11 md:h-11 bg-[#F0ECFF] text-[#8C66FF] rounded-xl flex items-center justify-center shadow-inner">
          <LuRefreshCw size={20} />
        </div>
        <div>
          <h3 className="text-sm md:text-base font-extrabold text-[#2C2B30] tracking-wide">
            Generate Kode Baru
          </h3>
          <p className="text-[9px] md:text-xs text-[#9C98A6] font-medium mt-0.5">
            Kode lama akan ditimpa dan enrollment di-reset
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[9px] md:text-[10px] font-extrabold uppercase text-[#9C98A6]">
            Batas Waktu (Deadline)
          </label>
          <input
            type="datetime-local"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
            className="w-full bg-[#FAF9FF] border border-[#F0EDFF] rounded-xl px-3.5 py-3 text-xs font-bold outline-none focus:border-[#8C66FF] text-[#2C2B30] shadow-xs"
          />
        </div>

        <button
          onClick={onGenerate}
          disabled={generating || !newDeadline}
          className="w-full py-3.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-purple-100 cursor-pointer hover:bg-[#7b55f0] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <LuRefreshCw
            className={`text-sm ${generating ? "animate-spin" : ""}`}
          />
          <span>
            {generating ? "Membuat..." : "Generate Kode Baru"}
          </span>
        </button>
      </div>
    </div>
  );
}
