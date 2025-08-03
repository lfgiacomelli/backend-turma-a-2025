import pool from '../../db/db.js';
import path from 'path';
import fs from 'fs';

const FotoFuncionarioController = {
  uploadFoto: async (req, res) => {
    try {
      const { fun_codigo } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'Arquivo não enviado.' });
      }

      if (!fun_codigo) {
        return res.status(400).json({ error: 'Código do funcionário não fornecido.' });
      }

      const imagePath = `/uploads/${file.filename}`;

      await pool.query(
        'UPDATE funcionarios SET fun_documento = $1 WHERE fun_codigo = $2',
        [imagePath, fun_codigo]
      );

      return res.status(200).json({ message: 'Foto enviada com sucesso.', path: imagePath });
    } catch (err) {
      console.error('Erro no upload de foto:', err);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  },

  async listarSemFoto(req, res) {
    try {
      const sql = `
        SELECT fun_codigo, fun_nome FROM funcionarios WHERE fun_documento IS NULL
      `;
      const result = await pool.query(sql);
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao listar funcionários sem foto:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  },
  async exibirFotos(req, res) {
    try {
      const sql = `
        SELECT fun_codigo, fun_nome, fun_documento FROM funcionarios WHERE fun_documento IS NOT NULL
      `;
      const result = await pool.query(sql);
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao exibir fotos de funcionários:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  }
};

export default FotoFuncionarioController;
