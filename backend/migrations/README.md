# Database migrations

<!-- Alembic migrations will track every intentional SQLite schema change. -->

This directory is the Alembic migration root configured by `backend/alembic.ini`. The environment module and revisions are intentionally not implemented yet.

When the SQLAlchemy models are ready, create `migrations/env.py` and link Alembic metadata to the shared declarative base. Generate a revision after each accepted model change, then test upgrades against a fresh SQLite database.
