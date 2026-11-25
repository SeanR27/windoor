# 02: Health endpoint over a correctly configured SQLite database

**What to build:** A running backend that an operator can health-check. `GET /api/health` proves the app can reach a SQLite database configured for WAL, enforced foreign keys, a busy timeout and `BEGIN IMMEDIATE` transactions, with the schema managed by Alembic. It also establishes the one transaction behaviour, and the test fixture, that every later slice reuses. Part of spec `.scratch/phase-0-foundations/spec.md`.

**Blocked by:** 01 (Reshape the scaffold to the ARCHITECTURE module layout)

**Status:** ready-for-agent

- [ ] Settings are loaded from the environment with pydantic-settings, with one field, `DATABASE_URL`. The backend env example is updated (`FRONTEND_ORIGIN` is removed in ticket 05).
- [ ] Every new connection sets `journal_mode=WAL`, `foreign_keys=ON`, `busy_timeout=5000` and `synchronous=NORMAL`.
- [ ] The pysqlite driver's own transaction handling is disabled, and every transaction begins with `BEGIN IMMEDIATE` (the SQLAlchemy-documented pysqlite recipe).
- [ ] Sessions use sync SQLAlchemy with `expire_on_commit=False`.
- [ ] A `transaction()` context manager yields a session, commits on normal exit and rolls back on any exception. The request-scoped DB dependency wraps it, and services never commit.
- [ ] A `create_app()` factory builds the app and mounts one aggregate router under `/api`. No CORS middleware.
- [ ] `GET /api/health` runs `SELECT 1` through the engine and returns 200 `{"status": "ok"}`.
- [ ] The declarative `Base` metadata has a constraint naming convention (index, unique, check, foreign key, primary key).
- [ ] The Alembic environment reads the URL from settings (the hard-coded URL is removed from the Alembic config), targets `Base.metadata`, and uses `render_as_batch=True`. An empty baseline revision exists, and `alembic upgrade head` succeeds on a fresh file.
- [ ] Test fixture: a template database is migrated once per test session with `alembic upgrade head`, then copied to a fresh temp file per test. The app fixture overrides `DATABASE_URL` to point at it.
- [ ] Tests, through the app factory: health returns `{"status": "ok"}`. A connection from the app's engine reports `journal_mode=wal`, `foreign_keys=1`, `busy_timeout=5000` and `synchronous=1`. A write inside `transaction()` persists, and a write followed by a raised exception does not.
- [ ] DECISIONS: ADR-014 "BEGIN IMMEDIATE on every SQLite transaction" is added, with its context, the decision, the alternatives (deferred BEGIN with accepted lock errors; IMMEDIATE only for write sessions, which needs two session factories) and its consequences (all transactions serialize, which is negligible at this scale).
- [ ] ARCHITECTURE §2.8 lists the full pragma set, references ADR-014, and states that the transaction is request-scoped.
- [ ] `ruff check .`, `ruff format --check .` and `pytest` pass.
