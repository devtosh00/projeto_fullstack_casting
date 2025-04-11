-- Adiciona as colunas para funcionalidade de oportunidades se elas ainda não existirem
ALTER TABLE IF EXISTS "Projects" 
    ADD COLUMN IF NOT EXISTS "IsPublic" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "MaxParticipants" INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS "HasVacancies" BOOLEAN NOT NULL DEFAULT false;

-- Cria a tabela de participações em projetos se ela não existir
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

-- Cria índices para as novas colunas e tabela
CREATE INDEX IF NOT EXISTS "IX_Projects_IsPublic" ON "Projects"("IsPublic");
CREATE INDEX IF NOT EXISTS "IX_Projects_HasVacancies" ON "Projects"("HasVacancies");
CREATE INDEX IF NOT EXISTS "IX_Projects_IsPublic_HasVacancies" ON "Projects"("IsPublic", "HasVacancies");
CREATE INDEX IF NOT EXISTS "IX_ProjectParticipations_ProjectId" ON "ProjectParticipations"("ProjectId");
CREATE INDEX IF NOT EXISTS "IX_ProjectParticipations_UserId" ON "ProjectParticipations"("UserId");

-- Adiciona a migração de oportunidades ao histórico do EF Core
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250410000001_AddOpportunitiesFeature', '9.0.4')
ON CONFLICT ("MigrationId") DO NOTHING; 