import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { db } from '../db/index.js'
import { users, quizzes, questions, submissions } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const quiz = new Hono()

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
    const allQuizzes = await db.select().from(quizzes)
    const result = []

    for (const q of allQuizzes) {
      const quizQuestions = await db.select().from(questions).where(eq(questions.quizId, q.id))
      quizQuestions.sort((a, b) => a.sortOrder - b.sortOrder)

      const quizSubmissions = await db.select().from(submissions).where(eq(submissions.quizId, q.id))

      const parsedQuestions = quizQuestions.map(ques => ({
        id: ques.id,
        text: ques.text,
        options: JSON.parse(ques.options),
        correctAnswers: JSON.parse(ques.correctAnswers),
        images: JSON.parse(ques.images)
      }))

      result.push({
        id: q.id,
        title: q.title,
        createdAt: q.createdAt,
        questions: parsedQuestions,
        submissionsCount: quizSubmissions.length
      })
    }

    return c.json(result)
  } catch (error: any) {
    console.error('Error fetching quizzes:', error)
    return c.json({ error: 'Gagal mengambil data kuis dari server.' }, 500)
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
      createdAt: sub.createdAt
    }))

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
        sortOrder: i
      })
    }

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
        sortOrder: i
      })
    }

    return c.json({ success: true, message: 'Kuis berhasil diperbarui.' })
  } catch (error: any) {
    console.error('Error updating quiz:', error)
    return c.json({ error: 'Gagal memperbarui data kuis.' }, 500)
  }
})

// DELETE /api/quiz/:id - Delete a quiz (Admin only)
quiz.delete('/:id', adminMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id')
    await db.delete(quizzes).where(eq(quizzes.id, id))
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
    const { answers, score, createdAt } = await c.req.json()

    if (!answers || score === undefined) {
      return c.json({ error: 'Data pengerjaan kuis tidak lengkap.' }, 400)
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
      createdAt: createdAt || new Date().toLocaleString('id-ID')
    })

    return c.json({ success: true, message: 'Jawaban berhasil dikirim.' })
  } catch (error: any) {
    console.error('Error submitting quiz answers:', error)
    return c.json({ error: 'Gagal mengirimkan jawaban kuis ke server.' }, 500)
  }
})
export default quiz
