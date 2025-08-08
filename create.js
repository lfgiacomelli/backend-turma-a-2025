import pool from "./src/db/db.js";

async function executarConsulta() {
  try {
    const sql = `
    update funcionarios set fun_documento = NULL
`;
    const resultado = await pool.query(sql);

    console.log("Resultado da consulta:", resultado.rows);
  } catch (erro) {
    console.error('Erro ao executar SQL:', erro);
  } finally {
    await pool.end();
  }
}

executarConsulta();
