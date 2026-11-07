import { test, describe } from "node:test";
import assert from "node:assert";
import { updateWaterDOMMeters } from "./waterDOMUpdater.ts";
import type { WaterDOMRefs } from "./waterDOMUpdater.ts";
import type { SimState } from "./types.ts";
import type { Fish } from "./agents.ts";

function createMockElement() {
  return {
    style: {} as Record<string, string>,
    innerText: "",
    innerHTML: "",
    className: "",
  };
}

function createMockRefs(): WaterDOMRefs {
  return {
    barDoRef: { current: createMockElement() as unknown as HTMLDivElement },
    barDoValRef: { current: createMockElement() as unknown as HTMLSpanElement },
    barPhRef: { current: createMockElement() as unknown as HTMLDivElement },
    barPhValRef: { current: createMockElement() as unknown as HTMLSpanElement },
    barBodRef: { current: createMockElement() as unknown as HTMLDivElement },
    barBodValRef: { current: createMockElement() as unknown as HTMLSpanElement },
    barCodRef: { current: createMockElement() as unknown as HTMLDivElement },
    barCodValRef: { current: createMockElement() as unknown as HTMLSpanElement },
    barPolRef: { current: createMockElement() as unknown as HTMLDivElement },
    barPolValRef: { current: createMockElement() as unknown as HTMLSpanElement },
    hudFishRef: { current: createMockElement() as unknown as HTMLSpanElement },
    hudDeadFishRef: { current: createMockElement() as unknown as HTMLSpanElement },
    hudTransparencyRef: { current: createMockElement() as unknown as HTMLSpanElement },
    txtWarnaRef: { current: createMockElement() as unknown as HTMLSpanElement },
    txtPerilakuRef: { current: createMockElement() as unknown as HTMLSpanElement },
    txtToksikRef: { current: createMockElement() as unknown as HTMLSpanElement },
    airStatusBadgeRef: { current: createMockElement() as unknown as HTMLDivElement },
  };
}

describe("waterDOMUpdater", () => {
  describe("Water status badge", () => {
    test("shows 'Bersih' when pollutant < 15 and DO > 6.0", () => {
      const refs = createMockRefs();
      const state: SimState = { DO: 7.5, pH: 7.2, BOD: 2, COD: 5, pollutant: 5 };
      updateWaterDOMMeters(state, [], refs);

      assert.ok(refs.airStatusBadgeRef.current?.innerHTML.includes("Bersih"));
    });

    test("shows 'Tercemar' when pollutant < 50 and DO > 4.0", () => {
      const refs = createMockRefs();
      const state: SimState = { DO: 4.8, pH: 6.8, BOD: 15, COD: 30, pollutant: 25 };
      updateWaterDOMMeters(state, [], refs);

      assert.ok(refs.airStatusBadgeRef.current?.innerHTML.includes("Tercemar"));
    });

    test("shows 'Kritis' when pollutant >= 50 or DO <= 4.0", () => {
      const refs = createMockRefs();
      const state: SimState = { DO: 2.1, pH: 5.0, BOD: 60, COD: 100, pollutant: 70 };
      updateWaterDOMMeters(state, [], refs);

      assert.ok(refs.airStatusBadgeRef.current?.innerHTML.includes("Kritis"));
    });
  });

  describe("Fish behavior (txtPerilakuRef)", () => {
    test("shows 'Punah' when all fish are dead", () => {
      const refs = createMockRefs();
      const state: SimState = { DO: 1.0, pH: 4.0, BOD: 80, COD: 120, pollutant: 85 };
      const fishList = [{ state: "dead" }] as unknown as Fish[];
      updateWaterDOMMeters(state, fishList, refs);

      assert.strictEqual(refs.txtPerilakuRef.current?.innerText, "Punah");
    });

    test("shows 'Sehat Aktif' when DO >= 5.5 and pH >= 6.5", () => {
      const refs = createMockRefs();
      const state: SimState = { DO: 6.5, pH: 7.0, BOD: 5, COD: 10, pollutant: 10 };
      const fishList = [{ state: "swim" }] as unknown as Fish[];
      updateWaterDOMMeters(state, fishList, refs);

      assert.strictEqual(refs.txtPerilakuRef.current?.innerText, "Sehat Aktif");
    });

    test("shows 'Lemas/Sekarat' when DO < 3.5 or pH < 5.5", () => {
      const refs = createMockRefs();
      const state: SimState = { DO: 3.0, pH: 6.0, BOD: 30, COD: 50, pollutant: 40 };
      const fishList = [{ state: "swim" }] as unknown as Fish[];
      updateWaterDOMMeters(state, fishList, refs);

      assert.strictEqual(refs.txtPerilakuRef.current?.innerText, "Lemas/Sekarat");
    });
  });
});
