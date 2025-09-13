import pool from "./src/db/db.js";

async function inserirSolicitacoesMock() {
  try {
    const result = await pool.query('SELECT usu_nome FROM usuarios');
    console.log("Usuários encontrados:", result.rows.map(row => row.usu_nome));
  } catch (erro) {
    console.error("Erro ao inserir solicitações mock:", erro);
  }
}

inserirSolicitacoesMock();
