import { Hono } from "hono";
import { db } from "../../db/index.js";
import {
  announcements,
  announcementSubmissions,
  announcementSubmissionComments,
} from "../../db/schema.js";
import { eq, sql, and } from "drizzle-orm";
import {
  authMiddleware,
  adminMiddleware,
  ensureTables,
} from "./middleware.js";
import { invalidateAnnouncementsServerCache } from "./cache.js";

const submissionsRoute = new Hono();

// GET /api/announcements/submissions/:submissionId/image - Stream binary blob
submissionsRoute.get("/submissions/:submissionId/image", async (c: any) => {
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

// GET /api/announcements/:id/submissions - Get submissions for an announcement
submissionsRoute.get("/:id/submissions", authMiddleware, async (c: any) => {
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
    const commentedMap = new Map<
      number,
      { userId: number; studentName: string; studentClass: string }[]
    >();
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
          eq(
            announcementSubmissionComments.submissionId,
            announcementSubmissions.id,
          ),
        )
        .where(
          eq(announcementSubmissionComments.announcementId, announcementId),
        );

      const tempMap = new Map<
        number,
        Map<
          number,
          { userId: number; studentName: string; studentClass: string }
        >
      >();
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
submissionsRoute.post("/:id/submissions", authMiddleware, async (c: any) => {
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
submissionsRoute.delete(
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
submissionsRoute.post(
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

export default submissionsRoute;
