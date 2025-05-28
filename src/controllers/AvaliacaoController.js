import { z } from 'zod';
import pool from '../db/db.js';
import { v4 as uuidv4 } from 'uuid';

const AvaliacaoSchema = z.object({
    usu_codigo: z.string().uuid("Código do usuário inválido"),
    via_codigo: z.string().uuid("Código da viagem inválido"),
    ava_nota: z.number().min(1, "Nota mínima é 1").max(5, "Nota máxima é 5"),
    ava_comentario: z.string().optional(),
    ava_data_avaliacao: z.string().optional(),
});

const AvaliacaoController = {
    async createAvaliacao(req, res) {
        try {
            const ava_codigo = uuidv4();
            const { usu_codigo, via_codigo, ava_nota, ava_comentario, ava_data_avaliacao } = req.body;

            AvaliacaoSchema.parse({ usu_codigo, via_codigo, ava_nota, ava_comentario, ava_data_avaliacao });

            await pool.query(
                `INSERT INTO avaliacoes 
         (ava_codigo, usu_codigo, via_codigo, ava_nota, ava_comentario, ava_data_avaliacao)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [ava_codigo, usu_codigo, via_codigo, ava_nota, ava_comentario || null, ava_data_avaliacao || new Date().toISOString()]
            );

            return res.status(201).json({ message: "Avaliação criada com sucesso" });
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
            console.error('Erro createAvaliacao:', error);
            return res.status(500).json({ message: error.message });
        }
    },
    async getAvaliacoes(req, res) {
        try {
            const result = await pool.query('SELECT * FROM avaliacoes ORDER BY ava_data_avaliacao DESC');
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Erro getAvaliacoes:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async getAvaliacoesByUsuario(req, res) {
        try {
            const { id } = req.params;
            const result = await pool.query(`
      SELECT * 
      FROM avaliacoes 
      WHERE usu_codigo = $1
      ORDER BY ava_data_avaliacao DESC
    `, [id]);

            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Erro getAvaliacoesByUsuario:', error);
            res.status(500).json({ message: error.message });
        }
    },

    async deleteAvaliacao(req, res) {
        try {
            const { id } = req.params;

            const result = await pool.query('DELETE FROM avaliacoes WHERE ava_codigo = $1', [id]);
            if (result.rowCount === 0) {
                return res.status(404).json({ message: "Avaliação não encontrada" });
            }

            return res.status(200).json({ message: "Avaliação deletada com sucesso" });
        } catch (error) {
            console.error('Erro deleteAvaliacao:', error);
            res.status(500).json({ message: error.message });
        }
    },

    async updateAvaliacao(req, res) {
        try {
            const { id } = req.params;
            const { usu_codigo, via_codigo, ava_nota, ava_comentario, ava_data_avaliacao } = req.body;

            AvaliacaoSchema.parse({ usu_codigo, via_codigo, ava_nota, ava_comentario, ava_data_avaliacao });

            const result = await pool.query(
                `UPDATE avaliacoes SET 
          usu_codigo = $1,
          via_codigo = $2,
          ava_nota = $3,
          ava_comentario = $4,
          ava_data_avaliacao = $5
        WHERE ava_codigo = $6`,
                [usu_codigo, via_codigo, ava_nota, ava_comentario || null, ava_data_avaliacao || new Date().toISOString(), id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ message: "Avaliação não encontrada" });
            }

            return res.status(200).json({ message: "Avaliação atualizada com sucesso" });
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
            console.error('Erro updateAvaliacao:', error);
            return res.status(500).json({ message: error.message });
        }
    }
};

export default AvaliacaoController;
