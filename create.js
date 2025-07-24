import pool from "./src/db/db.js"; 

const criarTabelaPagamentos = async () => {
  try {
    await pool.query(`
      UPDATE solicitacoes SET sol_status = 'Pendente' WHERE sol_status = 'pendente';
    `);

    console.log("Tabela 'pagamentos_diaria' criada com sucesso.");
    process.exit(0);
  } catch (error) {
    console.error("Erro ao criar tabela 'pagamentos_diaria':", error);
    process.exit(1);
  }
};

criarTabelaPagamentos();
