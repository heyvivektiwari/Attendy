import Database from "better-sqlite3"
import path from "path"

const DB_PATH = path.join(process.cwd(), "attendy.db")

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma("journal_mode = WAL")
    initializeDb(db)
  }
  return db
}

function initializeDb(db: Database.Database) {
  // Create students table with email, reset token support
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      roll_no TEXT NOT NULL UNIQUE,
      email TEXT UNIQUE,
      password TEXT NOT NULL,
      division TEXT NOT NULL DEFAULT 'A',
      reset_token TEXT,
      reset_token_expires INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Add email column if it doesn't exist (migration for existing DBs)
  try {
    db.exec(`ALTER TABLE students ADD COLUMN email TEXT UNIQUE`)
  } catch {
    // Column already exists, ignore
  }
  try {
    db.exec(`ALTER TABLE students ADD COLUMN reset_token TEXT`)
  } catch {
    // Column already exists, ignore
  }
  try {
    db.exec(`ALTER TABLE students ADD COLUMN reset_token_expires INTEGER`)
  } catch {
    // Column already exists, ignore
  }

  // No initial seed data; start completely clean.
}

export type Student = {
  id: number
  name: string
  roll_no: string
  email: string | null
  division: string
}
