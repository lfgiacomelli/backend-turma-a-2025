import { MercadoPagoConfig, Payment } from 'mercadopago';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid'; 
import pool from '../db/db.js';

dotenv.config();

class PaymentController {
  static async createPayment(req, res) {
    try {
      const {
        sol_valor, usu_codigo, usu_nome, usu_cpf,
        usu_email, sol_descricao, sol_servico,
      } = req.body;

      if (!sol_valor || !usu_codigo || !usu_nome || !usu_cpf ||
          !usu_email || !sol_descricao || !sol_servico) {
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
          last_name:  usu_nome.split(' ').slice(1).join(' ') || '',
          identification: { type: 'CPF', number: usu_cpf },
        },
      };

      const { body } = await payment.create({ body: mpBody });

      await pool.query(
        `INSERT INTO pix_pagamentos (
           pix_pagamento_codigo, pix_status, pix_valor,
           pix_qrcode, pix_qrcode_base64, pix_ticket_url,
           usu_codigo, sol_servico
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          body.id,
          body.status,
          sol_valor,
          body.point_of_interaction.transaction_data?.qr_code        ?? null,
          body.point_of_interaction.transaction_data?.qr_code_base64 ?? null,
          body.point_of_interaction.transaction_data?.ticket_url     ?? null,
          usu_codigo,
          sol_servico,
        ],
      );

      return res.status(200).json(body);
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      return res.status(500).json({ error: 'Erro ao criar pagamento', details: error.message });
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
          data.point_of_interaction?.transaction_data?.qr_code        ?? null,
          data.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
          data.point_of_interaction?.transaction_data?.ticket_url     ?? null,
          payment_id,
        ],
      );

      return res.status(200).json({
        id:                data.id,
        status:            data.status,
        status_detail:     data.status_detail,
        transaction_amount:data.transaction_amount,
        description:       data.description,
        payer:             data.payer,
        qr_code:           data.point_of_interaction?.transaction_data?.qr_code        ?? null,
        qr_code_base64:    data.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
        ticket_url:        data.point_of_interaction?.transaction_data?.ticket_url     ?? null,
      });
    } catch (error) {
      console.error('Erro ao consultar status do pagamento:', error);
      return res.status(500).json({ error: 'Erro ao consultar status do pagamento', details: error.message });
    }
  }
}

export default PaymentController;
