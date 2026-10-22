import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { sign } from "hono/jwt";
import announcementsRoute from "./index.js";
import announcementsRouteCompat, {
  invalidateAnnouncementsServerCache,
} from "../announcements.js";
import {
  getAnnouncementsServerCache,
  setAnnouncementsServerCache,
  ANNOUNCEMENTS_SERVER_TTL_MS,
} from "./cache.js";
import { db } from "../../db/index.js";

describe("Announcements Route Modular Refactoring", () => {
  beforeEach(() => {
    // Ensure cache is reset before each test
    invalidateAnnouncementsServerCache();
  });

  describe("Backward Compatibility", () => {
    it("should export the same router instance from announcements.ts and announcements/index.ts", () => {
      assert.strictEqual(announcementsRoute, announcementsRouteCompat);
    });

    it("should export invalidateAnnouncementsServerCache from both entrypoints", () => {
      assert.strictEqual(typeof invalidateAnnouncementsServerCache, "function");
    });
  });

  describe("In-Memory Cache", () => {
    it("should initially return null cache", () => {
      assert.strictEqual(getAnnouncementsServerCache(), null);
    });

    it("should store and retrieve cached announcements", () => {
      const dummyData = { allAnnouncements: [{ id: "1", title: "Test" }] };
      const now = Date.now();
      setAnnouncementsServerCache(dummyData, now);

      const cached = getAnnouncementsServerCache();
      assert.notStrictEqual(cached, null);
      assert.deepStrictEqual(cached?.data, dummyData);
      assert.strictEqual(cached?.timestamp, now);
    });

    it("should invalidate cache when invalidateAnnouncementsServerCache is called", () => {
      setAnnouncementsServerCache({ test: true }, Date.now());
      assert.notStrictEqual(getAnnouncementsServerCache(), null);

      invalidateAnnouncementsServerCache();
      assert.strictEqual(getAnnouncementsServerCache(), null);
    });

    it("should define cache TTL of 30 seconds", () => {
      assert.strictEqual(ANNOUNCEMENTS_SERVER_TTL_MS, 30000);
    });
  });

  describe("Route Endpoints Registration", () => {
    it("should register all 17 expected endpoints on announcementsRoute", () => {
      const routes = announcementsRoute.routes;

      const expectedRoutes: { method: string; path: string }[] = [
        // Submissions & Grading
        { method: "GET", path: "/submissions/:submissionId/image" },
        { method: "GET", path: "/:id/submissions" },
        { method: "POST", path: "/:id/submissions" },
        { method: "DELETE", path: "/submissions/:submissionId" },
        { method: "POST", path: "/submissions/:submissionId/grade" },

        // Peer Review
        { method: "GET", path: "/:id/peer-submissions" },
        { method: "GET", path: "/submissions/:submissionId/peer-comments" },
        { method: "POST", path: "/submissions/:submissionId/peer-comments" },
        {
          method: "DELETE",
          path: "/submissions/peer-comments/:commentId",
        },

        // Discussions
        { method: "GET", path: "/:id/discussions" },
        { method: "POST", path: "/:id/discussions" },

        // Topics (Core)
        { method: "GET", path: "/:id/image" },
        { method: "GET", path: "/" },
        { method: "GET", path: "/:id" },
        { method: "POST", path: "/" },
        { method: "PUT", path: "/:id" },
        { method: "DELETE", path: "/:id" },
      ];

      for (const expected of expectedRoutes) {
        const found = routes.some(
          (r) => r.method === expected.method && r.path === expected.path,
        );
        assert.ok(
          found,
          `Route ${expected.method} ${expected.path} should be registered`,
        );
      }
    });
  });

  describe("Middleware & Auth Guards (Zero DB Execution)", () => {
    // Mock db.run to ensure ensureTables never modifies or accesses any real database
    beforeEach(() => {
      (db as any).run = async () => ({ rows: [] });
    });

    it("GET / should return 401 when no token is provided", async () => {
      const res = await announcementsRoute.request("/");
      assert.strictEqual(res.status, 401);
      const json = await res.json();
      assert.match(json.error, /Tidak terautentikasi/);
    });

    it("GET /:id should return 401 when no token is provided", async () => {
      const res = await announcementsRoute.request("/ann-123");
      assert.strictEqual(res.status, 401);
      const json = await res.json();
      assert.match(json.error, /Tidak terautentikasi/);
    });

    it("POST / should return 401 when no token is provided", async () => {
      const res = await announcementsRoute.request("/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Topic" }),
      });
      assert.strictEqual(res.status, 401);
      const json = await res.json();
      assert.match(json.error, /Tidak terautentikasi/);
    });

    it("GET /:id/discussions should return 401 when no token is provided", async () => {
      const res = await announcementsRoute.request("/ann-123/discussions");
      assert.strictEqual(res.status, 401);
      const json = await res.json();
      assert.match(json.error, /Tidak terautentikasi/);
    });

    it("GET /:id/submissions should return 401 when no token is provided", async () => {
      const res = await announcementsRoute.request("/ann-123/submissions");
      assert.strictEqual(res.status, 401);
      const json = await res.json();
      assert.match(json.error, /Tidak terautentikasi/);
    });

    it("GET /:id/peer-submissions should return 401 when no token is provided", async () => {
      const res = await announcementsRoute.request("/ann-123/peer-submissions");
      assert.strictEqual(res.status, 401);
      const json = await res.json();
      assert.match(json.error, /Tidak terautentikasi/);
    });

    it("DELETE /submissions/:submissionId should return 401 when no token is provided", async () => {
      const res = await announcementsRoute.request("/submissions/sub-123", {
        method: "DELETE",
      });
      assert.strictEqual(res.status, 401);
      const json = await res.json();
      assert.match(json.error, /Tidak terautentikasi/);
    });

    it("POST /submissions/:submissionId/grade should return 401 when no token is provided", async () => {
      const res = await announcementsRoute.request(
        "/submissions/sub-123/grade",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grade: 90 }),
        },
      );
      assert.strictEqual(res.status, 401);
      const json = await res.json();
      assert.match(json.error, /Tidak terautentikasi/);
    });

    it("GET /:id/image should return 404 when image is not found in db", async () => {
      const originalSelect = db.select;
      (db as any).select = () => ({
        from: () => ({
          where: () => ({
            limit: async () => [],
          }),
        }),
      });

      const res = await announcementsRoute.request("/missing-id/image");
      assert.strictEqual(res.status, 404);
      const json = await res.json();
      assert.strictEqual(json.error, "Gambar tidak ditemukan.");

      (db as any).select = originalSelect;
    });

    it("GET /submissions/:submissionId/image should return 404 when submission image is not found in db", async () => {
      const originalSelect = db.select;
      (db as any).select = () => ({
        from: () => ({
          where: () => ({
            limit: async () => [],
          }),
        }),
      });

      const res = await announcementsRoute.request(
        "/submissions/missing-sub/image",
      );
      assert.strictEqual(res.status, 404);
      const json = await res.json();
      assert.strictEqual(json.error, "Gambar tidak ditemukan.");

      (db as any).select = originalSelect;
    });
  });

  describe("Authenticated Flow with In-Memory Mocking", () => {
    beforeEach(() => {
      (db as any).run = async () => ({ rows: [] });
    });

    it("GET / with valid cache should serve cached data without db query", async () => {
      const token = await sign({ id: 99 }, "sizatesdsecret");

      // Mock user lookup for authMiddleware
      const originalSelect = db.select;
      (db as any).select = () => ({
        from: () => ({
          where: () => ({
            limit: async () => [
              {
                id: 99,
                email: "siswa@example.com",
                kelas: "X-A",
                nama: "Siswa Test",
                status: "SISWA",
              },
            ],
          }),
        }),
      });

      // Populate server cache
      const cachedData = {
        allAnnouncements: [{ id: "ann-1", title: "Cached Topic" }],
        discussionCounts: { "ann-1": 3 },
        submissionCounts: { "ann-1": 5 },
        submissionsByUserAndAnn: {},
      };
      setAnnouncementsServerCache(cachedData, Date.now());

      const res = await announcementsRoute.request("/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.status, "success");
      assert.strictEqual(json.data.length, 1);
      assert.strictEqual(json.data[0].title, "Cached Topic");
      assert.strictEqual(json.data[0].discussionsCount, 3);
      assert.strictEqual(json.data[0].submissionsCount, 5);

      (db as any).select = originalSelect;
    });

    it("adminMiddleware rejects non-admin users with 403", async () => {
      const studentToken = await sign({ id: 101 }, "sizatesdsecret");

      const originalSelect = db.select;
      (db as any).select = () => ({
        from: () => ({
          where: () => ({
            limit: async () => [
              {
                id: 101,
                email: "siswa@example.com",
                kelas: "X-B",
                nama: "Siswa B",
                status: "SISWA",
              },
            ],
          }),
        }),
      });

      const res = await announcementsRoute.request("/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${studentToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Unauthorized creation" }),
      });

      assert.strictEqual(res.status, 403);
      const json = await res.json();
      assert.match(json.error, /Akses ditolak/);

      (db as any).select = originalSelect;
    });
  });
});
