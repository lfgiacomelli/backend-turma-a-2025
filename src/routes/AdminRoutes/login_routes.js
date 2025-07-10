import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
import pool from '../../db/db.js';
import { enviarEmail } from '../../utils/email.js';
const JWT_SECRET = process.env.JWT_SECRET_ADMIN;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não definida no .env');
}

router.post('/', async (req, res) => {
    const { fun_email, fun_senha } = req.body;

    if (!fun_email || !fun_senha) {
        return res.status(400).json({ sucesso: false, mensagem: 'Email e senha são obrigatórios.' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM funcionarios WHERE fun_email = $1',
            [fun_email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ sucesso: false, mensagem: 'Funcionário não encontrado.' });
        }

        const funcionario = result.rows[0];

        let hash = funcionario.fun_senha;

        if (!hash) {
            return res.status(500).json({ sucesso: false, mensagem: 'Senha não encontrada no banco.' });
        }

        if (hash.startsWith('$2y$')) {
            hash = '$2a$' + hash.slice(4);
        }

        const senhaValida = await bcrypt.compare(fun_senha, hash);

        if (!senhaValida) {
            return res.status(401).json({ sucesso: false, mensagem: 'Senha inválida.' });
        }

        const token = jwt.sign(
            { id: funcionario.fun_codigo, email: funcionario.fun_email },
            JWT_SECRET_ADMIN,
            { expiresIn: '45d' }
        );

        await enviarEmail({
            to: funcionario.fun_email,
            subject: 'Novo login detectado na sua conta ZoomX',
            text: `Olá, ${funcionario.fun_nome}!
      Acabamos de detectar um novo login na sua conta de funcionário na plataforma ZoomX.
      Se você não reconhece essa atividade, por favor, entre em contato com o suporte imediatamente.
      Se você realizou esse login, não há necessidade de ação adicional.
      Obrigado por usar a ZoomX!`,
        });

        res.json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso!',
            token,
            funcionario: {
                id: funcionario.fun_codigo,
                nome: funcionario.fun_nome,
                email: funcionario.fun_email,
                telefone: funcionario.fun_telefone,
                criado_em: funcionario.fun_created_at,
            },
        });

    } catch (err) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.', erro: err.message });
    }
});

export default router;
