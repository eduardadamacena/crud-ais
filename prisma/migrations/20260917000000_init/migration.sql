CREATE TABLE IF NOT EXISTS "mesarios" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "zona" TEXT,
    "secao" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "mesarios_pkey" PRIMARY KEY ("id")
);
