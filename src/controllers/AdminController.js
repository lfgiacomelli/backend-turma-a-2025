import { z } from "zod";

const AdminSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    telefone: z.string().min(1, "Telefone é obrigatório"),
    email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const AdminController = {
    async createAdmin(req, res) {
        try {
            const { nome, telefone, email, senha } = req.body;
            AdminSchema.parse({ nome, telefone, email, senha });
            res.status(201).json({ message: "Admin criado com sucesso" });
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
    async updateAdmin(req, res) {
        try {
            const { id } = req.params;
            const { nome, telefone, email, senha } = req.body;
            AdminSchema.parse({ nome, telefone, email, senha });
            res.status(200).json({ message: "Admin atualizado com sucesso" });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "erro de validação", details: error.errors
                })
            }
            res.status(500).json({ message: error.message });
        }
    },
    async deleteAdmin(req, res) {
        try {
            const { id } = req.params;
            res.status(200).json({ message: "Admin deletado com sucesso" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    async getAdmin(req, res) {
        try {
            const { id } = req.params;
            res.status(200).json({ message: "Admin encontrado com sucesso" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
export default AdminController;