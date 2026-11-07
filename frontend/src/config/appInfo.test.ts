import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  APP_INFO,
  calculateRemainingSplashTime,
} from "./appInfo.ts";

describe("appInfo configuration and helpers", () => {
  describe("APP_INFO metadata", () => {
    test("contains non-empty core app information", () => {
      assert.ok(APP_INFO.name.length > 0);
      assert.ok(APP_INFO.badge.length > 0);
      assert.ok(APP_INFO.tagline.length > 0);
      assert.ok(APP_INFO.description.length > 0);
      assert.ok(APP_INFO.institution.length > 0);
      assert.ok(APP_INFO.faculty.length > 0);
      assert.ok(APP_INFO.version.startsWith("v"));
    });

    test("contains valid topics list", () => {
      assert.ok(Array.isArray(APP_INFO.topics));
      assert.strictEqual(APP_INFO.topics.length, 4);
      for (const topic of APP_INFO.topics) {
        assert.ok(topic.title.length > 0);
        assert.ok(topic.icon.length > 0);
      }
    });

    test("defines reasonable splash and fade timings", () => {
      assert.ok(APP_INFO.minSplashDurationMs >= 1000);
      assert.ok(APP_INFO.minSplashDurationMs <= 5000);
      assert.ok(APP_INFO.fadeDurationMs >= 200);
      assert.ok(APP_INFO.fadeDurationMs <= 1000);
    });
  });

  describe("calculateRemainingSplashTime", () => {
    test("returns full duration when elapsed time is 0", () => {
      const remaining = calculateRemainingSplashTime(1000, 1000, 2000);
      assert.strictEqual(remaining, 2000);
    });

    test("returns difference when elapsed time is less than minDuration", () => {
      const remaining = calculateRemainingSplashTime(1000, 1500, 2000);
      assert.strictEqual(remaining, 1500);
    });

    test("returns 0 when elapsed time equals minDuration", () => {
      const remaining = calculateRemainingSplashTime(1000, 3000, 2000);
      assert.strictEqual(remaining, 0);
    });

    test("returns 0 when elapsed time exceeds minDuration", () => {
      const remaining = calculateRemainingSplashTime(1000, 4500, 2000);
      assert.strictEqual(remaining, 0);
    });

    test("handles edge case where currentTime is earlier than startTime", () => {
      const remaining = calculateRemainingSplashTime(2000, 1000, 2000);
      assert.strictEqual(remaining, 2000);
    });

    test("returns 0 for NaN inputs gracefully", () => {
      assert.strictEqual(calculateRemainingSplashTime(NaN, 1000, 2000), 0);
      assert.strictEqual(calculateRemainingSplashTime(1000, NaN, 2000), 0);
      assert.strictEqual(calculateRemainingSplashTime(1000, 2000, NaN), 0);
    });
  });
});
