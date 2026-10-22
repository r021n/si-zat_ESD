import { Hono } from "hono";
import { db } from "../../db/index.js";
import {
  announcements,
  announcementSubmissions,
  announcementDiscussions,
} from "../../db/schema.js";
import { eq, sql, and } from "drizzle-orm";
import {
  authMiddleware,
  adminMiddleware,
  ensureTables,
} from "./middleware.js";
import {
  ANNOUNCEMENTS_SERVER_TTL_MS,
  getAnnouncementsServerCache,
  setAnnouncementsServerCache,
  invalidateAnnouncementsServerCache,
} from "./cache.js";

const topicsRoute = new Hono();

// GET /api/announcements/:id/image - Stream announcement banner image
topicsRoute.get("/:id/image", async (c: any) => {
  await ensureTables();
  try {
    const id = c.req.param("id");
    const [ann] = await db
      .select({
        imageBlob: announcements.imageBlob,
        imageType: announcements.imageType,
      })
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);

    if (!ann || !ann.imageBlob) {
      return c.json({ error: "Gambar tidak ditemukan." }, 404);
    }

    const mimeType = ann.imageType || "image/jpeg";
    return new Response(ann.imageBlob as any, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: any) {
    console.error("Error streaming announcement image:", err);
    return c.json({ error: "Gagal memuat gambar." }, 500);
  }
});

// GET /api/announcements - List announcements
topicsRoute.get("/", authMiddleware, async (c: any) => {
  try {
    const user = c.get("user");
    const now = Date.now();

    const cached = getAnnouncementsServerCache();
    let cachedBase =
      cached && now - cached.timestamp < ANNOUNCEMENTS_SERVER_TTL_MS
        ? cached.data
        : null;

    if (!cachedBase) {
      const allAnnouncements = await db
        .select({
          id: announcements.id,
          title: announcements.title,
          problem: announcements.problem,
          question: announcements.question,
          taskInfo: announcements.taskInfo,
          instruction: announcements.instruction,
          authorId: announcements.authorId,
          authorName: announcements.authorName,
          hasImage: sql<boolean>`${announcements.imageBlob} IS NOT NULL`,
          createdAt: announcements.createdAt,
          updatedAt: announcements.updatedAt,
        })
        .from(announcements);

      // Sort newest first
      allAnnouncements.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      // Efficiently count discussions and submissions
      const allDiscussions = await db
        .select({
          announcementId: announcementDiscussions.announcementId,
        })
        .from(announcementDiscussions);

      const allSubmissionsMeta = await db
        .select({
          id: announcementSubmissions.id,
          announcementId: announcementSubmissions.announcementId,
          userId: announcementSubmissions.userId,
          submittedAt: announcementSubmissions.submittedAt,
          grade: announcementSubmissions.grade,
          feedback: announcementSubmissions.feedback,
        })
        .from(announcementSubmissions);

      const discussionCounts: Record<string, number> = {};
      for (const d of allDiscussions) {
        discussionCounts[d.announcementId] =
          (discussionCounts[d.announcementId] || 0) + 1;
      }

      const submissionCounts: Record<string, number> = {};
      const submissionsByUserAndAnn: Record<string, any> = {};
      for (const s of allSubmissionsMeta) {
        submissionCounts[s.announcementId] =
          (submissionCounts[s.announcementId] || 0) + 1;
        submissionsByUserAndAnn[`${s.announcementId}_${s.userId}`] = {
          id: s.id,
          submittedAt: s.submittedAt,
          grade: s.grade,
          feedback: s.feedback,
        };
      }

      cachedBase = {
        allAnnouncements,
        discussionCounts,
        submissionCounts,
        submissionsByUserAndAnn,
      };

      setAnnouncementsServerCache(cachedBase, now);
    }

    const {
      allAnnouncements,
      discussionCounts,
      submissionCounts,
      submissionsByUserAndAnn,
    } = cachedBase;

    const result = allAnnouncements.map((item: any) => ({
      ...item,
      discussionsCount: discussionCounts[item.id] || 0,
      submissionsCount: submissionCounts[item.id] || 0,
      mySubmission: submissionsByUserAndAnn[`${item.id}_${user.id}`] || null,
    }));

    const pageParam = c.req.query("page");
    const limitParam = c.req.query("limit");

    if (pageParam !== undefined || limitParam !== undefined) {
      const page = Math.max(1, parseInt(pageParam || "1") || 1);
      const limit = Math.max(1, Math.min(100, parseInt(limitParam || "10") || 10));
      const totalItems = result.length;
      const totalPages = Math.ceil(totalItems / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginatedData = result.slice(startIndex, startIndex + limit);

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

    return c.json({ status: "success", data: result });
  } catch (err: any) {
    console.error("Error fetching announcements:", err);
    return c.json(
      { error: err.message || "Gagal mengambil daftar diskusi." },
      500,
    );
  }
});

// GET /api/announcements/:id - Single announcement detail
topicsRoute.get("/:id", authMiddleware, async (c: any) => {
  try {
    const id = c.req.param("id");
    const user = c.get("user");

    const [announcement] = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        problem: announcements.problem,
        question: announcements.question,
        taskInfo: announcements.taskInfo,
        instruction: announcements.instruction,
        authorId: announcements.authorId,
        authorName: announcements.authorName,
        hasImage: sql<boolean>`${announcements.imageBlob} IS NOT NULL`,
        createdAt: announcements.createdAt,
        updatedAt: announcements.updatedAt,
      })
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);
    if (!announcement) {
      return c.json({ error: "Diskusi tidak ditemukan." }, 404);
    }

    // Get user's submission if any
    const [mySub] = await db
      .select({
        id: announcementSubmissions.id,
        userId: announcementSubmissions.userId,
        studentName: announcementSubmissions.studentName,
        studentClass: announcementSubmissions.studentClass,
        answer: announcementSubmissions.answer,
        fileName: announcementSubmissions.fileName,
        submittedAt: announcementSubmissions.submittedAt,
        grade: announcementSubmissions.grade,
        feedback: announcementSubmissions.feedback,
        gradedAt: announcementSubmissions.gradedAt,
        gradedBy: announcementSubmissions.gradedBy,
        hasImage: sql<boolean>`${announcementSubmissions.imageBlob} IS NOT NULL`,
      })
      .from(announcementSubmissions)
      .where(
        and(
          eq(announcementSubmissions.announcementId, id),
          eq(announcementSubmissions.userId, user.id),
        ),
      )
      .limit(1);

    return c.json({
      status: "success",
      data: {
        ...announcement,
        mySubmission: mySub || null,
      },
    });
  } catch (err: any) {
    console.error("Error fetching announcement detail:", err);
    return c.json(
      { error: err.message || "Gagal mengambil detail diskusi." },
      500,
    );
  }
});

// POST /api/announcements - Admin creates new announcement (supports optional image)
topicsRoute.post("/", adminMiddleware, async (c: any) => {
  try {
    const user = c.get("user");
    const contentType = c.req.header("content-type") || "";

    let title = "";
    let problem = "";
    let question = "";
    let taskInfo = "";
    let instruction = "";
    let imageBuffer: Buffer | null = null;
    let imageType: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const body = await c.req.parseBody();
      title = (body["title"] as string) || "";
      problem = (body["problem"] as string) || "";
      question = (body["question"] as string) || "";
      taskInfo = (body["taskInfo"] as string) || "";
      instruction = (body["instruction"] as string) || "";
      const file = body["file"] as any;
      if (
        file &&
        typeof file === "object" &&
        typeof file.arrayBuffer === "function" &&
        file.size > 0
      ) {
        const arrayBuffer = await file.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        imageType = file.type || "image/jpeg";
      }
    } else {
      const body = await c.req.json();
      title = body.title || "";
      problem = body.problem || "";
      question = body.question || "";
      taskInfo = body.taskInfo || "";
      instruction = body.instruction || "";
    }

    if (!title || !title.trim()) {
      return c.json({ error: "Judul diskusi harus diisi." }, 400);
    }

    const id = `ann-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const authorName = user.nama || user.email.split("@")[0] || "Guru";

    await db.insert(announcements).values({
      id,
      title: title.trim(),
      problem: problem ? problem.trim() : "",
      question: question ? question.trim() : "",
      taskInfo: taskInfo ? taskInfo.trim() : "",
      instruction: instruction ? instruction.trim() : "",
      authorId: user.id,
      authorName,
      imageBlob: imageBuffer,
      imageType,
      createdAt: now,
    });

    invalidateAnnouncementsServerCache();
    return c.json({
      status: "success",
      message: "Diskusi berhasil dibuat.",
      data: {
        id,
        title,
        problem,
        question,
        taskInfo,
        instruction,
        authorName,
        hasImage: !!imageBuffer,
        createdAt: now,
      },
    });
  } catch (err: any) {
    console.error("Error creating announcement:", err);
    return c.json({ error: err.message || "Gagal membuat diskusi." }, 500);
  }
});

// PUT /api/announcements/:id - Admin updates announcement (supports optional image update/delete)
topicsRoute.put("/:id", adminMiddleware, async (c: any) => {
  try {
    const id = c.req.param("id");
    const contentType = c.req.header("content-type") || "";

    let title: string | undefined;
    let problem: string | undefined;
    let question: string | undefined;
    let taskInfo: string | undefined;
    let instruction: string | undefined;
    let imageBuffer: Buffer | null = null;
    let imageType: string | null = null;
    let removeImage = false;

    if (contentType.includes("multipart/form-data")) {
      const body = await c.req.parseBody();
      title = body["title"] as string;
      problem = body["problem"] as string;
      question = body["question"] as string;
      taskInfo = body["taskInfo"] as string;
      instruction = body["instruction"] as string;
      removeImage =
        body["removeImage"] === "true" || body["removeImage"] === true;
      const file = body["file"] as any;
      if (
        file &&
        typeof file === "object" &&
        typeof file.arrayBuffer === "function" &&
        file.size > 0
      ) {
        const arrayBuffer = await file.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        imageType = file.type || "image/jpeg";
      }
    } else {
      const body = await c.req.json();
      title = body.title;
      problem = body.problem;
      question = body.question;
      taskInfo = body.taskInfo;
      instruction = body.instruction;
      removeImage = !!body.removeImage;
    }

    if (title !== undefined && (!title || !title.trim())) {
      return c.json({ error: "Judul diskusi harus diisi." }, 400);
    }

    const [existing] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);
    if (!existing) {
      return c.json({ error: "Diskusi tidak ditemukan." }, 404);
    }

    const now = new Date().toISOString();

    const updatePayload: any = {
      title: title !== undefined ? title.trim() : existing.title,
      problem: problem !== undefined ? problem.trim() : existing.problem,
      question: question !== undefined ? question.trim() : existing.question,
      taskInfo: taskInfo !== undefined ? taskInfo.trim() : existing.taskInfo,
      instruction:
        instruction !== undefined ? instruction.trim() : existing.instruction,
      updatedAt: now,
    };

    if (imageBuffer) {
      updatePayload.imageBlob = imageBuffer;
      updatePayload.imageType = imageType;
    } else if (removeImage) {
      updatePayload.imageBlob = null;
      updatePayload.imageType = null;
    }

    await db
      .update(announcements)
      .set(updatePayload)
      .where(eq(announcements.id, id));

    invalidateAnnouncementsServerCache();
    return c.json({
      status: "success",
      message: "Diskusi berhasil diperbarui.",
    });
  } catch (err: any) {
    console.error("Error updating announcement:", err);
    return c.json({ error: err.message || "Gagal memperbarui diskusi." }, 500);
  }
});

// DELETE /api/announcements/:id - Admin deletes announcement
topicsRoute.delete("/:id", adminMiddleware, async (c: any) => {
  try {
    const id = c.req.param("id");

    const [existing] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);
    if (!existing) {
      return c.json({ error: "Diskusi tidak ditemukan." }, 404);
    }

    await db
      .delete(announcementDiscussions)
      .where(eq(announcementDiscussions.announcementId, id));
    await db
      .delete(announcementSubmissions)
      .where(eq(announcementSubmissions.announcementId, id));
    await db.delete(announcements).where(eq(announcements.id, id));

    invalidateAnnouncementsServerCache();
    return c.json({
      status: "success",
      message: "Diskusi berhasil dihapus.",
    });
  } catch (err: any) {
    console.error("Error deleting announcement:", err);
    return c.json({ error: err.message || "Gagal menghapus diskusi." }, 500);
  }
});

export default topicsRoute;
