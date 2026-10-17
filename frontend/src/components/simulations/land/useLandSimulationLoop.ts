import { useEffect, type RefObject } from "react";
import type { SimState, TrashType, WasteSprite } from "./types";
import { getSurfaceY } from "./types";
import { RainParticle, SeepageParticle, type Fish } from "./agents";
import { drawWasteSprite } from "./wasteRenderers";
import { drawPlant } from "./plantRenderers";
import { updateLandDOMMeters, type LandDOMRefs } from "./landDOMUpdater";

interface UseLandSimulationLoopParams extends LandDOMRefs {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  simStateRef: RefObject<SimState>;
  simTimeRef: RefObject<number>;
  runningRef: RefObject<boolean>;
  inputsRef: RefObject<{ trashType: TrashType; jumlahSampah: number; hujan: number }>;
  fishArrayRef: RefObject<Fish[]>;
  rainParticlesRef: RefObject<RainParticle[]>;
  seepageParticlesRef: RefObject<SeepageParticle[]>;
  wasteSpritesRef: RefObject<WasteSprite[]>;
  populateSim: (width: number, height: number) => void;
}

export function useLandSimulationLoop(params: UseLandSimulationLoopParams) {
  const {
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
    ...domRefs
  } = params;

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
        const { trashType: type, jumlahSampah: volume, hujan: intensity } = inputsRef.current;

        if (type === "organik") {
          const targetSubur = 80.0 + (volume <= 40 ? 15 : 5);
          state.fertility += (targetSubur - state.fertility) * 0.01;
          state.pH += (7.0 - (volume / 100) * 0.8 - state.pH) * 0.01;
          state.toxicity += (0.0 - state.toxicity) * 0.02;
          state.rootHealth += (100.0 - state.rootHealth) * 0.02;
        } else {
          state.fertility += (Math.max(10.0, 80.0 - volume * 0.8) - state.fertility) * 0.01;
          state.pH += (Math.max(4.0, 7.0 - (volume / 100) * 2.8) - state.pH) * 0.01;
          state.toxicity += (volume - state.toxicity) * 0.01;
          const targetAkar = Math.max(0.0, 100.0 - state.toxicity * 1.1 - (7.0 - state.pH) * 10);
          state.rootHealth += (targetAkar - state.rootHealth) * 0.015;
        }

        if (state.rootHealth > 60) {
          state.yield = Math.min(
            100.0,
            state.yield + (state.rootHealth / 100) * 0.08 * (state.fertility / 80),
          );
        } else {
          state.yield = Math.max(0.0, state.yield - 0.05);
        }

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

      updateLandDOMMeters(state, fishArrayRef.current, domRefs);

      // Environment rendering
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, 100);

      const pondStartX = canvas.width * 0.6;
      const waterStartX = pondStartX - 100;
      ctx.fillStyle = getWaterColor(state.toxicity);
      ctx.fillRect(waterStartX, 100, canvas.width - waterStartX, canvas.height - 100);

      ctx.beginPath();
      ctx.fillStyle = getWaterColor(state.toxicity);
      ctx.moveTo(waterStartX, 100);
      for (let x = waterStartX; x <= canvas.width; x += 10) {
        ctx.lineTo(x, 100 + Math.sin(x * 0.05 + simTimeRef.current * 0.06) * 1.5);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(waterStartX, canvas.height);
      ctx.closePath();
      ctx.fill();

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

      // Plants
      const plantPositions = [
        { pctX: 0.08, scale: 0.9, phase: 0 },
        { pctX: 0.18, scale: 1.1, phase: 1.5 },
        { pctX: 0.28, scale: 1.0, phase: 3.0 },
        { pctX: 0.38, scale: 1.2, phase: 4.5 },
        { pctX: 0.48, scale: 0.85, phase: 6.0 },
      ];

      for (const p of plantPositions) {
        drawPlant(ctx, canvas.width * p.pctX, p.scale, p.phase, state.rootHealth, simTimeRef.current);
      }

      // Waste Sprites
      for (const item of wasteSpritesRef.current) {
        drawWasteSprite(ctx, item);
      }

      // Rain Particles
      for (let i = rainParticlesRef.current.length - 1; i >= 0; i--) {
        const rp = rainParticlesRef.current[i];
        rp.update();
        rp.draw(ctx, pondStartX, simTimeRef.current);
        const surfaceY = getSurfaceY(rp.x, pondStartX, simTimeRef.current);
        if (rp.y >= surfaceY) {
          rainParticlesRef.current.splice(i, 1);
        }
      }

      // Seepage Particles
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

      // Biota Ikan
      for (const fish of fishArrayRef.current) {
        fish.update(state.toxicity, canvas.width, canvas.height, simTimeRef.current);
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
}
