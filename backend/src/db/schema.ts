import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  kelas: text('kelas').notNull(),
  password: text('password').notNull(),
  nama: text('nama').default(''),
  status: text('status').default('siswa'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
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
  createdAt: text('created_at').notNull(),
})