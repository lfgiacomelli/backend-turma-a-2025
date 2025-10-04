import pool from '../../db/db.js';
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

const PushNotifications = {
  async listar(req, res) {
    try {
      const result = await pool.query(
        'SELECT usu_nome, push_token FROM usuarios WHERE push_token IS NOT NULL'
      );
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Erro ao listar notificações push:', error);
      return res.status(500).json({ message: 'Erro ao listar notificações push' });
    }
  },

  async enviar(req, res) {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "Nenhuma mensagem para enviar" });
    }

    const validMessages = messages.filter(m => Expo.isExpoPushToken(m.token));
    if (validMessages.length === 0) {
      return res.status(400).json({ message: "Nenhuma mensagem com token válido" });
    }

    try {
      let tickets = [];

      // Chunk das notificações
      const chunks = expo.chunkPushNotifications(
        validMessages.map(m => ({
          to: m.token,
          sound: 'default',
          title: m.title,
          body: m.body,
          data: m.data || {},
          priority: 'high',
          android: {
            channelId: 'default',
            priority: 'high',
            sticky: false,
          },
          ios: {
            sound: 'default',
            priority: 'high',
            contentAvailable: true,
          },
        }))
      );

      // Envio das notificações
      for (let chunk of chunks) {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      // Recebendo os receipts
      const receiptIds = tickets
        .filter(ticket => ticket.id)
        .map(ticket => ticket.id);

      let receipts = {};
      if (receiptIds.length > 0) {
        const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
        for (let chunk of receiptIdChunks) {
          const chunkReceipts = await expo.getPushNotificationReceiptsAsync(chunk);
          receipts = { ...receipts, ...chunkReceipts };
        }
      }

      return res.status(200).json({
        message: "Notificações enviadas",
        tickets,
        receipts
      });
    } catch (error) {
      console.error("Erro ao enviar notificações push:", error);
      return res.status(500).json({
        message: "Erro ao enviar notificações push",
        error: error.message
      });
    }
  }
};

export default PushNotifications;
