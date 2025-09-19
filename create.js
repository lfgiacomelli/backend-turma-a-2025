import pool from "./src/db/db.js";

async function inserirSolicitacoesMock() {
  try {
    const query = `
    UPDATE viagens SET via_formapagamento = 'dinheiro' WHERE via_formapagamento = 'Dinheiro';
    UPDATE solicitacoes SET sol_formapagamento = 'dinheiro' WHERE sol_formapagamento = 'Dinheiro';
`;

    const result = await pool.query(query);
    console.log("Tabelas criadas", result.rows);
  } catch (erro) {
    console.error("Erro ao inserir solicitações mock:", erro);
  }
}

inserirSolicitacoesMock();
