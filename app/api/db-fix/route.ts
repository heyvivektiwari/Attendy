import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  try {
    const db = getDb()
    
    // Update id 1 to Vivek Tiwari
    const result = await db.query(
      "UPDATE students SET name = $1 WHERE email = $2 RETURNING id, name, email",
      ["Vivek Tiwari", "heyvivektiwari@gmail.com"]
    )
    
    return NextResponse.json({
      success: true,
      message: "Successfully updated student name in production database",
      updatedUser: result.rows
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
