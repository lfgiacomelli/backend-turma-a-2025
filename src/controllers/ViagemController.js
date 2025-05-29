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
            const result = await pool.query(
                'SELECT * FROM viagens WHERE usu_codigo = $1 ORDER BY via_data DESC',
                [id]
            );
            return res.json(result.rows);
        } catch (error) {
            console.error('Erro ao buscar viagens:', error);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.', detalhes: error.message });
        }
    },
    async getFuncionarioPorViagem(req, res) {
        const { solicitacaoId } = req.params;

        if (!solicitacaoId) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID da solicitação é obrigatório.'
            });
        }

        try {
            const viagemResult = await pool.query(
                'SELECT via_codigo, fun_codigo FROM viagens WHERE sol_codigo = $1',
                [solicitacaoId]
            );

            if (viagemResult.rows.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Nenhuma viagem encontrada para esta solicitação.'
                });
            }

            const { fun_codigo } = viagemResult.rows[0];

            const funcionarioResult = await pool.query(
                `SELECT 
                f.fun_nome, 
                m.mot_modelo, 
                m.mot_placa
             FROM funcionarios f
             JOIN motocicletas m ON f.fun_codigo = m.fun_codigo
             WHERE f.fun_codigo = $1`,
                [fun_codigo]
            );

            if (funcionarioResult.rows.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Funcionário não encontrado ou não possui motocicleta cadastrada.'
                });
            }

            return res.json({
                sucesso: true,
                funcionario: funcionarioResult.rows[0]
            });

        } catch (error) {
            console.error('Erro ao buscar funcionário:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno no servidor.',
                detalhes: error.message
            });
        }
    },
    async verificarAndamento(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID da viagem é obrigatório.'
            });
        }

        try {
            const result = await pool.query(
                'SELECT * FROM viagens WHERE via_status = $1 AND usu_codigo = $2',
                ['em andamento', id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Viagem não encontrada ou não está em andamento.'
                });
            }

            const viagem = result.rows[0];

            return res.json({
                sucesso: true,
                status: viagem.via_status
            });

        } catch (error) {
            console.error('Erro ao verificar andamento da viagem:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno no servidor.',
                detalhes: error.message
            });
        }
    },
    async getViagemById(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID da viagem é obrigatório.' });
        }

        try {
            const result = await pool.query(
                'SELECT * FROM viagens WHERE via_codigo = $1',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ sucesso: false, mensagem: 'Viagem não encontrada.' });
            }

            return res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar viagem:', error);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.', detalhes: error.message });
        }
    },


};

export default ViagemController;
