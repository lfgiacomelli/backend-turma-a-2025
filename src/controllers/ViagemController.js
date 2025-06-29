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
                `SELECT v.via_codigo, v.via_data, v.via_status, u.usu_nome, u.usu_email
       FROM viagens v
       JOIN usuarios u ON v.usu_codigo = u.usu_codigo
       LEFT JOIN avaliacoes a ON a.via_codigo = v.via_codigo
       WHERE v.usu_codigo = $1
         AND v.via_status = 'finalizada'
         AND a.via_codigo IS NULL
         AND (v.via_email_enviado IS NULL OR v.via_email_enviado = FALSE)
       ORDER BY v.via_data DESC
       LIMIT 1`,
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
                text: `
Olá, ${viagem.usu_nome}!

Esperamos que sua experiência com o ZoomX tenha sido excelente.

Para continuarmos oferecendo um serviço de qualidade, gostaríamos de ouvir sua opinião sobre a sua última viagem.

Basta abrir o app e avaliar — um pop-up estará disponível na tela inicial para facilitar o processo.

Sua avaliação faz toda a diferença para que possamos melhorar cada vez mais.

Obrigado por escolher o ZoomX!

Atenciosamente,
Equipe ZoomX - Mototáxi e Entregas Rápidas
      `,
                html: `
<p>Olá, <strong>${viagem.usu_nome}</strong>!</p>
<p>Esperamos que sua experiência com o <strong>ZoomX</strong> tenha sido excelente.</p>
<p>Para continuarmos oferecendo um serviço de qualidade, gostaríamos de ouvir sua opinião sobre a sua última viagem.</p>
<p>
  <a href="zoomx://avaliar" style="display:inline-block; padding:10px 20px; background:#007bff; color:#fff; text-decoration:none; border-radius:5px;">
    Avaliar agora
  </a>
</p>
<p>Ao abrir o app, você verá um pop-up na tela inicial para facilitar sua avaliação.</p>
<p>Sua opinião faz toda a diferença para que possamos melhorar cada vez mais.</p>
<p>Obrigado por escolher o ZoomX!</p>
<p><em>Equipe ZoomX - Mototáxi e Entregas Rápidas</em></p>
      `
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
};

export default ViagemController;
