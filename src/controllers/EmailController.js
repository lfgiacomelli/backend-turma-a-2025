import { z } from 'zod';
import { enviarEmail } from '../utils/email.js';

export const EmailSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(1, "Telefone é obrigatório"),
    message: z.string().min(1, "Mensagem é obrigatória"),
    company: z.string().optional(),
    address_company: z.string().optional(),
    address_number: z.union([z.string(), z.number()]).optional(),
    bairro: z.string().optional(),
});

const EmailController = {
    async enviarEmail(req, res) {
        try {
            const data = EmailSchema.parse(req.body);

            const textoEmail = `
Email de contrato enviado por:

Nome: ${data.name}
Email: ${data.email}
Telefone: ${data.phone}
Empresa/Cooperativa: ${data.company || '-'}
Endereço da empresa: ${data.address_company || '-'}
Número: ${data.address_number || '-'}
Bairro: ${data.bairro || '-'}

Mensagem:
${data.message}
      `.trim();

            const htmlEmail = `
<div style="font-family: Arial, sans-serif; font-size: 15px; color: #333; line-height: 1.6;">
  <h2 style="color: #0d47a1;">📩 Solicitação de Contrato - ZoomX</h2>
  <p><strong>Nome:</strong> ${data.name}</p>
  <p><strong>Email:</strong> ${data.email}</p>
  <p><strong>Telefone:</strong> ${data.phone}</p>
  <p><strong>Empresa/Cooperativa:</strong> ${data.company || '-'}</p>
  <p><strong>Endereço da empresa:</strong> ${data.address_company || '-'}</p>
  <p><strong>Número:</strong> ${data.address_number || '-'}</p>
  <p><strong>Bairro:</strong> ${data.bairro || '-'}</p>

  <hr style="margin: 20px 0; border: none; border-top: 1px solid #ccc;" />

  <p style="margin-top: 20px;"><strong>Mensagem:</strong></p>
  <p style="background: #f1f1f1; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${data.message}</p>

  <br />
  <p style="color: #999; font-size: 13px;">Email automático enviado via formulário de contato ZoomX.</p>
</div>
      `.trim();

            // await enviarEmail({
            //     to: '4fordevs@gmail.com',
            //     subject: `Solicitação de contrato - ${data.name}`,
            //     text: textoEmail,
            //     html: htmlEmail,
            // });

            res.status(200).json({
                success: true,
                message: 'Email enviado!',
            });

        } catch (error) {
            console.error('Erro ao enviar email:', error);
            res.status(400).json({ error: error.message || 'Erro no envio do email' });
        }
    },
};

export default EmailController;
