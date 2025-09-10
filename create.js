import pool from "./src/db/db.js";

async function inserirSolicitacoesMotoTaxi() {
  try {
    const result = await pool.query(`SELECT via_servico from viagens WHERE via_servico ILIKE 'entrega'
    `);

    console.log(result.rows);
  } catch (erro) {
    console.error("Erro ao inserir solicitações:", erro);
  }
}

inserirSolicitacoesMotoTaxi();
