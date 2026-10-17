import {
  FaSliders,
  FaCar,
  FaIndustry,
  FaFire,
  FaSmog,
  FaWind,
} from "react-icons/fa6";

interface AirControlsProps {
  checkKendaraan: boolean;
  checkPabrik: boolean;
  checkSampah: boolean;
  slideAsap: number;
  slideAngin: number;
  onToggleKendaraan: () => void;
  onTogglePabrik: () => void;
  onToggleSampah: () => void;
  onSlideAsapChange: (val: number) => void;
  onSlideAnginChange: (val: number) => void;
}

export default function AirControls({
  checkKendaraan,
  checkPabrik,
  checkSampah,
  slideAsap,
  slideAngin,
  onToggleKendaraan,
  onTogglePabrik,
  onToggleSampah,
  onSlideAsapChange,
  onSlideAnginChange,
}: AirControlsProps) {
  return (
    <section className="col-span-3 bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between h-full overflow-y-auto">
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <FaSliders className="text-sky-600" /> Sumber Emisi Udara
        </h2>

        {/* Checklist Sumber Emisi */}
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 block">
            AKTIVITAS PENGHASIL POLUSI
          </span>

          <label className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer text-[11px] font-medium text-slate-700">
            <input
              type="checkbox"
              checked={checkKendaraan}
              onChange={onToggleKendaraan}
              className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5 accent-sky-600 cursor-pointer"
            />
            <FaCar className="text-sky-500 text-xs" /> Lalu Lintas Kendaraan
          </label>

          <label className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer text-[11px] font-medium text-slate-700">
            <input
              type="checkbox"
              checked={checkPabrik}
              onChange={onTogglePabrik}
              className="rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5 accent-rose-600 cursor-pointer"
            />
            <FaIndustry className="text-rose-500 text-xs" /> Cerobong Pabrik
          </label>

          <label className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer text-[11px] font-medium text-slate-700">
            <input
              type="checkbox"
              checked={checkSampah}
              onChange={onToggleSampah}
              className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 accent-amber-600 cursor-pointer"
            />
            <FaFire className="text-amber-500 text-xs" /> Pembakaran Sampah
          </label>
        </div>

        {/* Slider Intensitas Asap */}
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1">
          <div className="flex justify-between items-center text-[10px]">
            <span className="font-bold text-slate-500 flex items-center gap-1">
              <FaSmog className="text-slate-600" /> Kepekatan Emisi
            </span>
            <span className="font-mono font-bold text-slate-700">
              {slideAsap === 1 ? "Sedikit" : slideAsap === 2 ? "Sedang" : "Pekat"}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="1"
            value={slideAsap}
            onChange={(e) => onSlideAsapChange(Number(e.target.value))}
            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
        </div>

        {/* Slider Kecepatan Angin */}
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1">
          <div className="flex justify-between items-center text-[10px]">
            <span className="font-bold text-sky-600 flex items-center gap-1">
              <FaWind /> Kecepatan Angin
            </span>
            <span className="font-mono font-bold text-sky-600">
              {slideAngin <= 3 ? "Tenang" : slideAngin <= 7 ? "Sedang" : "Kencang"}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={slideAngin}
            onChange={(e) => onSlideAnginChange(Number(e.target.value))}
            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>
      </div>
    </section>
  );
}
