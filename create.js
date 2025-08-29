import pool from './src/db/db.js';

async function criarColuna() {
  try {
    const result = await pool.query(`
      update usuarios set push_token = NULL where usu_codigo = 1
    `);
    console.log("Coluna 'via_email_enviado' criada com sucesso!");
  } catch (erro) {
    console.error("Erro ao criar coluna:", erro);
  }
}

// Executa a função
criarColuna();
