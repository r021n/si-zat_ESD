import { test, describe } from "node:test";
import assert from "node:assert";
import { compressImagesBatch } from "./image.ts";

describe("compressImagesBatch", () => {
  test("returns empty array when given empty input", async () => {
    const result = await compressImagesBatch([]);
    assert.deepStrictEqual(result, []);
  });

  test("handles non-image or small files gracefully with progress reporting", async () => {
    const file1 = new File(["small image content"], "test1.jpg", {
      type: "image/jpeg",
    });
    const file2 = new File(["small image content 2"], "test2.jpg", {
      type: "image/jpeg",
    });

    const progressCalls: [number, number][] = [];
    const result = await compressImagesBatch([file1, file2], 250 * 1024, 1200, (curr, total) => {
      progressCalls.push([curr, total]);
    });

    assert.strictEqual(result.length, 2);
    assert.strictEqual(progressCalls.length, 2);
    assert.deepStrictEqual(progressCalls, [
      [1, 2],
      [2, 2],
    ]);
  });
});
