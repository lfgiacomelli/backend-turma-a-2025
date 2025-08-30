import pool from './src/db/db.js';

async function criarColuna() {
  try {
    const result = await pool.query(`
      update funcionarios set fun_documento = null
    `);
    console.log("Coluna 'fun_documento' atualizada com sucesso!");
  } catch (erro) {
    console.error("Erro ao criar coluna:", erro);
  }
}

criarColuna();
