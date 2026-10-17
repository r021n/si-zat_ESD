import { useEffect, useRef, useState } from "react";
import { useLandscapeSimulation } from "../../hooks/useLandscapeSimulation";
import LandscapeOrientationFallback from "../common/LandscapeOrientationFallback";
import type { SimState } from "./eutro/types";
import { BASE_STATE } from "./eutro/types";
import { Fish, Rain, AlgaeBloomVisual, type RunoffParticle } from "./eutro/agents";
import { useEutroSimulationLoop } from "./eutro/useEutroSimulationLoop";
import EutroHeader from "./eutro/EutroHeader";
import EutroControls from "./eutro/EutroControls";
import EutroHUD from "./eutro/EutroHUD";
import EutroMetricsPanel from "./eutro/EutroMetricsPanel";
import EutroLegendModal from "./eutro/EutroLegendModal";

export default function SimulasiEutrofikasi() {
  useLandscapeSimulation();

  // --- STATE UNTUK KONTROL INTERFASE (REACT STATE) ---
  const [running, setRunning] = useState<boolean>(false);
  const [inputPupuk, setInputPupuk] = useState<number>(1);
  const [inputHujan, setInputHujan] = useState<number>(1);
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

  // --- REFS UNTUK ELEMEN DOM REAL-TIME (60 FPS) ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const barNutRef = useRef<HTMLDivElement | null>(null);
  const barNutValRef = useRef<HTMLSpanElement | null>(null);
  const barAlgRef = useRef<HTMLDivElement | null>(null);
  const barAlgValRef = useRef<HTMLSpanElement | null>(null);
  const barDoRef = useRef<HTMLDivElement | null>(null);
  const barDoValRef = useRef<HTMLSpanElement | null>(null);
  const barBodRef = useRef<HTMLDivElement | null>(null);
  const barBodValRef = useRef<HTMLSpanElement | null>(null);

  const hudFishAliveRef = useRef<HTMLSpanElement | null>(null);
  const hudFishDeadRef = useRef<HTMLSpanElement | null>(null);
  const hudTransparencyRef = useRef<HTMLSpanElement | null>(null);

  const txtWarnaRef = useRef<HTMLSpanElement | null>(null);
  const txtAlgaeStatusRef = useRef<HTMLSpanElement | null>(null);
  const txtBiotaStatusRef = useRef<HTMLSpanElement | null>(null);
  const airStatusBadgeRef = useRef<HTMLDivElement | null>(null);
  const bloomBannerRef = useRef<HTMLDivElement | null>(null);

  // --- REFS INTERNAL ENGINE SIMULASI ---
  const simStateRef = useRef<SimState>({ ...BASE_STATE });
  const simTimeRef = useRef<number>(0);
  const runningRef = useRef<boolean>(false);
  const inputsRef = useRef({ inputPupuk, inputHujan });

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    inputsRef.current = { inputPupuk, inputHujan };
  }, [inputPupuk, inputHujan]);

  const fishesRef = useRef<Fish[]>([]);
  const rainParticlesRef = useRef<Rain[]>([]);
  const runoffParticlesRef = useRef<RunoffParticle[]>([]);
  const algaeEntitiesRef = useRef<AlgaeBloomVisual[]>([]);

  const setupSimulationEntities = (width: number, height: number) => {
    const fList: Fish[] = [];
    for (let i = 0; i < 10; i++) fList.push(new Fish(width, height));
    fishesRef.current = fList;

    const rList: Rain[] = [];
    for (let i = 0; i < 50; i++) rList.push(new Rain(width, height));
    rainParticlesRef.current = rList;

    const aList: AlgaeBloomVisual[] = [];
    for (let i = 0; i < 120; i++) aList.push(new AlgaeBloomVisual());
    algaeEntitiesRef.current = aList;

    runoffParticlesRef.current = [];
  };

  useEutroSimulationLoop({
    canvasRef,
    simStateRef,
    simTimeRef,
    runningRef,
    inputsRef,
    fishesRef,
    rainParticlesRef,
    runoffParticlesRef,
    algaeEntitiesRef,
    setupSimulationEntities,
    barNutRef,
    barNutValRef,
    barAlgRef,
    barAlgValRef,
    barDoRef,
    barDoValRef,
    barBodRef,
    barBodValRef,
    hudFishAliveRef,
    hudFishDeadRef,
    hudTransparencyRef,
    txtWarnaRef,
    txtAlgaeStatusRef,
    txtBiotaStatusRef,
    airStatusBadgeRef,
    bloomBannerRef,
  });

  const handleReset = () => {
    setRunning(false);
    simTimeRef.current = 0;
    simStateRef.current = { ...BASE_STATE };
    setInputPupuk(1);
    setInputHujan(1);

    const canvas = canvasRef.current;
    if (canvas) setupSimulationEntities(canvas.width, canvas.height);
  };

  const handleAddFish = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      for (let i = 0; i < 5; i++) {
        fishesRef.current.push(new Fish(canvas.width, canvas.height));
      }
    }
  };

  const handleCleanLake = () => {
    simStateRef.current = { ...BASE_STATE };
    runoffParticlesRef.current = [];
    setInputPupuk(1);
    setInputHujan(1);
  };

  return (
    <div className="bg-slate-50 text-slate-800 flex flex-col h-screen font-sans select-none overflow-hidden w-full">
      <EutroHeader
        running={running}
        onToggleRunning={() => setRunning(!running)}
        onReset={handleReset}
      />

      <main className="flex-1 grid grid-cols-12 gap-2.5 p-2.5 overflow-hidden min-h-0">
        <EutroControls
          inputPupuk={inputPupuk}
          inputHujan={inputHujan}
          onPupukChange={setInputPupuk}
          onHujanChange={setInputHujan}
          onAddFish={handleAddFish}
          onCleanLake={handleCleanLake}
        />

        <EutroHUD
          canvasRef={canvasRef}
          airStatusBadgeRef={airStatusBadgeRef}
          bloomBannerRef={bloomBannerRef}
          isHudExpanded={isHudExpanded}
          onOpenHud={openHud}
          onCloseHud={closeHud}
          hudFishAliveRef={hudFishAliveRef}
          hudFishDeadRef={hudFishDeadRef}
          hudTransparencyRef={hudTransparencyRef}
          txtWarnaRef={txtWarnaRef}
          txtAlgaeStatusRef={txtAlgaeStatusRef}
          txtBiotaStatusRef={txtBiotaStatusRef}
        />

        <EutroMetricsPanel
          barNutRef={barNutRef}
          barNutValRef={barNutValRef}
          barAlgRef={barAlgRef}
          barAlgValRef={barAlgValRef}
          barDoRef={barDoRef}
          barDoValRef={barDoValRef}
          barBodRef={barBodRef}
          barBodValRef={barBodValRef}
          isLegendOpen={isLegendOpen}
          onToggleLegend={() => setIsLegendOpen(!isLegendOpen)}
        />

        <EutroLegendModal
          isOpen={isLegendOpen}
          onClose={() => setIsLegendOpen(false)}
        />
      </main>

      <LandscapeOrientationFallback simulationTitle="eko-simulasi eutrofikasi" />
    </div>
  );
}
