import pool from "./src/db/db.js";

async function executarConsulta() {
  try {
    const sql = ` select * from usuarios where usu_email = 'eteccontaestudos@gmail.com'

`;
    const resultado = await pool.query(sql);

    console.log('Resultado da consulta:', resultado.rows);
  } catch (erro) {
    console.error('Erro ao executar SQL:', erro);
  } finally {
    await pool.end();
  }
}

// Executa o script
executarConsulta();
