import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { db } from '../db/index.js'
import { users, enrollConfig, enrollments } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const enroll = new Hono()

const getJwtSecret = () => process.env.JWT_SECRET || 'sizatesdsecret'

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Auth middleware helper
async function authMiddleware(c: any, next: any) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Tidak terautentikasi' }, 401)
  }
  const token = authHeader.split(' ')[1]
  try {
    const payload = await verify(token, getJwtSecret(), 'HS256')
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      status: users.status
    }).from(users).where(eq(users.id, payload.id as number)).limit(1)

    if (!user) {
      return c.json({ error: 'Pengguna tidak ditemukan' }, 401)
    }

    c.set('user', user as any)
    await next()
  } catch {
    return c.json({ error: 'Sesi kedaluwarsa atau token tidak valid.' }, 401)
  }
}

async function adminMiddleware(c: any, next: any) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Tidak terautentikasi' }, 401)
  }
  const token = authHeader.split(' ')[1]
  try {
    const payload = await verify(token, getJwtSecret(), 'HS256')
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      status: users.status
    }).from(users).where(eq(users.id, payload.id as number)).limit(1)

    if (!user) {
      return c.json({ error: 'Pengguna tidak ditemukan' }, 401)
    }

    const isAdmin = (user.status || '').toLowerCase() === 'admin' || user.email.toLowerCase().includes('admin')
    if (!isAdmin) {
      return c.json({ error: 'Akses ditolak. Rute ini hanya untuk Administrator.' }, 403)
    }

    c.set('user', user as any)
    await next()
  } catch {
    return c.json({ error: 'Sesi kedaluwarsa atau token tidak valid.' }, 401)
  }
}

// Helper: ensure enroll_config row exists
async function getEnrollConfig() {
  let [config] = await db.select().from(enrollConfig).limit(1)
  return config
}

// GET /status - Check enrollment status for current user
enroll.get('/status', authMiddleware, async (c) => {
  try {
    const user = c.get('user' as any)
    const isAdmin = (user.status || '').toLowerCase() === 'admin' || user.email.toLowerCase().includes('admin')

    if (isAdmin) {
      return c.json({ isEnrolled: true, deadline: null })
    }

    const config = await getEnrollConfig()
    if (!config) {
      return c.json({ isEnrolled: false, deadline: null })
    }

    const now = new Date()
    const deadline = new Date(config.deadline)
    const isExpired = now > deadline

    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.userId, user.id)).limit(1)

    return c.json({
      isEnrolled: !!enrollment,
      deadline: config.deadline,
      isExpired,
      code: config.code,
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Gagal memeriksa status enroll' }, 500)
  }
})

// POST /verify - Student verifies enrollment code
enroll.post('/verify', authMiddleware, async (c) => {
  try {
    const user = c.get('user' as any)
    const isAdmin = (user.status || '').toLowerCase() === 'admin' || user.email.toLowerCase().includes('admin')
    if (isAdmin) {
      return c.json({ error: 'Admin tidak perlu enroll.' }, 400)
    }

    const { code } = await c.req.json()
    if (!code) {
      return c.json({ error: 'Kode enroll harus diisi.' }, 400)
    }

    const config = await getEnrollConfig()
    if (!config) {
      return c.json({ error: 'Belum ada kode enroll yang tersedia. Hubungi administrator.' }, 400)
    }

    const now = new Date()
    const deadline = new Date(config.deadline)
    if (now > deadline) {
      return c.json({ error: 'Kode enroll sudah melewati batas waktu.' }, 400)
    }

    if (code.trim().toUpperCase() !== config.code.toUpperCase()) {
      return c.json({ error: 'Kode enroll tidak valid.' }, 400)
    }

    const [existing] = await db.select().from(enrollments).where(eq(enrollments.userId, user.id)).limit(1)
    if (existing) {
      return c.json({ error: 'Anda sudah terdaftar (enrolled).' }, 400)
    }

    await db.insert(enrollments).values({
      userId: user.id,
      enrolledAt: now.toISOString(),
    })

    return c.json({
      status: 'success',
      message: 'Enroll berhasil! Anda sekarang bisa mengakses materi, kuis, dan simulasi.',
      deadline: config.deadline,
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Gagal memverifikasi kode enroll' }, 500)
  }
})

// POST /generate - Admin generates new enrollment code
enroll.post('/generate', adminMiddleware, async (c) => {
  try {
    const { deadline } = await c.req.json()
    if (!deadline) {
      return c.json({ error: 'Deadline harus diisi.' }, 400)
    }

    const newCode = generateCode()

    const [existing] = await db.select().from(enrollConfig).limit(1)
    if (existing) {
      await db.update(enrollConfig).set({
        code: newCode,
        deadline,
        updatedAt: new Date(),
      }).where(eq(enrollConfig.id, existing.id))
    } else {
      await db.insert(enrollConfig).values({
        code: newCode,
        deadline,
      })
    }

    // Reset all enrollments when new code is generated
    await db.delete(enrollments)

    return c.json({
      status: 'success',
      message: 'Kode enroll baru berhasil dibuat. Semua enrollment siswa telah di-reset.',
      code: newCode,
      deadline,
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Gagal membuat kode enroll' }, 500)
  }
})

// GET /config - Admin gets current enrollment config
enroll.get('/config', adminMiddleware, async (c) => {
  try {
    const config = await getEnrollConfig()
    if (!config) {
      return c.json({ status: 'success', config: null })
    }
    return c.json({
      status: 'success',
      config: {
        code: config.code,
        deadline: config.deadline,
        updatedAt: config.updatedAt,
      },
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Gagal mengambil konfigurasi enroll' }, 500)
  }
})

// GET /list - Admin gets enrollment list for all students
enroll.get('/list', adminMiddleware, async (c) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      nama: users.nama,
      kelas: users.kelas,
    }).from(users).where(eq(users.status, 'siswa'))

    const allEnrollments = await db.select().from(enrollments)

    const enrollmentMap = new Map<number, string>()
    allEnrollments.forEach(e => enrollmentMap.set(e.userId, e.enrolledAt))

    const list = allUsers.map(u => ({
      id: u.id,
      email: u.email,
      nama: u.nama,
      kelas: u.kelas,
      isEnrolled: enrollmentMap.has(u.id),
      enrolledAt: enrollmentMap.get(u.id) || null,
    }))

    return c.json({ status: 'success', list })
  } catch (err: any) {
    return c.json({ error: err.message || 'Gagal mengambil daftar enroll' }, 500)
  }
})

// POST /revoke/:userId - Admin revokes enrollment for a student
enroll.post('/revoke/:userId', adminMiddleware, async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    if (isNaN(userId)) {
      return c.json({ error: 'ID pengguna tidak valid.' }, 400)
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (!targetUser) {
      return c.json({ error: 'Siswa tidak ditemukan.' }, 404)
    }

    const [existing] = await db.select().from(enrollments).where(eq(enrollments.userId, userId)).limit(1)
    if (!existing) {
      return c.json({ error: 'Siswa ini belum terdaftar (enrolled).' }, 400)
    }

    await db.delete(enrollments).where(eq(enrollments.userId, userId))

    return c.json({
      status: 'success',
      message: `Enrollment untuk ${targetUser.nama || targetUser.email} berhasil dicabut.`,
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Gagal mencabut enrollment' }, 500)
  }
})

export default enroll
