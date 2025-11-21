import pool from "./src/db/db.js";

async function getPushToken() {
  try {
    const query = `
-- ======================
-- RESET DAS TABELAS (APENAS PARA DEV)
-- ======================
DROP TABLE IF EXISTS pix_pagamentos CASCADE;
DROP TABLE IF EXISTS pagamentos_diaria CASCADE;
DROP TABLE IF EXISTS notificacoes CASCADE;
DROP TABLE IF EXISTS motocicletas CASCADE;
DROP TABLE IF EXISTS cupons CASCADE;
DROP TABLE IF EXISTS avaliacoes CASCADE;
DROP TABLE IF EXISTS viagens CASCADE;
DROP TABLE IF EXISTS solicitacoes CASCADE;
DROP TABLE IF EXISTS anuncios CASCADE;
DROP TABLE IF EXISTS funcionarios CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ======================
-- Tabela: usuarios
-- ======================
CREATE TABLE usuarios (
  usu_codigo SERIAL PRIMARY KEY,
  usu_nome VARCHAR(255) NOT NULL,
  usu_email VARCHAR(255) NOT NULL UNIQUE,
  usu_senha VARCHAR(255) NOT NULL,
  usu_telefone VARCHAR(20) NOT NULL,
  usu_ativo BOOLEAN DEFAULT TRUE,
  usu_created_at TIMESTAMP DEFAULT NOW(),
  usu_updated_at TIMESTAMP DEFAULT NOW(),
  usu_cpf VARCHAR(20) NOT NULL UNIQUE,
  push_token TEXT
);

-- ======================
-- Tabela: funcionarios
-- ======================
CREATE TABLE funcionarios (
  fun_codigo SERIAL PRIMARY KEY,
  fun_nome VARCHAR(255) NOT NULL,
  fun_email VARCHAR(255) NOT NULL UNIQUE,
  fun_telefone VARCHAR(20) NOT NULL,
  fun_data_contratacao DATE NOT NULL,
  fun_cnh VARCHAR(20),
  fun_ativo BOOLEAN DEFAULT TRUE,
  fun_senha VARCHAR(255) NOT NULL,
  fun_cargo VARCHAR(100) NOT NULL,
  fun_cpf VARCHAR(20) NOT NULL UNIQUE,
  fun_documento VARCHAR(255)
);

-- ======================
-- Tabela: anuncios
-- ======================
CREATE TABLE anuncios (
  anu_codigo SERIAL PRIMARY KEY,
  anu_titulo VARCHAR(255) NOT NULL,
  anu_foto VARCHAR(255) NOT NULL,
  anu_descricao TEXT
);

-- ======================
-- Tabela: solicitacoes
-- ======================
CREATE TABLE solicitacoes (
  sol_codigo SERIAL PRIMARY KEY,
  sol_origem VARCHAR(255) NOT NULL,
  sol_destino VARCHAR(255) NOT NULL,
  sol_valor NUMERIC NOT NULL,
  sol_formapagamento VARCHAR(100) NOT NULL,
  sol_distancia NUMERIC NOT NULL,
  sol_data TIMESTAMP NOT NULL DEFAULT NOW(),
  usu_codigo INTEGER NOT NULL,
  sol_largura NUMERIC,
  sol_comprimento NUMERIC,
  sol_peso NUMERIC,
  sol_status VARCHAR(100) NOT NULL,
  sol_servico VARCHAR(100) NOT NULL,
  sol_observacoes TEXT,
  CONSTRAINT fk_solicitacoes_usuario FOREIGN KEY (usu_codigo) REFERENCES usuarios (usu_codigo)
);

-- ======================
-- Tabela: viagens
-- ======================
CREATE TABLE viagens (
  via_codigo SERIAL PRIMARY KEY,
  fun_codigo INTEGER NOT NULL,
  ate_codigo INTEGER NOT NULL,
  sol_codigo INTEGER NOT NULL,
  usu_codigo INTEGER NOT NULL,
  via_origem VARCHAR(255) NOT NULL,
  via_destino VARCHAR(255) NOT NULL,
  via_valor NUMERIC NOT NULL,
  via_formapagamento VARCHAR(100) NOT NULL,
  via_data TIMESTAMP NOT NULL DEFAULT NOW(),
  via_servico VARCHAR(100) NOT NULL,
  via_status VARCHAR(100) NOT NULL,
  via_observacoes TEXT,
  via_email_enviado BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_viagens_funcionario FOREIGN KEY (fun_codigo) REFERENCES funcionarios (fun_codigo),
  CONSTRAINT fk_viagens_solicitacao FOREIGN KEY (sol_codigo) REFERENCES solicitacoes (sol_codigo),
  CONSTRAINT fk_viagens_usuario FOREIGN KEY (usu_codigo) REFERENCES usuarios (usu_codigo)
);

-- ======================
-- Tabela: avaliacoes
-- ======================
CREATE TABLE avaliacoes (
  ava_codigo SERIAL PRIMARY KEY,
  usu_codigo INTEGER NOT NULL,
  via_codigo INTEGER NOT NULL,
  ava_nota SMALLINT NOT NULL,
  ava_comentario TEXT,
  ava_data_avaliacao TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_avaliacoes_usuario FOREIGN KEY (usu_codigo) REFERENCES usuarios (usu_codigo),
  CONSTRAINT fk_avaliacoes_viagem FOREIGN KEY (via_codigo) REFERENCES viagens (via_codigo)
);

-- ======================
-- Tabela: cupons
-- ======================
CREATE TABLE cupons (
  cup_codigo VARCHAR(50) PRIMARY KEY,
  cup_codigo_id SERIAL NOT NULL,
  cup_descricao TEXT,
  cup_tipo_desconto VARCHAR(100) NOT NULL,
  cup_valor_desconto NUMERIC NOT NULL,
  cup_valor_minimo NUMERIC,
  cup_quantidade_uso INTEGER,
  cup_usado INTEGER DEFAULT 0,
  cup_ativo BOOLEAN DEFAULT TRUE,
  cup_validade_inicio TIMESTAMP,
  cup_validade_fim TIMESTAMP,
  cup_criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ======================
-- Tabela: motocicletas
-- ======================
CREATE TABLE motocicletas (
  mot_codigo SERIAL PRIMARY KEY,
  mot_modelo VARCHAR(100) NOT NULL,
  mot_placa VARCHAR(20) NOT NULL UNIQUE,
  mot_ano INTEGER NOT NULL,
  fun_codigo INTEGER NOT NULL,
  mot_cor VARCHAR(50) NOT NULL,
  CONSTRAINT fk_motocicletas_funcionario FOREIGN KEY (fun_codigo) REFERENCES funcionarios (fun_codigo)
);

-- ======================
-- Tabela: notificacoes
-- ======================
CREATE TABLE notificacoes (
  not_id SERIAL PRIMARY KEY,
  not_titulo VARCHAR(255) NOT NULL,
  not_mensagem TEXT NOT NULL,
  not_push_token VARCHAR(255) NOT NULL,
  not_enviado BOOLEAN DEFAULT FALSE,
  not_data_envio TIMESTAMP,
  not_criado_em TIMESTAMP DEFAULT NOW()
);

-- ======================
-- Tabela: pagamentos_diaria
-- ======================
CREATE TABLE pagamentos_diaria (
  pag_codigo SERIAL PRIMARY KEY,
  fun_codigo INTEGER NOT NULL,
  pag_valor NUMERIC NOT NULL,
  pag_data DATE NOT NULL,
  pag_forma_pagamento VARCHAR(100),
  pag_status VARCHAR(100) NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP,
  CONSTRAINT fk_pagamentos_funcionario FOREIGN KEY (fun_codigo) REFERENCES funcionarios (fun_codigo)
);

-- ======================
-- Tabela: pix_pagamentos
-- ======================
CREATE TABLE pix_pagamentos (
  pix_pagamento_codigo VARCHAR(30) PRIMARY KEY,
  pix_status VARCHAR(100) NOT NULL,
  pix_valor NUMERIC NOT NULL,
  pix_qrcode TEXT,
  pix_qrcode_base64 TEXT,
  pix_ticket_url TEXT,
  usu_codigo INTEGER NOT NULL,
  sol_servico VARCHAR(100) NOT NULL,
  pix_criado_em TIMESTAMP DEFAULT NOW(),
  pix_atualizado_em TIMESTAMP,
  CONSTRAINT fk_pix_usuario FOREIGN KEY (usu_codigo) REFERENCES usuarios (usu_codigo)
);

-- Inserir Funcionário Mock
INSERT INTO funcionarios (
    fun_nome,
    fun_email,
    fun_telefone,
    fun_data_contratacao,
    fun_cnh,
    fun_ativo,
    fun_senha,
    fun_cargo,
    fun_cpf,
    fun_documento
) VALUES (
    'Luís Felipe Giacomelli Rodrigues',
    'lfgiacomellirodrigues@gmail.com',
    '11999999999',
    CURRENT_DATE,
    '12345678900',
    TRUE,
    ''$2a$10$Z6sJfKx6.Nv4GRq2z6wweu6HkJGaj8QHXp1dW/qXeS1CvhfJ0RYZC',
    'Gerente',
    '123.456.789-00',
    NULL
);
    `;

    await pool.query(query);
    console.log("✅ Tabelas criadas e dados mock inseridos com sucesso!");
  } catch (erro) {
    console.error("❌ Erro ao criar tabelas ou inserir dados:", erro);
  }
}

getPushToken();
