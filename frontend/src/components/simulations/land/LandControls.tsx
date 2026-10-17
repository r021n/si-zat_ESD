import { FaSliders, FaLeaf, FaTrashCan, FaCloudShowersHeavy, FaFish, FaBroom } from "react-icons/fa6";
import type { TrashType } from "./types";

interface LandControlsProps {
  trashType: TrashType;
  jumlahSampah: number;
  hujan: number;
  onTrashTypeChange: (type: TrashType) => void;
  onJumlahChange: (val: number) => void;
  onHujanChange: (val: number) => void;
  onAddFish: () => void;
  onClear: () => void;
}

export default function LandControls({
  trashType,
  jumlahSampah,
  hujan,
  onTrashTypeChange,
  onJumlahChange,
  onHujanChange,
  onAddFish,
  onClear,
}: LandControlsProps) {
  return (
    <section className="col-span-3 bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between h-full overflow-y-auto">
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <FaSliders className="text-emerald-600" /> Sumber Cemaran
        </h2>

        {/* Jenis Sampah */}
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 block mb-1.5">
            JENIS SAMPAH
          </span>
          <div className="grid grid-cols-2 gap-1 bg-slate-200 p-0.5 rounded-md text-[10px] font-bold">
            <button
              onClick={() => onTrashTypeChange("organik")}
              className={`py-1 rounded flex justify-center items-center gap-1 transition-all cursor-pointer ${
                trashType === "organik"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-600 hover:bg-white/50"
              }`}
            >
              <FaLeaf className="text-[9px]" /> Organik
            </button>
            <button
              onClick={() => onTrashTypeChange("anorganik")}
              className={`py-1 rounded flex justify-center items-center gap-1 transition-all cursor-pointer ${
                trashType === "anorganik"
                  ? "bg-white text-rose-600 shadow-sm"
                  : "text-slate-600 hover:bg-white/50"
              }`}
            >
              <FaTrashCan className="text-[9px]" /> Non-Organik
            </button>
          </div>
        </div>

        {/* Volume Sampah */}
        <div
          className={`p-2 rounded-lg border transition-all duration-300 ${
            trashType === "anorganik"
              ? "bg-rose-50/70 border-rose-300"
              : "bg-slate-50 border-slate-100"
          }`}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-slate-500">
              JUMLAH SAMPAH
            </span>
            <span
              className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase ${
                trashType === "anorganik"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {jumlahSampah <= 33
                ? "Sedikit"
                : jumlahSampah <= 66
                ? "Sedang"
                : "Banyak"}
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Jumlah Sampah</span>
              <span className="font-mono font-bold">{jumlahSampah}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={jumlahSampah}
              onChange={(e) => onJumlahChange(Number(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Curah Hujan */}
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-[10px] font-bold text-sky-600 flex items-center gap-1 mb-1">
            <FaCloudShowersHeavy /> Curah Hujan (Aliran Air)
          </span>
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Aliran Air</span>
              <span className="font-mono font-bold text-sky-600">
                {hujan === 0
                  ? "Kering"
                  : hujan <= 3
                  ? "Gerimis"
                  : hujan <= 7
                  ? "Sedang"
                  : "Lebat"}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={hujan}
              onChange={(e) => onHujanChange(Number(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex gap-1.5 shrink-0">
        <button
          onClick={onAddFish}
          className="flex-1 py-1.5 bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-600 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 border border-sky-100 cursor-pointer"
        >
          <FaFish /> +5 Ikan
        </button>
        <button
          onClick={onClear}
          className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-600 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 border border-emerald-100 cursor-pointer"
        >
          <FaBroom /> Bersihkan
        </button>
      </div>
    </section>
  );
}
