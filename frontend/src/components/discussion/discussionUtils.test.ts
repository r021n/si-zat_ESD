import { test, describe } from "node:test";
import assert from "node:assert";
import {
  parseListItems,
  formatChatTime,
  getSubmissionImageUrl,
} from "./discussionUtils.ts";

describe("discussionUtils", () => {
  describe("getSubmissionImageUrl", () => {
    test("returns empty string if submissionId is empty", () => {
      assert.strictEqual(getSubmissionImageUrl(""), "");
    });

    test("returns base submission image URL when submittedAt is not provided", () => {
      const url = getSubmissionImageUrl("sub-123");
      assert.ok(url.endsWith("/api/announcements/submissions/sub-123/image"));
      assert.ok(!url.includes("?v="));
    });

    test("returns versioned submission image URL when submittedAt is provided", () => {
      const submittedAt = "2026-11-01T10:00:00.000Z";
      const url = getSubmissionImageUrl("sub-123", submittedAt);
      assert.ok(
        url.endsWith(
          `/api/announcements/submissions/sub-123/image?v=${encodeURIComponent(submittedAt)}`,
        ),
      );
    });
  });

  describe("parseListItems", () => {
    test("parses newline-separated list items removing numbers or bullets", () => {
      const input = "1. First\n2. Second\n- Third";
      const result = parseListItems(input);
      assert.deepStrictEqual(result, ["First", "Second", "Third"]);
    });

    test("returns empty array for empty string", () => {
      assert.deepStrictEqual(parseListItems(""), []);
    });
  });

  describe("formatChatTime", () => {
    test("returns empty string for empty input", () => {
      assert.strictEqual(formatChatTime(""), "");
    });

    test("formats valid ISO date string", () => {
      const res = formatChatTime("2026-11-01T10:30:00.000Z");
      assert.ok(res.length > 0);
    });
  });
});
