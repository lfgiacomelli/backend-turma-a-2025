import { z } from "zod";

const SolicitacaoSchema = z.object({
    sol_codigo: z.string().uuid({ message: "Código da solicitação inválido" }),
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
            const { sol_codigo, sol_nome, sol_origem, sol_destino, sol_servico, sol_status, sol_data } = req.body;
            
            SolicitacaoSchema.parse({ sol_codigo, sol_nome, sol_origem, sol_destino, sol_servico, sol_status, sol_data });
            
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
            const { sol_codigo, sol_nome, sol_origem, sol_destino, sol_servico, sol_status, sol_data } = req.body;
            
            SolicitacaoSchema.parse({ sol_codigo, sol_nome, sol_origem, sol_destino, sol_servico, sol_status, sol_data });
            
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
    },

    async getSolicitacao(req, res) {
        try {
            const data = [
                {
                    sol_codigo: "a7b2e920-b6db-4c82-bd9e-d3b00ec0c5d1", 
                    sol_nome: "Maria Oliveira",
                    sol_origem: "São Paulo",
                    sol_destino: "Rio de Janeiro",
                    sol_servico: "Moto Táxi",
                    sol_status: "Pendente",
                    sol_data: new Date("2023-10-01"),
                },
                {
                    sol_codigo: "b8c2e920-b6db-4c82-bd9e-d3b00ec0c5d2", 
                    sol_nome: "João Silva",
                    sol_origem: "Belo Horizonte",
                    sol_destino: "Salvador",
                    sol_servico: "Moto Entrega",
                    sol_status: "Finalizada",
                    sol_data: new Date("2023-10-02"),
                }
            ];
            res.status(200).json(data); 
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

export default SolicitacaoController;
