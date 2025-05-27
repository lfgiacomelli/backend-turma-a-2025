import { z } from 'zod';
import pool from '../db/db.js';

const ViagemSchema = z.object({
  via_codigo: z.string().uuid({ message: "Código da viagem inválido" }),
  via_funcionarioId: z.string().uuid({ message: "ID do funcionário inválido" }),
  via_origem: z.string().min(1, "Origem é obrigatória"),
  via_destino: z.string().min(1, "Destino é obrigatória"),
  via_atendenteCodigo: z.string().uuid({ message: "Código do atendente inválido" }).optional(),
  via_usuarioId: z.string().uuid({ message: "ID do usuário inválido" }).optional(),
  via_formapagamento: z.string().min(1, "Forma de pagamento é obrigatória").optional(),
  via_observacoes: z.string().max(500, "Observações não podem exceder 500 caracteres").optional(),
  via_servico: z.string().min(1, "Serviço é obrigatório"),
  via_status: z.enum(['Pendente', 'Aprovada', 'Rejeitada']),
  via_data: z.preprocess(arg => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date({ message: "Data inválida" })),
  via_valor: z.number().positive("O valor deve ser um número positivo"),
  via_solicitacaoId: z.string().uuid({ message: "ID da solicitação inválido" }),
});

const ViagemController = {
  async createViagem(req, res) {
    try {
      const body = ViagemSchema.parse(req.body);

      // Exemplo de inserção no banco, ajuste colunas e valores conforme sua tabela:
      /*
      const query = `
        INSERT INTO viagens (
          via_codigo, fun_codigo, via_origem, via_destino,
          ate_codigo, usu_codigo, via_formapagamento, via_observacoes,
          via_servico, via_status, via_data, via_valor, sol_codigo
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      `;
      const values = [
        body.via_codigo,
        body.via_funcionarioId,
        body.via_origem,
        body.via_destino,
        body.via_atendenteCodigo || null,
        body.via_usuarioId || null,
        body.via_formapagamento || null,
        body.via_observacoes || null,
        body.via_servico,
        body.via_status,
        body.via_data,
        body.via_valor,
        body.via_solicitacaoId
      ];
      await pool.query(query, values);
      */

      res.status(201).json({ message: "Viagem criada com sucesso" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Erro de validação",
          errors: error.errors.map(err => ({
            atributo: err.path[0],
            message: err.message,
          })),
        });
      }
      console.error('Erro no createViagem:', error);
      res.status(500).json({ message: error.message || 'Erro interno no servidor' });
    }
  },

  async updateViagem(req, res) {
    try {
      const { id } = req.params;
      const body = ViagemSchema.parse(req.body);

      // Exemplo update, ajuste conforme sua tabela:
      /*
      const query = `
        UPDATE viagens SET
          fun_codigo = $1, via_origem = $2, via_destino = $3,
          ate_codigo = $4, usu_codigo = $5, via_formapagamento = $6,
          via_observacoes = $7, via_servico = $8, via_status = $9,
          via_data = $10, via_valor = $11, sol_codigo = $12
        WHERE via_codigo = $13
      `;
      const values = [
        body.via_funcionarioId,
        body.via_origem,
        body.via_destino,
        body.via_atendenteCodigo || null,
        body.via_usuarioId || null,
        body.via_formapagamento || null,
        body.via_observacoes || null,
        body.via_servico,
        body.via_status,
        body.via_data,
        body.via_valor,
        body.via_solicitacaoId,
        id
      ];
      await pool.query(query, values);
      */

      res.status(200).json({ message: `Viagem ${id} atualizada com sucesso` });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Erro de validação",
          errors: error.errors.map(err => ({
            atributo: err.path[0],
            message: err.message,
          })),
        });
      }
      console.error('Erro no updateViagem:', error);
      res.status(500).json({ message: error.message || 'Erro interno no servidor' });
    }
  },

  async deleteViagem(req, res) {
    try {
      const { id } = req.params;

      // Exemplo delete:
      /*
      await pool.query('DELETE FROM viagens WHERE via_codigo = $1', [id]);
      */

      res.status(200).json({ message: `Viagem ${id} deletada com sucesso` });
    } catch (error) {
      console.error('Erro no deleteViagem:', error);
      res.status(500).json({ message: error.message || 'Erro interno no servidor' });
    }
  },

  async getViagem(req, res) {
    try {
      const { usuarioId } = req.query;

      let query = 'SELECT * FROM viagens';
      const values = [];

      if (usuarioId) {
        query += ' WHERE usu_codigo = $1';
        values.push(usuarioId);
      }

      query += ' ORDER BY via_data DESC';

      const { rows } = await pool.query(query, values);

      const viagens = rows.map(row => ViagemSchema.parse({
        via_codigo: row.via_codigo,
        via_funcionarioId: row.fun_codigo,
        via_solicitacaoId: row.sol_codigo,
        via_usuarioId: row.usu_codigo,
        via_origem: row.via_origem,
        via_destino: row.via_destino,
        via_formapagamento: row.via_formapagamento,
        via_observacoes: row.via_observacoes,
        via_atendenteCodigo: row.ate_codigo,
        via_servico: row.via_servico,
        via_status: row.via_status,
        via_data: row.via_data,
        via_valor: Number(row.via_valor),
      }));

      res.status(200).json(viagens);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Erro de validação dos dados do banco",
          errors: error.errors.map(err => ({
            atributo: err.path[0],
            message: err.message,
          })),
        });
      }
      console.error('Erro no getViagem:', error);
      res.status(500).json({ message: error.message || 'Erro ao buscar viagens' });
    }
  },

  async getViagemPorUsuario(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID do usuário é obrigatório.' });
    }

    try {
      const query = 'SELECT * FROM viagens WHERE usu_codigo = $1 ORDER BY via_data DESC';
      const result = await pool.query(query, [id]);

      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Erro no getViagemPorUsuario:', error);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.' });
    }
  }
};

export default ViagemController;
