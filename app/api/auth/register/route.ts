import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { name, rollNo, email, password, division } = await request.json()

    if (!name || !rollNo || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, roll number, email, and password are required" },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    if (password.trim().length < 4) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 4 characters" },
        { status: 400 }
      )
    }

    const db = getDb()

    // Check if roll number already exists
    const existingRollNo = db
      .prepare("SELECT id FROM students WHERE UPPER(roll_no) = UPPER(?)")
      .get(rollNo.trim())

    if (existingRollNo) {
      return NextResponse.json(
        { success: false, message: "A student with this roll number already exists" },
        { status: 409 }
      )
    }

    // Check if email already exists
    const existingEmail = db
      .prepare("SELECT id FROM students WHERE LOWER(email) = LOWER(?)")
      .get(email.trim())

    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: "A student with this email already exists" },
        { status: 409 }
      )
    }

    // Insert the new student
    db.prepare(
      "INSERT INTO students (name, roll_no, email, password, division) VALUES (?, ?, ?, ?, ?)"
    ).run(
      name.trim(),
      rollNo.trim().toUpperCase(),
      email.trim().toLowerCase(),
      password.trim(),
      (division || "A").trim().toUpperCase()
    )

    return NextResponse.json({
      success: true,
      message: "Registration successful! You can now log in.",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
