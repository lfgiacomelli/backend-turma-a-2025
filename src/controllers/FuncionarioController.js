import pool from "../db/db.js";

const FuncionarioController = {
  async getFuncionarioById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "ID do funcionário é obrigatório." });
      }

      const [rows] = await pool.query(
        `SELECT 
            f.*, 
            m.mot_codigo, 
            m.mot_modelo, 
            m.mot_placa
         FROM funcionarios f
         LEFT JOIN motocicletas m ON f.fun_codigo = m.fun_codigo
         WHERE f.fun_codigo = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Funcionário não encontrado." });
      }

      return res.status(200).json(rows[0]);

    } catch (error) {
      console.error("Erro ao buscar funcionário:", error);
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }
};

export default FuncionarioController;
