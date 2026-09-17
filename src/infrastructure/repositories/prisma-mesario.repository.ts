import { Prisma, type PrismaClient, type Mesario as PrismaMesario } from "@prisma/client";
import type { Mesario, UpdateMesarioInput } from "../../domain/entities/mesario.js";
import type { MesarioRepository } from "../../domain/repositories/mesario.repository.js";

function toMesario(row: PrismaMesario): Mesario {
	return {
		id: row.id,
		nome: row.nome,
		cpf: row.cpf,
		...(row.zona !== null && { zona: row.zona }),
		...(row.secao !== null && { secao: row.secao }),
		createdAt: row.createdAt.toISOString(),
	};
}

export class PrismaMesarioRepository implements MesarioRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async create(mesario: Mesario): Promise<Mesario> {
		const created = await this.prisma.mesario.create({
			data: {
				id: mesario.id,
				nome: mesario.nome,
				cpf: mesario.cpf,
				zona: mesario.zona ?? null,
				secao: mesario.secao ?? null,
				createdAt: new Date(mesario.createdAt),
			},
		});
		return toMesario(created);
	}

	async update(id: string, changes: UpdateMesarioInput): Promise<Mesario | null> {
		try {
			const updated = await this.prisma.mesario.update({ where: { id }, data: changes });
			return toMesario(updated);
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
				return null;
			}
			throw error;
		}
	}
}
