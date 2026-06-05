import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import {
  FaWind,
  FaPlay,
  FaPause,
  FaArrowRotateLeft,
  FaSliders,
  FaCar,
  FaIndustry,
  FaFire,
  FaSmog,
  FaUsers,
  FaCloudSunRain,
  FaCity,
  FaHeadSideMask,
  FaChartBar,
  FaArrowLeft,
} from "react-icons/fa6";

// --- DEFINISI INTERFACE & TYPE ---
interface SimState {
  AQI: number;
  PM25: number;
  CO2: number;
  CO: number;
  O2: number;
}

type CitizenState = "healthy" | "coughing";

const INITIAL_VALUES: SimState = {
  AQI: 20.0,
  PM25: 12.0,
  CO2: 390.0,
  CO: 1.5,
  O2: 21.0,
};

export default function SimulasiPencemaranUdara() {
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
            console.warn("ScreenOrientation unlock/portrait lock failed:", unlockErr);
          }
        }
      };
      unlockOrientation();
    };
  }, []);

  // --- STATE KONTROL UI (REACT STATE) ---
  const [running, setRunning] = useState<boolean>(false);
  const [checkKendaraan, setCheckKendaraan] = useState<boolean>(false);
  const [checkPabrik, setCheckPabrik] = useState<boolean>(false);
  const [checkSampah, setCheckSampah] = useState<boolean>(false);
  const [slideAsap, setSlideAsap] = useState<number>(2); // 1: Sedikit, 2: Sedang, 3: Banyak
  const [slideAngin, setSlideAngin] = useState<number>(5); // 1-10

  // --- REFS UNTUK ELEMENT DOM REAL-TIME (60 FPS PERFORMANCE BYPASS) ---
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

  // --- ENGINE ENGINE LOGIC REFS ---
  const simStateRef = useRef<SimState>({ ...INITIAL_VALUES });
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

  // Sinkronisasi state menuju internal engine loop
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

  // Kontainer Array untuk Agen Visual
  const citizenArrayRef = useRef<Citizen[]>([]);
  const smokeParticlesRef = useRef<SmokeParticle[]>([]);
  const cloudsArrayRef = useRef<Cloud[]>([]);

  // --- KELAS ENTITAS / AGEN UTAMA (TYPESCRIPT) ---

  class Citizen {
    x: number;
    y: number;
    vx: number;
    height: number;
    state: CitizenState;
    hasMask: boolean;
    coughTimer: number;
    isCoughingNow: boolean;
    coughBubbleTimer: number;
    color: string;
    legCycle: number;

    constructor(canvasWidth: number, canvasHeight: number) {
      this.height = 18;
      this.state = "healthy";
      this.hasMask = false;
      this.coughTimer = 0;
      this.isCoughingNow = false;
      this.coughBubbleTimer = 0;
      this.color = `hsl(${Math.random() * 360}, 65%, 50%)`;
      this.legCycle = Math.random() * Math.PI * 2;

      this.x = Math.random() * (canvasWidth - 40) + 20;
      this.y = canvasHeight - 18 - Math.random() * 8;
      this.vx = (Math.random() - 0.5) * 1.0;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(this.x, this.y);

      let shakeX = 0;
      if (this.isCoughingNow) {
        shakeX = Math.sin(simTimeRef.current * 0.8) * 2;
      }

      // Kaki Berjalan
      this.legCycle += Math.abs(this.vx) * 0.25;
      const leftLeg = Math.sin(this.legCycle) * 4;
      const rightLeg = -Math.sin(this.legCycle) * 4;

      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(shakeX, 0);
      ctx.lineTo(leftLeg, 6);
      ctx.moveTo(shakeX, 0);
      ctx.lineTo(rightLeg, 6);
      ctx.stroke();

      // Badan
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(shakeX, -6, 5, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Kepala
      ctx.fillStyle = "#fbcfe8";
      ctx.beginPath();
      ctx.arc(shakeX, -14, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Masker Adaptif polusi
      if (this.hasMask) {
        ctx.fillStyle = "#e2e8f0";
        ctx.beginPath();
        if (this.vx >= 0) {
          ctx.arc(shakeX + 1.2, -13, 2, 0, Math.PI);
          ctx.lineTo(shakeX + 3.5, -13);
        } else {
          ctx.arc(shakeX - 1.2, -13, 2, 0, Math.PI);
          ctx.lineTo(shakeX - 3.5, -13);
        }
        ctx.fill();

        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(shakeX, -13.5);
        ctx.lineTo(shakeX - 1.5, -14);
        ctx.stroke();
      }

      // Dialog Batuk Visual
      if (this.isCoughingNow && this.coughBubbleTimer > 0) {
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath();
        ctx.arc(shakeX + 12, -24, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(shakeX + 7, -20);
        ctx.lineTo(shakeX + 3, -15);
        ctx.lineTo(shakeX + 11, -17);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 7px sans-serif";
        ctx.fillText("UHUK!", shakeX + 6, -22);
      }

      ctx.restore();
    }

    update(aqi: number, canvasWidth: number) {
      if (aqi > 100) {
        if (!this.hasMask && Math.random() < 0.05) this.hasMask = true;
      } else {
        if (this.hasMask && Math.random() < 0.01) this.hasMask = false;
      }

      if (aqi > 80) {
        const coughRisk = (aqi / 400) * (this.hasMask ? 0.001 : 0.007);
        if (!this.isCoughingNow && Math.random() < coughRisk) {
          this.isCoughingNow = true;
          this.coughTimer = 45;
          this.coughBubbleTimer = 45;
        }
      }

      if (this.isCoughingNow) {
        this.coughTimer--;
        this.coughBubbleTimer--;
        this.vx *= 0.5;
        if (this.coughTimer <= 0) {
          this.isCoughingNow = false;
          this.vx = (Math.random() - 0.5) * 1.0;
        }
      } else {
        this.x += this.vx;
        if (Math.random() < 0.01) this.vx = (Math.random() - 0.5) * 1.0;
      }

      if (this.x < 10) {
        this.x = 10;
        this.vx *= -1;
      }
      if (this.x > canvasWidth - 10) {
        this.x = canvasWidth - 10;
        this.vx *= -1;
      }
    }
  }

  class SmokeParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    color: string;
    decay: number;

    constructor(
      x: number,
      y: number,
      vx: number,
      vy: number,
      type: "pabrik" | "sampah" | "kendaraan",
    ) {
      this.x = x;
      this.y = y;
      this.vx = vx + (Math.random() - 0.5) * 0.4;
      this.vy = vy - Math.random() * 0.5;
      this.size = Math.random() * 4 + 2;
      this.alpha = 0.9;
      this.decay = Math.random() * 0.008 + 0.004;

      if (type === "pabrik") this.color = "rgba(71, 85, 105, ";
      else if (type === "sampah") this.color = "rgba(120, 113, 108, ";
      else this.color = "rgba(148, 163, 184, ";
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.fillStyle = this.color + this.alpha + ")";
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    update(windSpeed: number) {
      this.x += this.vx + windSpeed * 0.1;
      this.y += this.vy;
      this.size += 0.1;
      this.alpha -= this.decay;
    }
  }

  class Cloud {
    x: number;
    y: number;
    size: number;
    speed: number;
    canvasWidth: number;

    constructor(canvasWidth: number) {
      this.canvasWidth = canvasWidth;
      this.x = Math.random() * canvasWidth;
      this.y = Math.random() * 60 + 15;
      this.size = Math.random() * 20 + 15;
      this.speed = Math.random() * 0.15 + 0.05;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.arc(
        this.x + this.size * 0.6,
        this.y - this.size * 0.2,
        this.size * 0.8,
        0,
        Math.PI * 2,
      );
      ctx.arc(
        this.x + this.size * 1.2,
        this.y,
        this.size * 0.6,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    update(windSpeed: number) {
      this.x += this.speed * (windSpeed * 0.4 + 0.5);
      if (this.x - this.size * 2 > this.canvasWidth) {
        this.x = -this.size * 2;
        this.y = Math.random() * 60 + 15;
      }
    }
  }

  const populateSim = (width: number, height: number) => {
    const citizens: Citizen[] = [];
    for (let i = 0; i < 10; i++) citizens.push(new Citizen(width, height));
    citizenArrayRef.current = citizens;

    const clouds: Cloud[] = [];
    for (let i = 0; i < 3; i++) clouds.push(new Cloud(width));
    cloudsArrayRef.current = clouds;

    smokeParticlesRef.current = [];
  };

  // --- ENGINE INTERFACE MAIN RENDERING CANVAS LOOP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        if (citizenArrayRef.current.length === 0) {
          populateSim(canvas.width, canvas.height);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    let animationFrameId: number;

    const drawCitySkyline = (width: number, height: number) => {
      // Bukit Jauh
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.quadraticCurveTo(width * 0.3, height - 80, width * 0.6, height);
      ctx.moveTo(width * 0.4, height);
      ctx.quadraticCurveTo(width * 0.75, height - 60, width, height);
      ctx.fill();

      // Pohon / Taman kota
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(100, height - 25, 12, 0, Math.PI * 2);
      ctx.arc(115, height - 30, 15, 0, Math.PI * 2);
      ctx.arc(130, height - 25, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#047857";
      ctx.fillRect(112, height - 25, 6, 12);

      // Trotoar & Jalan Raya
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(0, height - 25, width, 25);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(0, height - 18, width, 5);

      // Pabrik Industri
      ctx.fillStyle = "#64748b";
      ctx.fillRect(width - 120, height - 85, 80, 60);
      ctx.fillStyle = "#475569";
      ctx.fillRect(width - 100, height - 45, 20, 20);

      // Cerobong asap
      ctx.fillStyle = "#475569";
      ctx.fillRect(width - 65, height - 125, 16, 50);
      ctx.fillStyle = "#f43f5e";
      ctx.fillRect(width - 65, height - 120, 16, 6);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(width - 65, height - 114, 16, 6);

      // Tong sampah terbakar
      ctx.fillStyle = "#78716c";
      ctx.fillRect(180, height - 40, 25, 22);
      if (inputsRef.current.checkSampah) {
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.moveTo(182, height - 40);
        ctx.lineTo(192.5, height - 52);
        ctx.lineTo(203, height - 40);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.moveTo(186, height - 40);
        ctx.lineTo(192.5, height - 48);
        ctx.lineTo(199, height - 40);
        ctx.closePath();
        ctx.fill();
      }

      // Mobil bergerak
      if (inputsRef.current.checkKendaraan && runningRef.current) {
        const speed = inputsRef.current.slideAsap * 1.5 + 0.5;
        carXRef.current += speed;
        if (carXRef.current - 45 > width) carXRef.current = -40;
      }
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(carXRef.current, height - 35, 34, 12);
      ctx.fillStyle = "#1d4ed8";
      ctx.fillRect(carXRef.current + 6, height - 43, 20, 9);
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(carXRef.current + 8, height - 23, 4, 0, Math.PI * 2);
      ctx.arc(carXRef.current + 26, height - 23, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawSmogOverlay = (width: number, height: number, aqi: number) => {
      const opacity = Math.min(0.72, aqi / 400);
      if (opacity > 0.05) {
        ctx.fillStyle = `rgba(100, 95, 90, ${opacity})`;
        ctx.fillRect(0, 0, width, height);
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const state = simStateRef.current;

      if (runningRef.current) {
        simTimeRef.current++;
        const {
          checkKendaraan: mob,
          checkPabrik: pbr,
          checkSampah: smp,
          slideAsap: asap,
          slideAngin: angin,
        } = inputsRef.current;
        const dispersionFactor = angin * 0.015;

        let pmFactor = 0,
          co2Factor = 0,
          coFactor = 0;
        if (mob) {
          pmFactor += asap * 0.35;
          coFactor += asap * 1.2;
          co2Factor += asap * 2.5;
        }
        if (pbr) {
          pmFactor += asap * 0.7;
          coFactor += asap * 0.5;
          co2Factor += asap * 5.0;
        }
        if (smp) {
          pmFactor += asap * 0.65;
          coFactor += asap * 1.5;
          co2Factor += asap * 1.8;
        }

        state.PM25 +=
          (INITIAL_VALUES.PM25 + pmFactor * 52 - state.PM25) * 0.02 -
          state.PM25 * dispersionFactor * 0.4;
        state.PM25 = Math.max(2.0, state.PM25);

        state.CO2 +=
          (INITIAL_VALUES.CO2 + co2Factor * 90 - state.CO2) * 0.02 -
          (state.CO2 - 380) * dispersionFactor * 0.3;
        state.CO2 = Math.max(380.0, state.CO2);

        state.CO +=
          (INITIAL_VALUES.CO + coFactor * 8 - state.CO) * 0.02 -
          state.CO * dispersionFactor * 0.4;
        state.CO = Math.max(0.1, state.CO);

        state.O2 = Math.max(
          14.0,
          INITIAL_VALUES.O2 - ((state.CO2 - 390.0) * 0.003 + state.CO * 0.02),
        );

        const calculatedAQI =
          state.PM25 * 1.8 + state.CO * 4.0 + (state.CO2 - 390) * 0.3;
        state.AQI +=
          (calculatedAQI - state.AQI) * 0.05 -
          state.AQI * dispersionFactor * 0.1;
        state.AQI = Math.min(450, Math.max(5, state.AQI));

        // Spawn partikel emisi visual asap
        if (pbr && Math.random() < asap * 0.25 + 0.1) {
          smokeParticlesRef.current.push(
            new SmokeParticle(
              canvas.width - 57,
              canvas.height - 125,
              -0.2,
              -0.4,
              "pabrik",
            ),
          );
        }
        if (smp && Math.random() < asap * 0.2 + 0.1) {
          smokeParticlesRef.current.push(
            new SmokeParticle(192, canvas.height - 40, 0.1, -0.3, "sampah"),
          );
        }
        if (mob && Math.random() < asap * 0.15 + 0.05) {
          smokeParticlesRef.current.push(
            new SmokeParticle(
              carXRef.current - 2,
              canvas.height - 25,
              -0.5,
              0.0,
              "kendaraan",
            ),
          );
        }

        // --- MANIPULASI ELEMENT GRAPH BAR DOM SECARA LANGSUNG (60 FPS OVERPASS) ---
        const pctAQI = Math.min(100, Math.max(0, (state.AQI / 400) * 100));
        const pctPM25 = Math.min(100, Math.max(0, (state.PM25 / 250) * 100));
        const pctCO2 = Math.min(100, Math.max(0, (state.CO2 / 1000) * 100));
        const pctCO = Math.min(100, Math.max(0, (state.CO / 50) * 100));
        const pctO2 = Math.min(100, Math.max(0, (state.O2 / 25) * 100));

        if (barAqiRef.current) barAqiRef.current.style.height = `${pctAQI}%`;
        if (barPm25Ref.current) barPm25Ref.current.style.height = `${pctPM25}%`;
        if (barCo2Ref.current) barCo2Ref.current.style.height = `${pctCO2}%`;
        if (barCoRef.current) barCoRef.current.style.height = `${pctCO}%`;
        if (barO2Ref.current) barO2Ref.current.style.height = `${pctO2}%`;

        if (barAqiValRef.current) {
          barAqiValRef.current.style.bottom = `calc(${pctAQI}% + 4px)`;
          barAqiValRef.current.innerText = state.AQI.toFixed(0);
        }
        if (barPm25ValRef.current) {
          barPm25ValRef.current.style.bottom = `calc(${pctPM25}% + 4px)`;
          barPm25ValRef.current.innerText = state.PM25.toFixed(1);
        }
        if (barCo2ValRef.current) {
          barCo2ValRef.current.style.bottom = `calc(${pctCO2}% + 4px)`;
          barCo2ValRef.current.innerText = state.CO2.toFixed(0);
        }
        if (barCoValRef.current) {
          barCoValRef.current.style.bottom = `calc(${pctCO}% + 4px)`;
          barCoValRef.current.innerText = state.CO.toFixed(1);
        }
        if (barO2ValRef.current) {
          barO2ValRef.current.style.bottom = `calc(${pctO2}% + 4px)`;
          barO2ValRef.current.innerText = `${state.O2.toFixed(1)}%`;
        }

        const coughingWarga = citizenArrayRef.current.filter(
          (c) => c.isCoughingNow,
        ).length;
        const healthyWarga = citizenArrayRef.current.length - coughingWarga;
        if (hudHealthyRef.current)
          hudHealthyRef.current.innerText = String(healthyWarga);
        if (hudCoughingRef.current)
          hudCoughingRef.current.innerText = String(coughingWarga);
        if (hudSmogRef.current)
          hudSmogRef.current.innerText = `${Math.min(100, (state.AQI / 400) * 100).toFixed(0)}%`;

        if (hudMaskWarningRef.current) {
          hudMaskWarningRef.current.className = `absolute top-2 right-2 flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 text-[8px] px-1.5 py-0.5 rounded font-extrabold shadow-sm transition-all duration-300 ${
            state.AQI > 100 ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`;
        }

        if (txtWarnaRef.current) {
          if (state.AQI < 50) {
            txtWarnaRef.current.innerText = "Udara Bersih";
            txtWarnaRef.current.className =
              "text-[10px] font-bold text-sky-600";
          } else if (state.AQI < 150) {
            txtWarnaRef.current.innerText = "Kabut Ringan";
            txtWarnaRef.current.className =
              "text-[10px] font-bold text-slate-500";
          } else {
            txtWarnaRef.current.innerText = "Pekat Bahaya";
            txtWarnaRef.current.className =
              "text-[10px] font-bold text-amber-700 animate-pulse";
          }
        }

        if (txtPerilakuRef.current) {
          if (coughingWarga === 0) {
            txtPerilakuRef.current.innerText = "Normal Sehat";
            txtPerilakuRef.current.className =
              "text-[10px] font-bold text-emerald-600";
          } else if (state.AQI > 250) {
            txtPerilakuRef.current.innerText = "Banyak Batuk!";
            txtPerilakuRef.current.className =
              "text-[10px] font-bold text-red-600 animate-bounce";
          } else {
            txtPerilakuRef.current.innerText = "Batuk Ringan";
            txtPerilakuRef.current.className =
              "text-[10px] font-bold text-amber-500";
          }
        }

        if (txtToksikRef.current) {
          if (state.AQI < 100) {
            txtToksikRef.current.innerText = "Aman";
            txtToksikRef.current.className =
              "text-[10px] font-bold text-emerald-600";
          } else if (state.AQI < 200) {
            txtToksikRef.current.innerText = "Waspada Masker";
            txtToksikRef.current.className =
              "text-[10px] font-bold text-amber-500 font-extrabold";
          } else {
            txtToksikRef.current.innerText = "Evakuasi Medis!";
            txtToksikRef.current.className =
              "text-[10px] font-bold text-red-500 font-black animate-pulse";
          }
        }

        if (airStatusBadgeRef.current) {
          if (state.AQI < 50) {
            airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Sehat (Baik)`;
            airStatusBadgeRef.current.className =
              "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-emerald-100 text-emerald-700 border-emerald-200";
          } else if (state.AQI < 150) {
            airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Tidak Sehat`;
            airStatusBadgeRef.current.className =
              "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-amber-100 text-amber-700 border-amber-200";
          } else {
            airStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Berbahaya!`;
            airStatusBadgeRef.current.className =
              "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-red-100 text-red-700 border-red-200";
          }
        }
      }

      // --- STAGE RENDER VISUAL FRAME ---
      drawCitySkyline(canvas.width, canvas.height);

      for (const cloud of cloudsArrayRef.current) {
        cloud.update(inputsRef.current.slideAngin);
        cloud.draw(ctx);
      }

      for (let i = smokeParticlesRef.current.length - 1; i >= 0; i--) {
        const p = smokeParticlesRef.current[i];
        p.update(inputsRef.current.slideAngin);
        p.draw(ctx);
        if (p.alpha <= 0 || p.x > canvas.width || p.y < 0) {
          smokeParticlesRef.current.splice(i, 1);
        }
      }

      for (const citizen of citizenArrayRef.current) {
        citizen.update(state.AQI, canvas.width);
        citizen.draw(ctx);
      }

      drawSmogOverlay(canvas.width, canvas.height, state.AQI);

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- KONTROL EVENT BUTTON HANDLER ---
  const handleReset = () => {
    setRunning(false);
    simTimeRef.current = 0;
    carXRef.current = 50;
    simStateRef.current = { ...INITIAL_VALUES };

    setCheckKendaraan(false);
    setCheckPabrik(false);
    setCheckSampah(false);
    setSlideAsap(2);
    setSlideAngin(5);

    const canvas = canvasRef.current;
    if (canvas) populateSim(canvas.width, canvas.height);
  };

  const handleAddCitizen = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      for (let i = 0; i < 5; i++) {
        citizenArrayRef.current.push(new Citizen(canvas.width, canvas.height));
      }
    }
  };

  const handlePurify = () => {
    setCheckKendaraan(false);
    setCheckPabrik(false);
    setCheckSampah(false);

    simStateRef.current = { ...INITIAL_VALUES };
    smokeParticlesRef.current = [];

    for (const citizen of citizenArrayRef.current) {
      citizen.isCoughingNow = false;
      citizen.hasMask = false;
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 flex flex-col h-screen font-sans select-none overflow-hidden w-full">
      {/* HEADER UTAMA */}
      <header className="bg-white border-b border-slate-200 px-4 py-1.5 flex justify-between items-center h-12 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/simulasi")}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-all flex items-center justify-center mr-1 shadow-sm border border-slate-200 active:scale-95 cursor-pointer"
            title="Kembali ke Pilihan Simulasi"
          >
            <FaArrowLeft className="text-xs" />
          </button>
          <FaWind className="text-sky-500 text-lg animate-pulse" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900">
              Eko-Simulasi Udara
            </h1>
            <p className="text-[10px] text-slate-500 leading-none">
              Interaktif Kualitas Udara & Dampak Kesehatan
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

      {/* DASHBOARD UTAMA */}
      <main className="flex-1 grid grid-cols-12 gap-2.5 p-2.5 overflow-hidden min-h-0">
        {/* KOLOM 1: INPUT CONTROLS */}
        <section className="col-span-3 bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between h-full overflow-y-auto custom-scroll">
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FaSliders className="text-rose-500" /> Sumber Polusi
            </h2>

            {/* Input Kendaraan */}
            <div
              className={`p-2 rounded-lg border transition-all duration-300 ${
                checkKendaraan
                  ? "bg-sky-50/70 border-sky-300"
                  : "bg-slate-50 border-slate-100"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-sky-600 flex items-center gap-1">
                  <FaCar className="text-[10px]" /> Kendaraan Bermotor
                </span>
                <label className="relative inline-flex items-center cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    checked={checkKendaraan}
                    onChange={(e) => setCheckKendaraan(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-sky-500 transition-colors border border-slate-300"></div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider min-w-[32px] ${
                      checkKendaraan
                        ? "text-sky-600 font-black animate-pulse"
                        : "text-slate-400"
                    }`}
                  >
                    {checkKendaraan ? "AKTIF" : "MATI"}
                  </span>
                </label>
              </div>
            </div>

            {/* Input Pabrik */}
            <div
              className={`p-2 rounded-lg border transition-all duration-300 ${
                checkPabrik
                  ? "bg-amber-50/70 border-amber-300"
                  : "bg-slate-50 border-slate-100"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  <FaIndustry className="text-[10px]" /> Pabrik / Industri
                </span>
                <label className="relative inline-flex items-center cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    checked={checkPabrik}
                    onChange={(e) => setCheckPabrik(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500 transition-colors border border-slate-300"></div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider min-w-[32px] ${
                      checkPabrik
                        ? "text-amber-600 font-black animate-pulse"
                        : "text-slate-400"
                    }`}
                  >
                    {checkPabrik ? "AKTIF" : "MATI"}
                  </span>
                </label>
              </div>
            </div>

            {/* Input Pembakaran Sampah */}
            <div
              className={`p-2 rounded-lg border transition-all duration-300 ${
                checkSampah
                  ? "bg-orange-50/70 border-orange-300"
                  : "bg-slate-50 border-slate-100"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                  <FaFire className="text-[10px]" /> Pembakaran Sampah
                </span>
                <label className="relative inline-flex items-center cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    checked={checkSampah}
                    onChange={(e) => setCheckSampah(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500 transition-colors border border-slate-300"></div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider min-w-[32px] ${
                      checkSampah
                        ? "text-orange-600 font-black animate-pulse"
                        : "text-slate-400"
                    }`}
                  >
                    {checkSampah ? "AKTIF" : "MATI"}
                  </span>
                </label>
              </div>
            </div>

            {/* Slider Intensitas Asap */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] font-bold text-slate-600 block mb-1">
                <FaSmog className="text-rose-500" /> Jumlah Emisi Asap
              </span>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Kapasitas Emisi</span>
                  <span className="font-mono font-bold text-rose-600 animate-pulse">
                    {slideAsap === 1
                      ? "Sedikit"
                      : slideAsap === 2
                        ? "Sedang"
                        : "Banyak"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  value={slideAsap}
                  onChange={(e) => setSlideAsap(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[8px] text-slate-400 font-bold px-1">
                  <span>SEDIKIT</span> <span>SEDANG</span> <span>BANYAK</span>
                </div>
              </div>
            </div>

            {/* Kecepatan Angin */}
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] font-bold text-emerald-600 block mb-1">
                <FaWind /> Kecepatan Angin / Dispersi
              </span>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Arus Angin</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {slideAngin <= 3
                      ? "Tenang"
                      : slideAngin <= 7
                        ? "Normal"
                        : "Kencang"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={slideAngin}
                  onChange={(e) => setSlideAngin(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex gap-1.5 shrink-0">
            <button
              onClick={handleAddCitizen}
              className="flex-1 py-1.5 bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-600 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 border border-sky-100"
            >
              <FaUsers /> +5 Warga
            </button>
            <button
              onClick={handlePurify}
              className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-600 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 border border-emerald-100"
            >
              <FaCloudSunRain /> Hujan Buatan
            </button>
          </div>
        </section>

        {/* KOLOM 2: INTERAKTIF ATMOSFER KOTA */}
        <section className="col-span-5 bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between h-full">
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <div className="flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <FaCity className="text-sky-500" /> Atmosfer Kota Interaktif
              </h3>
              <div
                ref={airStatusBadgeRef}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-emerald-100 text-emerald-700 border-emerald-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sehat (Baik)
              </div>
            </div>

            <div className="relative flex-1 bg-linear-to-b from-sky-200 via-sky-100 to-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-inner">
              <canvas ref={canvasRef} className="w-full h-full block"></canvas>

              {/* Overlay HUD Mini */}
              <div className="absolute bottom-2 left-2 bg-white/90 border border-slate-200/80 p-1.5 rounded shadow-sm text-[9px] space-y-0.5 pointer-events-none backdrop-blur-sm">
                <div className="flex justify-between gap-3 text-slate-600">
                  <span>Warga Sehat / Batuk:</span>
                  <span className="font-mono font-bold text-slate-800">
                    <span ref={hudHealthyRef}>10</span>/
                    <span ref={hudCoughingRef} className="text-rose-500">
                      0
                    </span>
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-slate-600">
                  <span>Indeks Kabut Asap:</span>
                  <span
                    ref={hudSmogRef}
                    className="font-mono font-bold text-sky-600"
                  >
                    0%
                  </span>
                </div>
              </div>

              {/* Banner Masker Visual Warning */}
              <div
                ref={hudMaskWarningRef}
                className="absolute top-2 right-2 flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 text-[8px] px-1.5 py-0.5 rounded font-extrabold shadow-sm transition-all duration-300 opacity-0 scale-90"
              >
                <FaHeadSideMask className="animate-bounce" /> PERINGATAN: PAKAI
                MASKER!
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mt-2 text-center shrink-0">
            <div className="p-1 bg-slate-50 rounded border border-slate-100">
              <span className="block text-[8px] text-slate-400 uppercase font-bold">
                Laju Kabut
              </span>
              <span
                ref={txtWarnaRef}
                className="text-[10px] font-bold text-sky-500"
              >
                Cerah Bersih
              </span>
            </div>
            <div className="p-1 bg-slate-50 rounded border border-slate-100">
              <span className="block text-[8px] text-slate-400 uppercase font-bold">
                Kondisi Fisik
              </span>
              <span
                ref={txtPerilakuRef}
                className="text-[10px] font-bold text-emerald-500"
              >
                Normal Sehat
              </span>
            </div>
            <div className="p-1 bg-slate-50 rounded border border-slate-100">
              <span className="block text-[8px] text-slate-400 uppercase font-bold">
                Peringatan
              </span>
              <span
                ref={txtToksikRef}
                className="text-[10px] font-bold text-slate-500"
              >
                Aman
              </span>
            </div>
          </div>
        </section>

        {/* KOLOM 3: REAL-TIME GRAPH METRICS */}
        <section className="col-span-4 bg-white border border-slate-200 rounded-xl p-3 flex flex-col h-full overflow-hidden">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between items-center shrink-0 mb-4">
            <span>
              <FaChartBar className="text-sky-500" /> Grafik Parameter Udara
            </span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">
              Real-Time
            </span>
          </h2>

          <div className="flex-1 flex flex-col min-h-0 relative mt-2 select-none">
            {/* Grid Lines Skala Belakang */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-l border-b border-slate-200 pb-7 pl-6">
              <div className="w-full border-t border-slate-100 relative">
                <span className="absolute -left-6 -top-2 text-[8px] text-slate-400 font-bold font-mono">
                  AQI 400
                </span>
              </div>
              <div className="w-full border-t border-slate-100 relative">
                <span className="absolute -left-6 -top-2 text-[8px] text-slate-400 font-bold font-mono">
                  AQI 300
                </span>
              </div>
              <div className="w-full border-t border-slate-100 relative">
                <span className="absolute -left-6 -top-2 text-[8px] text-slate-400 font-bold font-mono">
                  AQI 200
                </span>
              </div>
              <div className="w-full border-t border-slate-100 relative">
                <span className="absolute -left-6 -top-2 text-[8px] text-slate-400 font-bold font-mono">
                  AQI 100
                </span>
              </div>
              <div className="w-full relative">
                <span className="absolute -left-6 -top-2 text-[8px] text-slate-400 font-bold font-mono">
                  AQI 0
                </span>
              </div>
            </div>

            {/* Container Kolom Batang Dinamis */}
            <div className="flex-1 flex justify-around items-end pl-6 pb-7 h-full relative z-10">
              {/* AQI */}
              <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
                <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
                  <span
                    ref={barAqiValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-emerald-700 whitespace-nowrap bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded shadow-sm transition-all duration-300 ease-out"
                    style={{ bottom: "12%" }}
                  >
                    48
                  </span>
                  <div
                    ref={barAqiRef}
                    className="w-full bg-linear-to-t from-emerald-400 to-emerald-500 rounded-b-md rounded-t-sm transition-all duration-300 ease-out shadow-sm"
                    style={{ height: "12%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase">
                  AQI
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight">
                  indeks
                </span>
              </div>

              {/* PM2.5 */}
              <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
                <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
                  <span
                    ref={barPm25ValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-emerald-700 whitespace-nowrap bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded shadow-sm transition-all duration-300 ease-out"
                    style={{ bottom: "6%" }}
                  >
                    15
                  </span>
                  <div
                    ref={barPm25Ref}
                    className="w-full bg-linear-to-t from-emerald-400 to-emerald-500 rounded-b-md rounded-t-sm transition-all duration-300 ease-out shadow-sm"
                    style={{ height: "6%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase">
                  PM2.5
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight">
                  µg/m³
                </span>
              </div>

              {/* CO2 */}
              <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
                <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
                  <span
                    ref={barCo2ValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-cyan-700 whitespace-nowrap bg-cyan-50 border border-cyan-200 px-1 py-0.2 rounded shadow-sm transition-all duration-300 ease-out"
                    style={{ bottom: "40%" }}
                  >
                    400
                  </span>
                  <div
                    ref={barCo2Ref}
                    className="w-full bg-linear-to-t from-cyan-400 to-cyan-500 rounded-b-md rounded-t-sm transition-all duration-300 ease-out shadow-sm"
                    style={{ height: "40%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase">
                  CO2
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight">
                  ppm
                </span>
              </div>

              {/* CO */}
              <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
                <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
                  <span
                    ref={barCoValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-sky-700 whitespace-nowrap bg-sky-50 border border-sky-200 px-1 py-0.2 rounded shadow-sm transition-all duration-300 ease-out"
                    style={{ bottom: "4%" }}
                  >
                    2
                  </span>
                  <div
                    ref={barCoRef}
                    className="w-full bg-linear-to-t from-sky-400 to-sky-500 rounded-b-md rounded-t-sm transition-all duration-300 ease-out shadow-sm"
                    style={{ height: "4%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase">
                  CO
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight">
                  ppm
                </span>
              </div>

              {/* Oksigen */}
              <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
                <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
                  <span
                    ref={barO2ValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-blue-700 whitespace-nowrap bg-blue-50 border border-blue-200 px-1 py-0.2 rounded shadow-sm transition-all duration-300 ease-out"
                    style={{ bottom: "84%" }}
                  >
                    21.0
                  </span>
                  <div
                    ref={barO2Ref}
                    className="w-full bg-linear-to-t from-blue-400 to-blue-500 rounded-b-md rounded-t-sm transition-all duration-300 ease-out shadow-sm"
                    style={{ height: "84%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase">
                  Oksigen
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight">
                  % Vol
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
        <p className="text-xs text-neutral-400 max-w-[280px] leading-relaxed">
          Silakan putar perangkat Anda ke arah lanskap (menyamping) untuk
          mengakses eko-simulasi pencemaran udara.
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
