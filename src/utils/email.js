import nodemailer from 'nodemailer';
import path from 'path';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const enviarEmailAvaliacao = async (para, nome, via_codigo) => {
  const linkAvaliacao = `zoomx://AvaliarViagem/${via_codigo}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: para,
    subject: 'Avalie sua última viagem',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; background-color: #f0f0f0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #0070f3;">Avalie sua última viagem</h2>
        </div>

        <p>Olá <strong>${nome}</strong>,</p>
        <p>Sua última viagem foi finalizada. Para melhorar nossos serviços, por favor, avalie sua experiência clicando no botão abaixo:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${linkAvaliacao}" 
             style="
                background-color: #f0f0f0; 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 8px;
                font-weight: bold;
                display: inline-block;
             ">
            Avaliar Agora
          </a>
        </div>

        <p style="font-size: 0.9em; color: #555;">
          Caso o link acima não funcione, abra o aplicativo ZoomX e vá até a seção de avaliações.
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0;" />

        <p style="font-size: 0.8em; color: #999; text-align: center;">
          &copy; 2025 ZoomX - Todos os direitos reservados
        </p>
      </div>
    `,
    attachments: [
      {
        filename: 'logo.png',
        path: path.resolve('./assets/logo.png'), // caminho para a imagem local
        cid: 'logoZoomX', // corresponde ao src="cid:logoZoomX"
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};
