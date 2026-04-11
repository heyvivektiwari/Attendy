import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Token and new password are required" },
        { status: 400 }
      )
    }

    if (newPassword.trim().length < 4) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 4 characters" },
        { status: 400 }
      )
    }

    const db = getDb()

    // Find the student with this token
    const student = db
      .prepare(
        "SELECT id, reset_token_expires FROM students WHERE reset_token = ?"
      )
      .get(token) as { id: number; reset_token_expires: number } | undefined

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset link" },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (Date.now() > student.reset_token_expires) {
      // Clear the expired token
      db.prepare(
        "UPDATE students SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?"
      ).run(student.id)

      return NextResponse.json(
        { success: false, message: "This reset link has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Update password and clear token
    db.prepare(
      "UPDATE students SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?"
    ).run(newPassword.trim(), student.id)

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. You can now log in with your new password.",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
