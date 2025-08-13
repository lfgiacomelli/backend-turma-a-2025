import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
export async function enviarEmail({ to, subject, text, html }) {
  await transporter.sendMail({
    from: `ZoomX - Mototáxis <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
}
