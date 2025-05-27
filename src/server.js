import express from 'express';
import cors from 'cors';
// Make sure your import paths are correct if your project structure is different.
// Assuming 'routes' is a directory in the same level as server.js
import routesUsuario from './routes/usuario_routes.js';
import routesSolicitacao from './routes/solicitacoes_routes.js';
import routesViagem from './routes/viagem_routes.js';
import routesFuncionario from './routes/funcionario_routes.js';
import loginRoutes from './routes/login_routes.js'; // This is the file we corrected

const server = express();

// CORS configuration
// You might want to restrict this to your app's domain in production
const corsOptions = {
  origin: '*', // Or specify your frontend URL: e.g., 'https://your-app.com' or a function for dynamic origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};
server.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
server.use(express.json());

server.use("/api/usuarios", routesUsuario);
server.use("/api/solicitacoes", routesSolicitacao);
server.use("/api/viagens", routesViagem);
server.use("/api/funcionarios", routesFuncionario);
server.use("/api/login", loginRoutes); // Using the corrected login routes

// Simple health check route
server.get('/', (req, res) => {
  res.send('Backend server is running!');
});


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Node environment: ${process.env.NODE_ENV || 'development'}`);
});
