import pool from '../../db/db.js';


const ViagemController = {
  async listar(req, res) {
    try {
      const { status, fun_codigo, usu_codigo, pagina = 1, limite = 10 } = req.query;

      let filtroWhere = [];
      let params = [];
      let idx = 1;

      if (status) {
        filtroWhere.push(`via_status = $${idx++}`);
        params.push(status);
      }
      if (fun_codigo) {
        filtroWhere.push(`v.fun_codigo = $${idx++}`);
        params.push(fun_codigo);
      }
      if (usu_codigo) {
        filtroWhere.push(`v.usu_codigo = $${idx++}`);
        params.push(usu_codigo);
      }

      const whereSql = filtroWhere.length ? `WHERE ${filtroWhere.join(' AND ')}` : '';

      const offset = (pagina - 1) * limite;

      const sql = `
       SELECT
  v.via_codigo,
  v.via_origem,
  v.via_destino,
  v.via_valor,
  v.via_formapagamento,
  v.via_data,
  v.via_servico,
  v.via_status,
  v.via_observacoes,
  v.ate_codigo,
  f.fun_nome AS funcionario_nome,
  fa.fun_nome AS atendente_nome, -- novo campo para mostrar o nome do atendente
  u.usu_nome AS usuario_nome
FROM viagens v
LEFT JOIN funcionarios f ON v.fun_codigo = f.fun_codigo           -- funcionário da viagem
LEFT JOIN funcionarios fa ON v.ate_codigo = fa.fun_codigo         -- atendente da viagem
LEFT JOIN usuarios u ON v.usu_codigo = u.usu_codigo
${whereSql}
ORDER BY v.via_data DESC
LIMIT $${idx++} OFFSET $${idx++}

      `;

      params.push(parseInt(limite), parseInt(offset));

      const { rows } = await pool.query(sql, params);

      res.json(rows);

    } catch (error) {
      console.error('Erro ao listar viagens:', error);
      res.status(500).json({ erro: 'Erro ao buscar viagens' });
    }
  },
  async contadorDeViagens(req, res) {
    try {
      const sql = `
        SELECT COUNT(*) AS total_viagens
        FROM viagens
      `;

      const { rows } = await pool.query(sql);

      res.json({ total: parseInt(rows[0].total_viagens, 10) });

    } catch (error) {
      console.error('Erro ao contar viagens:', error);
      res.status(500).json({ erro: 'Erro ao contar viagens' });
    }
  },
  async listarEmAndamento(req, res) {
    try {
      const sql = `
        SELECT 
          v.via_codigo, v.via_origem, v.via_destino, v.via_valor, v.via_formapagamento,
          v.via_data, v.via_servico, v.via_status, v.via_observacoes,
          f.fun_nome AS funcionario_nome,
          u.usu_nome AS usuario_nome
        FROM viagens v
        LEFT JOIN funcionarios f ON v.fun_codigo = f.fun_codigo
        LEFT JOIN usuarios u ON v.usu_codigo = u.usu_codigo
        WHERE v.via_status = 'em andamento'
        ORDER BY v.via_data DESC
      `;

      const { rows } = await pool.query(sql);

      res.json(rows);

    } catch (error) {
      console.error('Erro ao listar viagens em andamento:', error);
      res.status(500).json({ erro: 'Erro ao buscar viagens em andamento' });
    }
  },
  async detalhes(req, res) {
    try {
      const { id } = req.params;

      const sql = `
        SELECT 
          v.via_codigo, v.via_origem, v.via_destino, v.via_valor, v.via_formapagamento,
          v.via_data, v.via_servico, v.via_status, v.via_observacoes,
          f.fun_nome AS funcionario_nome, f.fun_email AS funcionario_email,
          u.usu_nome AS usuario_nome, u.usu_email AS usuario_email,
          a.ate_nome AS atendente_nome
        FROM viagens v
        LEFT JOIN funcionarios f ON v.fun_codigo = f.fun_codigo
        LEFT JOIN usuarios u ON v.usu_codigo = u.usu_codigo
        LEFT JOIN atendentes a ON v.ate_codigo = a.ate_codigo
        WHERE v.via_codigo = $1
        LIMIT 1
      `;

      const { rows } = await pool.query(sql, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ mensagem: 'Viagem não encontrada' });
      }

      res.json(rows[0]);

    } catch (error) {
      console.error('Erro ao buscar detalhes da viagem:', error);
      res.status(500).json({ erro: 'Erro ao buscar detalhes da viagem' });
    }
  },
  async finalizar(req, res) {
    const via_codigo = req.params.id;

    if (!via_codigo) {
      return res.status(400).json({ mensagem: 'Código da viagem é obrigatório.' });
    }


    try {
      const client = await pool.connect();

      const { rows } = await client.query(
        `SELECT v.fun_codigo, v.usu_codigo, u.usu_email
         FROM viagens v
         INNER JOIN usuarios u ON v.usu_codigo = u.usu_codigo
         WHERE v.via_codigo = $1
         LIMIT 1`,
        [via_codigo]
      );

      const viagem = rows[0];

      if (!viagem?.fun_codigo) {
        client.release();
        return res.status(404).json({ mensagem: 'Funcionário ou usuário não encontrado.' });
      }

      await client.query(
        'UPDATE funcionarios SET fun_ativo = TRUE WHERE fun_codigo = $1',
        [viagem.fun_codigo]
      );

      await client.query(
        'UPDATE viagens SET via_status = $1 WHERE via_codigo = $2',
        ['finalizada', via_codigo]
      );

      client.release();
      return res.json({ mensagem: 'Viagem finalizada com sucesso!' });

    } catch (error) {
      console.error('Erro ao finalizar viagem:', error);
      return res.status(500).json({ erro: 'Erro interno ao finalizar a viagem' });
    }
  },

  async finalizarTodas(req, res) {
    try {
      const client = await pool.connect();
      await client.query('BEGIN');

      await client.query(
        `UPDATE viagens SET via_status = 'finalizada' WHERE via_status != 'finalizada'`
      );

      const { rows } = await client.query(`
        SELECT DISTINCT fun_codigo FROM viagens
        WHERE via_status = 'finalizada' AND fun_codigo IS NOT NULL
      `);

      const codigos = rows.map(row => row.fun_codigo);

      if (codigos.length > 0) {
        const placeholders = codigos.map((_, i) => `$${i + 1}`).join(', ');
        await client.query(
          `UPDATE funcionarios SET fun_ativo = TRUE WHERE fun_codigo IN (${placeholders})`,
          codigos
        );
      }

      await client.query('COMMIT');
      client.release();

      return res.json({ mensagem: 'Todas as viagens foram finalizadas e funcionários ativados.' });

    } catch (error) {
      console.error('Erro ao finalizar todas as viagens:', error);
      return res.status(500).json({ erro: 'Erro ao finalizar viagens.' });
    }
  },
  async getSumDistanciaByUsuario(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ erro: 'ID de usuário inválido.' });
      }

      const sql = `
      SELECT COALESCE(SUM(via_distancia), 0) AS total_distancia
      FROM viagens
      WHERE usu_codigo = $1 AND via_distancia IS NOT NULL
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
