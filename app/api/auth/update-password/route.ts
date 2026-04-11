import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { rollNo, oldPassword, newPassword } = await request.json()

    if (!rollNo || !oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Roll number, old password, and new password are required" },
        { status: 400 }
      )
    }

    const db = getDb()

    // Verify the student exists and old password matches
    const student = db
      .prepare(
        "SELECT id FROM students WHERE UPPER(roll_no) = UPPER(?) AND UPPER(password) = UPPER(?)"
      )
      .get(rollNo.trim(), oldPassword.trim())

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Invalid roll number or current password" },
        { status: 401 }
      )
    }

    // Update the password
    db.prepare(
      "UPDATE students SET password = ? WHERE UPPER(roll_no) = UPPER(?)"
    ).run(newPassword.trim().toUpperCase(), rollNo.trim())

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Update password error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
