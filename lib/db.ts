import { Pool } from "pg"

let pool: Pool | null = null

export function getDb(): Pool {
  if (pool) return pool

  if (!process.env.DATABASE_URL) {
    throw new Error("Critical Error: DATABASE_URL is missing in environment variables. Please add it to Vercel settings.")
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000, // Timeout after 5 seconds to prevent hanging
    // Add sslmode=require if it isn't in the connection string, required by Supabase
    ssl: {
      rejectUnauthorized: false
    }
  })

  // Start initialization in background
  initializeDb().catch(console.error)

  return pool
}

export async function initializeDb() {
  const db = getDb()

  try {
    // Create students table if it doesn't natively exist yet
    await db.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        roll_no VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255) NOT NULL,
        division VARCHAR(255) NOT NULL,
        reset_token VARCHAR(255),
        reset_token_expires BIGINT
      )
    `)
  } catch (error) {
    console.error("Database initialization failed:", error)
  }
}

export type Student = {
  id: number
  name: string
  roll_no: string
  email?: string
  password?: string
  division: string
  reset_token?: string
  reset_token_expires?: number
}

