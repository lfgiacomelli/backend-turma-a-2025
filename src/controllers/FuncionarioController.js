import { z } from "zod";

const FuncionarioSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    telefone: z.string().min(1, "Telefone é obrigatório"),
    email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
    cargo: z.string().min(1, "Cargo é obrigatório"),
})

const FuncionarioController = {
    async createFuncionario(req, res) {
        try {
            const { nome, telefone, email, cargo } = req.body;
            FuncionarioSchema.parse({ nome, telefone, email, cargo });
            res.status(201).json({ message: "Funcionario criado com sucesso" });
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
    async updateFuncionario(req, res) {
        try {
            const { id } = req.params;
            const { nome, telefone, email, cargo } = req.body;
            FuncionarioSchema.parse({ nome, telefone, email, cargo });
            res.status(200).json({ message: "Funcionario atualizado com sucesso" });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "erro de validação", details: error.errors})
            }
            res.status(500).json({ message: error.message });
        }
    },
    async deleteFuncionario(req, res){
        try {
            const { id } = req.params;
            res.status(200).json({ message: "Funcionario deletado com sucesso" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    async getFuncionario(req, res) {
        try {
            const { id } = req.params;
            res.status(200).json({ message: "Funcionario encontrado com sucesso" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default FuncionarioController;