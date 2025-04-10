-- Script otimizado para inicialização rápida
-- Criar tabela Users
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" SERIAL PRIMARY KEY,
    "Username" VARCHAR(50) NOT NULL,
    "Email" VARCHAR(100) NOT NULL,
    "Password" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices importantes apenas
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_Username" ON "Users" ("Username");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_Email" ON "Users" ("Email");

-- Criar tabela Projects
CREATE TABLE IF NOT EXISTS "Projects" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL,
    "Description" TEXT NOT NULL,
    "Budget" DECIMAL(18,2) NOT NULL,
    "Deadline" TIMESTAMP WITH TIME ZONE NOT NULL,
    "Status" VARCHAR(50) NOT NULL,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_Projects_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE,
    CONSTRAINT "CK_Project_Budget_Min" CHECK ("Budget" >= 100)
);

-- Índice principal apenas
CREATE INDEX IF NOT EXISTS "IX_Projects_UserId" ON "Projects" ("UserId");

-- Criar tabela __EFMigrationsHistory
CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" VARCHAR(150) NOT NULL,
    "ProductVersion" VARCHAR(32) NOT NULL,
    PRIMARY KEY ("MigrationId")
);

-- Inserir a migração
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250409233334_InitialCreate', '9.0.4')
ON CONFLICT DO NOTHING;

-- Dados iniciais - usuários
INSERT INTO "Users" ("Username", "Email", "Password", "CreatedAt")
VALUES 
('admin', 'admin@example.com', 'admin123', NOW()),
('user1', 'user1@example.com', 'user123', NOW())
ON CONFLICT ("Username") DO NOTHING;

-- Dados iniciais - projetos com deadlines
INSERT INTO "Projects" ("UserId", "Description", "Budget", "Deadline", "Status", "CreatedAt")
SELECT u."Id", 'Projeto Website E-commerce', 1500.00, NOW() + INTERVAL '30 days', 'em andamento', NOW()
FROM "Users" u WHERE u."Username" = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO "Projects" ("UserId", "Description", "Budget", "Deadline", "Status", "CreatedAt")
SELECT u."Id", 'Aplicativo Mobile', 2500.00, NOW() + INTERVAL '45 days', 'em andamento', NOW()
FROM "Users" u WHERE u."Username" = 'user1'
ON CONFLICT DO NOTHING;

INSERT INTO "Projects" ("UserId", "Description", "Budget", "Deadline", "Status", "CreatedAt")
SELECT u."Id", 'Manutenção de Servidor', 800.00, NOW() + INTERVAL '15 days', 'em andamento', NOW()
FROM "Users" u WHERE u."Username" = 'admin'
ON CONFLICT DO NOTHING; 