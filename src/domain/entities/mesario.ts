export type CreateMesarioInput = {
	nome: string;
	cpf: string;
	zona?: string;
	secao?: string;
};

export type Mesario = CreateMesarioInput & {
	id: string;
	createdAt: string;
};