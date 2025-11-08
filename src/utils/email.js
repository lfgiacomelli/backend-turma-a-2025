import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarEmail({ to, subject, text, html }) {
  try {
    await resend.emails.send({
      from: "ZoomX <no-reply@zoomx.app>",
      to,
      subject,
      text,
      html,
    });
    console.log("✅ E-mail enviado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail:", error);
  }
}
