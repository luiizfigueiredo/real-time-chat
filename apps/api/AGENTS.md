# AGENTS.md

## Stack & entrypoints
- NestJS 11 + TypeScript monorepo (NestJS CLI monorepo mode via `nest-cli.json`).
- Apps live in `apps/`. The current app is `apps/api/`.
- Entrypoint: `apps/api/src/main.ts` (HTTP + Socket.IO on the same port).
- `apps/api/src/app.module.ts` wires `DbModule` (global), `AuthModule`, `ChatModule`.
- ORM: Drizzle ORM with `pg` driver. Schema: `apps/api/src/shared/db/schema.ts`. Migrations in `drizzle/`.
- Infra: PostgreSQL 17 and Redis 7 via `docker-compose.yml`.

## Environment
- `.env` at repo root is required (see `.env.example`).
- `apps/api/src/shared/env-values.ts` loads `.env` manually with `dotenv`. Do not rely on NestJS `ConfigModule`.
- Key variables: `DATABASE_URL` (or `POSTGRES_*` + `DB_HOST`/`DB_PORT`), `JWT_SECRET`, `JWT_EXPIRES_IN_SECONDS`, `CORS_ORIGIN`, `PORT`, `REDIS_PORT`, `NODE_ENV`, `COOKIE_SECURE`, `COOKIE_SAME_SITE`.

## Setup & run
1. `yarn install` – documented choice; both `yarn.lock` and `package-lock.json` exist.
2. `docker-compose up -d` – start Postgres and Redis.
3. `yarn db:migrate` – apply Drizzle migrations before first run.
4. `yarn start:dev` – dev with watch.

## Build & quality
- `yarn build` – runs `nest build api`; wipes `dist/` each time.
- `yarn lint` – ESLint with `typescript-eslint` type-checked rules; auto-fix enabled.
- `yarn format` – Prettier over `apps/api/src/**/*.ts` and `apps/api/test/**/*.ts`.
- Root `tsconfig.json` is a base config; each app has its own `tsconfig.json` extending it. `apps/api/tsconfig.build.json` excludes test/spec files.
- `tsconfig.json` uses `module: "nodenext"` / `moduleResolution: "nodenext"`.
- To add a new app: `nest generate app <name>`.

## DB scripts
- `yarn db:generate` – generate migration from schema changes.
- `yarn db:migrate` – apply pending migrations.
- `yarn db:studio` – Drizzle Studio.

## Testing
- `yarn test` – unit tests (Jest, `apps/api/**/*.spec.ts`), config inline in `package.json` with `rootDir: apps/api/src`.
- `yarn test:e2e` – e2e tests (Jest config `apps/api/test/jest-e2e.json`). Regex: `.e2e-spec.ts$`.
- **E2E tests require running database and Redis**; they use the real `AppModule` and `supertest`. No in-memory stub.
- The e2e auth flow creates real users with `Date.now()` suffixed emails/usernames.

## Auth & guards
- Auth uses JWT access tokens + refresh tokens stored in an HTTP-only cookie scoped to `/auth` (`REFRESH_TOKEN_COOKIE_NAME = 'rt_chat_refresh_token'`).
- `JwtAuthGuard` (from `apps/api/src/auth/guards/jwt-auth.guard.ts`) validates the bearer token **and** checks session is active via `AuthService.isSessionActive`. Use this for protected HTTP routes.
- `apps/api/src/guards/auth.guard.ts` and `@Public()` decorator (`apps/api/src/shared/decorators/isPublic.decorator.ts`) exist but are **currently unused**; prefer `JwtAuthGuard`.

## WebSocket notes
- Socket.IO gateway: `apps/api/src/chat/chat.gateway.ts`.
- Socket auth reads JWT from `handshake.auth.token` first, then falls back to `Authorization` header.
- CORS for both HTTP and WebSocket is driven by the comma-separated `CORS_ORIGIN` env var.

## Code style
- Prettier: `singleQuote: true`, `trailingComma: all`.
- ESLint: `@typescript-eslint/no-explicit-any` is off. `no-floating-promises` and `no-unsafe-argument` are warnings.
