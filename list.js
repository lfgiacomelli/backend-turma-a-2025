import bcrypt from 'bcrypt';
import pool from './src/db/db.js';

async function inserirFuncionariosMock() {
  try {
    const senhaHash = await bcrypt.hash("123456", 10);

    const funcionariosMock = [
      ["João Carlos da Silva", "joao.silva@zoomx.com", senhaHash, "11988887777", "12345678900", new Date(), true, "Mototaxista", "123.456.789-01"],
      ["Pedro Henrique de Souza", "pedro.souza@zoomx.com", senhaHash, "11977776666", "98765432100", new Date(), true, "Mototaxista", "123.456.789-02"],
      ["Marcos Antônio Pereira", "marcos.pereira@zoomx.com", senhaHash, "11966665555", "47382919200", new Date(), true, "Mototaxista", "123.456.789-03"],
      ["Lucas Gabriel Almeida", "lucas.almeida@zoomx.com", senhaHash, "11955554444", "93847102900", new Date(), true, "Mototaxista", "123.456.789-04"],
    ];

    for (const funcionario of funcionariosMock) {
      await pool.query(
        `INSERT INTO funcionarios 
          (fun_nome, fun_email, fun_senha, fun_telefone, fun_cnh, fun_data_contratacao, fun_ativo, fun_cargo, fun_cpf)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        funcionario
      );
    }

    console.log("🚀 Funcionários mock inseridos com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inserir mocks:", error);
  } finally {
    pool.end(); // só encerre se for script isolado!
  }
}

inserirFuncionariosMock();
