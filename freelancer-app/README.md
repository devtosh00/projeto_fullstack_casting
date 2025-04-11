# Plataforma Freelancer

## Visão Geral
Plataforma completa para gerenciamento de projetos freelance, permitindo que usuários criem projetos, contratem freelancers e participem de oportunidades públicas. O sistema é construído com arquitetura moderna e separa claramente o backend e frontend.

## Arquitetura do Sistema

### Componentes Principais
- **Backend**: API REST em .NET Core 9 com Entity Framework Core
- **Frontend**: Single Page Application em Angular 17+
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)
- **Infraestrutura**: Docker e Docker Compose

### Estrutura do Projeto
```
freelancer-app/
├── backend/             # Backend em .NET Core 9
│   ├── Application/     # Lógica de aplicação, serviços e DTOs
│   ├── Contracts/       # Contratos e interfaces
│   ├── Domain/          # Entidades de domínio
│   ├── Infrastructure/  # Persistência e acesso a dados
│   └── WebAPI/          # Controllers e configurações da API
├── frontend/            # Frontend em Angular 17+
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/    # Serviços core e autenticação
│   │   │   ├── features/# Componentes por funcionalidade
│   │   │   └── shared/  # Componentes compartilhados
│   │   ├── assets/      # Recursos estáticos
│   │   └── environments/# Configurações por ambiente
├── docs/                # Documentação
│   └── api-endpoints.md # Detalhes dos endpoints
└── docker-compose.yml   # Configuração Docker
```

## Modelo de Dados

### Entidades Principais
1. **User**
   - Id, Username, Email, PasswordHash
   - Relacionamentos: Projects (1:N), ProjectParticipations (1:N)

2. **Project**
   - Id, UserId, Description, Budget, Deadline, Status
   - IsPublic, MaxParticipants, HasVacancies
   - Relacionamentos: User (N:1), ProjectParticipations (1:N)

3. **ProjectParticipation**
   - Id, ProjectId, UserId, Role, JoinedAt
   - Relacionamentos: Project (N:1), User (N:1)

### Diagrama Relacional Simplificado
```
User (1) --< Project (1) --< ProjectParticipation >-- (N) User
```

## Backend (.NET Core 9)

### Recursos e Tecnologias
- **Arquitetura Limpa** (Clean Architecture)
- **Entity Framework Core** para ORM
- **JWT** para autenticação e autorização
- **Swagger** para documentação da API
- **Injeção de Dependência** nativa
- **Repository Pattern** para acesso a dados

### Principais Endpoints

#### Autenticação
- `POST /api/Auth/register` - Registrar novo usuário
- `POST /api/Auth/login` - Login de usuário

#### Projetos
- `GET /api/Projects/user/{userId}` - Listar projetos do usuário
- `GET /api/Projects/details/{projectId}` - Obter detalhes de um projeto
- `POST /api/Projects` - Criar novo projeto
- `PUT /api/Projects/{projectId}` - Atualizar projeto
- `DELETE /api/Projects/{projectId}` - Excluir projeto
- `GET /api/Projects/public` - Listar projetos públicos

#### Participações
- `GET /api/ProjectParticipations/user/{userId}` - Listar participações do usuário
- `GET /api/ProjectParticipations/project/{projectId}` - Listar participantes de um projeto
- `POST /api/ProjectParticipations/join/{projectId}` - Participar de um projeto
- `DELETE /api/ProjectParticipations/leave/{projectId}` - Sair de um projeto
- `GET /api/ProjectParticipations/opportunities` - Listar oportunidades disponíveis

## Frontend (Angular 17+)

### Recursos e Tecnologias
- **Angular Material** para componentes de UI
- **TailwindCSS** para estilização
- **RxJS** para programação reativa
- **NgRx** (opcional) para gerenciamento de estado
- **Angular Router** para navegação
- **Interceptors** para gerenciamento de autenticação

### Principais Módulos/Funcionalidades
- **Autenticação**: Login, registro e gerenciamento de tokens
- **Dashboard**: Visão geral dos projetos e participações
- **Gerenciamento de Projetos**: Criar, editar, listar e excluir projetos
- **Participações**: Participar, listar e cancelar participações em projetos
- **Oportunidades**: Visualizar projetos públicos disponíveis

## Docker e Infraestrutura

### Containers
- **PostgreSQL**: Banco de dados relacional
- **Backend**: API .NET Core
- **Frontend**: Servidor web (nginx) para aplicação Angular

### Configuração
O arquivo `docker-compose.yml` inclui:
- Configuração dos containers
- Mapeamento de portas
- Volumes para persistência
- Variáveis de ambiente
- Dependências entre serviços

## Como Utilizar

### Pré-requisitos
- Docker e Docker Compose
- [Opcional] .NET 9 SDK (para desenvolvimento)
- [Opcional] Node.js e NPM (para desenvolvimento)

### Instalação e Execução
1. **Clone o repositório**:
   ```bash
   git clone [url-do-repositorio]
   cd freelancer-app
   ```

2. **Execute com Docker Compose**:
   ```bash
   docker-compose up -d
   ```
   
   Isso iniciará:
   - O banco de dados PostgreSQL na porta 5432
   - A API backend na porta 5164
   - O frontend na porta 4200

3. **Acesse a aplicação**:
   - Frontend: http://localhost:4200
   - API Swagger: http://localhost:5164/swagger

### Desenvolvimento Local (Sem Docker)

#### Backend:
```bash
cd backend/WebAPI
dotnet restore
dotnet run
```

#### Frontend:
```bash
cd frontend
npm install
ng serve
```

## Fluxos de Funcionalidades

### Fluxo de Autenticação
1. Usuário se registra com username, email e senha
2. Usuário faz login e recebe um token JWT
3. Token é armazenado no localStorage e enviado em requisições subsequentes

### Fluxo de Criação de Projeto
1. Usuário autenticado acessa área de criação de projetos
2. Preenche dados como descrição, orçamento, prazo e status
3. Define se o projeto é público e quantos participantes pode ter
4. Submete o formulário e o projeto é criado

### Fluxo de Participação em Projeto
1. Usuário visualiza lista de oportunidades públicas
2. Seleciona um projeto e solicita participação
3. Sistema valida se há vagas disponíveis
4. Usuário é adicionado como participante do projeto

## Segurança e Boas Práticas
- Autenticação com JWT e refresh tokens
- Validação de dados de entrada no backend
- Autorização baseada em claims
- Proteção contra CSRF e XSS
- Tratamento padronizado de erros
- Logs estruturados

## Resolução de Problemas
- **Erro de conexão com o banco**: Verifique se o container do PostgreSQL está ativo
- **Erro 401**: Token de autenticação inválido ou expirado
- **Erro 404**: Endpoint não encontrado, verifique a URL
- **Erro 400**: Dados inválidos, verifique o payload enviado

---

Para mais informações detalhadas, consulte os READMEs específicos nas pastas `/backend` e `/frontend` e a documentação na pasta `/docs`. 