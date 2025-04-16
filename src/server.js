import express from 'express';
import routesUsuario from './routes/usuario_routes.js';
import routesSolicitacao from './routes/solicitacoes_routes.js';
import routesViagem from './routes/viagem_routes.js';
import routesFuncionario from './routes/funcionario_routes.js';

const server = express();
const PORT = process.env.PORT || 3000;

server.use(express.json());

server.use("/api/usuarios", routesUsuario);
server.use("/api/solicitacoes", routesSolicitacao);
server.use("/api/viagens", routesViagem);
server.use("/api/funcionarios", routesFuncionario);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
