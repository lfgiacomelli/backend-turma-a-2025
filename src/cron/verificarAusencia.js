import cron from 'node-cron';

cron.schedule('0 9 * * *', () => {
  console.log('Verificando ausência de funcionários...');
  verificarAusenciaFuncionarios();
});
