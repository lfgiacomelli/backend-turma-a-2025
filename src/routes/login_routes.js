import express from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
import pool from '../db/db.js';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definida no .env');
}

router.post('/', async (req, res) => {
  const { usu_email, usu_senha } = req.body;

  if (!usu_email || !usu_senha) {
    return res.status(400).json({ sucesso: false, mensagem: 'Email e senha são obrigatórios.' });
  }

  try {
    console.log('🔍 Iniciando login para:', usu_email);

    const result = await pool.query(
      'SELECT * FROM usuarios WHERE usu_email = $1',
      [usu_email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }

    const usuario = result.rows[0];

    if (!usuario.usu_ativo) {
      return res.status(403).json({ sucesso: false, mensagem: 'Usuário banido ou inativo.' });
    }

    let hash = usuario.usu_senha;

    if (!hash) {
      return res.status(500).json({ sucesso: false, mensagem: 'Senha não encontrada no banco.' });
    }

    if (hash.startsWith('$2y$')) {
      hash = '$2a$' + hash.slice(4);
    }

    const senhaValida = await bcrypt.compare(usu_senha, hash);

    if (!senhaValida) {
      return res.status(401).json({ sucesso: false, mensagem: 'Senha inválida.' });
    }

    const token = jwt.sign(
      { id: usuario.usu_codigo, email: usuario.usu_email },
      JWT_SECRET,
      { expiresIn: '45d' }
    );

    res.json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario.usu_codigo,
        nome: usuario.usu_nome,
        email: usuario.usu_email,
        telefone: usuario.usu_telefone,
        criado_em: usuario.usu_created_at,
      },
    });

  } catch (err) {
    console.error('❌ Erro no login:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.', erro: err.message });
  }
});

export default router;
