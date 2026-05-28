# Helena Semantic Studio

## 1. Visão Geral

O Helena Semantic Studio é uma aplicação fullstack desenvolvida para gerenciar, testar e validar a primeira camada semântica da IA Helena. Este projeto serve como uma base técnica funcional e extensível para administrar domínios, métricas, skills e simulações semânticas, com o objetivo de gerar um plano semântico estruturado que poderá ser integrado futuramente aos workflows da IA Helena.

## 2. Objetivo do Projeto

O principal objetivo do Helena Semantic Studio é criar uma ferramenta administrativa para:

*   Cadastrar domínios semânticos.
*   Cadastrar métricas semânticas.
*   Cadastrar skills.
*   Simular perguntas em linguagem natural para gerar planos semânticos.
*   Salvar o histórico de testes semânticos.
*   Exibir um dashboard com estatísticas básicas do sistema.
*   Preparar a arquitetura para futuras integrações com a IA Helena.

É importante notar que esta primeira versão **não** inclui integrações reais com Power BI, LLMs, workflows da Helena, Senior, Supabase ou n8n. O foco é estabelecer uma base sólida e um contrato de plano semântico.

## 3. Stacks Tecnológicas

O projeto é construído com as seguintes tecnologias:

### Backend

*   **Node.js**: Ambiente de execução JavaScript.
*   **Fastify**: Framework web rápido e de baixo overhead para Node.js.
*   **TypeScript**: Superset de JavaScript que adiciona tipagem estática.
*   **Prisma ORM**: ORM moderno para Node.js e TypeScript.
*   **PostgreSQL**: Sistema de gerenciamento de banco de dados relacional.
*   **Zod**: Biblioteca de validação de esquemas TypeScript-first.
*   **@fastify/cors**: Plugin Fastify para habilitar CORS.
*   **dotenv**: Módulo para carregar variáveis de ambiente de um arquivo `.env`.
*   **API REST**: Arquitetura de API baseada em princípios REST.
*   **Estrutura modular**: Organização do código em módulos para facilitar a manutenção e escalabilidade.

### Frontend

*   **Next.js com App Router**: Framework React para aplicações web, utilizando o novo App Router.
*   **TypeScript**: Superset de JavaScript para tipagem estática.
*   **Tailwind CSS**: Framework CSS utility-first para estilização rápida e responsiva.
*   **shadcn/ui**: Coleção de componentes UI reutilizáveis e acessíveis.
*   **Lucide React**: Biblioteca de ícones para React.
*   **Componentização reutilizável**: Desenvolvimento de componentes que podem ser facilmente reusados em diferentes partes da aplicação.
*   **Interface em português brasileiro**: Localização da interface do usuário para o português do Brasil.

### Infraestrutura

*   **Docker Compose**: Ferramenta para definir e executar aplicações Docker multi-container.
*   **PostgreSQL 16**: Versão específica do banco de dados PostgreSQL.
*   **dotenv**: Para gerenciamento de variáveis de ambiente.

## 4. Estrutura de Pastas

A estrutura do projeto é organizada da seguinte forma:

```
project-root/
├── README.md
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── server.ts
│       ├── app.ts
│       ├── env.ts
│       ├── plugins/
│       ├── shared/
│       └── modules/
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── src/
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── types/
└── Plano.txt
```

## 5. Como Iniciar o Projeto

Siga os passos abaixo para configurar e executar o Helena Semantic Studio localmente.

### 5.1. Pré-requisitos

Certifique-se de ter o Docker e o Node.js (com npm) instalados em sua máquina.

### 5.2. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto, copiando o conteúdo de `.env.example` e preenchendo as variáveis:

```dotenv
# Backend
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/helena_semantic_studio?schema=public"
PORT=3333
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3333"
```

### 5.3. Banco de Dados (PostgreSQL com Docker Compose)

Na raiz do projeto, execute o seguinte comando para subir o container do PostgreSQL:

```bash
docker compose up -d
```

Isso iniciará um container PostgreSQL 16 com as configurações definidas no `docker-compose.yml`.

### 5.4. Configuração e Execução do Backend

Navegue até o diretório `backend` e execute os comandos:

```bash
cd backend
npm install         # Instala as dependências
npx prisma generate # Gera o cliente Prisma
npx prisma migrate dev # Aplica as migrações do banco de dados
npx prisma db seed  # Popula o banco de dados com dados iniciais
npm run dev         # Inicia o servidor de desenvolvimento
```

O backend estará disponível em `http://localhost:3333`.

### 5.5. Configuração e Execução do Frontend

Em um novo terminal, navegue até o diretório `frontend` e execute os comandos:

```bash
cd frontend
npm install         # Instala as dependências
npm run dev         # Inicia o servidor de desenvolvimento
```

O frontend estará disponível em `http://localhost:3000`.

## 6. Funcionalidades Implementadas

As seguintes funcionalidades foram desenvolvidas e superadas nesta versão do projeto:

*   **Infraestrutura**: Configuração de `docker-compose.yml` para PostgreSQL 16 e arquivo `.env.example` para variáveis de ambiente.
*   **Backend Core**: Implementação de `Fastify` para o servidor, configuração de `TypeScript`, gerenciamento de variáveis de ambiente com `Zod`, e estrutura de aplicação modular.
*   **Plugins Backend**: Configuração de `CORS` e integração com `Prisma` para acesso ao banco de dados.
*   **Tratamento de Erros**: Implementação de `AppError` para erros padronizados e um `error-handler` global para tratamento de exceções.
*   **Utilitários**: Funções para normalização de texto (`normalize-text.ts`) e cálculo de confiança de planos semânticos (`calculate-confidence.ts`).
*   **Modelagem de Dados (Prisma)**: Definição dos modelos `Domain`, `Metric`, `Skill` e `SemanticTest` no `schema.prisma`.
*   **Seed de Dados**: Criação de `seed.ts` para popular o banco de dados com dados fictícios de domínios, métricas e skills.
*   **Módulos Backend e Endpoints**: Implementação de rotas, controllers, services e repositories para:
    *   **Health**: `GET /health`.
    *   **Dashboard**: `GET /api/dashboard/stats` para estatísticas gerais.
    *   **Domains**: `GET /api/domains`, `GET /api/domains/:id`, `POST /api/domains`.
    *   **Metrics**: `GET /api/metrics`, `GET /api/metrics/:id`, `POST /api/metrics`.
    *   **Skills**: `GET /api/skills`, `GET /api/skills/:id`, `POST /api/skills`.
    *   **Semantic**: `POST /api/semantic/plan` para gerar planos semânticos e `GET /api/semantic/history` para o histórico de testes.
*   **Frontend Core**: Configuração de `Next.js`, `TypeScript`, `Tailwind CSS`, `shadcn/ui` e `Lucide React`.
*   **Tipagem Frontend**: Definição de tipos para `Domain`, `Metric`, `Skill`, `SemanticTest`, `SemanticPlan` e `DashboardStats`.
*   **Cliente API Frontend**: Centralização das chamadas ao backend em `frontend/src/lib/api.ts`.
*   **Utilitários Frontend**: Implementação de constantes e formatadores (`constants.ts`, `formatters.ts`).
*   **Componentes Frontend**: Desenvolvimento de componentes de layout (header, sidebar, layout geral) e componentes compartilhados (page-header, status-badge, loading-state, error-state, empty-state).
*   **Páginas Frontend**: Criação das páginas:
    *   `/`: Landing page simples.
    *   `/dashboard`: Exibe estatísticas do sistema.
    *   `/domains`: Tabela de domínios.
    *   `/metrics`: Tabela de métricas.
    *   `/skills`: Tabela de skills.
    *   `/semantic`: Simulador de plano semântico.
    *   `/history`: Histórico de testes semânticos.
*   **Lógica do Plano Semântico**: Implementação da lógica inicial para gerar planos semânticos baseada em normalização de texto, busca de métricas, detecção de período e agrupamentos, sugestão de skills e cálculo de confiança, sem a necessidade de um LLM externo nesta fase.

## 7. Verificação

### 7.1. Testes Automatizados (API)

Após iniciar o backend, você pode testar os endpoints da API usando ferramentas como Insomnia ou Postman:

*   `GET http://localhost:3333/health`: Deve retornar `200 OK`.
*   `GET http://localhost:3333/api/domains`: Deve retornar a lista de domínios do seed.
*   `GET http://localhost:3333/api/metrics`: Deve retornar a lista de métricas com seus domínios relacionados.
*   `GET http://localhost:3333/api/skills`: Deve retornar a lista de skills.
*   `GET http://localhost:3333/api/dashboard/stats`: Deve retornar os totais de domínios, métricas, skills e testes semânticos.
*   `POST http://localhost:3333/api/semantic/plan` com body `{"input": "quanto moeu ontem por turno?"}`: Deve retornar um plano semântico com `intent: query_metric`, `domínio: Matéria-Prima`, `métrica: Moagem`, `período: yesterday`, `groupBy: shift`, `skills: metric-resolver, ranges-relativos, turnos-rules, answer-verifier`, `confidence >= 0.7` e `needsClarification: false`.
*   `GET http://localhost:3333/api/semantic/history`: Deve retornar o histórico com o teste semântico recém-salvo.

### 7.2. Testes Manuais (Frontend)

Após iniciar o frontend, acesse `http://localhost:3000` e verifique:

*   Navegação entre todas as páginas.
*   O dashboard exibindo os totais reais consumidos da API.
*   As tabelas de domínios, métricas e skills populadas corretamente.
*   O simulador semântico funcionando e gerando planos.
*   O histórico de testes semânticos sendo exibido.
*   A responsividade da interface.
*   Os estados de carregamento, erro e vazio sendo exibidos quando apropriado.

## 8. Roadmap Futuro

Este projeto é a base para futuras evoluções, incluindo:

*   Consumo de catálogos reais da IA Helena.
*   Importação de skills reais.
*   Sugestão de workflows.
*   Integração com LLMs externos.
*   Conexão com Power BI.
*   Integração com n8n.
*   Conexão com APIs internas da Helena.
*   Execução de planos semânticos em produção.

## 9. Observações Finais

O Helena Semantic Studio foi projetado para ser uma aplicação simples, limpa e extensível. O foco principal desta fase foi estruturar a interface administrativa e técnica da camada semântica, fornecendo as ferramentas essenciais para gerenciar domínios, métricas, skills, simular perguntas e visualizar o histórico e o dashboard. A ausência de integrações externas reais nesta versão é intencional, visando solidificar a base antes de expandir para sistemas mais complexos.
