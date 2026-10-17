import {
  FaSliders,
  FaIndustry,
  FaHouseUser,
  FaWater,
  FaFish,
  FaBroom,
} from "react-icons/fa6";

interface WaterControlsProps {
  checkIndustri: boolean;
  slideIndustri: number;
  checkDomestik: boolean;
  slideDomestik: number;
  slideAliran: number;
  onToggleIndustri: () => void;
  onSlideIndustriChange: (val: number) => void;
  onToggleDomestik: () => void;
  onSlideDomestikChange: (val: number) => void;
  onSlideAliranChange: (val: number) => void;
  onAddFish: () => void;
  onPurifikasi: () => void;
}

export default function WaterControls({
  checkIndustri,
  slideIndustri,
  checkDomestik,
  slideDomestik,
  slideAliran,
  onToggleIndustri,
  onSlideIndustriChange,
  onToggleDomestik,
  onSlideDomestikChange,
  onSlideAliranChange,
  onAddFish,
  onPurifikasi,
}: WaterControlsProps) {
  return (
    <section className="col-span-3 bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between h-full overflow-y-auto">
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <FaSliders className="text-sky-600" /> Sumber Limbah
        </h2>

        {/* Limbah Industri */}
        <div
          className={`p-2 rounded-lg border transition-all ${
            checkIndustri
              ? "bg-rose-50/40 border-rose-200"
              : "bg-slate-50 border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={checkIndustri}
                onChange={onToggleIndustri}
                className="rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5 accent-rose-600 cursor-pointer"
              />
              <FaIndustry className="text-rose-500 text-xs" /> Limbah Industri
            </label>
            <span
              className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase ${
                checkIndustri
                  ? "bg-rose-100 text-rose-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {checkIndustri ? "Aktif" : "Mati"}
            </span>
          </div>
          {checkIndustri && (
            <div className="space-y-0.5 pt-1 border-t border-rose-100/50">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Debit</span>
                <span className="font-mono font-bold text-rose-600">
                  {slideIndustri} L/s
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={slideIndustri}
                onChange={(e) => onSlideIndustriChange(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          )}
        </div>

        {/* Limbah Domestik */}
        <div
          className={`p-2 rounded-lg border transition-all ${
            checkDomestik
              ? "bg-amber-50/40 border-amber-200"
              : "bg-slate-50 border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={checkDomestik}
                onChange={onToggleDomestik}
                className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 accent-amber-600 cursor-pointer"
              />
              <FaHouseUser className="text-amber-500 text-xs" /> Limbah Rumah Tangga
            </label>
            <span
              className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase ${
                checkDomestik
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {checkDomestik ? "Aktif" : "Mati"}
            </span>
          </div>
          {checkDomestik && (
            <div className="space-y-0.5 pt-1 border-t border-amber-100/50">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Debit</span>
                <span className="font-mono font-bold text-amber-600">
                  {slideDomestik} L/s
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={slideDomestik}
                onChange={(e) => onSlideDomestikChange(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          )}
        </div>

        {/* Aliran Sungai */}
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1">
          <div className="flex justify-between items-center text-[10px]">
            <span className="font-bold text-sky-600 flex items-center gap-1">
              <FaWater /> Kecepatan Aliran
            </span>
            <span className="font-mono font-bold text-sky-600">
              {slideAliran === 1 ? "Lambat" : slideAliran === 2 ? "Sedang" : "Cepat"}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            value={slideAliran}
            onChange={(e) => onSlideAliranChange(Number(e.target.value))}
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
          onClick={onPurifikasi}
          className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-600 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 border border-emerald-100 cursor-pointer"
        >
          <FaBroom /> Bersihkan
        </button>
      </div>
    </section>
  );
}
