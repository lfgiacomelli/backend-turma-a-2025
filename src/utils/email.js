import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarEmail({ to, subject, text, html }) {
  const { data, error } = await resend.emails.send({
    from: 'ZoomX <no-reply@resend.dev>',
    to,
    subject,
    text,
    html,
  });

  if (error) {
    console.error("❌ Erro ao enviar email:", error);
    throw error;
  }

  console.log("✅ E-mail enviado:", data);
}
