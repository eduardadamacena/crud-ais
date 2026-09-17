import type { CreateMesarioInput, UpdateMesarioInput } from "../domain/entities/mesario.js";
import { ValidationError } from "./errors.js";

const allowedFields = new Set(["nome", "cpf", "zona", "secao"]);

function fieldsOf(value: unknown): Record<string, unknown> {
	if (value === null || typeof value !== "object" || Array.isArray(value)) {
		throw new ValidationError("O corpo da requisição deve ser um objeto JSON");
	}

	const fields = value as Record<string, unknown>;
	for (const field of Object.keys(fields)) {
		if (!allowedFields.has(field)) {
			throw new ValidationError(`Campo não permitido: ${field}`);
		}
	}
	return fields;
}

function requiredString(value: unknown, field: string): string {
	if (typeof value !== "string" || value.trim() === "") {
		throw new ValidationError(`O campo ${field} deve ser um texto não vazio`);
	}
	return value.trim();
}

export function validateCreateMesario(value: unknown): CreateMesarioInput {
	const fields = fieldsOf(value);
	const input: CreateMesarioInput = {
		nome: requiredString(fields.nome, "nome"),
		cpf: requiredString(fields.cpf, "cpf"),
	};
	for (const field of ["zona", "secao"] as const) {
		if (fields[field] !== undefined) {
			input[field] = requiredString(fields[field], field);
		}
	}
	return input;
}

export function validateUpdateMesario(value: unknown): UpdateMesarioInput {
	const fields = fieldsOf(value);
	if (Object.keys(fields).length === 0) {
		throw new ValidationError("Informe ao menos um campo para atualizar");
	}

	const changes: UpdateMesarioInput = {};
	for (const field of ["nome", "cpf"] as const) {
		if (Object.hasOwn(fields, field)) {
			changes[field] = requiredString(fields[field], field);
		}
	}
	for (const field of ["zona", "secao"] as const) {
		if (Object.hasOwn(fields, field)) {
			changes[field] = fields[field] === null ? null : requiredString(fields[field], field);
		}
	}
	return changes;
}
