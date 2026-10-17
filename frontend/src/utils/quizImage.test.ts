import { test, describe } from "node:test";
import assert from "node:assert";
import { getQuizImageUrl } from "./quizImage.ts";

describe("getQuizImageUrl", () => {
  test("returns empty string when input is empty", () => {
    assert.strictEqual(getQuizImageUrl(""), "");
  });

  test("returns raw data URL unchanged", () => {
    const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    assert.strictEqual(getQuizImageUrl(dataUrl), dataUrl);
  });

  test("returns blob URL unchanged", () => {
    const blobUrl = "blob:http://localhost:5173/1234-5678";
    assert.strictEqual(getQuizImageUrl(blobUrl), blobUrl);
  });

  test("returns full http/https URL unchanged", () => {
    const httpUrl = "https://example.com/test.jpg";
    assert.strictEqual(getQuizImageUrl(httpUrl), httpUrl);
  });

  test("prepends API_URL for relative paths", () => {
    const relativePath = "/api/quiz/images/qi-123";
    const result = getQuizImageUrl(relativePath);
    assert.ok(result.endsWith("/api/quiz/images/qi-123"));
  });
});
