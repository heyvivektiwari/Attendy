import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { name, rollNo, password, division } = await request.json()

    if (!name || !rollNo) {
      return NextResponse.json(
        { success: false, message: "Name and roll number are required" },
        { status: 400 }
      )
    }

    const db = getDb()

    // Check if student already exists
    const existing = db
      .prepare("SELECT id FROM students WHERE UPPER(roll_no) = UPPER(?)")
      .get(rollNo.trim())

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Student with roll number ${rollNo} already exists` },
        { status: 409 }
      )
    }

    // Insert the new student (password defaults to roll number if not provided)
    db.prepare(
      "INSERT INTO students (name, roll_no, password, division) VALUES (?, ?, ?, ?)"
    ).run(
      name.trim(),
      rollNo.trim().toUpperCase(),
      (password || rollNo).trim().toUpperCase(),
      (division || "A").trim().toUpperCase()
    )

    return NextResponse.json({
      success: true,
      message: `Student ${name} (${rollNo}) added successfully`,
    })
  } catch (error) {
    console.error("Add student error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
