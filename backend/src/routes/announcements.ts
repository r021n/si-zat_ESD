import { Hono } from "hono";
import { verify } from "hono/jwt";
import { db } from "../db/index.js";
import {
  users,
  announcements,
  announcementSubmissions,
  announcementDiscussions,
  announcementSubmissionComments,
} from "../db/schema.js";
import { eq, sql, and } from "drizzle-orm";

const announcementsRoute = new Hono();

const getJwtSecret = () => process.env.JWT_SECRET || "sizatesdsecret";

// In-memory server cache for announcements list to reduce Turso roundtrips
let announcementsServerCache: {
  data: any;
  timestamp: number;
} | null = null;

const ANNOUNCEMENTS_SERVER_TTL_MS = 30 * 1000;

export function invalidateAnnouncementsServerCache() {
  announcementsServerCache = null;
}

// Safe auto-creation of tables if they don't exist yet
let tablesInitialized = false;
async function ensureTables() {
  if (tablesInitialized) return;
  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        problem TEXT NOT NULL DEFAULT '',
        question TEXT NOT NULL DEFAULT '',
        task_info TEXT NOT NULL DEFAULT '',
        instruction TEXT NOT NULL DEFAULT '',
        author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        author_name TEXT NOT NULL DEFAULT 'Guru',
        image_blob BLOB,
        image_type TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT
      )
    `);
    try {
      await db.run(sql`ALTER TABLE announcements ADD COLUMN image_blob BLOB`);
    } catch {}
    try {
      await db.run(sql`ALTER TABLE announcements ADD COLUMN image_type TEXT`);
    } catch {}
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS announcement_submissions (
        id TEXT PRIMARY KEY,
        announcement_id TEXT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        student_name TEXT NOT NULL,
        student_class TEXT NOT NULL,
        answer TEXT NOT NULL,
        file_name TEXT DEFAULT '',
        image_blob BLOB,
        image_type TEXT,
        submitted_at TEXT NOT NULL,
        grade INTEGER,
        feedback TEXT,
        graded_at TEXT,
        graded_by TEXT
      )
    `);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS announcement_discussions (
        id TEXT PRIMARY KEY,
        announcement_id TEXT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender_name TEXT NOT NULL,
        sender_role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS announcement_submission_comments (
        id TEXT PRIMARY KEY,
        submission_id TEXT NOT NULL REFERENCES announcement_submissions(id) ON DELETE CASCADE,
        announcement_id TEXT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_name TEXT NOT NULL,
        user_role TEXT NOT NULL DEFAULT 'SISWA',
        user_class TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
    tablesInitialized = true;
  } catch (err) {
    console.error("Error ensuring announcement tables:", err);
  }
}

// Middleware: Authenticate user
async function authMiddleware(c: any, next: any) {
  await ensureTables();
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { error: "Tidak terautentikasi. Token tidak ditemukan." },
      401,
    );
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = await verify(token, getJwtSecret(), "HS256");
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        kelas: users.kelas,
        nama: users.nama,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, payload.id as number))
      .limit(1);

    if (!user) {
      return c.json({ error: "Pengguna tidak ditemukan." }, 401);
    }

    c.set("user", user);
    await next();
  } catch {
    return c.json({ error: "Sesi kedaluwarsa atau token tidak valid." }, 401);
  }
}

// Middleware: Ensure user is Admin
async function adminMiddleware(c: any, next: any) {
  await ensureTables();
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { error: "Tidak terautentikasi. Token tidak ditemukan." },
      401,
    );
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = await verify(token, getJwtSecret(), "HS256");
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        kelas: users.kelas,
        nama: users.nama,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, payload.id as number))
      .limit(1);

    if (!user) {
      return c.json({ error: "Pengguna tidak ditemukan." }, 401);
    }

    const isAdmin =
      (user.status || "").toLowerCase() === "admin" ||
      user.email.toLowerCase().includes("admin");
    if (!isAdmin) {
      return c.json(
        { error: "Akses ditolak. Fitur ini hanya untuk Administrator/Guru." },
        403,
      );
    }

    c.set("user", user);
    await next();
  } catch {
    return c.json({ error: "Sesi kedaluwarsa atau token tidak valid." }, 401);
  }
}

// GET /api/announcements/:id/image - Stream announcement banner image
announcementsRoute.get("/:id/image", async (c: any) => {
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

// GET /api/announcements/submissions/:submissionId/image - Stream binary blob
announcementsRoute.get("/submissions/:submissionId/image", async (c: any) => {
  await ensureTables();
  try {
    const submissionId = c.req.param("submissionId");
    const [sub] = await db
      .select({
        imageBlob: announcementSubmissions.imageBlob,
        imageType: announcementSubmissions.imageType,
      })
      .from(announcementSubmissions)
      .where(eq(announcementSubmissions.id, submissionId))
      .limit(1);

    if (!sub || !sub.imageBlob) {
      return c.json({ error: "Gambar tidak ditemukan." }, 404);
    }

    const mimeType = sub.imageType || "image/jpeg";
    return new Response(sub.imageBlob as any, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (err: any) {
    console.error("Error streaming submission image:", err);
    return c.json({ error: "Gagal memuat gambar." }, 500);
  }
});

// GET /api/announcements - List announcements
announcementsRoute.get("/", authMiddleware, async (c: any) => {
  try {
    const user = c.get("user");
    const now = Date.now();

    let cachedBase = announcementsServerCache && (now - announcementsServerCache.timestamp < ANNOUNCEMENTS_SERVER_TTL_MS)
      ? announcementsServerCache.data
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

      announcementsServerCache = { data: cachedBase, timestamp: now };
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
announcementsRoute.get("/:id", authMiddleware, async (c: any) => {
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
announcementsRoute.post("/", adminMiddleware, async (c: any) => {
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
announcementsRoute.put("/:id", adminMiddleware, async (c: any) => {
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
announcementsRoute.delete("/:id", adminMiddleware, async (c: any) => {
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

// GET /api/announcements/:id/discussions - Fetch all discussions for this announcement
announcementsRoute.get("/:id/discussions", authMiddleware, async (c: any) => {
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
announcementsRoute.post("/:id/discussions", authMiddleware, async (c: any) => {
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

// GET /api/announcements/:id/submissions - Get submissions for an announcement
announcementsRoute.get("/:id/submissions", authMiddleware, async (c: any) => {
  try {
    const announcementId = c.req.param("id");
    const user = c.get("user");
    const isAdmin =
      (user.status || "").toLowerCase() === "admin" ||
      user.email.toLowerCase().includes("admin");

    let subsQuery;
    if (isAdmin) {
      subsQuery = db
        .select({
          id: announcementSubmissions.id,
          announcementId: announcementSubmissions.announcementId,
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
        .where(eq(announcementSubmissions.announcementId, announcementId));
    } else {
      subsQuery = db
        .select({
          id: announcementSubmissions.id,
          announcementId: announcementSubmissions.announcementId,
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
            eq(announcementSubmissions.announcementId, announcementId),
            eq(announcementSubmissions.userId, user.id),
          ),
        );
    }

    let subs = await subsQuery;
    subs.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

    // Fetch peer reviews / commented users for submissions in this announcement
    const commentedMap = new Map<number, { userId: number; studentName: string; studentClass: string }[]>();
    try {
      const peerComments = await db
        .select({
          commenterUserId: announcementSubmissionComments.userId,
          targetUserId: announcementSubmissions.userId,
          targetStudentName: announcementSubmissions.studentName,
          targetStudentClass: announcementSubmissions.studentClass,
        })
        .from(announcementSubmissionComments)
        .innerJoin(
          announcementSubmissions,
          eq(announcementSubmissionComments.submissionId, announcementSubmissions.id),
        )
        .where(eq(announcementSubmissionComments.announcementId, announcementId));

      const tempMap = new Map<number, Map<number, { userId: number; studentName: string; studentClass: string }>>();
      for (const row of peerComments) {
        if (!tempMap.has(row.commenterUserId)) {
          tempMap.set(row.commenterUserId, new Map());
        }
        const userMap = tempMap.get(row.commenterUserId)!;
        if (!userMap.has(row.targetUserId)) {
          userMap.set(row.targetUserId, {
            userId: row.targetUserId,
            studentName: row.targetStudentName,
            studentClass: row.targetStudentClass,
          });
        }
      }

      for (const [cUserId, uMap] of tempMap.entries()) {
        commentedMap.set(cUserId, Array.from(uMap.values()));
      }
    } catch (commentErr) {
      console.error("Error fetching commented users:", commentErr);
    }

    subs = subs.map((s) => ({
      ...s,
      commentedUsers: commentedMap.get(s.userId) || [],
    }));

    const pageParam = c.req.query("page");
    const limitParam = c.req.query("limit");
    const searchParam = c.req.query("search");
    const statusParam = c.req.query("status"); // "graded" | "ungraded"

    if (searchParam) {
      const q = searchParam.toLowerCase();
      subs = subs.filter(
        (s) =>
          s.studentName.toLowerCase().includes(q) ||
          s.studentClass.toLowerCase().includes(q) ||
          s.answer.toLowerCase().includes(q),
      );
    }

    if (statusParam === "graded") {
      subs = subs.filter((s) => s.grade !== null && s.grade !== undefined);
    } else if (statusParam === "ungraded") {
      subs = subs.filter((s) => s.grade === null || s.grade === undefined);
    }

    if (pageParam !== undefined || limitParam !== undefined) {
      const page = Math.max(1, parseInt(pageParam || "1") || 1);
      const limit = Math.max(1, Math.min(100, parseInt(limitParam || "10") || 10));
      const totalItems = subs.length;
      const totalPages = Math.ceil(totalItems / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginatedData = subs.slice(startIndex, startIndex + limit);

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

    return c.json({ status: "success", data: subs });
  } catch (err: any) {
    console.error("Error fetching submissions:", err);
    return c.json(
      { error: err.message || "Gagal mengambil pengumpulan tugas." },
      500,
    );
  }
});

// POST /api/announcements/:id/submissions - Submit task
announcementsRoute.post("/:id/submissions", authMiddleware, async (c: any) => {
  try {
    const announcementId = c.req.param("id");
    const user = c.get("user");

    const [announcement] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, announcementId))
      .limit(1);
    if (!announcement) {
      return c.json({ error: "Diskusi tidak ditemukan." }, 404);
    }

    const body = await c.req.parseBody();
    const answer = body["answer"] as string;
    const fileName = body["fileName"] as string;
    const file = body["file"] as File | undefined;

    if (!answer || !answer.trim()) {
      return c.json({ error: "Jawaban tugas tidak boleh kosong." }, 400);
    }

    let imageBuffer: Buffer | null = null;
    let imageType: string | null = null;

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      imageType = file.type;
    }

    const now = new Date().toISOString();
    const studentName = user.nama || user.email.split("@")[0];
    const studentClass = user.kelas || "Siswa";

    // Check if existing submission exists for this student on this announcement
    const [existing] = await db
      .select()
      .from(announcementSubmissions)
      .where(
        and(
          eq(announcementSubmissions.announcementId, announcementId),
          eq(announcementSubmissions.userId, user.id),
        ),
      )
      .limit(1);

    let submissionId: string;

    if (existing) {
      submissionId = existing.id;
      await db
        .update(announcementSubmissions)
        .set({
          studentName,
          studentClass,
          answer: answer.trim(),
          fileName: fileName || existing.fileName,
          ...(imageBuffer ? { imageBlob: imageBuffer, imageType } : {}),
          submittedAt: now,
        })
        .where(eq(announcementSubmissions.id, existing.id));
    } else {
      submissionId = `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await db.insert(announcementSubmissions).values({
        id: submissionId,
        announcementId,
        userId: user.id,
        studentName,
        studentClass,
        answer: answer.trim(),
        fileName: fileName || "",
        imageBlob: imageBuffer,
        imageType,
        submittedAt: now,
      });
    }

    invalidateAnnouncementsServerCache();
    return c.json({
      status: "success",
      message: "Tugas berhasil dikumpulkan.",
      data: {
        id: submissionId,
        announcementId,
        userId: user.id,
        studentName,
        studentClass,
        answer: answer.trim(),
        fileName: fileName || "",
        submittedAt: now,
        hasImage:
          !!imageBuffer ||
          (existing && !imageBuffer ? !!existing.imageBlob : false),
      },
    });
  } catch (err: any) {
    console.error("Error submitting announcement task:", err);
    return c.json({ error: err.message || "Gagal mengumpulkan tugas." }, 500);
  }
});

// DELETE /api/announcements/submissions/:submissionId - Delete a submission
announcementsRoute.delete(
  "/submissions/:submissionId",
  authMiddleware,
  async (c: any) => {
    try {
      const submissionId = c.req.param("submissionId");
      const user = c.get("user");
      const isAdmin =
        (user.status || "").toLowerCase() === "admin" ||
        user.email.toLowerCase().includes("admin");

      const [submission] = await db
        .select()
        .from(announcementSubmissions)
        .where(eq(announcementSubmissions.id, submissionId))
        .limit(1);
      if (!submission) {
        return c.json({ error: "Pengumpulan tugas tidak ditemukan." }, 404);
      }

      if (submission.userId !== user.id && !isAdmin) {
        return c.json({ error: "Akses ditolak." }, 403);
      }

      await db
        .delete(announcementSubmissions)
        .where(eq(announcementSubmissions.id, submissionId));
      invalidateAnnouncementsServerCache();
      return c.json({ status: "success", message: "Tugas berhasil dihapus." });
    } catch (err: any) {
      console.error("Error deleting submission:", err);
      return c.json({ error: err.message || "Gagal menghapus tugas." }, 500);
    }
  },
);

// POST /api/announcements/submissions/:submissionId/grade - Admin grades a student's submission
announcementsRoute.post(
  "/submissions/:submissionId/grade",
  adminMiddleware,
  async (c: any) => {
    try {
      const submissionId = c.req.param("submissionId");
      const adminUser = c.get("user");
      const { grade, feedback } = await c.req.json();

      if (grade === undefined || grade === null || isNaN(Number(grade))) {
        return c.json({ error: "Nilai harus berupa angka yang valid." }, 400);
      }

      const numGrade = Math.min(100, Math.max(0, Number(grade)));

      const [submission] = await db
        .select()
        .from(announcementSubmissions)
        .where(eq(announcementSubmissions.id, submissionId))
        .limit(1);
      if (!submission) {
        return c.json({ error: "Pengumpulan tugas tidak ditemukan." }, 404);
      }

      const now = new Date().toISOString();
      const gradedBy =
        adminUser.nama || adminUser.email.split("@")[0] || "Guru";

      await db
        .update(announcementSubmissions)
        .set({
          grade: numGrade,
          feedback:
            feedback !== undefined ? feedback.trim() : submission.feedback,
          gradedAt: now,
          gradedBy,
        })
        .where(eq(announcementSubmissions.id, submissionId));

      invalidateAnnouncementsServerCache();
      return c.json({
        status: "success",
        message: "Nilai dan catatan berhasil disimpan.",
        data: {
          id: submissionId,
          grade: numGrade,
          feedback: feedback || "",
          gradedAt: now,
          gradedBy,
        },
      });
    } catch (err: any) {
      console.error("Error grading submission:", err);
      return c.json(
        { error: err.message || "Gagal menyimpan nilai tugas." },
        500,
      );
    }
  },
);

// GET /api/announcements/:id/peer-submissions - Get peer submissions with review progress
announcementsRoute.get("/:id/peer-submissions", authMiddleware, async (c: any) => {
  try {
    const announcementId = c.req.param("id");
    const user = c.get("user");
    const isAdmin =
      (user.status || "").toLowerCase() === "admin" ||
      user.email.toLowerCase().includes("admin");

    // Check if the current user has submitted their own task
    const [mySub] = await db
      .select({ id: announcementSubmissions.id })
      .from(announcementSubmissions)
      .where(
        and(
          eq(announcementSubmissions.announcementId, announcementId),
          eq(announcementSubmissions.userId, user.id),
        ),
      )
      .limit(1);

    const hasSubmittedOwn = !!mySub;

    // If the student hasn't submitted their own task yet, prevent viewing peers
    if (!hasSubmittedOwn && !isAdmin) {
      return c.json({
        status: "success",
        data: {
          hasSubmittedOwn: false,
          canView: false,
          myReviewedCount: 0,
          targetReviewedCount: 2,
          isRequirementMet: false,
          submissions: [],
        },
      });
    }

    // Fetch peer submissions (exclude user's own task)
    const peerSubs = await db
      .select({
        id: announcementSubmissions.id,
        announcementId: announcementSubmissions.announcementId,
        userId: announcementSubmissions.userId,
        studentName: announcementSubmissions.studentName,
        studentClass: announcementSubmissions.studentClass,
        answer: announcementSubmissions.answer,
        fileName: announcementSubmissions.fileName,
        submittedAt: announcementSubmissions.submittedAt,
        hasImage: sql<boolean>`${announcementSubmissions.imageBlob} IS NOT NULL`,
      })
      .from(announcementSubmissions)
      .where(
        and(
          eq(announcementSubmissions.announcementId, announcementId),
          sql`${announcementSubmissions.userId} != ${user.id}`,
        ),
      );

    // Fetch all comments in this announcement to calculate comments count and whether user reviewed
    const allComments = await db
      .select({
        id: announcementSubmissionComments.id,
        submissionId: announcementSubmissionComments.submissionId,
        userId: announcementSubmissionComments.userId,
      })
      .from(announcementSubmissionComments)
      .where(eq(announcementSubmissionComments.announcementId, announcementId));

    const commentsPerSub: Record<string, number> = {};
    const myReviewedSubs = new Set<string>();

    for (const comm of allComments) {
      commentsPerSub[comm.submissionId] =
        (commentsPerSub[comm.submissionId] || 0) + 1;
      if (comm.userId === user.id) {
        myReviewedSubs.add(comm.submissionId);
      }
    }

    const submissionsWithMeta = peerSubs.map((sub) => ({
      ...sub,
      commentsCount: commentsPerSub[sub.id] || 0,
      hasReviewed: myReviewedSubs.has(sub.id),
    }));

    // Sort: unreviewed first, then newest
    submissionsWithMeta.sort((a, b) => {
      if (a.hasReviewed !== b.hasReviewed) {
        return a.hasReviewed ? 1 : -1;
      }
      return b.submittedAt.localeCompare(a.submittedAt);
    });

    const myReviewedCount = myReviewedSubs.size;

    return c.json({
      status: "success",
      data: {
        hasSubmittedOwn: true,
        canView: true,
        myReviewedCount,
        targetReviewedCount: 2,
        isRequirementMet: myReviewedCount >= 2,
        submissions: submissionsWithMeta,
      },
    });
  } catch (err: any) {
    console.error("Error fetching peer submissions:", err);
    return c.json(
      { error: err.message || "Gagal mengambil tugas teman." },
      500,
    );
  }
});

// GET /api/announcements/submissions/:submissionId/peer-comments - Get comments for a submission
announcementsRoute.get(
  "/submissions/:submissionId/peer-comments",
  authMiddleware,
  async (c: any) => {
    try {
      const submissionId = c.req.param("submissionId");

      const comments = await db
        .select({
          id: announcementSubmissionComments.id,
          submissionId: announcementSubmissionComments.submissionId,
          announcementId: announcementSubmissionComments.announcementId,
          userId: announcementSubmissionComments.userId,
          userName: announcementSubmissionComments.userName,
          userRole: announcementSubmissionComments.userRole,
          userClass: announcementSubmissionComments.userClass,
          content: announcementSubmissionComments.content,
          createdAt: announcementSubmissionComments.createdAt,
        })
        .from(announcementSubmissionComments)
        .where(eq(announcementSubmissionComments.submissionId, submissionId));

      comments.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

      return c.json({ status: "success", data: comments });
    } catch (err: any) {
      console.error("Error fetching peer comments:", err);
      return c.json(
        { error: err.message || "Gagal mengambil komentar teman." },
        500,
      );
    }
  },
);

// POST /api/announcements/submissions/:submissionId/peer-comments - Add comment to a submission
announcementsRoute.post(
  "/submissions/:submissionId/peer-comments",
  authMiddleware,
  async (c: any) => {
    try {
      const submissionId = c.req.param("submissionId");
      const user = c.get("user");
      const { content } = await c.req.json();

      if (!content || !content.trim()) {
        return c.json({ error: "Komentar tidak boleh kosong." }, 400);
      }

      const [submission] = await db
        .select()
        .from(announcementSubmissions)
        .where(eq(announcementSubmissions.id, submissionId))
        .limit(1);

      if (!submission) {
        return c.json({ error: "Tugas tidak ditemukan." }, 404);
      }

      // Rule: cannot review own submission
      if (submission.userId === user.id) {
        return c.json(
          { error: "Anda tidak dapat mengomentari tugas Anda sendiri." },
          400,
        );
      }

      // Rule: must have submitted own task first (unless admin)
      const isAdmin =
        (user.status || "").toLowerCase() === "admin" ||
        user.email.toLowerCase().includes("admin");

      if (!isAdmin) {
        const [mySub] = await db
          .select({ id: announcementSubmissions.id })
          .from(announcementSubmissions)
          .where(
            and(
              eq(
                announcementSubmissions.announcementId,
                submission.announcementId,
              ),
              eq(announcementSubmissions.userId, user.id),
            ),
          )
          .limit(1);

        if (!mySub) {
          return c.json(
            {
              error:
                "Kumpulkan tugas Anda terlebih dahulu sebelum mengomentari tugas teman.",
            },
            403,
          );
        }
      }

      const commentId = `pcomm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const now = new Date().toISOString();
      const userRole = isAdmin ? "ADMIN" : "SISWA";
      const userName = user.nama || user.email.split("@")[0];
      const userClass = user.kelas || "";

      await db.insert(announcementSubmissionComments).values({
        id: commentId,
        submissionId,
        announcementId: submission.announcementId,
        userId: user.id,
        userName,
        userRole,
        userClass,
        content: content.trim(),
        createdAt: now,
      });

      // Recalculate unique reviewed count for current user
      const myReviews = await db
        .select({
          submissionId: announcementSubmissionComments.submissionId,
        })
        .from(announcementSubmissionComments)
        .where(
          and(
            eq(
              announcementSubmissionComments.announcementId,
              submission.announcementId,
            ),
            eq(announcementSubmissionComments.userId, user.id),
          ),
        );

      const uniqueSet = new Set(myReviews.map((r) => r.submissionId));
      const myReviewedCount = uniqueSet.size;

      return c.json({
        status: "success",
        message: "Komentar berhasil dikirim.",
        data: {
          comment: {
            id: commentId,
            submissionId,
            announcementId: submission.announcementId,
            userId: user.id,
            userName,
            userRole,
            userClass,
            content: content.trim(),
            createdAt: now,
          },
          myReviewedCount,
          isRequirementMet: myReviewedCount >= 2,
        },
      });
    } catch (err: any) {
      console.error("Error creating peer comment:", err);
      return c.json(
        { error: err.message || "Gagal mengirimkan komentar." },
        500,
      );
    }
  },
);

// DELETE /api/announcements/submissions/peer-comments/:commentId - Delete peer comment
announcementsRoute.delete(
  "/submissions/peer-comments/:commentId",
  authMiddleware,
  async (c: any) => {
    try {
      const commentId = c.req.param("commentId");
      const user = c.get("user");
      const isAdmin =
        (user.status || "").toLowerCase() === "admin" ||
        user.email.toLowerCase().includes("admin");

      const [comm] = await db
        .select()
        .from(announcementSubmissionComments)
        .where(eq(announcementSubmissionComments.id, commentId))
        .limit(1);

      if (!comm) {
        return c.json({ error: "Komentar tidak ditemukan." }, 404);
      }

      if (comm.userId !== user.id && !isAdmin) {
        return c.json({ error: "Akses ditolak." }, 403);
      }

      await db
        .delete(announcementSubmissionComments)
        .where(eq(announcementSubmissionComments.id, commentId));

      return c.json({
        status: "success",
        message: "Komentar berhasil dihapus.",
      });
    } catch (err: any) {
      console.error("Error deleting peer comment:", err);
      return c.json(
        { error: err.message || "Gagal menghapus komentar." },
        500,
      );
    }
  },
);

export default announcementsRoute;

