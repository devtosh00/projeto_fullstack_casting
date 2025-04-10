# Infraestrutura Docker para a Plataforma Freelancer

Este diretório contém os arquivos de configuração do Docker para executar a Plataforma Freelancer com todos os seus componentes.

## Componentes

O ambiente Docker da plataforma é composto por três serviços principais:

1. **PostgreSQL** - Banco de dados relacional
2. **Backend** - API ASP.NET Core
3. **Frontend** - Aplicação Angular

## Detalhes de Configuração

### PostgreSQL Container

- **Imagem**: postgres:15
- **Porta**: 5432:5432 (host:container)
- **Usuário**: postgres
- **Senha**: postgres
- **Database**: freelancer_db
- **Volume**: postgres-data - mantém os dados persistentes entre reinicializações

### Backend Container

- **Imagem**: Construída a partir do Dockerfile no diretório backend
- **Porta**: 5164:80 (host:container)
- **Dependências**: Aguarda a inicialização do PostgreSQL
- **Variáveis de Ambiente**: Configuradas para conectar ao PostgreSQL

### Frontend Container

- **Imagem**: Construída a partir do Dockerfile no diretório frontend
- **Porta**: 4200:80 (host:container)
- **Dependências**: Aguarda a inicialização do Backend

## Instruções de Execução

### Primeira Inicialização

Na primeira vez que iniciar o ambiente, o Docker irá construir as imagens e criar os volumes persistentes:

```bash
docker-compose up -d --build
```

### Inicialização Padrão

Após a primeira inicialização, você pode simplesmente usar:

```bash
docker-compose up -d
```

### Verificação de Status

Para verificar se todos os containers estão em execução:

```bash
docker-compose ps
```

### Visualização de Logs

Para visualizar os logs dos containers:

```bash
# Todos os serviços
docker-compose logs

# Serviço específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

### Parar o Ambiente

Para interromper todos os serviços:

```bash
docker-compose down
```

### Limpar Dados (Remover Volumes)

Para remover completamente o ambiente, incluindo dados persistentes:

```bash
docker-compose down -v
```

## Solução de Problemas

### Serviço não Inicia

Se um serviço não iniciar corretamente, verifique os logs:

```bash
docker-compose logs [nome-do-serviço]
```

### Problemas de Conexão

Se o backend não conectar ao banco de dados, verifique:

1. Se o serviço do PostgreSQL está em execução
2. Se as credenciais em `appsettings.json` correspondem ao configurado no Docker Compose
3. Se o nome do host no string de conexão está correto (deve ser o nome do serviço: `db`)

### Reinicialização de Serviços

Para reiniciar um serviço específico:

```bash
docker-compose restart [nome-do-serviço]
``` 