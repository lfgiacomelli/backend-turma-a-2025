import { pool } from "../db/db.js";

const SolicitacaoController = {
  async createSolicitacao(req, res) {
    try {
      const data = SolicitacaoSchema.parse(req.body);

      if (data.sol_servico === "Moto Táxi") {
        data.sol_largura = null;
        data.sol_comprimento = null;
        data.sol_peso = null;
      }

      const query = `
        INSERT INTO solicitacoes (sol_origem, sol_destino, sol_valor,
          sol_formapagamento, sol_distancia, sol_data, usu_codigo,
          sol_largura, sol_comprimento, sol_peso, sol_servico, sol_observacoes
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,)
      `;

      const values = [
        data.sol_codigo,
        data.sol_origem,
        data.sol_destino,
        data.sol_valor,
        data.sol_formapagamento,
        data.sol_distancia,
        data.sol_data,
        data.usu_codigo,
        data.sol_largura,
        data.sol_comprimento,
        data.sol_peso,
        data.sol_servico,
        data.sol_observacoes || "",
      ];

      await pool.query(query, values);

      res.status(201).json({ message: "Solicitação criada com sucesso" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Erro de validação",
          errors: error.errors.map((err) => ({
            atributo: err.path[0],
            message: err.message,
          })),
        });
      }
      console.error(error);
      res.status(500).json({ message: "Erro no servidor", detalhe: error.message });
    }
  },
  async cancelarSolicitacao(req, res) {
    const { id } = req.params;

    try {
      const result = await pool.query(
        "DELETE FROM solicitacoes WHERE sol_codigo = $1",
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Solicitação não encontrada" });
      }

      res.status(200).json({ message: "Solicitação cancelada com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro no servidor", detalhe: error.message });
    }
  }
};

export default SolicitacaoController;
