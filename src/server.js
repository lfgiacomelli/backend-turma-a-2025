import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();


import routesUsuario from './routes/usuario_routes.js';
import routesSolicitacao from './routes/solicitacoes_routes.js';
import routesViagem from './routes/viagem_routes.js';
import routesFuncionario from './routes/funcionario_routes.js';
import loginRoutes from './routes/login_routes.js';
import routesAnuncio from './routes/anuncio_routes.js'; 
import routesAvaliacao from './routes/avaliacao_routes.js';

const server = express();

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

server.use(cors(corsOptions));
server.use(express.json());

server.use("/api/usuarios", routesUsuario);
server.use("/api/solicitacoes", routesSolicitacao);
server.use("/api/viagens", routesViagem);
server.use("/api/funcionarios", routesFuncionario);
server.use("/api/login", loginRoutes);
server.use('/api/anuncios', routesAnuncio);
server.use('/api/avaliacoes', routesAvaliacao);

server.get('/', (req, res) => {
  res.send('Backend server is running!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Node environment: ${process.env.NODE_ENV || 'development'}`);
});
