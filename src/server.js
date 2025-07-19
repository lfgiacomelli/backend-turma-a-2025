import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import routesUsuario from './routes/usuario_routes.js';
import routesSolicitacao from './routes/solicitacoes_routes.js';
import routesViagem from './routes/viagem_routes.js';
import routesFuncionario from './routes/funcionario_routes.js';
import loginRoutes from './routes/login_routes.js';
import routesAnuncio from './routes/anuncio_routes.js';
import routesAvaliacao from './routes/avaliacao_routes.js';
import routesPayment from './routes/payment_routes.js';
import routesAddress from './routes/address_routes.js';
import routesEmail from './routes/email_contratacao.js';

import routesAdminMotocicleta from './routes/AdminRoutes/motocicleta_routes.js';
import routesAdminUsuario from './routes/AdminRoutes/usuario_routes.js';
import routesAdminSolicitacao from './routes/AdminRoutes/solicitacao_routes.js';
import routesAdminViagem from './routes/AdminRoutes/viagem_routes.js';
import routesAdminAnuncio from './routes/AdminRoutes/anuncio_routes.js';
import routesAdminFuncionario from './routes/AdminRoutes/funcionario_routes.js';
import routesAdminRelatorio from './routes/AdminRoutes/relatorio_routes.js';
import loginFuncionarioRoutes from './routes/AdminRoutes/login_routes.js';


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
server.use('/api/payments', routesPayment);
server.use('/api/enderecos', routesAddress);
server.use('/api/email', routesEmail);


server.use('/api/admin/usuarios', routesAdminUsuario);
server.use('/api/admin/solicitacoes', routesAdminSolicitacao);
server.use('/api/admin/viagens', routesAdminViagem);
server.use('/api/admin/anuncios', routesAdminAnuncio);
server.use('/api/admin/funcionarios', routesAdminFuncionario);
server.use('/api/admin/motocicletas', routesAdminMotocicleta);
server.use('/api/admin/relatorios', routesAdminRelatorio);
server.use('/api/admin/login', loginFuncionarioRoutes);

server.get('/', (req, res) => { 
  res.send('Backend server is running!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Node environment: ${process.env.NODE_ENV || 'development'}`);
});
