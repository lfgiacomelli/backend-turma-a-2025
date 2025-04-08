import {z} from "zod";

const SolicitacaoSchema = z.object({
    
    nome: z.string().min(1, "Nome é obrigatório"),
    origem: z.string().min(1, "Origem é obrigatória"),
    destino: z.string().min(1, "Destino é obrigatório"),
    servico: z.string().min(1, "Serviço é obrigatório"),
    status: z.enum(['Pendente', 'Aprovada', 'Rejeitada']),
    data: z.preprocess(arg => new Date(arg), z.date({ message: "Data inválida" })),
});

const SolicitacaoController = {
    async createSolicitacao(req, res) {
        try {
            const { nome, origem, destino, servico, status, data } = req.body;
            SolicitacaoSchema.parse({ nome, origem, destino, servico, status, data });
            res.status(201).json({ message: "Solicitação criada com sucesso" });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Erro de validação", errors: error.errors.map(
                        err => ({
                            atributo: err.path[0],
                            message: err.message,
                        })
                    )
                })
            }
            res.status(500).json({ message: error.message });
        }
    },
    async updateSolicitacao(req, res) {
        try {
            const { id } = req.params;
            const { nome, origem, destino,  servico, status, data } = req.body;
            SolicitacaoSchema.parse({ nome, origem, destino,  servico, status, data });
            res.status(200).json({ message: "Solicitação atualizada com sucesso" });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "erro de validação", details: error.errors})
            }
            res.status(500).json({ message: error.message });
        }
    },
    async deleteSolicitacao(req, res){
        try {
            const { id } = req.params;
            res.status(200).json({ message: "Solicitação deletada com sucesso" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    async getSolicitacao(req, res) {
        try {
            const { id } = req.params;
            res.status(200).json({ message: "Solicitação encontrada com sucesso" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
}
export default SolicitacaoController;