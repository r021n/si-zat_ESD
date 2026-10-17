import { useEffect, type RefObject } from "react";
import type { SimState } from "./types";
import { BASE_STATE } from "./types";
import { RunoffParticle, type Fish, type Rain, type AlgaeBloomVisual } from "./agents";
import { updateEutroDOMMeters, type EutroDOMRefs } from "./eutroDOMUpdater";

interface UseEutroSimulationLoopParams extends EutroDOMRefs {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  simStateRef: RefObject<SimState>;
  simTimeRef: RefObject<number>;
  runningRef: RefObject<boolean>;
  inputsRef: RefObject<{
    inputPupuk: number;
    inputHujan: number;
  }>;
  fishesRef: RefObject<Fish[]>;
  rainParticlesRef: RefObject<Rain[]>;
  runoffParticlesRef: RefObject<RunoffParticle[]>;
  algaeEntitiesRef: RefObject<AlgaeBloomVisual[]>;
  setupSimulationEntities: (width: number, height: number) => void;
}

export function useEutroSimulationLoop(params: UseEutroSimulationLoopParams) {
  const {
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
        if (fishesRef.current.length === 0) {
          setupSimulationEntities(canvas.width, canvas.height);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    let animationFrameId: number;

    const loop = () => {
      const state = simStateRef.current;

      if (runningRef.current) {
        simTimeRef.current++;
        const { inputPupuk, inputHujan } = inputsRef.current;

        const runoffNutrientRate = (inputPupuk * 0.45 + 0.1) * (inputHujan * 0.4);
        state.nutrient = Math.min(
          25.0,
          state.nutrient + runoffNutrientRate * 0.05 - state.algae * 0.0006,
        );
        state.nutrient = Math.max(0.2, state.nutrient);

        const algaeGrowthRate = state.nutrient * 0.12;
        const naturalAlgaeMortality = state.algae * 0.008;
        state.algae = Math.min(
          100.0,
          state.algae + (algaeGrowthRate - naturalAlgaeMortality) * 0.2,
        );
        state.algae = Math.max(2.0, state.algae);

        const organicDecayLoad = Math.pow(state.algae / 100, 2) * 12.0;
        state.BOD += (BASE_STATE.BOD + organicDecayLoad - state.BOD) * 0.03;

        const surfaceReaeration = (BASE_STATE.DO - state.DO) * 0.015;
        const photosynthesisO2 = (state.algae / 100) * 0.04;
        const bacterialO2Consumption = state.BOD * 0.02;
        const fishO2Consumption = (fishesRef.current.filter((f) => f.state === "alive").length * 0.002);

        const dDO =
          surfaceReaeration +
          photosynthesisO2 -
          bacterialO2Consumption -
          fishO2Consumption;
        state.DO = Math.max(0.1, Math.min(9.5, state.DO + dDO));

        if (inputHujan > 1 && Math.random() < inputPupuk * 0.3) {
          runoffParticlesRef.current.push(new RunoffParticle(inputPupuk));
        }
      }

      updateEutroDOMMeters(state, fishesRef.current, domRefs);

      // Rendering
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, 30);

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
        const y = 30 + Math.sin(x * rippleFreq + simTimeRef.current * 0.05) * rippleAmp;
        ctx.lineTo(x, y);
      }

      const surfaceYRight =
        30 + Math.sin(canvas.width * rippleFreq + simTimeRef.current * 0.05) * rippleAmp;
      ctx.lineTo(canvas.width, surfaceYRight);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Inlet
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(0, 10, 50, 20);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(30, 20, 20, 10);
      ctx.beginPath();
      ctx.fillStyle = "#475569";
      ctx.ellipse(45, 25, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Algae bloom layer
      const countToRender = Math.floor(algaeEntitiesRef.current.length * (state.algae / 100));
      for (let i = 0; i < countToRender; i++) {
        algaeEntitiesRef.current[i].draw(ctx, state.algae, canvas.width);
      }

      // Runoff particles
      for (let i = runoffParticlesRef.current.length - 1; i >= 0; i--) {
        const p = runoffParticlesRef.current[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) runoffParticlesRef.current.splice(i, 1);
      }

      // Fish
      for (const fish of fishesRef.current) {
        fish.update(state.DO, canvas.width, canvas.height, simTimeRef.current);
        fish.draw(ctx);
      }

      // Rain
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
}
