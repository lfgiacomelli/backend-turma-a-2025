import pool from "./src/db/db.js";

async function getPushToken() {
  try {
    const query = `
    ALTER TABLE pix_pagamentos 
ALTER COLUMN pix_pagamento_codigo TYPE VARCHAR(30);

    `;

    await pool.query(query);
    console.log("✅ Tabelas criadas e dados mock inseridos com sucesso!");
  } catch (erro) {
    console.error("❌ Erro ao criar tabelas ou inserir dados:", erro);
  }
}

getPushToken();
