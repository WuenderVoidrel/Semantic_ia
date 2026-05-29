# Helena Semantic Studio

## 1. Visão Geral

O Helena Semantic Studio é uma aplicação fullstack desenvolvida para gerenciar, testar e validar a primeira camada semântica da IA Helena. Este projeto serve como uma base técnica funcional e extensível para administrar domínios, métricas, skills e simulações semânticas, com o objetivo de gerar um plano semântico estruturado que poderá ser integrado futuramente aos workflows da IA Helena.

## 2. Objetivo do Projeto

O principal objetivo do Helena Semantic Studio é fornecer uma **camada semântica** (interpretação estruturada de perguntas) para consultas de indicadores, com foco em:

*   Gerar um **Semantic Plan** (JSON) a partir de linguagem natural.
*   Permitir **testes locais** dessa interpretação.
*   Encaminhar o Semantic Plan para um endpoint externo (ex: router/workflows da Helena) e mostrar a resposta (modo relay).
*   Cadastrar e gerenciar domínios, métricas e skills.
*   Preparar a arquitetura para futuras integrações com a IA Helena.

## 3. Requisitos Funcionais

### 3.1. Frontend (Next.js)

*   **Página de Simulação Semântica**: Permitir a inserção de perguntas em português e exibir detalhadamente o plano gerado (intenção, domínio, métrica, período, agrupamentos, confiança, explicação, skills sugeridas e o JSON completo).
*   **Envio para Integração (Modo Relay)**: Permitir enviar o Semantic Plan para um endpoint configurado e exibir o retorno (status HTTP, URL, resposta JSON/texto e logs de encaminhamento).
*   **Feedback Visual e Erros**: Exibir estados de carregamento, sucesso e erro (CORS, rede, endpoint não configurado). Mostrar mensagens amigáveis em caso de baixa confiança ou falta de configuração.

### 3.2. Backend (Fastify)

*   **API de Geração de Semantic Plan**: Endpoint para receber o `input` e retornar o plano semântico estruturado.
*   **API de Relay (Encaminhamento)**: Endpoint que gera o plano e o encaminha para um serviço externo, retornando os dados da transação (URL, status, resposta).
*   **Healthcheck**: Endpoint para verificação de status do serviço.
*   **CORS Configurável**: Suporte a `CORS_ORIGIN` via variáveis de ambiente.

### 3.3. Regras de Interpretação (Semantic Plan)

O sistema produz um plano com os seguintes campos mínimos:
*   `intent`: ex. `query_metric`
*   `domain`: objeto com `slug` e `name`
*   `metric`: objeto com `technicalKey`, `name`, `unit`, `daxMeasure`
*   `period`: objeto com `raw`, `type`, `value`
*   `groupBy`: lista de agrupamentos
*   `filters`: lista de filtros
*   `skillsSuggested`: lista de skills sugeridas
*   `confidence`: score entre 0 e 1
*   `needsClarification`: flag booleana
*   `explanation`: descrição textual da interpretação

## 4. Stacks Tecnológicas

### Backend
*   **Node.js**, **Fastify**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, **Zod**, **@fastify/cors**, **dotenv**.

### Frontend
*   **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Lucide React**.

### Infraestrutura
*   **Docker Compose** (PostgreSQL 16), **dotenv**.

## 5. Estrutura de Pastas

```
project-root/
├── README.md
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── package.json
│   ├── prisma/
│   └── src/
│       ├── modules/ (dashboard, domains, metrics, skills, semantic)
│       └── shared/
├── frontend/
│   ├── package.json
│   └── src/
│       ├── app/
│       ├── components/
│       └── lib/
└── Plano.txt
```

## 6. Como Iniciar o Projeto

### 6.1. Variáveis de Ambiente (.env)

O sistema suporta as seguintes configurações:
*   `PORT`: Porta do backend.
*   `NODE_ENV`: Ambiente de execução.
*   `CORS_ORIGIN`: Origens permitidas.
*   `DATABASE_URL`: URL de conexão com o Postgres.
*   `DISABLE_DATABASE`: Se `true`, opera em modo sem banco de dados.
*   `HELENA_ROUTER_URL`: URL do endpoint externo para o modo relay.
*   `NEXT_PUBLIC_API_URL`: URL da API para o frontend.

### 6.2. Execução

1.  **Banco de Dados**: `docker compose up -d` na raiz.
2.  **Backend**:
    ```bash
    cd backend
    npm install
    npx prisma generate
    npx prisma migrate dev
    npx prisma db seed
    npm run dev
    ```
3.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## 7. Critérios de Aceite

*   Gerar semantic plan com perguntas como: “quanto moeu ontem por turno?”, “qual a disponibilidade hoje?”.
*   Visualização correta do JSON na interface.
*   Funcionamento do relay caso `HELENA_ROUTER_URL` esteja configurada.
*   Tratamento gracioso de erros e falta de configuração.

## 8. Fora de Escopo (Fase Atual)

*   Autenticação e login.
*   Banco de dados obrigatório (suporte a modo sem DB).
*   Integração definitiva com MCP/IA Helena (apenas relay HTTP).
*   Deploy em produção (foco acadêmico/local).

## 9. Roadmap Futuro

*   Consumo de catálogos reais da IA Helena.
*   Integração com LLMs externos para maior precisão.
*   Conexão direta com Power BI para validação de DAX.
*   Integração com n8n e workflows produtivos.

## 10. Observações Finais

O Helena Semantic Studio foi projetado para ser uma aplicação simples, limpa e extensível, focando na padronização do contrato de comunicação semântica para a IA Helena.
