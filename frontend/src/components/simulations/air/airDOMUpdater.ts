import type { RefObject } from "react";
import type { SimState } from "./types";
import type { Citizen } from "./agents";

export interface AirDOMRefs {
  barAqiRef: RefObject<HTMLDivElement | null>;
  barAqiValRef: RefObject<HTMLSpanElement | null>;
  barPm25Ref: RefObject<HTMLDivElement | null>;
  barPm25ValRef: RefObject<HTMLSpanElement | null>;
  barCo2Ref: RefObject<HTMLDivElement | null>;
  barCo2ValRef: RefObject<HTMLSpanElement | null>;
  barCoRef: RefObject<HTMLDivElement | null>;
  barCoValRef: RefObject<HTMLSpanElement | null>;
  barO2Ref: RefObject<HTMLDivElement | null>;
  barO2ValRef: RefObject<HTMLSpanElement | null>;
  hudHealthyRef: RefObject<HTMLSpanElement | null>;
  hudCoughingRef: RefObject<HTMLSpanElement | null>;
  hudSmogRef: RefObject<HTMLSpanElement | null>;
  hudMaskWarningRef: RefObject<HTMLDivElement | null>;
  txtWarnaRef: RefObject<HTMLSpanElement | null>;
  txtPerilakuRef: RefObject<HTMLSpanElement | null>;
  txtToksikRef: RefObject<HTMLSpanElement | null>;
  airStatusBadgeRef: RefObject<HTMLDivElement | null>;
  barHeightsRef: RefObject<{
    AQI: number;
    PM25: number;
    CO2: number;
    CO: number;
    O2: number;
  }>;
}

export function updateAirDOMMeters(
  state: SimState,
  citizens: Citizen[],
  refs: AirDOMRefs,
) {
  const pctAQI = Math.min(100, Math.max(0, (state.AQI / 400) * 100));
  const pctPM25 = Math.min(100, Math.max(0, (state.PM25 / 250) * 100));
  const pctCO2 = Math.min(100, Math.max(0, (state.CO2 / 1000) * 100));
  const pctCO = Math.min(100, Math.max(0, (state.CO / 50) * 100));
  const pctO2 = Math.min(100, Math.max(0, (state.O2 / 25) * 100));

  const bh = refs.barHeightsRef.current;
  const lerpSpeed = 1.0;
  bh.AQI += (pctAQI - bh.AQI) * lerpSpeed;
  bh.PM25 += (pctPM25 - bh.PM25) * lerpSpeed;
  bh.CO2 += (pctCO2 - bh.CO2) * lerpSpeed;
  bh.CO += (pctCO - bh.CO) * lerpSpeed;
  bh.O2 += (pctO2 - bh.O2) * lerpSpeed;

  if (refs.barAqiRef.current) refs.barAqiRef.current.style.height = `${bh.AQI}%`;
  if (refs.barPm25Ref.current) refs.barPm25Ref.current.style.height = `${bh.PM25}%`;
  if (refs.barCo2Ref.current) refs.barCo2Ref.current.style.height = `${bh.CO2}%`;
  if (refs.barCoRef.current) refs.barCoRef.current.style.height = `${bh.CO}%`;
  if (refs.barO2Ref.current) refs.barO2Ref.current.style.height = `${bh.O2}%`;

  if (refs.barAqiValRef.current) {
    refs.barAqiValRef.current.style.bottom = `calc(${bh.AQI}% + 4px)`;
    refs.barAqiValRef.current.innerText = state.AQI.toFixed(0);
  }
  if (refs.barPm25ValRef.current) {
    refs.barPm25ValRef.current.style.bottom = `calc(${bh.PM25}% + 4px)`;
    refs.barPm25ValRef.current.innerText = state.PM25.toFixed(1);
  }
  if (refs.barCo2ValRef.current) {
    refs.barCo2ValRef.current.style.bottom = `calc(${bh.CO2}% + 4px)`;
    refs.barCo2ValRef.current.innerText = state.CO2.toFixed(0);
  }
  if (refs.barCoValRef.current) {
    refs.barCoValRef.current.style.bottom = `calc(${bh.CO}% + 4px)`;
    refs.barCoValRef.current.innerText = state.CO.toFixed(1);
  }
  if (refs.barO2ValRef.current) {
    refs.barO2ValRef.current.style.bottom = `calc(${bh.O2}% + 4px)`;
    refs.barO2ValRef.current.innerText = `${state.O2.toFixed(1)}%`;
  }

  const coughingWarga = citizens.filter((c) => c.isCoughingNow).length;
  const healthyWarga = citizens.length - coughingWarga;
  if (refs.hudHealthyRef.current) refs.hudHealthyRef.current.innerText = String(healthyWarga);
  if (refs.hudCoughingRef.current) refs.hudCoughingRef.current.innerText = String(coughingWarga);
  if (refs.hudSmogRef.current) {
    refs.hudSmogRef.current.innerText = `${Math.min(100, (state.AQI / 400) * 100).toFixed(0)}%`;
  }

  if (refs.hudMaskWarningRef.current) {
    refs.hudMaskWarningRef.current.className = `absolute top-2 right-2 flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 text-[8px] px-1.5 py-0.5 rounded font-extrabold shadow-sm transition-all duration-300 ${
      state.AQI > 100 ? "opacity-100 scale-100" : "opacity-0 scale-90"
    }`;
  }

  if (refs.txtWarnaRef.current) {
    if (state.AQI < 50) {
      refs.txtWarnaRef.current.innerText = "Udara Bersih";
      refs.txtWarnaRef.current.className = "text-[10px] font-bold text-sky-600";
    } else if (state.AQI < 150) {
      refs.txtWarnaRef.current.innerText = "Kabut Ringan";
      refs.txtWarnaRef.current.className = "text-[10px] font-bold text-slate-500";
    } else {
      refs.txtWarnaRef.current.innerText = "Pekat dan Berbahaya";
      refs.txtWarnaRef.current.className = "text-[10px] font-bold text-amber-700 animate-pulse";
    }
  }

  if (refs.txtPerilakuRef.current) {
    if (coughingWarga === 0) {
      refs.txtPerilakuRef.current.innerText = "Normal Sehat";
      refs.txtPerilakuRef.current.className = "text-[10px] font-bold text-emerald-600";
    } else if (state.AQI > 250) {
      refs.txtPerilakuRef.current.innerText = "Banyak Batuk!";
      refs.txtPerilakuRef.current.className = "text-[10px] font-bold text-red-600 animate-bounce";
    } else {
      refs.txtPerilakuRef.current.innerText = "Batuk Ringan";
      refs.txtPerilakuRef.current.className = "text-[10px] font-bold text-amber-500";
    }
  }

  if (refs.txtToksikRef.current) {
    if (state.AQI < 100) {
      refs.txtToksikRef.current.innerText = "Aman";
      refs.txtToksikRef.current.className = "text-[10px] font-bold text-emerald-600";
    } else if (state.AQI < 200) {
      refs.txtToksikRef.current.innerText = "Waspada Masker";
      refs.txtToksikRef.current.className = "text-[10px] font-bold text-amber-500 font-extrabold";
    } else {
      refs.txtToksikRef.current.innerText = "Evakuasi Medis!";
      refs.txtToksikRef.current.className = "text-[10px] font-bold text-red-500 font-black animate-pulse";
    }
  }

  if (refs.airStatusBadgeRef.current) {
    if (state.AQI < 50) {
      refs.airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Sehat (Baik)`;
      refs.airStatusBadgeRef.current.className =
        "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-emerald-100 text-emerald-700 border-emerald-200";
    } else if (state.AQI < 150) {
      refs.airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Tidak Sehat`;
      refs.airStatusBadgeRef.current.className =
        "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-amber-100 text-amber-700 border-amber-200";
    } else {
      refs.airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Berbahaya!`;
      refs.airStatusBadgeRef.current.className =
        "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-red-100 text-red-700 border-red-200";
    }
  }
}
