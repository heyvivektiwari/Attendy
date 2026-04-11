import { Pool } from "pg"

let pool: Pool | null = null

export function getDb(): Pool {
  if (pool) return pool

  // The 'pg' package with some Supabase/Neon poolers on Vercel requires SSL 
  // without certificate validation. We set this here only when connecting.
  if (typeof process !== "undefined" && process.env) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
  }

  const connectionString = process.env.DATABASE_URL?.trim()

  if (!connectionString) {
    const errorMsg = "Critical Deployment Error: DATABASE_URL is missing or empty in Vercel environment variables."
    console.error(errorMsg)
    throw new Error(errorMsg)
  }

  pool = new Pool({
    connectionString: connectionString,
    max: 1, // Minimize connections in serverless environment
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

