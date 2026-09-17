import type { IncomingMessage, ServerResponse } from "node:http";
import { CreateMesario } from "../../application/use-cases/create-mesario.js";
import { UpdateMesario } from "../../application/use-cases/update-mesario.js";
import { NotFoundError, ValidationError } from "../../application/errors.js";

export class MesarioController {
	constructor(
		private readonly createMesario: CreateMesario,
		private readonly updateMesario: UpdateMesario,
	) {}

	async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
		const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
		const updateRoute = /^\/mesarios\/([^/]+)$/.exec(pathname);
		if (!(request.method === "POST" && pathname === "/mesarios") &&
			!(request.method === "PATCH" && updateRoute)) {
			this.respond(response, 404, { erro: "Rota não encontrada" });
			return;
		}

		try {
			const input: unknown = JSON.parse(await this.readBody(request));
			if (request.method === "POST") {
				const mesario = await this.createMesario.execute(input);
				this.respond(response, 201, mesario);
			} else {
				const mesario = await this.updateMesario.execute(updateRoute![1], input);
				this.respond(response, 200, mesario);
			}
		} catch (error) {
			if (error instanceof SyntaxError) {
				this.respond(response, 400, { erro: "O corpo da requisição deve ser um JSON válido" });
			} else if (error instanceof ValidationError) {
				this.respond(response, 400, { erro: error.message });
			} else if (error instanceof NotFoundError) {
				this.respond(response, 404, { erro: error.message });
			} else {
				console.error("Falha ao processar mesário", error);
				this.respond(response, 500, { erro: "Erro interno do servidor" });
			}
		}
	}

	private readBody(request: IncomingMessage): Promise<string> {
		return new Promise((resolve, reject) => {
			let body = "";
			request.on("data", (part: Buffer) => (body += part.toString()));
			request.on("end", () => resolve(body));
			request.on("error", reject);
		});
	}

	private respond(response: ServerResponse, statusCode: number, data: unknown): void {
		response.writeHead(statusCode, { "Content-Type": "application/json" });
		response.end(JSON.stringify(data));
	}
}
