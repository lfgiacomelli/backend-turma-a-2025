import { z } from 'zod';
import pool from '../db/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { enviarEmail } from '../utils/email.js';



const UsuarioSchema = z.object({
  usu_nome: z.string().min(1, "Nome é obrigatório"),
  usu_telefone: z.string().min(1, "Telefone é obrigatório"),
  usu_email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  usu_senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  usu_cpf: z.string().length(11, "CPF deve ter 11 dígitos").optional(),
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
        usu_cpf,
        usu_created_at,
        usu_updated_at,
      } = req.body;

      UsuarioSchema.parse({
        usu_nome,
        usu_telefone,
        usu_ativo,
        usu_email,
        usu_senha,
        usu_cpf,
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
        (usu_nome, usu_telefone, usu_ativo, usu_email, usu_senha, usu_cpf, usu_created_at, usu_updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING usu_codigo`,
        [
          usu_nome,
          usu_telefone,
          usu_ativo,
          usu_email,
          hashedSenha,
          usu_cpf,
          usu_created_at,
          usu_updated_at,
        ]
      );

      const usu_codigo = result.rows[0].usu_codigo;
      const usuarioResult = await pool.query(
        `SELECT usu_codigo, usu_nome, usu_email, usu_telefone, usu_created_at, usu_cpf
       FROM usuarios WHERE usu_codigo = $1`,
        [usu_codigo]
      );

      const usuario = usuarioResult.rows[0];

      const token = jwt.sign(
        { id: usuario.usu_codigo },
        process.env.JWT_SECRET,
        { expiresIn: '45d' }
      );
      try {
        await enviarEmail({
          to: usuario.usu_email,
          subject: 'Seja bem-vindo ao ZoomX!',
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; color: #333;">
              <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h2 style="color: #00c853;">🎉 Bem-vindo ao ZoomX!</h2>

                <p>Olá, <strong>${usuario.usu_nome}</strong>!</p>

                <p>Estamos muito felizes em ter você com a gente! 😊</p>

                <p>Com o <strong>ZoomX</strong>, você tem uma solução prática e rápida para suas corridas e entregas pela cidade.</p>

                <p>Sua conta foi criada com sucesso e você já pode começar a usar o app agora mesmo.</p>
                
                <p>Se tiver qualquer dúvida ou precisar de ajuda, nossa equipe está sempre à disposição.</p>

                <p>Obrigado por escolher o ZoomX! 🙌</p>

                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

                <p style="font-size: 14px; color: #999;">Equipe ZoomX - Mototáxi e Entregas Rápidas</p>
              </div>
            </div>
`

        });

      } catch (error) {
        console.error('Erro ao enviar email de boas-vindas:', error);
        return res.status(500).json({ message: 'Erro ao enviar email de boas-vindas' });

      }


      return res.status(201).json({
        message: "Usuário criado com sucesso",
        usuario: {
          id: usuario.usu_codigo,
          nome: usuario.usu_nome,
          email: usuario.usu_email,
          telefone: usuario.usu_telefone,
          cpf: usuario.usu_cpf,
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

      const result = await pool.query('SELECT usu_codigo, usu_nome, usu_telefone, usu_email, usu_created_at, usu_cpf FROM usuarios WHERE usu_codigo = $1', [id]);
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

  async verificarBanimento(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'SELECT usu_ativo, usu_email FROM usuarios WHERE usu_codigo = $1',
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado." });
      }

      const { usu_ativo, usu_email } = result.rows[0];

      if (!usu_ativo) {
        await enviarEmail({
          to: usu_email,
          subject: 'Aviso de banimento',
          text: `Olá,

Informamos que sua conta na plataforma ZoomX foi desativada devido a atividades que não estão em conformidade com os nossos Termos de Uso e Política de Conduta.

Essa medida visa garantir a segurança e a integridade dos nossos usuários e parceiros. 

Se você acredita que essa ação foi tomada por engano ou deseja recorrer da decisão, entre em contato com nosso suporte pelo e-mail: support@zoomx.com.br. Nossa equipe está disponível para analisar o seu caso.

Atenciosamente,
Equipe ZoomX - Mototáxi e Entregas Rápidas

Este é um e-mail automático. Por favor, não responda diretamente a esta mensagem.`
          ,
          html: `
  <p>Olá,</p>

  <p>Informamos que sua conta na plataforma <strong>ZoomX</strong> foi <strong>desativada</strong> devido a atividades que violam os nossos <a href="https://zoomx.com.br/termos">Termos de Uso</a> e nossa <a href="https://zoomx.com.br/politica-de-conduta">Política de Conduta</a>.</p>

  <p>Essa ação foi tomada para proteger a segurança da comunidade e manter a integridade do nosso serviço.</p>

  <p>Se você acredita que essa medida foi aplicada indevidamente, você pode entrar em contato com nosso time de suporte através do e-mail:</p>

  <p><strong>📧 support@zoomx.com.br</strong></p>

  <p>Nossa equipe está disponível para avaliar sua situação e fornecer esclarecimentos adicionais.</p>

  <p>Atenciosamente,</p>
  <p><strong>Equipe ZoomX</strong><br>Mototáxi e Entregas Rápidas</p>

  <p style="font-size: 12px; color: #888;"><em>Este é um e-mail automático. Por favor, não responda diretamente a esta mensagem.</em></p>
`

        });

        return res.status(401).json({
          sucesso: false,
          mensagem: "Usuário desativado. Faça login novamente para validar sua conta.",
          banido: true,
        });
      }

      return res.status(200).json({ sucesso: true, ativo: true });

    } catch (erro) {
      console.error("Erro ao verificar banimento:", erro);
      return res.status(500).json({ sucesso: false, mensagem: "Erro no servidor." });
    }
  },

  async adicionarPushToken(req, res) {
    const { id } = req.params;
    const { pushToken } = req.body;

    if (!pushToken) {
      return res.status(400).json({ sucesso: false, mensagem: "Push token é obrigatório." });
    }

    try {
      const result = await pool.query(
        `UPDATE usuarios SET push_token = $1 WHERE usu_codigo = $2`,
        [pushToken, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado." });
      }

      return res.status(200).json({ sucesso: true, mensagem: "Push token adicionado com sucesso." });
    } catch (error) {
      console.error("Erro ao adicionar push token:", error);
      return res.status(500).json({ sucesso: false, mensagem: "Erro no servidor." });
    }
  }



};

export default UsuarioController;
