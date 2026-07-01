# Helena Semantic Studio

Aplicacao fullstack para administrar, testar e validar a primeira camada semantica da IA Helena.

Esta versao foi pensada como uma base tecnica funcional para a faculdade e, ao mesmo tempo, como um ponto de partida limpo para evoluir depois com os workflows da Helena, IA Helena, catalogos reais e futuras integracoes.

## Objetivo

O projeto entrega um painel administrativo com:

- catalogo de dominios semanticos
- catalogo de metricas
- catalogo de skills
- dashboard com totais
- simulador de perguntas em linguagem natural
- geracao de semantic plan sem LLM
- historico de testes semanticos

## Stack

### Backend

- Node.js
- Fastify
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod

### Frontend

- Next.js com App Router
- TypeScript
- Tailwind CSS
- componentes estilo shadcn/ui
- Lucide React

### Infra

- Docker Compose
- PostgreSQL 16
- arquivos `.env.example`

## Estrutura

```text
.
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
│       ├── app.ts
│       ├── server.ts
│       ├── env.ts
│       ├── plugins/
│       ├── shared/
│       └── modules/
└── frontend/
    ├── package.json
    ├── next.config.ts
    ├── tailwind.config.ts
    └── src/
        ├── app/
        ├── components/
        ├── lib/
        └── types/
```

## Como subir o banco

Na raiz:

```bash
docker compose up -d
```

Isso sobe um PostgreSQL 16 com:

- usuario: `postgres`
- senha: `postgres`
- banco: `helena_semantic_studio`
- porta: `5432`

## Variaveis de ambiente

Copie os exemplos e ajuste se precisar:

### Raiz

```bash
cp .env.example .env
```

### Backend

```bash
cp backend/.env.example backend/.env
```

### Frontend

```bash
cp frontend/.env.example frontend/.env.local
```

Valores esperados:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/helena_semantic_studio?schema=public"
PORT=3333
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
DISABLE_DATABASE=true
HELENA_ROUTER_URL="http://localhost:3020/helena/chat"
HELENA_RELAY_TIMEOUT_MS=15000
NEXT_PUBLIC_API_URL="http://localhost:3333"
```

Se `DISABLE_DATABASE=true`, o backend sobe com dados em memoria e nao tenta autenticar no PostgreSQL. Isso ajuda bastante para demonstracao rapida e para a entrega da faculdade.

## Como rodar o backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

API em:

```text
http://localhost:3333
```

## Como rodar o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

App em:

```text
http://localhost:3000
```

## Endpoints

### Health

- `GET /health`

Resposta:

```json
{
  "status": "ok",
  "service": "helena-semantic-studio-api"
}
```

### Dashboard

- `GET /api/dashboard/stats`

### Domains

- `GET /api/domains`
- `GET /api/domains/:id`
- `POST /api/domains`

### Metrics

- `GET /api/metrics`
- `GET /api/metrics/:id`
- `POST /api/metrics`

### Skills

- `GET /api/skills`
- `GET /api/skills/:id`
- `POST /api/skills`

### Semantic

- `POST /api/semantic/plan`
- `POST /api/semantic/relay`
- `GET /api/semantic/history`

Exemplo de body:

```json
{
  "input": "quanto moeu ontem por turno?"
}
```

### Relay para a Helena

- `POST /api/semantic/relay`

Esse endpoint gera o semantic plan e, quando `HELENA_ROUTER_URL` estiver configurada, encaminha a pergunta para o chat unificado da Helena.

Exemplo de body:

```json
{
  "input": "quanto plantou hoje por fazenda?",
  "sessionId": "demo-001"
}
```

## Telas

- `/` landing page
- `/dashboard` dashboard tecnico
- `/domains` tabela de dominios
- `/metrics` tabela de metricas
- `/skills` tabela de skills
- `/semantic` simulador semantico
- `/history` historico de testes

Na pagina `/semantic`, o botao **Enviar para Helena** mostra o trace de integracao com o router quando a URL estiver configurada.

## Como funciona o semantic plan

O projeto nao chama LLM nesta primeira versao.

Fluxo atual:

1. Normaliza o texto da pergunta.
2. Busca metricas ativas no banco.
3. Compara nome e sinonimos.
4. Detecta periodo relativo.
5. Detecta agrupamentos.
6. Sugere skills.
7. Calcula `confidence`.
8. Marca `needsClarification` quando a confianca e baixa ou a metrica nao foi encontrada.
9. Salva o teste em `SemanticTest`.

Regras iniciais de score:

- sinonimo encontrado: `+0.50`
- nome da metrica: `+0.30`
- periodo detectado: `+0.10`
- agrupamento detectado: `+0.10`
- dominio detectado: `+0.10`
- maximo: `1.0`

## Teste manual sugerido

Depois de subir backend e frontend:

1. Abra `http://localhost:3000`
2. Entre em `/semantic`
3. Envie `quanto moeu ontem por turno?`
4. Verifique se o plano identifica:
   - intencao `query_metric`
   - metrica `Moagem`
   - periodo `yesterday`
   - agrupamento `shift`
   - confianca `>= 0.7`
5. Abra `/history` e confirme o registro salvo

## Roadmap futuro

Esta versao ainda nao possui:

- integracao real com IA Helena
- integracao real com workflows Helena
- integracao com Power BI
- integracao com LLM
- integracao com APIs internas
- autenticacao

Proximos passos naturais:

- consumir catalogos reais da Helena
- importar skills reais
- enriquecer semantic plans com contexto de negocio
- plugar workflows reais
- executar semantic plans em fluxos produtivos

## Observacao importante

O foco desta entrega e estruturar a base tecnica e o contrato do semantic plan. Isso deixa o projeto util para a faculdade agora e bem posicionado para crescer depois sem jogar a implementacao fora.
