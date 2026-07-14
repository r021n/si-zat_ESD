import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { db } from '../db/index.js'
import { users, accessControls } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const access = new Hono()

// Local auth & admin middleware helpers
const getJwtSecret = () => process.env.JWT_SECRET || 'sizatesdsecret'

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

    c.set('user', user)
    await next()
  } catch (error) {
    return c.json({ error: 'Sesi kedaluwarsa atau token tidak valid.' }, 401)
  }
}

// Get setting helper (ensures at least one row exists)
export async function getSettings() {
  let [settings] = await db.select().from(accessControls).limit(1)
  if (!settings) {
    [settings] = await db.insert(accessControls).values({
      isLocked: 0,
      isScheduleEnabled: 0,
      schedules: '[]',
    }).returning()
  }
  return settings
}

// Check lock logic
export function checkIsLocked(settings: { isLocked: number; isScheduleEnabled: number; schedules: string }) {
  if (settings.isLocked === 1) {
    return true
  }

  if (settings.isScheduleEnabled === 0) {
    return false
  }

  let schedulesList: any[] = []
  try {
    schedulesList = JSON.parse(settings.schedules)
  } catch (e) {
    console.error('Failed to parse schedules JSON:', e)
    return false
  }

  if (!schedulesList || schedulesList.length === 0) {
    return false
  }

  // Time in Jakarta timezone
  const nowInJakarta = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const currentDay = nowInJakarta.getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const currentHours = nowInJakarta.getHours()
  const currentMinutes = nowInJakarta.getMinutes()
  const currentTimeString = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`

  const matchingSlots = schedulesList.filter(slot => {
    return slot.days.includes(currentDay) &&
           currentTimeString >= slot.startTime &&
           currentTimeString <= slot.endTime
  })

  if (matchingSlots.length > 0) {
    const hasBlockMatch = matchingSlots.some(slot => slot.type === 'block')
    if (hasBlockMatch) {
      return true
    }
    const hasAllowMatch = matchingSlots.some(slot => slot.type === 'allow')
    if (hasAllowMatch) {
      return false
    }
  }

  const totalAllowRules = schedulesList.filter(slot => slot.type === 'allow').length
  if (totalAllowRules > 0) {
    return true
  }

  return false
}

// GET /status - Public check status
access.get('/status', async (c) => {
  try {
    const settings = await getSettings()
    const isLocked = checkIsLocked(settings)
    return c.json({ isLocked })
  } catch (err: any) {
    return c.json({ error: err.message || 'Gagal memeriksa status' }, 500)
  }
})

// GET /settings - Admin check full settings
access.get('/settings', adminMiddleware, async (c) => {
  try {
    const settings = await getSettings()
    return c.json({
      status: 'success',
      settings: {
        isLocked: settings.isLocked === 1,
        isScheduleEnabled: settings.isScheduleEnabled === 1,
        schedules: JSON.parse(settings.schedules)
      }
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Gagal mengambil pengaturan' }, 500)
  }
})

// POST /settings - Admin update settings
access.post('/settings', adminMiddleware, async (c) => {
  try {
    const { isLocked, isScheduleEnabled, schedules } = await c.req.json()

    const current = await getSettings()

    const updated = await db.update(accessControls)
      .set({
        isLocked: isLocked ? 1 : 0,
        isScheduleEnabled: isScheduleEnabled ? 1 : 0,
        schedules: JSON.stringify(schedules || [])
      })
      .where(eq(accessControls.id, current.id))
      .returning()

    return c.json({
      status: 'success',
      message: 'Pengaturan kontrol akses berhasil disimpan.',
      settings: {
        isLocked: updated[0].isLocked === 1,
        isScheduleEnabled: updated[0].isScheduleEnabled === 1,
        schedules: JSON.parse(updated[0].schedules)
      }
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Gagal memperbarui pengaturan' }, 500)
  }
})

export default access
