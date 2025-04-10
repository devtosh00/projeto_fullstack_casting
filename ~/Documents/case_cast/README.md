# Plataforma Freelancer

## Sobre o Projeto

Este projeto é uma plataforma para freelancers gerenciarem seus projetos, desenvolvida com Angular no frontend e .NET Core no backend, utilizando PostgreSQL como banco de dados. A plataforma permite o registro de usuários, autenticação, criação e gerenciamento de projetos.

## Tecnologias Utilizadas

- **Frontend**: Angular 17
- **Backend**: .NET 9
- **Banco de Dados**: PostgreSQL 15
- **Containerização**: Docker & Docker Compose

## Estrutura do Projeto

```
freelancer-platform/
├── frontend/                # Aplicação Angular
│   ├── src/app/
│   │   ├── core/           # Auth, Interceptors, Guards
│   │   ├── features/       # Módulos: usuários, projetos
│   │   └── shared/         # Componentes UI e Directives reutilizáveis
├── backend/                # API .NET
│   ├── Application/        # DTOs, Services, Interfaces
│   ├── Domain/             # Entidades, Enums
│   ├── Infrastructure/     # DbContext, Migrations, Repositórios
│   └── WebAPI/             # Controllers, Middlewares, Configuração do Swagger
└── infra/                  # Docker Compose e scripts de infraestrutura
```

## Pré-requisitos

- Docker Desktop
- Git

## Configuração e Execução

### Usando Docker (Recomendado)

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/freelancer-platform.git
   cd freelancer-platform
   ```

2. Inicie os containers Docker:
   ```bash
   cd infra
   docker-compose up -d
   ```

3. Acesse a aplicação:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:5164
   - Swagger UI: http://localhost:5164/swagger

### Configuração Manual (Desenvolvimento)

#### Backend (.NET)

1. Navegue até o diretório do backend:
   ```bash
   cd freelancer-platform/backend
   ```

2. Restaure as dependências e execute o projeto:
   ```bash
   dotnet restore
   dotnet run --project WebAPI
   ```

#### Frontend (Angular)

1. Navegue até o diretório do frontend:
   ```bash
   cd freelancer-platform-frontend
   ```

2. Instale as dependências e inicie o servidor de desenvolvimento:
   ```bash
   npm install
   ng serve
   ```

## Funcionalidades

### Autenticação
- Registro de novos usuários
- Login com autenticação JWT

### Projetos
- Criação de projetos com descrição, orçamento, prazo e status
- Listagem de projetos do usuário
- Exclusão de projetos

## API Endpoints

### Autenticação
- `POST /api/Auth/register` - Registro de usuário
- `POST /api/Auth/login` - Login de usuário

### Projetos
- `GET /api/Projects/{userId}` - Listar projetos do usuário
- `POST /api/Projects` - Criar novo projeto
- `DELETE /api/Projects/{projectId}` - Excluir projeto

## Docker

O projeto utiliza Docker para facilitar a configuração do ambiente de desenvolvimento. O arquivo docker-compose.yml configura três serviços:

1. **PostgreSQL**: Banco de dados
2. **Backend**: API .NET
3. **Frontend**: Aplicação Angular

### Detalhes dos Containers

- **PostgreSQL**:
  - Porta: 5432
  - Usuário: postgres
  - Senha: postgres
  - Database: freelancer_db

- **Backend**:
  - Porta: 5164
  - Dependências: PostgreSQL

- **Frontend**:
  - Porta: 4200
  - Dependências: Backend

### Volumes Persistentes

- `postgres-data`: Armazena os dados do PostgreSQL

## Solução de Problemas

### Problemas com Conexão ao Banco de Dados
- Verifique se o container do PostgreSQL está em execução:
  ```bash
  docker ps | grep postgres
  ```
- Verifique as configurações de conexão em `backend/WebAPI/appsettings.json`

### Aplicação Frontend não Carrega
- Verifique se o backend está em execução e acessível
- Verifique os logs do container:
  ```bash
  docker logs freelancer-frontend
  ```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um novo Pull Request 