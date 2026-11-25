Status: ready-for-agent

# Spec: Phase 0 foundations (module layout, TypeScript frontend, core infrastructure)

Roadmap Phase 0, first three bullets. Decided in a grilling session on 2026-11-24.

## Problem Statement

The repository is a comment-only scaffold. Its backend modules (`players`, `opponents`, `schedule`, `matches`) do not match the module set in ARCHITECTURE §2.1. There is no `opponents` concept in the domain (an opponent is just another Team seen through the visibility policy). The frontend is plain JavaScript, with no type checking, no lint, and no API contract. There is no working settings object, database engine, transaction handling, Clock, exact-number or UTC column types, or Alembic environment.

Every later Phase 0 slice (identity, authz, audit, league) needs these foundations. If each slice invents its own, transactions, time handling and exact arithmetic (ADR-004) will drift. Until they exist, nobody can write the first real vertical slice.

## Solution

Reshape the scaffold into the ARCHITECTURE §2.1 module layout. Convert the frontend to strict TypeScript, with typecheck, lint and generated API types. Build the core infrastructure, proven by a running app and tests:

- One FastAPI app factory serving `GET /api/health`.
- A SQLite engine configured for WAL, foreign keys, a busy timeout and `BEGIN IMMEDIATE` transactions.
- A request-scoped transaction.
- An injectable Clock.
- Shared column types for UTC datetimes and exact fractions.
- An empty baseline Alembic migration.

After this spec, a developer or agent can start the `identity` slice and write only identity code.

## User Stories

1. As a developer, I want the backend module packages to match ARCHITECTURE §2.1 (`identity`, `league`, `teams`, `schedule`, `lineups`, `results`, `power`, `standings`, `audit`), so that code lands in the module the docs describe.
2. As a developer, I want the `players`, `opponents` and `matches` placeholder modules deleted, so that nobody builds on concepts the domain doesn't have.
3. As a developer, I want each module package to contain only a one-line docstring naming its responsibility, so that later slices add files when they need them instead of filling in speculative placeholders.
4. As a developer, I want an `authz` package next to the modules, so that the policy layer has a home before the first policy is written.
5. As a developer, I want the modules README to point to ARCHITECTURE §2.2 instead of listing obsolete modules, so that the docs and the code agree.
6. As a developer, I want an app factory that builds the FastAPI app and mounts one aggregate router under `/api`, so that every module's routes share one composition root.
7. As an operator, I want `GET /api/health` to return `{"status": "ok"}` after it has run a query against the database, so that a health check proves the app can reach its database.
8. As a developer, I want application settings loaded from environment variables (`DATABASE_URL` only, for now), so that configuration isn't hard-coded and secrets stay out of the source tree.
9. As a developer, I want Alembic to read the database URL from the same settings, so that the app and the migrations can never point at different databases.
10. As an operator, I want every SQLite connection to set `journal_mode=WAL`, `foreign_keys=ON`, `busy_timeout=5000` and `synchronous=NORMAL`, so that concurrent match-night traffic doesn't corrupt references or fail on transient locks.
11. As an operator, I want every transaction to start with `BEGIN IMMEDIATE`, so that a request that reads and then writes can't fail with "database is locked" when another write is in progress.
12. As a developer, I want a `transaction()` context manager that commits on success and rolls back on any exception, so that one operation is one transaction and an AuditEvent always commits together with its change.
13. As a developer, I want the HTTP request dependency to wrap that same context manager, so that services never call commit and a failed request leaves no partial writes.
14. As a developer, I want scripts and tests to use the same `transaction()` as HTTP requests, so that there is only one transaction behavior to reason about.
15. As a developer, I want sessions created with `expire_on_commit=False`, so that responses serialized after commit don't trigger lazy reloads outside the transaction.
16. As a developer, I want a `Clock` interface with a `SystemClock` and a `FixedClock`, so that domain and service code never call `datetime.now()` and deadline tests are deterministic.
17. As a developer, I want the Clock provided through an overridable FastAPI dependency, so that API tests can pin "now" without monkeypatching.
18. As a developer writing a simulation or seed script, I want `FixedClock` to live in core (not only in tests) and to be settable and advanceable, so that a simulated Season can step through time.
19. As a developer, I want a `UtcDateTime` column type that rejects naive datetimes, converts other timezones to UTC and returns aware UTC values, so that SQLite's lack of timezone storage can't silently break deadline comparisons.
20. As a developer, I want an exact-fraction composite type stored as numerator and denominator integer columns, normalized, with a CHECK that the denominator is positive, so that PPG snapshots (Phase 3) round-trip exactly as ADR-004 requires.
21. As a developer, I want a fraction value whose two columns are both NULL to read as `None`, so that nullable snapshots (null until lock) need no special handling.
22. As a developer, I want Power (`power_q`) and Team Points (`points_h`) to stay plain integer columns, so that the `_q`/`_h` suffix is the whole contract and there's no hidden conversion layer.
23. As a developer, I want a shared timestamp mixin adding `created_at`/`updated_at` with database defaults, so that every table gets bookkeeping timestamps without boilerplate.
24. As a reviewer, I want the mixin to state that those timestamps are bookkeeping only, so that nobody bases a league rule on them instead of a Clock-sourced instant.
25. As a developer, I want the declarative Base to use a constraint naming convention, so that constraints can be altered later under SQLite batch-mode migrations.
26. As a developer, I want an empty baseline Alembic migration with batch mode enabled, so that the migration environment is proven before the first real table arrives.
27. As a developer, I want `alembic upgrade head` to succeed on a fresh database, so that the migrations are the schema source of truth from day one.
28. As a frontend developer, I want the frontend converted to TypeScript with `strict` and `noUncheckedIndexedAccess`, so that API contracts and planner code are checked at compile time (ADR-009).
29. As a frontend developer, I want a `typecheck` npm script, so that type errors are caught before build and in agent workflows.
30. As a frontend developer, I want a `lint` npm script using the Vite-template ESLint flat config (typescript-eslint, react-hooks, react-refresh), so that hook misuse and common mistakes are flagged.
31. As a frontend developer, I want the Vite config in TypeScript, with a dev proxy that forwards `/api` to the backend, so that dev runs same-origin like production and cookies and CSRF need no CORS.
32. As a developer, I want `FRONTEND_ORIGIN` and `VITE_API_URL` removed, so that no config path exists only in dev.
33. As a frontend developer, I want the entry point to render a placeholder `App`, so that `npm run build` produces a real bundle before the app shell exists.
34. As a frontend developer, I want the `opponents` and `matches` feature folders deleted, and the remaining JS/JSX placeholder stubs removed, so that the features tree contains no obsolete concepts.
35. As a developer, I want a backend command that writes the app's OpenAPI schema to a committed JSON file without starting a server, so that the API contract is a reviewable artifact.
36. As a frontend developer, I want a `gen:api` npm script that turns that JSON into committed TypeScript types, so that the frontend builds without Python and contracts never drift silently.
37. As a reviewer, I want contract changes to show up as diffs in the committed schema and types, so that API changes are visible in review.
38. As a developer or agent, I want a `check:api` npm script that regenerates both files and fails if they differ from what's committed, so that stale types are caught without CI.
39. As an agent, I want `check:api` listed in the AGENTS.md commands to run before declaring work done, so that I keep the generated types current.
40. As a reader of the docs, I want ADR-014 to record the `BEGIN IMMEDIATE` decision and its trade-off, so that nobody "optimizes" it away without knowing why it's there.
41. As a reader of the docs, I want ARCHITECTURE, DATA_MODEL, AGENTS.md and ROADMAP updated in the same change, so that the docs and the code don't disagree.

## Implementation Decisions

**Backend layout**
- The module packages are `identity`, `league`, `teams`, `schedule`, `lineups`, `results`, `power`, `standings`, `audit`, plus a top-level `authz` package. Each one contains only its package init, with a one-line responsibility docstring. Later slices add `api`, `schemas`, `service`, `domain`, `repository` and `models` as needed (ARCHITECTURE §2.2).
- `players`, `opponents` and `matches` are deleted. `schedule` is recreated at the same minimal depth.

**API**
- All routes are mounted under `/api`, with no version segment. The scaffold's references to `/api/v1` (router docstring, frontend env example) are corrected.
- `GET /api/health` runs `SELECT 1` through the engine and returns `{"status": "ok"}`.
- The app is built by a `create_app()` factory, which is the composition root.
- No CORS middleware.

**Settings**
- pydantic-settings, with one field for now: `DATABASE_URL`. Identity adds `SECRET_KEY`, `SESSION_TTL`, etc. in its own slice.
- The Alembic environment reads the URL from settings. The hard-coded URL in the Alembic config is removed.

**Database engine and transactions** (new ADR-014)
- Sync SQLAlchemy. No async driver.
- A connect event on every connection sets `journal_mode=WAL`, `foreign_keys=ON`, `busy_timeout=5000` and `synchronous=NORMAL`.
- The pysqlite driver's own transaction handling is disabled, and every transaction is started with `BEGIN IMMEDIATE`, following the SQLAlchemy-documented recipe for pysqlite. The trade-off: all transactions, reads included, serialize on the write lock. That's negligible at this scale, and in return a read-then-write upgrade can't fail.
- Session factory: `expire_on_commit=False`, autoflush on (the default).
- `transaction()` is a context manager that yields a session inside one transaction, commits on normal exit and rolls back on any exception. The request-scoped DB dependency wraps it. Services receive the session and never call commit or rollback.

**Clock**
- `Clock` is a protocol with `now() -> datetime`, which always returns an aware UTC value.
- `SystemClock` is the production implementation.
- `FixedClock` is constructed with an instant, can be `set` and `advance`d, and lives in core.
- A `get_clock` FastAPI dependency returns the system clock, and tests override it.

**Shared column types and Base**
- `UtcDateTime` is a TypeDecorator. It rejects naive datetimes on write with an error, converts aware non-UTC values to UTC, stores them, and returns aware UTC on read.
- Exact fraction: a `Fraction` subclass that supports SQLAlchemy `composite()`, plus a helper that declares the paired `<name>_num`/`<name>_den` integer columns and a `CHECK (<name>_den > 0)`. Values are normalized on write (6/4 is stored as 3/2). Both columns NULL reads as `None`.
- Power and Team Points stay plain `Integer` columns (`power_q`, `points_h`). ARCHITECTURE §2.1's `QuarterPoints`/`HalfPoints` types are dropped. ADR-004 still holds, because Fraction is the custom type it calls for.
- A timestamp mixin adds `created_at` and `updated_at` with database `CURRENT_TIMESTAMP` defaults (UTC in SQLite), typed as `UtcDateTime`. Its comment states these are bookkeeping, and that league rules use Clock-sourced instants (`locked_at`, `submitted_at`, audit time).
- The declarative `Base` metadata carries a naming convention for indexes, uniques, checks, foreign keys and primary keys.

**Migrations**
- The Alembic environment targets `Base.metadata` with `render_as_batch=True`.
- The first revision is an empty baseline with no tables. Identity's tables come in identity's own migration.

**Frontend**
- TypeScript with `strict` and `noUncheckedIndexedAccess`, in one tsconfig with no project references. `typecheck` runs `tsc --noEmit`.
- The Vite config is TypeScript and proxies `/api` to the local backend in dev. `FRONTEND_ORIGIN` (backend env example) and `VITE_API_URL` (frontend env example) are removed.
- The entry renders a placeholder `App` (a heading). There are no providers, router or QueryClient; those come with the app-shell item. The HTTP client module stays an empty export.
- Lint uses the Vite-template ESLint flat config. There's no Prettier.
- The `opponents` and `matches` features are deleted, and placeholder JS/JSX stubs in the remaining features are removed. No new feature folders are created.
- New dev dependencies: `typescript`, `@types/react`, `@types/react-dom`, `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `openapi-typescript`. No new backend dependencies.

**API types**
- A backend module command (`python -m app.openapi`) writes `app.openapi()` as JSON into the frontend's API library folder. That JSON is committed.
- `gen:api` runs `openapi-typescript` on the committed JSON to produce committed TypeScript types. The frontend never invokes Python for this step.
- `check:api` re-dumps the JSON (it needs the backend venv active), regenerates the types, and fails if either differs from the committed version.

**Doc changes (same change as the code)**
- DECISIONS: new ADR-014 for `BEGIN IMMEDIATE` on every SQLite transaction, with the alternatives (deferred BEGIN with accepted lock errors; IMMEDIATE only for write sessions, which needs two factories).
- ARCHITECTURE §1 and §3.4: dev uses the Vite proxy, same-origin, no CORS.
- ARCHITECTURE §2.1: `db/` lists `UtcDateTime` and the exact Fraction composite, and drops QuarterPoints/HalfPoints.
- ARCHITECTURE §2.8: the full pragma list, `BEGIN IMMEDIATE` → ADR-014, and the request-scoped transaction.
- DATA_MODEL conventions: `ppg_snapshot` is stored as `ppg_snapshot_num`/`ppg_snapshot_den` with den > 0, and `created_at`/`updated_at` are DB-defaulted bookkeeping never used by rules.
- AGENTS.md commands: drop the "added in Roadmap Phase 0" notes, and add `check:api` (plus the `python -m app.openapi` step).
- ROADMAP: remove "CI runs ruff, pytest, typecheck, and build" from the Phase 0 exit, and add "CI (ruff, pytest, typecheck, lint, build, `check:api`)" under Phase 6.
- GLOSSARY: no changes. No domain terms changed.

## Testing Decisions

- **What makes a good test here:** assert observable behavior through the highest available seam (HTTP responses, values read back from a real SQLite file, pragma values reported by a live connection), never internal calls or mock interactions. Test names follow AGENTS.md (behavior, plus a requirement ID where one applies).
- **Seam 1, the app factory (primary).** Build the app with `create_app()`. Override settings so `DATABASE_URL` points at a per-test database, and override `get_clock` with a `FixedClock`.
  - Health: `GET /api/health` returns 200 and `{"status": "ok"}`.
  - Pragmas: a connection from the app's engine reports `journal_mode=wal`, `foreign_keys=1`, `busy_timeout=5000` and `synchronous=1`.
  - Transactions: a write inside `transaction()` is visible afterwards. A write followed by a raised exception is not.
  - Every later slice tests through this seam.
- **Seam 2, column types against a throwaway table (temporary).** No real model uses them yet, so a test-only table is created with `metadata.create_all` on a temp SQLite file.
  - `UtcDateTime`: an aware UTC value round-trips; a naive value is rejected; a non-UTC aware value is stored and returned as the same instant in UTC.
  - Fraction: 10/3 round-trips exactly; 6/4 is stored and returned as 3/2; `None` ↔ both columns NULL; a raw insert with den ≤ 0 violates the CHECK.
  - This seam is retired when Phase 3 gives these types a real model.
- **Clock:** `FixedClock` returns the set instant, and `advance` moves it. `SystemClock.now()` is aware UTC.
- **Migrations:** `alembic upgrade head` succeeds on an empty file (exercised by the fixture).
- **Test database fixture:** migrate a template database once per test session with `alembic upgrade head`, then copy it to a fresh temp file for each test. Real commits and real pragmas, no savepoint rollback tricks.
- **Frontend:** no test runner in this spec. `npm run typecheck`, `npm run lint`, `npm run build` and `npm run check:api` must pass.
- **Prior art:** none; the repo has no tests yet. These tests set the patterns (app fixture, clock override, template-DB copy) that later slices reuse.

## Out of Scope

- CI: moved to Roadmap Phase 6.
- The shared error-response shape (`{code, message, details}`) and its exception handlers: deferred to the first slice that raises a domain error (identity).
- A typed fetch client (`openapi-fetch`) and the HTTP client with cookies and CSRF: deferred to the frontend HTTP-client item.
- The app shell, providers, router, QueryClient and role-aware layout.
- Identity's settings (`SECRET_KEY`, `SESSION_TTL`), tables (`User`, `Session`, `AccountToken`), password hashing, and CSRF.
- `authz` policies, `audit` recording, and `LeagueSettings`.
- Any real table or model.
- A frontend test runner and Prettier.
- Pre-creating the frontend feature folders listed in ARCHITECTURE §3.2.

## Further Notes

- AGENTS.md says to say so before adding a dependency. The frontend dev dependencies listed above were agreed during the grilling session. Implementers must still name them in their summary.
- `check:api` needs the backend virtual environment (repo-root `.venv`) to be active. Document this next to the command.
- The Vite proxy target is the local uvicorn default (`http://localhost:8000`).
- "Session" here means a SQLAlchemy database session. The identity module's user `Session` table is a separate concept, delivered with identity.
