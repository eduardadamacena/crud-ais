import type { Mesario } from "../../domain/entities/mesario.js";
import type { MesarioRepository } from "../../domain/repositories/mesario.repository.js";

export class InMemoryMesarioRepository implements MesarioRepository {
	private readonly mesarios: Mesario[] = [];

	async create(mesario: Mesario): Promise<Mesario> {
		this.mesarios.push(mesario);
		return mesario;
	}

	async findAll(): Promise<Mesario[]> {
		return [...this.mesarios];
	}
}
