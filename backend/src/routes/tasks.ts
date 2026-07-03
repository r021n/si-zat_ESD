import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { db } from '../db/index.js'
import { users, taskSubmissions, taskDiscussions } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const tasks = new Hono()

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

// GET /api/tasks/submissions/:id/image - Stream binary blob (Public, so elements like <img> can load it directly)
tasks.get('/submissions/:id/image', async (c: any) => {
  try {
    const id = c.req.param('id')
    const [submission] = await db.select().from(taskSubmissions).where(eq(taskSubmissions.id, id)).limit(1)

    if (!submission || !submission.imageBlob) {
      return c.json({ error: 'Gambar tidak ditemukan.' }, 404)
    }

    const mimeType = submission.imageType || 'image/jpeg'

    // Return the blob as a binary body
    return new Response(submission.imageBlob as any, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000',
      }
    })
  } catch (error: any) {
    console.error('Error serving task submission image:', error)
    return c.json({ error: 'Gagal memuat gambar dari server.' }, 500)
  }
})

// Apply auth middleware to all subsequent routes
tasks.use('*', authMiddleware)

// GET /api/tasks/submissions - List all submissions (without heavy imageBlob field)
tasks.get('/submissions', async (c: any) => {
  try {
    const allSubmissions = await db.select({
      id: taskSubmissions.id,
      userId: taskSubmissions.userId,
      studentName: taskSubmissions.studentName,
      studentClass: taskSubmissions.studentClass,
      title: taskSubmissions.title,
      answer: taskSubmissions.answer,
      fileName: taskSubmissions.fileName,
      submittedAt: taskSubmissions.submittedAt,
      imageType: taskSubmissions.imageType
    }).from(taskSubmissions)

    // Sort submissions by submittedAt descending
    allSubmissions.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))

    return c.json(allSubmissions)
  } catch (error: any) {
    console.error('Error fetching task submissions:', error)
    return c.json({ error: 'Gagal mengambil daftar tugas dari server.' }, 500)
  }
})

// GET /api/tasks/discussions/overall-contributors - Get overall contributors (SISWA role only, grouped and ordered)
tasks.get('/discussions/overall-contributors', async (c: any) => {
  try {
    const commentsWithUser = await db.select({
      userId: taskDiscussions.userId,
      senderName: taskDiscussions.senderName,
      senderRole: taskDiscussions.senderRole,
      studentClass: users.kelas,
    })
    .from(taskDiscussions)
    .leftJoin(users, eq(taskDiscussions.userId, users.id))

    const counts: Record<string, { name: string; count: number; studentClass: string }> = {}

    for (const comment of commentsWithUser) {
      const role = comment.senderRole?.toLowerCase()
      // Filter only SISWA
      if (role === 'siswa') {
        const key = `${comment.userId}`
        if (!counts[key]) {
          counts[key] = {
            name: comment.senderName,
            count: 0,
            studentClass: comment.studentClass || 'Tidak diketahui'
          }
        }
        counts[key].count++
      }
    }

    const sorted = Object.values(counts).sort((a, b) => b.count - a.count)
    return c.json(sorted)
  } catch (error: any) {
    console.error('Error fetching overall contributors:', error)
    return c.json({ error: 'Gagal mengambil kontributor diskusi dari server.' }, 500)
  }
})

// POST /api/tasks/submissions - Submit task with optional image blob (multipart/form-data)
tasks.post('/submissions', async (c: any) => {
  try {
    const user = c.get('user')
    const body = await c.req.parseBody()
    
    const title = body['title'] as string
    const answer = body['answer'] as string
    const fileName = body['fileName'] as string
    const file = body['file'] as File | undefined

    if (!title || !answer) {
      return c.json({ error: 'Judul dan jawaban tugas harus diisi.' }, 400)
    }

    let imageBuffer: Buffer | null = null
    let imageType: string | null = null

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer()
      imageBuffer = Buffer.from(arrayBuffer)
      imageType = file.type
    }

    const submissionId = `sub-task-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    
    // Format timestamp: 06/06/2026, 08:30:15
    const now = new Date()
    const nowStr = now.toLocaleDateString('id-ID') + ', ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    await db.insert(taskSubmissions).values({
      id: submissionId,
      userId: user.id,
      studentName: user.nama || user.email.split('@')[0],
      studentClass: user.kelas,
      title,
      answer,
      fileName: fileName || '',
      imageBlob: imageBuffer,
      imageType,
      submittedAt: nowStr
    })

    return c.json({
      success: true,
      message: 'Tugas berhasil dikirim.',
      submission: {
        id: submissionId,
        userId: user.id,
        studentName: user.nama || user.email.split('@')[0],
        studentClass: user.kelas,
        title,
        answer,
        fileName: fileName || '',
        submittedAt: nowStr
      }
    })
  } catch (error: any) {
    console.error('Error submitting task:', error)
    return c.json({ error: `Gagal mengirim tugas: ${error.message}` }, 500)
  }
})

// DELETE /api/tasks/submissions/:id - Delete a task submission
tasks.delete('/submissions/:id', async (c: any) => {
  try {
    const id = c.req.param('id')
    const user = c.get('user')

    const [submission] = await db.select().from(taskSubmissions).where(eq(taskSubmissions.id, id)).limit(1)

    if (!submission) {
      return c.json({ error: 'Tugas tidak ditemukan.' }, 404)
    }

    const isAdmin = user.status.toLowerCase() === 'admin' || user.email.toLowerCase().includes('admin')
    if (submission.userId !== user.id && !isAdmin) {
      return c.json({ error: 'Akses ditolak. Anda tidak berhak menghapus tugas ini.' }, 403)
    }

    await db.delete(taskSubmissions).where(eq(taskSubmissions.id, id))
    return c.json({ success: true, message: 'Tugas berhasil dihapus.' })
  } catch (error: any) {
    console.error('Error deleting task submission:', error)
    return c.json({ error: 'Gagal menghapus tugas dari server.' }, 500)
  }
})

// GET /api/tasks/submissions/:id/discussions - Get discussion list for a submission
tasks.get('/submissions/:id/discussions', async (c: any) => {
  try {
    const submissionId = c.req.param('id')
    
    // Check if the submission exists
    const [submission] = await db.select().from(taskSubmissions).where(eq(taskSubmissions.id, submissionId)).limit(1)
    if (!submission) {
      return c.json({ error: 'Tugas tidak ditemukan.' }, 404)
    }

    const comments = await db.select().from(taskDiscussions).where(eq(taskDiscussions.taskSubmissionId, submissionId))
    
    // Sort oldest first (chat format)
    comments.sort((a, b) => a.createdAt.localeCompare(b.createdAt))

    return c.json(comments)
  } catch (error: any) {
    console.error('Error fetching discussions:', error)
    return c.json({ error: 'Gagal memuat diskusi dari server.' }, 500)
  }
})

// POST /api/tasks/submissions/:id/discussions - Post a discussion comment
tasks.post('/submissions/:id/discussions', async (c: any) => {
  try {
    const submissionId = c.req.param('id')
    const user = c.get('user')
    const { content } = await c.req.json()

    if (!content || !content.trim()) {
      return c.json({ error: 'Pesan tidak boleh kosong.' }, 400)
    }

    // Check if the submission exists
    const [submission] = await db.select().from(taskSubmissions).where(eq(taskSubmissions.id, submissionId)).limit(1)
    if (!submission) {
      return c.json({ error: 'Tugas tidak ditemukan.' }, 404)
    }

    const commentId = `comm-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    
    const now = new Date()
    const nowStr = now.toLocaleDateString('id-ID') + ', ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    await db.insert(taskDiscussions).values({
      id: commentId,
      taskSubmissionId: submissionId,
      userId: user.id,
      senderName: user.nama || user.email.split('@')[0],
      senderRole: user.status.toUpperCase(),
      content: content.trim(),
      createdAt: nowStr
    })

    return c.json({
      success: true,
      message: 'Pesan berhasil dikirim.',
      comment: {
        id: commentId,
        taskSubmissionId: submissionId,
        userId: user.id,
        senderName: user.nama || user.email.split('@')[0],
        senderRole: user.status.toUpperCase(),
        content: content.trim(),
        createdAt: nowStr
      }
    })
  } catch (error: any) {
    console.error('Error posting discussion comment:', error)
    return c.json({ error: 'Gagal mengirimkan pesan diskusi ke server.' }, 500)
  }
})

export default tasks
