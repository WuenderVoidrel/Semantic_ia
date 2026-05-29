# Helena Semantic Studio

## 1. Visão Geral

O Helena Semantic Studio é uma aplicação fullstack desenvolvida para gerenciar, testar e validar a primeira camada semântica da IA Helena. Este projeto serve como uma base técnica funcional e extensível para administrar domínios, métricas, skills e simulações semânticas, com o objetivo de gerar um plano semântico estruturado que poderá ser integrado futuramente aos workflows da IA Helena.

## 2. Objetivo do Projeto

O principal objetivo do Helena Semantic Studio é fornecer uma **camada semântica** (interpretação estruturada de perguntas) para consultas de indicadores, com foco em:

*   Gerar um **Semantic Plan** (JSON) a partir de linguagem natural.
*   Permitir **testes locais** dessa interpretação.
*   Encaminhar o Semantic Plan para um endpoint externo (ex: router/workflows da Helena) e mostrar a resposta (modo relay).
*   Cadastrar e gerenciar domínios, métricas e skills.

## 3. Requisitos

### 3.1. Requisitos Funcionais

A tabela abaixo detalha as funcionalidades essenciais do sistema:

| Número de Ordem | Definição | Descrição | Prioridade |
| :--- | :--- | :--- | :--- |
| **RF-01** | Simulação Semântica | O sistema deve permitir ao usuário inserir perguntas em português e gerar um plano semântico estruturado (intenção, domínio, métrica, período, agrupamentos, confiança e explicação). | **Essencial** |
| **RF-02** | Exibição de JSON | O sistema deve exibir o JSON completo do Semantic Plan em formato legível para validação técnica. | **Essencial** |
| **RF-03** | Modo Relay (Envio) | O sistema deve permitir o envio do Semantic Plan para um endpoint externo configurado (ex: Helena Router). | **Importante** |
| **RF-04** | Retorno de Integração | Ao utilizar o modo relay, o sistema deve exibir o status HTTP, a URL utilizada e a resposta recebida da integração. | **Importante** |
| **RF-05** | Gestão de Domínios | O administrador deve ser capaz de cadastrar e listar domínios semânticos para organizar as métricas. | **Essencial** |
| **RF-06** | Gestão de Métricas | O sistema deve permitir o cadastro de métricas vinculadas a domínios, incluindo chaves técnicas e sinônimos. | **Essencial** |
| **RF-07** | Gestão de Skills | O sistema deve permitir o cadastro de skills sugeridas que auxiliam na interpretação da pergunta. | **Essencial** |
| **RF-08** | Feedback de Erros | O sistema deve exibir mensagens claras em caso de falha de rede, erro de CORS ou falta de configuração de endpoint. | **Essencial** |
| **RF-09** | Healthcheck | O backend deve expor um endpoint para verificação de disponibilidade do serviço. | **Essencial** |
| **RF-10** | Histórico de Testes | O sistema deve salvar e listar o histórico de simulações semânticas realizadas. | **Importante** |

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

*   Gerar semantic plan com perguntas como: “quanto moeu ontem por turno?”.
*   Visualização correta do JSON na interface.
*   Funcionamento do relay caso `HELENA_ROUTER_URL` esteja configurada.
*   Tratamento gracioso de erros e falta de configuração.

## 8. Fora de Escopo

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
