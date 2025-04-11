# Plataforma Freelancer

## Visão Geral

A Plataforma Freelancer é um sistema completo para gerenciamento de projetos freelance que permite aos usuários criar projetos, gerenciar equipes e participar de oportunidades disponíveis no mercado. O sistema foi desenvolvido com uma arquitetura moderna que separa claramente o backend e frontend, facilitando a manutenção e escalabilidade.

## Índice

- [Arquitetura](#arquitetura)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Execução do Projeto](#execução-do-projeto)
- [API](#api)
- [Frontend](#frontend)
- [Banco de Dados](#banco-de-dados)
- [Segurança](#segurança)
- [Resolução de Problemas](#resolução-de-problemas)

## Arquitetura

A plataforma utiliza uma arquitetura de microsserviços com três componentes principais:

1. **Backend**: API REST em .NET Core 9 organizada segundo os princípios de Clean Architecture
2. **Frontend**: Single Page Application (SPA) em Angular 17 com design responsivo
3. **Banco de Dados**: PostgreSQL para armazenamento de dados relacionais

A aplicação é totalmente containerizada com Docker, permitindo fácil deployment e ambientes consistentes.

### Clean Architecture no Backend

O backend segue rigorosamente os princípios de Clean Architecture, organizando o código em camadas concêntricas:

1. **Domain Layer** (Core)
   - Entidades de domínio
   - Regras de negócio
   - Interfaces de repositórios
   - Independente de frameworks e tecnologias externas

2. **Application Layer**
   - Use Cases e regras de aplicação
   - DTOs (Data Transfer Objects)
   - Mapeamentos entre entidades e DTOs
   - Implementação de serviços
   - Validações de input

3. **Infrastructure Layer**
   - Implementações de repositórios
   - Acesso a banco de dados via Entity Framework
   - Serviços externos
   - Logging e telemetria

4. **Web API Layer**
   - Controllers e endpoints REST
   - Filtros de autenticação e autorização
   - Configuração de rotas
   - Swagger e documentação

Este modelo garante:
- **Baixo acoplamento**: Mudanças em camadas externas não afetam as internas
- **Testabilidade**: Facilidade na criação de testes unitários e de integração
- **Manutenção**: Código organizado e com responsabilidades bem definidas
- **Escalabilidade**: Facilidade para estender funcionalidades

### Arquitetura Frontend (Angular)

O frontend é estruturado utilizando a arquitetura de componentes do Angular:

1. **Core Module**
   - Serviços singleton (AuthService, LoggingService)
   - Guards de autenticação
   - Interceptors HTTP
   - Modelos de dados globais

2. **Shared Module**
   - Componentes reutilizáveis
   - Diretivas compartilhadas
   - Pipes personalizados
   - Serviços utilitários

3. **Feature Modules**
   - Funcionalidades específicas (Projetos, Perfil, etc.)
   - Componentes de feature
   - Serviços específicos de feature
   - Rotas lazy-loaded

4. **State Management**
   - Gerenciamento de estado com NgRx
   - Actions, Reducers, Selectors
   - Effects para operações assíncronas
   - Store para armazenamento central de estado

### Comunicação entre Camadas

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Angular SPA    │◀───────▶│  .NET API       │◀───────▶│  PostgreSQL     │
│  (Frontend)     │    REST │  (Backend)      │    EF   │  (Database)     │
│                 │    API  │                 │   Core  │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
       ▲                           ▲                           ▲
       │                           │                           │
       │                           │                           │
       └───────────────────────────┼───────────────────────────┘
                                   │
                            ┌─────────────────┐
                            │                 │
                            │  Docker        │
                            │  Containers     │
                            │                 │
                            └─────────────────┘
```

### Fluxo de Dados

1. Cliente faz requisição HTTP ao servidor
2. O Controller na API recebe a requisição e valida a autenticação
3. O Controller encaminha a requisição para o respectivo Application Service
4. O Application Service executa a lógica de negócio usando entidades de domínio
5. Repositórios da Infrastructure Layer acessam o banco de dados
6. A resposta percorre o caminho inverso até o cliente

## Funcionalidades

### Gerenciamento de Usuários
- Registro e autenticação de usuários
- Perfis de usuário com histórico de projetos

### Gerenciamento de Projetos
- Criação, edição e exclusão de projetos
- Definição de orçamento e prazos
- Configuração de projetos públicos ou privados
- Controle de vagas disponíveis

### Participação em Projetos
- Participação em projetos públicos
- Gerenciamento de equipes
- Atribuição de funções aos participantes

### Oportunidades
- Listagem de projetos públicos com vagas disponíveis
- Filtros para busca de oportunidades
- Interface intuitiva para solicitação de participação

## Tecnologias

### Backend

#### Framework e Plataforma
- **.NET Core 9**: Framework multiplataforma de alto desempenho para desenvolvimento de aplicações
  - **ASP.NET Core MVC**: Framework para desenvolvimento de APIs e aplicações web
  - **Kestrel**: Servidor web de alta performance integrado
  - **Dependency Injection**: Container de injeção de dependências nativo

#### Persistência de Dados
- **Entity Framework Core**: ORM (Object-Relational Mapper) para acesso a dados
  - **Code-First Approach**: Definição de modelo de dados através de classes C#
  - **Migrations**: Gerenciamento automatizado de alterações no esquema do banco de dados
  - **LINQ Provider**: Language Integrated Query para consultas tipadas

#### Segurança e Autenticação
- **JWT Authentication**: Implementação de autenticação baseada em tokens JSON Web Token
  - **Token Generation**: Geração de tokens de acesso
  - **Token Validation**: Validação de tokens nas requisições
  - **Claims-based Authorization**: Autorização baseada em claims

#### Documentação
- **Swagger/OpenAPI**: Documentação automática da API
  - **Swagger UI**: Interface interativa para teste de endpoints
  - **OpenAPI Specification**: Geração de especificação OpenAPI 3.0

#### Validação e Mapeamento
- **AutoMapper**: Biblioteca para mapeamento entre entidades e DTOs
- **FluentValidation**: Biblioteca para validação de entrada de dados

#### Logging
- **NLog**: Biblioteca para logging de eventos da aplicação

#### Design Patterns
- **Clean Architecture**: Organização do código em camadas bem definidas
- **Repository Pattern**: Abstração do acesso a dados
- **Dependency Injection**: Injeção de dependências para baixo acoplamento

### Frontend

#### Framework Core
- **Angular 17+**: Framework para desenvolvimento de aplicações web
  - **Component Architecture**: Arquitetura baseada em componentes
  - **TypeScript**: Linguagem tipada baseada em JavaScript
  - **Dependency Injection**: Sistema de injeção de dependências
  - **Angular CLI**: Ferramentas de linha de comando para scaffolding e build

#### UI/UX
- **Angular Material**: Biblioteca de componentes UI baseada no Material Design
  - **Material Components**: Botões, cards, dialogs, inputs, etc.
- **TailwindCSS**: Framework CSS utilitário para estilização
  - **Utility-first**: Abordagem de classes utilitárias
  - **Responsive Design**: Sistema de grid responsivo

#### HTTP e Comunicação
- **HttpClient**: Módulo Angular para requisições HTTP
  - **Interceptors**: Interceptação de requisições para adicionar tokens JWT
- **RxJS**: Biblioteca para programação reativa
  - **Observables**: Padrão de fluxo de dados assíncronos
  - **Operators**: Operadores para transformação de dados

#### Formulários
- **Angular Forms**: Sistema de formulários do Angular
  - **Reactive Forms**: Formulários reativos baseados em código
  - **Validators**: Validadores para entrada de dados

#### Roteamento
- **Angular Router**: Sistema de roteamento e navegação
  - **Route Guards**: Proteção de rotas baseada em autenticação

### Infraestrutura

#### Containerização
- **Docker**: Plataforma para desenvolvimento, envio e execução de aplicações em containers
- **Docker Compose**: Ferramenta para definição e execução de aplicações multi-container
  - **Service Definition**: Definição declarativa de serviços
  - **Environment Variables**: Gerenciamento de variáveis de ambiente

#### Banco de Dados
- **PostgreSQL**: Sistema de gerenciamento de banco de dados relacional
- **Entity Framework Migrations**: Gerenciamento de esquema de banco de dados

#### Servidor Web
- **Nginx**: Servidor web para o frontend
  - **Static File Serving**: Servir arquivos estáticos
  - **Reverse Proxy**: Proxy reverso para a API

## Estrutura do Projeto

```
freelancer-app/
├── backend/             # API em .NET Core 9
│   ├── Application/     # Lógica de negócios, DTOs e serviços
│   ├── Contracts/       # Interfaces e contratos
│   ├── Domain/          # Entidades e regras de domínio
│   ├── Infrastructure/  # Implementações de persistência
│   ├── WebAPI/          # Endpoints e configuração da API
│   └── infra/           # Arquivos de infraestrutura (Docker, DB)
├── frontend/            # Aplicação Angular
│   ├── src/app/
│   │   ├── core/        # Serviços essenciais e autenticação
│   │   ├── features/    # Módulos de funcionalidades
│   │   └── shared/      # Componentes e serviços compartilhados
├── docker-compose.yml   # Configuração Docker para todo o sistema
```

## Execução do Projeto

### Pré-requisitos
- Docker e Docker Compose instalados
- Git para clonar o repositório

### Clone do Repositório

Para obter uma cópia local do projeto, siga estas etapas:

1. **Abra o terminal** em seu sistema operacional
   
2. **Clone o repositório oficial**:
   ```bash
   git clone https://github.com/devtosh00/projeto_fullstack_casting.git
   ```

3. **Acesse o diretório do projeto**:
   ```bash
   cd projeto_fullstack_casting/freelancer-app
   ```

4. **Verifique as branches disponíveis (opcional)**:
   ```bash
   git branch -a
   ```
   
   O projeto possui duas branches principais:
   - `main`: Branch principal com a versão estável
   - `official`: Branch com as versões oficialmente liberadas

5. **Mude para a branch desejada (opcional)**:
   ```bash
   git checkout official
   ```

### Instalação com Docker (Recomendado)

1. **Garanta que o Docker está em execução**:
   - Windows: Verifique o Docker Desktop no menu de notificações
   - Linux: Execute `systemctl status docker`
   - macOS: Verifique o Docker Desktop no menu de status

2. **Inicie os contêineres**:
   ```bash
   docker-compose up -d
   ```

3. **Verifique se os contêineres estão em execução**:
   ```bash
   docker-compose ps
   ```

4. **Aguarde a inicialização completa** (geralmente 1-2 minutos)

5. **Acesse a aplicação**:
   - Frontend: http://localhost:4200
   - API/Swagger: http://localhost:5164/swagger

O Docker Compose iniciará automaticamente:
- PostgreSQL na porta 5432
- Backend .NET Core na porta 5164
- Frontend Angular na porta 4200

### Instalação para Desenvolvimento

#### Backend:
```bash
cd freelancer-app/backend
dotnet restore
dotnet run --project WebAPI
```

#### Frontend:
```bash
cd freelancer-app/frontend
npm install
ng serve
```

## API

A API segue os princípios REST e fornece endpoints para todas as funcionalidades do sistema.

### Documentação da API

A documentação completa da API está disponível através do Swagger UI, que pode ser acessado em:
```
http://localhost:5164/swagger
```

O Swagger UI oferece as seguintes funcionalidades:
- **Exploração interativa**: Teste os endpoints diretamente pelo navegador
- **Documentação detalhada**: Descrição de todos os parâmetros e respostas
- **Modelos de requisição**: Exemplos para cada endpoint
- **Autenticação**: Teste endpoints protegidos com token JWT

### Formatos de Dados

A API opera com JSON como formato principal para requisição e resposta:

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### Endpoints Principais

#### Autenticação
- `POST /api/Auth/register` - Registrar novo usuário
  - **Request Body**: `{ "username": "string", "email": "string", "password": "string" }`
  - **Response**: `{ "id": 0, "username": "string", "email": "string", "token": "string" }`

- `POST /api/Auth/login` - Autenticar usuário e obter token JWT
  - **Request Body**: `{ "email": "string", "password": "string" }`
  - **Response**: `{ "id": 0, "username": "string", "email": "string", "token": "string" }`

#### Projetos
- `GET /api/Projects` - Listar todos os projetos
  - **Response**: `[{ "id": 0, "userId": 0, "description": "string", ... }]`

- `GET /api/Projects/user/{userId}` - Listar projetos do usuário
  - **Path Params**: `userId` (inteiro)
  - **Response**: `[{ "id": 0, "userId": 0, "description": "string", ... }]`

- `GET /api/Projects/details/{projectId}` - Obter detalhes de um projeto
  - **Path Params**: `projectId` (inteiro)
  - **Response**: `{ "id": 0, "userId": 0, "description": "string", ... }`

- `POST /api/Projects` - Criar novo projeto
  - **Request Body**: `{ "userId": 0, "description": "string", "budget": 0, ... }`
  - **Response**: `{ "id": 0, "userId": 0, "description": "string", ... }`

- `PUT /api/Projects/{projectId}` - Atualizar projeto existente
  - **Path Params**: `projectId` (inteiro)
  - **Request Body**: `{ "userId": 0, "description": "string", "budget": 0, ... }`
  - **Response**: Status 204 (No Content)

- `DELETE /api/Projects/{projectId}` - Remover projeto
  - **Path Params**: `projectId` (inteiro)
  - **Response**: Status 204 (No Content)

- `GET /api/Projects/public` - Listar projetos públicos
  - **Response**: `[{ "id": 0, "userId": 0, "description": "string", ... }]`

#### Participações
- `GET /api/ProjectParticipations/user/{userId}` - Listar participações do usuário
  - **Path Params**: `userId` (inteiro)
  - **Response**: `[{ "id": 0, "projectId": 0, "userId": 0, "role": "string", ... }]`

- `GET /api/ProjectParticipations/project/{projectId}` - Listar participantes do projeto
  - **Path Params**: `projectId` (inteiro)
  - **Response**: `[{ "id": 0, "projectId": 0, "userId": 0, "role": "string", ... }]`

- `POST /api/ProjectParticipations` - Solicitar participação em projeto
  - **Request Body**: `{ "projectId": 0, "userId": 0 }`
  - **Response**: `{ "id": 0, "projectId": 0, "userId": 0, "role": "string", ... }`

- `DELETE /api/ProjectParticipations/project/{projectId}` - Cancelar participação
  - **Path Params**: `projectId` (inteiro)
  - **Response**: Status 204 (No Content)

- `GET /api/ProjectParticipations/public/{projectId}` - Listar participantes de projeto público
  - **Path Params**: `projectId` (inteiro)
  - **Response**: `[{ "id": 0, "projectId": 0, "userId": 0, "role": "string", ... }]`

### Códigos de Status HTTP

A API utiliza os seguintes códigos de status:

- **200 OK**: Requisição bem sucedida
- **201 Created**: Recurso criado com sucesso
- **204 No Content**: Operação concluída sem conteúdo de retorno
- **400 Bad Request**: Erro de validação ou dados inválidos
- **401 Unauthorized**: Autenticação necessária
- **403 Forbidden**: Sem permissão para acessar o recurso
- **404 Not Found**: Recurso não encontrado
- **500 Internal Server Error**: Erro no servidor

### Autenticação API

A API utiliza autenticação JWT (JSON Web Token):
1. O cliente obtém um token através do endpoint de login
2. O token deve ser incluído no cabeçalho de todas as requisições subsequentes:
   ```
   Authorization: Bearer {seu-token-jwt}
   ```
3. Tokens expiram após um período configurável (padrão: 1 hora)

## Frontend

A interface do usuário é construída com Angular, proporcionando uma experiência moderna e responsiva.

### Principais Telas

- **Login/Registro**: Formulários de autenticação
- **Dashboard**: Visão geral dos projetos e participações do usuário
- **Gerenciador de Projetos**: Interface para criar e gerenciar projetos
- **Marketplace de Oportunidades**: Listagem de projetos públicos disponíveis
- **Participações**: Gerenciamento de participações nos projetos

### Fluxo do Usuário

1. Usuário se registra na plataforma ou faz login
2. No dashboard, ele pode visualizar seus projetos ou oportunidades
3. Pode criar um novo projeto através do formulário dedicado
4. Pode definir o projeto como público ou privado e configurar vagas
5. Outros usuários podem visualizar projetos públicos e solicitar participação
6. O criador do projeto pode gerenciar as participações

## Banco de Dados

O sistema utiliza PostgreSQL como banco de dados relacional.

### Modelo de Dados

#### Principais Entidades:

1. **User**
   - Armazena informações de usuários (nome, email, senha hasheada)
   - Gerencia relacionamentos com projetos e participações

2. **Project**
   - Contém detalhes dos projetos (título, descrição, orçamento)
   - Flags de configuração (público/privado, número máximo de participantes)
   - Status do projeto (Em planejamento, Em andamento, Concluído)

3. **ProjectParticipation**
   - Registra participações de usuários em projetos
   - Mantém informações sobre papel/função no projeto
   - Armazena data de entrada no projeto

### Esquema Simplificado
```
User (1) --< Project (1) --< ProjectParticipation >-- (N) User
```

### Detalhes das Tabelas

#### User
| Campo     | Tipo      | Descrição                         |
|-----------|-----------|-----------------------------------|
| Id        | INT       | Chave primária                    |
| Username  | VARCHAR   | Nome de usuário                   |
| Email     | VARCHAR   | Email para contato e login        |
| Password  | VARCHAR   | Senha hasheada                    |
| CreatedAt | TIMESTAMP | Data de criação da conta          |

#### Project
| Campo           | Tipo      | Descrição                         |
|-----------------|-----------|-----------------------------------|
| Id              | INT       | Chave primária                    |
| UserId          | INT       | ID do criador (FK para User)      |
| Description     | TEXT      | Descrição do projeto              |
| Budget          | DECIMAL   | Orçamento do projeto              |
| Deadline        | TIMESTAMP | Prazo final                       |
| Status          | VARCHAR   | Status atual                      |
| CreatedAt       | TIMESTAMP | Data de criação                   |
| IsPublic        | BOOLEAN   | Indica se é visível publicamente  |
| MaxParticipants | INT       | Número máximo de participantes    |
| HasVacancies    | BOOLEAN   | Indica se possui vagas            |

#### ProjectParticipation
| Campo     | Tipo      | Descrição                             |
|-----------|-----------|---------------------------------------|
| Id        | INT       | Chave primária                        |
| ProjectId | INT       | ID do projeto (FK para Project)       |
| UserId    | INT       | ID do usuário (FK para User)          |
| Role      | VARCHAR   | Função do participante no projeto     |
| JoinedAt  | TIMESTAMP | Data em que entrou no projeto         |

## Segurança

### Medidas de Segurança Implementadas

- **Senhas**: Armazenadas com hash seguro (bcrypt)
- **Autenticação**: JWT com rotação de tokens
- **Autorização**: Baseada em claims para controle de acesso
- **Validação**: Todos os inputs são validados no backend
- **HTTPS**: Comunicação criptografada (em produção)
- **Proteção CSRF/XSS**: Implementada nos níveis de API e frontend

## Resolução de Problemas

### Problemas Comuns

1. **Erro de conexão com o banco de dados**
   - Verifique se o container do PostgreSQL está em execução
   - Confira se as credenciais estão corretas no docker-compose.yml

2. **Erro 401 Unauthorized**
   - O token JWT pode ter expirado
   - Faça login novamente para obter um novo token

3. **Não é possível participar de um projeto**
   - Verifique se o projeto é público
   - Confirme se ainda há vagas disponíveis
   - Verifique se você já não é participante

4. **Erro ao executar docker-compose**
   - Certifique-se de que as portas 5432, 5164 e 4200 estão disponíveis
   - Verifique se o Docker está em execução

---