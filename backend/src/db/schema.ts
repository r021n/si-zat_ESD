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
  questionType: text('question_type'),
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

export const menuClicks = sqliteTable('menu_clicks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  menuKey: text('menu_key').notNull(),
  count: integer('count').default(0).notNull(),
})

export const accessControls = sqliteTable('access_controls', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  isLocked: integer('is_locked').default(0).notNull(), // 0 = false, 1 = true
  isScheduleEnabled: integer('is_schedule_enabled').default(0).notNull(), // 0 = false, 1 = true
  schedules: text('schedules').default('[]').notNull(), // JSON string representing ScheduleItem[]
})



