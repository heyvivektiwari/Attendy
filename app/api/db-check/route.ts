import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  try {
    const db = getDb()
    const result = await db.query("SELECT id, name, email FROM students")
    return NextResponse.json({
      databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 45) + "..." : "missing",
      students: result.rows
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
