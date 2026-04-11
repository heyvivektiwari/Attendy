import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

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

    // Look up the student by email (case-insensitive)
    const result = await db.query(
      "SELECT id, name, roll_no, division FROM students WHERE LOWER(email) = LOWER($1) AND password = $2",
      [email.trim(), password.trim()]
    )
    
    const student = result.rows[0]

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      student: {
        name: student.name,
        rollNo: student.roll_no,
        division: student.division,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
