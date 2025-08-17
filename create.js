import pool from "./src/db/db.js";

async function executarConsulta() {
  try {
    const res = await pool.query(`
      select push_token from usuarios
    `);
      console.log("Usuários encontrados:", res.rows);
  } catch (erro) {
    console.error("Erro ao executar SQL:", erro);
  } finally {
    await pool.end();
  }
}

executarConsulta();
