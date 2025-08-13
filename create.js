import pool from "./src/db/db.js";

async function executarConsulta() {
  try {
    const res = await pool.query(`
      CREATE TABLE notificacoes (
    not_id SERIAL PRIMARY KEY,
    not_titulo VARCHAR(255) NOT NULL,
    not_mensagem TEXT NOT NULL,
    not_push_token VARCHAR(255) NOT NULL,
    not_enviado BOOLEAN DEFAULT FALSE,
    not_data_envio TIMESTAMP,
    not_criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

    `);

    console.log("Tabela de notificações criada com sucesso.");

  } catch (erro) {
    console.error('Erro ao executar SQL:', erro);
  } finally {
    await pool.end();
  }
}

executarConsulta();
