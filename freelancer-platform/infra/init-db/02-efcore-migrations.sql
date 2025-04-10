-- Cria a tabela de histórico de migrações do Entity Framework Core
CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" VARCHAR(150) NOT NULL,
    "ProductVersion" VARCHAR(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

-- Adiciona a migração inicial
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250409000001_InitialCreate', '9.0.4')
ON CONFLICT ("MigrationId") DO NOTHING; 