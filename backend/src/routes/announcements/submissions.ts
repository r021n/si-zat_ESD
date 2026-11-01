import { Hono } from "hono";
import { db } from "../../db/index.js";
import {
  announcements,
  announcementSubmissions,
  announcementSubmissionComments,
  announcementSubmissionImages,
} from "../../db/schema.js";
import { eq, sql, and } from "drizzle-orm";
import {
  authMiddleware,
  adminMiddleware,
  ensureTables,
} from "./middleware.js";
import { invalidateAnnouncementsServerCache } from "./cache.js";

const submissionsRoute = new Hono();

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_SUBMISSION_IMAGES = 10;

// GET /api/announcements/submissions/:submissionId/images/:imageId - Stream specific binary blob
submissionsRoute.get(
  "/submissions/:submissionId/images/:imageId",
  async (c: any) => {
    await ensureTables();
    try {
      const submissionId = c.req.param("submissionId");
      const imageId = c.req.param("imageId");

      let imageBlob: Buffer | null = null;
      let imageType: string | null = null;
      let submittedAt: string | null = null;

      if (imageId === "legacy") {
        const [sub] = await db
          .select({
            imageBlob: announcementSubmissions.imageBlob,
            imageType: announcementSubmissions.imageType,
            submittedAt: announcementSubmissions.submittedAt,
          })
          .from(announcementSubmissions)
          .where(eq(announcementSubmissions.id, submissionId))
          .limit(1);

        if (sub) {
          imageBlob = sub.imageBlob as Buffer | null;
          imageType = sub.imageType;
          submittedAt = sub.submittedAt;
        }
      } else {
        const [img] = await db
          .select({
            imageBlob: announcementSubmissionImages.imageBlob,
            imageType: announcementSubmissionImages.imageType,
            createdAt: announcementSubmissionImages.createdAt,
          })
          .from(announcementSubmissionImages)
          .where(
            and(
              eq(announcementSubmissionImages.id, imageId),
              eq(announcementSubmissionImages.submissionId, submissionId),
            ),
          )
          .limit(1);

        if (img) {
          imageBlob = img.imageBlob as Buffer | null;
          imageType = img.imageType;
          submittedAt = img.createdAt;
        }
      }

      if (!imageBlob) {
        return c.json({ error: "Gambar tidak ditemukan." }, 404);
      }

      const timestamp = submittedAt ? new Date(submittedAt).getTime() : 0;
      const etag = `"${submissionId}-${imageId}-${timestamp}"`;
      const clientEtag = c.req.header("if-none-match");

      if (clientEtag && clientEtag === etag) {
        return new Response(null, {
          status: 304,
          headers: {
            ETag: etag,
            "Cache-Control": "no-cache, must-revalidate",
          },
        });
      }

      const mimeType = imageType || "image/jpeg";
      return new Response(imageBlob as any, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "no-cache, must-revalidate",
          ETag: etag,
        },
      });
    } catch (err: any) {
      console.error("Error streaming specific submission image:", err);
      return c.json({ error: "Gagal memuat gambar." }, 500);
    }
  },
);

// GET /api/announcements/submissions/:submissionId/image - Stream binary blob (first/legacy image)
submissionsRoute.get("/submissions/:submissionId/image", async (c: any) => {
  await ensureTables();
  try {
    const submissionId = c.req.param("submissionId");

    const [sub] = await db
      .select({
        imageBlob: announcementSubmissions.imageBlob,
        imageType: announcementSubmissions.imageType,
        submittedAt: announcementSubmissions.submittedAt,
      })
      .from(announcementSubmissions)
      .where(eq(announcementSubmissions.id, submissionId))
      .limit(1);

    let imageBlob: Buffer | null = null;
    let imageType: string | null = null;
    let submittedAt: string | null = null;

    if (sub && sub.imageBlob) {
      imageBlob = sub.imageBlob as Buffer | null;
      imageType = sub.imageType;
      submittedAt = sub.submittedAt;
    } else {
      try {
        const query = db
          .select({
            id: announcementSubmissionImages.id,
            imageBlob: announcementSubmissionImages.imageBlob,
            imageType: announcementSubmissionImages.imageType,
            createdAt: announcementSubmissionImages.createdAt,
          })
          .from(announcementSubmissionImages)
          .where(eq(announcementSubmissionImages.submissionId, submissionId));

        const imgs =
          typeof (query as any).orderBy === "function"
            ? await (query as any).orderBy(announcementSubmissionImages.sortOrder).limit(1)
            : typeof (query as any).limit === "function"
            ? await (query as any).limit(1)
            : await query;

        if (imgs && imgs[0] && imgs[0].imageBlob) {
          imageBlob = imgs[0].imageBlob as Buffer | null;
          imageType = imgs[0].imageType;
          submittedAt = imgs[0].createdAt;
        }
      } catch (checkErr) {
        console.error("Error checking announcementSubmissionImages:", checkErr);
      }
    }

    if (!imageBlob) {
      return c.json({ error: "Gambar tidak ditemukan." }, 404);
    }

    const timestamp = submittedAt ? new Date(submittedAt).getTime() : 0;
    const etag = `"${submissionId}-${timestamp}"`;
    const clientEtag = c.req.header("if-none-match");

    if (clientEtag && clientEtag === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "no-cache, must-revalidate",
        },
      });
    }

    const mimeType = imageType || "image/jpeg";
    return new Response(imageBlob as any, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "no-cache, must-revalidate",
        ETag: etag,
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

    const subIds = subs.map((s) => s.id);
    const imagesMap = new Map<
      string,
      { id: string; fileName: string; sortOrder: number }[]
    >();
    if (subIds.length > 0) {
      try {
        const dbImages = await db
          .select({
            id: announcementSubmissionImages.id,
            submissionId: announcementSubmissionImages.submissionId,
            fileName: announcementSubmissionImages.fileName,
            sortOrder: announcementSubmissionImages.sortOrder,
          })
          .from(announcementSubmissionImages)
          .where(
            sql`${announcementSubmissionImages.submissionId} IN (${sql.join(
              subIds.map((id) => sql`${id}`),
              sql`, `,
            )})`,
          )
          .orderBy(announcementSubmissionImages.sortOrder);

        for (const img of dbImages) {
          if (!imagesMap.has(img.submissionId)) {
            imagesMap.set(img.submissionId, []);
          }
          imagesMap.get(img.submissionId)!.push({
            id: img.id,
            fileName: img.fileName || "",
            sortOrder: img.sortOrder,
          });
        }
      } catch (imgErr) {
        console.error("Error fetching submission images:", imgErr);
      }
    }

    subs = subs.map((s) => {
      const dbImgs = imagesMap.get(s.id) || [];
      const hasImages = dbImgs.length > 0 || !!s.hasImage;
      return {
        ...s,
        hasImage: hasImages,
        images:
          dbImgs.length > 0
            ? dbImgs
            : s.hasImage
            ? [{ id: "legacy", fileName: s.fileName || "", sortOrder: 0 }]
            : [],
        commentedUsers: commentedMap.get(s.userId) || [],
      };
    });

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

    let answer = "";
    let removeImage = false;
    let removedImageIds: string[] = [];
    let files: File[] = [];

    try {
      const formData = await c.req.formData();
      answer = (formData.get("answer") as string) || "";
      removeImage = formData.get("removeImage") === "true";
      const removedImageIdsRaw = formData.get("removedImageIds") as string | null;
      if (removedImageIdsRaw) {
        try {
          const parsed = JSON.parse(removedImageIdsRaw);
          if (Array.isArray(parsed)) removedImageIds = parsed;
        } catch {}
      }
      const rawFiles = formData.getAll("files") as (File | string)[];
      files = rawFiles.filter(
        (f): f is File =>
          !!f &&
          typeof f === "object" &&
          typeof (f as any).arrayBuffer === "function" &&
          (f as any).size > 0,
      );
      // Legacy "file" fallback
      const legacyFile = formData.get("file") as File | null;
      if (
        files.length === 0 &&
        legacyFile &&
        typeof legacyFile === "object" &&
        typeof legacyFile.arrayBuffer === "function" &&
        legacyFile.size > 0
      ) {
        files.push(legacyFile);
      }
    } catch {
      const body = await c.req.parseBody({ all: true });
      answer = (body["answer"] as string) || "";
      removeImage = body["removeImage"] === "true" || body["removeImage"] === true;
      const rawRemoved = body["removedImageIds"] as string;
      if (rawRemoved) {
        try {
          const parsed = JSON.parse(rawRemoved);
          if (Array.isArray(parsed)) removedImageIds = parsed;
        } catch {}
      }
      const bodyFiles = Array.isArray(body["files"])
        ? body["files"]
        : body["files"]
        ? [body["files"]]
        : [];
      files = (bodyFiles as any[]).filter(
        (f) =>
          !!f &&
          typeof f === "object" &&
          typeof f.arrayBuffer === "function" &&
          f.size > 0,
      );
      if (
        files.length === 0 &&
        body["file"] &&
        typeof body["file"] === "object" &&
        typeof (body["file"] as any).arrayBuffer === "function" &&
        (body["file"] as any).size > 0
      ) {
        files.push(body["file"] as File);
      }
    }

    if (!answer || !answer.trim()) {
      return c.json({ error: "Jawaban tugas tidak boleh kosong." }, 400);
    }

    if (files.length > MAX_SUBMISSION_IMAGES) {
      return c.json(
        {
          error: `Maksimal ${MAX_SUBMISSION_IMAGES} gambar yang dapat dilampirkan per tugas.`,
        },
        400,
      );
    }

    for (const file of files) {
      if (file.size > MAX_IMAGE_SIZE) {
        return c.json(
          { error: "Ukuran gambar terlalu besar. Maksimal 5MB." },
          400,
        );
      }
      if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
        return c.json(
          { error: "Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP." },
          400,
        );
      }
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

    let existingImages: { id: string; sortOrder: number }[] = [];
    if (existing) {
      try {
        const q = db
          .select({
            id: announcementSubmissionImages.id,
            sortOrder: announcementSubmissionImages.sortOrder,
          })
          .from(announcementSubmissionImages)
          .where(eq(announcementSubmissionImages.submissionId, existing.id));
        const res =
          typeof (q as any).orderBy === "function"
            ? await (q as any).orderBy(announcementSubmissionImages.sortOrder)
            : await q;
        if (Array.isArray(res)) existingImages = res;
      } catch {}
    }

    // Calculate current retained images count
    let retainedCount = 0;
    if (existing && !removeImage) {
      const remainingDbImages = existingImages.filter(
        (img) => !removedImageIds.includes(img.id),
      );
      const hasLegacy =
        existing.imageBlob && !removedImageIds.includes("legacy");
      retainedCount = remainingDbImages.length + (hasLegacy ? 1 : 0);
    }

    if (retainedCount + files.length > MAX_SUBMISSION_IMAGES) {
      return c.json(
        {
          error: `Maksimal ${MAX_SUBMISSION_IMAGES} gambar yang dapat dilampirkan per tugas.`,
        },
        400,
      );
    }

    let submissionId: string;

    if (existing) {
      submissionId = existing.id;
      const updatePayload: any = {
        studentName,
        studentClass,
        answer: answer.trim(),
        submittedAt: now,
      };

      if (removeImage) {
        updatePayload.imageBlob = null;
        updatePayload.imageType = null;
        updatePayload.fileName = "";
        await db
          .delete(announcementSubmissionImages)
          .where(eq(announcementSubmissionImages.submissionId, existing.id));
      } else {
        if (removedImageIds.includes("legacy")) {
          updatePayload.imageBlob = null;
          updatePayload.imageType = null;
          updatePayload.fileName = "";
        }
        for (const remId of removedImageIds) {
          if (remId !== "legacy") {
            await db
              .delete(announcementSubmissionImages)
              .where(
                and(
                  eq(announcementSubmissionImages.id, remId),
                  eq(announcementSubmissionImages.submissionId, existing.id),
                ),
              );
          }
        }
      }

      await db
        .update(announcementSubmissions)
        .set(updatePayload)
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
        fileName: files.length > 0 ? files[0].name : "",
        imageBlob: null,
        imageType: null,
        submittedAt: now,
      });
    }

    // Insert new files into announcementSubmissionImages
    if (files.length > 0) {
      let nextOrder = 0;
      try {
        const q = db
          .select({ sortOrder: announcementSubmissionImages.sortOrder })
          .from(announcementSubmissionImages)
          .where(eq(announcementSubmissionImages.submissionId, submissionId));
        const currentImages =
          typeof (q as any).orderBy === "function"
            ? await (q as any).orderBy(announcementSubmissionImages.sortOrder)
            : await q;
        if (Array.isArray(currentImages) && currentImages.length > 0) {
          nextOrder = Math.max(...currentImages.map((i) => i.sortOrder)) + 1;
        }
      } catch {}

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuf = await file.arrayBuffer();
        const buf = Buffer.from(arrayBuf);
        const imgId = `img-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`;
        await db.insert(announcementSubmissionImages).values({
          id: imgId,
          submissionId,
          imageBlob: buf,
          imageType: file.type || "image/jpeg",
          fileName: file.name || `image_${i + 1}.jpg`,
          sortOrder: nextOrder++,
          createdAt: now,
        });
      }
    }

    // Query all current images for response
    let finalImages: { id: string; fileName: string | null; sortOrder: number }[] = [];
    try {
      const q = db
        .select({
          id: announcementSubmissionImages.id,
          fileName: announcementSubmissionImages.fileName,
          sortOrder: announcementSubmissionImages.sortOrder,
        })
        .from(announcementSubmissionImages)
        .where(eq(announcementSubmissionImages.submissionId, submissionId));
      const res =
        typeof (q as any).orderBy === "function"
          ? await (q as any).orderBy(announcementSubmissionImages.sortOrder)
          : await q;
      if (Array.isArray(res)) finalImages = res;
    } catch {}

    const hasAnyImage =
      finalImages.length > 0 ||
      (!removeImage &&
        !removedImageIds.includes("legacy") &&
        existing?.imageBlob != null);

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
        fileName: finalImages.length > 0 ? finalImages[0].fileName : "",
        submittedAt: now,
        hasImage: hasAnyImage,
        images: finalImages,
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
        .delete(announcementSubmissionImages)
        .where(eq(announcementSubmissionImages.submissionId, submissionId));
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
