import express from 'express';
import routerFuncionario from './routes/funcionario_routes.js';

const server = express();
const PORT = process.env.PORT || 3000;

server.use(express.json());
server.use("/api/funcionarios", routerFuncionario);


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
