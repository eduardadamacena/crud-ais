import type { Mesario } from "../../domain/entities/mesario.js";
import type { MesarioRepository } from "../../domain/repositories/mesario.repository.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { validateUpdateMesario } from "../validate-mesario.js";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class UpdateMesario {
	constructor(private readonly repository: MesarioRepository) {}

	async execute(id: string, value: unknown): Promise<Mesario> {
		if (!uuidPattern.test(id)) {
			throw new ValidationError("O ID do mesário é inválido");
		}
		const changes = validateUpdateMesario(value);
		const mesario = await this.repository.update(id, changes);
		if (mesario === null) {
			throw new NotFoundError("Mesário não encontrado");
		}
		return mesario;
	}
}
