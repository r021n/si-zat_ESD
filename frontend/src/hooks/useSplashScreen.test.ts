import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { APP_INFO } from "../config/appInfo.ts";

/**
 * Pure simulation of useSplashScreen state machine logic for unit testing
 * without needing a full browser/jsdom environment.
 */
class SplashScreenStateMachine {
  isVisible = true;
  isFading = false;
  isStalled = false;
  private fadeDuration: number;
  private stallTimeout: number;
  private fadeTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private stallTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    fadeDuration = APP_INFO.fadeDurationMs,
    stallTimeout = 8000,
  ) {
    this.fadeDuration = fadeDuration;
    this.stallTimeout = stallTimeout;
  }

  startStallTimer(): void {
    this.stallTimeoutId = setTimeout(() => {
      this.isStalled = true;
    }, this.stallTimeout);
  }

  markReady(): void {
    if (this.stallTimeoutId) clearTimeout(this.stallTimeoutId);
  }

  triggerExit(): void {
    this.isFading = true;
    this.fadeTimeoutId = setTimeout(() => {
      this.isVisible = false;
      this.isFading = false;
    }, this.fadeDuration);
  }

  skip(isReady: boolean): boolean {
    if (!this.isVisible || this.isFading || !isReady) return false;
    this.triggerExit();
    return true;
  }

  cleanup(): void {
    if (this.fadeTimeoutId) clearTimeout(this.fadeTimeoutId);
    if (this.stallTimeoutId) clearTimeout(this.stallTimeoutId);
  }
}

describe("SplashScreen State Machine Logic", () => {
  test("initializes with isVisible true, isFading false, and isStalled false", () => {
    const sm = new SplashScreenStateMachine(2000, 30);
    assert.strictEqual(sm.isVisible, true);
    assert.strictEqual(sm.isFading, false);
    assert.strictEqual(sm.isStalled, false);
    sm.cleanup();
  });

  test("does not allow skip before app is ready", () => {
    const sm = new SplashScreenStateMachine(2000, 30);
    const skipped = sm.skip(false);
    assert.strictEqual(skipped, false);
    assert.strictEqual(sm.isVisible, true);
    assert.strictEqual(sm.isFading, false);
    sm.cleanup();
  });

  test("allows skip when app is ready and immediately starts fading", () => {
    const sm = new SplashScreenStateMachine(2000, 30);
    const skipped = sm.skip(true);
    assert.strictEqual(skipped, true);
    assert.strictEqual(sm.isFading, true);
    assert.strictEqual(sm.isVisible, true);
    sm.cleanup();
  });

  test("completes fade out and hides after fadeDuration", (t, done) => {
    const sm = new SplashScreenStateMachine(50, 30);
    sm.skip(true);
    setTimeout(() => {
      assert.strictEqual(sm.isVisible, false);
      assert.strictEqual(sm.isFading, false);
      sm.cleanup();
      done();
    }, 80);
  });

  test("does not dismiss automatically when the app is ready", (t, done) => {
    const sm = new SplashScreenStateMachine(20, 30);
    sm.startStallTimer();
    sm.markReady();
    setTimeout(() => {
      assert.strictEqual(sm.isVisible, true);
      assert.strictEqual(sm.isFading, false);
      assert.strictEqual(sm.isStalled, false);
      sm.cleanup();
      done();
    }, 60);
  });

  test("marks the screen as stalled when initialization exceeds the timeout", (t, done) => {
    const sm = new SplashScreenStateMachine(20, 30);
    sm.startStallTimer();
    setTimeout(() => {
      assert.strictEqual(sm.isStalled, true);
      assert.strictEqual(sm.isVisible, true);
      sm.cleanup();
      done();
    }, 60);
  });

  test("cleanup cancels a pending fade timer", (t, done) => {
    const sm = new SplashScreenStateMachine(20, 30);
    sm.skip(true);
    sm.cleanup();
    setTimeout(() => {
      assert.strictEqual(sm.isVisible, true);
      done();
    }, 50);
  });
});
