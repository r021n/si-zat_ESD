import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { db } from '../db/index.js'
import { users, materials, materialBlocks } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const materi = new Hono()

// Middleware to authenticate user and extract claims
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

// Middleware to verify user is admin
async function adminMiddleware(c: any, next: any) {
  const user = c.get('user')
  const isAdmin = user && (user.status.toLowerCase() === 'admin' || user.email.toLowerCase().includes('admin'));
  if (!isAdmin) {
    return c.json({ error: 'Akses ditolak. Rute ini hanya untuk Administrator.' }, 403)
  }
  await next()
}

// GET /api/materi/media/:blockId - Stream binary blob (Public, so elements like <img> and <audio> can load it)
materi.get('/media/:blockId', async (c: any) => {
  try {
    const blockId = c.req.param('blockId')
    const [block] = await db.select().from(materialBlocks).where(eq(materialBlocks.id, blockId)).limit(1)
    
    if (!block || !block.mediaBlob) {
      return c.json({ error: 'Media tidak ditemukan.' }, 404)
    }

    const mimeType = block.mediaType || 'application/octet-stream'

    // Return the blob as a binary body
    return new Response(block.mediaBlob as any, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000',
      }
    })
  } catch (error: any) {
    console.error('Error serving media:', error)
    return c.json({ error: 'Gagal memuat media dari server.' }, 500)
  }
})

// Apply auth to all subsequent routes
materi.use('*', authMiddleware)

// GET /api/materi - List all materials metadata
materi.get('/', async (c: any) => {
  try {
    const allMaterials = await db.select({
      id: materials.id,
      title: materials.title,
      createdAt: materials.createdAt,
      updatedAt: materials.updatedAt,
      sortOrder: materials.sortOrder
    }).from(materials)
    
    // Sort by sortOrder ascending, fallback to createdAt descending
    allMaterials.sort((a, b) => {
      const orderA = a.sortOrder ?? 0
      const orderB = b.sortOrder ?? 0
      if (orderA !== orderB) {
        return orderA - orderB
      }
      return b.createdAt.localeCompare(a.createdAt)
    })

    return c.json(allMaterials)
  } catch (error: any) {
    console.error('Error fetching materials:', error)
    return c.json({ error: 'Gagal mengambil data materi.' }, 500)
  }
})

// PUT /api/materi/reorder - Update materials sort order (Admin only)
materi.put('/reorder', adminMiddleware, async (c: any) => {
  try {
    const body = await c.req.json()
    const { ids } = body // Expected: { ids: ["mat-1", "mat-2", ...] }

    if (!ids || !Array.isArray(ids)) {
      return c.json({ error: 'Data tidak valid. Harus menyertakan array ids.' }, 400)
    }

    // Update each material's sortOrder matching its index in the array
    for (let i = 0; i < ids.length; i++) {
      await db.update(materials)
        .set({ sortOrder: i })
        .where(eq(materials.id, ids[i]))
    }

    return c.json({ success: true, message: 'Urutan materi berhasil diperbarui.' })
  } catch (error: any) {
    console.error('Error reordering materials:', error)
    return c.json({ error: `Gagal memperbarui urutan materi: ${error.message}` }, 500)
  }
})

// GET /api/materi/:id - Get material detail and its blocks (no mediaBlob payloads, only URLs)
materi.get('/:id', async (c: any) => {
  try {
    const id = c.req.param('id')
    const [item] = await db.select().from(materials).where(eq(materials.id, id)).limit(1)

    if (!item) {
      return c.json({ error: 'Materi tidak ditemukan.' }, 404)
    }

    const blocks = await db.select({
      id: materialBlocks.id,
      type: materialBlocks.type,
      textContent: materialBlocks.textContent,
      mediaType: materialBlocks.mediaType,
      sortOrder: materialBlocks.sortOrder
    }).from(materialBlocks).where(eq(materialBlocks.materialId, id))

    blocks.sort((a, b) => a.sortOrder - b.sortOrder)

    const parsedBlocks = blocks.map(block => {
      if (block.type === 'image' || block.type === 'audio') {
        return {
          id: block.id,
          type: block.type,
          mediaType: block.mediaType,
          mediaUrl: `/api/materi/media/${block.id}`,
          textContent: block.textContent,
          sortOrder: block.sortOrder
        }
      }
      return {
        id: block.id,
        type: block.type,
        textContent: block.textContent,
        sortOrder: block.sortOrder
      }
    })

    return c.json({
      id: item.id,
      title: item.title,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      blocks: parsedBlocks
    })
  } catch (error: any) {
    console.error('Error fetching material detail:', error)
    return c.json({ error: 'Gagal mengambil detail materi.' }, 500)
  }
})

// POST /api/materi - Create new material (Admin only)
materi.post('/', adminMiddleware, async (c: any) => {
  try {
    const body = await c.req.parseBody()
    const title = body['title'] as string
    const blocksStr = body['blocks'] as string

    if (!title || !blocksStr) {
      return c.json({ error: 'Data materi tidak lengkap.' }, 400)
    }

    const blocks = JSON.parse(blocksStr)
    const materialId = `mat-${Date.now()}`
    
    // Format timestamp
    const now = new Date()
    const nowStr = now.toLocaleDateString('id-ID') + ' ' + now.toLocaleTimeString('id-ID')

    await db.insert(materials).values({
      id: materialId,
      title,
      createdAt: nowStr,
      updatedAt: nowStr
    })

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i]
      const blockId = b.id || `blk-${Date.now()}-${i}`

      let mediaBuffer: Buffer | null = null;
      let mediaType: string | null = null;

      if (b.type === 'image' || b.type === 'audio') {
        const fileKey = b.fileKey || `file_${b.id}`
        const file = body[fileKey] as File | undefined
        
        if (file && file.size > 0) {
          const arrayBuffer = await file.arrayBuffer()
          mediaBuffer = Buffer.from(arrayBuffer)
          mediaType = file.type
        }
      }

      await db.insert(materialBlocks).values({
        id: blockId,
        materialId,
        type: b.type,
        textContent: b.textContent || null,
        mediaBlob: mediaBuffer,
        mediaType: mediaType,
        sortOrder: i
      })
    }

    return c.json({ success: true, materialId, message: 'Materi berhasil dibuat.' })
  } catch (error: any) {
    console.error('Error creating material:', error)
    return c.json({ error: `Gagal membuat materi: ${error.message}` }, 500)
  }
})

// PUT /api/materi/:id - Update material (Admin only)
materi.put('/:id', adminMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.parseBody()
    const title = body['title'] as string
    const blocksStr = body['blocks'] as string

    if (!title || !blocksStr) {
      return c.json({ error: 'Data pembaruan tidak lengkap.' }, 400)
    }

    const [existingMaterial] = await db.select().from(materials).where(eq(materials.id, id)).limit(1)
    if (!existingMaterial) {
      return c.json({ error: 'Materi tidak ditemukan.' }, 404)
    }

    const blocks = JSON.parse(blocksStr)
    const now = new Date()
    const nowStr = now.toLocaleDateString('id-ID') + ' ' + now.toLocaleTimeString('id-ID')

    // Update title and updatedAt
    await db.update(materials).set({
      title,
      updatedAt: nowStr
    }).where(eq(materials.id, id))

    // Fetch existing blocks to see if we can reuse media blobs
    const existingBlocks = await db.select().from(materialBlocks).where(eq(materialBlocks.materialId, id))
    const existingBlocksMap = new Map(existingBlocks.map(eb => [eb.id, eb]))

    // Delete old blocks
    await db.delete(materialBlocks).where(eq(materialBlocks.materialId, id))

    // Re-insert blocks
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i]
      const blockId = b.id

      let mediaBuffer: Buffer | null = null;
      let mediaType: string | null = null;

      const fileKey = b.fileKey || `file_${b.id}`
      const file = body[fileKey] as File | undefined

      if (file && file.size > 0) {
        // New file uploaded for block
        const arrayBuffer = await file.arrayBuffer()
        mediaBuffer = Buffer.from(arrayBuffer)
        mediaType = file.type
      } else if (b.keepExisting && existingBlocksMap.has(blockId)) {
        // Reuse old media blob
        const oldBlock = existingBlocksMap.get(blockId)!
        mediaBuffer = oldBlock.mediaBlob as Buffer
        mediaType = oldBlock.mediaType
      }

      await db.insert(materialBlocks).values({
        id: blockId,
        materialId: id,
        type: b.type,
        textContent: b.textContent || null,
        mediaBlob: mediaBuffer,
        mediaType: mediaType,
        sortOrder: i
      })
    }

    return c.json({ success: true, message: 'Materi berhasil diperbarui.' })
  } catch (error: any) {
    console.error('Error updating material:', error)
    return c.json({ error: `Gagal memperbarui materi: ${error.message}` }, 500)
  }
})

// DELETE /api/materi/:id - Delete material (Admin only)
materi.delete('/:id', adminMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id')
    const [existingMaterial] = await db.select().from(materials).where(eq(materials.id, id)).limit(1)

    if (!existingMaterial) {
      return c.json({ error: 'Materi tidak ditemukan.' }, 404)
    }

    await db.delete(materials).where(eq(materials.id, id))
    return c.json({ success: true, message: 'Materi berhasil dihapus.' })
  } catch (error: any) {
    console.error('Error deleting material:', error)
    return c.json({ error: `Gagal menghapus materi: ${error.message}` }, 500)
  }
})

export default materi
