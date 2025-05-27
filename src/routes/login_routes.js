import express from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const router = express.Router();

// Database connection details from your Render.com PostgreSQL service
// It's highly recommended to use environment variables for these in production
const dbConfig = {
  user: process.env.DB_USER || 'smithgg415',
  host: process.env.DB_HOST || 'dpg-d0kgkoruibrs739hd8f0-a.oregon-postgres.render.com',
  database: process.env.DB_DATABASE || 'zoomx_tcc',
  password: process.env.DB_PASSWORD || 'Jtn5fpob64g18cD9hlsZ6cXHPtoK6jTd',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === 'production', // Enforce SSL in production
    // If you have a CA certificate from Render, you might need to configure it here
    // ca: process.env.DB_SSL_CA_CERT,
  }
};

// If Render provides a DATABASE_URL, you can use that directly
const connectionString = process.env.DATABASE_URL;

const pool = new Pool(connectionString ? { connectionString, ssl: dbConfig.ssl } : dbConfig);

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Exit the process on critical DB error
});

router.post('/', async (req, res) => {
  const { usu_email, usu_senha } = req.body;

  if (!usu_email || !usu_senha) {
    return res.status(400).json({ sucesso: false, mensagem: 'Email e senha são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      'SELECT usu_codigo, usu_nome, usu_email, usu_senha FROM usuarios WHERE usu_email = $1',
      [usu_email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ sucesso: false, mensagem: 'Usuário não encontrado. Verifique o email digitado.' });
    }

    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(usu_senha, usuario.usu_senha);

    if (!senhaValida) {
      return res.status(401).json({ sucesso: false, mensagem: 'Senha inválida. Tente novamente.' });
    }

    // Login successful
    res.json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso!',
      usuario: {
        id: usuario.usu_codigo,
        nome: usuario.usu_nome,
        email: usuario.usu_email
        // Do not send the password hash back to the client
      }
    });

  } catch (erro) {
    console.error('Erro no login:', erro);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor. Por favor, tente novamente mais tarde.' });
  }
});

export default router;
