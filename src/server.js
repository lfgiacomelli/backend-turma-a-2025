import express from 'express';
import routerFuncionario from './routes/funcionario_routes.js';
import routerViagem from './routes/viagem_routes.js';
import routerUsuario from './routes/usuario_routes.js';
import routerSolicitacao from './routes/solicitacoes_routes.js';

const server = express();
const PORT = process.env.PORT || 3000;

server.use(express.json());
server.use("/api/funcionarios", routerFuncionario);
server.use("/api/viagem", routerViagem);
server.use("/api/usuarios", routerUsuario);
server.use("/api/solicitacoes", routerSolicitacao);



server.get("/", (req, res) => {
    res.send("GET " + new Date());
});

server.post("/", (req, res) => {
    res.send("POST " + new Date());
});

server.patch("/", (req, res) => {
    res.send("PATCH " + new Date());
});

server.delete("/", (req, res) => {
    res.send("DELETE " + new Date());
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
