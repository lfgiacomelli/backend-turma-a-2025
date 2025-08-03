import pool from "./src/db/db.js";

async function executarConsulta() {
  try {
    const sql = `
    SELECT 
  v.*,
  m.mot_modelo,
  m.mot_placa
FROM viagens v
INNER JOIN motocicletas m ON v.fun_codigo = m.fun_codigo
WHERE v.fun_codigo = $1

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
