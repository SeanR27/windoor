# Windoor frontend

<!-- This package is a React/Vite composition root plus isolated feature slices. -->

The frontend is intentionally an empty shell. It has dependency and build configuration, but no visible UI, route content, data fetching, or domain components yet.

## Intended stack

- React and React DOM for the view layer.
- Vite for development and production builds.
- Tailwind CSS through the Vite plugin.
- TanStack Query for server state and caching.
- TanStack Table for composing data tables after the design is decided.
- React Router for application routing.

## Source layout

```text
src/
├── app/          # Providers, routing, and future application shell
├── features/     # Domain modules: players, opponents, schedule, matches
├── components/   # Generic reusable UI, not domain-owned screens
├── lib/          # HTTP, query, and table adapters
├── styles/       # Tailwind entry point and future global tokens
└── tests/        # Shared frontend test setup and test utilities
```

## Recommended implementation order

1. Wire providers in `src/app/providers`.
2. Configure the route tree in `src/app/router`.
3. Implement the shared HTTP client in `src/lib/api`.
4. Build one feature's API, hooks, and components end-to-end.
5. Add TanStack Table utilities only when a real table needs them.
6. Extract reusable UI into `src/components` after repeated use is proven.

## Environment

Copy `.env.example` to `.env` when adding local frontend configuration. Vite exposes only variables prefixed with `VITE_` to browser code.

## Comment note

Standard JSON cannot contain comments. `package.json` therefore includes an underscore metadata field explaining its purpose; all other generated files use their native comment syntax.
