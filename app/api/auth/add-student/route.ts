import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { name, rollNo, division, email, password } = await request.json()

    if (!name || !rollNo || !division || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, roll number, division, email, and password are required" },
        { status: 400 }
      )
    }

    const db = getDb()

    // Check if rollno exists
    const check1 = await db.query("SELECT id FROM students WHERE UPPER(roll_no) = UPPER($1)", [rollNo.trim()])
    if (check1.rowCount && check1.rowCount > 0) {
      return NextResponse.json(
        { success: false, message: "A student with this roll number already exists" },
        { status: 409 }
      )
    }
    
    // Check if email exists
    const check2 = await db.query("SELECT id FROM students WHERE LOWER(email) = LOWER($1)", [email.trim()])
    if (check2.rowCount && check2.rowCount > 0) {
      return NextResponse.json(
        { success: false, message: "A student with this email address already exists" },
        { status: 409 }
      )
    }

    // Insert
    await db.query(
      "INSERT INTO students (name, roll_no, password, division, email) VALUES ($1, $2, $3, $4, $5)",
      [name.trim(), rollNo.trim().toUpperCase(), password.trim(), division.trim().toUpperCase(), email.trim().toLowerCase()]
    )

    return NextResponse.json({
      success: true,
      message: "Student added successfully",
    })
  } catch (error) {
    console.error("Add student error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
