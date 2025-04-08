import { z } from 'zod';

const ViagemSchema = z.object({
    funcionarioId: z.string().uuid({ message: "ID do funcionário inválido" }),
    origem: z.string().min(1, "Origem é obrigatória"),
    destino: z.string().min(1, "Destino é obrigatória"),
    servico: z.string().min(1, "Serviço é obrigatório"),
    status: z.enum(['Pendente', 'Aprovada', 'Rejeitada']),
    data: z.preprocess(arg => new Date(arg), z.date({ message: "Data inválida" })),
    valor: z.number().positive("O valor deve ser um número positivo"),
    solicitacaoId: z.string().uuid({ message: "ID da solicitação inválido" })
});

const ViagemController = {
    async createViagem(req, res) {
        try {
            const { funcionarioId, origem, destino, servico, status, data, valor, solicitacaoId } = req.body;

            ViagemSchema.parse({ funcionarioId, origem, destino, servico, status, data, valor, solicitacaoId });

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
            const { id } = req.params;
            const { funcionarioId, origem, destino, servico, status, data, valor, solicitacaoId } = req.body;

            ViagemSchema.parse({ funcionarioId, origem, destino, servico, status, data, valor, solicitacaoId });

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

    async getViagem(req, res) {
        try {
            const { id } = req.params;
            res.status(200).json({ message: "Viagem encontrada com sucesso" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default ViagemController;
