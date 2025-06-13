import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export const gerarPagamentoPix = async (req, res) => {
  const { valor, nome, email, descricao } = req.body;

  if (!valor || !nome || !email || !descricao) {
    return res.status(400).json({ message: "Dados obrigatórios ausentes." });
  }

  try {
    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: descricao,
      payment_method_id: "pix",
      payer: {
        email,
        first_name: nome,
      },
    });

    return res.status(200).json(pagamento.body);
  } catch (error) {
    console.error("Erro ao gerar pagamento Pix:", error.response?.data || error.message);
    return res.status(500).json({ message: "Erro ao gerar pagamento Pix." });
  }
};

export const verificarStatusPagamento = async (req, res) => {
  const { id } = req.params;

  try {
    const pagamento = await mercadopago.payment.findById(id);
    const status = pagamento.body.status;

    return res.status(200).json({ status });
  } catch (error) {
    console.error("Erro ao verificar pagamento:", error.response?.data || error.message);
    return res.status(500).json({ message: "Erro ao verificar status do pagamento." });
  }
};
