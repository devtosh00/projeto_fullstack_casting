# Backend da Plataforma Freelancer

Este diretório contém a API REST desenvolvida em ASP.NET Core para a Plataforma Freelancer.

## Estrutura do Projeto

O backend segue uma arquitetura em camadas:

```
backend/
├── Application/           # Lógica de negócios e DTOs
│   ├── DTOs/              # Data Transfer Objects
│   ├── Interfaces/        # Interfaces de serviços 
│   └── Services/          # Implementações de serviços
├── Domain/                # Entidades e regras de domínio
│   ├── Entities/          # Classes de entidades
│   └── Enums/             # Enumerações
├── Infrastructure/        # Acesso a dados e implementações externas
│   ├── Data/              # Contexto de banco de dados
│   └── Repositories/      # Repositórios para acesso a dados
└── WebAPI/                # Camada de API e controladores
    ├── Controllers/       # Controladores REST
    ├── Filters/           # Filtros da API
    └── Middlewares/       # Middlewares personalizados
```

## Tecnologias Utilizadas

- ASP.NET Core 9.0
- Entity Framework Core (PostgreSQL)
- JWT para autenticação
- Swagger para documentação da API

## Endpoints da API

### Autenticação

- **POST /api/Auth/register** - Registra um novo usuário
- **POST /api/Auth/login** - Autentica um usuário e retorna um token JWT

### Projetos

- **GET /api/Projects/{userId}** - Lista todos os projetos de um usuário
- **POST /api/Projects** - Cria um novo projeto
- **DELETE /api/Projects/{projectId}** - Remove um projeto existente

## Configuração e Execução

### Pré-requisitos

- .NET SDK 9.0 ou superior
- PostgreSQL 15 ou superior

### Configuração do Banco de Dados

O arquivo `appsettings.json` contém a string de conexão com o banco de dados:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=freelancer_db;Username=postgres;Password=postgres"
}
```

Ajuste estas configurações conforme necessário para o seu ambiente.

### Executando o Projeto

#### Via CLI .NET

1. Navegue até o diretório do projeto WebAPI:
   ```bash
   cd WebAPI
   ```

2. Execute o projeto:
   ```bash
   dotnet run
   ```

#### Via Visual Studio

1. Abra a solução `backend.sln` no Visual Studio
2. Configure o projeto WebAPI como projeto de inicialização
3. Pressione F5 para executar em modo de depuração

### Swagger UI

Quando a API estiver em execução, você pode acessar a documentação Swagger em:

```
http://localhost:5164/swagger
```

## Autenticação

A API utiliza autenticação baseada em JWT (JSON Web Token):

1. Obtenha um token fazendo uma requisição POST para `/api/Auth/login`
2. Inclua o token no cabeçalho de todas as requisições subsequentes:
   ```
   Authorization: Bearer {seu-token-aqui}
   ```

## Migração do Banco de Dados

As migrações são gerenciadas pelo Entity Framework Core:

```bash
# Adicionar uma nova migração
dotnet ef migrations add NomeDaMigracao -p Infrastructure -s WebAPI

# Aplicar migrações pendentes
dotnet ef database update -p Infrastructure -s WebAPI
``` 