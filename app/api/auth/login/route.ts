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

    // 1. Look up the student by email ONLY (case-insensitive)
    const result = await db.query(
      "SELECT id, name, roll_no, division, password FROM students WHERE LOWER(email) = LOWER($1)",
      [email.trim()]
    )
    
    const student = result.rows[0]

    // 2. If the email is not found at all
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Not a registered email" },
        { status: 404 }
      )
    }

    // 3. If the email exists, but the password does not match
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
