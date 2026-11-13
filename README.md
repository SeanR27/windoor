# Windoor

This is the architecture-only starting point for a modular monolithic application. It is intentionally not runnable yet: no UI components, API endpoints, ORM models, or business logic have been implemented.

## Architecture at a glance

```text
Windoor/
├── backend/                 # One deployable FastAPI application
│   ├── app/
│   │   ├── api/             # API composition and shared request wiring
│   │   ├── core/            # Configuration and database infrastructure
│   │   ├── db/              # SQLAlchemy declarative base and shared ORM pieces
│   │   ├── modules/         # Domain modules with vertical feature boundaries
│   │   └── shared/          # Small cross-cutting utilities only
│   ├── migrations/          # Alembic revisions for SQLite schema changes
│   └── tests/               # Backend tests, organized by module
├── frontend/                # One React/Vite application
│   ├── src/
│   │   ├── app/             # App shell, providers, and routing
│   │   ├── features/        # Domain-owned UI, queries, and API calls
│   │   ├── components/      # Reusable presentation primitives
│   │   ├── lib/             # Framework adapters and shared clients
│   │   └── styles/          # Tailwind entry point and global tokens
│   └── public/              # Static files
└── docs/                    # Architecture decisions and conventions
```

## Modular-monolith rules

1. The backend remains one FastAPI process and the frontend remains one React application.
2. Domain work belongs in a feature module. A feature owns its API contract, validation, business logic, persistence adapter, and UI-facing hooks.
3. The backend dependency direction is `api -> service -> repository -> SQLAlchemy`. The frontend direction is `route/component -> query hook -> feature API -> shared HTTP client`.
4. Modules should not reach into another module's repository or private UI components. Cross-module behavior should be coordinated through an explicit service or shared contract.
5. Shared folders contain generic infrastructure only. Feature-specific code should stay with its feature.

## Domain modules

- `players`: player records and player-related statistics.
- `opponents`: clubs and teams that Windoor competes against.
- `schedule`: competition weeks and scheduling information.
- `matches`: match records linking players, opponents, courts, and results.

The original app's `Week`, `Player`, `Opponent`, and `Match` concepts are retained, but persistence details are intentionally left open for the redesign.

## Technology notes

- Backend: FastAPI, SQLAlchemy, Alembic, and SQLite.
- Frontend: React, Vite, Tailwind CSS, TanStack Query, TanStack Table, and React Router.
- TanStack Query handles server-state caching. TanStack Table is reserved for tabular UI that you build later.

SQLite is configured through `DATABASE_URL` in `backend/.env`. The default is a local file at `backend/data/windoor.db`; that database file is ignored by Git.

## Intended first implementation steps

1. Implement configuration and database/session creation in `backend/app/core`.
2. Build one backend module end-to-end before copying the pattern to the others.
3. Configure the app composition root and FEATURE routers.
4. Configure frontend providers, routing, and the shared HTTP client.
5. Build one frontend feature slice and only then extract genuinely reusable UI.
6. Add Alembic revisions and tests alongside each completed module.

## Comment convention

Every source/configuration file contains short comments explaining its role or an explicit placeholder marker. Standard JSON does not support comments, so `package.json` uses an underscore metadata field and this README to explain its purpose.
