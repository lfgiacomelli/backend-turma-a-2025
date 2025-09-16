import pool from "./src/db/db.js";

async function inserirSolicitacoesMock() {
  try {
    const result = await pool.query(
      `SELECT 
          f.fun_codigo,
          f.fun_nome,
          ROUND(AVG(a.ava_nota)::numeric, 2) AS nota_media
      FROM funcionarios f
      LEFT JOIN viagens v ON f.fun_codigo = v.fun_codigo
      LEFT JOIN avaliacoes a ON v.via_codigo = a.via_codigo
      WHERE f.fun_codigo = $1
      GROUP BY f.fun_codigo, f.fun_nome;`,
      [3] // aqui você passa o código do funcionário
    );

    if (result.rows.length === 0) {
      console.log("Funcionário não encontrado.");
      return;
    }

    const funcionario = result.rows[0];
    if (funcionario.nota_media === null) {
      funcionario.nota_media = "Sem avaliações";
    }

    console.log("Status encontrados:", funcionario);
  } catch (erro) {
    console.error("Erro ao inserir solicitações mock:", erro);
  }
}

inserirSolicitacoesMock();
