import pool from '../../db/db.js';
class RelatorioController {

    static async getRelatorios(req, res) {
        try {
            let { data_inicio, data_fim } = req.query;

            const hoje = new Date();
            const trintaDiasAtras = new Date();
            trintaDiasAtras.setDate(hoje.getDate() - 30);

            data_inicio = data_inicio || trintaDiasAtras.toISOString().slice(0, 10);
            data_fim = data_fim || hoje.toISOString().slice(0, 10);

            if (data_inicio > data_fim) {
                [data_inicio, data_fim] = [data_fim, data_inicio];
            }

            const sqlUsuarios = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN usu_ativo = true THEN 1 ELSE 0 END) as ativos,
          SUM(CASE WHEN usu_ativo = false THEN 1 ELSE 0 END) as banidos,
          SUM(CASE WHEN DATE(usu_created_at) BETWEEN $1 AND $2 THEN 1 ELSE 0 END) as novos
        FROM usuarios
      `;

            const sqlCorridas = `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN via_status = 'finalizada' THEN 1 ELSE 0 END) as finalizadas,
          SUM(CASE WHEN via_status = 'em andamento' THEN 1 ELSE 0 END) as em_andamento,
          AVG(via_valor) as valor_medio,
          SUM(via_valor) as faturamento_total
        FROM viagens
        WHERE via_data BETWEEN $1 AND $2
      `;

            const sqlCanceladas = `
        SELECT COUNT(*) as canceladas
        FROM solicitacoes
        WHERE sol_status = 'recusada' AND sol_data BETWEEN $1 AND $2
      `;

            const sqlUsuariosAtivos = `
        SELECT u.usu_nome, COUNT(v.via_codigo) as total_corridas, SUM(v.via_valor) as total_gasto
        FROM usuarios u
        LEFT JOIN viagens v ON u.usu_codigo = v.usu_codigo
        WHERE v.via_data BETWEEN $1 AND $2
        GROUP BY u.usu_codigo
        ORDER BY total_corridas DESC
        LIMIT 5
      `;

            const sqlMototaxistasAtivos = `
        SELECT
          f.fun_nome,
          COUNT(v.via_codigo) AS total_corridas,
          SUM(v.via_valor) AS total_faturado,
          AVG(a.ava_nota) AS media_avaliacao
        FROM funcionarios f
        LEFT JOIN viagens v ON f.fun_codigo = v.fun_codigo
        LEFT JOIN avaliacoes a ON v.via_codigo = a.via_codigo
        WHERE v.via_data BETWEEN $1 AND $2
          AND f.fun_cargo = 'Mototaxista'
        GROUP BY f.fun_nome, f.fun_codigo
        ORDER BY total_corridas DESC
        LIMIT 5
      `;

            const sqlReceita = `
        SELECT
          TO_CHAR(via_data, 'YYYY-MM') AS mes,
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
        SELECT via_status, COUNT(*) as total
        FROM viagens
        WHERE via_data BETWEEN $1 AND $2
        GROUP BY via_status
      `;

            const sqlHorariosPico = `
        SELECT EXTRACT(HOUR FROM via_data) AS hora, COUNT(*) AS total_corridas
        FROM viagens
        WHERE via_data BETWEEN $1 AND $2
        GROUP BY EXTRACT(HOUR FROM via_data)
        ORDER BY total_corridas DESC
        LIMIT 5
      `;

            const sqlRotasPopulares = `
        SELECT
          via_origem || ' → ' || via_destino as rota,
          COUNT(*) as total_viagens,
          AVG(via_valor) as valor_medio
        FROM viagens
        WHERE via_data BETWEEN $1 AND $2
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
            corridas.canceladas = canceladas.canceladas;

            const valorMedio = corridas.valor_medio ? parseFloat(corridas.valor_medio).toFixed(2) : '0.00';
            const faturamentoTotal = corridas.faturamento_total ? parseFloat(corridas.faturamento_total).toFixed(2) : '0.00';

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

            const horariosPico = horariosPicoResult.rows.map(horario => {
                const hora = horario.hora;
                let periodo = 'noite';
                if (hora >= 5 && hora < 12) periodo = 'manhã';
                else if (hora >= 12 && hora < 18) periodo = 'tarde';

                return {
                    hora: `${hora.toString().padStart(2, '0')}:00`,
                    total: horario.total_corridas,
                    periodo,
                };
            });

            const rotasPopulares = rotasPopularesResult.rows;

            return res.json({
                data_inicio,
                data_fim,
                usuarios,
                corridas: {
                    ...corridas,
                    valor_medio: valorMedio,
                    faturamento_total: faturamentoTotal,
                },
                usuariosAtivos: usuariosAtivosResult.rows,
                mototaxistasAtivos: mototaxistasAtivosResult.rows,
                receitaMensal: {
                    labels: labelsMeses,
                    valoresReceita,
                    valoresCorridas,
                },
                statusCorridas: {
                    labels: labelsStatus,
                    valores: valoresStatus,
                    cores: coresStatus,
                },
                horariosPico,
                rotasPopulares,
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

}

export default RelatorioController;
