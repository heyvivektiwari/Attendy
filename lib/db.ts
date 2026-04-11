import { Pool } from "pg"

let pool: Pool | null = null

export function getDb(): Pool {
  if (pool) return pool

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Add sslmode=require if it isn't in the connection string, required by Supabase
    ssl: {
      rejectUnauthorized: false
    }
  })

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

// Fire and forget initialization to ensure the table structure exists in Supabase.
initializeDb().catch(console.error)
