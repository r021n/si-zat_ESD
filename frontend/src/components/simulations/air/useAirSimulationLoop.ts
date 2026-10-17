import { useEffect, type RefObject } from "react";
import type { SimState } from "./types";
import { INITIAL_VALUES } from "./types";
import { SmokeParticle, type Citizen, type Cloud } from "./agents";
import { drawCitySkyline, drawSmogOverlay } from "./airRenderers";
import { updateAirDOMMeters, type AirDOMRefs } from "./airDOMUpdater";

interface UseAirSimulationLoopParams extends AirDOMRefs {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  simStateRef: RefObject<SimState>;
  simTimeRef: RefObject<number>;
  runningRef: RefObject<boolean>;
  carXRef: RefObject<number>;
  inputsRef: RefObject<{
    checkKendaraan: boolean;
    checkPabrik: boolean;
    checkSampah: boolean;
    slideAsap: number;
    slideAngin: number;
  }>;
  citizenArrayRef: RefObject<Citizen[]>;
  cloudsArrayRef: RefObject<Cloud[]>;
  smokeParticlesRef: RefObject<SmokeParticle[]>;
  populateSim: (width: number, height: number) => void;
}

export function useAirSimulationLoop(params: UseAirSimulationLoopParams) {
  const {
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
        if (citizenArrayRef.current.length === 0) {
          populateSim(canvas.width, canvas.height);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    let animationFrameId: number;

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
          (calculatedAQI - state.AQI) * 0.05 - state.AQI * dispersionFactor * 0.1;
        state.AQI = Math.min(450, Math.max(5, state.AQI));

        state.PM25 += (Math.random() - 0.5) * 0.12;
        state.PM25 = Math.max(2.0, state.PM25);

        state.CO2 += (Math.random() - 0.5) * 0.6;
        state.CO2 = Math.max(380.0, state.CO2);

        state.CO += (Math.random() - 0.5) * 0.015;
        state.CO = Math.max(0.1, state.CO);

        state.O2 += (Math.random() - 0.5) * 0.008;
        state.O2 = Math.min(21.0, Math.max(14.0, state.O2));

        state.AQI += (Math.random() - 0.5) * 0.2;
        state.AQI = Math.min(450, Math.max(5, state.AQI));

        if (pbr && Math.random() < asap * 0.25 + 0.1) {
          smokeParticlesRef.current.push(
            new SmokeParticle(canvas.width - 57, canvas.height - 125, -0.2, -0.4, "pabrik"),
          );
        }
        if (smp && Math.random() < asap * 0.2 + 0.1) {
          smokeParticlesRef.current.push(
            new SmokeParticle(192, canvas.height - 40, 0.1, -0.3, "sampah"),
          );
        }
        if (mob && Math.random() < asap * 0.15 + 0.05) {
          smokeParticlesRef.current.push(
            new SmokeParticle(carXRef.current - 2, canvas.height - 25, -0.5, 0.0, "kendaraan"),
          );
        }

        if (mob) {
          const speed = asap * 1.5 + 0.5;
          carXRef.current += speed;
          if (carXRef.current - 45 > canvas.width) carXRef.current = -40;
        }
      }

      updateAirDOMMeters(state, citizenArrayRef.current, domRefs);

      // Visual rendering
      drawCitySkyline(
        ctx,
        canvas.width,
        canvas.height,
        carXRef.current,
        inputsRef.current.checkSampah,
      );

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
        citizen.draw(ctx, simTimeRef.current);
      }

      drawSmogOverlay(ctx, canvas.width, canvas.height, state.AQI);

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
