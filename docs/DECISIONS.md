# Decisions

Architecture Decision Records, numbered and append-only. Don't rewrite an accepted decision. Supersede it with a new entry and mark the old one `Superseded by ADR-n`.

Each entry has a status, context, the decision, the alternatives considered, and consequences.

---

## ADR-001: Modular monolith

**Status:** Accepted (2026-11-23)

**Context:** A small league application (a few hundred users) with many tightly related domains (rosters, lineups, results, power) and a small development team.

**Decision:** One FastAPI backend process and one React build. Domains are separated as modules with explicit public service interfaces inside that process.

**Alternatives:**
- Microservices: operational overhead, plus distributed transactions across lineups, results and power, for no benefit at this scale.
- An unstructured monolith: fast at first, but the league rules would become tangled.

**Consequences:** One deploy and one database transaction boundary. Module discipline (no cross-module repository imports) must be enforced by convention and review.

---

## ADR-002: SQLite as the production database

**Status:** Accepted (2026-11-23)

**Context:** The scale is a few divisions × about 10 teams × about 10–14 players. Writes are bursty around match nights and low otherwise.

**Decision:** SQLite in WAL mode is the production database, on a single host, accessed only through SQLAlchemy, with Alembic migrations.

**Alternatives:** Postgres. It handles concurrency and tooling better, but needs a server to run, patch and back up, and that is over-engineering for this load.

**Consequences:**
- Only a single application instance can be run, with no horizontal scaling.
- Backups need an explicit mechanism (OQ-10).
- Repositories must avoid SQLite-specific SQL so that a later move to Postgres is a driver and migration change.

---

## ADR-003: Power Ledger as the source of truth for Power and PPG

**Status:** Accepted (2026-11-23)

**Context:** PPG drives lineup validity, so it must be exact, explainable and correctable. Scores can be submitted by either team, disputed and corrected. The spec demands no double-counting and traceable corrections.

**Decision:**
- Every Power change is an append-only `PowerLedgerEntry` (an award, a reversal or an adjustment).
- Total Power, Appearances and PPG are always derived from the ledger and never stored as editable totals.
- Awards are keyed by (player, team match, score revision). A score correction reverses the prior revision's awards and writes new ones.
- Administrators correct Power only through `adjustment` entries with a reason.

**Alternatives:**
- Mutable totals on the player: simple, but they can't be explained or safely corrected, and are prone to double-awarding.
- Full recomputation from match history without a ledger: a correct result, but admin adjustments and an "explain this PPG" view have nowhere to live.

**Consequences:** Idempotency is structural, via a unique key. Reads need aggregation, which is trivial at this scale and can be cached if needed. Admins can never type in a PPG directly.

---

## ADR-004: Exact integer arithmetic for Power, Points and PPG

**Status:** Accepted (2026-11-23); Starting PPG storage superseded by ADR-011

**Context:** The court-ordering rule is a *strict* inequality on sums of averages, and equal values are invalid. With floating-point, two equal Combined PPGs can compare as unequal, or the reverse.

**Decision:**
- Power is stored as integer quarter-points, Team Points as integer half-points, and Starting PPG as integer thousandths.
- PPG and Combined PPG are computed as exact rationals (`fractions.Fraction`).
- Rounding happens only for display.

**Alternatives:** Floats with an epsilon, which is arbitrary and could wrongly accept or reject a lineup. Decimal with fixed precision, which still rounds averages such as 10/3.

**Consequences:** Custom SQLAlchemy column types are needed. Lineup snapshots store PPG as a numerator/denominator pair.

---

## ADR-005: All league rules run on the backend, including live planner validation

**Status:** Accepted (2026-11-23)

**Context:** The planner needs real-time feedback, but duplicating rules in React risks the two implementations disagreeing.

**Decision:** The frontend contains no rule logic. The planner calls a backend validate endpoint, debounced, on each change and renders the returned findings. Lock and save re-validate on the server.

**Alternatives:**
- Duplicating the rules in TypeScript: instant feedback, but two sources of truth.
- A shared rules package (e.g. WASM or a code generator): heavy for this project.

**Consequences:** Feedback in the planner has a small network delay, which is acceptable. A future contributor must resist adding a "quick check" in the UI.

---

## ADR-006: Lineup validity uses a PPG snapshot at lock, gated on the Preceding Team Match

**Status:** Accepted (2026-11-23); the gate is widened to all earlier Team Matches by ADR-013

**Context:**
- PPG changes as results arrive, and results can arrive late, be rescheduled out of order, or be corrected.
- A lineup must be judged against up-to-date PPG, but must not flip from valid to invalid after the fact.

**Decision:**
- A Lineup is `validity_unknown`, and can't be locked, until the Team's Preceding Team Match (by current scheduled date) has final Power for that Team's Players.
- On lock, each Player's PPG and Assigned Court are snapshotted. Validity is judged on that snapshot permanently, and later corrections never re-open it.
- Captains can't lock an invalid Lineup. Violations are recorded by Administrators based on what was actually played (a Lineup Violation).

**Alternatives:**
- Validating against whatever PPG exists at lock time: allows locking on stale PPG.
- Re-validating locked lineups when PPG changes: retroactive invalidation is unfair and confusing.

**Consequences:** A late or unclassified result blocks the next week's lock, and this is by design. The admin work queues (missing Lineups, Courts needing classification) are therefore critical to keeping the season flowing.

---

## ADR-007: First submission wins; either team may submit scores

**Status:** Accepted (2026-11-23)

**Context:** The spec makes the host team responsible for entering scores, but a missing or slow host shouldn't block results, and the league runs on an honour system.

**Decision:**
- A Captain of either team may submit.
- The first submission becomes the official score and takes effect immediately.
- The other team can confirm it or report a different score. A different score opens a Score Discrepancy for an Administrator, and the official score stays in effect meanwhile.
- Captains can't edit after submitting. The home team remains responsible for reporting (the overdue flags target it).

**Alternatives:**
- Host-only entry (the original spec): a single point of failure.
- Blind double entry: a stronger check, but more captain work and fewer completed submissions.
- Freezing results until both teams agree: stalls standings and the next week's lineup validity.

**Consequences:** Corrections flow through score revisions and ledger reversals (ADR-003). The admin dashboard needs a discrepancy queue.

---

## ADR-008: Server-side cookie sessions with manually shared activation and reset links

**Status:** Accepted (2026-11-23)

**Context:** The app is a browser-only SPA served from the same origin as the API. There is no email infrastructure in v1.

**Decision:**
- Sessions are opaque tokens in an HttpOnly, Secure, SameSite cookie, stored hashed server-side, with CSRF protection.
- A Captain or Admin generates single-use, expiring activation links and shares them manually. Admins do the same for reset links.

**Alternatives:**
- JWTs in localStorage: exposed to XSS and hard to revoke.
- Email-based activation: requires a mail provider and deliverability work. It can be added later.

**Consequences:** Sessions can be revoked instantly. Onboarding involves a manual step for captains until email lands (Roadmap Phase 6).

---

## ADR-009: TypeScript and React Router on the frontend

**Status:** Accepted (2026-11-23)

**Context:** The original spec said "React JS" and left the TanStack packages open. The scaffold already had React Router, TanStack Query and TanStack Table, in plain JavaScript, with no code written yet.

**Decision:** Switch to TypeScript now. Keep React Router for routing, with TanStack Query for server state and TanStack Table for tables. Generate API types from the backend's OpenAPI schema.

**Alternatives:**
- Staying on JavaScript: cheaper today, but weaker contracts for the planner and the API.
- TanStack Router: good typing, but churn against the existing scaffold for little gain.

**Consequences:** A typecheck step is needed in the build and in agent workflows.

---

## ADR-010: Rosters and PPG are scoped per Season

**Status:** Accepted (2026-11-23); Starting PPG parts superseded by ADR-011

**Context:** Teams persist across seasons, but players may change teams between seasons, and the league resets PPG each season.

**Decision:**
- Team membership, Captaincy, Assigned Court and Starting PPG live on a `SeasonRosterEntry` (player × team × season).
- The Power Ledger is partitioned by Season.
- Each Season starts with an admin-set Starting PPG per player, pre-filled from last Season's final PPG, which applies until the player's first Appearance.

**Alternatives:**
- A permanent player-to-team link: loses history when a player moves teams.
- Career-long PPG: rejected by the league.

**Consequences:** Every query about "the team's players" needs a Season. Season activation must check that every roster entry has a Starting PPG and that each Team has exactly two Captains.

---

## ADR-011: Starting PPG is the Assigned Court

**Status:** Accepted (2026-11-23). Supersedes the Starting PPG parts of ADR-010 (admin-set, pre-filled from last Season, checked at activation) and of ADR-004 (stored in thousandths).

**Context:** The league defined Starting PPG as the Player's Assigned Court number, and replaced the multiplier Power formula with win = *c*, tie = *c* + 0.25, loss = *c* + 0.5.

**Decision:**
- Starting PPG is derived from the Player's current Assigned Court. It is not stored, entered, or overridden.
- Nothing carries over from a previous Season.
- It applies only while the Player has zero Appearances in the Season (PWR-04).

**Alternatives:**
- Admin-set Starting PPG pre-filled from last Season's final PPG (ADR-010): more flexible, but it needs manual entry, an audit trail, and an activation check, and the league rejected it.

**Consequences:** `SeasonRosterEntry.starting_ppg_m` and `Season.starting_ppg_rule` are dropped, along with the Starting PPG admin screen, permission, audit item, and activation check. An Assigned-Court change before a Player's first Appearance changes their PPG. Locked Lineups are unaffected because they snapshot PPG (LIN-19).

## ADR-012: Movement Exceptions are declared by the Captain, not verified by the app

**Status:** Accepted (2026-11-23).

**Context:** The league lets a Player move more than one Court, or outside their Assigned Court's range, "when there is no other available option" (LIN-27, LIN-28). Whether that condition holds depends on who actually turned up. Availability is only advisory and defaults to `no_response` (AVL-06), so the app can't know it.

**Decision:** A Captain declares a Movement Exception per Player with a required reason. The backend accepts the declaration and lifts LIN-04 and LIN-25 for that Player, while still enforcing LIN-05 and LIN-26. The declaration is snapshotted on lock and audited. Abuse is handled afterwards: an Administrator can record a Lineup Violation (PEN-01).

**Alternatives:**
- The backend searches the `available` Players and allows the exception only when no Lineup that follows every rule exists. This was rejected: it depends on Availability being reliable, and it would block Lineups the league considers legal.
- An Administrator approves each exception before lock. This was rejected: it adds a step on match day, when Administrators may not be reachable.

**Consequences:** `LineupSlot.movement_exception_reason` marks an exception. Validity no longer proves that a Lineup followed the spirit of the movement rules, only that every exception was declared. Enforcement depends on Administrators reviewing exceptions.

## ADR-013: Lineup validity is gated on every earlier Team Match, not only the Preceding one

**Status:** Accepted (2026-11-23). Supersedes the gate in ADR-006.

**Context:** A missing Lineup doesn't block scoring (SUB-02). The score is stored per Set per Court, but no Players are mapped to those Courts, so that Team's Power waits (CRS-03). ADR-006 checked only the Preceding Team Match. So a Lineup still missing from two weeks ago went unnoticed: that Team's PPGs were stale, and the movement limit (LIN-25) had no Court to measure from.

**Decision:** A Lineup is `validity_unknown` while any of the Team's earlier Team Matches in the Season lacks final Power for that Team (LIN-07). Only the Team with the gap is blocked, and only from locking. Drafts, Availability, scoring, and the opponent's Power continue.

**Alternatives:**
- Block score submission until both Lineups exist: one Team's mistake would freeze the other Team's points and Power.
- Keep checking only the Preceding Team Match: allows locking on stale PPG and an unknown previous Court.

**Consequences:** If an Administrator doesn't enter a missing Lineup before the Team's next start time, that Team can't lock again, and the gap carries forward until an Administrator acts (LIN-21). The missing-Lineup work queue (DSH-03) must be watched every week.
