import pool from "./src/db/db.js";

async function executarConsulta() {
  try {
    const sql = `
    UPDATE solicitacoes
SET sol_status = 'Pendente'
WHERE sol_codigo = (
  SELECT sol_codigo
  FROM solicitacoes
  ORDER BY sol_codigo DESC
  LIMIT 1
);

`;
    const resultado = await pool.query(sql);

    console.log(`Linhas afetadas: ${resultado.rowCount}`);
  } catch (erro) {
    console.error('Erro ao executar SQL:', erro);
  } finally {
    await pool.end();
  }
}

// Executa o script
executarConsulta();
