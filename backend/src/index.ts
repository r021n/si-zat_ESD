import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import authRoute from './routes/auth.js'
import quizRoute from './routes/quiz.js'
import materiRoute from './routes/materi.js'
import tasksRoute from './routes/tasks.js'
import analyticsRoute from './routes/analytics.js'
import accessRoute, { getSettings, checkIsLocked } from './routes/access.js'
import { verify } from 'hono/jwt'
import { db } from './db/index.js'
import { users } from './db/schema.js'
import { eq } from 'drizzle-orm'



const app = new Hono()

// Request logger middleware
app.use('*', async (c, next) => {
  const method = c.req.method
  const url = c.req.url
  console.log(`[REQUEST] --> ${method} ${url}`)
  await next()
  const status = c.res.status
  if (status >= 400) {
    console.log(`[RESPONSE] <-- ${method} ${url} - ERROR (Status: ${status})`)
  } else {
    console.log(`[RESPONSE] <-- ${method} ${url} - SUCCESS (Status: ${status})`)
  }
})

// Error logger and handler
app.onError((err, c) => {
  const method = c.req.method
  const url = c.req.url
  console.error(`[ERROR] <-- ${method} ${url} - ERROR: ${err.message}`)
  return c.json({ error: err.message || 'Internal Server Error' }, 500)
})

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

app.get('/api/health', (c) => c.json({ status: 'ok', version: 'hono-4.12.23' }))

// Intercept requests if application is locked
app.use('/api/*', async (c, next) => {
  const path = c.req.path
  
  // Public paths bypass access lock check
  if (
    path === '/api/health' ||
    path === '/api/auth/login' ||
    path === '/api/auth/register' ||
    path === '/api/auth/me' ||
    path === '/api/access/status'
  ) {
    return await next()
  }

  try {
    const settings = await getSettings()
    const isLocked = checkIsLocked(settings)
    
    if (isLocked) {
      // If locked, only admin users can access
      const authHeader = c.req.header('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Aplikasi sedang dinonaktifkan oleh administrator.' }, 403)
      }

      const token = authHeader.split(' ')[1]
      try {
        const payload = await verify(token, process.env.JWT_SECRET || 'sizatesdsecret', 'HS256')
        const [user] = await db.select({
          id: users.id,
          email: users.email,
          status: users.status
        }).from(users).where(eq(users.id, payload.id as number)).limit(1)

        if (!user) {
          return c.json({ error: 'Aplikasi sedang dinonaktifkan oleh administrator.' }, 403)
        }

        const isAdmin = (user.status || '').toLowerCase() === 'admin' || user.email.toLowerCase().includes('admin')
        if (!isAdmin) {
          return c.json({ error: 'Aplikasi sedang dinonaktifkan oleh administrator.' }, 403)
        }
      } catch (err) {
        return c.json({ error: 'Aplikasi sedang dinonaktifkan oleh administrator.' }, 403)
      }
    }
  } catch (err) {
    console.error('Error during access lock verification:', err)
  }

  await next()
})

// Mount separate routing modules
app.route('/api/auth', authRoute)
app.route('/api/quiz', quizRoute)
app.route('/api/materi', materiRoute)
app.route('/api/tasks', tasksRoute)
app.route('/api/analytics', analyticsRoute)
app.route('/api/access', accessRoute)




const port = Number(process.env.PORT) || 8787

if (!process.env.VERCEL) {
  import('@hono/node-server').then(({ serve }) => {
    console.log(`API running on http://localhost:${port}`)
    serve({ fetch: app.fetch, port })
  }).catch(err => {
    console.error('Failed to start local server:', err)
  })
}

export default app