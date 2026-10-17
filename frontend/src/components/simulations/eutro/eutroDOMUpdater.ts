import type { RefObject } from "react";
import type { SimState } from "./types";
import type { Fish } from "./agents";

export interface EutroDOMRefs {
  barNutRef: RefObject<HTMLDivElement | null>;
  barNutValRef: RefObject<HTMLSpanElement | null>;
  barAlgRef: RefObject<HTMLDivElement | null>;
  barAlgValRef: RefObject<HTMLSpanElement | null>;
  barDoRef: RefObject<HTMLDivElement | null>;
  barDoValRef: RefObject<HTMLSpanElement | null>;
  barBodRef: RefObject<HTMLDivElement | null>;
  barBodValRef: RefObject<HTMLSpanElement | null>;
  hudFishAliveRef: RefObject<HTMLSpanElement | null>;
  hudFishDeadRef: RefObject<HTMLSpanElement | null>;
  hudTransparencyRef: RefObject<HTMLSpanElement | null>;
  txtWarnaRef: RefObject<HTMLSpanElement | null>;
  txtAlgaeStatusRef: RefObject<HTMLSpanElement | null>;
  txtBiotaStatusRef: RefObject<HTMLSpanElement | null>;
  airStatusBadgeRef: RefObject<HTMLDivElement | null>;
  bloomBannerRef: RefObject<HTMLDivElement | null>;
}

export function updateEutroDOMMeters(
  state: SimState,
  fishes: Fish[],
  refs: EutroDOMRefs,
) {
  const pctNut = Math.min(100, (state.nutrient / 25) * 100);
  const pctAlg = Math.min(100, state.algae);
  const pctDO = Math.min(100, (state.DO / 10) * 100);
  const pctBOD = Math.min(100, (state.BOD / 15) * 100);

  if (refs.barNutRef.current) refs.barNutRef.current.style.height = `${pctNut}%`;
  if (refs.barAlgRef.current) refs.barAlgRef.current.style.height = `${pctAlg}%`;
  if (refs.barDoRef.current) refs.barDoRef.current.style.height = `${pctDO}%`;
  if (refs.barBodRef.current) refs.barBodRef.current.style.height = `${pctBOD}%`;

  if (refs.barNutValRef.current) {
    refs.barNutValRef.current.style.bottom = `calc(${pctNut}% + 4px)`;
    refs.barNutValRef.current.innerText = `${state.nutrient.toFixed(1)} ppm`;
  }
  if (refs.barAlgValRef.current) {
    refs.barAlgValRef.current.style.bottom = `calc(${pctAlg}% + 4px)`;
    refs.barAlgValRef.current.innerText = `${state.algae.toFixed(0)}%`;
  }
  if (refs.barDoValRef.current) {
    refs.barDoValRef.current.style.bottom = `calc(${pctDO}% + 4px)`;
    refs.barDoValRef.current.innerText = `${state.DO.toFixed(1)} mg/L`;
  }
  if (refs.barBodValRef.current) {
    refs.barBodValRef.current.style.bottom = `calc(${pctBOD}% + 4px)`;
    refs.barBodValRef.current.innerText = `${state.BOD.toFixed(1)} mg/L`;
  }

  const aliveCount = fishes.filter((f) => f.state !== "dead").length;
  const deadCount = fishes.length - aliveCount;
  if (refs.hudFishAliveRef.current) refs.hudFishAliveRef.current.innerText = String(aliveCount);
  if (refs.hudFishDeadRef.current) refs.hudFishDeadRef.current.innerText = String(deadCount);

  const transparency = Math.max(0, 100 - state.algae * 0.95).toFixed(0);
  if (refs.hudTransparencyRef.current) {
    refs.hudTransparencyRef.current.innerText = `${transparency}%`;
  }

  if (refs.txtWarnaRef.current) {
    if (state.algae < 20) {
      refs.txtWarnaRef.current.innerText = "Biru Jernih";
      refs.txtWarnaRef.current.className = "text-[10px] font-bold text-sky-500";
    } else if (state.algae < 55) {
      refs.txtWarnaRef.current.innerText = "Hijau Muda Keruh";
      refs.txtWarnaRef.current.className = "text-[10px] font-bold text-emerald-400";
    } else {
      refs.txtWarnaRef.current.innerText = "Hijau Pekat (Busuk)";
      refs.txtWarnaRef.current.className = "text-[10px] font-bold text-emerald-700 font-extrabold";
    }
  }

  if (refs.txtAlgaeStatusRef.current && refs.bloomBannerRef.current) {
    if (state.algae < 25) {
      refs.txtAlgaeStatusRef.current.innerText = "Sangat Rendah";
      refs.txtAlgaeStatusRef.current.className = "text-[10px] font-bold text-slate-500";
      refs.bloomBannerRef.current.classList.add("hidden");
    } else if (state.algae < 60) {
      refs.txtAlgaeStatusRef.current.innerText = "Sedang (Tumbuh)";
      refs.txtAlgaeStatusRef.current.className = "text-[10px] font-bold text-amber-500";
      refs.bloomBannerRef.current.classList.add("hidden");
    } else {
      refs.txtAlgaeStatusRef.current.innerText = "Sangat Tinggi (Bloom)";
      refs.txtAlgaeStatusRef.current.className =
        "text-[10px] font-bold text-rose-500 font-extrabold animate-pulse";
      refs.bloomBannerRef.current.classList.remove("hidden");
    }
  }

  if (refs.txtBiotaStatusRef.current) {
    if (aliveCount === 0) {
      refs.txtBiotaStatusRef.current.innerText = "Seluruh Biota Mati";
      refs.txtBiotaStatusRef.current.className = "text-[10px] font-bold text-red-600 font-extrabold";
    } else if (state.DO >= 5.0) {
      refs.txtBiotaStatusRef.current.innerText = "Sehat & Aktif";
      refs.txtBiotaStatusRef.current.className = "text-[10px] font-bold text-emerald-600";
    } else if (state.DO >= 3.0) {
      refs.txtBiotaStatusRef.current.innerText = "Ikan Mulai Lemas";
      refs.txtBiotaStatusRef.current.className = "text-[10px] font-bold text-amber-500 animate-pulse";
    } else {
      refs.txtBiotaStatusRef.current.innerText = "Ikan Sekarat (Krisis)";
      refs.txtBiotaStatusRef.current.className =
        "text-[10px] font-bold text-rose-600 font-black animate-bounce";
    }
  }

  if (refs.airStatusBadgeRef.current) {
    if (state.algae < 15 && state.DO > 6.5) {
      refs.airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Oligotrofik (Sangat Sehat)`;
      refs.airStatusBadgeRef.current.className =
        "px-2.5 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200";
    } else if (state.algae < 50 && state.DO > 4.5) {
      refs.airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span> Mesotrofik (Sedang)`;
      refs.airStatusBadgeRef.current.className =
        "px-2.5 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200";
    } else if (state.DO > 2.5) {
      refs.airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span> Eutrofik (Tercemar Alga)`;
      refs.airStatusBadgeRef.current.className =
        "px-2.5 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-orange-50 text-orange-700 border-orange-200";
    } else {
      refs.airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> Hipertrofik (Kritis/Anoksia)`;
      refs.airStatusBadgeRef.current.className =
        "px-2.5 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-red-100 text-red-700 border-red-300";
    }
  }
}
