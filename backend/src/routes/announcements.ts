import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { db } from '../db/index.js'
import { users, announcements, announcementSubmissions, announcementDiscussions } from '../db/schema.js'
import { eq, sql, and } from 'drizzle-orm'

const announcementsRoute = new Hono()

const getJwtSecret = () => process.env.JWT_SECRET || 'sizatesdsecret'

// Safe auto-creation of tables if they don't exist yet
let tablesInitialized = false
async function ensureTables() {
  if (tablesInitialized) return
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
        created_at TEXT NOT NULL,
        updated_at TEXT
      )
    `)
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
    `)
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
    `)
    tablesInitialized = true
  } catch (err) {
    console.error('Error ensuring announcement tables:', err)
  }
}

// Middleware: Authenticate user
async function authMiddleware(c: any, next: any) {
  await ensureTables()
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Tidak terautentikasi. Token tidak ditemukan.' }, 401)
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = await verify(token, getJwtSecret(), 'HS256')
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      kelas: users.kelas,
      nama: users.nama,
      status: users.status
    }).from(users).where(eq(users.id, payload.id as number)).limit(1)

    if (!user) {
      return c.json({ error: 'Pengguna tidak ditemukan.' }, 401)
    }

    c.set('user', user)
    await next()
  } catch {
    return c.json({ error: 'Sesi kedaluwarsa atau token tidak valid.' }, 401)
  }
}

// Middleware: Ensure user is Admin
async function adminMiddleware(c: any, next: any) {
  await ensureTables()
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Tidak terautentikasi. Token tidak ditemukan.' }, 401)
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = await verify(token, getJwtSecret(), 'HS256')
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      kelas: users.kelas,
      nama: users.nama,
      status: users.status
    }).from(users).where(eq(users.id, payload.id as number)).limit(1)

    if (!user) {
      return c.json({ error: 'Pengguna tidak ditemukan.' }, 401)
    }

    const isAdmin = (user.status || '').toLowerCase() === 'admin' || user.email.toLowerCase().includes('admin')
    if (!isAdmin) {
      return c.json({ error: 'Akses ditolak. Fitur ini hanya untuk Administrator/Guru.' }, 403)
    }

    c.set('user', user)
    await next()
  } catch {
    return c.json({ error: 'Sesi kedaluwarsa atau token tidak valid.' }, 401)
  }
}

// GET /api/announcements/submissions/:submissionId/image - Stream binary blob
announcementsRoute.get('/submissions/:submissionId/image', async (c: any) => {
  await ensureTables()
  try {
    const submissionId = c.req.param('submissionId')
    const [sub] = await db.select({
      imageBlob: announcementSubmissions.imageBlob,
      imageType: announcementSubmissions.imageType,
    }).from(announcementSubmissions).where(eq(announcementSubmissions.id, submissionId)).limit(1)

    if (!sub || !sub.imageBlob) {
      return c.json({ error: 'Gambar tidak ditemukan.' }, 404)
    }

    const mimeType = sub.imageType || 'image/jpeg'
    return new Response(sub.imageBlob as any, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000',
      }
    })
  } catch (err: any) {
    console.error('Error streaming submission image:', err)
    return c.json({ error: 'Gagal memuat gambar.' }, 500)
  }
})

// GET /api/announcements - List announcements
announcementsRoute.get('/', authMiddleware, async (c: any) => {
  try {
    const user = c.get('user')
    const allAnnouncements = await db.select().from(announcements)

    // Sort newest first
    allAnnouncements.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    // Efficiently count discussions and submissions
    const allDiscussions = await db.select({
      announcementId: announcementDiscussions.announcementId,
    }).from(announcementDiscussions)

    const allSubmissions = await db.select({
      id: announcementSubmissions.id,
      announcementId: announcementSubmissions.announcementId,
      userId: announcementSubmissions.userId,
      submittedAt: announcementSubmissions.submittedAt,
      grade: announcementSubmissions.grade,
      feedback: announcementSubmissions.feedback,
    }).from(announcementSubmissions)

    const discussionCounts: Record<string, number> = {}
    for (const d of allDiscussions) {
      discussionCounts[d.announcementId] = (discussionCounts[d.announcementId] || 0) + 1
    }

    const submissionCounts: Record<string, number> = {}
    const userSubmissionMap: Record<string, any> = {}
    for (const s of allSubmissions) {
      submissionCounts[s.announcementId] = (submissionCounts[s.announcementId] || 0) + 1
      if (s.userId === user.id) {
        userSubmissionMap[s.announcementId] = {
          id: s.id,
          submittedAt: s.submittedAt,
          grade: s.grade,
          feedback: s.feedback,
        }
      }
    }

    const result = allAnnouncements.map((item) => ({
      ...item,
      discussionsCount: discussionCounts[item.id] || 0,
      submissionsCount: submissionCounts[item.id] || 0,
      mySubmission: userSubmissionMap[item.id] || null,
    }))

    return c.json({ status: 'success', data: result })
  } catch (err: any) {
    console.error('Error fetching announcements:', err)
    return c.json({ error: err.message || 'Gagal mengambil daftar pengumuman.' }, 500)
  }
})

// GET /api/announcements/:id - Single announcement detail
announcementsRoute.get('/:id', authMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id')
    const user = c.get('user')

    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1)
    if (!announcement) {
      return c.json({ error: 'Pengumuman tidak ditemukan.' }, 404)
    }

    // Get user's submission if any
    const [mySub] = await db.select({
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
    }).from(announcementSubmissions).where(
      and(
        eq(announcementSubmissions.announcementId, id),
        eq(announcementSubmissions.userId, user.id)
      )
    ).limit(1)

    return c.json({
      status: 'success',
      data: {
        ...announcement,
        mySubmission: mySub || null,
      }
    })
  } catch (err: any) {
    console.error('Error fetching announcement detail:', err)
    return c.json({ error: err.message || 'Gagal mengambil detail pengumuman.' }, 500)
  }
})

// POST /api/announcements - Admin creates new announcement
announcementsRoute.post('/', adminMiddleware, async (c: any) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const { title, problem, question, taskInfo, instruction } = body

    if (!title || !title.trim()) {
      return c.json({ error: 'Judul pengumuman harus diisi.' }, 400)
    }

    const id = `ann-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const now = new Date().toISOString()

    const authorName = user.nama || user.email.split('@')[0] || 'Guru'

    await db.insert(announcements).values({
      id,
      title: title.trim(),
      problem: problem ? problem.trim() : '',
      question: question ? question.trim() : '',
      taskInfo: taskInfo ? taskInfo.trim() : '',
      instruction: instruction ? instruction.trim() : '',
      authorId: user.id,
      authorName,
      createdAt: now,
    })

    return c.json({
      status: 'success',
      message: 'Pengumuman berhasil dibuat.',
      data: { id, title, problem, question, taskInfo, instruction, authorName, createdAt: now }
    })
  } catch (err: any) {
    console.error('Error creating announcement:', err)
    return c.json({ error: err.message || 'Gagal membuat pengumuman.' }, 500)
  }
})

// PUT /api/announcements/:id - Admin updates announcement
announcementsRoute.put('/:id', adminMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { title, problem, question, taskInfo, instruction } = body

    if (!title || !title.trim()) {
      return c.json({ error: 'Judul pengumuman harus diisi.' }, 400)
    }

    const [existing] = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1)
    if (!existing) {
      return c.json({ error: 'Pengumuman tidak ditemukan.' }, 404)
    }

    const now = new Date().toISOString()

    await db.update(announcements).set({
      title: title.trim(),
      problem: problem !== undefined ? problem.trim() : existing.problem,
      question: question !== undefined ? question.trim() : existing.question,
      taskInfo: taskInfo !== undefined ? taskInfo.trim() : existing.taskInfo,
      instruction: instruction !== undefined ? instruction.trim() : existing.instruction,
      updatedAt: now,
    }).where(eq(announcements.id, id))

    return c.json({ status: 'success', message: 'Pengumuman berhasil diperbarui.' })
  } catch (err: any) {
    console.error('Error updating announcement:', err)
    return c.json({ error: err.message || 'Gagal memperbarui pengumuman.' }, 500)
  }
})

// DELETE /api/announcements/:id - Admin deletes announcement
announcementsRoute.delete('/:id', adminMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id')

    const [existing] = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1)
    if (!existing) {
      return c.json({ error: 'Pengumuman tidak ditemukan.' }, 404)
    }

    await db.delete(announcementDiscussions).where(eq(announcementDiscussions.announcementId, id))
    await db.delete(announcementSubmissions).where(eq(announcementSubmissions.announcementId, id))
    await db.delete(announcements).where(eq(announcements.id, id))

    return c.json({ status: 'success', message: 'Pengumuman berhasil dihapus.' })
  } catch (err: any) {
    console.error('Error deleting announcement:', err)
    return c.json({ error: err.message || 'Gagal menghapus pengumuman.' }, 500)
  }
})

// GET /api/announcements/:id/discussions - Fetch all discussions for this announcement
announcementsRoute.get('/:id/discussions', authMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id')
    const comments = await db.select({
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
    .where(eq(announcementDiscussions.announcementId, id))

    // Sort chronologically (oldest first for chat timeline)
    comments.sort((a, b) => a.createdAt.localeCompare(b.createdAt))

    return c.json({ status: 'success', data: comments })
  } catch (err: any) {
    console.error('Error fetching discussions:', err)
    return c.json({ error: err.message || 'Gagal memuat diskusi.' }, 500)
  }
})

// POST /api/announcements/:id/discussions - Post discussion message
announcementsRoute.post('/:id/discussions', authMiddleware, async (c: any) => {
  try {
    const announcementId = c.req.param('id')
    const user = c.get('user')
    const { content } = await c.req.json()

    if (!content || !content.trim()) {
      return c.json({ error: 'Pesan tidak boleh kosong.' }, 400)
    }

    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, announcementId)).limit(1)
    if (!announcement) {
      return c.json({ error: 'Pengumuman tidak ditemukan.' }, 404)
    }

    const commentId = `disc-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const now = new Date().toISOString()
    const senderRole = ((user.status || '').toLowerCase() === 'admin' || user.email.toLowerCase().includes('admin')) ? 'ADMIN' : 'SISWA'
    const senderName = user.nama || user.email.split('@')[0]

    await db.insert(announcementDiscussions).values({
      id: commentId,
      announcementId,
      userId: user.id,
      senderName,
      senderRole,
      content: content.trim(),
      createdAt: now,
    })

    return c.json({
      status: 'success',
      message: 'Pesan berhasil dikirim.',
      data: {
        id: commentId,
        announcementId,
        userId: user.id,
        senderName,
        senderRole,
        content: content.trim(),
        createdAt: now,
        studentClass: user.kelas || '',
      }
    })
  } catch (err: any) {
    console.error('Error posting discussion message:', err)
    return c.json({ error: err.message || 'Gagal mengirim pesan.' }, 500)
  }
})

// GET /api/announcements/:id/submissions - Get submissions for an announcement
announcementsRoute.get('/:id/submissions', authMiddleware, async (c: any) => {
  try {
    const announcementId = c.req.param('id')
    const user = c.get('user')
    const isAdmin = (user.status || '').toLowerCase() === 'admin' || user.email.toLowerCase().includes('admin')

    let subsQuery
    if (isAdmin) {
      subsQuery = db.select({
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
      }).from(announcementSubmissions).where(eq(announcementSubmissions.announcementId, announcementId))
    } else {
      subsQuery = db.select({
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
      }).from(announcementSubmissions).where(
        and(
          eq(announcementSubmissions.announcementId, announcementId),
          eq(announcementSubmissions.userId, user.id)
        )
      )
    }

    const subs = await subsQuery
    subs.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))

    return c.json({ status: 'success', data: subs })
  } catch (err: any) {
    console.error('Error fetching submissions:', err)
    return c.json({ error: err.message || 'Gagal mengambil pengumpulan tugas.' }, 500)
  }
})

// POST /api/announcements/:id/submissions - Submit task
announcementsRoute.post('/:id/submissions', authMiddleware, async (c: any) => {
  try {
    const announcementId = c.req.param('id')
    const user = c.get('user')

    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, announcementId)).limit(1)
    if (!announcement) {
      return c.json({ error: 'Pengumuman tidak ditemukan.' }, 404)
    }

    const body = await c.req.parseBody()
    const answer = body['answer'] as string
    const fileName = body['fileName'] as string
    const file = body['file'] as File | undefined

    if (!answer || !answer.trim()) {
      return c.json({ error: 'Jawaban tugas tidak boleh kosong.' }, 400)
    }

    let imageBuffer: Buffer | null = null
    let imageType: string | null = null

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer()
      imageBuffer = Buffer.from(arrayBuffer)
      imageType = file.type
    }

    const now = new Date().toISOString()
    const studentName = user.nama || user.email.split('@')[0]
    const studentClass = user.kelas || 'Siswa'

    // Check if existing submission exists for this student on this announcement
    const [existing] = await db.select().from(announcementSubmissions).where(
      and(
        eq(announcementSubmissions.announcementId, announcementId),
        eq(announcementSubmissions.userId, user.id)
      )
    ).limit(1)

    let submissionId: string

    if (existing) {
      submissionId = existing.id
      await db.update(announcementSubmissions).set({
        studentName,
        studentClass,
        answer: answer.trim(),
        fileName: fileName || existing.fileName,
        ...(imageBuffer ? { imageBlob: imageBuffer, imageType } : {}),
        submittedAt: now,
      }).where(eq(announcementSubmissions.id, existing.id))
    } else {
      submissionId = `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      await db.insert(announcementSubmissions).values({
        id: submissionId,
        announcementId,
        userId: user.id,
        studentName,
        studentClass,
        answer: answer.trim(),
        fileName: fileName || '',
        imageBlob: imageBuffer,
        imageType,
        submittedAt: now,
      })
    }

    return c.json({
      status: 'success',
      message: 'Tugas berhasil dikumpulkan.',
      data: {
        id: submissionId,
        announcementId,
        userId: user.id,
        studentName,
        studentClass,
        answer: answer.trim(),
        fileName: fileName || '',
        submittedAt: now,
        hasImage: !!imageBuffer || (existing && !imageBuffer ? !!existing.imageBlob : false),
      }
    })
  } catch (err: any) {
    console.error('Error submitting announcement task:', err)
    return c.json({ error: err.message || 'Gagal mengumpulkan tugas.' }, 500)
  }
})

// DELETE /api/announcements/submissions/:submissionId - Delete a submission
announcementsRoute.delete('/submissions/:submissionId', authMiddleware, async (c: any) => {
  try {
    const submissionId = c.req.param('submissionId')
    const user = c.get('user')
    const isAdmin = (user.status || '').toLowerCase() === 'admin' || user.email.toLowerCase().includes('admin')

    const [submission] = await db.select().from(announcementSubmissions).where(eq(announcementSubmissions.id, submissionId)).limit(1)
    if (!submission) {
      return c.json({ error: 'Pengumpulan tugas tidak ditemukan.' }, 404)
    }

    if (submission.userId !== user.id && !isAdmin) {
      return c.json({ error: 'Akses ditolak.' }, 403)
    }

    await db.delete(announcementSubmissions).where(eq(announcementSubmissions.id, submissionId))
    return c.json({ status: 'success', message: 'Tugas berhasil dihapus.' })
  } catch (err: any) {
    console.error('Error deleting submission:', err)
    return c.json({ error: err.message || 'Gagal menghapus tugas.' }, 500)
  }
})

// POST /api/announcements/submissions/:submissionId/grade - Admin grades a student's submission
announcementsRoute.post('/submissions/:submissionId/grade', adminMiddleware, async (c: any) => {
  try {
    const submissionId = c.req.param('submissionId')
    const adminUser = c.get('user')
    const { grade, feedback } = await c.req.json()

    if (grade === undefined || grade === null || isNaN(Number(grade))) {
      return c.json({ error: 'Nilai harus berupa angka yang valid.' }, 400)
    }

    const numGrade = Math.min(100, Math.max(0, Number(grade)))

    const [submission] = await db.select().from(announcementSubmissions).where(eq(announcementSubmissions.id, submissionId)).limit(1)
    if (!submission) {
      return c.json({ error: 'Pengumpulan tugas tidak ditemukan.' }, 404)
    }

    const now = new Date().toISOString()
    const gradedBy = adminUser.nama || adminUser.email.split('@')[0] || 'Guru'

    await db.update(announcementSubmissions).set({
      grade: numGrade,
      feedback: feedback !== undefined ? feedback.trim() : submission.feedback,
      gradedAt: now,
      gradedBy,
    }).where(eq(announcementSubmissions.id, submissionId))

    return c.json({
      status: 'success',
      message: 'Nilai dan catatan berhasil disimpan.',
      data: {
        id: submissionId,
        grade: numGrade,
        feedback: feedback || '',
        gradedAt: now,
        gradedBy,
      }
    })
  } catch (err: any) {
    console.error('Error grading submission:', err)
    return c.json({ error: err.message || 'Gagal menyimpan nilai tugas.' }, 500)
  }
})

export default announcementsRoute
