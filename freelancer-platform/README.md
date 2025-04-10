# Plataforma Freelancer

Sistema completo para gerenciamento de projetos freelance, conexão entre profissionais e oportunidades de trabalho.

## Visão Geral

A Plataforma Freelancer é um sistema full-stack que permite:

- Cadastro de usuários (freelancers e contratantes)
- Criação e gerenciamento de projetos
- Oportunidades públicas para participação em projetos
- Gerenciamento de participações em projetos

## Arquitetura do Projeto

O projeto segue uma arquitetura de microserviços, dividida em três componentes principais:

### Backend (ASP.NET Core)

- API RESTful desenvolvida em C# com ASP.NET Core 9
- Arquitetura em camadas (Clean Architecture)
- Persistência com Entity Framework Core e PostgreSQL
- Autenticação via JWT

### Frontend (Angular)

- Aplicação SPA com Angular 17
- Interface responsiva com Angular Material e TailwindCSS
- Gerenciamento de estado com RxJS
- Comunicação com a API via HttpClient

### Infraestrutura (Docker)

- Containerização completa para desenvolvimento e produção
- Volumes persistentes para banco de dados
- Configuração via docker-compose

## Novas Funcionalidades

### Sistema de Oportunidades

A plataforma agora suporta um sistema de oportunidades que permite:

- Criação de projetos públicos com vagas para participação
- Visualização de projetos disponíveis para participação
- Gerenciamento de participantes em projetos
- Controle automático de vagas disponíveis

Para mais detalhes sobre esta funcionalidade, consulte [docs/FEATURES.md](./docs/FEATURES.md).

## Executando o Projeto

### Pré-requisitos

- Docker e Docker Compose
- .NET SDK 9.0 (para desenvolvimento)
- Node.js 18+ e npm 9+ (para desenvolvimento frontend)

### Usando Docker Compose

O método recomendado para executar o projeto completo é usando Docker Compose:

```bash
cd infra
docker-compose up -d
```

Isso iniciará:
- PostgreSQL na porta 5432
- Backend na porta 5164
- Frontend na porta 4200

### Executando Componentes Individualmente

#### Backend

```bash
cd backend/WebAPI
dotnet run
```

#### Frontend

```bash
cd frontend
npm install
ng serve
```

## Documentação da API

A documentação da API está disponível via Swagger UI:

```
http://localhost:5164/swagger
```

## Estrutura de Diretórios

```
freelancer-platform/
├── backend/
│   ├── Application/    # Lógica de negócios e DTOs
│   ├── Contracts/      # Interfaces e contratos
│   ├── Domain/         # Entidades e regras de domínio
│   ├── Infrastructure/ # Acesso a dados
│   └── WebAPI/         # Controllers e configuração
├── frontend/
│   ├── src/
│   │   ├── app/        # Componentes Angular
│   │   ├── assets/     # Recursos estáticos
│   │   └── styles/     # Estilos globais
├── infra/
│   ├── docker-compose.yml
│   ├── init-db/        # Scripts de inicialização do banco
│   └── docs/           # Documentação adicional
```

## Contribuição

1. Clone o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nome-da-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Envie para a branch (`git push origin feature/nome-da-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT. 