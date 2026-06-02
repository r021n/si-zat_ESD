import { Hono } from 'hono'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'

const usersRoute = new Hono()

usersRoute.get('/', async (c) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      kelas: users.kelas,
      nama: users.nama,
      status: users.status,
      createdAt: users.createdAt
    }).from(users)
    return c.json(allUsers)
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return c.json({ error: 'Terjadi kesalahan pada server saat mengambil data pengguna.' }, 500)
  }
})

export default usersRoute
