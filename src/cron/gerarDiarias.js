import cron from "node-cron";
import PagamentosController from "../controllers/AdminController/PagamentosController.js";

cron.schedule("10 0 * * *", async () => {
  try {
    const resultado = await PagamentosController.gerarDiarias();
    console.log("Diárias geradas via cron:", resultado);
  } catch (err) {
    console.error("Erro ao gerar diárias via cron:", err);
  }
}, {
  timezone: "America/Sao_Paulo"
});
