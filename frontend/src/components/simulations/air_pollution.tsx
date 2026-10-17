import { useEffect, useRef, useState } from "react";
import { useLandscapeSimulation } from "../../hooks/useLandscapeSimulation";
import LandscapeOrientationFallback from "../common/LandscapeOrientationFallback";
import type { SimState } from "./air/types";
import { INITIAL_VALUES } from "./air/types";
import { Citizen, Cloud, type SmokeParticle } from "./air/agents";
import { useAirSimulationLoop } from "./air/useAirSimulationLoop";
import AirHeader from "./air/AirHeader";
import AirControls from "./air/AirControls";
import AirHUD from "./air/AirHUD";
import AirMetricsPanel from "./air/AirMetricsPanel";
import AirLegendModal from "./air/AirLegendModal";

export default function SimulasiPencemaranUdara() {
  useLandscapeSimulation();

  // --- STATE KONTROL UI (REACT STATE) ---
  const [running, setRunning] = useState<boolean>(false);
  const [checkKendaraan, setCheckKendaraan] = useState<boolean>(false);
  const [checkPabrik, setCheckPabrik] = useState<boolean>(false);
  const [checkSampah, setCheckSampah] = useState<boolean>(false);
  const [slideAsap, setSlideAsap] = useState<number>(1);
  const [slideAngin, setSlideAngin] = useState<number>(1);
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

  const barAqiRef = useRef<HTMLDivElement | null>(null);
  const barAqiValRef = useRef<HTMLSpanElement | null>(null);
  const barPm25Ref = useRef<HTMLDivElement | null>(null);
  const barPm25ValRef = useRef<HTMLSpanElement | null>(null);
  const barCo2Ref = useRef<HTMLDivElement | null>(null);
  const barCo2ValRef = useRef<HTMLSpanElement | null>(null);
  const barCoRef = useRef<HTMLDivElement | null>(null);
  const barCoValRef = useRef<HTMLSpanElement | null>(null);
  const barO2Ref = useRef<HTMLDivElement | null>(null);
  const barO2ValRef = useRef<HTMLSpanElement | null>(null);

  const hudHealthyRef = useRef<HTMLSpanElement | null>(null);
  const hudCoughingRef = useRef<HTMLSpanElement | null>(null);
  const hudSmogRef = useRef<HTMLSpanElement | null>(null);
  const hudMaskWarningRef = useRef<HTMLDivElement | null>(null);

  const txtWarnaRef = useRef<HTMLSpanElement | null>(null);
  const txtPerilakuRef = useRef<HTMLSpanElement | null>(null);
  const txtToksikRef = useRef<HTMLSpanElement | null>(null);
  const airStatusBadgeRef = useRef<HTMLDivElement | null>(null);

  // --- ENGINE LOGIC REFS ---
  const simStateRef = useRef<SimState>({ ...INITIAL_VALUES });
  const barHeightsRef = useRef<{
    AQI: number;
    PM25: number;
    CO2: number;
    CO: number;
    O2: number;
  }>({
    AQI: (INITIAL_VALUES.AQI / 400) * 100,
    PM25: (INITIAL_VALUES.PM25 / 250) * 100,
    CO2: (INITIAL_VALUES.CO2 / 1000) * 100,
    CO: (INITIAL_VALUES.CO / 50) * 100,
    O2: (INITIAL_VALUES.O2 / 25) * 100,
  });
  const simTimeRef = useRef<number>(0);
  const runningRef = useRef<boolean>(false);
  const carXRef = useRef<number>(50);

  const inputsRef = useRef({
    checkKendaraan,
    checkPabrik,
    checkSampah,
    slideAsap,
    slideAngin,
  });

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    inputsRef.current = {
      checkKendaraan,
      checkPabrik,
      checkSampah,
      slideAsap,
      slideAngin,
    };
  }, [checkKendaraan, checkPabrik, checkSampah, slideAsap, slideAngin]);

  const citizenArrayRef = useRef<Citizen[]>([]);
  const cloudsArrayRef = useRef<Cloud[]>([]);
  const smokeParticlesRef = useRef<SmokeParticle[]>([]);

  const populateSim = (width: number, height: number) => {
    const citizens: Citizen[] = [];
    for (let i = 0; i < 10; i++) citizens.push(new Citizen(width, height));
    citizenArrayRef.current = citizens;

    const clouds: Cloud[] = [];
    for (let i = 0; i < 3; i++) clouds.push(new Cloud(width));
    cloudsArrayRef.current = clouds;

    smokeParticlesRef.current = [];
  };

  useAirSimulationLoop({
    canvasRef,
    simStateRef,
    simTimeRef,
    runningRef,
    carXRef,
    inputsRef,
    citizenArrayRef,
    cloudsArrayRef,
    smokeParticlesRef,
    populateSim,
    barAqiRef,
    barAqiValRef,
    barPm25Ref,
    barPm25ValRef,
    barCo2Ref,
    barCo2ValRef,
    barCoRef,
    barCoValRef,
    barO2Ref,
    barO2ValRef,
    hudHealthyRef,
    hudCoughingRef,
    hudSmogRef,
    hudMaskWarningRef,
    txtWarnaRef,
    txtPerilakuRef,
    txtToksikRef,
    airStatusBadgeRef,
    barHeightsRef,
  });

  const handleReset = () => {
    setRunning(false);
    simTimeRef.current = 0;
    carXRef.current = 50;
    simStateRef.current = { ...INITIAL_VALUES };
    barHeightsRef.current = {
      AQI: (INITIAL_VALUES.AQI / 400) * 100,
      PM25: (INITIAL_VALUES.PM25 / 250) * 100,
      CO2: (INITIAL_VALUES.CO2 / 1000) * 100,
      CO: (INITIAL_VALUES.CO / 50) * 100,
      O2: (INITIAL_VALUES.O2 / 25) * 100,
    };
    setCheckKendaraan(false);
    setCheckPabrik(false);
    setCheckSampah(false);
    setSlideAsap(1);
    setSlideAngin(1);

    const canvas = canvasRef.current;
    if (canvas) populateSim(canvas.width, canvas.height);
  };

  return (
    <div className="bg-slate-50 text-slate-800 flex flex-col h-screen font-sans select-none overflow-hidden w-full">
      <AirHeader
        running={running}
        onToggleRunning={() => setRunning(!running)}
        onReset={handleReset}
      />

      <main className="flex-1 grid grid-cols-12 gap-2.5 p-2.5 overflow-hidden min-h-0">
        <AirControls
          checkKendaraan={checkKendaraan}
          checkPabrik={checkPabrik}
          checkSampah={checkSampah}
          slideAsap={slideAsap}
          slideAngin={slideAngin}
          onToggleKendaraan={() => setCheckKendaraan(!checkKendaraan)}
          onTogglePabrik={() => setCheckPabrik(!checkPabrik)}
          onToggleSampah={() => setCheckSampah(!checkSampah)}
          onSlideAsapChange={setSlideAsap}
          onSlideAnginChange={setSlideAngin}
        />

        <AirHUD
          canvasRef={canvasRef}
          airStatusBadgeRef={airStatusBadgeRef}
          hudMaskWarningRef={hudMaskWarningRef}
          isHudExpanded={isHudExpanded}
          onOpenHud={openHud}
          onCloseHud={closeHud}
          hudHealthyRef={hudHealthyRef}
          hudCoughingRef={hudCoughingRef}
          hudSmogRef={hudSmogRef}
          txtWarnaRef={txtWarnaRef}
          txtPerilakuRef={txtPerilakuRef}
          txtToksikRef={txtToksikRef}
        />

        <AirMetricsPanel
          barAqiRef={barAqiRef}
          barAqiValRef={barAqiValRef}
          barPm25Ref={barPm25Ref}
          barPm25ValRef={barPm25ValRef}
          barCo2Ref={barCo2Ref}
          barCo2ValRef={barCo2ValRef}
          barCoRef={barCoRef}
          barCoValRef={barCoValRef}
          barO2Ref={barO2Ref}
          barO2ValRef={barO2ValRef}
          isLegendOpen={isLegendOpen}
          onToggleLegend={() => setIsLegendOpen(!isLegendOpen)}
        />

        <AirLegendModal
          isOpen={isLegendOpen}
          onClose={() => setIsLegendOpen(false)}
        />
      </main>

      <LandscapeOrientationFallback simulationTitle="eko-simulasi pencemaran udara" />
    </div>
  );
}
