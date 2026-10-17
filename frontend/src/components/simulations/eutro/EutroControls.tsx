import {
  FaSliders,
  FaWheatAwn,
  FaCloudRain,
  FaFish,
  FaBroom,
} from "react-icons/fa6";

interface EutroControlsProps {
  inputPupuk: number;
  inputHujan: number;
  onPupukChange: (val: number) => void;
  onHujanChange: (val: number) => void;
  onAddFish: () => void;
  onCleanLake: () => void;
}

export default function EutroControls({
  inputPupuk,
  inputHujan,
  onPupukChange,
  onHujanChange,
  onAddFish,
  onCleanLake,
}: EutroControlsProps) {
  return (
    <section className="col-span-3 bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between h-full overflow-y-auto">
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <FaSliders className="text-emerald-600" /> Sumber Nutrien (Pupuk)
        </h2>

        {/* Input Pupuk Pertanian */}
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1">
          <div className="flex justify-between items-center text-[10px]">
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <FaWheatAwn className="text-emerald-600" /> Dosis Pupuk (N & P)
            </span>
            <span className="font-mono font-bold text-emerald-700">
              {inputPupuk === 1 ? "Rendah" : inputPupuk === 2 ? "Sedang" : "Tinggi (Excess)"}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="1"
            value={inputPupuk}
            onChange={(e) => onPupukChange(Number(e.target.value))}
            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Curah Hujan (Runoff Erosi) */}
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1">
          <div className="flex justify-between items-center text-[10px]">
            <span className="font-bold text-sky-600 flex items-center gap-1">
              <FaCloudRain /> Curah Hujan (Limpasan)
            </span>
            <span className="font-mono font-bold text-sky-600">
              {inputHujan === 1 ? "Kering" : inputHujan === 2 ? "Gerimis" : "Lebat (Banjir)"}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="1"
            value={inputHujan}
            onChange={(e) => onHujanChange(Number(e.target.value))}
            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
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
          onClick={onCleanLake}
          className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-600 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 border border-emerald-100 cursor-pointer"
        >
          <FaBroom /> Bersihkan
        </button>
      </div>
    </section>
  );
}
