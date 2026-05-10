# real-time-chat

Backend monolítico em NestJS 11 + TypeScript com HTTP e Socket.IO no mesmo processo.

## Stack
- NestJS 11 (`src/main.ts`)
- Drizzle ORM + `pg` (`src/db/schema.ts`, migrations em `drizzle/`)
- PostgreSQL 17 + Redis 7 (`docker-compose.yml`)

## Setup local
1. Instale dependências:
```bash
npm ci
```
2. Suba serviços locais:
```bash
docker-compose up -d
```
3. Crie `.env` a partir de `.env.example` e preencha os valores.
4. Aplique migrations:
```bash
npm run db:migrate
```
5. Rode em modo dev:
```bash
npm run start:dev
```

## Scripts principais
```bash
npm run lint        # lint local com --fix
npm run lint:ci     # lint somente leitura (sem mutação)
npm run test        # unit
npm run test:e2e    # e2e (requer Postgres + Redis)
npm run build       # build production
npm run test:ci     # sequência equivalente ao gate de CI
```

## CI no Harness

### Objetivo
Pipeline obrigatório para PR com os gates:
1. `lint:ci`
2. `test`
3. `test:e2e`
4. `build`

Qualquer falha bloqueia o merge via status check obrigatório no GitHub.

### Arquivos de referência no repositório
- `.harness/ci-realtime-chat-pr.yaml`
- `.harness/cd-realtime-chat-template.yaml`

### Pré-requisitos no Harness
1. Connector GitHub apontando para o repositório.
2. Build Infrastructure (Harness Cloud).
3. Secrets (escopo de projeto):
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN_SECONDS` (opcional, default já existe no app)
4. Variables de projeto recomendadas:
- `NODE_VERSION=20`
- `APP_PORT=3000`
- `REDIS_PORT=6379`
- `POSTGRES_PORT=5432`

### Fluxo do CI
O pipeline de CI:
1. Faz checkout do código.
2. Instala dependências com `npm ci` (cache habilitado).
3. Sobe Postgres e Redis efêmeros no runtime.
4. Gera `.env` em runtime com secrets do Harness.
5. Roda `db:migrate`, `lint:ci`, `test`, `test:e2e`, `build`.

### Troubleshooting
- `ECONNREFUSED` no banco/redis: confirmar variáveis `DB_HOST=127.0.0.1`, `DB_PORT=5432`, `REDIS_PORT=6379` e health checks das services.
- Falha no e2e por auth/cookie: validar `JWT_SECRET`, `COOKIE_SECURE=false`, `COOKIE_SAME_SITE=lax` para ambiente de CI.
- Migrations falhando: revisar `drizzle/` e garantir que `db:migrate` roda localmente com a mesma config.

## CD preparado (template)
O template `.harness/cd-realtime-chat-template.yaml` está pronto, porém desativado por padrão, com:
1. Build/package da aplicação
2. Etapa de deploy parametrizada por `DEPLOY_TARGET`
3. Approval manual por ambiente (`staging`/`prod`)

Ative quando o alvo de deploy (Kubernetes ou VM) for definido.
