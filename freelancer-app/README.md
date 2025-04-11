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
- **.NET Core 9**: Framework moderno e de alto desempenho
- **Entity Framework Core**: ORM para acesso a dados
- **JWT Authentication**: Sistema seguro de autenticação
- **Swagger**: Documentação automática da API
- **Clean Architecture**: Organização do código em camadas bem definidas

### Frontend
- **Angular 17+**: Framework frontend progressivo e reativo
- **Angular Material**: Componentes de UI consistentes
- **TailwindCSS**: Framework CSS utilitário para estilização
- **RxJS**: Biblioteca para programação reativa
- **JWT Interceptor**: Gerenciamento automático de tokens de autenticação

### Infraestrutura
- **Docker**: Containerização da aplicação
- **Docker Compose**: Orquestração de múltiplos contêineres
- **PostgreSQL**: Banco de dados relacional
- **Nginx**: Servidor web para o frontend

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

### Instalação com Docker (Recomendado)

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/freelancer-app.git
   cd freelancer-app
   ```

2. **Inicie os contêineres**:
   ```bash
   docker-compose up -d
   ```

3. **Acesse a aplicação**:
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

### Endpoints Principais

#### Autenticação
- `POST /api/Auth/register` - Registrar novo usuário
- `POST /api/Auth/login` - Autenticar usuário e obter token JWT

#### Projetos
- `GET /api/Projects` - Listar todos os projetos
- `GET /api/Projects/user/{userId}` - Listar projetos do usuário
- `GET /api/Projects/details/{projectId}` - Obter detalhes de um projeto
- `POST /api/Projects` - Criar novo projeto
- `PUT /api/Projects/{projectId}` - Atualizar projeto existente
- `DELETE /api/Projects/{projectId}` - Remover projeto
- `GET /api/Projects/public` - Listar projetos públicos

#### Participações
- `GET /api/ProjectParticipations/user/{userId}` - Listar participações do usuário
- `GET /api/ProjectParticipations/project/{projectId}` - Listar participantes do projeto
- `POST /api/ProjectParticipations` - Solicitar participação em projeto
- `DELETE /api/ProjectParticipations/project/{projectId}` - Cancelar participação
- `GET /api/ProjectParticipations/opportunities` - Listar oportunidades disponíveis

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

## Desenvolvimento e Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Envie para o repositório remoto (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

Para suporte adicional, entre em contato com a equipe de desenvolvimento. 