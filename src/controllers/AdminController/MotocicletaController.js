import pool from '../../db/db.js';
import { enviarEmail } from '../../utils/email.js';
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
    const { mot_modelo, mot_placa, mot_ano, mot_cor, fun_codigo } = req.body;

    if (!mot_modelo) {
      return res.status(400).json({ message: "O modelo da motocicleta é obrigatório." });
    }

    try {
      const result = await pool.query(
        `INSERT INTO motocicletas (mot_modelo, mot_placa, mot_ano, mot_cor, fun_codigo)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [mot_modelo, mot_placa, mot_ano, mot_cor, fun_codigo]
      );

      const motoAdicionada = result.rows[0];

      const emailResult = await pool.query(
        `SELECT fun_email, fun_nome FROM funcionarios WHERE fun_codigo = $1`,
        [fun_codigo]
      );

      const funEmail = emailResult.rows[0]?.fun_email;
      const funNome = emailResult.rows[0]?.fun_nome;

      if (funEmail) {
        try {
          await enviarEmail({
            to: funEmail,
            subject: 'Motocicleta cadastrada',
            body: `Olá, ${funNome},

A motocicleta abaixo foi cadastrada com sucesso em nosso sistema:

Modelo: ${mot_modelo}
Placa: ${mot_placa}
Ano: ${mot_ano}
Cor: ${mot_cor}

Com isso, você estará apto(a) a receber solicitações de serviço, desde que esteja disponível e com todas as pendências de pagamento da diária devidamente regularizadas.

Por gentileza, revise as informações acima. Caso identifique qualquer dado incorreto, entre em contato com a equipe de gestão para realizar as devidas correções.

Atenciosamente,
Equipe ZoomX`
          });
        } catch (emailError) {
          console.error('Erro ao enviar e-mail:', emailError.message);
        }
      }


      res.status(201).json(motoAdicionada);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao adicionar motocicleta', error: error.message });
    }
  },


  async editar(req, res) {
    try {
      const { id } = req.params;
      const { mot_modelo, mot_placa, mot_ano, mot_cor } = req.body;


      const query = `
        UPDATE motocicletas 
        SET mot_modelo = $1, mot_placa = $2, mot_ano = $3, mot_cor = $4
        WHERE mot_codigo = $5
      `;

      await pool.query(query, [mot_modelo, mot_placa, mot_ano, mot_cor, id]);

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
  },

  async getMotorcycleById(req, res) {
    const { funCodigo } = req.params;

    try {
      const result = await pool.query(`
        SELECT * FROM motocicletas WHERE fun_codigo = $1
      `, [funCodigo]);

      if (result.rows.length === 0) {
        return res.status(404).json({ mensagem: 'Motocicleta não encontrada' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar motocicleta por ID:', error);
      res.status(500).json({ erro: 'Erro interno no servidor' });
    }
  }
};

export default MotocicletaController;
