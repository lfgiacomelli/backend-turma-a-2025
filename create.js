import pool from './src/db/db.js';

async function criarColuna() {
  try {
    const result = await pool.query(`
      ALTER TABLE viagens 
      ADD COLUMN via_email_enviado BOOLEAN DEFAULT FALSE
    `);
    console.log("Coluna 'via_email_enviado' criada com sucesso!");
  } catch (erro) {
    console.error("Erro ao criar coluna:", erro);
  }
}

// Executa a função
criarColuna();
