import { z } from 'zod';
import pool from '../db/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const UsuarioSchema = z.object({
  usu_nome: z.string().min(1, "Nome é obrigatório"),
  usu_telefone: z.string().min(1, "Telefone é obrigatório"),
  usu_email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  usu_senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  usu_created_at: z.string().optional(),
  usu_updated_at: z.string().optional(),
});


const UsuarioController = {
  async createUsuario(req, res) {
    try {
      // Extrai os dados do corpo da requisição
      const { usu_nome, usu_telefone, usu_ativo, usu_email, usu_senha, usu_created_at, usu_updated_at } = req.body;

      // Valida os dados usando o schema zod
      UsuarioSchema.parse({ usu_nome, usu_telefone, usu_ativo, usu_email, usu_senha, usu_created_at, usu_updated_at });

      // Verifica se já existe um usuário com o email informado
      const emailExiste = await pool.query('SELECT usu_codigo FROM usuarios WHERE usu_email = $1', [usu_email]);
      if (emailExiste.rowCount > 0) {
        return res.status(409).json({ message: 'Email já está em uso.' });
      }

      // Gera um salt e hasheia a senha
      const salt = await bcrypt.genSalt(10);
      const hashedSenha = await bcrypt.hash(usu_senha, salt);

      // Insere o usuário no banco e retorna o código gerado (usu_codigo)
      const result = await pool.query(
        `INSERT INTO usuarios 
      (usu_nome, usu_telefone, usu_ativo, usu_email, usu_senha, usu_created_at, usu_updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING usu_codigo`,
        [usu_nome, usu_telefone, usu_ativo, usu_email, hashedSenha, usu_created_at, usu_updated_at]
      );

      const usu_codigo = result.rows[0].usu_codigo;

      // Gera o token JWT usando a chave secreta do .env
      const token = jwt.sign(
        { codigo: usu_codigo, nome: usu_nome, email: usu_email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Retorna sucesso com o token
      return res.status(201).json({ message: "Usuário criado com sucesso", token });

    } catch (error) {
      // Tratamento de erro de validação com Zod
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Erro de validação",
          errors: error.errors.map(err => ({
            atributo: err.path[0],
            message: err.message,
          })),
        });
      }
      // Erros gerais
      console.error('Erro createUsuario:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  async updateUsuario(req, res) {
    try {
      const { id } = req.params;
      const { usu_codigo, usu_nome, usu_telefone, usu_email, usu_senha, usu_updated_at } = req.body;

      UsuarioSchema.parse({ usu_codigo, usu_nome, usu_telefone, usu_email, usu_senha, usu_updated_at });

      const query = `
        UPDATE usuarios SET
          usu_nome = $1,
          usu_telefone = $2,
          usu_email = $3,
          usu_senha = $4,
          usu_updated_at = NOW()
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
