import { z } from 'zod';

const ViagemSchema = z.object({
    via_funcionarioId: z.string().uuid({ message: "ID do funcionário inválido" }),
    via_origem: z.string().min(1, "Origem é obrigatória"),
    via_destino: z.string().min(1, "Destino é obrigatória"),
    via_servico: z.string().min(1, "Serviço é obrigatório"),
    via_status: z.enum(['Pendente', 'Aprovada', 'Rejeitada']),
    via_data: z.preprocess(arg => new Date(arg), z.date({ message: "Data inválida" })),
    via_valor: z.number().positive("O valor deve ser um número positivo"),
    via_solicitacaoId: z.string().uuid({ message: "ID da solicitação inválido" })
});

const ViagemController = {
    async createViagem(req, res) {
        try {
            // Desestruturando o corpo da requisição
            const { via_funcionarioId, via_origem, via_destino, via_servico, via_status, via_data, via_valor, via_solicitacaoId } = req.body;

            // Validando os dados com o Zod
            ViagemSchema.parse({ via_funcionarioId, via_origem, via_destino, via_servico, via_status, via_data, via_valor, via_solicitacaoId });

            res.status(201).json({ message: "Viagem criada com sucesso" });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Erro de validação",
                    errors: error.errors.map(err => ({
                        atributo: err.path[0],
                        message: err.message,
                    }))
                });
            }
            res.status(500).json({ message: error.message });
        }
    },

    async updateViagem(req, res) {
        try {
            const { id } = req.params; // Obtendo o id da URL
            const { via_funcionarioId, via_origem, via_destino, via_servico, via_status, via_data, via_valor, via_solicitacaoId } = req.body;

            // Validando os dados com o Zod
            ViagemSchema.parse({ via_funcionarioId, via_origem, via_destino, via_servico, via_status, via_data, via_valor, via_solicitacaoId });

            res.status(200).json({ message: "Viagem atualizada com sucesso" });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Erro de validação",
                    errors: error.errors.map(err => ({
                        atributo: err.path[0],
                        message: err.message,
                    }))
                });
            }
            res.status(500).json({ message: error.message });
        }
    },

    async deleteViagem(req, res) {
        try {
            const { id } = req.params; 
            res.status(200).json({ message: "Viagem deletada com sucesso" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

export default ViagemController;
