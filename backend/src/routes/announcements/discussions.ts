import { Hono } from "hono";
import { db } from "../../db/index.js";
import {
  users,
  announcements,
  announcementDiscussions,
} from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { authMiddleware } from "./middleware.js";
import { invalidateAnnouncementsServerCache } from "./cache.js";

const discussionsRoute = new Hono();

// GET /api/announcements/:id/discussions - Fetch all discussions for this announcement
discussionsRoute.get("/:id/discussions", authMiddleware, async (c: any) => {
  try {
    const id = c.req.param("id");
    const comments = await db
      .select({
        id: announcementDiscussions.id,
        announcementId: announcementDiscussions.announcementId,
        userId: announcementDiscussions.userId,
        senderName: announcementDiscussions.senderName,
        senderRole: announcementDiscussions.senderRole,
        content: announcementDiscussions.content,
        createdAt: announcementDiscussions.createdAt,
        studentClass: users.kelas,
      })
      .from(announcementDiscussions)
      .leftJoin(users, eq(announcementDiscussions.userId, users.id))
      .where(eq(announcementDiscussions.announcementId, id));

    // Sort chronologically (oldest first for chat timeline)
    comments.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    const pageParam = c.req.query("page");
    const limitParam = c.req.query("limit");

    if (pageParam !== undefined || limitParam !== undefined) {
      const page = Math.max(1, parseInt(pageParam || "1") || 1);
      const limit = Math.max(1, Math.min(100, parseInt(limitParam || "20") || 20));
      const totalItems = comments.length;
      const totalPages = Math.ceil(totalItems / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginatedData = comments.slice(startIndex, startIndex + limit);

      return c.json({
        status: "success",
        data: paginatedData,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    }

    return c.json({ status: "success", data: comments });
  } catch (err: any) {
    console.error("Error fetching discussions:", err);
    return c.json({ error: err.message || "Gagal memuat diskusi." }, 500);
  }
});

// POST /api/announcements/:id/discussions - Post discussion message
discussionsRoute.post("/:id/discussions", authMiddleware, async (c: any) => {
  try {
    const announcementId = c.req.param("id");
    const user = c.get("user");
    const { content } = await c.req.json();

    if (!content || !content.trim()) {
      return c.json({ error: "Pesan tidak boleh kosong." }, 400);
    }

    const [announcement] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, announcementId))
      .limit(1);
    if (!announcement) {
      return c.json({ error: "Diskusi tidak ditemukan." }, 404);
    }

    const commentId = `disc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    const senderRole =
      (user.status || "").toLowerCase() === "admin" ||
      user.email.toLowerCase().includes("admin")
        ? "ADMIN"
        : "SISWA";
    const senderName = user.nama || user.email.split("@")[0];

    await db.insert(announcementDiscussions).values({
      id: commentId,
      announcementId,
      userId: user.id,
      senderName,
      senderRole,
      content: content.trim(),
      createdAt: now,
    });

    invalidateAnnouncementsServerCache();
    return c.json({
      status: "success",
      message: "Pesan berhasil dikirim.",
      data: {
        id: commentId,
        announcementId,
        userId: user.id,
        senderName,
        senderRole,
        content: content.trim(),
        createdAt: now,
        studentClass: user.kelas || "",
      },
    });
  } catch (err: any) {
    console.error("Error posting discussion message:", err);
    return c.json({ error: err.message || "Gagal mengirim pesan." }, 500);
  }
});

export default discussionsRoute;
