import { z } from "zod";

const SolicitacaoSchema = z.object({
    sol_nome: z.string().min(1, "Nome é obrigatório"),
    sol_origem: z.string().min(1, "Origem é obrigatória"),
    sol_destino: z.string().min(1, "Destino é obrigatório"),
    sol_servico: z.string().min(1, "Serviço é obrigatório"),
    sol_status: z.enum(['Pendente', 'Aprovada', 'Rejeitada']),
    sol_data: z.preprocess(arg => new Date(arg), z.date({ message: "Data inválida" })),
});

const SolicitacaoController = {
    async createSolicitacao(req, res) {
        try {
            const { sol_nome, sol_origem, sol_destino, sol_servico, sol_status, sol_data } = req.body;
            SolicitacaoSchema.parse({ sol_nome, sol_origem, sol_destino, sol_servico, sol_status, sol_data });
            res.status(201).json({ message: "Solicitação criada com sucesso" });
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
    async updateSolicitacao(req, res) {
        try {
            const { id } = req.params;
            const { sol_nome, sol_origem, sol_destino, sol_servico, sol_status, sol_data } = req.body;
            SolicitacaoSchema.parse({ sol_nome, sol_origem, sol_destino, sol_servico, sol_status, sol_data });
            res.status(200).json({ message: "Solicitação atualizada com sucesso" });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Erro de validação", 
                    details: error.errors
                });
            }
            res.status(500).json({ message: error.message });
        }
    },
    async deleteSolicitacao(req, res) {
        try {
            const { id } = req.params;
            res.status(200).json({ message: "Solicitação deletada com sucesso" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default SolicitacaoController;
