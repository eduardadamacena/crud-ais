# API de mesários

API HTTP em TypeScript para cadastrar e atualizar mesários. Os dados são armazenados em PostgreSQL com Prisma ORM.

## Executar localmente

1. Execute `cp .env.example .env` e defina a mesma senha em `POSTGRES_PASSWORD` e `DATABASE_URL`.
2. Execute `npm ci` e `docker compose up -d --wait postgres`.
3. Execute `npm run db:migrate` e depois `npm run dev`.

`DATABASE_URL` configura o Prisma; as variáveis `POSTGRES_*` configuram o contêiner. Se a senha contiver caracteres especiais, codifique-os na URL. O volume `postgres_data` preserva os dados entre reinicializações. `npm run db:migrate` aplica as migrações Prisma e pode ser executado novamente. Ao encontrar a tabela da implementação anterior, o comando verifica que ela corresponde ao modelo e registra a migração inicial sem apagar dados.

## Rotas

`POST /mesarios` recebe `nome` e `cpf` obrigatórios, além de `zona` e `secao` opcionais. Responde `201` com `id` e `createdAt`.

`PATCH /mesarios/:id` recebe ao menos um dos campos `nome`, `cpf`, `zona` ou `secao`. Campos omitidos não mudam; `null` remove `zona` ou `secao`. Responde `200` com o cadastro atualizado, `400` para dados inválidos e `404` se o ID não existir. Nenhuma das rotas exige autenticação.

Para executar os testes de integração, inicie o PostgreSQL, execute a migração e rode `npm test`.

## Implantação na EC2

Configure `/var/www/my-app/.env` com `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` e `DATABASE_URL` apontando para o PostgreSQL local. A instância precisa ter Docker Compose e permissão para executá-lo, além do processo PM2 `my-app` já configurado. O workflow gera o Prisma Client, inicia o banco, executa a migração e reinicia a API nessa ordem. Os segredos `EC2_HOST`, `EC2_USER` e `EC2_SSH_KEY` pertencem às configurações do repositório no GitHub.
