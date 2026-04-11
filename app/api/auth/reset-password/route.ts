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

    // 1. Find user by valid token
    const result = await db.query(
      "SELECT id, reset_token_expires FROM students WHERE reset_token = $1",
      [token]
    )
    const student = result.rows[0]

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // 2. Check if token is expired
    if (Date.now() > Number(student.reset_token_expires)) {
      return NextResponse.json(
        { success: false, message: "Reset token has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // 3. Update password and clear the token so it can't be reused
    await db.query(
      "UPDATE students SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2",
      [newPassword.trim(), student.id]
    )

    return NextResponse.json({
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
