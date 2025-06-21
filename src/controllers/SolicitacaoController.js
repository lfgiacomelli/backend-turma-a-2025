
import { z } from 'zod';
import pool from '../db/db.js';

const SolicitacaoSchema = z.object({
    sol_origem: z.string(),
    sol_destino: z.string(),
    sol_valor: z.number(),
    sol_formapagamento: z.string(),
    sol_distancia: z.number(),
    sol_data: z.string(),
    usu_codigo: z.number(),
    sol_largura: z.number().nullable().optional(),
    sol_comprimento: z.number().nullable().optional(),
    sol_peso: z.number().nullable().optional(),
    sol_servico: z.string(),
    sol_observacoes: z.string().optional(),
});

const SolicitacaoController = {
    async createSolicitacao(req, res) {
        try {
            const data = SolicitacaoSchema.parse(req.body);

            if (data.sol_servico === 'Moto Táxi') {
                data.sol_largura = null;
                data.sol_comprimento = null;
                data.sol_peso = null;
            }

            const query = `
        INSERT INTO solicitacoes (
          sol_origem, sol_destino, sol_valor,
          sol_formapagamento, sol_distancia, sol_data, usu_codigo,
          sol_largura, sol_comprimento, sol_peso, sol_servico, sol_observacoes, sol_status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        RETURNING *;
      `;

            const values = [
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
                data.sol_observacoes || '',
                'Pendente',
            ];

            const result = await pool.query(query, values);

            res.status(201).json(result.rows[0]);

        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: 'Erro de validação',
                    errors: error.errors.map((err) => ({
                        atributo: err.path[0],
                        message: err.message,
                    })),
                });
            }
            console.error('Erro ao criar solicitação:', error);
            res.status(500).json({ message: 'Erro no servidor', detalhe: error.message });
        }
    },

    async updateSolicitacao(req, res) {
        const { id } = req.params;
        const data = req.body;

        try {
            const query = `
        UPDATE solicitacoes
        SET sol_origem = $1,
            sol_destino = $2,
            sol_valor = $3,
            sol_formapagamento = $4,
            sol_distancia = $5,
            sol_data = $6,
            usu_codigo = $7,
            sol_largura = $8,
            sol_comprimento = $9,
            sol_peso = $10,
            sol_servico = $11,
            sol_observacoes = $12,
            sol_status = 'Pendente'
        WHERE sol_codigo = $13
        RETURNING *;
      `;

            const values = [
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
                data.sol_observacoes || '',
                data.sol_status || 'Pendente',
                id,
            ];

            const result = await pool.query(query, values);

            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Solicitação não encontrada' });
            }

            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao atualizar solicitação:', error);
            res.status(500).json({ message: 'Erro no servidor', detalhe: error.message });
        }
    },

    async cancelarSolicitacao(req, res) {
        const { id } = req.params;

        try {
            const result = await pool.query(
                'DELETE FROM solicitacoes WHERE sol_codigo = $1',
                [id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Solicitação não encontrada' });
            }

            res.status(200).json({ message: 'Solicitação cancelada com sucesso' });
        } catch (error) {
            console.error('Erro ao cancelar solicitação:', error);
            res.status(500).json({ message: 'Erro no servidor', detalhe: error.message });
        }
    },

    async getSolicitacao(req, res) {
        try {
            const result = await pool.query('SELECT * FROM solicitacoes ORDER BY sol_data DESC');
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Erro ao buscar solicitações:', error);
            res.status(500).json({ message: 'Erro no servidor', detalhe: error.message });
        }
    },
    async getSolicitacaoById(req, res) {
        const { id } = req.params;
        const idNum = Number(id);

        if (isNaN(idNum)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        try {
            const result = await pool.query('SELECT * FROM solicitacoes WHERE sol_codigo = $1', [idNum]);

            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Solicitação não encontrada' });
            }

            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar solicitação:', error);
            res.status(500).json({ message: 'Erro no servidor', detalhe: error.message });
        }
    },
    async getSolicitacaoPendente(req, res) {
        try {
            const result = await pool.query(
                'SELECT * FROM solicitacoes WHERE usu_codigo = $1 AND sol_status = $2 ORDER BY sol_data DESC LIMIT 1',
                [req.params.id, 'Pendente']
            );
            if (result.rows.length > 0) {
                res.status(200).json(result.rows[0]);
            } else {
                res.status(404).json({ message: 'Nenhuma solicitação pendente encontrada' });
            }
        } catch (error) {
            console.error('Erro ao buscar solicitação pendente:', error);
            res.status(500).json({ message: 'Erro no servidor', detalhe: error.message });
        }
    }



};

export default SolicitacaoController;
