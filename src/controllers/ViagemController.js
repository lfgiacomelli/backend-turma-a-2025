import { z } from 'zod';
import pool from '../db/db.js';
import { enviarEmail } from '../utils/email.js';

const ViagemSchema = z.object({
    via_codigo: z.string().uuid({ message: "Código da viagem inválido" }),
    via_funcionarioId: z.string().uuid({ message: "ID do funcionário inválido" }),
    via_origem: z.string().min(1, "Origem é obrigatória"),
    via_destino: z.string().min(1, "Destino é obrigatório"),
    via_atendenteCodigo: z.string().uuid({ message: "Código do atendente inválido" }).optional(),
    usu_codigo: z.string().uuid({ message: "ID do usuário inválido" }).optional(),
    via_formapagamento: z.string().min(1, "Forma de pagamento é obrigatória").optional(),
    via_observacoes: z.string().max(500, "Observações não podem exceder 500 caracteres").optional(),
    via_servico: z.string().min(1, "Serviço é obrigatório"),
    via_status: z.enum(['Pendente', 'Aprovada', 'Rejeitada', 'finalizada']),
    via_data: z.preprocess(arg => {
        if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
        return arg;
    }, z.date({ message: "Data inválida" })),
    via_valor: z.number().positive("O valor deve ser um número positivo"),
    via_solicitacaoId: z.string().uuid({ message: "ID da solicitação inválido" }),
});

const ViagemController = {
    async getViagemPorUsuario(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID do usuário é obrigatório.' });
        }

        try {
            const result = await pool.query(
                'SELECT * FROM viagens WHERE usu_codigo = $1 ORDER BY via_data DESC',
                [id]
            );
            return res.json(result.rows);
        } catch (error) {
            console.error('Erro ao buscar viagens:', error);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.', detalhes: error.message });
        }
    },

    async getFuncionarioPorViagem(req, res) {
        const { solicitacaoId } = req.params;

        if (!solicitacaoId) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID da solicitação é obrigatório.'
            });
        }

        try {
            const viagemResult = await pool.query(
                'SELECT via_codigo, fun_codigo FROM viagens WHERE sol_codigo = $1',
                [solicitacaoId]
            );

            if (viagemResult.rows.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Nenhuma viagem encontrada para esta solicitação.'
                });
            }

            const { fun_codigo } = viagemResult.rows[0];

            const funcionarioResult = await pool.query(
                `SELECT 
           f.fun_nome, f.fun_telefone,
           m.mot_modelo, 
           m.mot_placa
         FROM funcionarios f
         JOIN motocicletas m ON f.fun_codigo = m.fun_codigo
         WHERE f.fun_codigo = $1`,
                [fun_codigo]
            );

            if (funcionarioResult.rows.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Funcionário não encontrado ou não possui motocicleta cadastrada.'
                });
            }

            return res.json({
                sucesso: true,
                funcionario: funcionarioResult.rows[0]
            });

        } catch (error) {
            console.error('Erro ao buscar funcionário:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno no servidor.',
                detalhes: error.message
            });
        }
    },

    async getUltimaViagemNaoAvaliada(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID do usuário é obrigatório.'
            });
        }

        try {
            const result = await pool.query(
                `
                    SELECT v.via_codigo,
       v.via_data,
       v.via_status,
       u.usu_nome,
       u.usu_email,
       f.fun_nome
FROM viagens v
JOIN usuarios u 
  ON v.usu_codigo = u.usu_codigo
LEFT JOIN avaliacoes a 
  ON a.via_codigo = v.via_codigo
LEFT JOIN funcionarios f
  ON f.fun_codigo = v.fun_codigo
WHERE v.usu_codigo = $1
  AND v.via_status = 'finalizada'
  AND a.via_codigo IS NULL
  AND (v.via_email_enviado IS NULL OR v.via_email_enviado = FALSE)
ORDER BY v.via_data DESC
LIMIT 1;

                `,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Nenhuma viagem finalizada sem avaliação encontrada para este usuário ou email já enviado.'
                });
            }

            const viagem = result.rows[0];

            await enviarEmail({
                to: viagem.usu_email,
                subject: 'Ajude-nos a melhorar: Avalie sua última viagem no ZoomX!',
                html: `
                    <!DOCTYPE html>
                    <html lang="pt-BR">
                    <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width,initial-scale=1">
                    <title>Avalie sua viagem</title>
                    </head>
                    <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
                    <center style="width:100%;padding:30px 12px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                        <tr>
                            <td style="padding:25px 20px;text-align:center;">
                            <h2 style="margin:0 0 12px 0;color:#111827;font-size:22px;">Olá, <span style="color:#007bff;">${viagem.usu_nome}</span>!</h2>
                            <p style="margin:0 0 18px 0;color:#444;font-size:15px;line-height:1.5;">
                                Esperamos que sua experiência com o <strong>ZoomX</strong> tenha sido excelente 🚀.  
                                Para continuarmos oferecendo um serviço de qualidade, gostaríamos de ouvir sua opinião sobre a sua última viagem.
                            </p>

                            <!-- Estrelas -->
                            <div style="margin:20px 0;">
                                <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                                <tr>
                                    ${[1, 2, 3, 4, 5].map(num => `
                                    <td style="padding:0 4px;">
                                        <a href="zoomx://AvaliarViagem/${viagem.via_codigo}?rating=${num}" target="_blank" style="text-decoration:none;">
                                        <span style="font-size:32px;color:#ffcc00;">★</span>
                                        </a>
                                    </td>
                                    `).join('')}
                                </tr>
                                </table>
                                <p style="margin:8px 0 0 0;font-size:13px;color:#666;">Clique em uma estrela para avaliar</p>
                            </div>

                            <!-- Botão -->
                            <div style="margin:20px 0;">
                                <a href="zoomx://AvaliarViagem/${viagem.via_codigo}" target="_blank"
                                style="display:inline-block;padding:12px 28px;background:#007bff;color:#fff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:6px;">
                                Avaliar agora
                                </a>
                            </div>

                            <p style="margin:16px 0 0 0;font-size:14px;color:#555;line-height:1.5;">
                                Ao abrir o app, você verá um pop-up na tela inicial para facilitar sua avaliação.<br>
                                Sua opinião faz toda a diferença para que possamos melhorar cada vez mais 🙌
                            </p>

                            <hr style="border:none;border-top:1px solid #eee;margin:25px 0;">

                            <p style="margin:0;font-size:13px;color:#777;">
                                Obrigado por escolher o ZoomX!<br>
                                <em>Equipe ZoomX - Mototáxi e Entregas Rápidas</em>
                            </p>
                            </td>
                        </tr>
                        </table>
                        <p style="font-size:11px;color:#aaa;margin-top:10px;">
                        Este é um e-mail automático. Por favor, não responda.
                        </p>
                    </center>
                    </body>
                    </html>`
            });


            await pool.query(
                `UPDATE viagens SET via_email_enviado = TRUE WHERE via_codigo = $1`,
                [viagem.via_codigo]
            );

            return res.json({
                sucesso: true,
                viagem
            });

        } catch (error) {
            console.error('Erro ao buscar última viagem não avaliada:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno no servidor.',
                detalhes: error.message
            });
        }
    },

    async verificarUltimaViagem(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID do usuário é obrigatório.'
            });
        }

        try {
            const result = await pool.query(
                `SELECT v.*, s.sol_distancia 
         FROM viagens v 
         JOIN solicitacoes s ON v.sol_codigo = s.sol_codigo 
         WHERE v.usu_codigo = $1 
         ORDER BY v.via_data DESC 
         LIMIT 1`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Nenhuma viagem encontrada para este usuário.'
                });
            }

            const viagem = result.rows[0];
            return res.json({
                sucesso: true,
                viagem
            });

        } catch (error) {
            console.error('Erro ao buscar última viagem:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno no servidor.',
                detalhes: error.message
            });
        }
    },

    async getViagemById(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID da viagem é obrigatório.' });
        }

        try {
            const result = await pool.query(
                'SELECT * FROM viagens WHERE via_codigo = $1',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ sucesso: false, mensagem: 'Viagem não encontrada.' });
            }

            return res.json(result.rows[0]);

        } catch (error) {
            console.error('Erro ao buscar viagem:', error);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.', detalhes: error.message });
        }
    },
    async getSumDistanciaByUsuario(req, res) {
        try {
            const { id } = req.params;

            // Validação simples
            if (!id || isNaN(id)) {
                return res.status(400).json({ erro: 'ID de usuário inválido.' });
            }

            const sql = `
                    SELECT COALESCE(SUM(sol_distancia), 0) AS total_distancia
                    FROM solicitacoes
                    WHERE usu_codigo = $1 AND sol_status = 'aceita' AND sol_distancia IS NOT NULL
            `;

            const { rows } = await pool.query(sql, [id]);

            return res.status(200).json({
                total_distancia: Number(rows[0].total_distancia)
            });
        } catch (error) {
            console.error(`Erro ao buscar soma de distâncias para usuário ${req.params.id}:`, error);
            return res.status(500).json({ erro: 'Erro interno ao buscar soma de distâncias.' });
        }
    }

};

export default ViagemController;
