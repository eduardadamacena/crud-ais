import type { Mesario } from "../../domain/entities/mesario.js";
import type { MesarioRepository } from "../../domain/repositories/mesario.repository.js";

export class ListMesarios {
	constructor(private readonly repository: MesarioRepository) {}

	async execute(): Promise<Mesario[]> {
		return this.repository.findAll();
	}
}
