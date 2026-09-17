import type { IncomingMessage, ServerResponse } from "node:http";
import { CreateMesario } from "../../application/use-cases/create-mesario.js";
import { ListMesarios } from "../../application/use-cases/list-mesarios.js";
import type { CreateMesarioInput } from "../../domain/entities/mesario.js";

export class MesarioController {
	constructor(
		private readonly createMesario: CreateMesario,
		private readonly listMesarios: ListMesarios,
	) {}

	async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
		if (request.method === "GET" && request.url === "/mesarios") {
			const mesarios = await this.listMesarios.execute();
			this.respond(response, 200, mesarios);
			return;
		}

		if (request.method !== "POST" || request.url !== "/mesarios") {
			this.respond(response, 404, { erro: "Rota não encontrada" });
			return;
		}

		try {
			const input = JSON.parse(await this.readBody(request)) as CreateMesarioInput;
			const mesario = await this.createMesario.execute(input);
			this.respond(response, 201, mesario);
		} catch (error) {
			const message = error instanceof SyntaxError
				? "O corpo da requisição deve ser um JSON válido"
				: error instanceof Error
					? error.message
					: "Não foi possível criar o mesário";
			this.respond(response, 400, { erro: message });
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
		response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
		response.end(JSON.stringify(data, null, 2));
	}
}
