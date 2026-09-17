require("dotenv/config");
const { spawnSync } = require("node:child_process");
const { PrismaClient } = require("@prisma/client");

const initialMigration = "20260917000000_init";

function prismaCli(args) {
	const result = spawnSync("prisma", args, { stdio: "inherit", env: process.env });
	if (result.error) throw result.error;
	return result.status;
}

async function main() {
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL é obrigatória");
	}

	const prisma = new PrismaClient();
	let hasMesarios;
	let hasMigrationHistory;
	try {
		const [state] = await prisma.$queryRaw`
			SELECT to_regclass('mesarios') IS NOT NULL AS "hasMesarios",
			       to_regclass('_prisma_migrations') IS NOT NULL AS "hasMigrationHistory"
		`;
		hasMesarios = state.hasMesarios;
		hasMigrationHistory = state.hasMigrationHistory;
	} finally {
		await prisma.$disconnect();
	}

	if (hasMesarios && !hasMigrationHistory) {
		const status = prismaCli([
			"migrate", "diff", "--from-url", process.env.DATABASE_URL,
			"--to-schema-datamodel", "prisma/schema.prisma", "--exit-code",
		]);
		if (status !== 0) {
			throw new Error("O esquema existente difere do modelo Prisma; migração automática interrompida");
		}
		if (prismaCli(["migrate", "resolve", "--applied", initialMigration]) !== 0) {
			throw new Error("Não foi possível registrar a migração inicial existente");
		}
	}

	if (prismaCli(["migrate", "deploy"]) !== 0) {
		throw new Error("Falha ao aplicar as migrações Prisma");
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
