Prompt de Engenharia para Desenvolvimento Full-Stack (Nível Especialista)
Domínio: Plataforma Freelancer
Tecnologias: Angular, .NET (C#), PostgreSQL, Docker
Objetivo Final: Criar um sistema simples, rápido e funcional para gestão de usuários e projetos, com validação inicial do backend antes do desenvolvimento do frontend.

Fase 0: Pré-requisitos & Setup Inicial
Instruções Gerais:
Ambiente de Desenvolvimento:

Node.js v20+ (para o Frontend)

.NET SDK 8.0+ (para o Backend)

PostgreSQL 15+ (Banco de Dados)

Docker Desktop (Containerização)

Estrutura de Diretórios Base:

plaintext
Copy
Edit
freelancer-platform/
├── frontend/                # Aplicação Angular
│   ├── src/app/
│   │   ├── core/           # Auth, Interceptors, Guards
│   │   ├── features/       # Módulos: usuários, projetos
│   │   └── shared/         # Componentes UI e Directives reutilizáveis
│   ├── assets/             # Styles, Imagens
│   └── environments/       # Configurações de ambiente
├── backend/                # API .NET
│   ├── Application/        # DTOs, Services, Interfaces
│   ├── Domain/             # Entidades, Enums
│   ├── Infrastructure/     # DbContext, Migrations, Repositórios
│   └── WebAPI/             # Controllers, Middlewares, Configuração do Swagger
├── database/               # Scripts/Migrações do PostgreSQL
│   ├── migrations/         # EF Core ou script SQL
│   └── seeds/              # Dados iniciais (se necessário)
└── infra/                  # Docker Compose e scripts de infraestrutura
Fase 1: Desenvolvimento do Backend (.NET)
Objetivos:
Desenvolver uma API REST simples e funcional em .NET.

Implementar endpoints para autenticação (simplificada) e gerenciamento de projetos.

Validar o backend antes de iniciar o desenvolvimento do frontend.

Requisitos dos Endpoints:
Autenticação:
Registro de Usuário:
Endpoint: POST /register
Request Body:

json
Copy
Edit
{
  "username": "string",
  "email": "string",
  "password": "string"
}
Ação: Criar usuário, evitando duplicidade em username e email.
Observação: Mantenha a autenticação simples.

Login:
Endpoint: POST /login
Request Body:

json
Copy
Edit
{
  "username": "string",
  "password": "string"
}
Ação: Validar credenciais e retornar um token simples (pode ser um JWT básico).

Gerenciamento de Projetos:
Criar Projeto:
Endpoint: POST /projects
Request Body:

json
Copy
Edit
{
  "userId": "int",
  "description": "string",
  "budget": "float",
  "deadline": "datetime",  // Data de entrega do projeto
  "status": "string"       // Valores: "em andamento", "finalizado"
}
Ação: Permitir que usuário autenticado crie um projeto.
Observação: O usuário deve estar autenticado para criar um projeto.

Excluir Projeto:
Endpoint: DELETE /projects/{projectId}
Ação: Permitir que o usuário exclua apenas os seus próprios projetos.

Listar Projetos do Usuário:
Endpoint: GET /projects/{userId}
Ação: Retornar todos os projetos vinculados ao usuário.

Considerações Adicionais:
Validação Inicial do Backend:
Desenvolva um método ou utilize uma ferramenta (como Postman ou um script de testes simples) para testar as respostas dos endpoints do backend. Essa etapa é fundamental para garantir que a API esteja funcionando conforme esperado antes de avançar para o frontend.

Documentação via Swagger:
Configure o Swagger/OpenAPI para documentar todos os endpoints automaticamente. Inclua exemplos de payloads, tipos de retorno e códigos de status. O Swagger deverá ficar disponível na rota /swagger.

Simples Autenticação:
Mantenha a lógica de autenticação o mais simples possível, priorizando a funcionalidade de login e registro sem complexidades adicionais.

Atenção à Funcionalidade:
Certifique-se que o backend está funcional e testado (via métodos manuais ou scripts) antes de iniciar o desenvolvimento do frontend. Essa validação é essencial para que o frontend seja desenvolvido com base em uma API consistente.

Fase 2: Modelagem de Dados (PostgreSQL)
Requisitos do Banco de Dados:
Utilizar Docker Compose para iniciar o PostgreSQL.

Criar as tabelas necessárias:

Users:

id (PK, autoincrement ou UUID)

username (único, not null)

email (único, not null)

password

created_at (timestamp, default now())

Projects:

id (PK)

userId (FK para Users)

description (not null)

budget (float ou decimal; orçamento mínimo de 100)

deadline (timestamp)

status (string: "em andamento" ou "finalizado")

created_at (timestamp, default now())

Constraints:

Restringir duplicidade de usuário pelo campo username e email.

Certificar que um usuário só possa criar projetos com o mesmo nome se a regra de negócio permitir (pode ser simples, não forçando unicidade por agora).

Fase 3: Desenvolvimento do Frontend (Angular)
Objetivos:
Desenvolver uma aplicação Angular funcional que consuma a API testada.

Implementar os seguintes componentes/telas:

Login/Registro: Utilizando formulários reativos simples.

Dashboard: Tela para exibição dos projetos do usuário autenticado.

Criação/Exclusão de Projetos: Tela para criação de novo projeto com os campos: descrição, budget, deadline e status; e opção para excluir projetos.

Pontos Importantes:
Conectar o frontend aos endpoints do backend, utilizando o token de autenticação retornado no login.

Garantir que o design seja simples e funcional, evitando complexidade desnecessária.

Fase 4: Testes Automatizados (Última Etapa)
Requisitos:
Após a implementação completa e validação das funcionalidades:

Crie testes unitários e de integração para os endpoints do backend (utilizando xUnit + Moq, por exemplo).

Implemente testes end-to-end para o frontend (utilizando Jasmine, Karma ou Cypress).

Certifique-se de validar os casos de sucesso e os edge cases (por exemplo, tentativa de exclusão de projeto de outro usuário).

Observação:
Os testes serão elaborados somente após confirmar que todas as funcionalidades básicas estão operacionais e o backend validado. Priorize entregar o fluxo funcional primeiro.

Considerações Finais e Instruções para a IA Desenvolvedora
Setup Inicial:

Configure o ambiente conforme os pré-requisitos.

Crie a estrutura de diretórios e inicie o repositório conforme descrito.

Backend:

Desenvolva a API REST com os endpoints simplificados para registro, login, criação, listagem e exclusão de projetos.

Configure o Swagger para documentar os endpoints.

Teste os endpoints utilizando um método simples (Postman ou script) para garantir que as respostas estejam corretas.

Banco de Dados:

Crie a modelagem de dados utilizando PostgreSQL com Docker Compose.

Garanta que as tabelas Users e Projects estejam configuradas corretamente com os campos e constraints necessários.

Frontend:

Desenvolva a aplicação Angular com formulários para login/registro e telas para gerenciamento de projetos.

Integre a comunicação com a API utilizando o token retornado no login.

Testes:

Planeje a escrita dos testes automatizados como a última etapa, após a validação completa de todas as funcionalidades.

Entrega:

Organize o código em um repositório GitHub com documentação clara (README, instruções para Docker, Swagger e endpoints).

Garanta que o fluxo de autenticação e criação/exclusão de projetos funcione conforme esperado.