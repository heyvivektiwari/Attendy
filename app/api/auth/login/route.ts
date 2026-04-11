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
    const student = db
      .prepare(
        "SELECT id, name, roll_no, division FROM students WHERE LOWER(email) = LOWER(?) AND password = ?"
      )
      .get(email.trim(), password.trim()) as
      | { id: number; name: string; roll_no: string; division: string }
      | undefined

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
