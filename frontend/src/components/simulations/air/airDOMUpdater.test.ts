import { test, describe } from "node:test";
import assert from "node:assert";
import { updateAirDOMMeters } from "./airDOMUpdater.ts";
import type { AirDOMRefs } from "./airDOMUpdater.ts";
import type { SimState } from "./types.ts";
import type { Citizen } from "./agents.ts";

function createMockElement() {
  return {
    style: {} as Record<string, string>,
    innerText: "",
    innerHTML: "",
    className: "",
  };
}

function createMockRefs(): AirDOMRefs {
  return {
    barAqiRef: { current: createMockElement() as unknown as HTMLDivElement },
    barAqiValRef: { current: createMockElement() as unknown as HTMLSpanElement },
    barPm25Ref: { current: createMockElement() as unknown as HTMLDivElement },
    barPm25ValRef: { current: createMockElement() as unknown as HTMLSpanElement },
    barCo2Ref: { current: createMockElement() as unknown as HTMLDivElement },
    barCo2ValRef: { current: createMockElement() as unknown as HTMLSpanElement },
    barCoRef: { current: createMockElement() as unknown as HTMLDivElement },
    barCoValRef: { current: createMockElement() as unknown as HTMLSpanElement },
    barO2Ref: { current: createMockElement() as unknown as HTMLDivElement },
    barO2ValRef: { current: createMockElement() as unknown as HTMLSpanElement },
    hudHealthyRef: { current: createMockElement() as unknown as HTMLSpanElement },
    hudCoughingRef: { current: createMockElement() as unknown as HTMLSpanElement },
    hudSmogRef: { current: createMockElement() as unknown as HTMLSpanElement },
    hudMaskWarningRef: { current: createMockElement() as unknown as HTMLDivElement },
    txtWarnaRef: { current: createMockElement() as unknown as HTMLSpanElement },
    txtPerilakuRef: { current: createMockElement() as unknown as HTMLSpanElement },
    txtToksikRef: { current: createMockElement() as unknown as HTMLSpanElement },
    airStatusBadgeRef: { current: createMockElement() as unknown as HTMLDivElement },
    barHeightsRef: {
      current: {
        AQI: 0,
        PM25: 0,
        CO2: 0,
        CO: 0,
        O2: 0,
      },
    },
  };
}

describe("airDOMUpdater", () => {
  describe("Toxicity tiers (txtToksikRef)", () => {
    test("sets 'Aman' when AQI < 50", () => {
      const refs = createMockRefs();
      const state: SimState = { AQI: 30, PM25: 10, CO2: 400, CO: 2, O2: 21 };
      updateAirDOMMeters(state, [], refs);

      assert.strictEqual(refs.txtToksikRef.current?.innerText, "Aman");
      assert.ok(refs.txtToksikRef.current?.className.includes("text-emerald-600"));
    });

    test("sets 'Waspada' when 50 <= AQI < 150", () => {
      const refs = createMockRefs();
      const state: SimState = { AQI: 100, PM25: 50, CO2: 500, CO: 5, O2: 20 };
      updateAirDOMMeters(state, [], refs);

      assert.strictEqual(refs.txtToksikRef.current?.innerText, "Waspada");
      assert.ok(refs.txtToksikRef.current?.className.includes("text-amber-500"));
    });

    test("sets 'Berbahaya' when 150 <= AQI < 250", () => {
      const refs = createMockRefs();
      const state: SimState = { AQI: 200, PM25: 120, CO2: 600, CO: 15, O2: 19 };
      updateAirDOMMeters(state, [], refs);

      assert.strictEqual(refs.txtToksikRef.current?.innerText, "Berbahaya");
      assert.ok(refs.txtToksikRef.current?.className.includes("text-rose-600"));
    });

    test("sets 'Sangat Berbahaya' when AQI >= 250", () => {
      const refs = createMockRefs();
      const state: SimState = { AQI: 300, PM25: 200, CO2: 800, CO: 30, O2: 17 };
      updateAirDOMMeters(state, [], refs);

      assert.strictEqual(refs.txtToksikRef.current?.innerText, "Sangat Berbahaya");
      assert.ok(refs.txtToksikRef.current?.className.includes("text-red-600"));
    });
  });

  describe("Citizen condition (txtPerilakuRef)", () => {
    test("sets 'Normal Sehat' when AQI < 50 and coughingWarga is 0", () => {
      const refs = createMockRefs();
      const state: SimState = { AQI: 25, PM25: 5, CO2: 400, CO: 1, O2: 21 };
      const citizens = [{ isCoughingNow: false }] as unknown as Citizen[];
      updateAirDOMMeters(state, citizens, refs);

      assert.strictEqual(refs.txtPerilakuRef.current?.innerText, "Normal Sehat");
      assert.ok(refs.txtPerilakuRef.current?.className.includes("text-emerald-600"));
    });

    test("sets 'Berisiko Tinggi' in dangerous conditions (AQI >= 150) when no one is actively coughing", () => {
      const refs = createMockRefs();
      const state: SimState = { AQI: 180, PM25: 100, CO2: 600, CO: 10, O2: 19 };
      const citizens = [{ isCoughingNow: false }] as unknown as Citizen[];
      updateAirDOMMeters(state, citizens, refs);

      assert.strictEqual(refs.txtPerilakuRef.current?.innerText, "Berisiko Tinggi");
      assert.ok(refs.txtPerilakuRef.current?.className.includes("text-red-600"));
    });

    test("sets 'Banyak Batuk!' in dangerous conditions (AQI >= 150) when citizens cough", () => {
      const refs = createMockRefs();
      const state: SimState = { AQI: 220, PM25: 130, CO2: 650, CO: 15, O2: 18 };
      const citizens = [{ isCoughingNow: true }] as unknown as Citizen[];
      updateAirDOMMeters(state, citizens, refs);

      assert.strictEqual(refs.txtPerilakuRef.current?.innerText, "Banyak Batuk!");
      assert.ok(refs.txtPerilakuRef.current?.className.includes("text-red-600 animate-bounce"));
    });

    test("sets 'Mulai Rentan' when 50 <= AQI < 150 and coughingWarga is 0", () => {
      const refs = createMockRefs();
      const state: SimState = { AQI: 80, PM25: 35, CO2: 450, CO: 3, O2: 20.5 };
      const citizens = [{ isCoughingNow: false }] as unknown as Citizen[];
      updateAirDOMMeters(state, citizens, refs);

      assert.strictEqual(refs.txtPerilakuRef.current?.innerText, "Mulai Rentan");
      assert.ok(refs.txtPerilakuRef.current?.className.includes("text-amber-500"));
    });
  });

  describe("Air status badge (airStatusBadgeRef)", () => {
    test("shows 'Sehat (Baik)' when AQI < 50", () => {
      const refs = createMockRefs();
      const state: SimState = { AQI: 30, PM25: 10, CO2: 400, CO: 1, O2: 21 };
      updateAirDOMMeters(state, [], refs);

      assert.ok(refs.airStatusBadgeRef.current?.innerHTML.includes("Sehat (Baik)"));
    });

    test("shows 'Tidak Sehat' when 50 <= AQI < 150", () => {
      const refs = createMockRefs();
      const state: SimState = { AQI: 120, PM25: 60, CO2: 500, CO: 5, O2: 20 };
      updateAirDOMMeters(state, [], refs);

      assert.ok(refs.airStatusBadgeRef.current?.innerHTML.includes("Tidak Sehat"));
    });

    test("shows 'Berbahaya!' when AQI >= 150", () => {
      const refs = createMockRefs();
      const state: SimState = { AQI: 160, PM25: 90, CO2: 550, CO: 10, O2: 19 };
      updateAirDOMMeters(state, [], refs);

      assert.ok(refs.airStatusBadgeRef.current?.innerHTML.includes("Berbahaya!"));
    });
  });
});
