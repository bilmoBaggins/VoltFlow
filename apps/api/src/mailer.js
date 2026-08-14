import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "127.0.0.1",
  port: Number(process.env.SMTP_PORT) || 1025,
  secure: process.env.SMTP_SECURE === "true",
});

const MAIL_FROM = process.env.MAIL_FROM || "noreply@voltflow.local";

export async function sendOtpEmail(to, otp) {
  await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject: "Your VoltFlow verification code",
    text: `Your VoltFlow verification code is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your VoltFlow verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:0.2em;">${otp}</p><p>It expires in 10 minutes.</p>`,
  });
}
