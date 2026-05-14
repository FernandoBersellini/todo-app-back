# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start:dev      # run in watch mode (development)
npm run build          # compile to dist/
npm run start:prod     # run compiled output

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

The app listens on `PORT` env var, defaulting to `3000`.

## Architecture

NestJS 11 application using the standard module/controller/service pattern:

- **Modules** (`*.module.ts`) — declare and wire together controllers and providers
- **Controllers** (`*.controller.ts`) — define HTTP routes via decorators (`@Get`, `@Post`, etc.)
- **Services** (`*.injectable.ts` / `*.service.ts`) — business logic, injected via constructor DI

`AppModule` in [src/app.module.ts](src/app.module.ts) is the root module imported by `main.ts`. New feature modules should be imported there.

Unit tests live alongside source files (`*.spec.ts`); e2e tests live in [test/](test/).

## Linting & formatting

ESLint config ([eslint.config.mjs](eslint.config.mjs)) uses `typescript-eslint` with type-checked rules and Prettier integration. Notable rule overrides:
- `@typescript-eslint/no-explicit-any` — off
- `@typescript-eslint/no-floating-promises` — warn
- `prettier/prettier` — error, `endOfLine: auto`
