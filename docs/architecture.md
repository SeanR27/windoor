<!-- This document records the decisions that keep the monolith modular. -->

# Architecture decisions

## Deployment shape

Windoor uses a modular monolith rather than microservices. The backend has a single deployable FastAPI process, a single SQLAlchemy engine, and one SQLite database. The frontend has one React build. Modules are boundaries inside those processes, not separately deployed services.

## Backend boundaries

Each backend domain module follows the same internal shape:

```text
modules/<feature>/
├── api.py          # FastAPI routes; HTTP concerns only
├── schemas.py      # Request and response Pydantic contracts
├── service.py      # Business rules and transaction orchestration
├── repository.py   # SQLAlchemy queries for this feature
├── models.py       # SQLAlchemy table mappings owned by this feature
└── __init__.py     # Stable module exports when implementation begins
```

Use `api -> service -> repository -> models`. An API route should not construct SQL directly. A repository should not make HTTP decisions. Services coordinate work and are the sensible place for cross-module operations.

## Frontend boundaries

Each frontend domain module follows this shape:

```text
features/<feature>/
├── api.js          # Typed-by-convention HTTP calls for the feature
├── hooks.js        # TanStack Query hooks and cache behavior
├── types.js        # JSDoc typedefs or future TypeScript contracts
├── routes.jsx      # Feature-owned route declarations
└── components/     # Feature-specific visual components
```

TanStack Query is the server-state layer. TanStack Table is a presentation tool for tables, not a replacement for feature API or validation boundaries. Reusable primitives live in `src/components`; domain concepts do not.

## Cross-module collaboration

Prefer explicit service methods and stable schemas over direct imports of internals. For example, a match service may ask a player service for valid player references, but it should not query the player repository directly. Frontend features may use generic shared components, but should not import another feature's private components.

## SQLite strategy

SQLite stores one local database file for development and simple deployments. SQLAlchemy remains the single ORM abstraction so the persistence layer could later be moved if the application outgrows SQLite. Alembic migrations are the source of truth for schema changes after implementation begins.

SQLite does not enforce all PostgreSQL behaviors. When adding queries, avoid relying on server-specific features, use ordered results explicitly, and enable foreign-key enforcement through SQLAlchemy connection events when the database layer is implemented.

## Testing strategy

Tests should be grouped by feature and layer. Service tests can use an isolated SQLite database; API tests should override dependencies and exercise request/response behavior; frontend tests should focus on feature behavior rather than framework glue. Shared test fixtures belong in `backend/tests` and `frontend/src/tests` once implementation begins.
