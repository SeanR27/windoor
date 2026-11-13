# Backend domain modules

<!-- Modules are vertical slices inside the single FastAPI application. -->

Each module owns its transport contract, business rules, persistence queries, and table mappings. This structure keeps the monolith modular without adding service deployment overhead.

## Dependency rule

```text
api.py -> service.py -> repository.py -> models.py
```

Do not place SQL in `api.py`, HTTP details in repositories, or unrelated domain rules in shared utilities. Cross-module collaboration should happen through service methods and explicit schemas.

## Starting points

- `players`: player identity and performance data.
- `opponents`: club/team identity and opponent-level information.
- `schedule`: dates and competition-week planning.
- `matches`: relationships among players, courts, results, and competition context.

The files in each module are comment-only placeholders. Their names describe responsibilities, not final content.
