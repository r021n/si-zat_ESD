import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { db } from '../db/index.js'
import { users, menuClicks } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'

const analytics = new Hono()

const getJwtSecret = () => process.env.JWT_SECRET || 'sizatesdsecret'

// Middleware to authenticate user and extract claims
async function authMiddleware(c: any, next: any) {
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
  } catch (error) {
    return c.json({ error: 'Sesi kedaluwarsa atau token tidak valid. Silakan login kembali.' }, 401)
  }
}

analytics.use('*', authMiddleware)

// GET / - Get menu analytics for current user
analytics.get('/', async (c: any) => {
  try {
    const user = c.get('user')
    const clicks = await db.select({
      menuKey: menuClicks.menuKey,
      count: menuClicks.count
    }).from(menuClicks).where(eq(menuClicks.userId, user.id))

    // Group by menuKey to aggregate duplicate rows
    const grouped = clicks.reduce((acc: { menuKey: string; count: number }[], current) => {
      const existing = acc.find(item => item.menuKey === current.menuKey)
      if (existing) {
        existing.count += current.count
      } else {
        acc.push({ menuKey: current.menuKey, count: current.count })
      }
      return acc
    }, [])

    // Sort by count descending
    grouped.sort((a, b) => b.count - a.count)

    return c.json({
      status: 'success',
      data: grouped
    })
  } catch (error: any) {
    console.error('Error fetching menu analytics:', error)
    return c.json({ error: 'Gagal mengambil data analitik dari server.' }, 500)
  }
})

// POST /record - Record a menu click/open
analytics.post('/record', async (c: any) => {
  try {
    const user = c.get('user')
    const { menuKey } = await c.req.json()

    if (!menuKey) {
      return c.json({ error: 'Kunci menu (menuKey) harus dikirimkan.' }, 400)
    }

    // Select existing record
    const existing = await db.select().from(menuClicks)
      .where(and(eq(menuClicks.userId, user.id), eq(menuClicks.menuKey, menuKey)))
      .limit(1)

    if (existing.length > 0) {
      // Update count
      await db.update(menuClicks)
        .set({ count: existing[0].count + 1 })
        .where(eq(menuClicks.id, existing[0].id))
    } else {
      // Insert new record
      await db.insert(menuClicks).values({
        userId: user.id,
        menuKey,
        count: 1
      })
    }

    return c.json({
      status: 'success',
      message: 'Aktivitas berhasil dicatat.'
    })
  } catch (error: any) {
    console.error('Error recording menu click:', error)
    return c.json({ error: 'Gagal mencatat aktivitas ke server.' }, 500)
  }
})

export default analytics
