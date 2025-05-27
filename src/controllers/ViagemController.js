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
    async getViagemPorUsuario(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID do usuário é obrigatório.' });
        }

        try {
            const result = await pool.query(`
      SELECT 
  v.*, 
  f.fun_nome, 
  m.mot_modelo, 
  m.mot_placa
FROM viagens v
JOIN funcionarios f ON v.fun_codigo = f.fun_codigo
JOIN motocicletas m ON f.fun_codigo = m.fun_codigo
WHERE v.usu_codigo = $1
ORDER BY v.via_data DESC

    `, [id]);

            return res.json(result.rows);
        } catch (error) {
            console.error('Erro ao buscar viagens:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno no servidor.',
                detalhes: error.message
            });
        }
    }

};

export default ViagemController;
