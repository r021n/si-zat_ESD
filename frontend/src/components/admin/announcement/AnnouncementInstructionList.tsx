import { FiPlus, FiTrash2 } from "react-icons/fi";

interface AnnouncementInstructionListProps {
  instructions: string[];
  validInstructionsCount: number;
  onAddInstruction: () => void;
  onUpdateInstruction: (index: number, val: string) => void;
  onRemoveInstruction: (index: number) => void;
}

export default function AnnouncementInstructionList({
  instructions,
  validInstructionsCount,
  onAddInstruction,
  onUpdateInstruction,
  onRemoveInstruction,
}: AnnouncementInstructionListProps) {
  return (
    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 border border-[#F0EDFF] shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-3">
      <div className="flex justify-between items-center gap-2 flex-wrap pb-2 border-b border-[#F0EDFF]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs md:text-sm font-black text-[#2C2B30]">
              💡 Petunjuk Pengerjaan
            </label>
            <span className="text-[10px] md:text-xs bg-[#ECFDF5] text-[#059669] font-black px-2.5 py-0.5 rounded-full">
              {validInstructionsCount} poin
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onAddInstruction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] font-bold text-xs rounded-xl transition-colors active:scale-95 cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
        >
          <FiPlus size={14} />
          <span>Tambah Poin</span>
        </button>
      </div>

      <div className="space-y-3 pt-1">
        {instructions.map((inst, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-3 bg-[#FAF9FF] border border-[#F0EDFF] rounded-2xl focus-within:border-[#059669] focus-within:bg-white transition-colors min-w-0"
          >
            <span className="w-7 h-7 rounded-xl bg-[#ECFDF5] text-[#059669] font-black text-sm flex items-center justify-center shrink-0 mt-0.5 border border-[#A7F3D0]/60 shadow-2xs">
              •
            </span>
            <textarea
              rows={2}
              placeholder={
                idx === 0
                  ? "Contoh: Gunakan data dari materi, hasil pengamatan simulasi, atau sumber ilmiah relevan."
                  : idx === 1
                    ? "Contoh: Berikan tanggapan aktif minimal 5 kata pada pendapat rekan sekelompok."
                    : `Tulis poin petunjuk pengerjaan ke-${idx + 1}...`
              }
              value={inst}
              onChange={(e) => onUpdateInstruction(idx, e.target.value)}
              className="flex-1 min-w-0 bg-transparent font-medium text-[#2C2B30] focus:outline-none leading-relaxed text-xs md:text-sm resize-none"
            />
            <button
              type="button"
              onClick={() => onRemoveInstruction(idx)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9C98A6] hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors shrink-0 mt-0.5 active:scale-90 cursor-pointer"
              title={
                instructions.length === 1 && idx === 0
                  ? "Kosongkan poin ini"
                  : "Hapus poin petunjuk ini"
              }
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {instructions.length > 0 && (
        <button
          type="button"
          onClick={onAddInstruction}
          className="w-full py-2.5 border border-dashed border-[#059669]/40 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#059669] font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98 mt-2"
        >
          <FiPlus size={14} />
          <span>Tambah Poin Petunjuk Baru</span>
        </button>
      )}
    </div>
  );
}
