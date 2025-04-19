import { z } from 'zod';

const ViagemSchema = z.object({
    via_codigo: z.string().uuid({ message: "Código da viagem inválido" }),
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
            const { via_codigo, via_funcionarioId, via_origem, via_destino, via_servico, via_status, via_data, via_valor, via_solicitacaoId } = req.body;

            ViagemSchema.parse({ via_codigo, via_funcionarioId, via_origem, via_destino, via_servico, via_status, via_data, via_valor, via_solicitacaoId });

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
            const {via_codigo, via_funcionarioId, via_origem, via_destino, via_servico, via_status, via_data, via_valor, via_solicitacaoId } = req.body;

            ViagemSchema.parse({via_codigo, via_funcionarioId, via_origem, via_destino, via_servico, via_status, via_data, via_valor, via_solicitacaoId });

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
            const data = [
                {
                    via_codigo: '1',
                    via_funcionarioId: '10',
                    via_origem: 'Rua das araras',
                    via_destino: 'Rua dos lagos',
                    via_servico: 'Moto Táxi',
                    via_status: 'Pendente',
                    via_data: new Date(),
                    via_valor: 10.00,
                    via_solicitacaoId: '1'
                },
                {
                    via_codigo: '2',
                    via_funcionarioId: '11',
                    via_origem: 'Rua das flores',
                    via_destino: 'Rua dos girassóis',
                    via_servico: 'Moto Entrega',
                    via_status: 'Aprovada',
                    via_data: new Date(),
                    via_valor: 20.00,
                    via_solicitacaoId: '2'
                },
                {
                    via_codigo: '3',
                    via_funcionarioId: '12',
                    via_origem: 'Rua dos pássaros',
                    via_destino: 'Rua das estrelas',
                    via_servico: 'Moto Táxi',
                    via_status: 'Rejeitada',
                    via_data: new Date(),
                    via_valor: 30.00,
                    via_solicitacaoId: '3'
                }
            ];
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    

};

export default ViagemController;
