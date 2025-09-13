import pool from "./src/db/db.js";

async function inserirSolicitacoesMock() {
  try {
    const query = `
      INSERT INTO solicitacoes (
        sol_origem,
        sol_destino,
        sol_valor,
        sol_formapagamento,
        sol_distancia,
        sol_data,
        usu_codigo,
        sol_largura,
        sol_comprimento,
        sol_peso,
        sol_servico,
        sol_observacoes,
        sol_status
      )
      VALUES
        -- Mototáxi (sem dimensões)
        ('Rua Castro Alves, 120 - Centro, Presidente Venceslau', 'Av. Princesa Isabel, 450 - Vila Carmem, Presidente Venceslau', 12.5, 'Dinheiro', 2.3, NOW(), 1, NULL, NULL, NULL, 'Mototáxi', 'Cliente com pressa', 'Pendente'),
        ('Av. Dom Pedro II, 800 - Jardim Coroados, Presidente Venceslau', 'Rua Duque de Caxias, 55 - Centro, Presidente Venceslau', 15.0, 'Pix', 3.1, NOW(), 2, NULL, NULL, NULL, 'Mototáxi', '', 'Pendente'),
        ('Rua São Paulo, 300 - Centro, Presidente Venceslau', 'Rua Mato Grosso, 210 - Vila Sales, Presidente Venceslau', 10.0, 'Cartão', 1.8, NOW(), 5, NULL, NULL, NULL, 'Mototáxi', 'Levar rápido até a escola', 'Pendente'),

        -- Entregas (com dimensões)
        ('Av. Princesa Isabel, 999 - Centro, Presidente Venceslau', 'Rua Almirante Barroso, 45 - Jardim Arapuã, Presidente Venceslau', 25.0, 'Pix', 5.6, NOW(), 4, 40, 60, 5, 'Entrega', 'Pacote médio, frágil', 'Pendente'),
        ('Rua Castro Alves, 10 - Centro, Presidente Venceslau', 'Av. Dom Pedro II, 1500 - Jardim Coroados, Presidente Venceslau', 40.0, 'Dinheiro', 8.2, NOW(), 5, 80, 100, 15, 'Entrega', 'Pacote pesado', 'Pendente'),
        ('Rua São Paulo, 77 - Centro, Presidente Venceslau', 'Rua Mato Grosso, 500 - Vila Sales, Presidente Venceslau', 18.0, 'Cartão', 3.4, NOW(), 6, 35, 55, 4, 'Entrega', 'Entrega de documentos', 'Pendente'),
        ('Rua Duque de Caxias, 250 - Centro, Presidente Venceslau', 'Av. Princesa Isabel, 2222 - Jardim Arapuã, Presidente Venceslau', 30.0, 'Pix', 6.0, NOW(), 6, 60, 90, 10, 'Entrega', 'Caixa com roupas', 'Pendente'),

        -- Mais Mototáxi
        ('Rua Mato Grosso, 80 - Vila Sales, Presidente Venceslau', 'Rua São Paulo, 999 - Centro, Presidente Venceslau', 11.0, 'Dinheiro', 2.0, NOW(), 8, NULL, NULL, NULL, 'Mototáxi', 'Cliente idoso', 'Pendente'),
        ('Rua Almirante Barroso, 300 - Jardim Arapuã, Presidente Venceslau', 'Av. Dom Pedro II, 400 - Jardim Coroados, Presidente Venceslau', 14.0, 'Pix', 2.7, NOW(), 9, NULL, NULL, NULL, 'Mototáxi', 'Levar até o mercado', 'Pendente');
    `;

    await pool.query(query);
    console.log("Solicitações mockadas inseridas com sucesso!");
  } catch (erro) {
    console.error("Erro ao inserir solicitações mock:", erro);
  }
}

inserirSolicitacoesMock();
