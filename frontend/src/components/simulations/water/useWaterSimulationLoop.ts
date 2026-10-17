import { useEffect, type RefObject } from "react";
import type { SimState } from "./types";
import { INITIAL_VALUES } from "./types";
import { WasteParticle, type Fish, type OxygenBubble } from "./agents";
import { updateWaterDOMMeters, type WaterDOMRefs } from "./waterDOMUpdater";

interface UseWaterSimulationLoopParams extends WaterDOMRefs {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  simStateRef: RefObject<SimState>;
  simTimeRef: RefObject<number>;
  runningRef: RefObject<boolean>;
  inputsRef: RefObject<{
    checkIndustri: boolean;
    slideIndustri: number;
    checkDomestik: boolean;
    slideDomestik: number;
    slideAliran: number;
  }>;
  fishArrayRef: RefObject<Fish[]>;
  particlesArrayRef: RefObject<WasteParticle[]>;
  bubbleArrayRef: RefObject<OxygenBubble[]>;
  populateSim: (width: number, height: number) => void;
}

export function useWaterSimulationLoop(params: UseWaterSimulationLoopParams) {
  const {
    canvasRef,
    simStateRef,
    simTimeRef,
    runningRef,
    inputsRef,
    fishArrayRef,
    particlesArrayRef,
    bubbleArrayRef,
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

        if (checkIndustri && Math.random() < slideIndustri / 150 + 0.1) {
          particlesArrayRef.current.push(new WasteParticle("industri", slideIndustri));
        }
        if (checkDomestik && Math.random() < slideDomestik / 150 + 0.1) {
          particlesArrayRef.current.push(new WasteParticle("domestik", slideDomestik));
        }
      }

      updateWaterDOMMeters(state, fishArrayRef.current, domRefs);

      // Background & water
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, 25);

      ctx.beginPath();
      ctx.fillStyle = getWaterColorString(state.pollutant);
      ctx.moveTo(0, 25);

      const rippleAmp = 2;
      const rippleFreq = 0.02;
      for (let x = 0; x <= canvas.width; x += 10) {
        const y = 25 + Math.sin(x * rippleFreq + simTimeRef.current * 0.05) * rippleAmp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Pipes
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(15, 10, 30, 15);
      ctx.fillStyle = "#64748b";
      ctx.fillRect(40, 8, 8, 20);
      ctx.beginPath();
      ctx.fillStyle = "#334155";
      ctx.ellipse(44, 28, 5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(60, 12, 25, 12);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(80, 10, 8, 17);
      ctx.beginPath();
      ctx.fillStyle = "#475569";
      ctx.ellipse(84, 27, 5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Particles, bubbles, fish
      for (let i = particlesArrayRef.current.length - 1; i >= 0; i--) {
        const p = particlesArrayRef.current[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0 || p.x > canvas.width) {
          particlesArrayRef.current.splice(i, 1);
        }
      }

      for (const b of bubbleArrayRef.current) {
        b.update(state.DO);
        b.draw(ctx);
      }

      for (const fish of fishArrayRef.current) {
        fish.update(state.DO, state.pH, canvas.width, canvas.height, simTimeRef.current);
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
