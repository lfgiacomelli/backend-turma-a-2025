import { MercadoPagoConfig, Payment } from 'mercadopago';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/db.js';
import { enviarEmail } from '../utils/email.js';

dotenv.config();

class PaymentController {
    static async createPayment(req, res) {
        try {
            const {
                sol_valor,
                usu_codigo,
                usu_nome,
                usu_cpf,
                usu_email,
                sol_descricao,
                sol_servico,
            } = req.body;

            if (
                !sol_valor ||
                !usu_codigo ||
                !usu_nome ||
                !usu_cpf ||
                !usu_email ||
                !sol_descricao ||
                !sol_servico
            ) {
                return res.status(400).json({ error: 'Parâmetros incompletos' });
            }

            const idempotencyKey = `pix-${uuidv4()}`;

            const client = new MercadoPagoConfig({
                accessToken: process.env.MP_ACCESS_TOKEN,
                options: {
                    timeout: 5000,
                    idempotencyKey,
                },
            });

            const payment = new Payment(client);

            const mpBody = {
                transaction_amount: Number(sol_valor),
                description: sol_descricao,
                payment_method_id: 'pix',
                payer: {
                    email: usu_email,
                    first_name: usu_nome.split(' ')[0] || 'Cliente',
                    last_name: usu_nome.split(' ').slice(1).join(' ') || '',
                    identification: { type: 'CPF', number: usu_cpf },
                },
            };

            const response = await payment.create({ body: mpBody });

            const paymentData = response.body ?? response;

            if (!paymentData || !paymentData.id) {
                console.error('Resposta inválida do MercadoPago:', paymentData);
                return res
                    .status(500)
                    .json({ error: 'Erro na resposta do MercadoPago', details: paymentData });
            }

            await pool.query(
                `INSERT INTO pix_pagamentos (
          pix_pagamento_codigo, pix_status, pix_valor,
          pix_qrcode, pix_qrcode_base64, pix_ticket_url,
          usu_codigo, sol_servico
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
                [
                    paymentData.id,
                    paymentData.status,
                    sol_valor,
                    paymentData.point_of_interaction?.transaction_data?.qr_code ?? null,
                    paymentData.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
                    paymentData.point_of_interaction?.transaction_data?.ticket_url ?? null,
                    usu_codigo,
                    sol_servico,
                ]
            );
//             await enviarEmail({
//                 to: usu_email,
//                 subject: 'Seu QR Code de Pagamento ZoomX',
//                 text: `Olá ${usu_nome}! Seu QR Code de pagamento já foi e está disponível para realizar o pagamento de R$ ${sol_valor} referente ao serviço de ${sol_servico} em nosso aplicativo.\n\nVocê pode acessar o QR Code através do seguinte link: 
//   ${paymentData.point_of_interaction?.transaction_data?.ticket_url}
//   \n\nAgradecemos por escolher o ZoomX!`,
//                 html: `
//                 <!doctype html>
//                     <html lang="pt-BR">
//                     <head>
//                     <meta charset="utf-8" />
//                     <meta name="viewport" content="width=device-width,initial-scale=1" />
//                     <title>Seu QR Code de Pagamento</title>
//                     </head>
//                     <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
//                     <center style="width:100%;padding:20px 0;">
//                         <table role="presentation" width="100%" style="max-width:600px;background:#fff;border-radius:8px;padding:20px;">
//                         <tr>
//                             <td>
//                             <h2 style="margin:0 0 10px 0;color:#111827;">Olá ${usu_nome},</h2>
//                             <p style="margin:0 0 15px 0;color:#333;">Seu QR Code de pagamento já está disponível para realizar o pagamento de:</p>
//                             <p style="font-size:20px;font-weight:bold;color:#111827;margin:0 0 8px 0;">R$ ${sol_valor}</p>
//                             <p style="margin:0 0 20px 0;color:#111827;">Serviço: ${sol_servico}</p>

//                             <div style="text-align:center;margin:20px 0;">
//                                 <a href="${paymentData.point_of_interaction?.transaction_data?.ticket_url}" target="_blank" style="display:inline-block;padding:12px 20px;background:#0066ff;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
//                                 Abrir QR Code / Pagar agora
//                                 </a>
//                             </div>

//                             <p style="font-size:13px;color:#666;margin:20px 0 5px 0;">Se o botão não funcionar, copie e cole este link no navegador:</p>
//                             <p style="font-size:13px;word-break:break-all;color:#0066ff;">
//                                 <a href="${paymentData.point_of_interaction?.transaction_data?.ticket_url}" target="_blank" style="color:#0066ff;text-decoration:none;">
//                                 ${paymentData.point_of_interaction?.transaction_data?.ticket_url}
//                                 </a>
//                             </p>

//                             <hr style="margin:25px 0;border:none;border-top:1px solid #eee;" />

//                             <p style="margin:0;font-size:13px;color:#666;">
//                                 Agradecemos por escolher o ZoomX!<br/>
//                                 <strong>Equipe ZoomX</strong>
//                             </p>
//                             </td>
//                         </tr>
//                         </table>
//                         <p style="font-size:11px;color:#999;margin-top:10px;">
//                         Este é um e-mail automático. Se você não solicitou este pagamento, ignore-o.
//                         </p>
//                     </center>
//                     </body>
//                 </html>`
//             });

            return res.status(200).json(paymentData);
        } catch (error) {
            console.error('Erro ao criar pagamento:', error);
            return res
                .status(500)
                .json({ error: 'Erro ao criar pagamento', details: error.message });
        }
    }

    static async getPaymentStatus(req, res) {
        try {
            const { payment_id } = req.params;

            if (!payment_id) {
                return res.status(400).json({ error: 'payment_id é obrigatório' });
            }

            const mp = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
                headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
            });

            if (!mp.ok) {
                const err = await mp.json();
                return res.status(mp.status).json({ error: 'Erro na API MercadoPago', details: err });
            }

            const data = await mp.json();

            await pool.query(
                `UPDATE pix_pagamentos
           SET pix_status=$1,
               pix_qrcode=$2,
               pix_qrcode_base64=$3,
               pix_ticket_url=$4,
               pix_atualizado_em=NOW()
         WHERE pix_pagamento_codigo=$5`,
                [
                    data.status,
                    data.point_of_interaction?.transaction_data?.qr_code ?? null,
                    data.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
                    data.point_of_interaction?.transaction_data?.ticket_url ?? null,
                    payment_id,
                ]
            );

            return res.status(200).json({
                id: data.id,
                status: data.status,
                status_detail: data.status_detail,
                transaction_amount: data.transaction_amount,
                description: data.description,
                payer: data.payer,
                qr_code: data.point_of_interaction?.transaction_data?.qr_code ?? null,
                qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
                ticket_url: data.point_of_interaction?.transaction_data?.ticket_url ?? null,
            });
        } catch (error) {
            console.error('Erro ao consultar status do pagamento:', error);
            return res
                .status(500)
                .json({ error: 'Erro ao consultar status do pagamento', details: error.message });
        }
    }

    static async getPaymentByUser(req, res) {
        try {
            const { usu_codigo } = req.params;

            if (!usu_codigo) {
                return res.status(400).json({ error: 'usu_codigo é obrigatório' });
            }

            const result = await pool.query(
                `SELECT * FROM pix_pagamentos WHERE usu_codigo = $1 AND pix_status != 'pending' ORDER BY pix_pagamento_codigo DESC`,
                [usu_codigo]
            );


            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Nenhum pagamento finalizado encontrado para este usuário' });
            }

            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Erro ao buscar pagamentos do usuário:', error);
            return res
                .status(500)
                .json({ error: 'Erro ao buscar pagamentos do usuário', details: error.message });
        }
    }
}

export default PaymentController;
