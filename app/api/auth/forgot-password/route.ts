import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/mail"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email address is required" },
        { status: 400 }
      )
    }

    const db = getDb()

    // 1. Check if user exists
    const result = await db.query(
      "SELECT id, name FROM students WHERE LOWER(email) = LOWER($1)",
      [email.trim()]
    )
    const student = result.rows[0]

    // For security reasons, don't expose whether the email exists or not
    if (student) {
      // 2. Generate a secure random token
      const resetToken = crypto.randomBytes(32).toString("hex")
      
      // Token expires in 1 hour (in milliseconds)
      const tokenExpires = Date.now() + 3600000

      // 3. Save token to database
      await db.query(
        "UPDATE students SET reset_token = $1, reset_token_expires = $2 WHERE id = $3",
        [resetToken, tokenExpires, student.id]
      )

      // 4. Send the email - fixing argument mismatch (added student.name)
      await sendPasswordResetEmail(email.trim(), student.name, resetToken)
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, we have sent a password reset link.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
