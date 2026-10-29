import { test, describe, before, after, beforeEach } from 'node:test'
import assert from 'node:assert'
import { db } from '../db/index.js'
import analyticsApp from './analytics.js'
import { sign } from 'hono/jwt'

function extractParamValues(condition: any): any[] {
  if (!condition) return []
  const values: any[] = []
  if (Array.isArray(condition.queryChunks)) {
    for (const chunk of condition.queryChunks) {
      if (chunk && typeof chunk === 'object') {
        if ('value' in chunk && !Array.isArray(chunk.value)) {
          values.push(chunk.value)
        } else if (Array.isArray(chunk.queryChunks)) {
          values.push(...extractParamValues(chunk))
        }
      }
    }
  }
  return values
}

describe('Analytics Route Defensive Body Parsing & Telemetry Tests', () => {
  let studentToken: string
  let adminToken: string

  const originalSelect = db.select
  const originalInsert = db.insert
  const originalUpdate = db.update

  let mockMenuClicks: { id: number; userId: number; menuKey: string; count: number }[] = []

  before(async () => {
    studentToken = await sign({ id: 1 }, process.env.JWT_SECRET || 'sizatesdsecret')
    adminToken = await sign({ id: 2 }, process.env.JWT_SECRET || 'sizatesdsecret')
  })

  beforeEach(() => {
    mockMenuClicks = []

    ;(db as any).select = (fields?: any) => ({
      from: () => ({
        where: (condition: any) => {
          const params = extractParamValues(condition)
          return {
            limit: async (n: number) => {
              if (fields && fields.email !== undefined) {
                if (params.includes(2)) {
                  return [{
                    id: 2,
                    email: 'admin@test.com',
                    kelas: 'Admin',
                    nama: 'Admin Test',
                    status: 'admin'
                  }]
                }
                return [{
                  id: 1,
                  email: 'siswa@test.com',
                  kelas: 'X-1',
                  nama: 'Siswa Test',
                  status: 'siswa'
                }]
              }

              const targetKey = params.find(p => typeof p === 'string')
              if (targetKey) {
                const matched = mockMenuClicks.filter(item => item.menuKey === targetKey)
                return matched.slice(0, n)
              }
              return mockMenuClicks.slice(0, n)
            },
            then: (resolve: any) => {
              resolve(mockMenuClicks)
            }
          }
        }
      })
    })

    ;(db as any).insert = () => ({
      values: async (data: any) => {
        const newRecord = {
          id: mockMenuClicks.length + 1,
          userId: data.userId,
          menuKey: data.menuKey,
          count: data.count || 1
        }
        mockMenuClicks.push(newRecord)
        return [newRecord]
      }
    })

    ;(db as any).update = () => ({
      set: (data: any) => ({
        where: async (condition: any) => {
          const params = extractParamValues(condition)
          const targetId = params.find(p => typeof p === 'number')
          const found = mockMenuClicks.find(item => item.id === targetId) || mockMenuClicks[0]
          if (found) {
            found.count = data.count
          }
          return mockMenuClicks
        }
      })
    })
  })

  after(() => {
    (db as any).select = originalSelect
    ;(db as any).insert = originalInsert
    ;(db as any).update = originalUpdate
  })

  describe('Authentication Guard', () => {
    test('POST /record should return 401 when no token is provided', async () => {
      const res = await analyticsApp.request('/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuKey: 'menu materi' })
      })
      assert.strictEqual(res.status, 401)
      const data = await res.json()
      assert.match(data.error, /Tidak terautentikasi/)
    })

    test('GET / should return 401 when no token is provided', async () => {
      const res = await analyticsApp.request('/', {
        method: 'GET'
      })
      assert.strictEqual(res.status, 401)
    })
  })

  describe('Defensive Body Parsing on POST /record', () => {
    test('POST /record with empty body string should return 400 without crashing', async () => {
      const res = await analyticsApp.request('/record', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        },
        body: ''
      })
      assert.strictEqual(res.status, 400)
      const data = await res.json()
      assert.strictEqual(data.error, 'Payload tidak valid atau kosong.')
    })

    test('POST /record with malformed JSON string should return 400 without crashing', async () => {
      const res = await analyticsApp.request('/record', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        },
        body: '{ "menuKey": "incomplete JSON'
      })
      assert.strictEqual(res.status, 400)
      const data = await res.json()
      assert.strictEqual(data.error, 'Payload tidak valid atau kosong.')
    })

    test('POST /record with empty object {} should return 400', async () => {
      const res = await analyticsApp.request('/record', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })
      assert.strictEqual(res.status, 400)
      const data = await res.json()
      assert.strictEqual(data.error, 'Kunci menu (menuKey) harus dikirimkan.')
    })

    test('POST /record with whitespace or invalid menuKey should return 400', async () => {
      const res = await analyticsApp.request('/record', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ menuKey: '   ' })
      })
      assert.strictEqual(res.status, 400)
      const data = await res.json()
      assert.strictEqual(data.error, 'Kunci menu (menuKey) harus dikirimkan.')
    })
  })

  describe('Valid Analytics Recording & Fetching', () => {
    test('POST /record with valid menuKey inserts new record and returns 200', async () => {
      const res = await analyticsApp.request('/record', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ menuKey: 'menu materi' })
      })
      assert.strictEqual(res.status, 200)
      const data = await res.json()
      assert.strictEqual(data.status, 'success')
      assert.strictEqual(data.message, 'Aktivitas berhasil dicatat.')
      assert.strictEqual(mockMenuClicks.length, 1)
      assert.strictEqual(mockMenuClicks[0].menuKey, 'menu materi')
      assert.strictEqual(mockMenuClicks[0].count, 1)
    })

    test('POST /record with same menuKey increments count', async () => {
      mockMenuClicks = [{ id: 1, userId: 1, menuKey: 'menu materi', count: 1 }]

      const res = await analyticsApp.request('/record', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ menuKey: 'menu materi' })
      })
      assert.strictEqual(res.status, 200)
      assert.strictEqual(mockMenuClicks[0].count, 2)
    })

    test('GET / returns grouped analytics for user', async () => {
      mockMenuClicks = [
        { id: 1, userId: 1, menuKey: 'menu materi', count: 5 },
        { id: 2, userId: 1, menuKey: 'menu kuis', count: 3 }
      ]

      const getRes = await analyticsApp.request('/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${studentToken}`
        }
      })
      assert.strictEqual(getRes.status, 200)
      const getData = await getRes.json()
      assert.strictEqual(getData.status, 'success')
      assert.strictEqual(getData.data.length, 2)
      assert.strictEqual(getData.data[0].menuKey, 'menu materi')
      assert.strictEqual(getData.data[0].count, 5)
    })

    test('GET /user/:id returns 403 for non-admin user', async () => {
      const res = await analyticsApp.request('/user/1', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${studentToken}`
        }
      })
      assert.strictEqual(res.status, 403)
      const data = await res.json()
      assert.match(data.error, /bukan admin/)
    })

    test('GET /user/:id returns 200 for admin user', async () => {
      mockMenuClicks = [{ id: 1, userId: 1, menuKey: 'menu materi', count: 4 }]

      const res = await analyticsApp.request('/user/1', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      assert.strictEqual(res.status, 200)
      const data = await res.json()
      assert.strictEqual(data.status, 'success')
      assert.strictEqual(data.data[0].menuKey, 'menu materi')
      assert.strictEqual(data.data[0].count, 4)
    })
  })
})
