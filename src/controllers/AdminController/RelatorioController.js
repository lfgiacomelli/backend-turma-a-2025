import pool from "../../db/db.js";
class RelatorioController {

  static async getRelatorios(req, res) {
    try {
      let { data_inicio, data_fim } = req.query;

      const hoje = new Date();
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(hoje.getDate() - 30);

      data_inicio = data_inicio || trintaDiasAtras.toISOString().slice(0, 10);
      data_fim = data_fim || hoje.toISOString().slice(0, 10);

      if (data_inicio > data_fim) [data_inicio, data_fim] = [data_fim, data_inicio];

      const sqlUsuarios = `
        SELECT 
          COUNT(*) AS total,
          SUM(CASE WHEN usu_ativo THEN 1 ELSE 0 END) AS ativos,
          SUM(CASE WHEN NOT usu_ativo THEN 1 ELSE 0 END) AS banidos,
          SUM(CASE WHEN DATE(usu_created_at) BETWEEN $1 AND $2 THEN 1 ELSE 0 END) AS novos
        FROM usuarios
      `;

      const sqlCorridas = `
        SELECT
          COUNT(*) AS total,
          COALESCE(SUM(CASE WHEN via_status = 'finalizada' THEN 1 ELSE 0 END),0) AS finalizadas,
          COALESCE(SUM(CASE WHEN via_status = 'em andamento' THEN 1 ELSE 0 END),0) AS em_andamento,
          COALESCE(AVG(via_valor),0) AS valor_medio,
          COALESCE(SUM(via_valor),0) AS faturamento_total
        FROM viagens
        WHERE via_data::date BETWEEN $1 AND $2
      `;

      const sqlCanceladas = `
        SELECT COUNT(*) AS canceladas
        FROM solicitacoes
        WHERE sol_status = 'recusada' AND sol_data::date BETWEEN $1 AND $2
      `;

      const sqlUsuariosAtivos = `
        SELECT u.usu_nome, COUNT(v.via_codigo) AS total_corridas, COALESCE(SUM(v.via_valor),0) AS total_gasto
        FROM usuarios u
        LEFT JOIN viagens v ON u.usu_codigo = v.usu_codigo AND v.via_data::date BETWEEN $1 AND $2
        GROUP BY u.usu_codigo
        ORDER BY total_corridas DESC
        LIMIT 5
      `;

      const sqlMototaxistasAtivos = `
        SELECT
          f.fun_nome,
          COUNT(v.via_codigo) AS total_corridas,
          COALESCE(SUM(v.via_valor),0) AS total_faturado,
          COALESCE(AVG(a.ava_nota),0) AS media_avaliacao
        FROM funcionarios f
        LEFT JOIN viagens v ON f.fun_codigo = v.fun_codigo AND v.via_data::date BETWEEN $1 AND $2
        LEFT JOIN avaliacoes a ON v.via_codigo = a.via_codigo
        WHERE f.fun_cargo = 'Mototaxista'
        GROUP BY f.fun_nome, f.fun_codigo
        ORDER BY total_corridas DESC
        LIMIT 5
      `;

      const sqlReceita = `
        SELECT TO_CHAR(via_data, 'YYYY-MM') AS mes,
               SUM(via_valor) AS total,
               COUNT(*) AS total_corridas
        FROM viagens
        WHERE via_status = 'finalizada'
          AND via_data >= DATE_TRUNC('month', NOW()) - INTERVAL '12 months'
          AND via_data < DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
        GROUP BY TO_CHAR(via_data, 'YYYY-MM')
        ORDER BY mes ASC
      `;

      const sqlStatusCorridas = `
        SELECT via_status, COUNT(*) AS total
        FROM viagens
        WHERE via_data::date BETWEEN $1 AND $2
        GROUP BY via_status
      `;

      const sqlHorariosPico = `
        SELECT EXTRACT(HOUR FROM via_data) AS hora, COUNT(*) AS total_corridas
        FROM viagens
        WHERE via_data::date BETWEEN $1 AND $2
        GROUP BY EXTRACT(HOUR FROM via_data)
        ORDER BY total_corridas DESC
        LIMIT 5
      `;

      const sqlRotasPopulares = `
        SELECT via_origem || ' → ' || via_destino AS rota,
               COUNT(*) AS total_viagens,
               COALESCE(AVG(via_valor),0) AS valor_medio
        FROM viagens
        WHERE via_data::date BETWEEN $1 AND $2
        GROUP BY via_origem, via_destino
        ORDER BY total_viagens DESC
        LIMIT 5
      `;

      const [
        usuariosResult,
        corridasResult,
        canceladasResult,
        usuariosAtivosResult,
        mototaxistasAtivosResult,
        receitaResult,
        statusCorridasResult,
        horariosPicoResult,
        rotasPopularesResult
      ] = await Promise.all([
        pool.query(sqlUsuarios, [data_inicio, data_fim]),
        pool.query(sqlCorridas, [data_inicio, data_fim]),
        pool.query(sqlCanceladas, [data_inicio, data_fim]),
        pool.query(sqlUsuariosAtivos, [data_inicio, data_fim]),
        pool.query(sqlMototaxistasAtivos, [data_inicio, data_fim]),
        pool.query(sqlReceita),
        pool.query(sqlStatusCorridas, [data_inicio, data_fim]),
        pool.query(sqlHorariosPico, [data_inicio, data_fim]),
        pool.query(sqlRotasPopulares, [data_inicio, data_fim]),
      ]);

      const usuarios = usuariosResult.rows[0];
      const corridas = corridasResult.rows[0];
      const canceladas = canceladasResult.rows[0];

      corridas.finalizadas = parseInt(corridas.finalizadas || 0, 10);
      corridas.em_andamento = parseInt(corridas.em_andamento || 0, 10);
      corridas.valor_medio = parseFloat(corridas.valor_medio || 0).toFixed(2);
      corridas.faturamento_total = parseFloat(corridas.faturamento_total || 0).toFixed(2);
      corridas.canceladas = parseInt(canceladas.canceladas || 0, 10);

      const receitaMensal = receitaResult.rows;
      const labelsMeses = receitaMensal.map(item => {
        const [ano, mes] = item.mes.split('-');
        return new Date(ano, mes - 1).toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
      });
      const valoresReceita = receitaMensal.map(item => parseFloat(item.total));
      const valoresCorridas = receitaMensal.map(item => parseInt(item.total_corridas, 10));

      const statusCorridas = statusCorridasResult.rows;
      const labelsStatus = statusCorridas.map(item => item.via_status.charAt(0).toUpperCase() + item.via_status.slice(1));
      const valoresStatus = statusCorridas.map(item => parseInt(item.total, 10));
      const coresStatus = {
        'finalizada': 'rgba(40, 167, 69, 0.8)',
        'recusada': 'rgba(220, 53, 69, 0.8)',
        'em andamento': 'rgba(255, 193, 7, 0.8)',
        'pendente': 'rgba(108, 117, 125, 0.8)'
      };

      const horariosPico = horariosPicoResult.rows.map(h => {
        const hora = h.hora;
        let periodo = 'noite';
        if (hora >= 5 && hora < 12) periodo = 'manhã';
        else if (hora >= 12 && hora < 18) periodo = 'tarde';
        return { hora: `${hora.toString().padStart(2, '0')}:00`, total: h.total_corridas, periodo };
      });

      return res.json({
        data_inicio,
        data_fim,
        usuarios,
        corridas,
        usuariosAtivos: usuariosAtivosResult.rows,
        mototaxistasAtivos: mototaxistasAtivosResult.rows,
        receitaMensal: { labels: labelsMeses, valoresReceita, valoresCorridas },
        statusCorridas: { labels: labelsStatus, valores: valoresStatus, cores: coresStatus },
        horariosPico,
        rotasPopulares: rotasPopularesResult.rows
      });

    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      res.status(500).json({ erro: 'Erro interno ao buscar relatórios' });
    }
  }

  static async faturamentoDiario(req, res) {
    try {
      const sql = `
        SELECT COALESCE(SUM(via_valor), 0) AS faturamento_diario
        FROM viagens
        WHERE via_data::date = CURRENT_DATE
          AND via_status = 'finalizada'
      `;
      const { rows } = await pool.query(sql);
      res.json({ faturamento_diario: parseFloat(rows[0].faturamento_diario).toFixed(2) });
    } catch (error) {
      console.error('Erro ao buscar faturamento diário:', error);
      res.status(500).json({ erro: 'Erro interno ao buscar faturamento diário' });
    }
  }

  static async solicitacoesRecusadas(req, res) {
    try {
      const sql = `SELECT COUNT(*) AS total_recusadas
        FROM solicitacoes
        WHERE sol_status ILIKE 'recusada';
        `;
      const { rows } = await pool.query(sql);

      if (!rows.length) {
        return res.status(404).json({ solicitacoes_recusadas: [] });
      }

      return res.status(200).json({ solicitacoes_recusadas: rows });
    } catch (error) {
      console.error('Erro ao buscar solicitações recusadas:', error);
      return res.status(500).json({ erro: 'Erro interno ao buscar solicitações recusadas' });
    }
  }
  static async getEntregasCount(req, res) {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) AS total FROM viagens WHERE via_servico ILIKE 'entrega'`
      );
      const rows = result.rows;
      return res.status(200).json({ total_entregas: parseInt(rows[0].total, 10) });
    } catch (error) {
      console.error('Erro ao buscar total de entregas:', error);
      return res.status(500).json({ erro: 'Erro interno ao buscar total de entregas' });
    }
  }

}

export default RelatorioController;
