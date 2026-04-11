import { Pool } from "pg"

let pool: Pool | null = null

export function getDb(): Pool {
  if (pool) return pool

  // Force bypass SSL certificate validation for serverless connection to Supabase
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
    throw new Error("Critical Error: DATABASE_URL is missing or empty in environment variables. Please add it to Vercel settings.")
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
    ssl: {
      rejectUnauthorized: false, // This allows the self-signed certificate from the pooler
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

