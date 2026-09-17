import { createServer } from "node:http";
import { CreateMesario } from "./application/use-cases/create-mesario.js";
import { MesarioController } from "./adapters/http/mesario.controller.js";
import { InMemoryMesarioRepository } from "./infrastructure/repositories/in-memory-mesario.repository.js";

const port = Number(process.env.PORT) || 3000;

const repository = new InMemoryMesarioRepository();
const createMesario = new CreateMesario(repository);
const controller = new MesarioController(createMesario);
const server = createServer((request, response) => controller.handle(request, response));

server.listen(port, () => {
	console.log(`Servidor rodando em http://localhost:${port}`);
});
