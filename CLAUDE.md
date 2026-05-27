# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

NestJS 11 REST API for a todo application, backed by PostgreSQL via TypeORM. JWT-based
authentication guards the `todo` and `user` routes. All routes are namespaced under `api/`.

## Commands

```bash
npm run start:dev      # run in watch mode (development)
npm run build          # compile to dist/
npm run start:prod     # run compiled output (node dist/main)

npm run test           # unit tests (src/**/*.spec.ts)
npm run test:watch     # unit tests in watch mode
npm run test:e2e       # e2e tests (test/**/*.e2e-spec.ts)
npm run test:cov       # unit tests with coverage

npm run lint           # ESLint with auto-fix
npm run format         # Prettier format
```

To run a single test file:
```bash
npx jest src/app.controller.spec.ts
```

### Database (TypeORM + PostgreSQL)

```bash
npm run migration:generate   # generate a migration from entity changes
npm run migration:create     # create an empty migration
npm run migration:run        # apply pending migrations (dev, against src)
npm run migration:revert     # revert the last migration
npm run seed                 # run the seed script (dev)
```

The `:prod` variants (`migration:run:prod`, `seed:prod`) run against compiled `dist/` output.

Note: the app calls `TypeOrmModule.forRoot({ migrationsRun: true })`, so pending migrations
are **applied automatically on startup**. `synchronize` is off — schema changes must go
through migrations.

### Docker

`docker-compose.yml` defines three services: `db` (postgres:16-alpine), a one-shot `seed`
service that runs migrations + seeds, and `app`. Bring the stack up with `docker compose up`.
Requires the env vars below (compose reads them from `.env`).

## Configuration

Environment variables (see [.env.example](.env.example)):
`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `AUTH_SECRET`, `PORT`.

The app listens on `PORT`, **defaulting to `5555`** (see [src/main.ts](src/main.ts)). CORS is
enabled and a global `ValidationPipe` is registered.

## Architecture

Standard NestJS module/controller/service pattern. Feature modules live under `src/<feature>/`:

- **`auth`** — `POST api/auth/signIn` issues a JWT (1h expiry, signed with `AUTH_SECRET`);
  `GET api/auth/profile` returns the decoded token. `AuthGuard` ([src/auth/auth.guard.ts](src/auth/auth.guard.ts))
  validates `Authorization: Bearer <token>` and attaches the payload to `request.user`.
- **`user`** — CRUD under `api/user`, guarded by `AuthGuard`. Passwords are bcrypt-hashed.
- **`todo`** — CRUD under `api/todo`, guarded by `AuthGuard`. Includes `GET api/todo/user/:userId`.
- **`health`** — `GET api/health` via `@nestjs/terminus`, checking DB ping and heap memory.

Entities (`src/<feature>/entities/*.entity.ts`): `User` ↔ `Todo` is a one-to-many relation
(a `Todo` eager-loads its `User`). DTOs live in `src/<feature>/dto/`; update DTOs extend create
DTOs via `@nestjs/mapped-types` `PartialType`.

`AppModule` ([src/app.module.ts](src/app.module.ts)) is the root module: it loads `ConfigModule`,
wires TypeORM from `dataSourceOptions`, and imports the feature modules. New feature modules
must be imported there.

Database wiring (entities, migrations path, connection) is centralized in
[src/database/data-source.ts](src/database/data-source.ts), used by both the app and the TypeORM CLI.

Unit tests live alongside source files (`*.spec.ts`); e2e tests live in [test/](test/).

## Linting & formatting

ESLint config ([eslint.config.mjs](eslint.config.mjs)) uses `typescript-eslint` with type-checked
rules and Prettier integration. Notable rule overrides:
- `@typescript-eslint/no-explicit-any` — off
- `@typescript-eslint/no-floating-promises` — warn
- `prettier/prettier` — error, `endOfLine: auto`
