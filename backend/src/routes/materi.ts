import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { db } from '../db/index.js'
import { users, materiProgress } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const materi = new Hono()

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
    }).from(users).where(eq(users.id, payload.id as number)).limit(1)

    if (!user) {
      return c.json({ error: 'Pengguna tidak ditemukan.' }, 401)
    }

    c.set('user', user)
    await next()
  } catch (error) {
    return c.json({ error: 'Sesi kedaluwarsa atau token tidak valid.' }, 401)
  }
}

materi.use('*', authMiddleware)

// GET /api/materi/progress - Fetch user reading progress
materi.get('/progress', async (c: any) => {
  try {
    const user = c.get('user')
    const [existing] = await db.select().from(materiProgress).where(eq(materiProgress.userId, user.id)).limit(1)
    if (!existing) {
      return c.json({
        status: 'success',
        progress: { lastPage: 0, maxUnlockedIndex: 0 }
      })
    }
    return c.json({
      status: 'success',
      progress: {
        lastPage: existing.lastPage,
        maxUnlockedIndex: existing.maxUnlockedIndex
      }
    })
  } catch (error: any) {
    console.error('Error fetching materi progress:', error)
    return c.json({ error: 'Gagal mengambil progress materi.' }, 500)
  }
})

// POST /api/materi/progress - Save/update user reading progress
materi.post('/progress', async (c: any) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const lastPage = Math.max(0, Number(body.lastPage) || 0)
    const maxUnlockedIndex = body.maxUnlockedIndex !== undefined ? Math.max(0, Number(body.maxUnlockedIndex)) : lastPage

    const [existing] = await db.select().from(materiProgress).where(eq(materiProgress.userId, user.id)).limit(1)
    let updated

    if (existing) {
      const newMaxUnlocked = Math.max(existing.maxUnlockedIndex, maxUnlockedIndex)
      const [result] = await db.update(materiProgress)
        .set({
          lastPage,
          maxUnlockedIndex: newMaxUnlocked,
          updatedAt: new Date()
        })
        .where(eq(materiProgress.userId, user.id))
        .returning()
      updated = result
    } else {
      const [result] = await db.insert(materiProgress).values({
        userId: user.id,
        lastPage,
        maxUnlockedIndex,
        updatedAt: new Date()
      }).returning()
      updated = result
    }

    return c.json({
      status: 'success',
      progress: {
        lastPage: updated.lastPage,
        maxUnlockedIndex: updated.maxUnlockedIndex
      }
    })
  } catch (error: any) {
    console.error('Error updating materi progress:', error)
    return c.json({ error: 'Gagal menyimpan progress materi.' }, 500)
  }
})

// POST /api/materi/progress/reset - Reset user reading progress
materi.post('/progress/reset', async (c: any) => {
  try {
    const user = c.get('user')
    const [existing] = await db.select().from(materiProgress).where(eq(materiProgress.userId, user.id)).limit(1)

    if (existing) {
      await db.update(materiProgress)
        .set({
          lastPage: 0,
          maxUnlockedIndex: 0,
          updatedAt: new Date()
        })
        .where(eq(materiProgress.userId, user.id))
    }

    return c.json({
      status: 'success',
      progress: { lastPage: 0, maxUnlockedIndex: 0 }
    })
  } catch (error: any) {
    console.error('Error resetting materi progress:', error)
    return c.json({ error: 'Gagal mereset progress materi.' }, 500)
  }
})

export default materi
