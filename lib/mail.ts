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
      <html>
        <head>
          <style>
            @media (prefers-color-scheme: dark) {
              .email-wrapper { background-color: #070411 !important; color: #61A4BC !important; }
              .content-box { background-color: #070411 !important; border-color: #1A132F !important; }
              .header-box { background-color: #1A132F !important; }
              .text-main { color: #ffffff !important; }
              .text-muted { color: #61A4BC !important; }
              .footer-text { color: #5B7DB1 !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0;">
          <div class="email-wrapper" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; padding: 20px 10px;">
            <div class="content-box" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #1A132F; border: 3px solid #1A132F; border-radius: 28px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
              <div class="header-box" style="background: #1A132F; padding: 45px 32px; text-align: center;">
                <h1 style="margin: 0; font-size: 36px; color: #ffffff; letter-spacing: -1.5px; font-weight: 900;">🎓 Attendy</h1>
                <p style="margin: 10px 0 0; color: #2ec7ff; font-size: 13px; font-weight: 800; text-transform: uppercase; tracking: 0.2em;">Security Notification</p>
              </div>
              <div style="padding: 45px 35px;">
                <p class="text-main" style="font-size: 20px; margin-bottom: 15px; font-weight: 700;">Hi <strong>${formattedName}</strong>,</p>
                <p class="text-muted" style="font-size: 16px; color: #4B5563; line-height: 1.7; margin-bottom: 35px;">
                  We received a request to reset your Attendy password. Safeguard your account by clicking the button below to choose a new password. This link will expire in <strong style="color: #1A132F;">1 hour</strong>.
                </p>
                <div style="text-align: center; margin: 45px 0;">
                  <a href="${resetLink}" 
                     style="display: inline-block; background: #005691; color: #ffffff; padding: 18px 45px; border-radius: 16px; text-decoration: none; font-weight: 900; font-size: 17px; border: 3px solid #1A132F; box-shadow: 0 8px 15px rgba(0,86,145,0.15);">
                    Reset Password
                  </a>
                </div>
                <p class="text-muted" style="font-size: 14px; color: #6B7280; line-height: 1.6; font-style: italic; text-align: center;">
                  If you didn't request this change, you can safely ignore this mail.
                </p>
                <div style="margin-top: 50px; padding-top: 30px; border-top: 2px solid #f3f4f6; text-align: center;">
                  <p class="footer-text" style="font-size: 11px; color: #9CA3AF; margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                    Attendy Intelligence Service
                  </p>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
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
