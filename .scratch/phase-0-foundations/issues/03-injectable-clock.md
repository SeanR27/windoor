# 03: Injectable Clock

**What to build:** A single source of "now", so domain and service code never call `datetime.now()`, and every deadline test can pin time. API tests get a fixed clock by overriding one dependency, and scripts (such as the Phase 4 simulated Season) can step through time. Part of spec `.scratch/phase-0-foundations/spec.md`.

**Blocked by:** 02 (Health endpoint over a correctly configured SQLite database)

**Status:** ready-for-agent

- [ ] A `Clock` protocol exposes `now()`, which always returns an aware UTC `datetime`.
- [ ] `SystemClock` returns the current UTC instant.
- [ ] `FixedClock` lives in core (not only in tests). It is constructed with an aware instant, and supports `set(instant)` and `advance(timedelta)`.
- [ ] A `get_clock` FastAPI dependency returns the system clock by default.
- [ ] The shared app test fixture overrides `get_clock` with a `FixedClock` pinned to a known instant, and exposes that clock to tests.
- [ ] Tests: `FixedClock` returns the instant it was given, and `advance` and `set` move it. `SystemClock.now()` is timezone-aware UTC. Through the app, the override is the clock a dependency receives.
- [ ] `ruff check .`, `ruff format --check .` and `pytest` pass.
