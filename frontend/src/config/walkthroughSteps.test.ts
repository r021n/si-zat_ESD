import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getWalkthroughSteps,
  getWalkthroughStorageKey,
  hasSeenWalkthrough,
  setSeenWalkthrough,
  WALKTHROUGH_STORAGE_KEY_PREFIX,
} from './walkthroughSteps.ts';

describe('walkthroughSteps config & helpers', () => {
  describe('getWalkthroughSteps', () => {
    it('returns 10 steps for enrolled student (all individual menus covered)', () => {
      const steps = getWalkthroughSteps(false, true);
      assert.equal(steps.length, 10);

      const ids = steps.map((s) => s.id);
      assert.deepEqual(ids, [
        'promo-card',
        'menu-materi',
        'menu-simulasi',
        'menu-kuis',
        'menu-ruang-diskusi',
        'menu-berpikir-sistem',
        'menu-profile-report',
        'menu-profil-pengembang',
        'stats-footer',
        'help-button',
      ]);

      const berpikirSistemStep = steps.find((s) => s.id === 'menu-berpikir-sistem');
      assert.ok(berpikirSistemStep?.targetSelector.includes('menu-berpikir-sistem'));
    });

    it('returns 6 steps for unenrolled student (includes enroll button step)', () => {
      const steps = getWalkthroughSteps(false, false);
      // 1: promo-card
      // 2: menu-enroll
      // 3: menu-profile-report
      // 4: menu-profil-pengembang
      // 5: stats-footer
      // 6: help-button
      assert.equal(steps.length, 6);

      const ids = steps.map((s) => s.id);
      assert.deepEqual(ids, [
        'promo-card',
        'menu-enroll',
        'menu-profile-report',
        'menu-profil-pengembang',
        'stats-footer',
        'help-button',
      ]);
      assert.ok(!ids.includes('menu-admin'));
      assert.ok(!ids.includes('menu-materi'));
    });

    it('returns 11 steps for admin/teacher (includes admin panel step)', () => {
      const steps = getWalkthroughSteps(true, false);
      // Admin sees:
      // 1: promo-card
      // 2: menu-materi
      // 3: menu-simulasi
      // 4: menu-kuis
      // 5: menu-ruang-diskusi
      // 6: menu-berpikir-sistem
      // 7: menu-profile-report
      // 8: menu-profil-pengembang
      // 9: menu-admin
      // 10: stats-footer
      // 11: help-button
      assert.equal(steps.length, 11);

      const ids = steps.map((s) => s.id);
      assert.ok(ids.includes('menu-admin'));
      assert.ok(!ids.includes('menu-enroll'));

      // Check badge formatting
      assert.equal(steps[0].badge, 'Langkah 1 dari 11');
      assert.equal(steps[10].badge, 'Langkah 11 dari 11');

      // Check specific admin wording
      assert.match(steps[0].title, /Hak Akses/i);
    });
  });

  describe('storage helpers', () => {
    it('generates correct storage key with prefix', () => {
      assert.equal(getWalkthroughStorageKey(42), `${WALKTHROUGH_STORAGE_KEY_PREFIX}42`);
      assert.equal(getWalkthroughStorageKey('user-abc'), `${WALKTHROUGH_STORAGE_KEY_PREFIX}user-abc`);
      assert.equal(getWalkthroughStorageKey(null), `${WALKTHROUGH_STORAGE_KEY_PREFIX}guest`);
      assert.equal(getWalkthroughStorageKey(undefined), `${WALKTHROUGH_STORAGE_KEY_PREFIX}guest`);
    });

    it('correctly reads and writes seen status with mock storage', () => {
      const mockStore: Record<string, string> = {};
      const mockStorage = {
        getItem: (k: string) => mockStore[k] ?? null,
        setItem: (k: string, v: string) => {
          mockStore[k] = v;
        },
      };

      // Initially false
      assert.equal(hasSeenWalkthrough(123, mockStorage), false);

      // Set seen
      setSeenWalkthrough(123, mockStorage);

      // Now true
      assert.equal(hasSeenWalkthrough(123, mockStorage), true);

      // Different user remains false
      assert.equal(hasSeenWalkthrough(999, mockStorage), false);
    });

    it('safely handles missing or throwing storage without throwing', () => {
      const throwingStorage = {
        getItem: () => {
          throw new Error('Storage disabled');
        },
        setItem: () => {
          throw new Error('Quota exceeded');
        },
      };

      assert.equal(hasSeenWalkthrough(1, throwingStorage), false);
      assert.doesNotThrow(() => setSeenWalkthrough(1, throwingStorage));
    });
  });
});
