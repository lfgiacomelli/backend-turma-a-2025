import bcrypt from 'bcryptjs';
import pool from '../../db/db.js';
import { enviarEmail } from '../../utils/email.js';
import path from 'path';
import fs from 'fs';


const FuncionarioController = {

  async adicionar(req, res) {
    try {
      const {
        nome,
        email,
        senha,
        telefone,
        cnh,
        data_contratacao,
        ativo,
        cargo,
        cpf
      } = req.body;

      const senhaHash = await bcrypt.hash(senha, 10);

      const query = `
        INSERT INTO funcionarios 
        (fun_nome, fun_email, fun_senha, fun_telefone, fun_cnh, fun_data_contratacao, fun_ativo, fun_cargo, fun_cpf)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;

      await pool.query(query, [
        nome,
        email,
        senhaHash,
        telefone,
        cnh,
        data_contratacao,
        ativo === true || ativo === '1',
        cargo,
        cpf
      ]);

      await enviarEmail({
        to: email,
        subject: 'Bem-vindo à empresa!',
        text: `Olá ${nome},\n\nSeu cadastro foi realizado com sucesso dentro da plataforma ZoomX! Lembre-se de manter seus dados atualizados e entre em contato conosco para qualquer dúvida.\n\nAtenciosamente,\nEquipe ZoomX \n\n Realize o pagamento da sua taxa diária para a empresa`
      });

      res.status(201).json({ mensagem: 'Funcionário adicionado com sucesso!' });
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },

  async editar(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        email,
        senha,
        telefone,
        cnh,
        ativo,
        cargo,
        cpf
      } = req.body;

      let query, params;

      if (senha) {
        const senhaHash = await bcrypt.hash(senha, 10);
        query = `
        UPDATE funcionarios SET 
        fun_nome = $1, fun_email = $2, fun_senha = $3, fun_telefone = $4,
        fun_cnh = $5, fun_ativo = $6, fun_cargo = $7, fun_cpf = $8
        WHERE fun_codigo = $9
      `;
        params = [nome, email, senhaHash, telefone, cnh, ativo === true || ativo === '1', cargo, cpf, id];
      } else {
        query = `
        UPDATE funcionarios SET 
        fun_nome = $1, fun_email = $2, fun_telefone = $3,
        fun_cnh = $4, fun_ativo = $5, fun_cargo = $6, fun_cpf = $7
        WHERE fun_codigo = $8
      `;
        params = [nome, email, telefone, cnh, ativo === true || ativo === '1', cargo, cpf, id];
      }

      await pool.query(query, params);
      res.json({ mensagem: 'Funcionário atualizado com sucesso!' });
    } catch (error) {
      console.error('Erro ao editar funcionário:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },

  async excluir(req, res) {
    const client = await pool.connect();
    try {
      const { id } = req.params;

      await client.query('BEGIN');

      await client.query('DELETE FROM pagamentos_diaria WHERE fun_codigo = $1', [id]);
      await client.query('DELETE FROM motocicletas WHERE fun_codigo = $1', [id]);

      const result = await client.query(
        'DELETE FROM funcionarios WHERE fun_codigo = $1 RETURNING *',
        [id]
      );

      await client.query('COMMIT');

      if (result.rowCount === 0) {
        return res.status(404).json({ erro: 'Funcionário não encontrado' });
      }

      return res.json({ mensagem: 'Funcionário excluído com sucesso!' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao excluir funcionário:', error);
      return res.status(500).json({ erro: error.message });
    } finally {
      client.release();
    }
  },
  async listar(req, res) {
    try {
      const query = `
      SELECT 
        f.*, 
        p.pag_codigo, 
        p.pag_status
      FROM funcionarios f
      LEFT JOIN pagamentos_diaria p 
        ON f.fun_codigo = p.fun_codigo 
        AND p.pag_data = CURRENT_DATE
    `;

      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao listar funcionários:', error);
      res.status(500).json({ erro: error.message || 'Erro interno no servidor' });
    }
  }
  ,
  async listarAtivos(req, res) {
    try {
      const result = await pool.query(` SELECT f.fun_codigo, f.fun_nome
FROM funcionarios f
JOIN pagamentos_diaria p ON f.fun_codigo = p.fun_codigo
JOIN motocicletas m ON f.fun_codigo = m.fun_codigo
WHERE f.fun_ativo = TRUE
  AND p.pag_data = CURRENT_DATE
  AND p.pag_status = 'pago';
`);
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao listar funcionários ativos:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },

  async ativarDesativar(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'SELECT fun_ativo FROM funcionarios WHERE fun_codigo = $1',
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ erro: 'Funcionário não encontrado' });
      }

      const statusAtual = result.rows[0].fun_ativo;

      const novoStatus = !statusAtual;

      await pool.query(
        'UPDATE funcionarios SET fun_ativo = $1 WHERE fun_codigo = $2',
        [novoStatus, id]
      );

      res.json({ mensagem: 'Status do funcionário atualizado com sucesso!', novoStatus });
    } catch (error) {
      console.error('Erro ao alterar status do funcionário:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },
  async verificarFuncionariosSemMoto(req, res) {
    try {
      const result = await pool.query(`
            SELECT f.fun_codigo, f.fun_nome, f.fun_cargo
            FROM funcionarios f
            LEFT JOIN motocicletas m ON f.fun_codigo = m.fun_codigo
            WHERE m.fun_codigo IS NULL
              AND f.fun_cargo = 'Mototaxista';
        `);

      const funcionariosSemMoto = result.rows;

      if (funcionariosSemMoto.length === 0) {
        return res.status(200).json({ mensagem: "Todos os Mototaxistas têm motos cadastradas." });
      }

      return res.status(200).json({
        mensagem: "Mototaxistas sem motos cadastradas.",
        funcionarios: funcionariosSemMoto
      });
    } catch (error) {
      console.error("Erro ao verificar funcionários sem moto:", error);
      return res.status(500).json({ erro: "Erro ao verificar funcionários sem moto." });
    }
  },

  async verificarAusenciaFuncionarios() {
    try {
      const funcionarios = await pool.query(`SELECT fun_codigo, fun_email, fun_nome FROM funcionarios WHERE fun_ativo = true`);

      for (const funcionario of funcionarios.rows) {
        const { fun_codigo, fun_email, fun_nome } = funcionario;

        const pagamentos = await pool.query(`
        SELECT pag_status, pag_data
        FROM pagamentos
        WHERE fun_codigo = $1
        ORDER BY pag_data DESC
        LIMIT 3
      `, [fun_codigo]);

        const ultimosPagamentos = pagamentos.rows;

        const todosPendentes = ultimosPagamentos.length === 3 && ultimosPagamentos.every(p => p.pag_status === 'pendente');

        if (todosPendentes) {
          await enviarEmail({
            to: fun_email,
            subject: 'Ausência de atividades no ZoomX',
            body: `Olá, ${fun_nome},

Esperamos que você esteja bem. Notamos que os seus três últimos pagamentos ainda constam como pendentes, o que pode indicar que você esteve ausente nos últimos dias.

Queremos nos certificar de que está tudo certo com você. Se estiver enfrentando qualquer dificuldade ou precisar de ajuda, por favor, não hesite em entrar em contato com nossa equipe de gestão. Estamos aqui para apoiar você.

Agradecemos por fazer parte do ZoomX e esperamos vê-lo em breve ativo novamente.

Com carinho,
Equipe ZoomX
          `
          });

          console.log(`Email enviado para ${fun_email}`);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar ausência de funcionários:', error);
    }
  },
  async viagensDoFuncionario(req, res) {
    const { funCodigo } = req.params;

    try {
      const result = await pool.query(`
         SELECT 
  v.*,
  m.mot_modelo,
  m.mot_placa,
  f.fun_nome
FROM viagens v
INNER JOIN motocicletas m ON v.fun_codigo = m.fun_codigo
INNER JOIN funcionarios f ON v.fun_codigo = f.fun_codigo
WHERE v.fun_codigo = $1
ORDER BY v.via_data DESC
    `, [funCodigo]);

      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao listar viagens do funcionário:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },
  async viagensEmAndamento(req, res) {
    const { id } = req.params;
    try {
      const result = await pool.query(`
        SELECT 
    v.*, 
    u.usu_nome
FROM viagens v
INNER JOIN usuarios u 
    ON v.usu_codigo = u.usu_codigo
WHERE v.via_status = 'em andamento' 
  AND v.fun_codigo = $1
ORDER BY v.via_data DESC
LIMIT 1;

      `, [id]);

      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao listar viagens em andamento:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },

  async estimarGanhosDiarios(req, res) {
    const { funCodigo } = req.params;

    if (!funCodigo) {
      return res.status(400).json({
        status: "error",
        message: "Código do funcionário (funCodigo) é obrigatório.",
      });
    }

    try {
      const result = await pool.query(
        `
      SELECT COALESCE(SUM(via_valor), 0) AS total_ganhos
      FROM viagens
      WHERE fun_codigo = $1
        AND via_data >= CURRENT_DATE - INTERVAL '1 day'
      `,
        [funCodigo]
      );

      const totalGanhos = parseFloat(result.rows[0]?.total_ganhos) || 0;

      return res.status(200).json({
        status: "success",
        data: {
          totalGanhos,
        },
      });
    } catch (error) {
      console.error("Erro ao estimar ganhos diários:", error);

      return res.status(500).json({
        status: "error",
        message: "Ocorreu um erro ao estimar os ganhos diários.",
      });
    }
  },

  async verificarSeFuncionarioPagouDiaria(req, res) {
    try {
      const { funCodigo } = req.params;

      const result = await pool.query(`
      SELECT pag_codigo, pag_valor, pag_status
      FROM pagamentos_diaria
      WHERE fun_codigo = $1
        AND pag_data::date = CURRENT_DATE
      LIMIT 1
    `, [funCodigo]);

      if (result.rows.length === 0) {
        return res.status(200).json({
          pagou_hoje: false,
          diaria: null,
          mensagem: "Nenhuma diária gerada hoje."
        });
      }

      const diaria = result.rows[0];
      return res.status(200).json({
        pagou_hoje: diaria.pag_status === 'pago',
        diaria,
        mensagem: diaria.pag_status === 'pago'
          ? "Diária paga."
          : "Diária ainda não paga."
      });

    } catch (error) {
      console.error("Erro ao verificar diária do funcionário:", error);
      return res.status(500).json({ erro: "Erro ao verificar diária do funcionário." });
    }
  }



};

export default FuncionarioController;

