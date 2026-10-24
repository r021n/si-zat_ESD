import { test, describe, before, beforeEach } from 'node:test'
import assert from 'node:assert'
import { db } from '../db/index.js'
import { quizzes, questions, questionImages, users } from '../db/schema.js'
import { eq, sql } from 'drizzle-orm'
import { processQuestionImages, ensureQuestionImagesTable } from './quiz.js'
import quizApp from './quiz.js'
import { sign } from 'hono/jwt'

describe('Quiz Route & Image Persistence Tests', () => {
  let adminToken: string
  const base64Pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

  before(async () => {
    // Initialize required tables in memory test db
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        kelas TEXT NOT NULL,
        password TEXT NOT NULL,
        nama TEXT DEFAULT '',
        sekolah TEXT DEFAULT '',
        status TEXT DEFAULT 'siswa',
        created_at INTEGER,
        open_count INTEGER DEFAULT 0 NOT NULL,
        total_usage_time INTEGER DEFAULT 0 NOT NULL
      )
    `)

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        kkm INTEGER
      )
    `)

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY NOT NULL,
        quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_answers TEXT NOT NULL,
        images TEXT NOT NULL,
        question_type TEXT,
        sort_order INTEGER NOT NULL
      )
    `)

    await ensureQuestionImagesTable()

    // Create mock admin user
    await db.run(sql`DELETE FROM users WHERE email = 'admin@test.com'`)
    const [adminUser] = await db.insert(users).values({
      email: 'admin@test.com',
      kelas: 'Guru',
      password: 'hashedpassword',
      nama: 'Pak Guru',
      status: 'admin',
    }).returning()

    adminToken = await sign({ id: adminUser.id, email: adminUser.email }, process.env.JWT_SECRET || 'sizatesdsecret', 'HS256')
  })

  beforeEach(async () => {
    await db.run(sql`DELETE FROM question_images`)
    await db.run(sql`DELETE FROM questions`)
    await db.run(sql`DELETE FROM quizzes`)
  })

  test('POST / - successfully creates quiz with image without foreign key constraint error', async () => {
    const quizId = 'quiz-test-post-1'
    const payload = {
      id: quizId,
      title: 'Kuis IPA Baru',
      createdAt: '2026-10-24',
      questions: [
        {
          id: 'q-post-1',
          text: 'Perhatikan gambar berikut ini:',
          options: ['Pilihan A', 'Pilihan B'],
          correctAnswers: [0],
          images: [base64Pixel],
          questionType: 'C1'
        }
      ]
    }

    const res = await quizApp.request('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    })

    assert.strictEqual(res.status, 200)
    const json = await res.json()
    assert.strictEqual(json.success, true)

    // Check DB records
    const storedQuestions = await db.select().from(questions).where(eq(questions.quizId, quizId))
    assert.strictEqual(storedQuestions.length, 1)

    const parsedImages = JSON.parse(storedQuestions[0].images)
    assert.strictEqual(parsedImages.length, 1)
    assert.match(parsedImages[0], /^\/api\/quiz\/images\/qi-q-post-1-0-/)

    const storedImages = await db.select().from(questionImages)
    assert.strictEqual(storedImages.length, 1)
    assert.strictEqual(storedImages[0].questionId, 'q-post-1')
  })

  test('PUT /:id - successfully updates quiz and preserves existing images without cascade deletion', async () => {
    // 1. Create quiz with image first
    const quizId = 'quiz-update-test'
    const qId = 'q-preserve-1'
    await db.insert(quizzes).values({ id: quizId, title: 'Kuis Asli', createdAt: '2026-10-24' })
    await db.insert(questions).values({
      id: qId,
      quizId,
      text: 'Teks Asli',
      options: JSON.stringify(['A', 'B']),
      correctAnswers: JSON.stringify([0]),
      images: '[]',
      questionType: 'C1',
      sortOrder: 0
    })

    const processed = await processQuestionImages(qId, [base64Pixel])
    await db.update(questions).set({ images: JSON.stringify(processed) }).where(eq(questions.id, qId))
    const existingImageUrl = processed[0]

    // 2. Perform PUT update preserving the existing image
    const updatePayload = {
      title: 'Kuis Asli (Judul Diperbarui)',
      questions: [
        {
          id: qId,
          text: 'Teks Soal Diperbarui',
          options: ['A (revisi)', 'B'],
          correctAnswers: [0],
          images: [existingImageUrl], // Preserved existing image
          questionType: 'C1'
        }
      ]
    }

    const res = await quizApp.request(`/${quizId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(updatePayload)
    })

    assert.strictEqual(res.status, 200)
    const json = await res.json()
    assert.strictEqual(json.success, true)

    // Verify existing image was NOT wiped by cascade delete
    const match = existingImageUrl.match(/\/api\/quiz\/images\/([^/?#]+)/)
    assert.ok(match, 'Image URL should match pattern')
    const imgId = match![1]

    const imgCheck = await db.select().from(questionImages).where(eq(questionImages.id, imgId))
    assert.strictEqual(imgCheck.length, 1, 'Existing image must still exist in DB')
  })

  test('PUT /:id - successfully adds a new question with a new image on update', async () => {
    const quizId = 'quiz-add-q'
    await db.insert(quizzes).values({ id: quizId, title: 'Kuis Singkat', createdAt: '2026-10-24' })
    await db.insert(questions).values({
      id: 'q-existing',
      quizId,
      text: 'Soal Lama',
      options: JSON.stringify(['A', 'B']),
      correctAnswers: JSON.stringify([0]),
      images: '[]',
      questionType: 'C1',
      sortOrder: 0
    })

    const updatePayload = {
      title: 'Kuis Ditambah Soal',
      questions: [
        {
          id: 'q-existing',
          text: 'Soal Lama Diupdate',
          options: ['A', 'B'],
          correctAnswers: [0],
          images: [],
          questionType: 'C1'
        },
        {
          id: 'q-brand-new',
          text: 'Soal Baru dengan Gambar',
          options: ['X', 'Y'],
          correctAnswers: [1],
          images: [base64Pixel],
          questionType: 'C2'
        }
      ]
    }

    const res = await quizApp.request(`/${quizId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(updatePayload)
    })

    assert.strictEqual(res.status, 200)
    const json = await res.json()
    assert.strictEqual(json.success, true)

    const allQ = await db.select().from(questions).where(eq(questions.quizId, quizId))
    assert.strictEqual(allQ.length, 2)

    const newQ = allQ.find(q => q.id === 'q-brand-new')
    assert.ok(newQ)
    const newImgs = JSON.parse(newQ!.images)
    assert.strictEqual(newImgs.length, 1)
    assert.match(newImgs[0], /^\/api\/quiz\/images\/qi-q-brand-new-0-/)
  })

  test('PUT /:id - removes orphaned images when question removes an image', async () => {
    const quizId = 'quiz-orphan-test'
    const qId = 'q-orphan-1'
    await db.insert(quizzes).values({ id: quizId, title: 'Kuis Hapus Gambar', createdAt: '2026-10-24' })
    await db.insert(questions).values({
      id: qId,
      quizId,
      text: 'Soal ini awalnya bergambar',
      options: JSON.stringify(['A', 'B']),
      correctAnswers: JSON.stringify([0]),
      images: '[]',
      questionType: 'C1',
      sortOrder: 0
    })

    const processed = await processQuestionImages(qId, [base64Pixel])
    await db.update(questions).set({ images: JSON.stringify(processed) }).where(eq(questions.id, qId))
    assert.strictEqual((await db.select().from(questionImages)).length, 1)

    // Now update without images
    const updatePayload = {
      title: 'Kuis Hapus Gambar',
      questions: [
        {
          id: qId,
          text: 'Soal ini sekarang tidak bergambar',
          options: ['A', 'B'],
          correctAnswers: [0],
          images: [],
          questionType: 'C1'
        }
      ]
    }

    const res = await quizApp.request(`/${quizId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(updatePayload)
    })

    assert.strictEqual(res.status, 200)
    const storedImages = await db.select().from(questionImages)
    assert.strictEqual(storedImages.length, 0, 'Orphaned image must be deleted')
  })
})
