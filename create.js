import pool from "./src/db/db.js";

async function getPushToken() {
  try {
    const query = `
    
    select * from usuarios
`;

    const result = await pool.query(query);
    console.log(result.rows)
  } catch (erro) {
    console.error("Erro ao inserir solicitações mock:", erro);
  }
}

getPushToken();
