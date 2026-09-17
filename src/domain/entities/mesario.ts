export type CreateMesarioInput = {
	nome: string;
	cpf: string;
	zona?: string;
	secao?: string;
};

export type UpdateMesarioInput = Partial<Pick<CreateMesarioInput, "nome" | "cpf">> & {
	zona?: string | null;
	secao?: string | null;
};

export type Mesario = CreateMesarioInput & {
	id: string;
	createdAt: string;
};
