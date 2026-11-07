import { test, describe } from "node:test";
import assert from "node:assert";
import { updateLandDOMMeters } from "./landDOMUpdater.ts";
import type { LandDOMRefs } from "./landDOMUpdater.ts";
import type { SimState } from "./types.ts";

function createMockElement() {
  return {
    style: {} as Record<string, string>,
    innerText: "",
    innerHTML: "",
    className: "",
  };
}

function createMockRefs(): LandDOMRefs {
  return {
    barPhRef: { current: createMockElement() as unknown as HTMLDivElement },
    barPhValRef: { current: createMockElement() as unknown as HTMLSpanElement },
    barSuburRef: { current: createMockElement() as unknown as HTMLDivElement },
    barSuburValRef: { current: createMockElement() as unknown as HTMLSpanElement },
    barAkarRef: { current: createMockElement() as unknown as HTMLDivElement },
    barAkarValRef: { current: createMockElement() as unknown as HTMLSpanElement },
    barRacunRef: { current: createMockElement() as unknown as HTMLDivElement },
    barRacunValRef: { current: createMockElement() as unknown as HTMLSpanElement },
    barPanenRef: { current: createMockElement() as unknown as HTMLDivElement },
    barPanenValRef: { current: createMockElement() as unknown as HTMLSpanElement },
    hudFishAliveRef: { current: createMockElement() as unknown as HTMLSpanElement },
    hudFishDeadRef: { current: createMockElement() as unknown as HTMLSpanElement },
    hudRootStatusRef: { current: createMockElement() as unknown as HTMLSpanElement },
    hudLeafStatusRef: { current: createMockElement() as unknown as HTMLSpanElement },
    txtWarnaRef: { current: createMockElement() as unknown as HTMLSpanElement },
    txtPerilakuRef: { current: createMockElement() as unknown as HTMLSpanElement },
    txtPanenRef: { current: createMockElement() as unknown as HTMLSpanElement },
    tanahStatusBadgeRef: { current: createMockElement() as unknown as HTMLDivElement },
  };
}

describe("landDOMUpdater", () => {
  describe("Soil status badge", () => {
    test("shows 'Sehat Subur' when rootHealth > 70 and toxicity < 25", () => {
      const refs = createMockRefs();
      const state: SimState = { pH: 6.8, fertility: 85, rootHealth: 90, toxicity: 10, yield: 85 };
      updateLandDOMMeters(state, [], refs);

      assert.ok(refs.tanahStatusBadgeRef.current?.innerHTML.includes("Sehat Subur"));
    });

    test("shows 'Degradasi' when rootHealth > 35 and toxicity < 60", () => {
      const refs = createMockRefs();
      const state: SimState = { pH: 6.0, fertility: 50, rootHealth: 55, toxicity: 40, yield: 50 };
      updateLandDOMMeters(state, [], refs);

      assert.ok(refs.tanahStatusBadgeRef.current?.innerHTML.includes("Degradasi"));
    });

    test("shows 'Kritis' when rootHealth <= 35 or toxicity >= 60", () => {
      const refs = createMockRefs();
      const state: SimState = { pH: 4.5, fertility: 20, rootHealth: 25, toxicity: 75, yield: 5 };
      updateLandDOMMeters(state, [], refs);

      assert.ok(refs.tanahStatusBadgeRef.current?.innerHTML.includes("Kritis"));
    });
  });

  describe("Plant root condition (txtPerilakuRef)", () => {
    test("shows 'Tumbuh Normal' when rootHealth > 75", () => {
      const refs = createMockRefs();
      const state: SimState = { pH: 6.5, fertility: 80, rootHealth: 85, toxicity: 10, yield: 80 };
      updateLandDOMMeters(state, [], refs);

      assert.strictEqual(refs.txtPerilakuRef.current?.innerText, "Tumbuh Normal");
    });

    test("shows 'Pertumbuhan Terhenti' when 35 < rootHealth <= 75", () => {
      const refs = createMockRefs();
      const state: SimState = { pH: 5.8, fertility: 50, rootHealth: 50, toxicity: 30, yield: 40 };
      updateLandDOMMeters(state, [], refs);

      assert.strictEqual(refs.txtPerilakuRef.current?.innerText, "Pertumbuhan Terhenti");
    });

    test("shows 'Akar Mati' when rootHealth <= 35", () => {
      const refs = createMockRefs();
      const state: SimState = { pH: 4.0, fertility: 15, rootHealth: 20, toxicity: 80, yield: 0 };
      updateLandDOMMeters(state, [], refs);

      assert.strictEqual(refs.txtPerilakuRef.current?.innerText, "Akar Mati");
    });
  });
});
