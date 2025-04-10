-- Cria as tabelas necessárias para o projeto Freelancer Platform

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" SERIAL PRIMARY KEY,
    "Username" VARCHAR(50) NOT NULL,
    "Email" VARCHAR(100) NOT NULL,
    "Password" VARCHAR(100) NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UQ_Users_Username" UNIQUE ("Username"),
    CONSTRAINT "UQ_Users_Email" UNIQUE ("Email")
);

-- Tabela de Projetos
CREATE TABLE IF NOT EXISTS "Projects" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL,
    "Description" TEXT NOT NULL,
    "Budget" DECIMAL(18,2) NOT NULL,
    "Deadline" TIMESTAMP NOT NULL,
    "Status" VARCHAR(50) NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FK_Projects_Users" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    CONSTRAINT "CK_Project_Budget_Min" CHECK ("Budget" >= 100)
);

-- Cria índices para melhorar a performance
CREATE INDEX IF NOT EXISTS "IX_Projects_UserId" ON "Projects"("UserId");
CREATE INDEX IF NOT EXISTS "IX_Projects_Status" ON "Projects"("Status");
CREATE INDEX IF NOT EXISTS "IX_Projects_CreatedAt" ON "Projects"("CreatedAt" DESC);

-- Adiciona dados de teste - Usuários
INSERT INTO "Users" ("Username", "Email", "Password") 
VALUES ('admin', 'admin@example.com', 'admin123') 
ON CONFLICT ("Username") DO NOTHING;

INSERT INTO "Users" ("Username", "Email", "Password") 
VALUES ('user1', 'user1@example.com', 'user123') 
ON CONFLICT ("Username") DO NOTHING;

-- Adiciona dados de teste - Projetos
-- Projetos do admin
INSERT INTO "Projects" ("UserId", "Description", "Budget", "Deadline", "Status")
SELECT u."Id", 'Website para empresa de tecnologia', 2500.00, CURRENT_TIMESTAMP + INTERVAL '30 days', 'em andamento'
FROM "Users" u WHERE u."Username" = 'admin';

INSERT INTO "Projects" ("UserId", "Description", "Budget", "Deadline", "Status")
SELECT u."Id", 'Aplicativo móvel para delivery', 3500.00, CURRENT_TIMESTAMP + INTERVAL '60 days', 'em andamento'
FROM "Users" u WHERE u."Username" = 'admin';

-- Projetos do user1
INSERT INTO "Projects" ("UserId", "Description", "Budget", "Deadline", "Status")
SELECT u."Id", 'Redesenho de logo corporativa', 500.00, CURRENT_TIMESTAMP + INTERVAL '15 days', 'em andamento'
FROM "Users" u WHERE u."Username" = 'user1';

INSERT INTO "Projects" ("UserId", "Description", "Budget", "Deadline", "Status")
SELECT u."Id", 'Desenvolvimento de blog WordPress', 1200.00, CURRENT_TIMESTAMP + INTERVAL '20 days', 'finalizado'
FROM "Users" u WHERE u."Username" = 'user1'; 