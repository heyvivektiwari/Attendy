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
      <div style="font-family: 'Geist', 'Segoe UI', sans-serif; max-width: 600px; margin: 20px auto; background: #ffffff; color: #1A132F; border: 2px solid #1A132F; border-radius: 24px; overflow: hidden; shadow: 0 10px 40px rgba(26,19,47,0.12);">
        <div style="background: #1A132F; padding: 40px 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; color: #ffffff; letter-spacing: -1px; font-weight: 900;">🎓 Attendy</h1>
          <p style="margin: 8px 0 0; color: #2ec7ff; font-size: 14px; font-weight: 700; text-transform: uppercase; tracking: 0.1em;">Password Reset Request</p>
        </div>
        <div style="padding: 40px 32px;">
          <p style="font-size: 18px; margin-bottom: 12px; font-weight: 700;">Hi <strong>${formattedName}</strong>,</p>
          <p style="font-size: 15px; color: #4B5563; line-height: 1.6; margin-bottom: 32px;">
            We received a request to reset your password. Click the button below to set a new password. 
            This link will expire in <strong style="color: #1A132F;">1 hour</strong>.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; background: #005691; color: #ffffff; padding: 16px 40px; border-radius: 14px; text-decoration: none; font-weight: 900; font-size: 16px; border: 3px solid #1A132F; box-shadow: 0 4px 15px rgba(0,86,145,0.25);">
              Reset Password
            </a>
          </div>
          <p style="font-size: 13px; color: #6B7280; line-height: 1.6; font-style: italic;">
            If you didn't request this, you can safely ignore this email. Your password won't be changed.
          </p>
          <div style="margin-top: 40px; padding-top: 24px; border-top: 2px solid #f3f4f6; text-align: center;">
            <p style="font-size: 12px; color: #9CA3AF; margin: 0; font-weight: 600;">
              Attendy Support Team
            </p>
          </div>
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
