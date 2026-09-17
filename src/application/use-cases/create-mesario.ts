import { randomUUID } from "node:crypto";
import type { Mesario } from "../../domain/entities/mesario.js";
import type { MesarioRepository } from "../../domain/repositories/mesario.repository.js";
import { validateCreateMesario } from "../validate-mesario.js";

export class CreateMesario {
	constructor(private readonly repository: MesarioRepository) {}

	async execute(value: unknown): Promise<Mesario> {
		const input = validateCreateMesario(value);

		const mesario: Mesario = {
			id: randomUUID(),
			...input,
			createdAt: new Date().toISOString(),
		};

		return this.repository.create(mesario);
	}
}
