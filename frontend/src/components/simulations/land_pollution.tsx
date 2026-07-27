import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import {
  FaSeedling,
  FaPlay,
  FaPause,
  FaArrowRotateLeft,
  FaSliders,
  FaLeaf,
  FaTrashCan,
  FaCloudShowersHeavy,
  FaFish,
  FaBroom,
  FaMountainSun,
  FaChartBar,
  FaArrowLeft,
} from "react-icons/fa6";

// --- DEFINISI INTERFACE & TYPE ---
interface SimState {
  pH: number;
  fertility: number;
  rootHealth: number;
  toxicity: number;
  yield: number;
}

type TrashType = "organik" | "anorganik";
type FishState = "alive" | "struggling" | "dead";

interface WasteSprite {
  subtype: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

const INITIAL_VALUES: SimState = {
  pH: 7.0,
  fertility: 80.0,
  rootHealth: 100.0,
  toxicity: 0.0,
  yield: 0.0,
};

const getSurfaceY = (x: number, pondStartX: number, time: number): number => {
  if (x < pondStartX) {
    return 100;
  }
  return 100 + Math.sin(x * 0.05 + time * 0.06) * 1.5;
};

export default function SimulasiPencemaranTanah() {
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

  // --- REACT CONTROL STATES ---
  const [running, setRunning] = useState<boolean>(false);
  const [trashType, setTrashType] = useState<TrashType>("organik");
  const [jumlahSampah, setJumlahSampah] = useState<number>(20);
  const [hujan, setHujan] = useState<number>(4);
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

  // --- REFS UNTUK ELEMENT DOM (Akses Cepat 60 FPS Tanpa Hambatan Siklus React) ---
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

  // Sinkronisasi konstan state interaksi menuju Engine Loop
  useEffect(() => {
    runningRef.current = running;
  }, [running]);
  useEffect(() => {
    inputsRef.current = { trashType, jumlahSampah, hujan };
  }, [trashType, jumlahSampah, hujan]);

  // Kontainer Array untuk Agen Visual
  const fishArrayRef = useRef<Fish[]>([]);
  const rainParticlesRef = useRef<RainParticle[]>([]);
  const seepageParticlesRef = useRef<SeepageParticle[]>([]);
  const wasteSpritesRef = useRef<WasteSprite[]>([]);

  // --- KELAS AGEN/ENTITAS SIMULASI (TYPESCRIPT) ---

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
      const minX = canvasWidth * 0.65;
      const maxX = canvasWidth - 20;
      const minY = 120;
      const maxY = canvasHeight - 15;

      this.x = Math.random() * (maxX - minX) + minX;
      this.y = Math.random() * (maxY - minY) + minY;
      this.size = Math.random() * 5 + 8;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.colorHue = Math.floor(Math.random() * 20) + 15;
      this.state = stateType;
      this.wiggleFactor = Math.random() * 10;
      this.wiggleSpeed = 0.12;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(this.x, this.y);

      let angle = Math.atan2(this.vy, this.vx);
      if (this.state === "dead") angle = Math.PI;
      ctx.rotate(angle);

      this.wiggleFactor += this.wiggleSpeed;
      const tailWiggle = Math.sin(this.wiggleFactor) * 3;

      let fishBodyColor = `hsl(${this.colorHue}, 90%, 55%)`;
      let eyeColor = "#000000";

      if (this.state === "struggling") {
        fishBodyColor = `hsl(${this.colorHue}, 50%, 65%)`;
      } else if (this.state === "dead") {
        fishBodyColor = `#cbd5e1`;
        eyeColor = "#f43f5e";
      }

      // Ekor
      ctx.beginPath();
      ctx.fillStyle = fishBodyColor;
      ctx.moveTo(-this.size, 0);
      ctx.lineTo(-this.size * 1.4, -this.size * 0.4 + tailWiggle);
      ctx.lineTo(-this.size * 1.2, 0);
      ctx.lineTo(-this.size * 1.4, this.size * 0.4 + tailWiggle);
      ctx.closePath();
      ctx.fill();

      // Tubuh
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

    update(waterToxicity: number, canvasWidth: number, canvasHeight: number) {
      const minX = canvasWidth * 0.65;
      const maxX = canvasWidth - 20;
      const minY = 120;
      const maxY = canvasHeight - 15;

      if (waterToxicity > 40) {
        if (this.state === "alive") this.state = "struggling";
        const hazard = (waterToxicity - 40) * 0.0008;
        if (this.state === "struggling" && Math.random() < hazard) {
          this.state = "dead";
          this.vy = -0.3;
          this.vx = (Math.random() - 0.5) * 0.05;
        }
      } else {
        if (this.state === "alive" || this.state === "struggling")
          this.state = "alive";
      }

      if (this.state === "alive") {
        this.x += this.vx;
        this.y += this.vy;
        if (Math.random() < 0.01) {
          this.vx = (Math.random() - 0.5) * 1.4;
          this.vy = (Math.random() - 0.5) * 0.6;
        }
        if (this.x < minX) {
          this.x = minX;
          this.vx *= -1;
        }
        if (this.x > maxX) {
          this.x = maxX;
          this.vx *= -1;
        }
        if (this.y < minY + 10) {
          this.y = minY + 10;
          this.vy *= -1;
        }
        if (this.y > maxY) {
          this.y = maxY;
          this.vy *= -1;
        }
      } else if (this.state === "struggling") {
        this.x += this.vx * 0.5;
        this.y += this.vy * 0.5;
        if (this.y > minY + 15) this.vy -= 0.02;
        if (Math.random() < 0.02) {
          this.vx = (Math.random() - 0.5) * 0.8;
          this.vy = (Math.random() - 0.5) * 0.4;
        }
        if (this.x < minX) {
          this.x = minX;
          this.vx *= -1;
        }
        if (this.x > maxX) {
          this.x = maxX;
          this.vx *= -1;
        }
        if (this.y < minY + 5) {
          this.y = minY + 5;
          this.vy = 0.1;
        }
        if (this.y > maxY) {
          this.y = maxY;
          this.vy = -0.1;
        }
      } else if (this.state === "dead") {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y > minY + 5) {
          this.vy = -0.3;
        } else {
          this.vy = 0;
          this.vx = Math.sin(simTimeRef.current * 0.05) * 0.05;
        }
        if (this.x < minX) this.x = minX;
        if (this.x > maxX) this.x = maxX;
      }
    }
  }

  class RainParticle {
    x: number;
    y: number;
    vy: number;
    vx: number;
    length: number;

    constructor(canvasWidth: number) {
      this.x = Math.random() * canvasWidth;
      this.y = -10;
      this.vy = Math.random() * 4 + 5;
      this.vx = -1;
      this.length = Math.random() * 8 + 6;
    }

    draw(ctx: CanvasRenderingContext2D, pondStartX: number, time: number) {
      const surfaceY = getSurfaceY(this.x, pondStartX, time);
      if (this.y >= surfaceY) return;

      const endY = Math.min(this.y + this.vy, surfaceY);
      const endX = this.x + (this.vx * (endY - this.y)) / this.vy;

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = "rgba(14, 165, 233, 0.4)";
      ctx.lineWidth = 1;
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.restore();
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
    }
  }

  class SeepageParticle {
    x: number;
    y: number;
    vy: number;
    vx: number;
    color: string;
    size: number;

    constructor(startX: number, currentTrash: TrashType) {
      this.x = startX + (Math.random() - 0.5) * 20;
      this.y = 105;
      this.vy = Math.random() * 0.5 + 0.3;
      this.vx = Math.random() * 0.4 + 0.2;
      this.color =
        currentTrash === "anorganik"
          ? `rgba(244, 63, 94, ${Math.random() * 0.6 + 0.2})`
          : `rgba(120, 113, 108, ${Math.random() * 0.5 + 0.2})`;
      this.size = Math.random() * 2 + 1.5;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    update() {
      this.y += this.vy;
      this.x += this.vx;
    }
  }

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
        size: Math.random() * 6 + 18, // slightly larger for detailed vector drawings
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

  // Render aset tanaman dinamis
  // --- RENDERING HELPERS FOR ORGANIC & INORGANIC WASTE ---
  const drawAppleCore = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.save();
    // Stem (brown)
    ctx.strokeStyle = "#5c4033";
    ctx.lineWidth = size * 0.08;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.3);
    ctx.quadraticCurveTo(size * 0.1, -size * 0.5, size * 0.2, -size * 0.45);
    ctx.stroke();

    // Leaf (green)
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.ellipse(
      size * 0.1,
      -size * 0.4,
      size * 0.15,
      size * 0.08,
      Math.PI / 4,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Top cap skin (red)
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(0, -size * 0.2, size * 0.3, Math.PI, 0, false);
    ctx.fill();

    // Bottom cap skin (red)
    ctx.beginPath();
    ctx.arc(0, size * 0.2, size * 0.3, 0, Math.PI, false);
    ctx.fill();

    // Top/Bottom flesh (cream/yellowish)
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.18, size * 0.28, size * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, size * 0.18, size * 0.28, size * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Core shaft (eaten inside)
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, -size * 0.18);
    ctx.bezierCurveTo(
      -size * 0.04,
      -size * 0.05,
      -size * 0.04,
      size * 0.05,
      -size * 0.1,
      size * 0.18,
    );
    ctx.lineTo(size * 0.1, size * 0.18);
    ctx.bezierCurveTo(
      size * 0.04,
      size * 0.05,
      size * 0.04,
      -size * 0.05,
      size * 0.1,
      -size * 0.18,
    );
    ctx.closePath();
    ctx.fill();

    // Seeds (dark brown)
    ctx.fillStyle = "#451a03";
    ctx.beginPath();
    ctx.ellipse(
      -size * 0.03,
      -size * 0.02,
      size * 0.03,
      size * 0.05,
      -Math.PI / 8,
      0,
      Math.PI * 2,
    );
    ctx.ellipse(
      size * 0.03,
      size * 0.02,
      size * 0.03,
      size * 0.05,
      Math.PI / 8,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  };

  const drawBananaPeel = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.save();
    ctx.fillStyle = "#eab308";
    ctx.strokeStyle = "#ca8a04";
    ctx.lineWidth = size * 0.04;
    ctx.lineJoin = "round";

    // Left peel
    ctx.beginPath();
    ctx.moveTo(0, size * 0.2);
    ctx.bezierCurveTo(
      -size * 0.3,
      size * 0.2,
      -size * 0.5,
      0,
      -size * 0.5,
      -size * 0.2,
    );
    ctx.bezierCurveTo(
      -size * 0.35,
      -size * 0.1,
      -size * 0.15,
      size * 0.1,
      0,
      size * 0.2,
    );
    ctx.fill();
    ctx.stroke();

    // Right peel
    ctx.beginPath();
    ctx.moveTo(0, size * 0.2);
    ctx.bezierCurveTo(
      size * 0.3,
      size * 0.2,
      size * 0.5,
      0,
      size * 0.5,
      -size * 0.2,
    );
    ctx.bezierCurveTo(
      size * 0.35,
      -size * 0.1,
      size * 0.15,
      size * 0.1,
      0,
      size * 0.2,
    );
    ctx.fill();
    ctx.stroke();

    // Center peel
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, size * 0.2);
    ctx.bezierCurveTo(
      -size * 0.15,
      -size * 0.1,
      -size * 0.05,
      -size * 0.4,
      0,
      -size * 0.45,
    );
    ctx.bezierCurveTo(
      size * 0.05,
      -size * 0.4,
      size * 0.15,
      -size * 0.1,
      size * 0.1,
      size * 0.2,
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Brown tips/spots
    ctx.fillStyle = "#713f12";
    ctx.beginPath();
    ctx.moveTo(-size * 0.05, -size * 0.38);
    ctx.bezierCurveTo(0, -size * 0.42, 0, -size * 0.45, 0, -size * 0.45);
    ctx.bezierCurveTo(
      0,
      -size * 0.45,
      size * 0.02,
      -size * 0.42,
      size * 0.05,
      -size * 0.38,
    );
    ctx.closePath();
    ctx.fill();

    // Left/Right tips
    ctx.beginPath();
    ctx.moveTo(-size * 0.42, -size * 0.15);
    ctx.lineTo(-size * 0.5, -size * 0.2);
    ctx.lineTo(-size * 0.45, -size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(size * 0.42, size * -0.15);
    ctx.lineTo(size * 0.5, size * -0.2);
    ctx.lineTo(size * 0.45, size * -0.1);
    ctx.closePath();
    ctx.fill();

    // Crown/stem base
    ctx.fillStyle = "#451a03";
    ctx.beginPath();
    ctx.arc(0, size * 0.2, size * 0.1, 0, Math.PI, false);
    ctx.fill();
    ctx.restore();
  };

  const drawWitheredLeaf = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.save();
    const grad = ctx.createLinearGradient(
      -size * 0.3,
      -size * 0.3,
      size * 0.3,
      size * 0.3,
    );
    grad.addColorStop(0, "#a16207");
    grad.addColorStop(1, "#713f12");

    ctx.fillStyle = grad;
    ctx.strokeStyle = "#451a03";
    ctx.lineWidth = size * 0.03;

    ctx.beginPath();
    ctx.moveTo(-size * 0.4, 0);
    ctx.quadraticCurveTo(-size * 0.2, -size * 0.3, -size * 0.1, -size * 0.2);
    ctx.lineTo(-size * 0.05, -size * 0.35);
    ctx.lineTo(size * 0.1, -size * 0.2);
    ctx.lineTo(size * 0.2, -size * 0.35);
    ctx.quadraticCurveTo(size * 0.3, -size * 0.1, size * 0.5, 0);
    ctx.quadraticCurveTo(size * 0.3, size * 0.1, size * 0.2, size * 0.35);
    ctx.lineTo(size * 0.1, size * 0.2);
    ctx.lineTo(-size * 0.05, size * 0.35);
    ctx.lineTo(-size * 0.1, size * 0.2);
    ctx.quadraticCurveTo(-size * 0.2, size * 0.3, -size * 0.4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Main vein
    ctx.strokeStyle = "#451a03";
    ctx.lineWidth = size * 0.04;
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, 0);
    ctx.lineTo(size * 0.45, 0);
    ctx.stroke();

    // Side veins
    ctx.lineWidth = size * 0.02;
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, 0);
    ctx.lineTo(-size * 0.1, -size * 0.15);
    ctx.moveTo(-size * 0.2, 0);
    ctx.lineTo(-size * 0.1, size * 0.15);
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.12, -size * 0.18);
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.12, size * 0.18);
    ctx.moveTo(size * 0.2, 0);
    ctx.lineTo(size * 0.3, -size * 0.12);
    ctx.moveTo(size * 0.2, 0);
    ctx.lineTo(size * 0.3, size * 0.12);
    ctx.stroke();
    ctx.restore();
  };

  const drawWatermelonSlice = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.save();
    // Outer rind
    ctx.fillStyle = "#15803d";
    ctx.beginPath();
    ctx.arc(0, -size * 0.2, size * 0.5, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();

    // Inner rind
    ctx.fillStyle = "#bbf7d0";
    ctx.beginPath();
    ctx.arc(0, -size * 0.2, size * 0.44, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();

    // Red flesh
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(0, -size * 0.2, size * 0.38, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();

    // Straight edge cut
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(-size * 0.5, -size * 0.22, size, size * 0.05);

    // Seeds
    ctx.fillStyle = "#1e293b";
    const seedPositions = [
      { x: -size * 0.2, y: size * 0.02, rot: -Math.PI / 4 },
      { x: -size * 0.07, y: size * 0.12, rot: -Math.PI / 12 },
      { x: size * 0.07, y: size * 0.12, rot: Math.PI / 12 },
      { x: size * 0.2, y: size * 0.02, rot: Math.PI / 4 },
    ];
    for (const pos of seedPositions) {
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(pos.rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.02, size * 0.035, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  };

  const drawPlasticBottle = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.save();
    ctx.fillStyle = "rgba(186, 230, 253, 0.65)";
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = size * 0.03;
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(-size * 0.12, -size * 0.4);
    ctx.lineTo(size * 0.12, -size * 0.4);
    ctx.lineTo(size * 0.2, -size * 0.25);
    ctx.bezierCurveTo(
      size * 0.18,
      -size * 0.1,
      size * 0.1,
      -size * 0.05,
      size * 0.16,
      size * 0.15,
    );
    ctx.lineTo(size * 0.2, size * 0.4);
    ctx.bezierCurveTo(
      size * 0.1,
      size * 0.45,
      -size * 0.1,
      size * 0.45,
      -size * 0.2,
      size * 0.4,
    );
    ctx.lineTo(-size * 0.16, size * 0.15);
    ctx.bezierCurveTo(
      -size * 0.1,
      -size * 0.05,
      -size * 0.18,
      -size * 0.1,
      -size * 0.2,
      -size * 0.25,
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cap
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(-size * 0.14, -size * 0.48, size * 0.28, size * 0.08);

    // Label
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.beginPath();
    ctx.moveTo(-size * 0.14, -size * 0.1);
    ctx.lineTo(size * 0.14, -size * 0.1);
    ctx.lineTo(size * 0.15, size * 0.1);
    ctx.lineTo(-size * 0.15, size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Folds
    ctx.strokeStyle = "rgba(2, 132, 199, 0.5)";
    ctx.lineWidth = size * 0.02;
    ctx.beginPath();
    ctx.moveTo(-size * 0.16, -size * 0.2);
    ctx.quadraticCurveTo(0, -size * 0.12, size * 0.18, -size * 0.2);
    ctx.moveTo(-size * 0.13, -size * 0.02);
    ctx.quadraticCurveTo(0, size * 0.04, size * 0.14, -size * 0.03);
    ctx.moveTo(-size * 0.16, size * 0.2);
    ctx.quadraticCurveTo(0, size * 0.26, size * 0.18, size * 0.16);
    ctx.stroke();
    ctx.restore();
  };

  const drawTinCan = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.save();
    const metalGrad = ctx.createLinearGradient(-size * 0.25, 0, size * 0.25, 0);
    metalGrad.addColorStop(0, "#94a3b8");
    metalGrad.addColorStop(0.3, "#cbd5e1");
    metalGrad.addColorStop(0.7, "#cbd5e1");
    metalGrad.addColorStop(1, "#64748b");

    ctx.fillStyle = metalGrad;
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = size * 0.03;
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(-size * 0.2, -size * 0.35);
    ctx.lineTo(size * 0.2, -size * 0.35);
    ctx.bezierCurveTo(
      size * 0.22,
      -size * 0.15,
      size * 0.05,
      0,
      size * 0.18,
      size * 0.15,
    );
    ctx.lineTo(size * 0.2, size * 0.35);
    ctx.bezierCurveTo(
      size * 0.1,
      size * 0.4,
      -size * 0.1,
      size * 0.4,
      -size * 0.2,
      size * 0.35,
    );
    ctx.bezierCurveTo(
      -size * 0.05,
      0,
      -size * 0.22,
      -size * 0.15,
      -size * 0.2,
      -size * 0.35,
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Lid
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.35, size * 0.2, size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tab hole
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.ellipse(
      -size * 0.04,
      -size * 0.35,
      size * 0.06,
      size * 0.02,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Ridges
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = size * 0.02;
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, -size * 0.22);
    ctx.quadraticCurveTo(0, -size * 0.18, size * 0.21, -size * 0.23);
    ctx.moveTo(-size * 0.19, size * 0.22);
    ctx.quadraticCurveTo(0, size * 0.26, size * 0.19, size * 0.23);
    ctx.stroke();

    // Crushes
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = size * 0.03;
    ctx.beginPath();
    ctx.moveTo(-size * 0.21, -size * 0.02);
    ctx.lineTo(size * 0.1, -size * 0.08);
    ctx.lineTo(-size * 0.08, size * 0.08);
    ctx.lineTo(size * 0.18, size * 0.05);
    ctx.stroke();
    ctx.restore();
  };

  const drawPlasticCup = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.save();
    // Red/White Straw
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = size * 0.05;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-size * 0.05, size * 0.2);
    ctx.lineTo(size * 0.1, -size * 0.35);
    ctx.lineTo(size * 0.25, -size * 0.45);
    ctx.stroke();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = size * 0.05;
    ctx.setLineDash([size * 0.06, size * 0.06]);
    ctx.beginPath();
    ctx.moveTo(-size * 0.05, size * 0.2);
    ctx.lineTo(size * 0.1, -size * 0.35);
    ctx.lineTo(size * 0.25, -size * 0.45);
    ctx.stroke();
    ctx.setLineDash([]);

    // Translucent Cup
    ctx.fillStyle = "rgba(241, 245, 249, 0.45)";
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = size * 0.025;
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.ellipse(0, -size * 0.25, size * 0.25, size * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-size * 0.25, -size * 0.25);
    ctx.bezierCurveTo(
      -size * 0.2,
      -size * 0.05,
      -size * 0.1,
      size * 0.1,
      -size * 0.14,
      size * 0.35,
    );
    ctx.lineTo(size * 0.14, size * 0.35);
    ctx.bezierCurveTo(
      size * 0.1,
      size * 0.1,
      size * 0.2,
      -size * 0.05,
      size * 0.25,
      -size * 0.25,
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, size * 0.35, size * 0.14, size * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ridges
    ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
    ctx.lineWidth = size * 0.015;
    ctx.beginPath();
    ctx.moveTo(-size * 0.22, -size * 0.15);
    ctx.lineTo(size * 0.22, -size * 0.15);
    ctx.moveTo(-size * 0.18, -size * 0.02);
    ctx.lineTo(size * 0.18, -size * 0.02);
    ctx.moveTo(-size * 0.15, size * 0.12);
    ctx.lineTo(size * 0.15, size * 0.12);
    ctx.stroke();
    ctx.restore();
  };

  const drawBattery = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.save();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = size * 0.03;
    ctx.lineJoin = "round";

    // Main dark body
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(-size * 0.16, -size * 0.1);
    ctx.lineTo(size * 0.16, -size * 0.1);
    ctx.lineTo(size * 0.16, size * 0.35);
    ctx.lineTo(-size * 0.16, size * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Copper band
    ctx.fillStyle = "#b45309";
    ctx.beginPath();
    ctx.moveTo(-size * 0.16, -size * 0.35);
    ctx.lineTo(size * 0.16, -size * 0.35);
    ctx.lineTo(size * 0.16, -size * 0.1);
    ctx.lineTo(-size * 0.16, -size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Positive metal bump
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.rect(-size * 0.05, -size * 0.42, size * 0.1, size * 0.07);
    ctx.fill();
    ctx.stroke();

    // White text label
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${size * 0.14}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AA", 0, size * 0.02);

    // Symbols
    ctx.fillStyle = "#fef08a";
    ctx.font = `bold ${size * 0.15}px sans-serif`;
    ctx.fillText("+", 0, -size * 0.22);

    ctx.fillStyle = "#94a3b8";
    ctx.font = `bold ${size * 0.15}px sans-serif`;
    ctx.fillText("-", 0, size * 0.24);

    // Corroded green acid leakage
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(-size * 0.12, size * 0.1, size * 0.04, 0, Math.PI * 2);
    ctx.arc(size * 0.14, size * 0.28, size * 0.03, 0, Math.PI * 2);
    ctx.arc(-size * 0.04, size * 0.34, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // --- RENDERING HELPERS FOR DYNAMIC NATURAL PLANT ---
  const drawRealisticLeaf = (
    ctx: CanvasRenderingContext2D,
    length: number,
    width: number,
    health: number,
  ) => {
    ctx.save();
    let leafColor = "#22c55e";
    let veinColor = "#16a34a";

    if (health <= 20) {
      leafColor = "#78716c";
      veinColor = "#44403c";
    } else if (health <= 40) {
      leafColor = "#a16207";
      veinColor = "#713f12";
    } else if (health <= 70) {
      leafColor = "#eab308";
      veinColor = "#ca8a04";
    }

    ctx.fillStyle = leafColor;
    ctx.strokeStyle = veinColor;
    ctx.lineWidth = length * 0.04;

    // Leaf body
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      -width * 0.6,
      -length * 0.3,
      -width * 0.4,
      -length * 0.8,
      0,
      -length,
    );
    ctx.bezierCurveTo(
      width * 0.4,
      -length * 0.8,
      width * 0.6,
      -length * 0.3,
      0,
      0,
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Central vein
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -length * 0.9);
    ctx.stroke();

    // Side veins
    ctx.lineWidth = length * 0.02;
    ctx.beginPath();
    ctx.moveTo(0, -length * 0.25);
    ctx.lineTo(-width * 0.3, -length * 0.45);
    ctx.moveTo(0, -length * 0.5);
    ctx.lineTo(-width * 0.35, -length * 0.7);
    ctx.moveTo(0, -length * 0.25);
    ctx.lineTo(width * 0.3, -length * 0.45);
    ctx.moveTo(0, -length * 0.5);
    ctx.lineTo(width * 0.35, -length * 0.7);
    ctx.stroke();
    ctx.restore();
  };

  const drawRealisticRoot = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    length: number,
    angle: number,
    depth: number,
    health: number,
  ) => {
    if (depth <= 0) return;
    ctx.save();
    ctx.translate(startX, startY);
    ctx.rotate(angle);

    let rootColor = "#fef08a";
    if (health <= 40) {
      rootColor = "#334155";
    } else if (health <= 75) {
      rootColor = "#d97706";
    }

    ctx.strokeStyle = rootColor;
    ctx.lineWidth = depth * 1.2;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(0, 0);
    const midY = length * 0.5;
    const wiggleX = Math.sin(startY * 0.05 + depth) * length * 0.15;
    ctx.quadraticCurveTo(wiggleX, midY, 0, length);
    ctx.stroke();

    if (depth > 1) {
      drawRealisticRoot(
        ctx,
        wiggleX * 0.5,
        midY,
        length * 0.7,
        -Math.PI / 6 + Math.sin(startY * 0.1) * 0.1,
        depth - 1,
        health,
      );
      drawRealisticRoot(
        ctx,
        wiggleX * 0.5,
        midY,
        length * 0.7,
        Math.PI / 6 + Math.cos(startY * 0.1) * 0.1,
        depth - 1,
        health,
      );
    } else if (health > 60) {
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, length);
      ctx.lineTo(-length * 0.3, length + length * 0.2);
      ctx.moveTo(0, length);
      ctx.lineTo(length * 0.3, length + length * 0.2);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawPlant = (
    ctx: CanvasRenderingContext2D,
    plantX: number,
    scale: number,
    phase: number,
    rootHealth: number,
  ) => {
    const groundY = 100;
    const time = simTimeRef.current;

    const windSpeed = 0.04;
    const swayAmount = 4 * scale;
    const sway = Math.sin(time * windSpeed + phase) * swayAmount;

    const droop = Math.max(0, (100 - rootHealth) / 100);
    const plantHeight = (55 + ((phase * 10) % 15)) * scale * (1 - droop * 0.15);

    ctx.save();

    // 1. Draw organic root branches
    drawRealisticRoot(ctx, plantX, groundY, 15 * scale, 0, 3, rootHealth);
    drawRealisticRoot(
      ctx,
      plantX - 2 * scale,
      groundY,
      12 * scale,
      -Math.PI / 5,
      3,
      rootHealth,
    );
    drawRealisticRoot(
      ctx,
      plantX + 2 * scale,
      groundY,
      12 * scale,
      Math.PI / 5,
      3,
      rootHealth,
    );

    // 2. Draw stems
    ctx.lineWidth = 3.5 * scale;
    let stemColor = "#15803d";
    if (rootHealth <= 20) {
      stemColor = "#57534e";
    } else if (rootHealth <= 40) {
      stemColor = "#854d0e";
    } else if (rootHealth <= 75) {
      stemColor = "#16a34a";
    }
    ctx.strokeStyle = stemColor;
    ctx.lineCap = "round";

    const tipX = plantX + sway - droop * 15 * scale;
    const tipY = groundY - plantHeight;
    const midX = plantX + sway * 0.6 - droop * 8 * scale;
    const midY = groundY - plantHeight * 0.55;

    ctx.beginPath();
    ctx.moveTo(plantX, groundY);
    ctx.quadraticCurveTo(midX, midY, tipX, tipY);
    ctx.stroke();

    // Side branch left
    const branchStartX = midX;
    const branchStartY = midY;
    const branchTipX = branchStartX - 15 * scale + sway * 0.3;
    const branchTipY = branchStartY - 12 * scale + droop * 12 * scale;
    ctx.lineWidth = 2.2 * scale;
    ctx.beginPath();
    ctx.moveTo(branchStartX, branchStartY);
    ctx.quadraticCurveTo(
      (branchStartX + branchTipX) / 2 - 3 * scale,
      (branchStartY + branchTipY) / 2,
      branchTipX,
      branchTipY,
    );
    ctx.stroke();

    // Side branch right
    const branch2StartX = midX + (tipX - midX) * 0.3;
    const branch2StartY = midY - (midY - tipY) * 0.3;
    const branch2TipX = branch2StartX + 12 * scale + sway * 0.3;
    const branch2TipY = branch2StartY - 8 * scale + droop * 8 * scale;
    ctx.lineWidth = 1.8 * scale;
    ctx.beginPath();
    ctx.moveTo(branch2StartX, branch2StartY);
    ctx.quadraticCurveTo(
      (branch2StartX + branch2TipX) / 2 + 2 * scale,
      (branch2StartY + branch2TipY) / 2,
      branch2TipX,
      branch2TipY,
    );
    ctx.stroke();

    // 3. Draw realistic leaves
    // Top
    ctx.save();
    ctx.translate(tipX, tipY);
    const topAngle = Math.atan2(tipY - midY, tipX - midX) + Math.PI / 2;
    ctx.rotate(topAngle + (droop * Math.PI) / 4);
    drawRealisticLeaf(ctx, 14 * scale, 8 * scale, rootHealth);
    ctx.restore();

    // Left branch leaf
    ctx.save();
    ctx.translate(branchTipX, branchTipY);
    ctx.rotate(-Math.PI / 3 - (droop * Math.PI) / 6);
    drawRealisticLeaf(ctx, 12 * scale, 7 * scale, rootHealth);
    ctx.restore();

    // Right branch leaf
    ctx.save();
    ctx.translate(branch2TipX, branch2TipY);
    ctx.rotate(Math.PI / 3 + (droop * Math.PI) / 6);
    drawRealisticLeaf(ctx, 10 * scale, 6 * scale, rootHealth);
    ctx.restore();

    // Middle stem leaf
    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(-Math.PI / 2 + (droop * Math.PI) / 4);
    drawRealisticLeaf(ctx, 11 * scale, 6 * scale, rootHealth);
    ctx.restore();

    // 4. Draw flower/fruit representing yield
    const flowerX = tipX + 5 * scale;
    const flowerY = tipY + 2 * scale;
    if (rootHealth > 40) {
      ctx.save();
      ctx.translate(flowerX, flowerY);
      if (rootHealth > 75) {
        // Red fruit
        const fruitSize = Math.max(1, 4 * scale * (rootHealth / 100));
        ctx.fillStyle = "#ef4444";
        ctx.strokeStyle = "#b91c1c";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, fruitSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#16a34a";
        ctx.beginPath();
        ctx.moveTo(-2 * scale, -fruitSize * 0.8);
        ctx.lineTo(2 * scale, -fruitSize * 0.8);
        ctx.lineTo(0, -fruitSize * 1.2);
        ctx.closePath();
        ctx.fill();
      } else {
        // Yellow flower
        const petalSize = 2.5 * scale;
        ctx.fillStyle = "#eab308";
        for (let i = 0; i < 5; i++) {
          ctx.rotate((Math.PI * 2) / 5);
          ctx.beginPath();
          ctx.ellipse(
            petalSize,
            0,
            petalSize,
            petalSize * 0.5,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.fillStyle = "#ca8a04";
        ctx.beginPath();
        ctx.arc(0, 0, petalSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  };

  // --- CORE CANVAS ENGINE LOOP CONTROL ---
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

    const getWaterColor = (toxic: number) => {
      if (toxic < 15) return "rgba(14, 165, 233, 0.45)";
      if (toxic < 50) {
        const ratio = (toxic - 15) / 35;
        return `rgba(${Math.round(14 + (115 - 14) * ratio)}, ${Math.round(
          165 + (115 - 165) * ratio,
        )}, ${Math.round(233 + (95 - 233) * ratio)}, 0.55)`;
      }
      const ratio = Math.min(1.0, (toxic - 50) / 50);
      return `rgba(${Math.round(115 + (69 - 115) * ratio)}, ${Math.round(
        115 + (50 - 115) * ratio,
      )}, ${Math.round(95 + (30 - 95) * ratio)}, 0.75)`;
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const state = simStateRef.current;

      if (runningRef.current) {
        simTimeRef.current++;
        const {
          trashType: type,
          jumlahSampah: volume,
          hujan: intensity,
        } = inputsRef.current;

        // Perhitungan Diferensial Matematis Ekologi
        if (type === "organik") {
          const targetSubur = 80.0 + (volume <= 40 ? 15 : 5);
          state.fertility += (targetSubur - state.fertility) * 0.01;
          state.pH += (7.0 - (volume / 100) * 0.8 - state.pH) * 0.01;
          state.toxicity += (0.0 - state.toxicity) * 0.02;
          state.rootHealth += (100.0 - state.rootHealth) * 0.02;
        } else {
          state.fertility +=
            (Math.max(10.0, 80.0 - volume * 0.8) - state.fertility) * 0.01;
          state.pH +=
            (Math.max(4.0, 7.0 - (volume / 100) * 2.8) - state.pH) * 0.01;
          state.toxicity += (volume - state.toxicity) * 0.01;
          const targetAkar = Math.max(
            0.0,
            100.0 - state.toxicity * 1.1 - (7.0 - state.pH) * 10,
          );
          state.rootHealth += (targetAkar - state.rootHealth) * 0.015;
        }

        if (state.rootHealth > 60) {
          state.yield = Math.min(
            100.0,
            state.yield +
              (state.rootHealth / 100) * 0.08 * (state.fertility / 80),
          );
        } else {
          state.yield = Math.max(0.0, state.yield - 0.05);
        }

        // Emit Partikel Hujan & Rembesan Toksik (Leaching)
        if (intensity > 0) {
          for (let i = 0; i < Math.floor(intensity * 0.8); i++) {
            rainParticlesRef.current.push(new RainParticle(canvas.width));
          }
          if (Math.random() < (intensity / 10) * (volume / 100)) {
            seepageParticlesRef.current.push(
              new SeepageParticle(
                canvas.width * 0.15 + Math.random() * (canvas.width * 0.2),
                type,
              ),
            );
          }
        }

        if (intensity === 0 && state.toxicity > 0) {
          state.toxicity = Math.max(0, state.toxicity - 0.05);
        }
      }

      // --- MANIPULASI ELEMENT DOM DIREK (60 FPS STABLE OVERPASS) ---
      const pctPH = Math.min(100, Math.max(0, (state.pH / 14) * 100));
      if (barPhRef.current) barPhRef.current.style.height = `${pctPH}%`;
      if (barSuburRef.current)
        barSuburRef.current.style.height = `${Math.min(100, state.fertility)}%`;
      if (barAkarRef.current)
        barAkarRef.current.style.height = `${Math.min(100, state.rootHealth)}%`;
      if (barRacunRef.current)
        barRacunRef.current.style.height = `${Math.min(100, state.toxicity)}%`;
      if (barPanenRef.current)
        barPanenRef.current.style.height = `${Math.min(100, state.yield)}%`;

      if (barPhValRef.current) {
        barPhValRef.current.style.bottom = `calc(${pctPH}% + 4px)`;
        barPhValRef.current.innerText = state.pH.toFixed(1);
      }
      if (barSuburValRef.current) {
        barSuburValRef.current.style.bottom = `calc(${Math.min(
          100,
          state.fertility,
        )}% + 4px)`;
        barSuburValRef.current.innerText = `${state.fertility.toFixed(0)}%`;
      }
      if (barAkarValRef.current) {
        barAkarValRef.current.style.bottom = `calc(${Math.min(
          100,
          state.rootHealth,
        )}% + 4px)`;
        barAkarValRef.current.innerText = `${state.rootHealth.toFixed(0)}%`;
      }
      if (barRacunValRef.current) {
        barRacunValRef.current.style.bottom = `calc(${Math.min(
          100,
          state.toxicity,
        )}% + 4px)`;
        barRacunValRef.current.innerText = `${state.toxicity.toFixed(0)}%`;
      }
      if (barPanenValRef.current) {
        barPanenValRef.current.style.bottom = `calc(${Math.min(
          100,
          state.yield,
        )}% + 4px)`;
        barPanenValRef.current.innerText = `${state.yield.toFixed(0)}%`;
      }

      const alive = fishArrayRef.current.filter(
        (f) => f.state !== "dead",
      ).length;
      const dead = fishArrayRef.current.length - alive;
      if (hudFishAliveRef.current)
        hudFishAliveRef.current.innerText = String(alive);
      if (hudFishDeadRef.current)
        hudFishDeadRef.current.innerText = String(dead);

      if (hudRootStatusRef.current && hudLeafStatusRef.current) {
        if (state.rootHealth > 75) {
          hudRootStatusRef.current.innerText = "Normal Sehat";
          hudLeafStatusRef.current.innerText = "Segar Hijau";
          hudLeafStatusRef.current.className =
            "font-mono font-bold text-emerald-600";
        } else if (state.rootHealth > 35) {
          hudRootStatusRef.current.innerText = "Terganggu";
          hudLeafStatusRef.current.innerText = "Mulai Layu";
          hudLeafStatusRef.current.className =
            "font-mono font-bold text-amber-500 animate-pulse";
        } else {
          hudRootStatusRef.current.innerText = "Membusuk";
          hudLeafStatusRef.current.innerText = "Kering Mati";
          hudLeafStatusRef.current.className =
            "font-mono font-bold text-rose-500";
        }
      }

      if (txtWarnaRef.current) {
        if (state.toxicity < 15) {
          txtWarnaRef.current.innerText = "Biru Jernih";
          txtWarnaRef.current.className = "text-[10px] font-bold text-sky-600";
        } else if (state.toxicity < 50) {
          txtWarnaRef.current.innerText = "Mulai Keruh";
          txtWarnaRef.current.className =
            "text-[10px] font-bold text-slate-500";
        } else {
          txtWarnaRef.current.innerText = "Limbah Pekat";
          txtWarnaRef.current.className =
            "text-[10px] font-bold text-amber-800 animate-pulse";
        }
      }

      if (txtPerilakuRef.current) {
        if (state.rootHealth > 75) {
          txtPerilakuRef.current.innerText = "Tumbuh Normal";
          txtPerilakuRef.current.className =
            "text-[10px] font-bold text-emerald-500";
        } else if (state.rootHealth > 35) {
          txtPerilakuRef.current.innerText = "Pertumbuhan Terhenti";
          txtPerilakuRef.current.className =
            "text-[10px] font-bold text-amber-500";
        } else {
          txtPerilakuRef.current.innerText = "Akar Mati";
          txtPerilakuRef.current.className =
            "text-[10px] font-bold text-red-600 font-extrabold";
        }
      }

      if (txtPanenRef.current) {
        if (state.yield > 75) {
          txtPanenRef.current.innerText = "Sangat Banyak";
          txtPanenRef.current.className =
            "text-[10px] font-bold text-emerald-600";
        } else if (state.yield > 35) {
          txtPanenRef.current.innerText = "Sedikit";
          txtPanenRef.current.className =
            "text-[10px] font-bold text-amber-500";
        } else if (state.yield > 2) {
          txtPanenRef.current.innerText = "Hampir Gagal";
          txtPanenRef.current.className = "text-[10px] font-bold text-rose-400";
        } else {
          txtPanenRef.current.innerText = "Gagal Panen";
          txtPanenRef.current.className =
            "text-[10px] font-bold text-red-600 font-extrabold";
        }
      }

      if (tanahStatusBadgeRef.current) {
        if (state.rootHealth > 70 && state.toxicity < 25) {
          tanahStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Sehat Subur`;
          tanahStatusBadgeRef.current.className =
            "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-emerald-100 text-emerald-700 border-emerald-200";
        } else if (state.rootHealth > 35 && state.toxicity < 60) {
          tanahStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Degradasi`;
          tanahStatusBadgeRef.current.className =
            "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-amber-100 text-amber-700 border-amber-200";
        } else {
          tanahStatusBadgeRef.current.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Krisis Rusak`;
          tanahStatusBadgeRef.current.className =
            "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-red-100 text-red-700 border-red-200";
        }
      }

      // --- RENDERING SCENE ENVIRONMENT ---
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, 100);

      const pondStartX = canvas.width * 0.6;
      const waterStartX = pondStartX - 100;
      ctx.fillStyle = getWaterColor(state.toxicity);
      ctx.fillRect(
        waterStartX,
        100,
        canvas.width - waterStartX,
        canvas.height - 100,
      );

      ctx.beginPath();
      ctx.fillStyle = getWaterColor(state.toxicity);
      ctx.moveTo(waterStartX, 100);
      for (let x = waterStartX; x <= canvas.width; x += 10) {
        ctx.lineTo(
          x,
          100 + Math.sin(x * 0.05 + simTimeRef.current * 0.06) * 1.5,
        );
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(waterStartX, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Struktur Tanah Gradasi
      const landGradient = ctx.createLinearGradient(0, 100, 0, canvas.height);
      landGradient.addColorStop(0, "#854d0e");
      landGradient.addColorStop(1, "#451a03");
      ctx.fillStyle = landGradient;
      ctx.beginPath();
      ctx.moveTo(0, 100);
      ctx.lineTo(pondStartX, 100);
      ctx.lineTo(pondStartX - 25, 125);
      ctx.lineTo(pondStartX - 55, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = state.fertility > 40 ? "#22c55e" : "#a3a3a3";
      ctx.fillRect(0, 96, pondStartX, 4);

      // Gambar Tanaman & Sampah Visual
      const plantPositions = [
        { pctX: 0.08, scale: 0.9, phase: 0 },
        { pctX: 0.18, scale: 1.1, phase: 1.5 },
        { pctX: 0.28, scale: 1.0, phase: 3.0 },
        { pctX: 0.38, scale: 1.2, phase: 4.5 },
        { pctX: 0.48, scale: 0.85, phase: 6.0 },
      ];

      for (const p of plantPositions) {
        drawPlant(
          ctx,
          canvas.width * p.pctX,
          p.scale,
          p.phase,
          state.rootHealth,
        );
      }

      for (const item of wasteSpritesRef.current) {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);

        switch (item.subtype) {
          case "apple":
            drawAppleCore(ctx, item.size);
            break;
          case "banana":
            drawBananaPeel(ctx, item.size);
            break;
          case "leaf":
            drawWitheredLeaf(ctx, item.size);
            break;
          case "watermelon":
            drawWatermelonSlice(ctx, item.size);
            break;
          case "bottle":
            drawPlasticBottle(ctx, item.size);
            break;
          case "can":
            drawTinCan(ctx, item.size);
            break;
          case "cup":
            drawPlasticCup(ctx, item.size);
            break;
          case "battery":
            drawBattery(ctx, item.size);
            break;
          default:
            ctx.fillStyle = "#475569";
            ctx.beginPath();
            ctx.arc(0, 0, item.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
      }

      // Render Partikel Air Hujan
      for (let i = rainParticlesRef.current.length - 1; i >= 0; i--) {
        const rp = rainParticlesRef.current[i];
        rp.update();
        rp.draw(ctx, pondStartX, simTimeRef.current);
        const surfaceY = getSurfaceY(rp.x, pondStartX, simTimeRef.current);
        if (rp.y >= surfaceY) {
          rainParticlesRef.current.splice(i, 1);
        }
      }

      // Render Partikel Rembesan/Leaching
      const { trashType: type } = inputsRef.current;
      for (let i = seepageParticlesRef.current.length - 1; i >= 0; i--) {
        const sp = seepageParticlesRef.current[i];
        sp.update();
        sp.draw(ctx);
        if (sp.x >= canvas.width * 0.6 && sp.y >= 100) {
          if (type === "anorganik") {
            state.toxicity = Math.min(100.0, state.toxicity + 0.5);
          }
          seepageParticlesRef.current.splice(i, 1);
        } else if (sp.y > canvas.height || sp.x > canvas.width) {
          seepageParticlesRef.current.splice(i, 1);
        }
      }

      // Render Biota Ikan
      for (const fish of fishArrayRef.current) {
        fish.update(state.toxicity, canvas.width, canvas.height);
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

  // --- CONTROLLER HANDLER INTERACTION ---
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
    setJumlahSampah(20);
    setHujan(4);

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
      {/* HEADER RINGKAS */}
      <header className="bg-white border-b border-slate-200 px-4 py-1.5 flex justify-between items-center h-12 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/simulasi")}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-all flex items-center justify-center mr-1 shadow-sm border border-slate-200 active:scale-95 cursor-pointer"
            title="Kembali ke Pilihan Simulasi"
          >
            <FaArrowLeft className="text-xs" />
          </button>
          <FaSeedling className="text-emerald-500 text-lg" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900">
              Simulasi Pencemaran Tanah
            </h1>
            <p className="text-[10px] text-slate-500 leading-none">
              Dampak Pencemaran Tanah
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
        {/* KOLOM 1: PANEL CEMARAN */}
        <section className="col-span-3 bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between h-full overflow-y-auto">
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FaSliders className="text-emerald-600" /> Sumber Cemaran
            </h2>

            {/* Jenis Sampah */}
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 block mb-1.5">
                JENIS SAMPAH
              </span>
              <div className="grid grid-cols-2 gap-1 bg-slate-200 p-0.5 rounded-md text-[10px] font-bold">
                <button
                  onClick={() => triggerTrashChange("organik")}
                  className={`py-1 rounded flex justify-center items-center gap-1 transition-all ${
                    trashType === "organik"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-600 hover:bg-white/50"
                  }`}
                >
                  <FaLeaf className="text-[9px]" /> Organik
                </button>
                <button
                  onClick={() => triggerTrashChange("anorganik")}
                  className={`py-1 rounded flex justify-center items-center gap-1 transition-all ${
                    trashType === "anorganik"
                      ? "bg-white text-rose-600 shadow-sm"
                      : "text-slate-600 hover:bg-white/50"
                  }`}
                >
                  <FaTrashCan className="text-[9px]" /> Non-Organik
                </button>
              </div>
            </div>

            {/* Volume Sampah */}
            <div
              className={`p-2 rounded-lg border transition-all duration-300 ${
                trashType === "anorganik"
                  ? "bg-rose-50/70 border-rose-300"
                  : "bg-slate-50 border-slate-100"
              }`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold text-slate-500">
                  JUMLAH SAMPAH
                </span>
                <span
                  className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase ${
                    trashType === "anorganik"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {jumlahSampah <= 33
                    ? "Sedikit"
                    : jumlahSampah <= 66
                    ? "Sedang"
                    : "Banyak"}
                </span>
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Jumlah Sampah</span>
                  <span className="font-mono font-bold">{jumlahSampah}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={jumlahSampah}
                  onChange={(e) => handleJumlahChange(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Curah Hujan */}
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] font-bold text-sky-600 block mb-1">
                <FaCloudShowersHeavy /> Curah Hujan (Aliran Air)
              </span>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Aliran Air</span>
                  <span className="font-mono font-bold text-sky-600">
                    {hujan === 0
                      ? "Kering"
                      : hujan <= 3
                      ? "Gerimis"
                      : hujan <= 7
                      ? "Sedang"
                      : "Lebat"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={hujan}
                  onChange={(e) => setHujan(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
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
              onClick={handleClear}
              className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-600 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 border border-emerald-100"
            >
              <FaBroom /> Bersihkan
            </button>
          </div>
        </section>

        {/* KOLOM 2: PROFIL EKOSISTEM */}
        <section className="col-span-5 bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between h-full">
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <div className="flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <FaMountainSun className="text-emerald-600" /> Kondisi Tanah dan
                Kolam
              </h3>
              <div
                ref={tanahStatusBadgeRef}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-emerald-100 text-emerald-700 border-emerald-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sehat Subur
              </div>
            </div>

            <div className="relative flex-1 bg-sky-50/20 rounded-lg overflow-hidden border border-slate-100 shadow-inner">
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
                  <span>Akar Tanaman:</span>
                  <span
                    ref={hudRootStatusRef}
                    className="font-mono font-bold text-slate-800"
                  >
                    Normal
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-slate-600">
                  <span>Kondisi Daun:</span>
                  <span
                    ref={hudLeafStatusRef}
                    className="font-mono font-bold text-emerald-600"
                  >
                    Segar
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-slate-600">
                  <span>Ikan Kolam:</span>
                  <span className="font-mono font-bold text-sky-600">
                    <span ref={hudFishAliveRef}>8</span> Hidup /{" "}
                    <span ref={hudFishDeadRef} className="text-rose-500">
                      0
                    </span>{" "}
                    Mati
                  </span>
                </div>
              </div>

              <div className="absolute top-2 left-2 flex flex-col gap-0.5 pointer-events-none">
                <span className="bg-amber-100/90 text-amber-800 border border-amber-200 text-[8px] px-1 rounded font-bold w-max">
                  Area Tanah
                </span>
                <span className="bg-sky-100/90 text-sky-800 border border-sky-200 text-[8px] px-1 rounded font-bold w-max">
                  Kolam Air
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mt-2 text-center shrink-0">
            <div className="p-1 bg-slate-50 rounded border border-slate-100 flex flex-col justify-center items-center min-h-10.5">
              <span className="block text-[8px] text-slate-400 uppercase font-bold leading-none mb-0.5">
                Kondisi Air
              </span>
              <div className="leading-[1.15] text-center w-full">
                <span
                  ref={txtWarnaRef}
                  className="text-[10px] font-bold text-sky-600"
                >
                  Biru Jernih
                </span>
              </div>
            </div>
            <div className="p-1 bg-slate-50 rounded border border-slate-100 flex flex-col justify-center items-center min-h-10.5">
              <span className="block text-[8px] text-slate-400 uppercase font-bold leading-none mb-0.5">
                Kondisi Akar
              </span>
              <div className="leading-[1.15] text-center w-full">
                <span
                  ref={txtPerilakuRef}
                  className="text-[10px] font-bold text-emerald-500"
                >
                  Tumbuh Normal
                </span>
              </div>
            </div>
            <div className="p-1 bg-slate-50 rounded border border-slate-100 flex flex-col justify-center items-center min-h-10.5">
              <span className="block text-[8px] text-slate-400 uppercase font-bold leading-none mb-0.5">
                Hasil Panen
              </span>
              <div className="leading-[1.15] text-center w-full">
                <span
                  ref={txtPanenRef}
                  className="text-[10px] font-bold text-slate-500"
                >
                  Menunggu
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* KOLOM 3: GRAFIK PARAMETER */}
        <section className="col-span-4 bg-white border border-slate-200 rounded-xl p-3 flex flex-col h-full overflow-hidden">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between items-center shrink-0 mb-4">
            <span>
              <FaChartBar className="text-emerald-600" /> Kondisi Tanah dan Air
            </span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">
              Real-Time
            </span>
          </h2>

          <div className="flex-1 flex flex-col min-h-0 relative mt-2 select-none">
            {/* Grid Line Skala */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-l border-b border-slate-200 pb-7 pl-2">
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full"></div>
            </div>

            {/* Container Batang Grafik */}
            <div className="flex-1 flex justify-around items-end pl-2 pb-7 h-full relative z-10">
              {/* pH */}
              <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
                <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
                  <span
                    ref={barPhValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-emerald-700 whitespace-nowrap bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded shadow-sm"
                    style={{ bottom: "50%" }}
                  >
                    7.0
                  </span>
                  <div
                    ref={barPhRef}
                    className="w-full bg-linear-to-t from-emerald-400 to-emerald-500 rounded-b-md rounded-t-sm shadow-sm"
                    style={{ height: "50%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
                  pH
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
                  Tanah
                </span>
              </div>

              {/* Kesuburan */}
              <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
                <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
                  <span
                    ref={barSuburValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-lime-700 whitespace-nowrap bg-lime-50 border border-lime-200 px-1 py-0.2 rounded shadow-sm"
                    style={{ bottom: "80%" }}
                  >
                    80%
                  </span>
                  <div
                    ref={barSuburRef}
                    className="w-full bg-linear-to-t from-lime-400 to-lime-500 rounded-b-md rounded-t-sm shadow-sm"
                    style={{ height: "80%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
                  Kesuburan Tanah
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
                  Subur
                </span>
              </div>

              {/* Akar */}
              <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
                <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
                  <span
                    ref={barAkarValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-amber-700 whitespace-nowrap bg-amber-50 border border-amber-200 px-1 py-0.2 rounded shadow-sm"
                    style={{ bottom: "100%" }}
                  >
                    100%
                  </span>
                  <div
                    ref={barAkarRef}
                    className="w-full bg-linear-to-t from-amber-400 to-amber-500 rounded-b-md rounded-t-sm shadow-sm"
                    style={{ height: "100%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
                  Kondisi Akar
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
                  Akar
                </span>
              </div>

              {/* Racun */}
              <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
                <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
                  <span
                    ref={barRacunValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-rose-700 whitespace-nowrap bg-rose-50 border border-rose-200 px-1 py-0.2 rounded shadow-sm"
                    style={{ bottom: "0%" }}
                  >
                    0%
                  </span>
                  <div
                    ref={barRacunRef}
                    className="w-full bg-linear-to-t from-rose-400 to-rose-500 rounded-b-md rounded-t-sm shadow-sm"
                    style={{ height: "0%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
                  Tingkat Racun
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
                  Racun
                </span>
              </div>

              {/* Panen */}
              <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
                <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
                  <span
                    ref={barPanenValRef}
                    className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-sky-700 whitespace-nowrap bg-sky-50 border border-sky-200 px-1 py-0.2 rounded shadow-sm"
                    style={{ bottom: "10%" }}
                  >
                    10%
                  </span>
                  <div
                    ref={barPanenRef}
                    className="w-full bg-linear-to-t from-sky-400 to-sky-500 rounded-b-md rounded-t-sm shadow-sm"
                    style={{ height: "10%" }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
                  Hasil Panen
                </span>
                <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
                  Panen
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
              <span className="inline-block mx-1.5"><strong className="text-emerald-600">pH:</strong> Keasaman Tanah</span>
              <span className="inline-block mx-1.5"><strong className="text-lime-600">Kesuburan:</strong> Kadar Unsur Hara</span>
              <span className="inline-block mx-1.5"><strong className="text-amber-600">Akar:</strong> Kesehatan Perakaran</span>
              <span className="inline-block mx-1.5"><strong className="text-rose-600">Racun:</strong> Konsentrasi Kontaminan</span>
              <span className="inline-block mx-1.5"><strong className="text-sky-600">Panen:</strong> Estimasi Hasil Panen</span>
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
          mengakses eko-simulasi pencemaran tanah.
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
