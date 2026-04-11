import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function DELETE(request: NextRequest) {
  try {
    const { email, rollNo } = await request.json()

    if (!email && !rollNo) {
      return NextResponse.json(
        { success: false, message: "Either email or roll number must be provided" },
        { status: 400 }
      )
    }

    const db = getDb()
    let result

    // Delete by email or roll number
    if (email) {
      result = await db.query("DELETE FROM students WHERE LOWER(email) = LOWER($1)", [email.trim()])
    } else {
      result = await db.query("DELETE FROM students WHERE UPPER(roll_no) = UPPER($1)", [rollNo.trim()])
    }

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Student successfully removed from the database",
    })
  } catch (error) {
    console.error("Remove student error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
