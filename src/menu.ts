import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { CreateMesario } from "./application/use-cases/create-mesario.js";
import { ListMesarios } from "./application/use-cases/list-mesarios.js";
import { UpdateMesario } from "./application/use-cases/update-mesario.js";
import { DeleteMesario } from "./application/use-cases/delete-mesario.js";

import { InMemoryMesarioRepository } from "./infrastructure/repositories/in-memory-mesario.repository.js";

const repository = new InMemoryMesarioRepository();

const createMesario = new CreateMesario(repository);
const listMesarios = new ListMesarios(repository);
const updateMesario = new UpdateMesario(repository);
const deleteMesario = new DeleteMesario(repository);

const rl = createInterface({
	input,
	output,
});

function mostrarMenu(): void {
	console.clear();

	console.log("====================================");
	console.log("       SISTEMA DE MESÁRIOS");
	console.log("====================================");
	console.log("");
	console.log("1 - Criar mesário");
	console.log("2 - Editar mesário");
	console.log("3 - Listar mesários");
	console.log("4 - Deletar mesário");
	console.log("0 - Sair");
	console.log("");
	console.log("====================================");
}

async function criarMesario(): Promise<void> {
	console.log("\n--- CRIAR MESÁRIO ---\n");

	const nome = await rl.question("Nome: ");
	const cpf = await rl.question("CPF: ");
	const zona = await rl.question("Zona eleitoral: ");
	const secao = await rl.question("Seção eleitoral: ");

	try {
		const mesario = await createMesario.execute({
			nome,
			cpf,
			zona,
			secao,
		});

		console.log("\nMesário criado com sucesso!");
		console.log(`ID: ${mesario.id}`);
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Não foi possível criar o mesário";

		console.log(`\nErro: ${message}`);
	}

	await pausar();
}

async function editarMesario(): Promise<void> {
	console.log("\n--- EDITAR MESÁRIO ---\n");

	const mesarios = await listMesarios.execute();

	if (mesarios.length === 0) {
		console.log("Nenhum mesário cadastrado.");
		await pausar();
		return;
	}

	mostrarLista(mesarios);

	const id = await rl.question("\nDigite o ID do mesário: ");

	const mesario = await repository.findById(id.trim());

	if (!mesario) {
		console.log("\nMesário não encontrado.");
		await pausar();
		return;
	}

	console.log("\nPressione ENTER para manter o valor atual.\n");

	const nome = await rl.question(`Nome [${mesario.nome}]: `);
	const cpf = await rl.question(`CPF [${mesario.cpf}]: `);
	const zona = await rl.question(
		`Zona eleitoral [${mesario.zona ?? ""}]: `,
	);
	const secao = await rl.question(
		`Seção eleitoral [${mesario.secao ?? ""}]: `,
	);

	try {
		const atualizado = await updateMesario.execute(id.trim(), {
			nome: nome === "" ? mesario.nome : nome,
			cpf: cpf === "" ? mesario.cpf : cpf,
			zona: zona === "" ? mesario.zona : zona,
			secao: secao === "" ? mesario.secao : secao,
		});

		console.log("\nMesário atualizado com sucesso!");
		console.log(`Nome: ${atualizado.nome}`);
		console.log(`CPF: ${atualizado.cpf}`);
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Não foi possível editar o mesário";

		console.log(`\nErro: ${message}`);
	}

	await pausar();
}

async function listarMesarios(): Promise<void> {
	console.log("\n--- LISTA DE MESÁRIOS ---\n");

	const mesarios = await listMesarios.execute();

	if (mesarios.length === 0) {
		console.log("Nenhum mesário cadastrado.");
		await pausar();
		return;
	}

	mostrarLista(mesarios);

	await pausar();
}

async function deletarMesario(): Promise<void> {
	console.log("\n--- DELETAR MESÁRIO ---\n");

	const mesarios = await listMesarios.execute();

	if (mesarios.length === 0) {
		console.log("Nenhum mesário cadastrado.");
		await pausar();
		return;
	}

	mostrarLista(mesarios);

	const id = await rl.question("\nDigite o ID do mesário: ");

	const mesario = await repository.findById(id.trim());

	if (!mesario) {
		console.log("\nMesário não encontrado.");
		await pausar();
		return;
	}

	console.log(`\nMesário selecionado: ${mesario.nome}`);

	const confirmacao = await rl.question(
		"Tem certeza que deseja deletar? (s/n): ",
	);

	if (confirmacao.toLowerCase() !== "s") {
		console.log("\nOperação cancelada.");
		await pausar();
		return;
	}

	try {
		await deleteMesario.execute(id.trim());

		console.log("\nMesário deletado com sucesso!");
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Não foi possível deletar o mesário";

		console.log(`\nErro: ${message}`);
	}

	await pausar();
}

function mostrarLista(
	mesarios: Array<{
		id: string;
		nome: string;
		cpf: string;
		zona?: string;
		secao?: string;
	}>,
): void {
	console.log("");

	for (const [index, mesario] of mesarios.entries()) {
		console.log("------------------------------------");
		console.log(`Mesário ${index + 1}`);
		console.log(`ID:    ${mesario.id}`);
		console.log(`Nome:  ${mesario.nome}`);
		console.log(`CPF:   ${mesario.cpf}`);
		console.log(`Zona:  ${mesario.zona ?? "-"}`);
		console.log(`Seção: ${mesario.secao ?? "-"}`);
	}

	console.log("------------------------------------");
}

async function pausar(): Promise<void> {
	await rl.question("\nPressione ENTER para continuar...");
}

async function iniciar(): Promise<void> {
	let executando = true;

	while (executando) {
		mostrarMenu();

		const opcao = await rl.question("Escolha uma opção: ");

		switch (opcao.trim()) {
			case "1":
				await criarMesario();
				break;

			case "2":
				await editarMesario();
				break;

			case "3":
				await listarMesarios();
				break;

			case "4":
				await deletarMesario();
				break;

			case "0":
				executando = false;
				break;

			default:
				console.log("\nOpção inválida.");
				await pausar();
		}
	}

	rl.close();

	console.log("\nSistema encerrado.");
}

iniciar().catch((error) => {
	console.error("Erro inesperado:", error);
	rl.close();
	process.exit(1);
});