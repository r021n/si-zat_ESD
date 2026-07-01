import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  kelas: text('kelas').notNull(),
  password: text('password').notNull(),
  nama: text('nama').default(''),
  status: text('status').default('siswa'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  openCount: integer('open_count').default(0).notNull(),
  totalUsageTime: integer('total_usage_time').default(0).notNull(),
})

export const quizzes = sqliteTable('quizzes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: text('created_at').notNull(),
})

export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  quizId: text('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  options: text('options').notNull(), // JSON string array
  correctAnswers: text('correct_answers').notNull(), // JSON number array
  images: text('images').notNull(), // JSON string array
  sortOrder: integer('sort_order').notNull(),
})

export const submissions = sqliteTable('submissions', {
  id: text('id').primaryKey(),
  quizId: text('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  studentName: text('student_name').notNull(),
  studentClass: text('student_class').notNull(),
  answers: text('answers').notNull(), // JSON record mapping questionId -> number[]
  score: integer('score').notNull(),
  duration: integer('duration'),
  createdAt: text('created_at').notNull(),
})

export const materials = sqliteTable('materials', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  sortOrder: integer('sort_order').default(0),
})

export const materialBlocks = sqliteTable('material_blocks', {
  id: text('id').primaryKey(),
  materialId: text('material_id').notNull().references(() => materials.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'text' | 'image' | 'audio'
  textContent: text('text_content'),
  mediaBlob: blob('media_blob', { mode: 'buffer' }),
  mediaType: text('media_type'),
  sortOrder: integer('sort_order').notNull(),
})

export const taskSubmissions = sqliteTable('task_submissions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  studentName: text('student_name').notNull(),
  studentClass: text('student_class').notNull(),
  title: text('title').notNull(),
  answer: text('answer').notNull(),
  fileName: text('file_name').default(''),
  imageBlob: blob('image_blob', { mode: 'buffer' }),
  imageType: text('image_type'),
  submittedAt: text('submitted_at').notNull(),
})

export const taskDiscussions = sqliteTable('task_discussions', {
  id: text('id').primaryKey(),
  taskSubmissionId: text('task_submission_id').notNull().references(() => taskSubmissions.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  senderName: text('sender_name').notNull(),
  senderRole: text('sender_role').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
})

