# Architecture

How the system is structured. This document replaces the earlier `docs/architecture.md`. The reasons behind the major choices are in [DECISIONS.md](DECISIONS.md).

## 1. Shape

A **modular monolith** (ADR-001):

- **One backend process.** A FastAPI app with one SQLAlchemy engine and one SQLite database (ADR-002).
- **One frontend build.** A React + TypeScript single-page app built with Vite (ADR-009).
- **Modules are boundaries inside these processes**, not separate services.

```text
Browser (React SPA) ──HTTPS, session cookie──▶ FastAPI app ──SQLAlchemy──▶ SQLite (WAL)
```

In production the FastAPI process serves the API under `/api` and the built SPA as static files, so frontend and API share one origin. That simplifies cookies and CSRF. Hosting is an open question (OQ-9).

## 2. Backend

### 2.1 Layout

```text
backend/
├── app/
│   ├── main.py              # composition root: app factory, routers, middleware
│   ├── api/                 # router aggregation, shared dependencies (current user, db session)
│   ├── core/                # settings (pydantic-settings), database engine/session, clock, security
│   ├── db/                  # declarative Base, shared column types (QuarterPoints, HalfPoints, Fraction)
│   ├── shared/              # generic utilities only (errors, pagination, logging)
│   ├── authz/               # authorization policies, shared by all modules
│   └── modules/
│       ├── identity/        # users, sessions, activation/reset tokens
│       ├── league/          # league settings, seasons, match weeks, divisions, clubs
│       ├── teams/           # teams, captains, season roster entries, assigned courts, starting PPG
│       ├── schedule/        # team matches, schedule generation/validation, rescheduling
│       ├── lineups/         # availability, drafts, validation, lock/exchange, preceding-match logic
│       ├── results/         # score submissions, revisions, discrepancies, court results, violations, adjustments, team points
│       ├── power/           # power ledger, PPG derivation
│       ├── standings/       # standings and statistics (read models)
│       └── audit/           # audit events
├── migrations/              # Alembic
└── tests/                   # mirrors app/modules/<module>/
```

The scaffold's `players`, `opponents`, `schedule`, and `matches` placeholders are replaced by this module set (Roadmap Phase 0). There is no `opponents` module: an opponent is just another Team seen through the visibility policy.

### 2.2 Module internals

```text
modules/<module>/
├── api.py          # FastAPI routes: parse request, call service, map errors. No SQL, no rules.
├── schemas.py      # Pydantic request/response contracts
├── service.py      # Use cases: authorization, transactions, orchestration across modules
├── domain.py       # Pure rules: plain inputs → plain outputs. No I/O, no ORM, no clock.
├── repository.py   # SQLAlchemy queries for this module's tables
├── models.py       # SQLAlchemy mappings owned by this module
└── __init__.py     # Public interface: the service functions other modules may call
```

Dependency direction: `api → service → (domain, repository) → models`. A `domain.py` imports nothing from the framework.

### 2.3 Pure domain services

These hold the league's rules. They are deterministic, test-first (see AGENTS.md), and take everything as arguments, including "now" and PPG values.

| Function (module) | In → Out |
|---|---|
| `eligible_courts(assigned)` (lineups) | 1–4 → set of Courts |
| `validate_lineup(slots, roster, ppgs, preceding_final)` (lineups) | → `valid` / `invalid` / `validity_unknown`, plus per-Court findings with reasons |
| `preceding_team_match(team, match, schedule)` (lineups) | → TeamMatch or none |
| `set_points(set_score)` (results) | → (home_h, away_h) |
| `court_points(sets)` (results) | → (home_h, away_h), max 12 half-points each |
| `classify_court(sets)` (results) | → win / tie / loss / needs_classification |
| `power_for(court, outcome)` (power) | → quarter-points (win 4c, tie 5c, loss 6c) |
| `ppg(entries, starting_ppg)` (power) | → exact `Fraction` |
| `check_deadline(now, deadline, actor_is_admin)` (league) | → allowed / denied(reason) |
| `validate_schedule(teams, matches)` (schedule) | → violations |
| `generate_double_round_robin(teams, weeks)` (schedule) | → proposed matches |

### 2.4 Cross-module collaboration

Modules call each other only through the public service functions exported from `__init__.py`. They never import another module's repository or models.

Key flows:

- **Lineup validation.** `lineups` asks `teams` for roster entries and Assigned Courts, `power` for current PPGs, and `results` for whether the Preceding Team Match has final Power for the Team. Then it runs `validate_lineup`.
- **Result processing** (REQUIREMENTS §8.6). Inside one transaction, `results.record_revision(...)` computes points and Court Results, then calls `power.apply_revision(team_match, revision, appearances)`. That function reverses the previous revision's awards and writes the new ones, idempotent by the unique key. `results` gets the Appearances (who played which Court) from `lineups`.
- **Rescheduling.** `schedule.reschedule(...)` updates the date, records a RescheduleEvent, and calls `lineups.reset_availability(team_match)`.
- **Audit.** Services call `audit.record(...)` inside the same transaction as the change, so an audited change and its audit row commit together.

To avoid import cycles, `power` and `audit` depend on nothing domain-specific. `standings` only reads.

### 2.5 Authorization

- Authorization is checked in **services**, not only routes. Each service function receives the acting user and calls a policy in `app/authz`, e.g. `can_view_lineup(user, lineup)` or `can_edit_roster(user, team, season, now)`.
- Policies decide from role, Season Roster Entry, Captain flag, Admin flag, and resource state (Lineup state, deadlines, CFG-06).
- Resource lookups are scoped: fetch, then authorize, then return **404** when the user may not know the resource exists (another Team's draft) and **403** when they can see it but not act.
- Opponent views use dedicated response schemas that omit private fields. Fields are never stripped from a full schema after the fact.

### 2.6 Time

- A `Clock` dependency provides "now" (UTC). Tests inject a fixed clock, and domain functions take `now` as an argument.
- Deadlines are UTC instants. Local dates and times (match dates, start times) are converted using `LeagueSettings.timezone` via `zoneinfo`.
- Time-dependent state is derived rather than stored where possible. In v1, a `locked` Lineup is treated as `exchanged` once its Team Match's start time has passed, so no scheduler is needed.

### 2.7 Exact arithmetic (ADR-004)

Power is stored in integer quarter-points, Team Points in integer half-points, and Starting PPG in integer thousandths. PPG and Combined PPG are `fractions.Fraction`, so the strict ordering comparison is exact. Values are serialized to the frontend as decimal strings rounded for display, plus exact numerator/denominator where the UI needs comparisons. In practice the UI never compares: the backend does.

### 2.8 Persistence

- SQLite in WAL mode, with `foreign_keys=ON` and a `busy_timeout` set on every connection (SQLAlchemy connect event).
- Every multi-record operation (lock, result processing, corrections, rescheduling) runs in one transaction.
- Alembic migrations are the schema source of truth. Batch mode is used for SQLite `ALTER` limitations.
- Append-only tables (ledger, revisions, audit, submissions) have no update/delete code paths.
- Portability: no SQLite-only SQL in repositories, so moving to Postgres later is a driver and migration change.
- Backups: undecided (OQ-10). They must be in place before go-live, e.g. a scheduled `sqlite3 .backup` or continuous replication off-host.

### 2.9 Authentication (ADR-008)

- Server-side sessions: a random token in an `HttpOnly; Secure; SameSite=Lax` cookie, with its hash stored in `Session`.
- CSRF uses the double-submit token pattern on state-changing requests.
- Passwords are hashed with Argon2id (or bcrypt).
- Activation and reset links carry a random token whose hash is stored in `AccountToken`. They are single-use and expire.

## 3. Frontend

### 3.1 Stack

React with TypeScript, Vite, Tailwind CSS, React Router (routing), TanStack Query (server state), and TanStack Table (tabular UI).

### 3.2 Layout

```text
frontend/src/
├── app/            # shell, providers (QueryClient, auth), router, role-aware layout
├── features/
│   ├── auth/       # sign-in, activation, reset
│   ├── admin/      # admin screens and work queues
│   ├── teams/      # team dashboard, roster, assigned courts
│   ├── schedule/   # schedule views, rescheduling
│   ├── lineups/    # planner, availability
│   ├── results/    # score submission, confirmation/dispute
│   ├── players/    # player profile and history
│   └── standings/
├── components/     # reusable presentation primitives only (no domain concepts)
├── lib/            # HTTP client (cookie + CSRF), query keys, formatting
└── styles/
```

Each feature contains `api.ts` (HTTP calls), `hooks.ts` (TanStack Query hooks), `types.ts` (API contracts), `routes.tsx`, and `components/`. Direction: `route/component → hook → feature api → lib/http`. Features don't import each other's private components.

### 3.3 Rules stay on the server (ADR-005)

The frontend contains **no league rules**. The lineup planner sends the current draft to `POST /api/lineups/{id}/validate` (debounced, about 300 ms) and renders the returned findings, status, Combined PPGs, and warnings (e.g. Availability). Saving a draft and locking both re-validate on the server. The UI may show optimistic placement but never a verdict it computed itself.

Route guards are only for convenience. The backend enforces access (§2.5).

### 3.4 API contract

- REST + JSON under `/api`. Resource paths are nested where ownership matters (`/api/teams/{team_id}/roster`, `/api/team-matches/{id}/lineups/mine`).
- Errors use one shape: `{ "code": "LINEUP_NOT_VALID", "message": "...", "details": {...} }`. Rule violations carry requirement-style codes the UI can map to help text.
- TypeScript types are generated from the FastAPI OpenAPI schema (e.g. `openapi-typescript`), so frontend contracts never drift.

## 4. Testing

- **Domain:** exhaustive unit tests for every `domain.py` function, covering the cases in REQUIREMENTS §15. These are fast and need no database.
- **Service:** run against a temporary SQLite database with the real migrations, covering transactions, idempotency, authorization, and deadlines (with a fixed clock).
- **API:** cover request/response shapes, status codes, and cross-team access attempts by ID.
- **Frontend:** cover feature behavior (planner rendering of server findings, forms) with mocked API responses.

## 5. Observability and operations

- Structured logs (request ID, user ID, route, duration). Never log passwords, tokens, or cookies.
- Health endpoint `/api/health`.
- Configuration comes from environment variables (`DATABASE_URL`, `SECRET_KEY`, `SESSION_TTL`, …) via `app/core/config.py`.
