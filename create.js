import pool from "./src/db/db.js";

async function executarConsulta() {
  try {
    const sql = `
    select fun_documento from funcionarios
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
