import bcrypt from 'bcryptjs';
import pool from '../../db/db.js';



const UsuarioController = {
  async listar(req, res) {
    try {
      const result = await pool.query(
        `SELECT usu_codigo, usu_nome, usu_email, usu_ativo, usu_telefone 
         FROM usuarios 
         ORDER BY usu_nome 
         LIMIT $1 OFFSET $2`,
        [limite, offset]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },
  async adminEditar(req, res) {
    try {
      const { id, nome, email, senha, telefone, ativo } = req.body;

      let query;
      let params;

      if (senha && senha.trim() !== '') {
        const hashedPassword = await bcrypt.hash(senha, 10);
        query = `
          UPDATE usuarios 
          SET usu_nome = $1, usu_email = $2, usu_senha = $3, usu_telefone = $4, usu_ativo = $5
          WHERE usu_codigo = $6
        `;
        params = [nome, email, hashedPassword, telefone, ativo === true || ativo === '1', id];
      } else {
        query = `
          UPDATE usuarios 
          SET usu_nome = $1, usu_email = $2, usu_telefone = $3, usu_ativo = $4
          WHERE usu_codigo = $5
        `;
        params = [nome, email, telefone, ativo === true || ativo === '1', id];
      }

      const result = await pool.query(query, params);

      if (result.rowCount > 0) {
        res.json({ mensagem: 'Usuário editado com sucesso!' });
      } else {
        res.status(404).json({ erro: 'Usuário não encontrado.' });
      }
    } catch (error) {
      console.error('Erro ao editar usuário:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },

  async alternarStatus(req, res) {
    try {
      const { id } = req.params;

      const { rows } = await pool.query(
        'SELECT usu_ativo FROM usuarios WHERE usu_codigo = $1',
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ erro: 'Usuário não encontrado.' });
      }

      const statusAtual = rows[0].usu_ativo;
      const novoStatus = !statusAtual;

      await pool.query(
        'UPDATE usuarios SET usu_ativo = $1 WHERE usu_codigo = $2',
        [novoStatus, id]
      );

      res.json({ mensagem: `Usuário ${novoStatus ? 'desbanido' : 'banido'} com sucesso!` });
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },
  async excluir(req, res) {
    const client = await pool.connect();
    try {
      const { id } = req.params;

      await client.query('BEGIN');

      await client.query(
        `DELETE FROM avaliacoes WHERE via_codigo IN (
          SELECT via_codigo FROM viagens WHERE usu_codigo = $1
        )`,
        [id]
      );

      await client.query(`DELETE FROM viagens WHERE usu_codigo = $1`, [id]);

      await client.query(`DELETE FROM avaliacoes WHERE usu_codigo = $1`, [id]);

      await client.query(`DELETE FROM solicitacoes WHERE usu_codigo = $1`, [id]);

      const result = await client.query(`DELETE FROM usuarios WHERE usu_codigo = $1`, [id]);

      await client.query('COMMIT');

      if (result.rowCount > 0) {
        res.json({ mensagem: 'Usuário excluído com sucesso!' });
      } else {
        res.status(404).json({ erro: 'Usuário não encontrado.' });
      }
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao excluir usuário:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    } finally {
      client.release();
    }
  }
};

export default UsuarioController;
