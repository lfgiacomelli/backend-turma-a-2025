import { z } from 'zod';
import pool from '../db/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Schema de validação com Zod
const UsuarioSchema = z.object({
  usu_codigo: z.string().uuid({ message: "Código do usuário inválido" }),
  usu_nome: z.string().min(1, "Nome é obrigatório"),
  usu_telefone: z.string().min(1, "Telefone é obrigatório"),
  usu_email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  usu_senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const UsuarioController = {
  async createUsuario(req, res) {
    try {
      const { usu_codigo, usu_nome, usu_telefone, usu_email, usu_senha } = req.body;

      // Validar dados recebidos
      UsuarioSchema.parse({ usu_codigo, usu_nome, usu_telefone, usu_email, usu_senha });

      // Verificar se email já existe
      const emailExiste = await pool.query('SELECT usu_codigo FROM usuarios WHERE usu_email = $1', [usu_email]);
      if (emailExiste.rowCount > 0) {
        return res.status(409).json({ message: 'Email já está em uso.' });
      }

      // Hash da senha
      const salt = await bcrypt.genSalt(10);
      const hashedSenha = await bcrypt.hash(usu_senha, salt);

      // Inserir usuário no banco
      await pool.query(
        `INSERT INTO usuarios (usu_codigo, usu_nome, usu_telefone, usu_email, usu_senha)
         VALUES ($1, $2, $3, $4, $5)`,
        [usu_codigo, usu_nome, usu_telefone, usu_email, hashedSenha]
      );

      // Criar token JWT para login automático
      const token = jwt.sign(
        { usu_codigo, usu_email },
        process.env.JWT_SECRET || 'segredo_supersecreto',
        { expiresIn: '1d' }
      );

      return res.status(201).json({ message: "Usuário criado com sucesso", token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Erro de validação",
          errors: error.errors.map(err => ({
            atributo: err.path[0],
            message: err.message,
          })),
        });
      }
      console.error('Erro createUsuario:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  async updateUsuario(req, res) {
    try {
      const { id } = req.params;
      const { usu_codigo, usu_nome, usu_telefone, usu_email, usu_senha } = req.body;

      UsuarioSchema.parse({ usu_codigo, usu_nome, usu_telefone, usu_email, usu_senha });

      // Atualiza usuário (exemplo simples)
      const query = `
        UPDATE usuarios SET
          usu_nome = $1,
          usu_telefone = $2,
          usu_email = $3,
          usu_senha = $4
        WHERE usu_codigo = $5
      `;

      const salt = await bcrypt.genSalt(10);
      const hashedSenha = await bcrypt.hash(usu_senha, salt);

      const result = await pool.query(query, [usu_nome, usu_telefone, usu_email, hashedSenha, id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.status(200).json({ message: "Usuário atualizado com sucesso" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Erro de validação",
          details: error.errors,
        });
      }
      console.error('Erro updateUsuario:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  async deleteUsuario(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query('DELETE FROM usuarios WHERE usu_codigo = $1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.status(200).json({ message: "Usuário deletado com sucesso" });
    } catch (error) {
      console.error('Erro deleteUsuario:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  async getAllUsuarios(req, res) {
    try {
      const result = await pool.query('SELECT usu_codigo, usu_nome, usu_telefone, usu_email FROM usuarios');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Erro getAllUsuarios:', error);
      res.status(500).json({ message: error.message });
    }
  },
};

export default UsuarioController;
