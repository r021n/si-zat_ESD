import { verify } from "hono/jwt";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";

export const getJwtSecret = () => process.env.JWT_SECRET || "sizatesdsecret";

// Safe auto-creation of tables if they don't exist yet
let tablesInitialized = false;
export async function ensureTables() {
  if (tablesInitialized) return;
  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        problem TEXT NOT NULL DEFAULT '',
        question TEXT NOT NULL DEFAULT '',
        task_info TEXT NOT NULL DEFAULT '',
        instruction TEXT NOT NULL DEFAULT '',
        author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        author_name TEXT NOT NULL DEFAULT 'Guru',
        image_blob BLOB,
        image_type TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT
      )
    `);
    try {
      await db.run(sql`ALTER TABLE announcements ADD COLUMN image_blob BLOB`);
    } catch {}
    try {
      await db.run(sql`ALTER TABLE announcements ADD COLUMN image_type TEXT`);
    } catch {}
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS announcement_submissions (
        id TEXT PRIMARY KEY,
        announcement_id TEXT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        student_name TEXT NOT NULL,
        student_class TEXT NOT NULL,
        answer TEXT NOT NULL,
        file_name TEXT DEFAULT '',
        image_blob BLOB,
        image_type TEXT,
        submitted_at TEXT NOT NULL,
        grade INTEGER,
        feedback TEXT,
        graded_at TEXT,
        graded_by TEXT
      )
    `);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS announcement_discussions (
        id TEXT PRIMARY KEY,
        announcement_id TEXT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender_name TEXT NOT NULL,
        sender_role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS announcement_submission_comments (
        id TEXT PRIMARY KEY,
        submission_id TEXT NOT NULL REFERENCES announcement_submissions(id) ON DELETE CASCADE,
        announcement_id TEXT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_name TEXT NOT NULL,
        user_role TEXT NOT NULL DEFAULT 'SISWA',
        user_class TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
    tablesInitialized = true;
  } catch (err) {
    console.error("Error ensuring announcement tables:", err);
  }
}

// Middleware: Authenticate user
export async function authMiddleware(c: any, next: any) {
  await ensureTables();
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { error: "Tidak terautentikasi. Token tidak ditemukan." },
      401,
    );
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = await verify(token, getJwtSecret(), "HS256");
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        kelas: users.kelas,
        nama: users.nama,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, payload.id as number))
      .limit(1);

    if (!user) {
      return c.json({ error: "Pengguna tidak ditemukan." }, 401);
    }

    c.set("user", user);
    await next();
  } catch {
    return c.json({ error: "Sesi kedaluwarsa atau token tidak valid." }, 401);
  }
}

// Middleware: Ensure user is Admin
export async function adminMiddleware(c: any, next: any) {
  await ensureTables();
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { error: "Tidak terautentikasi. Token tidak ditemukan." },
      401,
    );
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = await verify(token, getJwtSecret(), "HS256");
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        kelas: users.kelas,
        nama: users.nama,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, payload.id as number))
      .limit(1);

    if (!user) {
      return c.json({ error: "Pengguna tidak ditemukan." }, 401);
    }

    const isAdmin =
      (user.status || "").toLowerCase() === "admin" ||
      user.email.toLowerCase().includes("admin");
    if (!isAdmin) {
      return c.json(
        { error: "Akses ditolak. Fitur ini hanya untuk Administrator/Guru." },
        403,
      );
    }

    c.set("user", user);
    await next();
  } catch {
    return c.json({ error: "Sesi kedaluwarsa atau token tidak valid." }, 401);
  }
}
