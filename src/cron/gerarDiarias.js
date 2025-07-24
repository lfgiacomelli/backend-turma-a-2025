import cron from "node-cron";
import PagamentosController from "../controllers/AdminController/PagamentosController.js";

cron.schedule("10 0 * * *", async () => {
  await PagamentosController.gerarDiarias();
});
