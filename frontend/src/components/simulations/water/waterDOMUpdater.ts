import type { RefObject } from "react";
import type { SimState } from "./types";
import type { Fish } from "./agents";

export interface WaterDOMRefs {
  barDoRef: RefObject<HTMLDivElement | null>;
  barDoValRef: RefObject<HTMLSpanElement | null>;
  barPhRef: RefObject<HTMLDivElement | null>;
  barPhValRef: RefObject<HTMLSpanElement | null>;
  barBodRef: RefObject<HTMLDivElement | null>;
  barBodValRef: RefObject<HTMLSpanElement | null>;
  barCodRef: RefObject<HTMLDivElement | null>;
  barCodValRef: RefObject<HTMLSpanElement | null>;
  barPolRef: RefObject<HTMLDivElement | null>;
  barPolValRef: RefObject<HTMLSpanElement | null>;
  hudFishRef: RefObject<HTMLSpanElement | null>;
  hudDeadFishRef: RefObject<HTMLSpanElement | null>;
  hudTransparencyRef: RefObject<HTMLSpanElement | null>;
  txtWarnaRef: RefObject<HTMLSpanElement | null>;
  txtPerilakuRef: RefObject<HTMLSpanElement | null>;
  txtToksikRef: RefObject<HTMLSpanElement | null>;
  airStatusBadgeRef: RefObject<HTMLDivElement | null>;
}

export function updateWaterDOMMeters(
  state: SimState,
  fishList: Fish[],
  refs: WaterDOMRefs,
) {
  const pctDO = Math.min(100, Math.max(0, (state.DO / 10) * 100));
  const pctPH = Math.min(100, Math.max(0, (state.pH / 14) * 100));
  const pctBOD = Math.min(100, Math.max(0, (state.BOD / 150) * 100));
  const pctCOD = Math.min(100, Math.max(0, (state.COD / 150) * 100));
  const pctPol = Math.min(100, Math.max(0, (state.pollutant / 100) * 100));

  if (refs.barDoRef.current) refs.barDoRef.current.style.height = `${pctDO}%`;
  if (refs.barPhRef.current) refs.barPhRef.current.style.height = `${pctPH}%`;
  if (refs.barBodRef.current) refs.barBodRef.current.style.height = `${pctBOD}%`;
  if (refs.barCodRef.current) refs.barCodRef.current.style.height = `${pctCOD}%`;
  if (refs.barPolRef.current) refs.barPolRef.current.style.height = `${pctPol}%`;

  if (refs.barDoValRef.current) {
    refs.barDoValRef.current.style.bottom = `calc(${pctDO}% + 4px)`;
    refs.barDoValRef.current.innerText = state.DO.toFixed(2);
  }
  if (refs.barPhValRef.current) {
    refs.barPhValRef.current.style.bottom = `calc(${pctPH}% + 4px)`;
    refs.barPhValRef.current.innerText = state.pH.toFixed(1);
  }
  if (refs.barBodValRef.current) {
    refs.barBodValRef.current.style.bottom = `calc(${pctBOD}% + 4px)`;
    refs.barBodValRef.current.innerText = state.BOD.toFixed(2);
  }
  if (refs.barCodValRef.current) {
    refs.barCodValRef.current.style.bottom = `calc(${pctCOD}% + 4px)`;
    refs.barCodValRef.current.innerText = state.COD.toFixed(2);
  }
  if (refs.barPolValRef.current) {
    refs.barPolValRef.current.style.bottom = `calc(${pctPol}% + 4px)`;
    refs.barPolValRef.current.innerText = state.pollutant.toFixed(2);
  }

  const aliveFish = fishList.filter((f) => f.state !== "dead").length;
  const deadFish = fishList.length - aliveFish;
  if (refs.hudFishRef.current) refs.hudFishRef.current.innerText = String(aliveFish);
  if (refs.hudDeadFishRef.current) refs.hudDeadFishRef.current.innerText = String(deadFish);

  const transparency = Math.max(0, 100 - state.pollutant * 1.3).toFixed(0);
  if (refs.hudTransparencyRef.current) {
    refs.hudTransparencyRef.current.innerText = `${transparency}%`;
  }

  if (refs.txtWarnaRef.current) {
    if (state.pollutant < 10) {
      refs.txtWarnaRef.current.innerText = "Jernih";
      refs.txtWarnaRef.current.className = "text-[10px] font-bold text-sky-600";
    } else if (state.pollutant < 40) {
      refs.txtWarnaRef.current.innerText = "Mulai Keruh";
      refs.txtWarnaRef.current.className = "text-[10px] font-bold text-slate-500";
    } else {
      refs.txtWarnaRef.current.innerText = "Sangat Keruh";
      refs.txtWarnaRef.current.className = "text-[10px] font-bold text-amber-700";
    }
  }

  if (refs.txtPerilakuRef.current) {
    if (aliveFish === 0) {
      refs.txtPerilakuRef.current.innerText = "Punah";
      refs.txtPerilakuRef.current.className = "text-[10px] font-bold text-red-600";
    } else if (state.DO >= 5.5 && state.pH >= 6.5) {
      refs.txtPerilakuRef.current.innerText = "Sehat Aktif";
      refs.txtPerilakuRef.current.className = "text-[10px] font-bold text-emerald-600";
    } else if (state.DO < 3.5 || state.pH < 5.5) {
      refs.txtPerilakuRef.current.innerText = "Lemas/Sekarat";
      refs.txtPerilakuRef.current.className = "text-[10px] font-bold text-red-400 animate-pulse";
    } else {
      refs.txtPerilakuRef.current.innerText = "Stres Ringan";
      refs.txtPerilakuRef.current.className = "text-[10px] font-bold text-amber-500";
    }
  }

  if (refs.txtToksikRef.current) {
    if (state.pollutant < 10) {
      refs.txtToksikRef.current.innerText = "Aman";
      refs.txtToksikRef.current.className = "text-[10px] font-bold text-emerald-600";
    } else if (state.pollutant < 45) {
      refs.txtToksikRef.current.innerText = "Sedang";
      refs.txtToksikRef.current.className = "text-[10px] font-bold text-amber-500";
    } else {
      refs.txtToksikRef.current.innerText = "Berbahaya";
      refs.txtToksikRef.current.className = "text-[10px] font-bold text-red-500 font-extrabold";
    }
  }

  if (refs.airStatusBadgeRef.current) {
    if (state.pollutant < 15 && state.DO > 6.0) {
      refs.airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Bersih`;
      refs.airStatusBadgeRef.current.className =
        "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-emerald-100 text-emerald-700 border-emerald-200";
    } else if (state.pollutant < 50 && state.DO > 4.0) {
      refs.airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Tercemar`;
      refs.airStatusBadgeRef.current.className =
        "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-amber-100 text-amber-700 border-amber-200";
    } else {
      refs.airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Kritis`;
      refs.airStatusBadgeRef.current.className =
        "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-red-100 text-red-700 border-red-200";
    }
  }
}
