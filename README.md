# Windoor

A team-management and league-operations web app for a Women's Winter Indoor Doubles Tennis League. It covers seasons, divisions, rosters, a validated four-court lineup planner, score submission, Power/PPG, standings, and admin tooling.

The code is currently an architecture scaffold. See the roadmap for build order.

## Documentation

| Document | Answers |
|---|---|
| [docs/PROJECT_VISION.md](docs/PROJECT_VISION.md) | What are we building and why? |
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | What must the application do? |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How is the system structured? |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | What data exists and how is it related? |
| [docs/ROADMAP.md](docs/ROADMAP.md) | What gets built, and in what order? |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Why were important technical decisions made? |
| [GLOSSARY.md](GLOSSARY.md) | What do the domain terms mean? |
| [AGENTS.md](AGENTS.md) | How should AI coding agents work here? |

## Stack

- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, Alembic, SQLite (WAL)
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, TanStack Table

## Layout

```text
backend/    FastAPI modular monolith (app/modules/<domain>/)
frontend/   React SPA (src/features/<domain>/)
docs/       Product and engineering documentation
```
