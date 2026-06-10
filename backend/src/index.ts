import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import authRoute from './routes/auth.js'
import quizRoute from './routes/quiz.js'
import materiRoute from './routes/materi.js'
import tasksRoute from './routes/tasks.js'


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

// Mount separate routing modules
app.route('/api/auth', authRoute)
app.route('/api/quiz', quizRoute)
app.route('/api/materi', materiRoute)
app.route('/api/tasks', tasksRoute)


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