# todo-app-back

A NestJS 11 + TypeORM backend for a todo application. Provides user registration, JWT-based authentication, and per-user CRUD over todos.

## Stack

- **NestJS 11** (modular structure: `auth`, `user`, `todo`)
- **TypeORM** with **PostgreSQL**
- **JWT** via `@nestjs/jwt` for authentication, with an `AuthGuard` protecting routes
- **bcrypt** for password hashing
- **class-validator** DTOs
- **Jest** for unit and e2e tests

## Requirements

- Node.js 20+
- npm
- A running PostgreSQL instance

## Setup

```bash
npm install
```

Create a `.env` file at the project root with the database connection details (consumed in [src/app.module.ts](src/app.module.ts) via `@nestjs/config`):

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=todo_app
JWT_SECRET=replace-me
```

> Note: `synchronize: true` is enabled in TypeORM config, so the schema is auto-created from entities on boot. Fine for development — **switch off and use migrations before any production use**.

## Running the app

```bash
npm run start:dev      # watch mode (development)
npm run build          # compile to dist/
npm run start:prod     # run compiled output
```

The server listens on `PORT` (defaults to `3000`).

## API

All routes are prefixed with `/api`.

### Auth (`/api/auth`)
- `POST /signIn` — body: `{ email, password }` → `{ access_token, userId, email }`
- `GET  /profile` — requires `Authorization: Bearer <token>`

### User (`/api/user`) — all routes require Bearer token
- `POST   /`     — create user (registration; `{ email, password }`)
- `GET    /`     — list users
- `GET    /:id`  — get user
- `PATCH  /:id`  — update user
- `DELETE /:id`  — delete user

### Todo (`/api/todo`)
- `POST   /`              — create todo
- `GET    /`              — list all todos
- `GET    /user/:userId`  — list todos for a user
- `GET    /:id`           — get todo
- `PATCH  /:id`           — update todo
- `DELETE /:id`           — delete todo

## Project structure

```
src/
  app.module.ts          # root module, wires TypeORM + feature modules
  main.ts                # bootstrap, CORS, listens on PORT
  auth/                  # signIn, JWT issuance, AuthGuard
  user/                  # registration with bcrypt, CRUD
  todo/                  # per-user todos, CRUD
test/                    # e2e tests
```

Feature modules follow the standard Nest pattern: `*.module.ts` wires `*.controller.ts` (HTTP) and `*.service.ts` (business logic). Unit tests (`*.spec.ts`) live alongside source files; e2e tests live in `test/`.

## Testing

```bash
npm run test           # unit tests
npm run test:watch     # unit tests in watch mode
npm run test:cov       # unit tests with coverage
npm run test:e2e       # e2e tests
npx jest path/to/file  # single test file
```

### Unit testing notes

Services in this project depend on injected providers (TypeORM repositories, `JwtService`, other services). In unit tests, **mock every injected dependency** in the test module:

```ts
providers: [
  UserService,
  { provide: getRepositoryToken(User), useValue: userRepositoryMock },
]
```

For services that depend on other services, mock the service with `{ provide: UserService, useValue: { findOneByEmail: jest.fn() } }`. See [src/auth/auth.service.spec.ts](src/auth/auth.service.spec.ts) for a worked example.

**bcrypt gotcha:** `jest.spyOn(bcrypt, 'compare')` fails because its exports aren't configurable. Use:

```ts
jest.mock('bcrypt');
const bcryptCompare = bcrypt.compare as jest.Mock;
bcryptCompare.mockResolvedValue(true);
```

### What to test (priority order)

1. **`AuthService`** — sign-in happy path, unknown email, wrong password (same error message in both failure cases).
2. **`AuthGuard`** — no header, malformed header, valid token attaches `request.user`, invalid token throws `UnauthorizedException`.
3. **`UserService.create`** — duplicate email rejection, password is hashed (never stored plaintext).
4. **`TodoService`** — `create`/`findByUserId` guard against missing user; pass-through methods get one "calls the repo with right args" test each.
5. **Controllers** — one forwarding test each; they're thin.

Skip unit tests for DTOs, entities, and modules — DTOs are exercised by e2e validation tests, entities have no logic, modules are wiring.

## Linting & formatting

```bash
npm run lint           # ESLint with auto-fix
npm run format         # Prettier
```

ESLint config ([eslint.config.mjs](eslint.config.mjs)) uses `typescript-eslint` with type-checked rules. Notable: `no-explicit-any` is off, `no-floating-promises` is a warning, Prettier violations are errors.

## Known issues / follow-ups

- `AuthService` throws plain `Error` on bad credentials → produces HTTP 500 instead of 401. Should throw `UnauthorizedException`.
- No global `ValidationPipe` in `main.ts`, so DTO validators (`@IsEmail`, etc.) aren't enforced. Register `app.useGlobalPipes(new ValidationPipe())` to fix.
- `TodoController` has no `AuthGuard` and no ownership checks — any client can read/modify any user's todos.
- `TypeOrmModule` uses `synchronize: true` — replace with migrations before production.
