import pool from "./src/db/db.js";
import fs from "fs";

const listarEstruturaBanco = async () => {
  try {
    // 1. Tabelas e colunas
    const colunas = await pool.query(`
      SELECT 
        table_schema,
        table_name,
        column_name,
        data_type,
        is_nullable
      FROM 
        information_schema.columns
      WHERE 
        table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY 
        table_schema, table_name, ordinal_position;
    `);

    const linhasColunas = colunas.rows.map(row => 
      `${row.table_schema}.${row.table_name} - ${row.column_name} (${row.data_type}) [nullable: ${row.is_nullable}]`
    );

    // 2. Chaves primárias
    const pks = await pool.query(`
      SELECT 
        tc.table_schema,
        tc.table_name,
        kcu.column_name,
        tc.constraint_name
      FROM 
        information_schema.table_constraints AS tc
      JOIN 
        information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE 
        tc.constraint_type = 'PRIMARY KEY'
      ORDER BY 
        tc.table_schema, tc.table_name;
    `);

    const linhasPK = pks.rows.map(row =>
      `PK - ${row.table_schema}.${row.table_name}.${row.column_name} [${row.constraint_name}]`
    );

    // 3. Chaves estrangeiras
    const fks = await pool.query(`
      SELECT 
        tc.constraint_name,
        tc.table_schema AS origem_schema,
        tc.table_name   AS origem_tabela,
        kcu.column_name AS origem_coluna,
        ccu.table_schema AS destino_schema,
        ccu.table_name   AS destino_tabela,
        ccu.column_name  AS destino_coluna
      FROM 
        information_schema.table_constraints AS tc 
      JOIN 
        information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN 
        information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.constraint_schema = tc.constraint_schema
      WHERE 
        tc.constraint_type = 'FOREIGN KEY'
      ORDER BY 
        origem_schema, origem_tabela;
    `);

    const linhasFK = fks.rows.map(row =>
      `FK - ${row.origem_schema}.${row.origem_tabela}.${row.origem_coluna} → ${row.destino_schema}.${row.destino_tabela}.${row.destino_coluna} [${row.constraint_name}]`
    );

    // Montar conteúdo final
    const conteudoFinal = [
      "📦 ESTRUTURA DO BANCO DE DADOS\n",
      "== Tabelas e Colunas ==",
      ...linhasColunas,
      "\n== Chaves Primárias ==",
      ...linhasPK,
      "\n== Chaves Estrangeiras ==",
      ...linhasFK
    ].join("\n");

    // Salvar no arquivo
    fs.writeFileSync("estrutura_completa_banco.txt", conteudoFinal);
    console.log("Estrutura completa do banco salva em 'estrutura_completa_banco.txt'");
    process.exit(0);
  } catch (error) {
    console.error("Erro ao descrever banco:", error);
    process.exit(1);
  }
};

listarEstruturaBanco();
