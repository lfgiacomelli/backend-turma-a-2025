// controllers/AnuncioController.js
import { z } from 'zod';
import pool from '../db/db.js';

const AnuncioSchema = z.object({
    anu_codigo: z.number(),
    anu_titulo: z.string(),
    anu_descricao: z.string(),
    anu_foto: z.string().optional(),
});

const AnuncioController = {
    async listarTodos(req, res) {
        try {
            const result = await pool.query('SELECT * FROM anuncios ORDER BY anu_codigo DESC');
            const anuncios = result.rows;

            const validAnuncios = anuncios.map(anuncio => AnuncioSchema.parse(anuncio));

            return res.status(200).json(validAnuncios);
        } catch (error) {
            console.error('Erro ao buscar anúncios:', error);
            return res.status(500).json({ mensagem: 'Erro ao buscar anúncios.' });
        }
    }
};

export default AnuncioController;
