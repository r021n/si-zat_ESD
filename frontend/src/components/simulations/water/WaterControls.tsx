import {
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

const formatBeban = (val: number) =>
  `${(val / 100).toFixed(2).replace(".", ",")} kg/hari`;

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
          <FaWater className="text-sky-600" /> SUMBER LIMBAH
        </h2>

        {/* Limbah Industri */}
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            checkIndustri
              ? "bg-rose-50/40 border-rose-200"
              : "bg-slate-50 border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={checkIndustri}
                onChange={onToggleIndustri}
                className="rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5 accent-rose-600 cursor-pointer"
              />
              <FaIndustry className="text-rose-500 text-xs" /> Limbah Industri (Batik)
            </label>
            <span
              className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                checkIndustri
                  ? "bg-rose-100 text-rose-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {checkIndustri ? "AKTIF" : "MATI"}
            </span>
          </div>

          {checkIndustri && (
            <div className="space-y-2 pt-0.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-medium text-slate-600">Beban Pencemaran</span>
                <span className="font-bold text-rose-600 text-sm">
                  {formatBeban(slideIndustri)}
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
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600 pt-0.5">
                <FaIndustry className="text-rose-500 text-xs shrink-0" />
                <span>
                  <strong className="font-bold text-slate-700">Contoh:</strong>{" "}
                  Zat warna sintetis dan sisa lilin.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Limbah Rumah Tangga */}
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            checkDomestik
              ? "bg-amber-50/40 border-amber-200"
              : "bg-slate-50 border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
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
              className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                checkDomestik
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {checkDomestik ? "AKTIF" : "MATI"}
            </span>
          </div>

          {checkDomestik && (
            <div className="space-y-2 pt-0.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-medium text-slate-600">Beban Pencemaran</span>
                <span className="font-bold text-amber-600 text-sm">
                  {formatBeban(slideDomestik)}
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
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600 pt-0.5">
                <FaHouseUser className="text-amber-500 text-xs shrink-0" />
                <span>
                  <strong className="font-bold text-slate-700">Contoh:</strong>{" "}
                  Detergen dan sisa makanan.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Aliran Sungai */}
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1">
          <div className="flex justify-between items-center text-[10px]">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <FaWater className="text-sky-600" /> Debit Aliran
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
