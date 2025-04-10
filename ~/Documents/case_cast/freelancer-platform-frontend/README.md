# Frontend da Plataforma Freelancer

Este diretório contém a aplicação web Angular para a Plataforma Freelancer.

## Estrutura do Projeto

O frontend segue uma arquitetura modular baseada em features:

```
src/
├── app/
│   ├── core/                # Serviços singleton, autenticação e guards
│   │   ├── auth/            # Autenticação e autorização
│   │   ├── guards/          # Route guards
│   │   ├── http/            # Interceptors HTTP
│   │   └── services/        # Serviços globais
│   ├── features/            # Módulos de funcionalidades
│   │   ├── home/            # Página inicial
│   │   ├── projects/        # Gerenciamento de projetos
│   │   └── job-positions/   # Posições/vagas de trabalho
│   └── shared/              # Componentes e utilitários compartilhados
│       ├── components/      # Componentes reutilizáveis
│       ├── directives/      # Diretivas customizadas
│       ├── models/          # Interfaces e tipos
│       ├── pipes/           # Pipes personalizados
│       └── services/        # Serviços compartilhados
├── assets/                  # Recursos estáticos
│   ├── images/              # Imagens
│   └── icons/               # Ícones
└── environments/            # Configurações por ambiente
```

## Tecnologias Utilizadas

- Angular 17
- Angular Material
- TailwindCSS para estilização
- RxJS para programação reativa
- NgRx para gerenciamento de estado (opcional)

## Funcionalidades Principais

- Autenticação (registro, login e logout)
- Dashboard de projetos
- Criação e edição de projetos
- Gerenciamento de vagas de trabalho
- Perfil de usuário

## Configuração e Execução

### Pré-requisitos

- Node.js 18+ e npm 9+
- Angular CLI 17+

### Instalação

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Verifique e ajuste a configuração da API no arquivo de ambiente:
   ```typescript
   // src/environments/environment.ts
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:5164/api'
   };
   ```

### Executando o Aplicativo

#### Servidor de Desenvolvimento

```bash
ng serve
```

O aplicativo estará disponível em `http://localhost:4200/`.

#### Build de Produção

```bash
ng build --configuration production
```

Os arquivos de build serão gerados no diretório `dist/`.

## Testes

### Testes Unitários

```bash
ng test
```

Execute os testes unitários via [Karma](https://karma-runner.github.io).

### Testes End-to-End

```bash
ng e2e
```

Execute os testes end-to-end via [Protractor](http://www.protractortest.org/).

## Estrutura de Arquivos Importantes

- `app.component.ts`: Componente raiz da aplicação
- `app.module.ts`: Módulo principal da aplicação
- `app-routing.module.ts`: Configuração de rotas da aplicação
- `material.module.ts`: Configuração dos componentes do Angular Material

## Estilos e Temas

A aplicação utiliza uma combinação de TailwindCSS e Angular Material para estilização:

- `src/styles.scss`: Estilos globais
- `src/theme.scss`: Configuração do tema do Angular Material

## Autenticação

A autenticação é implementada usando JWT:

1. O usuário faz login com suas credenciais
2. O token JWT é armazenado no localStorage
3. Um interceptor HTTP adiciona o token em todas as requisições subsequentes
4. Guards de rotas protegem as páginas que exigem autenticação 