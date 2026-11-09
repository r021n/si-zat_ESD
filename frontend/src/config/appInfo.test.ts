import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { APP_INFO } from "./appInfo.ts";

describe("appInfo configuration", () => {
  describe("APP_INFO metadata", () => {
    test("contains non-empty core app information", () => {
      assert.ok(APP_INFO.name.length > 0);
      assert.ok(APP_INFO.institution.length > 0);
      assert.ok(APP_INFO.faculty.length > 0);
      assert.ok(APP_INFO.version.startsWith("v"));
    });

    test("contains research title and developers", () => {
      assert.ok(APP_INFO.researchTitle.length > 0);
      assert.ok(Array.isArray(APP_INFO.developers));
      assert.strictEqual(APP_INFO.developers.length, 3);
      for (const developer of APP_INFO.developers) {
        assert.ok(developer.length > 0);
      }
    });

    test("defines a reasonable fade timing", () => {
      assert.ok(APP_INFO.fadeDurationMs >= 200);
      assert.ok(APP_INFO.fadeDurationMs <= 1000);
    });
  });
});
