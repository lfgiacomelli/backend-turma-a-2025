import pool from "./src/db/db.js";

async function executarConsulta() {
  try {
    const res = await pool.query(`
      select fun_documento from funcionarios
    `);
      console.log("Usuários encontrados:", res.rows);
  } catch (erro) {
    console.error("Erro ao executar SQL:", erro);
  } finally {
    await pool.end();
  }
}

executarConsulta();
