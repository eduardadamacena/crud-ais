import { randomUUID } from "node:crypto";
import type { CreateMesarioInput, Mesario } from "../../domain/entities/mesario.js";
import type { MesarioRepository } from "../../domain/repositories/mesario.repository.js";

export class CreateMesario {
	constructor(private readonly repository: MesarioRepository) {}

	async execute(input: CreateMesarioInput): Promise<Mesario> {
		if (typeof input.nome !== "string" || input.nome.trim() === "") {
			throw new Error("O campo nome é obrigatório");
		}

		if (typeof input.cpf !== "string" || input.cpf.trim() === "") {
			throw new Error("O campo cpf é obrigatório");
		}

		const mesario: Mesario = {
			id: randomUUID(),
			nome: input.nome.trim(),
			cpf: input.cpf.trim(),
			...(typeof input.zona === "string" && { zona: input.zona.trim() }),
			...(typeof input.secao === "string" && { secao: input.secao.trim() }),
			createdAt: new Date().toISOString(),
		};

		return this.repository.create(mesario);
	}
}