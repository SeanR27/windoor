# 04: Exact-number and UTC column types

**What to build:** Shared column types that make ADR-004's exact arithmetic and the "store UTC" rule hold at the database boundary. SQLite can't silently turn a deadline into a naive datetime, and a PPG snapshot fraction (Phase 3) round-trips exactly. Also add the bookkeeping timestamp mixin every table will use. Part of spec `.scratch/phase-0-foundations/spec.md`.

**Blocked by:** 02 (Health endpoint over a correctly configured SQLite database)

**Status:** ready-for-agent

- [ ] `UtcDateTime` rejects naive datetimes on write with a clear error, converts aware non-UTC values to UTC, and returns aware UTC values on read.
- [ ] An exact-fraction composite: a `Fraction` subclass usable with SQLAlchemy `composite()`, plus a helper that declares paired `<name>_num`/`<name>_den` integer columns and `CHECK (<name>_den > 0)`. Values are stored normalized. A `None` value stores both columns as NULL and reads back as `None`.
- [ ] Power (`power_q`) and Team Points (`points_h`) remain plain integer columns. No QuarterPoints/HalfPoints types are added.
- [ ] A timestamp mixin adds `created_at` and `updated_at` (`UtcDateTime`, database `CURRENT_TIMESTAMP` defaults). A one-line comment states they are bookkeeping, and that league rules must use Clock-sourced instants.
- [ ] Tests on a test-only table (created with `metadata.create_all` on a temp SQLite file through the core engine factory):
  - UTC: an aware UTC value round-trips, a naive value is rejected, and a non-UTC aware value is returned as the same instant in UTC.
  - Fraction: 10/3 round-trips exactly, 6/4 is stored and returned as 3/2, `None` corresponds to both columns NULL, and a raw insert with den ≤ 0 violates the CHECK.
  - Mixin: `created_at` is populated on insert and returned as aware UTC.
- [ ] ARCHITECTURE §2.1: `db/` lists `UtcDateTime` and the exact Fraction composite, and drops QuarterPoints/HalfPoints.
- [ ] DATA_MODEL conventions: `ppg_snapshot` is stored as `ppg_snapshot_num`/`ppg_snapshot_den` with den > 0, and `created_at`/`updated_at` are DB-defaulted bookkeeping never used by rules.
- [ ] `ruff check .`, `ruff format --check .` and `pytest` pass.
