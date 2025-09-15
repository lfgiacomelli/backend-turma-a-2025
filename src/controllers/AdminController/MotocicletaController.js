import pool from '../../db/db.js';
import { enviarEmail } from '../../utils/email.js';
const MotocicletaController = {
  async listar(req, res) {
    try {

      const query = `
          SELECT 
          m.mot_codigo, 
          m.mot_modelo, 
          m.mot_placa, 
          m.mot_ano, 
          m.mot_cor, 
          m.fun_codigo,
          f.fun_nome
        FROM motocicletas m
        INNER JOIN funcionarios f ON m.fun_codigo = f.fun_codigo
        ORDER BY m.mot_modelo`;

      const result = await pool.query(query);

      res.json(result.rows);
    }
    catch (error) {
      console.error('Erro ao listar motocicletas:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },
  async adicionar(req, res) {
    const { mot_modelo, mot_placa, mot_ano, mot_cor, fun_codigo } = req.body;

    if (!mot_modelo) {
      return res.status(400).json({ message: "O modelo da motocicleta é obrigatório." });
    }

    try {
      const result = await pool.query(
        `INSERT INTO motocicletas (mot_modelo, mot_placa, mot_ano, mot_cor, fun_codigo)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [mot_modelo, mot_placa, mot_ano, mot_cor, fun_codigo]
      );

      const motoAdicionada = result.rows[0];

      const emailResult = await pool.query(
        `SELECT fun_email, fun_nome FROM funcionarios WHERE fun_codigo = $1`,
        [fun_codigo]
      );

      const funEmail = emailResult.rows[0]?.fun_email;
      const funNome = emailResult.rows[0]?.fun_nome;

      if (funEmail) {
        try {
          await enviarEmail({
            to: funEmail,
            subject: 'Motocicleta cadastrada',
            html: `
              <!DOCTYPE html>
              <html lang="pt-BR">
              <head>
                <meta charset="UTF-8">
                <title>Motocicleta cadastrada</title>
              </head>
              <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
                <center style="width:100%;padding:30px 12px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                    <tr>
                      <td style="padding:24px 20px;text-align:left;">
                        <h2 style="margin:0 0 16px 0;color:#111827;font-size:22px;">Olá, <span style="color:#007bff;">${funNome}</span>!</h2>

                        <p style="margin:0 0 18px 0;color:#444;font-size:15px;line-height:1.5;">
                          A motocicleta abaixo foi cadastrada com sucesso em nosso sistema:
                        </p>

                        <!-- Card de informações -->
                        <table cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                          <tr>
                            <td style="background:#f9fafb;padding:10px 14px;font-size:14px;color:#555;font-weight:bold;">Modelo</td>
                            <td style="padding:10px 14px;font-size:14px;color:#111827;">${mot_modelo}</td>
                          </tr>
                          <tr>
                            <td style="background:#f9fafb;padding:10px 14px;font-size:14px;color:#555;font-weight:bold;">Placa</td>
                            <td style="padding:10px 14px;font-size:14px;color:#111827;">${mot_placa}</td>
                          </tr>
                          <tr>
                            <td style="background:#f9fafb;padding:10px 14px;font-size:14px;color:#555;font-weight:bold;">Ano</td>
                            <td style="padding:10px 14px;font-size:14px;color:#111827;">${mot_ano}</td>
                          </tr>
                          <tr>
                            <td style="background:#f9fafb;padding:10px 14px;font-size:14px;color:#555;font-weight:bold;">Cor</td>
                            <td style="padding:10px 14px;font-size:14px;color:#111827;">${mot_cor}</td>
                          </tr>
                        </table>

                        <p style="margin:20px 0 15px 0;color:#444;font-size:15px;line-height:1.5;">
                          Com isso, você estará apto(a) a receber solicitações de serviço, desde que esteja disponível e com todas as pendências de pagamento da diária devidamente regularizadas.
                        </p>

                        <p style="margin:0 0 20px 0;color:#444;font-size:15px;line-height:1.5;">
                          Por gentileza, revise as informações acima. Caso identifique qualquer dado incorreto, entre em contato com a equipe de gestão para realizar as devidas correções.
                        </p>

                        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">

                        <p style="margin:0;font-size:14px;color:#555;">
                          Atenciosamente,<br>
                          <strong>Equipe ZoomX</strong>
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="font-size:11px;color:#999;margin-top:12px;">
                    Este é um e-mail automático. Não responda diretamente a esta mensagem.
                  </p>
                </center>
              </body>
              </html>
  `
          });

        } catch (emailError) {
          console.error('Erro ao enviar e-mail:', emailError.message);
        }
      }


      res.status(201).json(motoAdicionada);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao adicionar motocicleta', error: error.message });
    }
  },


  async editar(req, res) {
    try {
      const { id } = req.params;
      const { mot_modelo, mot_placa, mot_ano, mot_cor } = req.body;


      const query = `
        UPDATE motocicletas 
        SET mot_modelo = $1, mot_placa = $2, mot_ano = $3, mot_cor = $4
        WHERE mot_codigo = $5
      `;

      await pool.query(query, [mot_modelo, mot_placa, mot_ano, mot_cor, id]);

      res.json({ mensagem: 'Motocicleta editada com sucesso!' });

    } catch (error) {
      console.error('Erro ao editar motocicleta:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },

  async excluir(req, res) {
    try {
      const { id } = req.params;

      const query = 'DELETE FROM motocicletas WHERE mot_codigo = $1';

      await pool.query(query, [id]);

      res.json({ mensagem: 'Motocicleta excluída com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir motocicleta:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },

  async getMotorcycleById(req, res) {
    const { funCodigo } = req.params;

    try {
      const result = await pool.query(`
        SELECT * FROM motocicletas WHERE fun_codigo = $1
      `, [funCodigo]);

      if (result.rows.length === 0) {
        return res.status(404).json({ mensagem: 'Motocicleta não encontrada' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar motocicleta por ID:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  }
};

export default MotocicletaController;
