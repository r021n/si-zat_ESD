import { Hono } from 'hono'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { sign, verify } from 'hono/jwt'
import bcrypt from 'bcryptjs'

const auth = new Hono()

const getJwtSecret = () => process.env.JWT_SECRET || 'sizatesdsecret'

auth.post('/register', async (c) => {
  try {
    const { email, kelas, password } = await c.req.json()

    if (!email || !kelas || !password) {
      return c.json({ error: 'Data tidak lengkap. Mohon isi semua kolom.' }, 400)
    }

    // Check if email already exists
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existing.length > 0) {
      return c.json({ error: 'Email sudah terdaftar!' }, 400)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user
    const [newUser] = await db.insert(users).values({
      email,
      kelas,
      password: hashedPassword
    }).returning()

    // Generate JWT token
    const token = await sign(
      {
        id: newUser.id,
        email: newUser.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 Days
      },
      getJwtSecret()
    )

    return c.json({
      status: 'success',
      message: 'Registrasi berhasil!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        kelas: newUser.kelas,
        nama: newUser.nama,
        status: newUser.status
      }
    }, 201)
  } catch (error: any) {
    console.error('Error during registration:', error)
    return c.json({ error: 'Terjadi kesalahan pada server saat pendaftaran.' }, 500)
  }
})

auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    if (!email || !password) {
      return c.json({ error: 'Email dan password harus diisi.' }, 400)
    }

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!user) {
      return c.json({ error: 'Email atau password salah.' }, 401)
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return c.json({ error: 'Email atau password salah.' }, 401)
    }

    // Generate JWT token
    const token = await sign(
      {
        id: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 Days
      },
      getJwtSecret()
    )

    return c.json({
      status: 'success',
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        email: user.email,
        kelas: user.kelas,
        nama: user.nama,
        status: user.status
      }
    })
  } catch (error: any) {
    console.error('Error during login:', error)
    return c.json({ error: 'Terjadi kesalahan pada server saat login.' }, 500)
  }
})

// Endpoint to verify token and return current logged in user details
auth.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Tidak terautentikasi' }, 401)
    }

    const token = authHeader.split(' ')[1]
    const payload = await verify(token, getJwtSecret(), 'HS256')

    // Fetch user details from DB to make sure they still exist
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      kelas: users.kelas,
      nama: users.nama,
      status: users.status
    }).from(users).where(eq(users.id, payload.id as number)).limit(1)

    if (!user) {
      return c.json({ error: 'Pengguna tidak ditemukan' }, 401)
    }

    return c.json({
      status: 'success',
      user
    })
  } catch (error) {
    console.error('Token verification failed:', error)
    return c.json({ error: 'Sesi kedaluwarsa atau token tidak valid. Silakan login kembali.' }, 401)
  }
})

export default auth
