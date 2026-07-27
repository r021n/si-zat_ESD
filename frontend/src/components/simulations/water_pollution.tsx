import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import {
  FaDroplet,
  FaPlay,
  FaPause,
  FaArrowRotateLeft,
  FaSliders,
  FaIndustry,
  FaHouseChimney,
  FaWind,
  FaFish,
  FaEye,
  FaChartBar,
  FaArrowLeft,
} from "react-icons/fa6";
import { IoSparkles } from "react-icons/io5";

// --- DEFINISI TYPE / INTERFACE ---
interface SimState {
  pH: number;
  DO: number;
  BOD: number;
  COD: number;
  pollutant: number;
}

type FishState = "alive" | "struggling" | "dead";

const INITIAL_VALUES: SimState = {
  pH: 7.0,
  DO: 8.0,
  BOD: 1.5,
  COD: 5.0,
  pollutant: 0.0,
};

export default function SimulasiPencemaranAir() {
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

  // --- STATE UNTUK KONTROL UI ---
  const [running, setRunning] = useState<boolean>(false);
  const [checkIndustri, setCheckIndustri] = useState<boolean>(false);
  const [slideIndustri, setSlideIndustri] = useState<number>(50);
  const [checkDomestik, setCheckDomestik] = useState<boolean>(false);
  const [slideDomestik, setSlideDomestik] = useState<number>(50);
  const [slideAliran, setSlideAliran] = useState<number>(5);
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

  // --- REFS UNTUK ELEMENT DOM (Akses Cepat di Dalam Loop Animasi) ---
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

  // --- REFS UNTUK ENGINE SIMULASI ---
  const simStateRef = useRef<SimState>({ ...INITIAL_VALUES });
  const simTimeRef = useRef<number>(0);
  const runningRef = useRef<boolean>(false);

  // Sinkronisasi state React ke Ref agar loop animasi selalu mendapatkan data terbaru tanpa penutupan scope (closure)
  const inputsRef = useRef({
    checkIndustri,
    slideIndustri,
    checkDomestik,
    slideDomestik,
    slideAliran,
  });

  // Array agen makro
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

  // --- KELAS AGEN ELEMEN (Dikonversi ke TypeScript) ---

  class Fish {
    x: number;
    y: number;
    size: number;
    vx: number;
    vy: number;
    colorHue: number;
    state: FishState;
    wiggleFactor: number;
    wiggleSpeed: number;

    constructor(
      canvasWidth: number,
      canvasHeight: number,
      stateType: FishState = "alive",
    ) {
      this.x = Math.random() * (canvasWidth - 60) + 30;
      this.y = Math.random() * (canvasHeight - 60) + 40;
      this.size = Math.random() * 6 + 10;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.colorHue = Math.floor(Math.random() * 20) + 15;
      this.state = stateType;
      this.wiggleFactor = Math.random() * 10;
      this.wiggleSpeed = 0.15;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(this.x, this.y);

      let angle = Math.atan2(this.vy, this.vx);
      if (this.state === "dead") {
        angle = Math.PI;
      }
      ctx.rotate(angle);

      this.wiggleFactor += this.wiggleSpeed;
      const tailWiggle = Math.sin(this.wiggleFactor) * 4;

      let fishBodyColor = `hsl(${this.colorHue}, 90%, 55%)`;
      let eyeColor = "#000000";

      if (this.state === "struggling") {
        fishBodyColor = `hsl(${this.colorHue}, 60%, 65%)`;
      } else if (this.state === "dead") {
        fishBodyColor = `#cbd5e1`;
        eyeColor = "#f43f5e";
      }

      // Ekor
      ctx.beginPath();
      ctx.fillStyle = fishBodyColor;
      ctx.moveTo(-this.size, 0);
      ctx.lineTo(-this.size * 1.5, -this.size * 0.4 + tailWiggle);
      ctx.lineTo(-this.size * 1.3, 0);
      ctx.lineTo(-this.size * 1.5, this.size * 0.4 + tailWiggle);
      ctx.closePath();
      ctx.fill();

      // Badan
      ctx.beginPath();
      ctx.fillStyle = fishBodyColor;
      ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mata
      ctx.beginPath();
      ctx.fillStyle = "#ffffff";
      ctx.arc(
        this.size * 0.5,
        -this.size * 0.15,
        this.size * 0.15,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = eyeColor;
      ctx.arc(
        this.size * 0.52,
        -this.size * 0.15,
        this.size * 0.08,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.restore();
    }

    update(
      waterDO: number,
      waterPH: number,
      canvasWidth: number,
      canvasHeight: number,
    ) {
      if (waterDO < 3.8 || waterPH < 5.6 || waterPH > 8.4) {
        if (this.state === "alive") {
          this.state = "struggling";
        }
        const hazard = (4.0 - waterDO) * 0.0006 + (5.6 - waterPH) * 0.0009;
        if (
          this.state === "struggling" &&
          Math.random() < Math.max(0, hazard)
        ) {
          this.state = "dead";
          this.vy = -0.4;
          this.vx = (Math.random() - 0.5) * 0.1;
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
          this.vx = (Math.random() - 0.5) * 1.8;
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
          this.vy *= -1;
        }
        if (this.y > canvasHeight - 15) {
          this.y = canvasHeight - 15;
          this.vy *= -1;
        }
      } else if (this.state === "struggling") {
        this.x += this.vx * 0.5;
        this.y += this.vy * 0.5;
        if (this.y > 45) this.vy -= 0.03;
        if (Math.random() < 0.03) {
          this.vx = (Math.random() - 0.5) * 1.0;
          this.vy = (Math.random() - 0.5) * 0.5;
        }
        if (this.x < 20) {
          this.x = 20;
          this.vx *= -1;
        }
        if (this.x > canvasWidth - 20) {
          this.x = canvasWidth - 20;
          this.vx *= -1;
        }
        if (this.y < 25) {
          this.y = 25;
          this.vy = 0.2;
        }
        if (this.y > canvasHeight - 15) {
          this.y = canvasHeight - 15;
          this.vy = -0.2;
        }
      } else if (this.state === "dead") {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y > 20) {
          this.vy = -0.4;
        } else {
          this.vy = 0;
          this.vx = Math.sin(simTimeRef.current * 0.05) * 0.08;
        }
        if (this.x < 15) this.x = 15;
        if (this.x > canvasWidth - 15) this.x = canvasWidth - 15;
      }
    }
  }

  class WasteParticle {
    source: "industri" | "domestik";
    x: number;
    y: number;
    color: string;
    size: number;
    vx: number;
    vy: number;
    decay: number;
    alpha: number;

    constructor(sourceType: "industri" | "domestik", dischargeRate: number) {
      this.source = sourceType;
      if (sourceType === "industri") {
        this.x = 45;
        this.y = 30;
        this.color = `hsla(${Math.random() * 30 + 65}, 80%, 45%, 0.6)`;
        this.size = Math.random() * 3 + 2;
      } else {
        this.x = 85;
        this.y = 30;
        this.color = `rgba(148, 163, 184, ${Math.random() * 0.4 + 0.3})`;
        this.size = Math.random() * 4 + 2;
      }
      const speed = (dischargeRate / 100) * 3 + 1.5;
      this.vx = (Math.random() * 0.4 + 0.1) * speed;
      this.vy = (Math.random() * 1.2 + 0.4) * speed;
      this.decay = Math.random() * 0.007 + 0.003;
      this.alpha = 1.0;
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
      this.vx += (Math.random() - 0.4) * 0.08;
      this.vy += 0.04;
      if (this.y > 45) {
        this.alpha -= this.decay;
      }
    }
  }

  class OxygenBubble {
    x: number = 0;
    y: number = 0;
    size: number = 0;
    speed: number = 0;
    wobble: number = 0;
    canvasWidth: number;
    canvasHeight: number;

    constructor(canvasWidth: number, canvasHeight: number) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.reset();
      this.y = Math.random() * canvasHeight;
    }

    reset() {
      this.x = Math.random() * this.canvasWidth;
      this.y = this.canvasHeight + 5;
      this.size = Math.random() * 2 + 0.8;
      this.speed = Math.random() * 0.8 + 0.3;
      this.wobble = Math.random() * 2 * Math.PI;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(2, 132, 199, 0.35)";
      ctx.lineWidth = 0.5;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.stroke();
    }

    update(waterDO: number) {
      this.y -= this.speed * (waterDO / 8 + 0.4);
      this.wobble += 0.06;
      this.x += Math.sin(this.wobble) * 0.15;
      if (this.y < 25) {
        this.reset();
      }
    }
  }

  // --- PROSES INISIALISASI AGEN ---
  const populateSim = (width: number, height: number) => {
    const fish: Fish[] = [];
    for (let i = 0; i < 12; i++) fish.push(new Fish(width, height));
    fishArrayRef.current = fish;

    const bubbles: OxygenBubble[] = [];
    for (let i = 0; i < 20; i++) bubbles.push(new OxygenBubble(width, height));
    bubbleArrayRef.current = bubbles;

    particlesArrayRef.current = [];
  };

  // --- KONTROL ENGINE ANIMASI ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        if (fishArrayRef.current.length === 0) {
          populateSim(canvas.width, canvas.height);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    let animationFrameId: number;

    const getWaterColorString = (pollutant: number) => {
      const p = Math.min(100, pollutant);
      let r, g, b, a;

      if (p < 25) {
        const ratio = p / 25;
        r = Math.round(224 + (203 - 224) * ratio);
        g = Math.round(242 + (213 - 242) * ratio);
        b = Math.round(254 + (219 - 254) * ratio);
        a = 0.65;
      } else {
        const ratio = Math.min(1.0, (p - 25) / 75);
        r = Math.round(203 + (115 - 203) * ratio);
        g = Math.round(213 + (115 - 213) * ratio);
        b = Math.round(219 + (95 - 219) * ratio);
        a = 0.65 + 0.25 * ratio;
      }

      if (inputsRef.current.checkIndustri) {
        const indRatio = inputsRef.current.slideIndustri / 100;
        r = Math.min(255, r + Math.round(15 * indRatio));
        g = Math.min(255, g + Math.round(20 * indRatio));
        b = Math.max(0, b - Math.round(25 * indRatio));
      }

      return `rgba(${r}, ${g}, ${b}, ${a})`;
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const state = simStateRef.current;

      if (runningRef.current) {
        simTimeRef.current++;
        const {
          checkIndustri,
          slideIndustri,
          checkDomestik,
          slideDomestik,
          slideAliran,
        } = inputsRef.current;

        // Formula Kalkulasi Reaksi Ekologi
        const inflowIndustri = checkIndustri ? slideIndustri * 0.08 : 0.0;
        const inflowDomestik = checkDomestik ? slideDomestik * 0.04 : 0.0;
        const totalInflow = inflowIndustri + inflowDomestik;

        const dilution = 0.012 * slideAliran;
        const dPollutant = totalInflow - state.pollutant * dilution;
        state.pollutant = Math.max(0, state.pollutant + dPollutant);

        const targetBOD =
          INITIAL_VALUES.BOD +
          (checkDomestik ? slideDomestik * 0.45 : 0.0) +
          (checkIndustri ? slideIndustri * 0.05 : 0.0);
        state.BOD += (targetBOD - state.BOD) * 0.04;

        const targetCOD =
          INITIAL_VALUES.COD +
          (checkIndustri ? slideIndustri * 0.75 : 0.0) +
          (checkDomestik ? slideDomestik * 0.1 : 0.0);
        state.COD += (targetCOD - state.COD) * 0.04;

        const aeration = 0.025 * slideAliran * (INITIAL_VALUES.DO - state.DO);
        const oxygenConsumption = state.BOD * 0.015 + state.COD * 0.008;
        const dDO = aeration - oxygenConsumption;
        state.DO = Math.min(8.5, Math.max(0.1, state.DO + dDO));

        const targetPH =
          INITIAL_VALUES.pH -
          (checkIndustri ? (slideIndustri / 100) * 2.5 : 0.0) -
          (checkDomestik ? (slideDomestik / 100) * 0.5 : 0.0);
        state.pH += (targetPH - state.pH) * 0.03;

        // Spawn Partikel Limbah
        if (checkIndustri && Math.random() < slideIndustri / 150 + 0.1) {
          particlesArrayRef.current.push(
            new WasteParticle("industri", slideIndustri),
          );
        }
        if (checkDomestik && Math.random() < slideDomestik / 150 + 0.1) {
          particlesArrayRef.current.push(
            new WasteParticle("domestik", slideDomestik),
          );
        }
      }

      // --- UPDATE ELEMEN DOM SECARA LANGSUNG (60FPS PERFORMANCE BOOST) ---
      const pctDO = Math.min(100, Math.max(0, (state.DO / 10) * 100));
      const pctPH = Math.min(100, Math.max(0, (state.pH / 14) * 100));
      const pctBOD = Math.min(100, Math.max(0, (state.BOD / 150) * 100));
      const pctCOD = Math.min(100, Math.max(0, (state.COD / 150) * 100));
      const pctPol = Math.min(100, Math.max(0, (state.pollutant / 100) * 100));

      if (barDoRef.current) barDoRef.current.style.height = `${pctDO}%`;
      if (barPhRef.current) barPhRef.current.style.height = `${pctPH}%`;
      if (barBodRef.current) barBodRef.current.style.height = `${pctBOD}%`;
      if (barCodRef.current) barCodRef.current.style.height = `${pctCOD}%`;
      if (barPolRef.current) barPolRef.current.style.height = `${pctPol}%`;

      if (barDoValRef.current) {
        barDoValRef.current.style.bottom = `calc(${pctDO}% + 4px)`;
        barDoValRef.current.innerText = state.DO.toFixed(2);
      }
      if (barPhValRef.current) {
        barPhValRef.current.style.bottom = `calc(${pctPH}% + 4px)`;
        barPhValRef.current.innerText = state.pH.toFixed(1);
      }
      if (barBodValRef.current) {
        barBodValRef.current.style.bottom = `calc(${pctBOD}% + 4px)`;
        barBodValRef.current.innerText = state.BOD.toFixed(2);
      }
      if (barCodValRef.current) {
        barCodValRef.current.style.bottom = `calc(${pctCOD}% + 4px)`;
        barCodValRef.current.innerText = state.COD.toFixed(2);
      }
      if (barPolValRef.current) {
        barPolValRef.current.style.bottom = `calc(${pctPol}% + 4px)`;
        barPolValRef.current.innerText = state.pollutant.toFixed(2);
      }

      const aliveFish = fishArrayRef.current.filter(
        (f) => f.state !== "dead",
      ).length;
      const deadFish = fishArrayRef.current.length - aliveFish;
      if (hudFishRef.current) hudFishRef.current.innerText = String(aliveFish);
      if (hudDeadFishRef.current)
        hudDeadFishRef.current.innerText = String(deadFish);

      const transparency = Math.max(0, 100 - state.pollutant * 1.3).toFixed(0);
      if (hudTransparencyRef.current)
        hudTransparencyRef.current.innerText = `${transparency}%`;

      // Update teks kualitatif ringkas
      if (txtWarnaRef.current) {
        if (state.pollutant < 10) {
          txtWarnaRef.current.innerText = "Jernih";
          txtWarnaRef.current.className = "text-[10px] font-bold text-sky-600";
        } else if (state.pollutant < 40) {
          txtWarnaRef.current.innerText = "Mulai Keruh";
          txtWarnaRef.current.className =
            "text-[10px] font-bold text-slate-500";
        } else {
          txtWarnaRef.current.innerText = "Sangat Keruh";
          txtWarnaRef.current.className =
            "text-[10px] font-bold text-amber-700";
        }
      }

      if (txtPerilakuRef.current) {
        if (aliveFish === 0) {
          txtPerilakuRef.current.innerText = "Punah";
          txtPerilakuRef.current.className =
            "text-[10px] font-bold text-red-600";
        } else if (state.DO >= 5.5 && state.pH >= 6.5) {
          txtPerilakuRef.current.innerText = "Sehat Aktif";
          txtPerilakuRef.current.className =
            "text-[10px] font-bold text-emerald-600";
        } else if (state.DO < 3.5 || state.pH < 5.5) {
          txtPerilakuRef.current.innerText = "Lemas/Sekarat";
          txtPerilakuRef.current.className =
            "text-[10px] font-bold text-red-400 animate-pulse";
        } else {
          txtPerilakuRef.current.innerText = "Stres Ringan";
          txtPerilakuRef.current.className =
            "text-[10px] font-bold text-amber-500";
        }
      }

      if (txtToksikRef.current) {
        if (state.pollutant < 10) {
          txtToksikRef.current.innerText = "Aman";
          txtToksikRef.current.className =
            "text-[10px] font-bold text-emerald-600";
        } else if (state.pollutant < 45) {
          txtToksikRef.current.innerText = "Sedang";
          txtToksikRef.current.className =
            "text-[10px] font-bold text-amber-500";
        } else {
          txtToksikRef.current.innerText = "Berbahaya";
          txtToksikRef.current.className =
            "text-[10px] font-bold text-red-500 font-extrabold";
        }
      }

      if (airStatusBadgeRef.current) {
        if (state.pollutant < 15 && state.DO > 6.0) {
          airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Bersih`;
          airStatusBadgeRef.current.className =
            "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-emerald-100 text-emerald-700 border-emerald-200";
        } else if (state.pollutant < 50 && state.DO > 4.0) {
          airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Tercemar`;
          airStatusBadgeRef.current.className =
            "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-amber-100 text-amber-700 border-amber-200";
        } else {
          airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Kritis`;
          airStatusBadgeRef.current.className =
            "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-red-100 text-red-700 border-red-200";
        }
      }

      // --- RENDERING BACKGROUND AIR DAN INFRASTRUKTUR ---
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, 25);

      ctx.beginPath();
      ctx.fillStyle = getWaterColorString(state.pollutant);
      ctx.moveTo(0, 25);

      const rippleAmp = 2;
      const rippleFreq = 0.02;
      for (let x = 0; x <= canvas.width; x += 10) {
        const y =
          25 + Math.sin(x * rippleFreq + simTimeRef.current * 0.05) * rippleAmp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Pipa Industri
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(15, 10, 30, 15);
      ctx.fillStyle = "#64748b";
      ctx.fillRect(40, 8, 8, 20);
      ctx.beginPath();
      ctx.fillStyle = "#334155";
      ctx.ellipse(44, 28, 5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pipa Domestik
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(60, 12, 25, 12);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(80, 10, 8, 17);
      ctx.beginPath();
      ctx.fillStyle = "#475569";
      ctx.ellipse(84, 27, 5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- UPDATE & RENDER PARTIKEL LIMBAH ---
      for (let i = particlesArrayRef.current.length - 1; i >= 0; i--) {
        const p = particlesArrayRef.current[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0 || p.x > canvas.width) {
          particlesArrayRef.current.splice(i, 1);
        }
      }

      // --- UPDATE & RENDER GELEMBUNG ---
      for (const b of bubbleArrayRef.current) {
        b.update(state.DO);
        b.draw(ctx);
      }

      // --- UPDATE & RENDER IKAN ---
      for (const fish of fishArrayRef.current) {
        fish.update(state.DO, state.pH, canvas.width, canvas.height);
        fish.draw(ctx);
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

  // --- CONTROLLER BUTTON HANDLERS ---
  const handleReset = () => {
    setRunning(false);
    simTimeRef.current = 0;
    simStateRef.current = { ...INITIAL_VALUES };

    setCheckIndustri(false);
    setCheckDomestik(false);
    setSlideIndustri(50);
    setSlideDomestik(50);
    setSlideAliran(5);

    const canvas = canvasRef.current;
    if (canvas) {
      populateSim(canvas.width, canvas.height);
    }
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
      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-200 px-4 py-1.5 flex justify-between items-center h-12 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/simulasi")}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-all flex items-center justify-center mr-1 shadow-sm border border-slate-200 active:scale-95 cursor-pointer"
            title="Kembali ke Pilihan Simulasi"
          >
            <FaArrowLeft className="text-xs" />
          </button>
          <FaDroplet className="text-sky-500 text-lg animate-pulse" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900">
              Simulasi Pencemaran Air
            </h1>
            <p className="text-[10px] text-slate-500 leading-none">
              Simulasi Kualitas Air dan Makhluk Hidup
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRunning(!running)}
            className={`px-3 py-1 text-white text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
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
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-md transition-all border border-slate-200 flex items-center gap-1"
          >
            <FaArrowRotateLeft className="text-[10px]" /> Reset
          </button>
        </div>
      </header>

      {/* DASHBOARD KONTEN UTAMA */}
      <main className="flex-1 grid grid-cols-12 gap-2.5 p-2.5 overflow-hidden min-h-0">
        {/* KOLOM 1: INPUT CONTROLS */}
        <section className="col-span-3 bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between h-full overflow-y-auto overflow-x-hidden">
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FaSliders className="text-sky-500" /> Sumber Pencemar
            </h2>

            {/* Input Industri */}
            <div
              className={`p-2 rounded-lg border transition-all duration-300 ${
                checkIndustri
                  ? "bg-amber-50/70 border-amber-300"
                  : "bg-slate-50 border-slate-100"
              }`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  <FaIndustry className="text-[10px]" /> Industri
                </span>
                <label className="relative inline-flex items-center cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    checked={checkIndustri}
                    onChange={(e) => setCheckIndustri(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500 transition-colors border border-slate-300"></div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider min-w-8 ${
                      checkIndustri
                        ? "text-amber-600 font-black animate-pulse"
                        : "text-slate-400"
                    }`}
                  >
                    {checkIndustri ? "AKTIF" : "MATI"}
                  </span>
                </label>
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>debit limbah</span>
                  <span className="font-mono font-bold text-amber-600">
                    {slideIndustri}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={slideIndustri}
                  onChange={(e) => setSlideIndustri(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Input Rumah Tangga */}
            <div
              className={`p-2 rounded-lg border transition-all duration-300 ${
                checkDomestik
                  ? "bg-cyan-50/70 border-cyan-300"
                  : "bg-slate-50 border-slate-100"
              }`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-cyan-600 flex items-center gap-1">
                  <FaHouseChimney className="text-[10px]" /> Domestik
                </span>
                <label className="relative inline-flex items-center cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    checked={checkDomestik}
                    onChange={(e) => setCheckDomestik(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500 transition-colors border border-slate-300"></div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider min-w-8 ${
                      checkDomestik
                        ? "text-cyan-600 font-black animate-pulse"
                        : "text-slate-400"
                    }`}
                  >
                    {checkDomestik ? "AKTIF" : "MATI"}
                  </span>
                </label>
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Debit Limbah</span>
                  <span className="font-mono font-bold text-cyan-600">
                    {slideDomestik}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={slideDomestik}
                  onChange={(e) => setSlideDomestik(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>

            {/* Arus Air */}
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] font-bold text-emerald-600 block mb-1">
                <FaWind /> Kecepatan Aliran Sungai
              </span>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Arus Air</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {slideAliran <= 3
                      ? "Lambat"
                      : slideAliran <= 7
                      ? "Normal"
                      : "Deras"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={slideAliran}
                  onChange={(e) => setSlideAliran(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex gap-1.5 shrink-0">
            <button
              onClick={handleAddFish}
              className="flex-1 py-1.5 bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-600 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 border border-sky-100"
            >
              <FaFish /> +5 Ikan
            </button>
            <button
              onClick={handlePurifikasi}
              className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-600 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 border border-emerald-100"
            >
              <IoSparkles /> Pembersihan Air
            </button>
          </div>
        </section>

        {/* KOLOM 2: ECOSYSTEM SUNGAI VISUAL */}
        <section className="col-span-5 bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between h-full">
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <div className="flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <FaEye className="text-sky-500" /> Ekosistem Sungai
              </h3>
              <div
                ref={airStatusBadgeRef}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-emerald-100 text-emerald-700 border-emerald-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sehat
              </div>
            </div>

            <div className="relative flex-1 bg-sky-50/40 rounded-lg overflow-hidden border border-slate-100 shadow-inner">
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
                className={`absolute bottom-2 left-2 bg-white/95 border border-slate-200/80 p-1.5 pr-6 rounded shadow-lg text-[9px] space-y-0.5 backdrop-blur-sm z-20 transition-all duration-300 origin-bottom-left ${
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

                <div className="flex justify-between gap-3 text-slate-600">
                  <span>Hidup/Mati:</span>
                  <span className="font-mono font-bold text-slate-800">
                    <span ref={hudFishRef}>12</span>/
                    <span ref={hudDeadFishRef} className="text-red-500">
                      0
                    </span>
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-slate-600">
                  <span>Kejernihan:</span>
                  <span
                    ref={hudTransparencyRef}
                    className="font-mono font-bold text-sky-600"
                  >
                    100%
                  </span>
                </div>
              </div>

              <div className="absolute top-2 left-2 flex gap-1 pointer-events-none">
                <span className="bg-amber-100/90 text-amber-800 border border-amber-200 text-[8px] px-1 py-0.2 rounded font-semibold">
                  Pipa Ind
                </span>
                <span className="bg-cyan-100/90 text-cyan-800 border border-cyan-200 text-[8px] px-1 py-0.2 rounded font-semibold">
                  Pipa Dom
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mt-2 text-center shrink-0">
            <div className="p-1 bg-slate-50 rounded border border-slate-100 flex flex-col justify-center items-center min-h-10.5">
              <span className="block text-[8px] text-slate-400 uppercase font-bold leading-none mb-0.5">
                Warna Air
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
            <div className="p-1 bg-slate-50 rounded border border-slate-100 flex flex-col justify-center items-center min-h-10.5">
              <span className="block text-[8px] text-slate-400 uppercase font-bold leading-none mb-0.5">
                Biota
              </span>
              <div className="leading-[1.15] text-center w-full">
                <span
                  ref={txtPerilakuRef}
                  className="text-[10px] font-bold text-emerald-500"
                >
                  Sehat Aktif
                </span>
              </div>
            </div>
            <div className="p-1 bg-slate-50 rounded border border-slate-100 flex flex-col justify-center items-center min-h-10.5">
              <span className="block text-[8px] text-slate-400 uppercase font-bold leading-none mb-0.5">
                Tingkat Pencemaran
              </span>
              <div className="leading-[1.15] text-center w-full">
                <span
                  ref={txtToksikRef}
                  className="text-[10px] font-bold text-slate-500"
                >
                  Nihil
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* KOLOM 3: REAL-TIME BAR CHART */}
        <section className="col-span-4 bg-white border border-slate-200 rounded-xl p-3 flex flex-col h-full overflow-hidden">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between items-center shrink-0 mb-4">
            <span>
              <FaChartBar className="text-sky-500" /> Grafik Kualitas Air
            </span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">
              Real-Time
            </span>
          </h2>

          <div className="flex-1 flex flex-col min-h-0 relative mt-2 select-none">
            {/* Grid Line Belakang */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-l border-b border-slate-200 pb-7 pl-2">
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full"></div>
            </div>

            {/* Container Batang */}
            <div className="flex-1 flex justify-around items-end pl-2 pb-7 h-full relative z-10">
              {/* DO */}
              <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
                <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
                  <span
                    ref={barDoValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-emerald-700 whitespace-nowrap bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded shadow-sm"
                    style={{ bottom: "80%" }}
                  >
                    8.00
                  </span>
                  <div
                    ref={barDoRef}
                    className="w-full bg-linear-to-t from-emerald-400 to-emerald-500 rounded-b-md rounded-t-sm shadow-sm"
                    style={{ height: "80%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
                  DO
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
                  mg/L
                </span>
              </div>

              {/* pH */}
              <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
                <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
                  <span
                    ref={barPhValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-blue-700 whitespace-nowrap bg-blue-50 border border-blue-200 px-1 py-0.2 rounded shadow-sm"
                    style={{ bottom: "50%" }}
                  >
                    7.0
                  </span>
                  <div
                    ref={barPhRef}
                    className="w-full bg-linear-to-t from-blue-400 to-blue-500 rounded-b-md rounded-t-sm shadow-sm"
                    style={{ height: "50%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
                  pH
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
                  pH
                </span>
              </div>

              {/* BOD */}
              <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
                <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
                  <span
                    ref={barBodValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-amber-700 whitespace-nowrap bg-amber-50 border border-amber-200 px-1 py-0.2 rounded shadow-sm"
                    style={{ bottom: "1%" }}
                  >
                    1.50
                  </span>
                  <div
                    ref={barBodRef}
                    className="w-full bg-linear-to-t from-amber-400 to-amber-500 rounded-b-md rounded-t-sm shadow-sm"
                    style={{ height: "1%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
                  BOD
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
                  mg/L
                </span>
              </div>

              {/* COD */}
              <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
                <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
                  <span
                    ref={barCodValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-orange-700 whitespace-nowrap bg-orange-50 border border-orange-200 px-1 py-0.2 rounded shadow-sm"
                    style={{ bottom: "3%" }}
                  >
                    5.00
                  </span>
                  <div
                    ref={barCodRef}
                    className="w-full bg-linear-to-t from-orange-400 to-orange-500 rounded-b-md rounded-t-sm shadow-sm"
                    style={{ height: "3%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
                  COD
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
                  mg/L
                </span>
              </div>

              {/* POLUTAN */}
              <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
                <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
                  <span
                    ref={barPolValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-rose-700 whitespace-nowrap bg-rose-50 border border-rose-200 px-1 py-0.2 rounded shadow-sm"
                    style={{ bottom: "0%" }}
                  >
                    0.00
                  </span>
                  <div
                    ref={barPolRef}
                    className="w-full bg-linear-to-t from-rose-400 to-rose-500 rounded-b-md rounded-t-sm shadow-sm"
                    style={{ height: "0%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
                  Polutan
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
                  ppm
                </span>
              </div>
            </div>
          </div>

          {/* Keterangan Parameter Grafik */}
          <div className="mt-2 pt-2 border-t border-slate-100 text-center shrink-0">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-center">
              Keterangan Parameter Grafik
            </span>
            <p className="text-[10px] leading-relaxed text-slate-600 text-center font-semibold">
              <span className="inline-block mx-1.5"><strong className="text-emerald-600">DO:</strong> Oksigen Terlarut</span>
              <span className="inline-block mx-1.5"><strong className="text-blue-600">pH:</strong> Keasaman Air</span>
              <span className="inline-block mx-1.5"><strong className="text-amber-600">BOD:</strong> Kebutuhan Oksigen Biologis</span>
              <span className="inline-block mx-1.5"><strong className="text-orange-600">COD:</strong> Kebutuhan Oksigen Kimiawi</span>
              <span className="inline-block mx-1.5"><strong className="text-rose-600">Polutan:</strong> Tingkat Pencemar</span>
            </p>
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
          mengakses eko-simulasi kualitas air.
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
