import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/mail"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    const db = getDb()

    // Look up student by email
    const student = db
      .prepare("SELECT id, name, email FROM students WHERE LOWER(email) = LOWER(?)")
      .get(email.trim()) as { id: number; name: string; email: string } | undefined

    if (!student) {
      // Don't reveal whether the email exists — always show success
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      })
    }

    // Generate a secure token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = Date.now() + 60 * 60 * 1000 // 1 hour from now

    // Save token to database
    db.prepare(
      "UPDATE students SET reset_token = ?, reset_token_expires = ? WHERE id = ?"
    ).run(resetToken, expiresAt, student.id)

    // Send the reset email
    try {
      await sendPasswordResetEmail(student.email, student.name, resetToken)
    } catch (emailError) {
      console.error("Failed to send email:", emailError)
      return NextResponse.json(
        { success: false, message: "Failed to send reset email. Please check SMTP configuration." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
