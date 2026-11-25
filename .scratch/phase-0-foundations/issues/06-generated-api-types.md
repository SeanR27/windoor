# 06: Generated API types with a drift check

**What to build:** The frontend's API contract is generated from the backend's OpenAPI schema and committed, so contract changes show up as reviewable diffs, the frontend builds without Python, and a stale contract is caught by a single command, since there is no CI. Part of spec `.scratch/phase-0-foundations/spec.md`.

**Blocked by:** 02 (Health endpoint over a correctly configured SQLite database), 05 (TypeScript frontend with typecheck and lint)

**Status:** ready-for-agent

- [ ] A backend module command (`python -m app.openapi`) writes the app's OpenAPI schema as JSON into the frontend's API library folder, without starting a server. The JSON is committed.
- [ ] The `gen:api` npm script runs `openapi-typescript` (new dev dependency, named in the summary) on the committed JSON, producing committed TypeScript types. It never invokes Python.
- [ ] The generated types include the `GET /api/health` route and its response.
- [ ] The `check:api` npm script re-dumps the JSON (with the backend venv active), regenerates the types, and exits non-zero if either file differs from the committed version.
- [ ] Verified: changing the health response without regenerating makes `check:api` fail, and regenerating makes it pass.
- [ ] AGENTS.md commands list the `python -m app.openapi` step and `npm run check:api`, noting that `check:api` needs the repo-root `.venv` active.
- [ ] `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:api` and backend `pytest` pass.
