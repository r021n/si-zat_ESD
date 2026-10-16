import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { db } from '../db/index.js'
import { users, quizzes, questions, submissions } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'

const quiz = new Hono()

// In-memory server cache for quiz structure to prevent N+1 Turso queries
let baseQuizzesCache: {
  data: Array<{
    id: string
    title: string
    createdAt: string
    kkm: number | null
    questions: any[]
  }>
  timestamp: number
} | null = null

const QUIZZES_CACHE_TTL_MS = 60 * 1000

export function invalidateQuizzesServerCache() {
  baseQuizzesCache = null
}

// Middleware to authenticate user and extract claims
async function authMiddleware(c: any, next: any) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Tidak terautentikasi. Token tidak ditemukan.' }, 401)
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = await verify(token, process.env.JWT_SECRET || 'sizatesdsecret', 'HS256')
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
  } catch (error) {
    return c.json({ error: 'Sesi kedaluwarsa atau token tidak valid. Silakan login kembali.' }, 401)
  }
}

// Middleware to verify user is admin
async function adminMiddleware(c: any, next: any) {
  const user = c.get('user')
  const isAdmin = user && (user.status.toLowerCase() === 'admin' || user.email.toLowerCase().includes('admin'));
  if (!isAdmin) {
    return c.json({ error: 'Akses ditolak. Rute ini hanya untuk Administrator.' }, 403)
  }
  await next()
}

// Apply authentication to all quiz endpoints
quiz.use('*', authMiddleware)

// GET /api/quiz - List all quizzes with their questions (accessible to both students and admins)
quiz.get('/', async (c: any) => {
  try {
    const user = c.get('user')
    const now = Date.now()

    let baseQuizzes = baseQuizzesCache && (now - baseQuizzesCache.timestamp < QUIZZES_CACHE_TTL_MS)
      ? baseQuizzesCache.data
      : null

    if (!baseQuizzes) {
      const allQuizzes = await db.select().from(quizzes)
      const allQuestions = await db.select().from(questions)

      // Group questions by quizId
      const questionsByQuiz: Record<string, any[]> = {}
      for (const q of allQuestions) {
        if (!questionsByQuiz[q.quizId]) {
          questionsByQuiz[q.quizId] = []
        }
        questionsByQuiz[q.quizId].push(q)
      }

      baseQuizzes = allQuizzes.map(q => {
        const quizQuestions = questionsByQuiz[q.id] || []
        quizQuestions.sort((a, b) => a.sortOrder - b.sortOrder)

        const parsedQuestions = quizQuestions.map(ques => ({
          id: ques.id,
          text: ques.text,
          options: JSON.parse(ques.options),
          correctAnswers: JSON.parse(ques.correctAnswers),
          images: JSON.parse(ques.images),
          questionType: ques.questionType || ""
        }))

        return {
          id: q.id,
          title: q.title,
          createdAt: q.createdAt,
          questions: parsedQuestions,
          kkm: q.kkm ?? null
        }
      })

      baseQuizzesCache = { data: baseQuizzes, timestamp: now }
    }

    // Single query for submissions metadata
    const allSubmissionsMeta = await db.select({
      quizId: submissions.quizId,
      userId: submissions.userId
    }).from(submissions)

    const submissionCounts: Record<string, number> = {}
    const submittedQuizIds = new Set<string>()

    for (const sub of allSubmissionsMeta) {
      submissionCounts[sub.quizId] = (submissionCounts[sub.quizId] || 0) + 1
      if (sub.userId === user.id) {
        submittedQuizIds.add(sub.quizId)
      }
    }

    const result = baseQuizzes.map(q => ({
      ...q,
      submissionsCount: submissionCounts[q.id] || 0,
      hasSubmitted: submittedQuizIds.has(q.id),
    }))

    return c.json(result)
  } catch (error: any) {
    console.error('Error fetching quizzes:', error)
    return c.json({ error: 'Gagal mengambil data kuis dari server.' }, 500)
  }
})

// GET /api/quiz/my-submissions - Get all submissions for the current logged-in user
quiz.get('/my-submissions', async (c: any) => {
  try {
    const user = c.get('user')
    const userSubmissions = await db.select().from(submissions).where(eq(submissions.userId, user.id))

    const parsedSubmissions = userSubmissions.map(sub => ({
      id: sub.id,
      quizId: sub.quizId,
      studentName: sub.studentName,
      studentClass: sub.studentClass,
      answers: JSON.parse(sub.answers),
      score: sub.score,
      duration: sub.duration,
      violationCount: sub.violationCount ?? 0,
      createdAt: sub.createdAt
    }))

    // Sort submissions by createdAt or ID descending (newest first)
    parsedSubmissions.sort((a, b) => {
      return b.createdAt.localeCompare(a.createdAt);
    })

    return c.json(parsedSubmissions)
  } catch (error: any) {
    console.error('Error fetching user submissions:', error)
    return c.json({ error: 'Gagal mengambil data riwayat kuis dari server.' }, 500)
  }
})

// GET /api/quiz/:id/submissions - Get all student submissions for a quiz (Admin only)
quiz.get('/:id/submissions', adminMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id')
    const quizSubmissions = await db.select().from(submissions).where(eq(submissions.quizId, id))

    const parsedSubmissions = quizSubmissions.map(sub => ({
      id: sub.id,
      quizId: sub.quizId,
      studentName: sub.studentName,
      studentClass: sub.studentClass,
      answers: JSON.parse(sub.answers),
      score: sub.score,
      duration: sub.duration,
      violationCount: sub.violationCount ?? 0,
      createdAt: sub.createdAt
    }))

    // Sort newest first
    parsedSubmissions.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const pageParam = c.req.query('page')
    const limitParam = c.req.query('limit')

    if (pageParam !== undefined || limitParam !== undefined) {
      const page = Math.max(1, parseInt(pageParam || '1') || 1)
      const limit = Math.max(1, Math.min(100, parseInt(limitParam || '10') || 10))
      const totalItems = parsedSubmissions.length
      const totalPages = Math.ceil(totalItems / limit) || 1
      const startIndex = (page - 1) * limit
      const paginatedData = parsedSubmissions.slice(startIndex, startIndex + limit)

      return c.json({
        status: 'success',
        data: paginatedData,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      })
    }

    return c.json(parsedSubmissions)
  } catch (error: any) {
    console.error('Error fetching submissions:', error)
    return c.json({ error: 'Gagal mengambil data respon kuis dari server.' }, 500)
  }
})

// POST /api/quiz - Create a new quiz (Admin only)
quiz.post('/', adminMiddleware, async (c: any) => {
  try {
    const { id, title, createdAt, questions: quizQuestions } = await c.req.json()

    if (!id || !title || !quizQuestions || quizQuestions.length === 0) {
      return c.json({ error: 'Data kuis tidak lengkap.' }, 400)
    }

    // Insert Quiz
    await db.insert(quizzes).values({
      id,
      title,
      createdAt: createdAt || new Date().toLocaleDateString('id-ID')
    })

    // Insert Questions
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i]
      await db.insert(questions).values({
        id: q.id,
        quizId: id,
        text: q.text,
        options: JSON.stringify(q.options),
        correctAnswers: JSON.stringify(q.correctAnswers),
        images: JSON.stringify(q.images || []),
        questionType: q.questionType || "",
        sortOrder: i
      })
    }

    invalidateQuizzesServerCache()
    return c.json({ success: true, message: 'Kuis berhasil dibuat.' })
  } catch (error: any) {
    console.error('Error creating quiz:', error)
    return c.json({ error: 'Gagal menyimpan kuis baru.' }, 500)
  }
})

// PUT /api/quiz/:id - Update an existing quiz (Admin only)
quiz.put('/:id', adminMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id')
    const { title, questions: quizQuestions } = await c.req.json()

    if (!title || !quizQuestions || quizQuestions.length === 0) {
      return c.json({ error: 'Data pembaruan kuis tidak lengkap.' }, 400)
    }

    // Update Quiz Title
    await db.update(quizzes).set({ title }).where(eq(quizzes.id, id))

    // Delete old questions
    await db.delete(questions).where(eq(questions.quizId, id))

    // Re-insert new questions
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i]
      await db.insert(questions).values({
        id: q.id,
        quizId: id,
        text: q.text,
        options: JSON.stringify(q.options),
        correctAnswers: JSON.stringify(q.correctAnswers),
        images: JSON.stringify(q.images || []),
        questionType: q.questionType || "",
        sortOrder: i
      })
    }

    invalidateQuizzesServerCache()
    return c.json({ success: true, message: 'Kuis berhasil diperbarui.' })
  } catch (error: any) {
    console.error('Error updating quiz:', error)
    return c.json({ error: 'Gagal memperbarui data kuis.' }, 500)
  }
})

// PATCH /api/quiz/:id/kkm - Set or clear the KKM (minimum mastery score) of a quiz (Admin only)
quiz.patch('/:id/kkm', adminMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id')
    const { kkm } = await c.req.json()

    if (kkm !== null) {
      const kkmNum = Number(kkm)
      if (!Number.isInteger(kkmNum) || kkmNum < 0 || kkmNum > 100) {
        return c.json({ error: 'KKM harus berupa angka bulat antara 0 dan 100.' }, 400)
      }
    }

    const [updated] = await db.update(quizzes)
      .set({ kkm: kkm === null ? null : Number(kkm) })
      .where(eq(quizzes.id, id))
      .returning({ id: quizzes.id })

    if (!updated) {
      return c.json({ error: 'Kuis tidak ditemukan.' }, 404)
    }

    invalidateQuizzesServerCache()
    return c.json({ success: true, message: kkm === null ? 'KKM berhasil dihapus.' : 'KKM berhasil disimpan.', kkm: kkm === null ? null : Number(kkm) })
  } catch (error: any) {
    console.error('Error updating quiz KKM:', error)
    return c.json({ error: 'Gagal memperbarui KKM kuis.' }, 500)
  }
})

// DELETE /api/quiz/:id - Delete a quiz (Admin only)
quiz.delete('/:id', adminMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id')
    await db.delete(quizzes).where(eq(quizzes.id, id))
    invalidateQuizzesServerCache()
    return c.json({ success: true, message: 'Kuis berhasil dihapus.' })
  } catch (error: any) {
    console.error('Error deleting quiz:', error)
    return c.json({ error: 'Gagal menghapus kuis.' }, 500)
  }
})

// POST /api/quiz/:id/submit - Submit quiz answers (Student and Admin)
quiz.post('/:id/submit', async (c: any) => {
  try {
    const quizId = c.req.param('id')
    const user = c.get('user')
    const { answers, score, createdAt, duration, violationCount } = await c.req.json()

    if (!answers || score === undefined) {
      return c.json({ error: 'Data pengerjaan kuis tidak lengkap.' }, 400)
    }

    const [existingSubmission] = await db.select({ id: submissions.id })
      .from(submissions)
      .where(and(
        eq(submissions.quizId, quizId),
        eq(submissions.userId, user.id)
      ))
      .limit(1)

    if (existingSubmission) {
      return c.json({ error: 'Anda sudah pernah mengerjakan kuis ini. Kuis hanya dapat dikerjakan satu kali.' }, 409)
    }

    const submissionId = `sub-${quizId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    await db.insert(submissions).values({
      id: submissionId,
      quizId,
      userId: user.id,
      studentName: user.nama || user.email.split('@')[0],
      studentClass: user.kelas,
      answers: JSON.stringify(answers),
      score: Number(score),
      duration: duration !== undefined && duration !== null ? Number(duration) : null,
      violationCount: violationCount !== undefined && violationCount !== null ? Number(violationCount) : 0,
      createdAt: createdAt || new Date().toLocaleString('id-ID')
    })

    invalidateQuizzesServerCache()
    return c.json({ success: true, message: 'Jawaban berhasil dikirim.' })
  } catch (error: any) {
    console.error('Error submitting quiz answers:', error)
    return c.json({ error: 'Gagal mengirimkan jawaban kuis ke server.' }, 500)
  }
})
export default quiz
