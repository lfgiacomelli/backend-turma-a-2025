import pool from '../../db/db.js';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const FotoFuncionarioController = {
  uploadFoto: async (req, res) => {
    try {
      const { fun_codigo } = req.body;
      const file = req.file;

      if (!file) return res.status(400).json({ error: 'Arquivo não enviado.' });
      if (!fun_codigo) return res.status(400).json({ error: 'Código do funcionário não fornecido.' });

      const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedMimes.includes(file.mimetype)) {
        return res.status(415).json({ error: 'Tipo de arquivo não suportado. Use PNG ou JPEG.' });
      }

      const fileExt = path.extname(file.originalname).toLowerCase();
      const fileName = `${fun_codigo}_${Date.now()}${fileExt}`;
      const filePath = `funcionarios/${fileName}`;

      const fileBuffer = fs.readFileSync(file.path);

      const { data, error: uploadError } = await supabase.storage
        .from('funcionarios') 
        .upload(filePath, fileBuffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.mimetype,
        });

      if (uploadError) {
        console.error('Erro ao enviar para Supabase:', uploadError);
        return res.status(500).json({ error: 'Erro ao enviar arquivo para o storage.' });
      }

      fs.unlinkSync(file.path);

      await pool.query(
        'UPDATE funcionarios SET fun_documento = $1 WHERE fun_codigo = $2',
        [filePath, fun_codigo]
      );

      return res.status(200).json({ message: 'Foto enviada com sucesso.', path: filePath });
    } catch (err) {
      console.error('Erro no upload de foto:', err);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  },

  listarSemFoto: async (req, res) => {
    try {
      const sql = 'SELECT fun_codigo, fun_nome FROM funcionarios WHERE fun_cargo = "Mototaxista" fun_documento IS NULL';
      const result = await pool.query(sql);
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao listar funcionários sem foto:', error);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  },

  exibirFotos: async (req, res) => {
    try {
      const sql = 'SELECT fun_codigo, fun_nome, fun_documento FROM funcionarios WHERE fun_documento IS NOT NULL';
      const result = await pool.query(sql);

      const fotosComLink = await Promise.all(
        result.rows.map(async (row) => {
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('funcionarios')
            .createSignedUrl(row.fun_documento, 60); 

          return {
            ...row,
            url: signedUrlError ? null : signedUrlData.signedUrl,
          };
        })
      );

      res.json(fotosComLink);
    } catch (error) {
      console.error('Erro ao exibir fotos de funcionários:', error);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  },
};

export default FotoFuncionarioController;
