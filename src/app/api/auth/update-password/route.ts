import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { rollNo, newPassword } = await request.json()

    if (!rollNo || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Roll number and new password are required" },
        { status: 400 }
      )
    }

    const db = getDb()

    // Assuming we want to update the password where the rollNo matches
    const result = await db.query(
      "UPDATE students SET password = $1 WHERE UPPER(roll_no) = UPPER($2)",
      [newPassword.trim(), rollNo.trim()]
    )

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      )
    }

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
