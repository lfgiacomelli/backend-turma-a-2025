import { z } from "zod";

const FuncionarioSchema = z.object({
    fun_nome: z.string().min(1, "Nome é obrigatório"),
    fun_telefone: z.string().min(1, "Telefone é obrigatório"),
    fun_email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
    fun_cargo: z.string().min(1, "Cargo é obrigatório"),
    fun_cnh: z.string().optional(),
});

const FuncionarioController = {
    async createFuncionario(req, res) {
        try {
            const { fun_nome, fun_telefone, fun_email, fun_cargo, fun_cnh } = req.body;
            FuncionarioSchema.parse({ fun_nome, fun_telefone, fun_email, fun_cargo, fun_cnh });
            res.status(201).json({ message: "Funcionario criado com sucesso" });
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
    async updateFuncionario(req, res) {
        try {
            const { id } = req.params;
            const { fun_nome, fun_telefone, fun_email, fun_cargo, fun_cnh } = req.body;
            FuncionarioSchema.parse({ fun_nome, fun_telefone, fun_email, fun_cargo, fun_cnh });
            res.status(200).json({ message: "Funcionario atualizado com sucesso" });
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
    async deleteFuncionario(req, res) {
        try {
            const { id } = req.params;
            res.status(200).json({ message: "Funcionario deletado com sucesso" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default FuncionarioController;
