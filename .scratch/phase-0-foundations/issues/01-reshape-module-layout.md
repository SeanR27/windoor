# 01: Reshape the scaffold to the ARCHITECTURE module layout

**What to build:** Replace the scaffold's obsolete placeholders with the module set from ARCHITECTURE §2.1, so every later slice lands its code in the module the docs describe and nobody builds on concepts the domain doesn't have (there is no `opponents` concept: an opponent is just another Team seen through the visibility policy). Part of spec `.scratch/phase-0-foundations/spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The backend `players`, `opponents` and `matches` module packages are deleted.
- [ ] Backend module packages exist for `identity`, `league`, `teams`, `schedule`, `lineups`, `results`, `power`, `standings` and `audit`, plus a top-level `authz` package. Each one contains only its package init, with a one-line docstring naming its responsibility (taken from ARCHITECTURE §2.1). No placeholder `api`/`service`/`models`/… files.
- [ ] The modules README describes the module internals by pointing to ARCHITECTURE §2.2, instead of listing the old modules.
- [ ] The frontend `opponents` and `matches` feature folders are deleted. The placeholder `.js`/`.jsx` stubs in the remaining feature folders are removed. No new feature folders are created.
- [ ] Every `/api/v1` reference in the scaffold (router docstring, frontend env example) is corrected to `/api`, matching ARCHITECTURE.
- [ ] ROADMAP: "CI runs ruff, pytest, typecheck, and build" is removed from the Phase 0 exit criterion, and "CI (ruff, pytest, typecheck, lint, build, `check:api`)" is added under Phase 6.
- [ ] Every new package imports cleanly, and `ruff check .` and `ruff format --check .` pass in the backend.
