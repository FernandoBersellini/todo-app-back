# todo-app-back

A production-deployed **NestJS 11** REST API for a todo application, backed by **PostgreSQL** via **TypeORM**. JWT-secured, container-ready, with a full CI/CD pipeline running on every push to `main`.

Live frontend: [todo-app-frontend-o3bc.vercel.app](https://todo-app-frontend-o3bc.vercel.app)

## Highlights

- **Deployed end-to-end.** Backend + Postgres on Railway, frontend on Vercel, push-to-`main` continuous delivery gated by CI. CORS is locked to the Vercel origin via env var.
- **Zero-touch schema management.** Migrations run automatically on app boot (`migrationsRun: true`); `synchronize` is off. Every deploy lands the DB in a known state without manual steps.
- **Full CI pipeline** ([.github/workflows/ci.yml](.github/workflows/ci.yml)) — lint, unit tests, **e2e tests against a real Postgres service container** (not mocks), and a Docker build smoke test, all in parallel with cancel-in-progress concurrency.
- **Container-first.** Multi-stage [Dockerfile](Dockerfile) (builder + slim runtime) and a [docker-compose.yml](docker-compose.yml) stack with a dedicated one-shot service that runs migrations + seeds before the app starts.
- **Production-grade health checks.** `/api/health` via `@nestjs/terminus` reports DB ping and heap memory — wired into Railway's healthcheck path so failed deploys roll back automatically.
- **Strict request validation.** Global `ValidationPipe` enforces `class-validator` DTOs on every request body. Invalid payloads never reach a service.
- **Type-safe everywhere.** `typescript-eslint` with type-checked rules, Prettier integration, and strict TS compiler settings.

## Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js 20, NestJS 11 |
| Database | PostgreSQL 16, TypeORM |
| Auth | `@nestjs/jwt` (1h expiry) + bcrypt password hashing |
| Validation | `class-validator` + global `ValidationPipe` |
| Health | `@nestjs/terminus` |
| Testing | Jest (unit + e2e against real Postgres) |
| CI/CD | GitHub Actions → Railway (backend) + Vercel (frontend) |
| Quality | ESLint (type-checked), Prettier |

## API

All routes are prefixed with `/api`. `user` and `todo` routes require `Authorization: Bearer <token>`.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/signIn` | Issue JWT |
| `GET`  | `/api/auth/profile` | Decoded token payload |
| `*`    | `/api/user` | User CRUD (registration is `POST`) |
| `*`    | `/api/todo` | Todo CRUD |
| `GET`  | `/api/todo/user/:userId` | Todos for a specific user |
| `GET`  | `/api/health` | DB + memory healthcheck |

## Quick start

```bash
cp .env.example .env
docker compose up        # boots Postgres, runs migrations + seed, starts the API
```

The API listens on `PORT` (default `3000`). The Compose stack also runs a one-shot `seed` service so you get a working test user on first boot.

### Local development without Docker

```bash
npm install
npm run start:dev        # watch mode
```

You'll need a Postgres instance reachable via the `DB_*` env vars in [.env.example](.env.example).

## Commands

```bash
npm run start:dev        # watch mode
npm run build            # compile to dist/
npm run start:prod       # node dist/main

npm run test             # unit tests
npm run test:e2e         # e2e against real Postgres
npm run test:cov         # coverage

npm run lint             # ESLint with auto-fix
npm run format           # Prettier

npm run migration:generate  # generate from entity diff
npm run migration:run       # apply pending migrations
npm run migration:revert    # roll back the last one
npm run seed                # seed initial data
```

## Architecture

Standard NestJS module/controller/service layout, one folder per feature:

```
src/
  main.ts                # bootstrap, ValidationPipe, CORS
  app.module.ts          # root module — wires TypeORM + features
  auth/                  # JWT signIn, AuthGuard
  user/                  # bcrypt-hashed credentials, CRUD
  todo/                  # per-user todos, CRUD
  health/                # /api/health via terminus
  database/
    data-source.ts       # single source of truth for app + TypeORM CLI
    migrations/          # versioned schema
    seeds/               # idempotent seed script
test/                    # e2e tests
```

`User` ↔ `Todo` is a one-to-many relation; todos eager-load their owner. DTOs use `@nestjs/mapped-types` `PartialType` so update DTOs inherit from create DTOs without duplication.

## Deployment

- **Backend + Postgres:** Railway. Push to `main` → CI runs → Railway builds the Dockerfile and deploys, with `/api/health` gating the rollout.
- **Frontend:** Vercel, auto-deployed from its own repo. The backend URL is injected via a build-time env var; the backend trusts only the Vercel origin via `FRONTEND_ORIGIN`.
- **Secrets:** `AUTH_SECRET` for JWT signing; DB credentials are wired as Railway variable references (`${{ Postgres.PGHOST }}` etc.) — no plaintext anywhere.

## Configuration

See [.env.example](.env.example). Required: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `AUTH_SECRET`. Optional: `PORT`, `FRONTEND_ORIGIN`.
