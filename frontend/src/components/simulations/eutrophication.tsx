import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import {
  FaWater,
  FaPlay,
  FaPause,
  FaArrowRotateLeft,
  FaSliders,
  FaSeedling,
  FaCloudShowersWater,
  FaFish,
  FaPumpMedical,
  FaBinoculars,
  FaChartLine,
  FaArrowLeft,
} from "react-icons/fa6";

// --- DEFINISI TYPE / INTERFACE ---
interface SimState {
  nutrient: number;
  algae: number;
  DO: number;
  BOD: number;
}

type FishState = "alive" | "struggling" | "dead";

const BASE_STATE: SimState = {
  nutrient: 2.0,
  algae: 10.0,
  DO: 8.0,
  BOD: 1.0,
};

export default function SimulasiEutrofikasi() {
  const navigate = useNavigate();

  // Dynamically lock orientation to landscape on mount and restore to portrait on unmount
  useEffect(() => {
    const lockOrientationAndReload = async () => {
      try {
        await ScreenOrientation.lock({ orientation: "landscape" });
      } catch (err) {
        console.warn("ScreenOrientation lock failed or not supported:", err);
      }

      const sessionKey = `refreshed-${window.location.hash}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, "true");
        setTimeout(() => {
          window.location.reload();
        }, 150);
      }
    };

    lockOrientationAndReload();

    return () => {
      const unlockOrientation = async () => {
        try {
          await ScreenOrientation.lock({ orientation: "portrait" });
        } catch {
          try {
            await ScreenOrientation.unlock();
          } catch (unlockErr) {
            console.warn(
              "ScreenOrientation unlock/portrait lock failed:",
              unlockErr,
            );
          }
        }
      };
      unlockOrientation();
    };
  }, []);

  // --- STATE UNTUK KONTROL INTERFASE (REACT STATE) ---
  const [running, setRunning] = useState<boolean>(false);
  const [inputPupuk, setInputPupuk] = useState<number>(1); // 1: Sedikit, 2: Sedang, 3: Banyak
  const [inputHujan, setInputHujan] = useState<number>(1); // 1: Rendah, 2: Sedang, 3: Tinggi
  const [isHudExpanded, setIsHudExpanded] = useState<boolean>(false);
  const hudTimerRef = useRef<any>(null);

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

  // --- REFS UNTUK ELEMEN DOM (Akses Cepat Real-Time Tanpa Re-Render) ---
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

  // Sinkronisasi state React ke reference agar loop animasi membaca data konfig terkini
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    inputsRef.current = { inputPupuk, inputHujan };
  }, [inputPupuk, inputHujan]);

  // Array kontainer entitas agen visual
  const fishesRef = useRef<Fish[]>([]);
  const rainParticlesRef = useRef<Rain[]>([]);
  const runoffParticlesRef = useRef<RunoffParticle[]>([]);
  const algaeEntitiesRef = useRef<AlgaeBloomVisual[]>([]);

  // --- KELAS ENTITAS / AGEN EKOLOGIS ---

  class Fish {
    x: number;
    y: number;
    size: number;
    vx: number;
    vy: number;
    colorHue: number;
    state: FishState;
    wiggle: number;
    wiggleSpeed: number;

    constructor(
      canvasWidth: number,
      canvasHeight: number,
      health: FishState = "alive",
    ) {
      this.x = Math.random() * (canvasWidth - 80) + 40;
      this.y = Math.random() * (canvasHeight - 60) + 40;
      this.size = Math.random() * 4 + 10;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.colorHue = Math.floor(Math.random() * 15) + 20;
      this.state = health;
      this.wiggle = Math.random() * 100;
      this.wiggleSpeed = 0.12;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(this.x, this.y);

      let angle = Math.atan2(this.vy, this.vx);
      if (this.state === "dead") {
        angle = Math.PI;
      }
      ctx.rotate(angle);

      this.wiggle += this.wiggleSpeed;
      const movementWiggle = Math.sin(this.wiggle) * 3;

      let bodyColor = `hsl(${this.colorHue}, 90%, 55%)`;
      let eyeColor = "#0f172a";
      if (this.state === "struggling") {
        bodyColor = `hsl(${this.colorHue}, 50%, 65%)`;
        this.wiggleSpeed = 0.25;
      } else if (this.state === "dead") {
        bodyColor = "#94a3b8";
        eyeColor = "#ef4444";
      }

      // Ekor
      ctx.beginPath();
      ctx.fillStyle = bodyColor;
      ctx.moveTo(-this.size, 0);
      ctx.lineTo(-this.size * 1.4, -this.size * 0.45 + movementWiggle);
      ctx.lineTo(-this.size * 1.25, 0);
      ctx.lineTo(-this.size * 1.4, this.size * 0.45 + movementWiggle);
      ctx.closePath();
      ctx.fill();

      // Tubuh
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mata
      ctx.beginPath();
      ctx.fillStyle = "#ffffff";
      ctx.arc(
        this.size * 0.45,
        -this.size * 0.15,
        this.size * 0.16,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = eyeColor;
      ctx.arc(
        this.size * 0.48,
        -this.size * 0.15,
        this.size * 0.08,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.restore();
    }

    update(waterDO: number, canvasWidth: number, canvasHeight: number) {
      if (waterDO < 3.5) {
        if (this.state === "alive") {
          this.state = "struggling";
        }
        const deathChance = (3.5 - waterDO) * 0.0008;
        if (Math.random() < deathChance) {
          this.state = "dead";
        }
      } else {
        if (this.state === "struggling") {
          this.state = "alive";
        }
      }

      if (this.state === "alive") {
        this.x += this.vx;
        this.y += this.vy;
        if (Math.random() < 0.01) {
          this.vx = (Math.random() - 0.5) * 1.6;
          this.vy = (Math.random() - 0.5) * 0.8;
        }
        if (this.x < 20) {
          this.x = 20;
          this.vx *= -1;
        }
        if (this.x > canvasWidth - 20) {
          this.x = canvasWidth - 20;
          this.vx *= -1;
        }
        if (this.y < 45) {
          this.y = 45;
          this.vy *= -1;
        }
        if (this.y > canvasHeight - 20) {
          this.y = canvasHeight - 20;
          this.vy *= -1;
        }
      } else if (this.state === "struggling") {
        this.x += this.vx * 1.3;
        this.y += this.vy * 1.3;
        if (this.y > 55) this.vy -= 0.02;
        if (Math.random() < 0.04) {
          this.vx = (Math.random() - 0.5) * 1.5;
          this.vy = (Math.random() - 0.5) * 0.8;
        }
        if (this.x < 20) {
          this.x = 20;
          this.vx *= -1;
        }
        if (this.x > canvasWidth - 20) {
          this.x = canvasWidth - 20;
          this.vx *= -1;
        }
        if (this.y < 35) {
          this.y = 35;
          this.vy = 0.2;
        }
        if (this.y > canvasHeight - 20) {
          this.y = canvasHeight - 20;
          this.vy = -0.2;
        }
      } else if (this.state === "dead") {
        if (this.y > 32) {
          this.y -= 0.3;
          this.x += (Math.random() - 0.5) * 0.1;
        } else {
          this.y = 32 + Math.sin(simTimeRef.current * 0.05 + this.x) * 1.0;
          this.x += Math.sin(simTimeRef.current * 0.02) * 0.05;
        }
        if (this.x < 15) this.x = 15;
        if (this.x > canvasWidth - 15) this.x = canvasWidth - 15;
      }
    }
  }

  class Rain {
    x: number;
    y: number;
    length: number;
    speed: number;
    alpha: number;
    canvasWidth: number;
    canvasHeight: number;

    constructor(canvasWidth: number, canvasHeight: number) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.x = Math.random() * canvasWidth;
      this.y = -10;
      this.length = Math.random() * 8 + 8;
      this.speed = Math.random() * 5 + 10;
      this.alpha = Math.random() * 0.3 + 0.2;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = `rgba(14, 165, 233, ${this.alpha})`;
      ctx.lineWidth = 1;
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - 1, this.y + this.length);
      ctx.stroke();
      ctx.restore();
    }

    update(intensity: number) {
      this.y += this.speed * (0.6 + intensity * 0.2);
      this.x -= 0.5;
      if (this.y > this.canvasHeight) {
        this.y = -10;
        this.x = Math.random() * this.canvasWidth;
      }
    }
  }

  class RunoffParticle {
    x: number;
    y: number;
    size: number;
    color: string;
    vx: number;
    vy: number;
    alpha: number;
    decay: number;

    constructor(fertilizerLevel: number) {
      this.x = 40;
      this.y = 20;
      this.size = Math.random() * 2 + 1.5;
      this.color = `rgba(${Math.floor(Math.random() * 40 + 190)}, ${Math.floor(
        Math.random() * 30 + 150,
      )}, 60, ${Math.random() * 0.4 + 0.4})`;
      this.vx = (Math.random() * 0.8 + 0.3) * (fertilizerLevel * 0.7);
      this.vy = (Math.random() * 1.0 + 0.5) * (fertilizerLevel * 0.7);
      this.alpha = 1.0;
      this.decay = Math.random() * 0.005 + 0.003;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.03;
      if (this.y > 35) {
        this.alpha -= this.decay;
      }
    }
  }

  class AlgaeBloomVisual {
    xPercent: number;
    yPercent: number;
    size: number;
    wobble: number;

    constructor() {
      this.xPercent = Math.random();
      this.yPercent = Math.random();
      this.size = Math.random() * 8 + 4;
      this.wobble = Math.random() * 10;
    }

    draw(
      ctx: CanvasRenderingContext2D,
      algaeDensity: number,
      canvasWidth: number,
    ) {
      const strength = Math.min(0.9, algaeDensity / 100);
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = `rgba(16, 185, 129, ${strength * 0.55})`;
      this.wobble += 0.015;
      const dynamicSize = this.size + Math.sin(this.wobble) * 2;

      const posX = this.xPercent * canvasWidth;
      const posY = 35 + this.yPercent * 30;

      ctx.arc(
        posX,
        posY + Math.sin(this.wobble) * 1.5,
        dynamicSize,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }
  }

  // Pengisi data agen awal
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

  // --- ENGINE ENGINE LOGIC LOOP (EFFECT UTAMA) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        if (fishesRef.current.length === 0) {
          setupSimulationEntities(canvas.width, canvas.height);
        } else {
          for (const fish of fishesRef.current) {
            if (fish.x > canvas.width - 20) fish.x = canvas.width - 20;
            if (fish.y > canvas.height - 20) fish.y = canvas.height - 20;
          }
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    let animationFrameId: number;

    const loop = () => {
      simTimeRef.current++;
      const state = simStateRef.current;

      if (runningRef.current) {
        const { inputPupuk, inputHujan } = inputsRef.current;

        // 1. Perhitungan Diferensial Runoff Nutrien
        let runoffFactor = inputPupuk * (inputHujan * 0.8);
        if (inputHujan === 1) runoffFactor *= 0.15;

        const nutrientInflow = runoffFactor * 0.035;
        const nutrientWashout = state.nutrient * (0.01 + inputHujan * 0.005);
        const dNutrient =
          nutrientInflow - nutrientWashout - state.algae * 0.001;
        state.nutrient = Math.max(0.1, state.nutrient + dNutrient);

        // 2. Kinetika Pertumbuhan Alga (Monod Kinetics)
        const maxAlgaeGrowthRate = 0.038;
        const halfSaturationConstant = 5.0;
        const algaeGrowth =
          state.algae *
          (state.nutrient / (state.nutrient + halfSaturationConstant)) *
          maxAlgaeGrowthRate;
        const algaeDeathRate = 0.015;
        const algaeDeath = state.algae * algaeDeathRate;
        const dAlgae = algaeGrowth - algaeDeath;
        state.algae = Math.max(1.0, Math.min(100.0, state.algae + dAlgae));

        // 3. Biochemical Oxygen Demand (BOD)
        const organicDecompBOD = algaeDeath * 0.35;
        const naturalBODDecay = state.BOD * 0.025;
        const dBOD = organicDecompBOD - naturalBODDecay;
        state.BOD = Math.max(0.5, Math.min(20.0, state.BOD + dBOD));

        // 4. Oksigen Terlarut Danau (DO)
        const aerationRate = 0.012 * (1.0 + inputHujan * 0.15);
        const oxygenAeration = aerationRate * (8.5 - state.DO);

        const photosynthesisO2 =
          state.algae < 45
            ? state.algae * 0.018
            : 45 * 0.018 - (state.algae - 45) * 0.012;

        const bacterialO2Consumption = state.BOD * 0.09;
        const fishO2Consumption =
          fishesRef.current.filter((f) => f.state !== "dead").length * 0.002;
        const dDO =
          oxygenAeration +
          photosynthesisO2 -
          bacterialO2Consumption -
          fishO2Consumption;
        state.DO = Math.max(0.1, Math.min(9.5, state.DO + dDO));

        // Pemicu Partikel Runoff Visual Sawah
        if (inputHujan > 1 && Math.random() < inputPupuk * 0.3) {
          runoffParticlesRef.current.push(new RunoffParticle(inputPupuk));
        }
      }

      // --- UPDATE GRAFIK & DATA HUD LANGSUNG (60 FPS PERFORMANCE BYPASS) ---
      const pctNut = Math.min(100, (state.nutrient / 25) * 100);
      const pctAlg = Math.min(100, state.algae);
      const pctDO = Math.min(100, (state.DO / 10) * 100);
      const pctBOD = Math.min(100, (state.BOD / 15) * 100);

      if (barNutRef.current) barNutRef.current.style.height = `${pctNut}%`;
      if (barAlgRef.current) barAlgRef.current.style.height = `${pctAlg}%`;
      if (barDoRef.current) barDoRef.current.style.height = `${pctDO}%`;
      if (barBodRef.current) barBodRef.current.style.height = `${pctBOD}%`;

      if (barNutValRef.current) {
        barNutValRef.current.style.bottom = `calc(${pctNut}% + 4px)`;
        barNutValRef.current.innerText = `${state.nutrient.toFixed(1)} ppm`;
      }
      if (barAlgValRef.current) {
        barAlgValRef.current.style.bottom = `calc(${pctAlg}% + 4px)`;
        barAlgValRef.current.innerText = `${state.algae.toFixed(0)}%`;
      }
      if (barDoValRef.current) {
        barDoValRef.current.style.bottom = `calc(${pctDO}% + 4px)`;
        barDoValRef.current.innerText = `${state.DO.toFixed(1)} mg/L`;
      }
      if (barBodValRef.current) {
        barBodValRef.current.style.bottom = `calc(${pctBOD}% + 4px)`;
        barBodValRef.current.innerText = `${state.BOD.toFixed(1)} mg/L`;
      }

      const aliveCount = fishesRef.current.filter(
        (f) => f.state !== "dead",
      ).length;
      const deadCount = fishesRef.current.length - aliveCount;
      if (hudFishAliveRef.current)
        hudFishAliveRef.current.innerText = String(aliveCount);
      if (hudFishDeadRef.current)
        hudFishDeadRef.current.innerText = String(deadCount);

      const transparency = Math.max(0, 100 - state.algae * 0.95).toFixed(0);
      if (hudTransparencyRef.current)
        hudTransparencyRef.current.innerText = `${transparency}%`;

      if (txtWarnaRef.current) {
        if (state.algae < 20) {
          txtWarnaRef.current.innerText = "Biru Jernih";
          txtWarnaRef.current.className = "text-[10px] font-bold text-sky-500";
        } else if (state.algae < 55) {
          txtWarnaRef.current.innerText = "Hijau Muda Keruh";
          txtWarnaRef.current.className =
            "text-[10px] font-bold text-emerald-400";
        } else {
          txtWarnaRef.current.innerText = "Hijau Pekat (Busuk)";
          txtWarnaRef.current.className =
            "text-[10px] font-bold text-emerald-700 font-extrabold";
        }
      }

      if (txtAlgaeStatusRef.current && bloomBannerRef.current) {
        if (state.algae < 25) {
          txtAlgaeStatusRef.current.innerText = "Sangat Rendah";
          txtAlgaeStatusRef.current.className =
            "text-[10px] font-bold text-slate-500";
          bloomBannerRef.current.classList.add("hidden");
        } else if (state.algae < 60) {
          txtAlgaeStatusRef.current.innerText = "Sedang (Tumbuh)";
          txtAlgaeStatusRef.current.className =
            "text-[10px] font-bold text-amber-500";
          bloomBannerRef.current.classList.add("hidden");
        } else {
          txtAlgaeStatusRef.current.innerText = "Sangat Tinggi (Bloom)";
          txtAlgaeStatusRef.current.className =
            "text-[10px] font-bold text-rose-500 font-extrabold animate-pulse";
          bloomBannerRef.current.classList.remove("hidden");
        }
      }

      if (txtBiotaStatusRef.current) {
        if (aliveCount === 0) {
          txtBiotaStatusRef.current.innerText = "Seluruh Biota Mati";
          txtBiotaStatusRef.current.className =
            "text-[10px] font-bold text-red-600 font-extrabold";
        } else if (state.DO >= 5.0) {
          txtBiotaStatusRef.current.innerText = "Sehat & Aktif";
          txtBiotaStatusRef.current.className =
            "text-[10px] font-bold text-emerald-600";
        } else if (state.DO >= 3.0) {
          txtBiotaStatusRef.current.innerText = "Ikan Mulai Lemas";
          txtBiotaStatusRef.current.className =
            "text-[10px] font-bold text-amber-500 animate-pulse";
        } else {
          txtBiotaStatusRef.current.innerText = "Ikan Sekarat (Krisis)";
          txtBiotaStatusRef.current.className =
            "text-[10px] font-bold text-rose-600 font-black animate-bounce";
        }
      }

      if (airStatusBadgeRef.current) {
        if (state.algae < 15 && state.DO > 6.5) {
          airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Oligotrofik (Sangat Sehat)`;
          airStatusBadgeRef.current.className =
            "px-2.5 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200";
        } else if (state.algae < 50 && state.DO > 4.5) {
          airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span> Mesotrofik (Sedang)`;
          airStatusBadgeRef.current.className =
            "px-2.5 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200";
        } else if (state.DO > 2.5) {
          airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span> Eutrofik (Tercemar Alga)`;
          airStatusBadgeRef.current.className =
            "px-2.5 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-orange-50 text-orange-700 border-orange-200";
        } else {
          airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> Hipertrofik (Kritis/Anoksia)`;
          airStatusBadgeRef.current.className =
            "px-2.5 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-red-100 text-red-700 border-red-300";
        }
      }

      // --- STAGE RENDERING VISUAL CANVAS ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Langit atas
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, 30);

      // Pola air danau dinamis
      const algaeRatio = state.algae / 100;
      const r = Math.round(224 - (224 - 16) * algaeRatio);
      const g = Math.round(242 - (242 - 120) * algaeRatio);
      const b = Math.round(254 - (254 - 40) * algaeRatio);

      ctx.beginPath();
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
      ctx.moveTo(0, 30);

      const rippleAmp = 1.5;
      const rippleFreq = 0.015;
      for (let x = 0; x <= canvas.width; x += 15) {
        const y =
          30 + Math.sin(x * rippleFreq + simTimeRef.current * 0.05) * rippleAmp;
        ctx.lineTo(x, y);
      }

      const surfaceYRight =
        30 +
        Math.sin(canvas.width * rippleFreq + simTimeRef.current * 0.05) *
          rippleAmp;
      ctx.lineTo(canvas.width, surfaceYRight);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Struktur inlet persawahan
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(0, 10, 50, 20);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(30, 20, 20, 10);
      ctx.beginPath();
      ctx.fillStyle = "#475569";
      ctx.ellipse(45, 25, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Gambar Lapisan Alga Bloom
      const countToRender = Math.floor(
        algaeEntitiesRef.current.length * (state.algae / 100),
      );
      for (let i = 0; i < countToRender; i++) {
        algaeEntitiesRef.current[i].draw(ctx, state.algae, canvas.width);
      }

      // Update & Gambar Runoff Partikel
      for (let i = runoffParticlesRef.current.length - 1; i >= 0; i--) {
        const p = runoffParticlesRef.current[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) runoffParticlesRef.current.splice(i, 1);
      }

      // Update & Gambar Ikan
      for (const fish of fishesRef.current) {
        fish.update(state.DO, canvas.width, canvas.height);
        fish.draw(ctx);
      }

      // Update & Gambar Partikel Hujan
      const { inputHujan } = inputsRef.current;
      if (inputHujan > 1) {
        const currentRainCount = Math.floor(
          rainParticlesRef.current.length * (inputHujan === 2 ? 0.5 : 1.0),
        );
        for (let i = 0; i < currentRainCount; i++) {
          rainParticlesRef.current[i].update(inputHujan);
          rainParticlesRef.current[i].draw(ctx);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- KONTROL TOMBOL EVENT HANDLER ---
  const handleReset = () => {
    setRunning(false);
    simTimeRef.current = 0;
    simStateRef.current = { ...BASE_STATE };

    setInputPupuk(1);
    setInputHujan(1);

    if (bloomBannerRef.current) bloomBannerRef.current.classList.add("hidden");

    const canvas = canvasRef.current;
    if (canvas) {
      setupSimulationEntities(canvas.width, canvas.height);
    }
  };

  const handleAddFish = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      for (let i = 0; i < 5; i++) {
        fishesRef.current.push(new Fish(canvas.width, canvas.height));
      }
    }
  };

  const handlePurify = () => {
    const state = simStateRef.current;
    state.nutrient = 1.5;
    state.algae = 8.0;
    state.DO = 8.0;
    state.BOD = 1.0;

    fishesRef.current.forEach((fish) => {
      if (fish.state === "struggling") {
        fish.state = "alive";
      }
    });

    runoffParticlesRef.current = [];
  };

  return (
    <div className="bg-slate-50 text-slate-800 flex flex-col select-none font-sans overflow-hidden w-full h-screen">
      {/* HEADER RINGKAS */}
      <header className="bg-white border-b border-slate-200 px-5 py-2 flex justify-between items-center h-12 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/simulasi")}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-all flex items-center justify-center mr-1 shadow-sm border border-slate-200 active:scale-95 cursor-pointer"
            title="Kembali ke Pilihan Simulasi"
          >
            <FaArrowLeft className="text-xs" />
          </button>
          <FaWater className="text-emerald-500 text-lg animate-pulse" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900">
              Simulasi Eutrofikasi (Ledakan Alga)
            </h1>
            <p className="text-[10px] text-slate-500 leading-none">
              Dampak Pupuk Berlebih terhadap Ekosistem Air
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setRunning(!running)}
            className={`px-3.5 py-1 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
              running
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-emerald-500 hover:bg-emerald-600"
            }`}
          >
            {running ? <FaPause /> : <FaPlay />}
            <span>{running ? "Jeda" : "Mulai"}</span>
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-all border border-slate-200 flex items-center gap-1"
          >
            <FaArrowRotateLeft className="text-[10px]" /> Reset
          </button>
        </div>
      </header>

      {/* AREA UTAMA LANDSCAPE */}
      <main className="flex-1 grid grid-cols-12 gap-3 p-3 overflow-hidden min-h-0">
        {/* KOLOM 1: PANEL KONTROL */}
        <section className="col-span-3 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between h-full overflow-y-auto shadow-sm">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <FaSliders className="text-emerald-500" /> Pengaturan Kondisi
            </h2>

            {/* Input Dosis Pupuk */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FaSeedling className="text-amber-500" /> Jumlah Pupuk
                (Nitrogen/Fosfor)
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                {[
                  { label: "Sedikit", val: 1 },
                  { label: "Sedang", val: 2 },
                  { label: "Banyak", val: 3 },
                ].map((item) => (
                  <button
                    key={`pupuk-${item.val}`}
                    onClick={() => setInputPupuk(item.val)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                      inputPupuk === item.val
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-slate-400 italic">
                Mengatur volume pupuk kimia dari lahan pertanian.
              </p>
            </div>

            {/* Input Intensitas Hujan */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FaCloudShowersWater className="text-sky-500" /> Intensitas
                Hujan
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                {[
                  { label: "Rendah", val: 1 },
                  { label: "Sedang", val: 2 },
                  { label: "Tinggi", val: 3 },
                ].map((item) => (
                  <button
                    key={`hujan-${item.val}`}
                    onClick={() => setInputHujan(item.val)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                      inputHujan === item.val
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-slate-400 italic">
                Hujan mencuci pupuk (Air hujan mengalirkan pupuk) masuk ke badan
                air.
              </p>
            </div>
          </div>

          {/* Pengelola Biota */}
          <div className="pt-3 border-t border-slate-100 space-y-2 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Kelola Biota
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleAddFish}
                className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-600 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-emerald-100"
              >
                <FaFish /> +5 Ikan
              </button>
              <button
                onClick={handlePurify}
                className="flex-1 py-2 bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-600 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-sky-100"
              >
                <FaPumpMedical /> Perbaiki Kondisi Air
              </button>
            </div>
          </div>
        </section>

        {/* KOLOM 2: INTERAKTIF CANVAS DANAU */}
        <section className="col-span-5 bg-white border border-slate-200 rounded-2xl p-3 flex flex-col justify-between h-full shadow-sm">
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <div className="flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FaBinoculars className="text-emerald-500" /> Ekosistem Danau
              </h3>
              <div
                ref={airStatusBadgeRef}
                className="px-2.5 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                Kondisi Danau (Sangat Sehat)
              </div>
            </div>

            <div className="relative flex-1 bg-linear-to-b from-sky-100 to-sky-200 rounded-xl overflow-hidden border border-slate-100 shadow-inner">
              <canvas ref={canvasRef} className="w-full h-full block"></canvas>

              {/* Tombol Info HUD */}
              <button
                onClick={openHud}
                className={`absolute bottom-2 left-2 w-5 h-5 bg-white/95 text-slate-700 hover:text-slate-900 border border-slate-200/80 rounded-full flex items-center justify-center font-serif font-bold italic text-[10px] shadow-md hover:scale-105 active:scale-95 cursor-pointer z-20 select-none backdrop-blur-sm transition-all duration-300 ${
                  isHudExpanded
                    ? "scale-0 opacity-0 pointer-events-none"
                    : "scale-100 opacity-100"
                }`}
                title="Tampilkan Info"
              >
                i
              </button>

              {/* Overlay HUD Mini */}
              <div
                className={`absolute bottom-2 left-2 bg-white/95 border border-slate-200/80 p-2 pr-6 rounded-lg shadow-lg text-[9px] space-y-0.5 backdrop-blur-sm z-20 transition-all duration-300 origin-bottom-left ${
                  isHudExpanded
                    ? "scale-100 opacity-100 pointer-events-auto"
                    : "scale-75 opacity-0 pointer-events-none"
                }`}
              >
                {/* Tombol Silang */}
                <button
                  onClick={closeHud}
                  className="absolute top-1 right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-all"
                  title="Tutup"
                >
                  <svg
                    className="w-2 h-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div className="flex justify-between gap-4 text-slate-600">
                  <span>Ikan Hidup:</span>
                  <span
                    ref={hudFishAliveRef}
                    className="font-mono font-bold text-emerald-600"
                  >
                    10
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>Ikan Mati:</span>
                  <span
                    ref={hudFishDeadRef}
                    className="font-mono font-bold text-rose-500"
                  >
                    0
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-slate-600 font-semibold border-t border-slate-200/50 mt-1 pt-1">
                  <span>Transparansi:</span>
                  <span
                    ref={hudTransparencyRef}
                    className="font-mono text-slate-800"
                  >
                    100%
                  </span>
                </div>
              </div>

              {/* Notifikasi Banner Algal Bloom */}
              <div
                ref={bloomBannerRef}
                className="hidden absolute top-2 right-2 bg-rose-500 text-white px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase animate-bounce shadow"
              >
                ALGAL BLOOM TERJADI!
              </div>

              <div className="absolute top-2 left-2 pointer-events-none bg-amber-100/90 text-amber-800 border border-amber-200 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                Inlet Aliran Sawah
              </div>
            </div>
          </div>

          {/* Status Kualitatif Bawah */}
          <div className="grid grid-cols-3 gap-2 mt-2 text-center shrink-0">
            <div className="p-1.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center items-center min-h-11.5">
              <span className="block text-[8px] text-slate-400 uppercase font-bold leading-none mb-0.5">
                Kondisi Air
              </span>
              <div className="leading-[1.15] text-center w-full">
                <span
                  ref={txtWarnaRef}
                  className="text-[10px] font-bold text-sky-500"
                >
                  Biru Jernih
                </span>
              </div>
            </div>
            <div className="p-1.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center items-center min-h-11.5">
              <span className="block text-[8px] text-slate-400 uppercase font-bold leading-none mb-0.5">
                Dominasi Alga
              </span>
              <div className="leading-[1.15] text-center w-full">
                <span
                  ref={txtAlgaeStatusRef}
                  className="text-[10px] font-bold text-slate-500"
                >
                  Rendah / Normal
                </span>
              </div>
            </div>
            <div className="p-1.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center items-center min-h-11.5">
              <span className="block text-[8px] text-slate-400 uppercase font-bold leading-none mb-0.5">
                Kondisi Makhluk Hidup
              </span>
              <div className="leading-[1.15] text-center w-full">
                <span
                  ref={txtBiotaStatusRef}
                  className="text-[10px] font-bold text-emerald-600"
                >
                  Sangat Sehat
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* KOLOM 3: REAL-TIME BAR CHART */}
        <section className="col-span-4 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col h-full shadow-sm">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center shrink-0 mb-4 border-b border-slate-100 pb-2">
            <span>
              <FaChartLine className="text-emerald-500" /> Kondisi Ekosistem
            </span>
            <span className="text-[8px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded-md">
              REAL-TIME
            </span>
          </h2>

          <div className="flex-1 flex flex-col min-h-0 relative mt-2 select-none">
            {/* Grid Lines Skala */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-l border-b border-slate-200 pb-8 pl-2">
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full"></div>
            </div>

            {/* Kontainer Batang Batang Grafik */}
            <div className="flex-1 flex justify-around items-end pl-2 pb-8 h-full relative z-10">
              {/* Nutrien */}
              <div className="flex flex-col items-center h-full justify-end w-1/4 relative">
                <div className="relative w-8 flex-1 bg-slate-100/50 rounded-lg flex flex-col justify-end overflow-visible border border-slate-100">
                  <span
                    ref={barNutValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-amber-700 whitespace-nowrap bg-amber-50 border border-amber-200 px-1 py-0.2 rounded shadow-sm"
                    style={{ bottom: "10%" }}
                  >
                    1.2 ppm
                  </span>
                  <div
                    ref={barNutRef}
                    className="w-full bg-linear-to-t from-amber-400 to-amber-500 rounded-b-lg rounded-t-sm shadow-sm"
                    style={{ height: "10%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-2">
                  Nutrien (Nitrat/Fosfat)
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight">
                  Nitrat/Fosfat
                </span>
              </div>

              {/* Alga */}
              <div className="flex flex-col items-center h-full justify-end w-1/4 relative">
                <div className="relative w-8 flex-1 bg-slate-100/50 rounded-lg flex flex-col justify-end overflow-visible border border-slate-100">
                  <span
                    ref={barAlgValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-emerald-700 whitespace-nowrap bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded shadow-sm"
                    style={{ bottom: "15%" }}
                  >
                    15%
                  </span>
                  <div
                    ref={barAlgRef}
                    className="w-full bg-linear-to-t from-emerald-400 to-emerald-500 rounded-b-lg rounded-t-sm shadow-sm"
                    style={{ height: "15%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-2">
                  Alga
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight">
                  Populasi (%)
                </span>
              </div>

              {/* DO */}
              <div className="flex flex-col items-center h-full justify-end w-1/4 relative">
                <div className="relative w-8 flex-1 bg-slate-100/50 rounded-lg flex flex-col justify-end overflow-visible border border-slate-100">
                  <span
                    ref={barDoValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-sky-700 whitespace-nowrap bg-sky-50 border border-sky-200 px-1 py-0.2 rounded shadow-sm"
                    style={{ bottom: "80%" }}
                  >
                    8.2 mg/L
                  </span>
                  <div
                    ref={barDoRef}
                    className="w-full bg-linear-to-t from-sky-400 to-sky-500 rounded-b-lg rounded-t-sm shadow-sm"
                    style={{ height: "80%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-2">
                  DO (Oksigen Terlarut)
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight">
                  Oksigen Terl.
                </span>
              </div>

              {/* BOD */}
              <div className="flex flex-col items-center h-full justify-end w-1/4 relative">
                <div className="relative w-8 flex-1 bg-slate-100/50 rounded-lg flex flex-col justify-end overflow-visible border border-slate-100">
                  <span
                    ref={barBodValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-rose-700 whitespace-nowrap bg-rose-50 border border-rose-200 px-1 py-0.2 rounded shadow-sm"
                    style={{ bottom: "5%" }}
                  >
                    1.1 mg/L
                  </span>
                  <div
                    ref={barBodRef}
                    className="w-full bg-linear-to-t from-rose-400 to-rose-500 rounded-b-lg rounded-t-sm shadow-sm"
                    style={{ height: "5%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-2">
                  BOD (Kebutuhan Oksigen)
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight">
                  Kebutuhan Oks.
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Fallback Overlay for Mobile Portrait Orientation */}
      <div className="hidden max-lg:portrait:flex fixed inset-0 z-9999 bg-black flex-col items-center justify-center text-center p-6 text-white select-none">
        <div className="w-16 h-16 mb-4 flex items-center justify-center border border-white rounded-lg">
          <svg
            className="w-8 h-8 rotate-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-sm font-bold mb-2 uppercase tracking-wider">
          Mode Lanskap Diperlukan
        </h2>
        <p className="text-xs text-neutral-400 max-w-70 leading-relaxed">
          Silakan putar perangkat Anda ke arah lanskap (menyamping) untuk
          mengakses eko-simulasi eutrofikasi.
        </p>
        <button
          onClick={() => navigate("/simulasi")}
          className="mt-6 px-4 py-2 border border-white bg-black text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          Kembali ke Menu
        </button>
      </div>
    </div>
  );
}
