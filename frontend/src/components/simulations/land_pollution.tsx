import { useEffect, useRef, useState } from "react";
import { useLandscapeSimulation } from "../../hooks/useLandscapeSimulation";
import LandscapeOrientationFallback from "../common/LandscapeOrientationFallback";
import type { SimState, TrashType, WasteSprite } from "./land/types";
import { INITIAL_VALUES } from "./land/types";
import { Fish, type RainParticle, type SeepageParticle } from "./land/agents";
import { useLandSimulationLoop } from "./land/useLandSimulationLoop";
import LandHeader from "./land/LandHeader";
import LandControls from "./land/LandControls";
import LandHUD from "./land/LandHUD";
import LandMetricsPanel from "./land/LandMetricsPanel";
import LandLegendModal from "./land/LandLegendModal";

export default function SimulasiPencemaranTanah() {
  useLandscapeSimulation();

  // --- REACT CONTROL STATES ---
  const [running, setRunning] = useState<boolean>(false);
  const [trashType, setTrashType] = useState<TrashType>("organik");
  const [jumlahSampah, setJumlahSampah] = useState<number>(10);
  const [hujan, setHujan] = useState<number>(0);
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

  const barPhRef = useRef<HTMLDivElement | null>(null);
  const barPhValRef = useRef<HTMLSpanElement | null>(null);
  const barSuburRef = useRef<HTMLDivElement | null>(null);
  const barSuburValRef = useRef<HTMLSpanElement | null>(null);
  const barAkarRef = useRef<HTMLDivElement | null>(null);
  const barAkarValRef = useRef<HTMLSpanElement | null>(null);
  const barRacunRef = useRef<HTMLDivElement | null>(null);
  const barRacunValRef = useRef<HTMLSpanElement | null>(null);
  const barPanenRef = useRef<HTMLDivElement | null>(null);
  const barPanenValRef = useRef<HTMLSpanElement | null>(null);

  const hudRootStatusRef = useRef<HTMLSpanElement | null>(null);
  const hudLeafStatusRef = useRef<HTMLSpanElement | null>(null);
  const hudFishAliveRef = useRef<HTMLSpanElement | null>(null);
  const hudFishDeadRef = useRef<HTMLSpanElement | null>(null);

  const txtWarnaRef = useRef<HTMLSpanElement | null>(null);
  const txtPerilakuRef = useRef<HTMLSpanElement | null>(null);
  const txtPanenRef = useRef<HTMLSpanElement | null>(null);
  const tanahStatusBadgeRef = useRef<HTMLDivElement | null>(null);

  // --- ENGINE INTERNAL STATE REFS ---
  const simStateRef = useRef<SimState>({ ...INITIAL_VALUES });
  const simTimeRef = useRef<number>(0);
  const runningRef = useRef<boolean>(false);
  const inputsRef = useRef({ trashType, jumlahSampah, hujan });

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    inputsRef.current = { trashType, jumlahSampah, hujan };
  }, [trashType, jumlahSampah, hujan]);

  const fishArrayRef = useRef<Fish[]>([]);
  const rainParticlesRef = useRef<RainParticle[]>([]);
  const seepageParticlesRef = useRef<SeepageParticle[]>([]);
  const wasteSpritesRef = useRef<WasteSprite[]>([]);

  const generateWasteSprites = (
    width: number,
    type: TrashType,
    countValue: number,
  ) => {
    const sprites: WasteSprite[] = [];
    const count = Math.floor(countValue / 10);
    const listOrganik = ["apple", "banana", "leaf", "watermelon"];
    const listAnorganik = ["bottle", "can", "cup", "battery"];
    const currentList = type === "organik" ? listOrganik : listAnorganik;

    for (let i = 0; i < count; i++) {
      sprites.push({
        subtype: currentList[Math.floor(Math.random() * currentList.length)],
        x: Math.random() * (width * 0.45) + 20,
        y: 95 + Math.random() * 40,
        size: Math.random() * 6 + 18,
        rotation: (Math.random() - 0.5) * Math.PI * 0.6,
      });
    }
    wasteSpritesRef.current = sprites;
  };

  const populateSim = (width: number, height: number) => {
    const fish: Fish[] = [];
    for (let i = 0; i < 8; i++) fish.push(new Fish(width, height));
    fishArrayRef.current = fish;

    seepageParticlesRef.current = [];
    rainParticlesRef.current = [];
    generateWasteSprites(width, trashType, jumlahSampah);
  };

  // Wire simulation loop hook
  useLandSimulationLoop({
    canvasRef,
    simStateRef,
    simTimeRef,
    runningRef,
    inputsRef,
    fishArrayRef,
    rainParticlesRef,
    seepageParticlesRef,
    wasteSpritesRef,
    populateSim,
    barPhRef,
    barPhValRef,
    barSuburRef,
    barSuburValRef,
    barAkarRef,
    barAkarValRef,
    barRacunRef,
    barRacunValRef,
    barPanenRef,
    barPanenValRef,
    hudFishAliveRef,
    hudFishDeadRef,
    hudRootStatusRef,
    hudLeafStatusRef,
    txtWarnaRef,
    txtPerilakuRef,
    txtPanenRef,
    tanahStatusBadgeRef,
  });

  const triggerTrashChange = (type: TrashType) => {
    setTrashType(type);
    generateWasteSprites(canvasRef.current?.width || 500, type, jumlahSampah);
  };

  const handleJumlahChange = (value: number) => {
    setJumlahSampah(value);
    generateWasteSprites(canvasRef.current?.width || 500, trashType, value);
  };

  const handleReset = () => {
    setRunning(false);
    simTimeRef.current = 0;
    simStateRef.current = { ...INITIAL_VALUES };
    setTrashType("organik");
    setJumlahSampah(10);
    setHujan(0);

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

  const handleClear = () => {
    const state = simStateRef.current;
    state.toxicity = 0.0;
    state.rootHealth = 100.0;
    state.fertility = 80.0;
    state.pH = 7.0;
    seepageParticlesRef.current = [];
    rainParticlesRef.current = [];

    const canvas = canvasRef.current;
    if (canvas) {
      const regeneratedFish: Fish[] = [];
      for (let i = 0; i < fishArrayRef.current.length; i++) {
        regeneratedFish.push(new Fish(canvas.width, canvas.height));
      }
      fishArrayRef.current = regeneratedFish;
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 flex flex-col h-screen font-sans select-none overflow-hidden w-full">
      <LandHeader
        running={running}
        onToggleRunning={() => setRunning(!running)}
        onReset={handleReset}
      />

      <main className="flex-1 grid grid-cols-12 gap-2.5 p-2.5 overflow-hidden min-h-0">
        <LandControls
          trashType={trashType}
          jumlahSampah={jumlahSampah}
          hujan={hujan}
          onTrashTypeChange={triggerTrashChange}
          onJumlahChange={handleJumlahChange}
          onHujanChange={setHujan}
          onAddFish={handleAddFish}
          onClear={handleClear}
        />

        <LandHUD
          canvasRef={canvasRef}
          tanahStatusBadgeRef={tanahStatusBadgeRef}
          isHudExpanded={isHudExpanded}
          onOpenHud={openHud}
          onCloseHud={closeHud}
          hudRootStatusRef={hudRootStatusRef}
          hudLeafStatusRef={hudLeafStatusRef}
          hudFishAliveRef={hudFishAliveRef}
          hudFishDeadRef={hudFishDeadRef}
          txtWarnaRef={txtWarnaRef}
          txtPerilakuRef={txtPerilakuRef}
          txtPanenRef={txtPanenRef}
        />

        <LandMetricsPanel
          barPhRef={barPhRef}
          barPhValRef={barPhValRef}
          barSuburRef={barSuburRef}
          barSuburValRef={barSuburValRef}
          barAkarRef={barAkarRef}
          barAkarValRef={barAkarValRef}
          barRacunRef={barRacunRef}
          barRacunValRef={barRacunValRef}
          barPanenRef={barPanenRef}
          barPanenValRef={barPanenValRef}
          isLegendOpen={isLegendOpen}
          onToggleLegend={() => setIsLegendOpen(!isLegendOpen)}
        />

        <LandLegendModal
          isOpen={isLegendOpen}
          onClose={() => setIsLegendOpen(false)}
        />
      </main>

      <LandscapeOrientationFallback simulationTitle="eko-simulasi pencemaran tanah" />
    </div>
  );
}
