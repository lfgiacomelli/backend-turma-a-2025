import { MercadoPagoConfig, Payment } from 'mercadopago';
import fetch from 'node-fetch'; // Se Node >=18, pode usar fetch global e remover esta linha

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc', // ideal seria gerar dinamicamente para evitar duplicidade
  }
});

const payment = new Payment(client);

class PaymentController {
  static async createPayment(req, res) {
    try {
      const { sol_valor, usu_nome, usu_codigo, usu_email, sol_descricao, sol_servico } = req.body;

      if (!sol_valor || !usu_nome || !usu_codigo || !usu_email || !sol_descricao || !sol_servico) {
        return res.status(400).json({ error: 'Parâmetros incompletos' });
      }

      const body = {
        transaction_amount: Number(sol_valor),
        description: sol_descricao,
        payment_method_id: 'pix',
        payer: {
          email: usu_email,
          first_name: usu_nome.split(' ')[0] || 'Cliente',
          last_name: usu_nome.split(' ').slice(1).join(' ') || '',
          identification: {
            type: 'CPF',
            number: usu_codigo,
          },
        },
      };

      const response = await payment.create({ body });

      return res.status(200).json(response);
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

      // Consulta o pagamento diretamente via API REST do Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      });

      if (!mpResponse.ok) {
        const errorBody = await mpResponse.json();
        return res.status(mpResponse.status).json({ error: 'Erro na API MercadoPago', details: errorBody });
      }

      const paymentData = await mpResponse.json();

      return res.status(200).json({
        id: paymentData.id,
        status: paymentData.status,
        status_detail: paymentData.status_detail,
        transaction_amount: paymentData.transaction_amount,
        description: paymentData.description,
        payer: paymentData.payer,
      });
    } catch (error) {
      console.error('Erro ao consultar status do pagamento:', error);
      return res.status(500).json({ error: 'Erro ao consultar status do pagamento', details: error.message });
    }
  }
}

export default PaymentController;
