import pool from '../db/db.js';
import { z } from 'zod';

const AddressSchema = z.object({
    usu_codigo: z.number().min(1, "É necessário informar o código do usuário!"),
    end_apelido: z.string().min(1, "É necessário ter um apelido para esse endereço!"),
    end_logradouro: z.string().min(1, "Insira o endereço corretamente"),
    end_numero: z.string(),
    end_bairro: z.string().min(1, "Insira o bairro corretamente"),
    end_cep: z.string().min(8, "Insira o CEP da rua corretamente")
});

const AddressController = {
    async listar(req, res) {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: "false", mensagem: "ID do usuário não encontrado" });
        }
        try {
            const result = await pool.query("SELECT * FROM enderecos WHERE usu_codigo = $1", [id]);
            return res.json(result.rows);
        } catch (error) {
            console.log("Erro ao buscar os endereços desse usuário.", error);
            return res.status(500).json({
                success: "false",
                mensagem: "Não foi possível buscar as viagens desse usuário, tente novamente mais tarde!"
            })
        }
    },

    async createAddress(req, res) {

        try {
            const {
                usu_codigo,
                end_apelido,
                end_logradouro,
                end_numero,
                end_bairro,
                end_cep
            } = req.body;
            
            AddressSchema.parse({ usu_codigo, end_apelido, end_logradouro, end_numero, end_bairro, end_cep });
            
            await pool.query(`INSERT INTO enderecos(usu_codigo, end_apelido, end_logradouro, end_numero, end_bairro, end_cep) VALUES ($1, $2, $3, $4, $5, $6)`, [usu_codigo, end_apelido, end_logradouro, end_numero, end_bairro, end_cep || null]);
            
            return res.status(201).json({ message: "Endereço adicionado com sucesso!" });
        
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Erro de validação",
                    details: error.errors,
                });
            }
            console.log(error);
            return res.status(500).json({
                success: "false",
                mensagem: "Não foi possível adicionar o endereço, tente novamente mais tarde!"
            })
        }
    },
    async editAddress(req, res) {
        try {
            const { id } = req.params
            const { usu_codigo, end_apelido, end_logradouro, end_numero, end_bairro, end_cep } = req.body;

            const query = "UPDATE enderecos SET usu_codigo = $1, end_apelido = $2, end_logradouro = $3, end_numero = $4, end_bairro = $5, end_cep = $6 WHERE end_codigo = $7";

            const result = await pool.query(query, [usu_codigo, end_apelido, end_logradouro, end_numero, end_bairro, end_cep, id])
            if (result.rowCount === 0) {
                return res.status(404).json({ message: "Endereço não encontrado" });
            }
            return res.status(200).json({
                message: "Endereço atualizado com sucesso"
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Erro de validação",
                    details: error.errors,
                });
            }
            return res.status(500).json({
                success: "false",
                mensagem: "Não foi possível editar o endereço, tente novamente mais tarde!"
            })
        }
    },

    async deleteAddress(req, res) {
        const { id } = req.params;
        try {
            const result = await pool.query("DELETE FROM enderecos WHERE end_codigo = $1", [id]);

            if (result.rowCount === 0) {
                return res.status(404).json({
                    message: "Endereço não encontrado."
                });
            }
            return res.status(200).json({
                message: "Endereço excluído com sucesso!"
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Não foi possível excluir este endereço, tente novamente mais tarde!"
            })
        }
    }
}

export default AddressController;