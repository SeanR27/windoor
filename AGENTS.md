# AGENTS.md

Instructions for AI coding agents working in this repository.

## Read first

1. `GLOSSARY.md`: the domain language. Use these exact terms in code, tests, and messages, and avoid the terms each entry lists under *Avoid*. For example, say **Team Match** or **Court Match**, never a bare "match", and use **Appearance**, never "game", for what PPG counts.
2. `docs/REQUIREMENTS.md`: the rules, with stable IDs (`LIN-07`, `PWR-08`, …) and open questions (`OQ-n`).
3. `docs/ARCHITECTURE.md`: module boundaries and layering.
4. `docs/DATA_MODEL.md` and `docs/DECISIONS.md` as needed. `docs/ROADMAP.md` tells you which phase is current.

If code and docs disagree, stop and say so. Don't silently pick one.

## Hard rules

- **Backend is authoritative.** Never put a league rule (eligibility, PPG ordering, scoring, Power, deadlines, permissions) in the frontend. The planner renders backend validation results (ADR-005).
- **Don't invent league policy.** If a behavior depends on an open question (`OQ-n`), implement the documented interim behavior and reference the OQ ID in a comment. If no interim behavior is documented, ask.
- **Exact arithmetic.** Power is stored in integer quarter-points, Team Points in integer half-points, and Starting PPG in integer thousandths. PPG is a `fractions.Fraction`. Never use `float` for these, and never compare PPGs with an epsilon (ADR-004).
- **Append-only tables stay append-only:** `PowerLedgerEntry`, `ScoreRevision`, `SetScore`, `ScoreSubmission`, `PointAdjustment`, `RescheduleEvent`, `AuditEvent`. Corrections are new rows (reversals or revisions).
- **Authorize in services**, through `app/authz` policies, on every operation. Write a test that the operation fails for a user from another Team who supplies a valid ID.
- **Audit inside the transaction.** Every audited change (REQUIREMENTS AUD-01) writes its `AuditEvent` in the same transaction. Admin bypasses and corrections require a `reason`.
- **Time comes from the `Clock`.** Never call `datetime.now()` in domain or service code. Domain functions take `now` as an argument. Store UTC and convert with the league timezone.
- **Module boundaries.** Call other modules only through their `__init__.py` public service functions. Never import another module's `repository` or `models`. Keep `domain.py` free of FastAPI, SQLAlchemy, and I/O.
- **Layering:** `api → service → (domain, repository) → models`. No SQL in `api.py`, and no HTTP concerns below it.

## How to work

- **Test-first for domain rules.** For anything in a `domain.py` (scoring, Power, PPG, lineup validation, Preceding Team Match, deadlines, schedule validation, authorization policies), write the failing test first, make it pass, then refactor. Cover the cases listed in REQUIREMENTS §15.
- Build one vertical slice at a time (domain → service → API → UI → tests), as the roadmap describes.
- Name tests after the behavior and requirement, e.g. `test_lock_rejected_when_validity_unknown__LIN_17`.
- Keep changes scoped to the task. Don't refactor unrelated code or add speculative abstractions.

## Keep the docs current (same change as the code)

| When you… | Update |
|---|---|
| change or add a rule | `docs/REQUIREMENTS.md` (keep IDs stable, and add new IDs at the end of a section) |
| introduce or change a domain term | `GLOSSARY.md` (definitions only, no implementation details) |
| change tables or relationships | `docs/DATA_MODEL.md` and an Alembic migration |
| make a hard-to-reverse, non-obvious trade-off | a new `docs/DECISIONS.md` entry (never rewrite an accepted ADR; supersede it) |
| resolve an open question | the OQ row in REQUIREMENTS §16 and the requirement it affects |
| finish or reorder roadmap work | `docs/ROADMAP.md` |

## Commands

Run these before declaring work done, and report any failures verbatim.

```bash
# Backend (from backend/, using the repo-root .venv)
pip install -e ".[dev]"
ruff check . && ruff format --check .
pytest
alembic upgrade head        # when migrations changed

# Frontend (from frontend/)
npm install
npm run typecheck           # added in Roadmap Phase 0
npm run lint                # added in Roadmap Phase 0
npm run build
```

## Boundaries

- **Never commit or push** unless the user asks. Never rewrite git history.
- **Say so before adding a dependency**, and name it and the reason in your summary.
- Never commit secrets, `.env` files, or the SQLite database (`backend/data/*.db`).
- Never log passwords, session tokens, activation or reset tokens, or cookies.
- Don't collect new personal data fields without a requirement (USR-06).
