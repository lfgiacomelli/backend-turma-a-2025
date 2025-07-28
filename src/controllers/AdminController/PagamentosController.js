import pool from "../../db/db.js";

const PagamentosController = {
    async listar(req, res) {
        try {
            const result = await pool.query(`
               SELECT 
    p.*, 
    f.fun_nome 
FROM 
    pagamentos_diaria p
JOIN 
    funcionarios f ON p.fun_codigo = f.fun_codigo
ORDER BY 
    p.pag_data DESC, 
    p.pag_codigo DESC;

            `);
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error("Erro ao listar pagamentos:", error);
            return res.status(500).json({ erro: "Erro ao listar pagamentos." });
        }
    },
    async gerarDiarias(req, res) {
        const dataHoje = new Date().toISOString().split("T")[0];

        try {
            const { rows: funcionarios } = await pool.query(`
        SELECT fun_codigo FROM funcionarios WHERE fun_ativo = true
      `);

            let totalCriados = 0;

            for (const { fun_codigo } of funcionarios) {
                const { rowCount } = await pool.query(
                    `SELECT 1 FROM pagamentos_diaria WHERE fun_codigo = $1 AND pag_data = $2`,
                    [fun_codigo, dataHoje]
                );

                if (rowCount === 0) {
                    await pool.query(
                        `INSERT INTO pagamentos_diaria 
             (fun_codigo, pag_valor, pag_data, pag_forma_pagament, pag_status)
             VALUES ($1, $2, $3, $4, $5)`,
                        [fun_codigo, 20.00, dataHoje, 'indefinido', 'pendente']
                    );

                    totalCriados++;
                }
            }

            const mensagem = `Pagamentos criados com sucesso: ${totalCriados}`;
            console.log(mensagem);

            if (req && res) {
                if( totalCriados === 0) {
                    return res.status(204).end();
                }
                return res.status(200).json({ sucesso: true, totalCriados, data: dataHoje });
            }
        } catch (error) {
            console.error("Erro ao gerar pagamentos diários:", error);
            if (req && res) {
                res.status(500).json({ erro: "Erro ao gerar pagamentos diários." });
            }
        }
    },

    async atualizarStatus(req, res) {
        const { pag_status, pag_forma_pagament } = req.body;
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ erro: "ID do pagamento é obrigatório." });
        }
        if (!pag_status) {
            return res.status(400).json({ erro: "O campo pag_status é obrigatório." });
        }

        try {
            const result = await pool.query(
                `UPDATE pagamentos_diaria 
       SET pag_status = $1, pag_forma_pagament = COALESCE($2, pag_forma_pagament), atualizado_em = NOW()
       WHERE pag_codigo = $3
       RETURNING *`,
                [pag_status, pag_forma_pagament || null, id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ erro: "Pagamento não encontrado para o ID especificado." });
            }

            return res.status(200).json({
                mensagem: "Status atualizado com sucesso.",
                pagamento: result.rows[0],
            });
        } catch (error) {
            console.error("Erro ao atualizar status do pagamento:", error);
            res.status(500).json({ erro: "Erro ao atualizar status do pagamento." });
        }
    }

};

export default PagamentosController;