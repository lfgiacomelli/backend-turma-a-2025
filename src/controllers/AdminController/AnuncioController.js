import pool from '../../db/db.js';


const AnuncioController = {
  async listar(req, res) {
    try{
      const result = await pool.query('SELECT * FROM anuncios');
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao listar anúncios:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },
  async adicionar(req, res) {
    try {
      const { titulo, foto, descricao } = req.body;

      const query = `
        INSERT INTO anuncios (anu_titulo, anu_foto, anu_descricao)
        VALUES ($1, $2, $3)
      `;

      await pool.query(query, [titulo, foto, descricao]);

      res.status(201).json({ mensagem: 'Anúncio adicionado com sucesso!' });
    } catch (error) {
      console.error('Erro ao inserir anúncio:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },

  async editar(req, res) {
    try {
      const { id } = req.params;
      const { titulo, foto, descricao } = req.body;

      const query = `
      UPDATE anuncios
      SET anu_titulo = $1, anu_foto = $2, anu_descricao = $3
      WHERE anu_codigo = $4
    `;

      const result = await pool.query(query, [titulo, foto, descricao, id]);

      if (result.rowCount > 0) {
        res.json({ mensagem: 'Anúncio editado com sucesso!' });
      } else {
        res.status(404).json({ erro: 'Anúncio não encontrado.' });
      }
    } catch (error) {
      console.error('Erro ao editar anúncio:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },

  async excluir(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM anuncios WHERE anu_codigo = $1',
        [id]
      );

      if (result.rowCount > 0) {
        res.json({ mensagem: 'Anúncio excluído com sucesso!' });
      } else {
        res.status(404).json({ erro: 'Anúncio não encontrado.' });
      }
    } catch (error) {
      console.error('Erro ao excluir anúncio:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  }
};

export default AnuncioController;
