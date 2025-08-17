import pool from "./src/db/db.js";

async function executarConsulta() {
  try {
    const res = await pool.query(`
      SELECT 
          t.table_name,
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.character_maximum_length,
          c.column_default
      FROM information_schema.tables t
      JOIN information_schema.columns c 
          ON t.table_name = c.table_name
      WHERE t.table_schema = 'public'
      ORDER BY t.table_name, c.ordinal_position;
    `);

    // Agrupar colunas por tabela
    const tabelas = {};
    res.rows.forEach(row => {
      if (!tabelas[row.table_name]) {
        tabelas[row.table_name] = [];
      }
      tabelas[row.table_name].push({
        coluna: row.column_name,
        tipo: row.data_type,
        nulo: row.is_nullable,
        tamanho: row.character_maximum_length,
        default: row.column_default
      });
    });

    // Exibir formatado
    for (const [tabela, colunas] of Object.entries(tabelas)) {
      console.log(`\n📌 Tabela: ${tabela}`);
      colunas.forEach(col => {
        console.log(
          `   - ${col.coluna} (${col.tipo}${col.tamanho ? `(${col.tamanho})` : ""})` +
          ` | NULL: ${col.nulo} | DEFAULT: ${col.default ?? "nenhum"}`
        );
      });
    }
  } catch (erro) {
    console.error("Erro ao executar SQL:", erro);
  } finally {
    await pool.end();
  }
}

executarConsulta();
