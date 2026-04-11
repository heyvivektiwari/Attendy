import { Pool } from "pg"

// Force bypass SSL certificate validation globally for this server instance
// This is required for some Supabase connection poolers on Vercel
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

let pool: Pool | null = null

export function getDb(): Pool {
  if (pool) return pool

  const connectionString = process.env.DATABASE_URL?.trim()

  if (!connectionString) {
    throw new Error("Critical Error: DATABASE_URL is missing or empty. Please check Vercel environment variables.")
  }

  pool = new Pool({
    connectionString: connectionString,
    max: 1,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    ssl: {
      rejectUnauthorized: false
    }
  })

  return pool
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

