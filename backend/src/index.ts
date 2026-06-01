import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { db } from './db/index.js'
import { users } from './db/schema.js'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET','POST','PUT','DELETE']
}))

app.get('/api/health', (c) => c.json({ status: 'ok', version: 'hono-4.12.23' }))

app.get('/api/users', async (c) => {
  const all = await db.select().from(users)
  return c.json(all)
})

app.post('/api/users', async (c) => {
  const body = await c.req.json()
  const [row] = await db.insert(users).values({ name: body.name }).returning()
  return c.json(row, 201)
})

const port = Number(process.env.PORT) || 8787
console.log(`API running on http://localhost:${port}`)
serve({ fetch: app.fetch, port })