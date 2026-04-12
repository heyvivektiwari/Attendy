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
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; background: #070411; color: #61A4BC; border: 3px solid #1A132F; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
        <div style="background: #1A132F; padding: 45px 32px; text-align: center; border-bottom: 2px solid rgba(97, 164, 188, 0.1);">
          <h1 style="margin: 0; font-size: 36px; color: #ffffff; letter-spacing: -1.5px; font-weight: 900;">🎓 Attendy</h1>
          <p style="margin: 10px 0 0; color: #5B7DB1; font-size: 13px; font-weight: 800; text-transform: uppercase; tracking: 0.2em;">Secure Access Portal</p>
        </div>
        <div style="padding: 45px 35px; background: #070411;">
          <p style="font-size: 20px; margin-bottom: 15px; font-weight: 700; color: #ffffff;">Hi <strong>${formattedName}</strong>,</p>
          <p style="font-size: 16px; color: #61A4BC; line-height: 1.7; margin-bottom: 35px; opacity: 0.9;">
            A password reset was requested for your Attendy account. To secure your account, click the button below to choose a new password. This link is valid for <strong style="color: #ffffff;">1 hour</strong>.
          </p>
          <div style="text-align: center; margin: 45px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; background: #5B7DB1; color: #ffffff; padding: 18px 45px; border-radius: 16px; text-decoration: none; font-weight: 900; font-size: 17px; border: 3px solid #1A132F; box-shadow: 0 8px 25px rgba(91, 125, 177, 0.3);">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #61A4BC; line-height: 1.6; font-style: italic; opacity: 0.7; text-align: center;">
            Didn't request this? Relax, your account is safe and you can delete this email.
          </p>
          <div style="margin-top: 50px; padding-top: 30px; border-top: 2px solid #1A132F; text-align: center;">
            <p style="font-size: 11px; color: #5B7DB1; margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
              Attendy Intelligence Service
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
