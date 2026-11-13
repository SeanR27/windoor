# Frontend features

<!-- Each folder is a vertical slice owned by one domain. -->

Features keep their route declarations, HTTP calls, TanStack Query hooks, types, and domain components together. Shared primitives may be imported, but one feature should not reach into another feature's component internals.

The starter domains mirror the backend: `players`, `opponents`, `schedule`, and `matches`. The files are comment-only placeholders so the redesign can determine the actual contracts and visuals.
