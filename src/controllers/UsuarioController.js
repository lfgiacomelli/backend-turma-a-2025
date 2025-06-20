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
      const {
        usu_nome,
        usu_telefone,
        usu_ativo,
        usu_email,
        usu_senha,
        usu_created_at,
        usu_updated_at,
      } = req.body;

      UsuarioSchema.parse({
        usu_nome,
        usu_telefone,
        usu_ativo,
        usu_email,
        usu_senha,
        usu_created_at,
        usu_updated_at,
      });

      const emailExiste = await pool.query(
        'SELECT usu_codigo FROM usuarios WHERE usu_email = $1',
        [usu_email]
      );
      if (emailExiste.rowCount > 0) {
        return res.status(409).json({ message: 'Email já está em uso.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedSenha = await bcrypt.hash(usu_senha, salt);

      const result = await pool.query(
        `INSERT INTO usuarios 
        (usu_nome, usu_telefone, usu_ativo, usu_email, usu_senha, usu_created_at, usu_updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING usu_codigo`,
        [
          usu_nome,
          usu_telefone,
          usu_ativo,
          usu_email,
          hashedSenha,
          usu_created_at,
          usu_updated_at,
        ]
      );

      const usu_codigo = result.rows[0].usu_codigo;

      const usuarioResult = await pool.query(
        `SELECT usu_codigo, usu_nome, usu_email, usu_telefone, usu_created_at 
       FROM usuarios WHERE usu_codigo = $1`,
        [usu_codigo]
      );

      const usuario = usuarioResult.rows[0];

      const token = jwt.sign(
        { id: usuario.usu_codigo },
        process.env.JWT_SECRET,
        { expiresIn: '45d' }
      );
      return res.status(201).json({
        message: "Usuário criado com sucesso",
        usuario: {
          id: usuario.usu_codigo,
          nome: usuario.usu_nome,
          email: usuario.usu_email,
          telefone: usuario.usu_telefone,
          criado_em: usuario.usu_created_at,
        },
        token: token
      });

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
  async getUsuarioById(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query('SELECT usu_codigo, usu_nome, usu_telefone, usu_email, usu_created_at FROM usuarios WHERE usu_codigo = $1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Erro getUsuarioById:', error);
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
