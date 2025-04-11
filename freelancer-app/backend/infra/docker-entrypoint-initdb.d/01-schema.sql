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
    "IsPublic" BOOLEAN NOT NULL DEFAULT false,
    "MaxParticipants" INTEGER NOT NULL DEFAULT 1,
    "HasVacancies" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "FK_Projects_Users" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    CONSTRAINT "CK_Project_Budget_Min" CHECK ("Budget" >= 100)
);

-- Tabela de Participações em Projetos
CREATE TABLE IF NOT EXISTS "ProjectParticipations" (
    "Id" SERIAL PRIMARY KEY,
    "ProjectId" INTEGER NOT NULL,
    "UserId" INTEGER NOT NULL,
    "Role" VARCHAR(50) NOT NULL DEFAULT 'participant',
    "JoinedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FK_ProjectParticipations_Projects" FOREIGN KEY ("ProjectId") REFERENCES "Projects"("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_ProjectParticipations_Users" FOREIGN KEY ("UserId") REFERENCES "Users"("Id"),
    CONSTRAINT "UQ_ProjectParticipations_ProjectId_UserId" UNIQUE ("ProjectId", "UserId")
);

-- Cria índices para melhorar a performance
CREATE INDEX IF NOT EXISTS "IX_Projects_UserId" ON "Projects"("UserId");
CREATE INDEX IF NOT EXISTS "IX_Projects_Status" ON "Projects"("Status");
CREATE INDEX IF NOT EXISTS "IX_Projects_CreatedAt" ON "Projects"("CreatedAt" DESC);
CREATE INDEX IF NOT EXISTS "IX_Projects_IsPublic" ON "Projects"("IsPublic");
CREATE INDEX IF NOT EXISTS "IX_Projects_HasVacancies" ON "Projects"("HasVacancies");
CREATE INDEX IF NOT EXISTS "IX_Projects_IsPublic_HasVacancies" ON "Projects"("IsPublic", "HasVacancies");
CREATE INDEX IF NOT EXISTS "IX_ProjectParticipations_ProjectId" ON "ProjectParticipations"("ProjectId");
CREATE INDEX IF NOT EXISTS "IX_ProjectParticipations_UserId" ON "ProjectParticipations"("UserId");

-- Adiciona dados de teste - Usuários
INSERT INTO "Users" ("Username", "Email", "Password") 
VALUES ('admin', 'admin@example.com', 'admin123') 
ON CONFLICT ("Username") DO NOTHING;

INSERT INTO "Users" ("Username", "Email", "Password") 
VALUES ('user1', 'user1@example.com', 'user123') 
ON CONFLICT ("Username") DO NOTHING;

-- Adiciona dados de teste - Projetos
-- Projetos do admin
INSERT INTO "Projects" ("UserId", "Description", "Budget", "Deadline", "Status", "IsPublic", "MaxParticipants", "HasVacancies")
SELECT u."Id", 'Website para empresa de tecnologia', 2500.00, CURRENT_TIMESTAMP + INTERVAL '30 days', 'em andamento', true, 3, true
FROM "Users" u WHERE u."Username" = 'admin';

INSERT INTO "Projects" ("UserId", "Description", "Budget", "Deadline", "Status", "IsPublic", "MaxParticipants", "HasVacancies")
SELECT u."Id", 'Aplicativo móvel para delivery', 3500.00, CURRENT_TIMESTAMP + INTERVAL '60 days', 'em andamento', true, 2, true
FROM "Users" u WHERE u."Username" = 'admin';

-- Projetos do user1
INSERT INTO "Projects" ("UserId", "Description", "Budget", "Deadline", "Status", "IsPublic", "MaxParticipants", "HasVacancies")
SELECT u."Id", 'Redesenho de logo corporativa', 500.00, CURRENT_TIMESTAMP + INTERVAL '15 days', 'em andamento', false, 1, false
FROM "Users" u WHERE u."Username" = 'user1';

INSERT INTO "Projects" ("UserId", "Description", "Budget", "Deadline", "Status", "IsPublic", "MaxParticipants", "HasVacancies")
SELECT u."Id", 'Desenvolvimento de blog WordPress', 1200.00, CURRENT_TIMESTAMP + INTERVAL '20 days', 'finalizado', false, 1, false
FROM "Users" u WHERE u."Username" = 'user1'; 