import { Hono } from "hono";
import { db } from "../../db/index.js";
import {
  announcementSubmissions,
  announcementSubmissionComments,
} from "../../db/schema.js";
import { eq, sql, and } from "drizzle-orm";
import { authMiddleware } from "./middleware.js";

const peerReviewRoute = new Hono();

// GET /api/announcements/:id/peer-submissions - Get peer submissions with review progress
peerReviewRoute.get("/:id/peer-submissions", authMiddleware, async (c: any) => {
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
peerReviewRoute.get(
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
peerReviewRoute.post(
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
peerReviewRoute.delete(
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

export default peerReviewRoute;
