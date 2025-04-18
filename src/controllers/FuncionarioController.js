import { z } from "zod";

const FuncionarioSchema = z.object({
    fun_codigo: z.string().uuid({ message: "Código do funcionário inválido" }),
    fun_nome: z.string().min(1, "Nome é obrigatório"),
    fun_telefone: z.string().min(1, "Telefone é obrigatório"),
    fun_email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
    fun_cargo: z.string().min(1, "Cargo é obrigatório"),
    fun_cnh: z.string().optional(), 
});

const FuncionarioController = {
    async createFuncionario(req, res) {
        try {
            const { fun_codigo, fun_nome, fun_telefone, fun_email, fun_cargo, fun_cnh } = req.body;
            
            FuncionarioSchema.parse({ fun_codigo, fun_nome, fun_telefone, fun_email, fun_cargo, fun_cnh });
            
            res.status(201).json({ message: "Funcionário criado com sucesso" });
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
            const { fun_codigo, fun_nome, fun_telefone, fun_email, fun_cargo, fun_cnh } = req.body;

            FuncionarioSchema.parse({ fun_codigo, fun_nome, fun_telefone, fun_email, fun_cargo, fun_cnh });

            res.status(200).json({ message: "Funcionário atualizado com sucesso" });
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

            res.status(200).json({ message: "Funcionário deletado com sucesso" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async getFuncionario(req, res) {
        try {
            const data = [
                {
                    fun_codigo: "12345678-1234-1234-1234-123456789012", 
                    fun_nome: "Carlos Souza",
                    fun_telefone: "987654321",
                    fun_email: "carlos.souza@email.com",
                    fun_cargo: "Motorista",
                    fun_cnh: "1234567890",
                },
                {
                    fun_codigo: "87654321-4321-4321-4321-098765432109",
                    fun_nome: "Ana Costa",
                    fun_telefone: "912345678",
                    fun_email: "ana.costa@email.com",
                    fun_cargo: "Entregadora",
                    fun_cnh: "0987654321",
                }
            ];

            res.status(200).json(data); 
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default FuncionarioController;
