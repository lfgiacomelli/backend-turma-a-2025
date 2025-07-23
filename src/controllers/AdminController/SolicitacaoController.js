import pool from '../../db/db.js';


const SolicitacaoController = {
  async listar(req, res) {
    try {
      const { pagina = 1, limite = 10 } = req.query;
      const offset = (pagina - 1) * limite;

      const result = await pool.query(
        `SELECT s.*, u.usu_nome FROM solicitacoes s
         INNER JOIN usuarios u ON s.usu_codigo = u.usu_codigo
         ORDER BY sol_data DESC LIMIT $1 OFFSET $2`,
        [limite, offset]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao listar solicitações:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },
  async listarPendentes(req, res) {
    try {
      const { pagina = 1, limite = 10 } = req.query;
      const offset = (pagina - 1) * limite;

      const result = await pool.query(
        `SELECT s.*, u.usu_nome FROM solicitacoes s
         INNER JOIN usuarios u ON s.usu_codigo = u.usu_codigo
         WHERE s.sol_status = 'Pendente' and s.sol_status = 'pendente'
         ORDER BY s.sol_data DESC LIMIT $1 OFFSET $2`,
        [limite, offset]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao listar solicitações pendentes:', error);
      res.status(500).json({ erro: 'Erro interno ao listar solicitações pendentes' });
    }
  },
  async aceitar(req, res) {
    const id_solicitacao = req.params.id;
    const { fun_codigo, ate_codigo } = req.body; 

    if (!id_solicitacao || !fun_codigo || !ate_codigo) {
      return res.status(400).json({ mensagem: 'ID da solicitação, funcionário ou atendimento não fornecido.' });
    }

    try {
      const client = await pool.connect();
      await client.query(
        'UPDATE solicitacoes SET sol_status = $1 WHERE sol_codigo = $2',
        ['aceita', id_solicitacao]
      );

      const { rows } = await client.query(
        'SELECT * FROM solicitacoes WHERE sol_codigo = $1 LIMIT 1',
        [id_solicitacao]
      );

      const solicitacao = rows[0];

      if (!solicitacao) {
        client.release();
        return res.status(404).json({ mensagem: 'Solicitação não encontrada.' });
      }

      await client.query(
        'UPDATE funcionarios SET fun_ativo = FALSE WHERE fun_codigo = $1',
        [fun_codigo]
      );

      await client.query(
        `INSERT INTO viagens (
        fun_codigo, sol_codigo, usu_codigo, ate_codigo, via_origem, via_destino,
        via_valor, via_formapagamento, via_data, via_servico, via_status, via_observacoes
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, NOW(), $9, 'em andamento', $10
      )`,
        [
          fun_codigo,
          id_solicitacao,
          solicitacao.usu_codigo,
          ate_codigo,
          solicitacao.sol_origem,
          solicitacao.sol_destino,
          solicitacao.sol_valor,
          solicitacao.sol_formapagamento,
          solicitacao.sol_servico,
          solicitacao.sol_observacoes
        ]
      );

      client.release();
      return res.json({ mensagem: 'Solicitação aceita com sucesso!' });
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
      return res.status(500).json({ erro: 'Erro interno ao aceitar a solicitação' });
    }
  },
  async recusar(req, res) {
    const id_solicitacao = req.params.id;

    if (!id_solicitacao) {
      return res.status(400).json({ mensagem: 'ID da solicitação é obrigatório.' });
    }

    try {
      await pool.query(
        'UPDATE solicitacoes SET sol_status = $1 WHERE sol_codigo = $2',
        ['recusada', id_solicitacao]
      );

      return res.json({ mensagem: 'Solicitação recusada com sucesso!' });
    } catch (error) {
      console.error('Erro ao recusar solicitação:', error);
      return res.status(500).json({ erro: 'Erro interno ao recusar a solicitação' });
    }
  }
};

export default SolicitacaoController;
