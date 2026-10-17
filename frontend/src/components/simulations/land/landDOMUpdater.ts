import type { RefObject } from "react";
import type { SimState } from "./types";
import type { Fish } from "./agents";

export interface LandDOMRefs {
  barPhRef: RefObject<HTMLDivElement | null>;
  barPhValRef: RefObject<HTMLSpanElement | null>;
  barSuburRef: RefObject<HTMLDivElement | null>;
  barSuburValRef: RefObject<HTMLSpanElement | null>;
  barAkarRef: RefObject<HTMLDivElement | null>;
  barAkarValRef: RefObject<HTMLSpanElement | null>;
  barRacunRef: RefObject<HTMLDivElement | null>;
  barRacunValRef: RefObject<HTMLSpanElement | null>;
  barPanenRef: RefObject<HTMLDivElement | null>;
  barPanenValRef: RefObject<HTMLSpanElement | null>;
  hudFishAliveRef: RefObject<HTMLSpanElement | null>;
  hudFishDeadRef: RefObject<HTMLSpanElement | null>;
  hudRootStatusRef: RefObject<HTMLSpanElement | null>;
  hudLeafStatusRef: RefObject<HTMLSpanElement | null>;
  txtWarnaRef: RefObject<HTMLSpanElement | null>;
  txtPerilakuRef: RefObject<HTMLSpanElement | null>;
  txtPanenRef: RefObject<HTMLSpanElement | null>;
  tanahStatusBadgeRef: RefObject<HTMLDivElement | null>;
}

export function updateLandDOMMeters(
  state: SimState,
  fishList: Fish[],
  refs: LandDOMRefs,
) {
  const pctPH = Math.min(100, Math.max(0, (state.pH / 14) * 100));
  if (refs.barPhRef.current) refs.barPhRef.current.style.height = `${pctPH}%`;
  if (refs.barSuburRef.current)
    refs.barSuburRef.current.style.height = `${Math.min(100, state.fertility)}%`;
  if (refs.barAkarRef.current)
    refs.barAkarRef.current.style.height = `${Math.min(100, state.rootHealth)}%`;
  if (refs.barRacunRef.current)
    refs.barRacunRef.current.style.height = `${Math.min(100, state.toxicity)}%`;
  if (refs.barPanenRef.current)
    refs.barPanenRef.current.style.height = `${Math.min(100, state.yield)}%`;

  if (refs.barPhValRef.current) {
    refs.barPhValRef.current.style.bottom = `calc(${pctPH}% + 4px)`;
    refs.barPhValRef.current.innerText = state.pH.toFixed(1);
  }
  if (refs.barSuburValRef.current) {
    refs.barSuburValRef.current.style.bottom = `calc(${Math.min(100, state.fertility)}% + 4px)`;
    refs.barSuburValRef.current.innerText = `${state.fertility.toFixed(0)}%`;
  }
  if (refs.barAkarValRef.current) {
    refs.barAkarValRef.current.style.bottom = `calc(${Math.min(100, state.rootHealth)}% + 4px)`;
    refs.barAkarValRef.current.innerText = `${state.rootHealth.toFixed(0)}%`;
  }
  if (refs.barRacunValRef.current) {
    refs.barRacunValRef.current.style.bottom = `calc(${Math.min(100, state.toxicity)}% + 4px)`;
    refs.barRacunValRef.current.innerText = `${state.toxicity.toFixed(0)}%`;
  }
  if (refs.barPanenValRef.current) {
    refs.barPanenValRef.current.style.bottom = `calc(${Math.min(100, state.yield)}% + 4px)`;
    refs.barPanenValRef.current.innerText = `${state.yield.toFixed(0)}%`;
  }

  const alive = fishList.filter((f) => f.state !== "dead").length;
  const dead = fishList.length - alive;
  if (refs.hudFishAliveRef.current) refs.hudFishAliveRef.current.innerText = String(alive);
  if (refs.hudFishDeadRef.current) refs.hudFishDeadRef.current.innerText = String(dead);

  if (refs.hudRootStatusRef.current && refs.hudLeafStatusRef.current) {
    if (state.rootHealth > 75) {
      refs.hudRootStatusRef.current.innerText = "Normal Sehat";
      refs.hudLeafStatusRef.current.innerText = "Segar Hijau";
      refs.hudLeafStatusRef.current.className = "font-mono font-bold text-emerald-600";
    } else if (state.rootHealth > 35) {
      refs.hudRootStatusRef.current.innerText = "Terganggu";
      refs.hudLeafStatusRef.current.innerText = "Mulai Layu";
      refs.hudLeafStatusRef.current.className = "font-mono font-bold text-amber-500 animate-pulse";
    } else {
      refs.hudRootStatusRef.current.innerText = "Membusuk";
      refs.hudLeafStatusRef.current.innerText = "Kering Mati";
      refs.hudLeafStatusRef.current.className = "font-mono font-bold text-rose-500";
    }
  }

  if (refs.txtWarnaRef.current) {
    if (state.toxicity < 15) {
      refs.txtWarnaRef.current.innerText = "Biru Jernih";
      refs.txtWarnaRef.current.className = "text-[10px] font-bold text-sky-600";
    } else if (state.toxicity < 50) {
      refs.txtWarnaRef.current.innerText = "Mulai Keruh";
      refs.txtWarnaRef.current.className = "text-[10px] font-bold text-slate-500";
    } else {
      refs.txtWarnaRef.current.innerText = "Limbah Pekat";
      refs.txtWarnaRef.current.className = "text-[10px] font-bold text-amber-800 animate-pulse";
    }
  }

  if (refs.txtPerilakuRef.current) {
    if (state.rootHealth > 75) {
      refs.txtPerilakuRef.current.innerText = "Tumbuh Normal";
      refs.txtPerilakuRef.current.className = "text-[10px] font-bold text-emerald-500";
    } else if (state.rootHealth > 35) {
      refs.txtPerilakuRef.current.innerText = "Pertumbuhan Terhenti";
      refs.txtPerilakuRef.current.className = "text-[10px] font-bold text-amber-500";
    } else {
      refs.txtPerilakuRef.current.innerText = "Akar Mati";
      refs.txtPerilakuRef.current.className = "text-[10px] font-bold text-red-600 font-extrabold";
    }
  }

  if (refs.txtPanenRef.current) {
    if (state.yield > 75) {
      refs.txtPanenRef.current.innerText = "Sangat Banyak";
      refs.txtPanenRef.current.className = "text-[10px] font-bold text-emerald-600";
    } else if (state.yield > 35) {
      refs.txtPanenRef.current.innerText = "Sedikit";
      refs.txtPanenRef.current.className = "text-[10px] font-bold text-amber-500";
    } else if (state.yield > 2) {
      refs.txtPanenRef.current.innerText = "Hampir Gagal";
      refs.txtPanenRef.current.className = "text-[10px] font-bold text-rose-400";
    } else {
      refs.txtPanenRef.current.innerText = "Gagal Panen";
      refs.txtPanenRef.current.className = "text-[10px] font-bold text-red-600 font-extrabold";
    }
  }

  if (refs.tanahStatusBadgeRef.current) {
    if (state.rootHealth > 70 && state.toxicity < 25) {
      refs.tanahStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Sehat Subur`;
      refs.tanahStatusBadgeRef.current.className =
        "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-emerald-100 text-emerald-700 border-emerald-200";
    } else if (state.rootHealth > 35 && state.toxicity < 60) {
      refs.tanahStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Degradasi`;
      refs.tanahStatusBadgeRef.current.className =
        "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-amber-100 text-amber-700 border-amber-200";
    } else {
      refs.tanahStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Krisis Rusak`;
      refs.tanahStatusBadgeRef.current.className =
        "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-red-100 text-red-700 border-red-200";
    }
  }
}
