import pool from '../../db/db.js';



const MotocicletaController = {
  async listar(req, res) {
    try {
      const { pagina = 1, limite = 10 } = req.query;
      const offset = (pagina - 1) * limite;

      const query = `
  SELECT 
  m.mot_codigo, 
  m.mot_modelo, 
  m.mot_placa, 
  m.mot_ano, 
  m.mot_cor, 
  m.fun_codigo,
  f.fun_nome
FROM motocicletas m
INNER JOIN funcionarios f ON m.fun_codigo = f.fun_codigo
ORDER BY m.mot_modelo
LIMIT $1 OFFSET $2

`;


      const result = await pool.query(query, [limite, offset]);

      res.json(result.rows);
    }
    catch (error) {
      console.error('Erro ao listar motocicletas:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },
  async adicionar(req, res) {
    try {
      const { modelo, placa, ano, cor, fun_codigo } = req.body;

      const query = `
        INSERT INTO motocicletas (mot_modelo, mot_placa, mot_ano, mot_cor, fun_codigo)
        VALUES ($1, $2, $3, $4, $5)
      `;

      await pool.query(query, [modelo, placa, ano, cor, fun_codigo]);

      res.status(201).json({ mensagem: 'Motocicleta adicionada com sucesso!' });
    } catch (error) {
      console.error('Erro ao adicionar motocicleta:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },

  async editar(req, res) {
    try {
      const { id } = req.params;
      const { modelo, placa, ano, cor } = req.body;

      const query = `
        UPDATE motocicletas 
        SET mot_modelo = $1, mot_placa = $2, mot_ano = $3, mot_cor = $4
        WHERE mot_codigo = $5
      `;

      await pool.query(query, [modelo, placa, ano, cor, id]);

      res.json({ mensagem: 'Motocicleta editada com sucesso!' });
    } catch (error) {
      console.error('Erro ao editar motocicleta:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },

  async excluir(req, res) {
    try {
      const { id } = req.params;

      const query = 'DELETE FROM motocicletas WHERE mot_codigo = $1';

      await pool.query(query, [id]);

      res.json({ mensagem: 'Motocicleta excluída com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir motocicleta:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  }
};

export default MotocicletaController;
