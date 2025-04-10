# Funcionalidade de Oportunidades - Documentação

## Visão Geral

A funcionalidade de Oportunidades permite que usuários criem projetos públicos com vagas disponíveis para participação de outros freelancers. Esta funcionalidade amplia o sistema existente, permitindo colaboração e formação de equipes para projetos.

## Novas Entidades e Campos

### Entidade Project (Projeto)
- **IsPublic**: Flag booleana que determina se o projeto é visível publicamente.
- **MaxParticipants**: Número máximo de participantes permitidos no projeto.
- **HasVacancies**: Flag booleana que indica se o projeto ainda possui vagas disponíveis.

### Entidade ProjectParticipation (Participação em Projeto)
- Relaciona usuários a projetos, definindo quem participa de cada projeto.
- Inclui campos como `Role` (papel/função) e `JoinedAt` (data de ingresso).

## Endpoints da API

### Projetos Públicos
- **GET /api/Projects/public**: Lista todos os projetos públicos com vagas disponíveis.
- **GET /api/Projects/details/{projectId}**: Obtém detalhes de um projeto específico, com verificações de permissão baseadas na visibilidade do projeto.

### Participações em Projetos
- **GET /api/ProjectParticipations/user/{userId}**: Retorna todas as participações de um usuário específico.
- **GET /api/ProjectParticipations/project/{projectId}**: Retorna todos os participantes de um projeto específico.
- **POST /api/ProjectParticipations**: Adiciona um usuário como participante em um projeto.
- **DELETE /api/ProjectParticipations/project/{projectId}**: Remove a participação de um usuário em um projeto.
- **GET /api/ProjectParticipations/opportunities**: Retorna projetos públicos com vagas disponíveis.

## Fluxo de Dados

1. Um usuário cria um projeto e define se é público e quantos participantes são permitidos.
2. Se o projeto for público e tiver `MaxParticipants > 1`, ele será marcado com `HasVacancies = true`.
3. Outros usuários podem visualizar projetos públicos com vagas e solicitar participação.
4. Quando um usuário se junta a um projeto, o sistema verifica se ainda há vagas disponíveis.
5. O sistema atualiza a flag `HasVacancies` quando o número de participantes atinge o limite máximo.

## Implementação Técnica

### Serviços Backend
- **ProjectService**: Gerencia projetos, incluindo criação, atualização e verificação de vagas.
- **ProjectParticipationService**: Gerencia participações em projetos, incluindo adição e remoção de participantes.

### Modificações no Banco de Dados
- Novas colunas na tabela `Projects`: `IsPublic`, `MaxParticipants`, `HasVacancies`.
- Nova tabela `ProjectParticipations` para registrar participações.

### Ajustes de Nulabilidade
- Foram realizadas modificações nos métodos que utilizam navegação entre entidades para garantir a correta verificação de nulabilidade, usando o operador `!` para indicar que a coleção não será nula durante a execução da consulta.

## Considerações de Segurança
- Apenas o proprietário do projeto pode editá-lo ou excluí-lo.
- Projetos não públicos só são visíveis para seus proprietários e participantes.
- A API verifica permissões antes de permitir acesso a detalhes de projetos não públicos.

## Próximos Passos
- Implementação da interface de usuário para visualização e participação em projetos públicos.
- Adição de funcionalidade de convite direto para projetos não públicos.
- Sistema de notificações para novas participações em projetos. 