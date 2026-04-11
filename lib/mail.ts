import nodemailer from "nodemailer"

// Configure your SMTP settings in .env.local
// SMTP_HOST=smtp.gmail.com
// SMTP_PORT=587
// SMTP_USER=your-email@gmail.com
// SMTP_PASS=your-app-password
// APP_URL=http://localhost:3000

let transporter: nodemailer.Transporter

async function getTransporter() {
  if (transporter) return transporter

  // Use real SMTP if configured
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  } else {
    // Fallback to Ethereal test account for local development
    console.log("No SMTP credentials found. Creating Ethereal test account...")
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
  }
  return transporter
}

function formatName(name: string): string {
  if (!name) return ""
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export async function sendPasswordResetEmail({
  email,
  name,
  resetToken
}: {
  email: string,
  name: string,
  resetToken: string
}) {
  const formattedName = formatName(name)
  const appUrl = process.env.APP_URL || "http://localhost:3000"
  const resetLink = `${appUrl}/reset-password?token=${resetToken}`

  const mailOptions = {
    from: `"Attendy" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset Your Attendy Password",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1b26; color: #e1e1e6; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; color: white;">🎓 Attendy</h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Password Reset Request</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; margin-bottom: 8px;">Hi <strong>${formattedName}</strong>,</p>
          <p style="font-size: 14px; color: #a1a1aa; line-height: 1.6;">
            We received a request to reset your password. Click the button below to set a new password. 
            This link will expire in <strong>1 hour</strong>.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 12px; color: #71717a; line-height: 1.6;">
            If you didn't request this, you can safely ignore this email. Your password won't be changed.
          </p>
          <hr style="border: none; border-top: 1px solid #2a2b3d; margin: 24px 0;" />
          <p style="font-size: 11px; color: #52525b; text-align: center;">
            Lokmanya Tilak College of Engineering · SE Sem IV Div A
          </p>
        </div>
      </div>
    `,
  }

  const activeTransporter = await getTransporter()
  const info = await activeTransporter.sendMail(mailOptions)

  if (!process.env.SMTP_USER) {
    console.log("-----------------------------------------")
    console.log("🚀 Ethereal Test Email sent successfully!")
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
    console.log("Click the link above to view your password reset email.")
    console.log("-----------------------------------------")
  }
}
