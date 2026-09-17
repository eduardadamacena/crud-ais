import "dotenv/config";
import { createServer } from "node:http";
import { PrismaClient } from "@prisma/client";
import { CreateMesario } from "./application/use-cases/create-mesario.js";
import { UpdateMesario } from "./application/use-cases/update-mesario.js";
import { MesarioController } from "./adapters/http/mesario.controller.js";
import { PrismaMesarioRepository } from "./infrastructure/repositories/prisma-mesario.repository.js";

const port = Number(process.env.PORT) || 3000;

const prisma = new PrismaClient();
const repository = new PrismaMesarioRepository(prisma);
const createMesario = new CreateMesario(repository);
const updateMesario = new UpdateMesario(repository);
const controller = new MesarioController(createMesario, updateMesario);
const server = createServer((request, response) => controller.handle(request, response));

prisma.$connect().then(() => {
	server.listen(port, () => {
		console.log(`Servidor rodando em http://localhost:${port}`);
	});
}).catch((error: unknown) => {
	console.error("Não foi possível conectar ao PostgreSQL", error);
	process.exitCode = 1;
	void prisma.$disconnect();
});
