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
    const rollCheck = await db.query(
      "SELECT id FROM students WHERE UPPER(roll_no) = UPPER($1)",
      [rollNo.trim()]
    )

    if (rollCheck.rowCount && rollCheck.rowCount > 0) {
      return NextResponse.json(
        { success: false, message: "A student with this roll number already exists" },
        { status: 409 }
      )
    }

    // Check if email already exists
    const emailCheck = await db.query(
      "SELECT id FROM students WHERE LOWER(email) = LOWER($1)",
      [email.trim()]
    )

    if (emailCheck.rowCount && emailCheck.rowCount > 0) {
      return NextResponse.json(
        { success: false, message: "A student with this email already exists" },
        { status: 409 }
      )
    }

    // Insert the new student
    await db.query(
      "INSERT INTO students (name, roll_no, email, password, division) VALUES ($1, $2, $3, $4, $5)",
      [
        name.trim(),
        rollNo.trim().toUpperCase(),
        email.trim().toLowerCase(),
        password.trim(),
        (division || "A").trim().toUpperCase()
      ]
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
