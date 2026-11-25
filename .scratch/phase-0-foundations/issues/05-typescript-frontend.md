# 05: TypeScript frontend with typecheck and lint

**What to build:** A strict TypeScript frontend (ADR-009) that typechecks, lints and builds, and runs same-origin with the backend in dev through a Vite proxy, so cookies and CSRF later need no CORS. Part of spec `.scratch/phase-0-foundations/spec.md`.

**Blocked by:** 01 (Reshape the scaffold to the ARCHITECTURE module layout)

**Status:** ready-for-agent

- [ ] One `tsconfig` with `strict` and `noUncheckedIndexedAccess` (no project references).
- [ ] The Vite config is TypeScript and proxies `/api` to `http://localhost:8000` in dev.
- [ ] The entry point is TypeScript and renders a placeholder `App` (a heading only, no providers, router or QueryClient). The HTTP client module is an empty TypeScript export.
- [ ] ESLint uses the Vite-template flat config (`@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`). No Prettier.
- [ ] npm scripts: `typecheck` (`tsc --noEmit`) and `lint`.
- [ ] `FRONTEND_ORIGIN` is removed from the backend env example, and `VITE_API_URL` from the frontend env example. Frontend code will call the relative `/api`.
- [ ] New dev dependencies (`typescript`, `@types/react`, `@types/react-dom`, `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`) are named in the implementer's summary, per AGENTS.md.
- [ ] ARCHITECTURE §1 and §3.4: dev runs same-origin through the Vite proxy, with no CORS.
- [ ] AGENTS.md commands: the "added in Roadmap Phase 0" notes on `typecheck` and `lint` are removed.
- [ ] `npm install`, `npm run typecheck`, `npm run lint` and `npm run build` pass.
