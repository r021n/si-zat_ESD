import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import authRoute from './routes/auth.js'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

app.get('/api/health', (c) => c.json({ status: 'ok', version: 'hono-4.12.23' }))

// Mount separate routing modules
app.route('/api/auth', authRoute)

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