# Application shell

<!-- This folder owns app-wide composition, not domain behavior. -->

Use `providers` for TanStack Query and future app-wide context, `router` for the route tree, and `layout` for persistent shells that appear around routed pages. Avoid putting domain calculations or feature-specific fetch logic here.
