import { useEffect, useRef, useState } from "react";
import { useLandscapeSimulation } from "../../hooks/useLandscapeSimulation";
import LandscapeOrientationFallback from "../common/LandscapeOrientationFallback";
import type { SimState } from "./water/types";
import { INITIAL_VALUES } from "./water/types";
import { Fish, OxygenBubble, type WasteParticle } from "./water/agents";
import { useWaterSimulationLoop } from "./water/useWaterSimulationLoop";
import WaterHeader from "./water/WaterHeader";
import WaterControls from "./water/WaterControls";
import WaterHUD from "./water/WaterHUD";
import WaterMetricsPanel from "./water/WaterMetricsPanel";
import WaterLegendModal from "./water/WaterLegendModal";

export default function SimulasiPencemaranAir() {
  useLandscapeSimulation();

  // --- STATE UNTUK KONTROL UI ---
  const [running, setRunning] = useState<boolean>(false);
  const [checkIndustri, setCheckIndustri] = useState<boolean>(false);
  const [slideIndustri, setSlideIndustri] = useState<number>(10);
  const [checkDomestik, setCheckDomestik] = useState<boolean>(false);
  const [slideDomestik, setSlideDomestik] = useState<number>(10);
  const [slideAliran, setSlideAliran] = useState<number>(1);
  const [isHudExpanded, setIsHudExpanded] = useState<boolean>(false);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);
  const hudTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openHud = () => {
    setIsHudExpanded(true);
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    hudTimerRef.current = setTimeout(() => {
      setIsHudExpanded(false);
    }, 5000);
  };

  const closeHud = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHudExpanded(false);
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
  };

  useEffect(() => {
    return () => {
      if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    };
  }, []);

  // --- REFS UNTUK ELEMENT DOM REAL-TIME (60 FPS) ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const barDoRef = useRef<HTMLDivElement | null>(null);
  const barDoValRef = useRef<HTMLSpanElement | null>(null);
  const barPhRef = useRef<HTMLDivElement | null>(null);
  const barPhValRef = useRef<HTMLSpanElement | null>(null);
  const barBodRef = useRef<HTMLDivElement | null>(null);
  const barBodValRef = useRef<HTMLSpanElement | null>(null);
  const barCodRef = useRef<HTMLDivElement | null>(null);
  const barCodValRef = useRef<HTMLSpanElement | null>(null);
  const barPolRef = useRef<HTMLDivElement | null>(null);
  const barPolValRef = useRef<HTMLSpanElement | null>(null);

  const hudFishRef = useRef<HTMLSpanElement | null>(null);
  const hudDeadFishRef = useRef<HTMLSpanElement | null>(null);
  const hudTransparencyRef = useRef<HTMLSpanElement | null>(null);

  const txtWarnaRef = useRef<HTMLSpanElement | null>(null);
  const txtPerilakuRef = useRef<HTMLSpanElement | null>(null);
  const txtToksikRef = useRef<HTMLSpanElement | null>(null);
  const airStatusBadgeRef = useRef<HTMLDivElement | null>(null);

  // --- REFS INTERNAL ENGINE ---
  const simStateRef = useRef<SimState>({ ...INITIAL_VALUES });
  const simTimeRef = useRef<number>(0);
  const runningRef = useRef<boolean>(false);

  const inputsRef = useRef({
    checkIndustri,
    slideIndustri,
    checkDomestik,
    slideDomestik,
    slideAliran,
  });

  const fishArrayRef = useRef<Fish[]>([]);
  const particlesArrayRef = useRef<WasteParticle[]>([]);
  const bubbleArrayRef = useRef<OxygenBubble[]>([]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    inputsRef.current = {
      checkIndustri,
      slideIndustri,
      checkDomestik,
      slideDomestik,
      slideAliran,
    };
  }, [checkIndustri, slideIndustri, checkDomestik, slideDomestik, slideAliran]);

  const populateSim = (width: number, height: number) => {
    const fish: Fish[] = [];
    for (let i = 0; i < 12; i++) fish.push(new Fish(width, height));
    fishArrayRef.current = fish;

    const bubbles: OxygenBubble[] = [];
    for (let i = 0; i < 20; i++) bubbles.push(new OxygenBubble(width, height));
    bubbleArrayRef.current = bubbles;

    particlesArrayRef.current = [];
  };

  useWaterSimulationLoop({
    canvasRef,
    simStateRef,
    simTimeRef,
    runningRef,
    inputsRef,
    fishArrayRef,
    particlesArrayRef,
    bubbleArrayRef,
    populateSim,
    barDoRef,
    barDoValRef,
    barPhRef,
    barPhValRef,
    barBodRef,
    barBodValRef,
    barCodRef,
    barCodValRef,
    barPolRef,
    barPolValRef,
    hudFishRef,
    hudDeadFishRef,
    hudTransparencyRef,
    txtWarnaRef,
    txtPerilakuRef,
    txtToksikRef,
    airStatusBadgeRef,
  });

  const handleReset = () => {
    setRunning(false);
    simTimeRef.current = 0;
    simStateRef.current = { ...INITIAL_VALUES };

    setCheckIndustri(false);
    setCheckDomestik(false);
    setSlideIndustri(10);
    setSlideDomestik(10);
    setSlideAliran(1);

    const canvas = canvasRef.current;
    if (canvas) populateSim(canvas.width, canvas.height);
  };

  const handleAddFish = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      for (let i = 0; i < 5; i++) {
        fishArrayRef.current.push(new Fish(canvas.width, canvas.height));
      }
    }
  };

  const handlePurifikasi = () => {
    setCheckIndustri(false);
    setCheckDomestik(false);
    simStateRef.current = { ...INITIAL_VALUES };
    particlesArrayRef.current = [];
  };

  return (
    <div className="bg-slate-50 text-slate-800 flex flex-col h-screen font-sans select-none overflow-hidden w-full">
      <WaterHeader
        running={running}
        onToggleRunning={() => setRunning(!running)}
        onReset={handleReset}
      />

      <main className="flex-1 grid grid-cols-12 gap-2.5 p-2.5 overflow-hidden min-h-0">
        <WaterControls
          checkIndustri={checkIndustri}
          slideIndustri={slideIndustri}
          checkDomestik={checkDomestik}
          slideDomestik={slideDomestik}
          slideAliran={slideAliran}
          onToggleIndustri={() => setCheckIndustri(!checkIndustri)}
          onSlideIndustriChange={setSlideIndustri}
          onToggleDomestik={() => setCheckDomestik(!checkDomestik)}
          onSlideDomestikChange={setSlideDomestik}
          onSlideAliranChange={setSlideAliran}
          onAddFish={handleAddFish}
          onPurifikasi={handlePurifikasi}
        />

        <WaterHUD
          canvasRef={canvasRef}
          airStatusBadgeRef={airStatusBadgeRef}
          isHudExpanded={isHudExpanded}
          onOpenHud={openHud}
          onCloseHud={closeHud}
          hudFishRef={hudFishRef}
          hudDeadFishRef={hudDeadFishRef}
          hudTransparencyRef={hudTransparencyRef}
          txtWarnaRef={txtWarnaRef}
          txtPerilakuRef={txtPerilakuRef}
          txtToksikRef={txtToksikRef}
        />

        <WaterMetricsPanel
          barDoRef={barDoRef}
          barDoValRef={barDoValRef}
          barPhRef={barPhRef}
          barPhValRef={barPhValRef}
          barBodRef={barBodRef}
          barBodValRef={barBodValRef}
          barCodRef={barCodRef}
          barCodValRef={barCodValRef}
          barPolRef={barPolRef}
          barPolValRef={barPolValRef}
          isLegendOpen={isLegendOpen}
          onToggleLegend={() => setIsLegendOpen(!isLegendOpen)}
        />

        <WaterLegendModal
          isOpen={isLegendOpen}
          onClose={() => setIsLegendOpen(false)}
        />
      </main>

      <LandscapeOrientationFallback simulationTitle="eko-simulasi pencemaran air" />
    </div>
  );
}
