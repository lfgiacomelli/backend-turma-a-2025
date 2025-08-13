import pool from "./src/db/db.js";

async function executarConsulta() {
  try {
    // Remove a tabela notificacoes se existir
    // await pool.query(`
    //   DROP TABLE IF EXISTS notificacoes;
    // `);

    // Remove a coluna push_token da tabela usuarios se existir
    const res = await pool.query(`
      SELECT push_token FROM usuarios
    `);

    console.log(res.rows);
  } catch (erro) {
    console.error('Erro ao executar SQL:', erro);
  } finally {
    await pool.end();
  }
}

executarConsulta();
