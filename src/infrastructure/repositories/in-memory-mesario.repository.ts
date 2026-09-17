import type { Mesario, UpdateMesarioInput } from "../../domain/entities/mesario.js";
import type { MesarioRepository } from "../../domain/repositories/mesario.repository.js";

export class InMemoryMesarioRepository implements MesarioRepository {
	private readonly mesarios: Mesario[] = [];

	async create(mesario: Mesario): Promise<Mesario> {
		this.mesarios.push(mesario);
		return mesario;
	}

	async update(id: string, changes: UpdateMesarioInput): Promise<Mesario | null> {
		const index = this.mesarios.findIndex((mesario) => mesario.id === id);
		if (index === -1) return null;
		const mesario: Mesario = { ...this.mesarios[index] };
		if (changes.nome !== undefined) mesario.nome = changes.nome;
		if (changes.cpf !== undefined) mesario.cpf = changes.cpf;
		for (const field of ["zona", "secao"] as const) {
			if (Object.hasOwn(changes, field)) {
				if (changes[field] === null) delete mesario[field];
				else mesario[field] = changes[field];
			}
		}
		this.mesarios[index] = mesario;
		return mesario;
	}
}
