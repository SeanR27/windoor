# Windoor backend

<!-- This package is a FastAPI composition root plus isolated domain modules. -->

The backend is one FastAPI application. It intentionally contains no app instance, routes, ORM models, or database implementation yet.

## Intended dependencies

Runtime dependencies are declared in `pyproject.toml`: FastAPI, Uvicorn, SQLAlchemy, Alembic, Pydantic settings, and HTTP tooling for tests. SQLite support comes from Python's standard library, so no PostgreSQL driver is needed.

## Recommended implementation order

1. Build `app/core/config.py` to read `DATABASE_URL`.
2. Build `app/core/database.py` to create the SQLAlchemy engine and session factory.
3. Add the declarative base in `app/db/base.py`.
4. Implement one domain module from API schema through repository.
5. Compose feature routers in `app/api/router.py`.
6. Create the FastAPI instance in `app/main.py`.
7. Add an Alembic environment and the first migration.

## Environment

Copy `.env.example` to `.env` before running the future application. The default SQLite URL is relative to this `backend` directory: `sqlite:///./data/windoor.db`.

## Placeholder policy

Every `.py` file currently contains comments only. This preserves the intended file boundaries without preselecting domain fields, validation rules, or endpoint behavior that you plan to redesign.
