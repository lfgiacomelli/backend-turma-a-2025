import bcrypt from 'bcryptjs';
import pool from '../../db/db.js';
import { enviarEmail } from '../../utils/email.js';


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
      const { id } = req.params;  // <-- pega o id da URL
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
    try {
      const { id } = req.params;

      await pool.query('DELETE FROM motocicletas WHERE fun_codigo = $1', [id]);
      await pool.query('DELETE FROM funcionarios WHERE fun_codigo = $1', [id]);

      res.json({ mensagem: 'Funcionário excluído com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
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
      const result = await pool.query(` SELECT f.fun_codigo, f.fun_nome FROM funcionarios f JOIN pagamentos_diaria p ON f.fun_codigo = p.fun_codigo WHERE f.fun_ativo = TRUE AND p.pag_data = CURRENT_DATE AND p.pag_status = 'pago'`);
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
  }


};

export default FuncionarioController;

