import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";
import { MesarioController } from "../src/adapters/http/mesario.controller.js";
import { CreateMesario } from "../src/application/use-cases/create-mesario.js";
import { UpdateMesario } from "../src/application/use-cases/update-mesario.js";
import { PrismaMesarioRepository } from "../src/infrastructure/repositories/prisma-mesario.repository.js";

async function startApi(): Promise<{ server: Server; prisma: PrismaClient; baseUrl: string }> {
	const prisma = new PrismaClient();
	await prisma.$connect();
	const repository = new PrismaMesarioRepository(prisma);
	const controller = new MesarioController(new CreateMesario(repository), new UpdateMesario(repository));
	const server = createServer((request, response) => controller.handle(request, response));
	await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
	const port = (server.address() as AddressInfo).port;
	return { server, prisma, baseUrl: `http://127.0.0.1:${port}` };
}

async function stopApi(api: Awaited<ReturnType<typeof startApi>>): Promise<void> {
	await new Promise<void>((resolve, reject) => api.server.close((error) => error ? reject(error) : resolve()));
	await api.prisma.$disconnect();
}

async function send(baseUrl: string, method: string, path: string, body: unknown): Promise<Response> {
	return fetch(`${baseUrl}${path}`, {
		method,
		headers: { "Content-Type": "application/json" },
		body: typeof body === "string" ? body : JSON.stringify(body),
	});
}

test("PATCH atualiza parcialmente e persiste no PostgreSQL", async () => {
	let api = await startApi();
	let id: string | undefined;
	try {
		const create = await send(api.baseUrl, "POST", "/mesarios", {
			nome: "  Maria  ", cpf: " 123 ", zona: " 10 ", secao: " 20 ",
		});
		assert.equal(create.status, 201);
		const original = await create.json() as Record<string, string>;
		id = original.id;
		assert.match(id, /^[0-9a-f-]{36}$/);
		assert.equal(original.nome, "Maria");
		assert.equal(original.cpf, "123");
		assert.equal(original.zona, "10");
		assert.equal(original.secao, "20");
		assert.ok(!Number.isNaN(Date.parse(original.createdAt)));

		const update = await send(api.baseUrl, "PATCH", `/mesarios/${id}`, { nome: " Ana " });
		assert.equal(update.status, 200);
		assert.deepEqual(await update.json(), { ...original, nome: "Ana" });

		const clear = await send(api.baseUrl, "PATCH", `/mesarios/${id}`, { zona: null, secao: null });
		assert.equal(clear.status, 200);
		assert.deepEqual(await clear.json(), {
			id, nome: "Ana", cpf: "123", createdAt: original.createdAt,
		});

		await stopApi(api);
		api = await startApi();
		const afterRestart = await send(api.baseUrl, "PATCH", `/mesarios/${id}`, { cpf: "456" });
		assert.equal(afterRestart.status, 200);
		assert.deepEqual(await afterRestart.json(), {
			id, nome: "Ana", cpf: "456", createdAt: original.createdAt,
		});

		for (const [body, status] of [
			["{", 400], [{}, 400], [{ nome: " " }, 400], [{ zona: "" }, 400],
			[{ id: randomUUID() }, 400], [{ createdAt: original.createdAt }, 400],
			[{ nome: null }, 400],
		] as const) {
			const result = await send(api.baseUrl, "PATCH", `/mesarios/${id}`, body);
			assert.equal(result.status, status);
		}

		const missing = await send(api.baseUrl, "PATCH", `/mesarios/${randomUUID()}`, { nome: "Outro" });
		assert.equal(missing.status, 404);
		const invalidId = await send(api.baseUrl, "PATCH", "/mesarios/invalido", { nome: "Outro" });
		assert.equal(invalidId.status, 400);
		const invalidCreate = await send(api.baseUrl, "POST", "/mesarios", { nome: "Maria" });
		assert.equal(invalidCreate.status, 400);
	} finally {
		if (id) await api.prisma.mesario.deleteMany({ where: { id } });
		await stopApi(api);
	}
});
