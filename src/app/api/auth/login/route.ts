import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      )
    }

    const db = getDb()

    const result = await db.query(
      "SELECT id, name, roll_no, division, password, COALESCE(branch, 'Computer') as branch FROM students WHERE LOWER(email) = LOWER($1)",
      [email.trim()]
    )
    
    const student = result.rows[0]

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Not a registered email" },
        { status: 404 }
      )
    }

    if (student.password !== password.trim()) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      student: {
        id: student.id,
        name: student.name,
        rollNo: student.roll_no,
        division: student.division,
        branch: student.branch || "Computer",
      },
    })
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
