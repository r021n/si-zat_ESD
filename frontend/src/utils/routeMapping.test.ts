import { test, describe } from "node:test";
import assert from "node:assert";
import { getMenuKeyFromPathname, PATH_MENU_MAP } from "./routeMapping.ts";

describe("getMenuKeyFromPathname", () => {
  test("returns correct menu key for predefined routes", () => {
    assert.strictEqual(getMenuKeyFromPathname("/materi"), "menu materi");
    assert.strictEqual(getMenuKeyFromPathname("/simulasi"), "menu simulasi");
    assert.strictEqual(getMenuKeyFromPathname("/simulasi/air"), "menu pencemaran air");
    assert.strictEqual(getMenuKeyFromPathname("/kuis"), "menu kuis");
    assert.strictEqual(getMenuKeyFromPathname("/kuis/berpikir-sistem"), "menu berpikir sistem");
  });

  test("handles dynamic ruang diskusi subroutes", () => {
    assert.strictEqual(getMenuKeyFromPathname("/ruang-diskusi"), "menu ruang diskusi");
    assert.strictEqual(getMenuKeyFromPathname("/ruang-diskusi/topic-123"), "menu ruang diskusi");
  });

  test("returns empty string for untracked routes", () => {
    assert.strictEqual(getMenuKeyFromPathname("/unknown"), "");
    assert.strictEqual(getMenuKeyFromPathname("/login"), "");
    assert.strictEqual(getMenuKeyFromPathname(""), "");
  });

  test("all keys in PATH_MENU_MAP return their designated value", () => {
    for (const [path, expected] of Object.entries(PATH_MENU_MAP)) {
      assert.strictEqual(getMenuKeyFromPathname(path), expected);
    }
  });
});
