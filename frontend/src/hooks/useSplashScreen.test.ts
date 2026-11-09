import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateRemainingSplashTime, APP_INFO } from "../config/appInfo.ts";

/**
 * Pure simulation of useSplashScreen state machine logic for unit testing
 * without needing a full browser/jsdom environment.
 */
class SplashScreenStateMachine {
  isVisible = true;
  isFading = false;
  private startTime: number;
  private minDuration: number;
  private fadeDuration: number;
  private autoDismiss: boolean;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private fadeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    minDuration = APP_INFO.minSplashDurationMs,
    fadeDuration = APP_INFO.fadeDurationMs,
    autoDismiss = false,
  ) {
    this.startTime = Date.now();
    this.minDuration = minDuration;
    this.fadeDuration = fadeDuration;
    this.autoDismiss = autoDismiss;
  }

  setReady(currentTime: number, onComplete?: () => void): void {
    if (!this.autoDismiss || !this.isVisible || this.isFading) return;

    const remaining = calculateRemainingSplashTime(this.startTime, currentTime, this.minDuration);
    this.timeoutId = setTimeout(() => {
      this.triggerExit(onComplete);
    }, remaining);
  }

  triggerExit(onComplete?: () => void): void {
    this.isFading = true;
    this.fadeTimeoutId = setTimeout(() => {
      this.isVisible = false;
      this.isFading = false;
      if (onComplete) onComplete();
    }, this.fadeDuration);
  }

  skip(isReady: boolean, onComplete?: () => void): boolean {
    if (!this.isVisible || this.isFading || !isReady) return false;
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.triggerExit(onComplete);
    return true;
  }

  cleanup(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.fadeTimeoutId) clearTimeout(this.fadeTimeoutId);
  }
}

describe("SplashScreen State Machine Logic", () => {
  test("initializes with isVisible true and isFading false", () => {
    const sm = new SplashScreenStateMachine(2000, 300);
    assert.strictEqual(sm.isVisible, true);
    assert.strictEqual(sm.isFading, false);
    sm.cleanup();
  });

  test("does not allow skip before app is ready", () => {
    const sm = new SplashScreenStateMachine(2000, 300);
    const skipped = sm.skip(false);
    assert.strictEqual(skipped, false);
    assert.strictEqual(sm.isVisible, true);
    assert.strictEqual(sm.isFading, false);
    sm.cleanup();
  });

  test("allows skip when app is ready and immediately starts fading", () => {
    const sm = new SplashScreenStateMachine(2000, 300);
    const skipped = sm.skip(true);
    assert.strictEqual(skipped, true);
    assert.strictEqual(sm.isFading, true);
    assert.strictEqual(sm.isVisible, true);
    sm.cleanup();
  });

  test("completes fade out and hides after fadeDuration", (t, done) => {
    const sm = new SplashScreenStateMachine(100, 50);
    sm.skip(true, () => {
      assert.strictEqual(sm.isVisible, false);
      assert.strictEqual(sm.isFading, false);
      done();
    });
  });

  test("does not automatically transition when autoDismiss is false (default)", (t, done) => {
    const sm = new SplashScreenStateMachine(30, 20, false);
    sm.setReady(Date.now(), () => {
      assert.fail("Should not automatically transition when autoDismiss is false");
    });
    setTimeout(() => {
      assert.strictEqual(sm.isVisible, true);
      assert.strictEqual(sm.isFading, false);
      sm.cleanup();
      done();
    }, 60);
  });

  test("transitions automatically when autoDismiss is true and setReady is called", (t, done) => {
    const sm = new SplashScreenStateMachine(30, 20, true);
    sm.setReady(Date.now(), () => {
      assert.strictEqual(sm.isVisible, false);
      assert.strictEqual(sm.isFading, false);
      done();
    });
  });
});
