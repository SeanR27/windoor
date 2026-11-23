# Roadmap

What gets built, and in what order. **Phases 0–4 form the first release**: the minimum needed to run a real Season. Each phase ends with its exit criteria met and its tests green. Requirement IDs refer to [REQUIREMENTS.md](REQUIREMENTS.md).

Within a phase, build one vertical slice end-to-end (domain → service → API → UI → tests) before starting the next one.

---

## Phase 0: Foundations

- Replace the scaffold's `players`, `opponents`, `schedule`, and `matches` placeholders with the module layout in ARCHITECTURE §2.1. Delete `opponents`.
- Convert the frontend to TypeScript. Add `typecheck` and `lint` scripts. Generate API types from OpenAPI.
- Core: settings, the SQLite engine (WAL, foreign keys, busy timeout), sessions, the `Clock`, the exact-number column types (ADR-004), and the first Alembic migration.
- `identity`: users, password hashing, cookie sessions and CSRF, activation/reset links (USR-01–05, SEC-01, SEC-03).
- `authz`: the policy layer skeleton, plus tests proving cross-team access is denied by ID (VIS-04, SEC-02).
- `audit`: record and list (AUD-01–03).
- `league`: LeagueSettings, including the timezone (CFG-01, CFG-06).
- Frontend: app shell, auth flows, role-aware layout, HTTP client with CSRF.

**Exit:** a user can be created, activated, sign in, and sign out. Admin-only routes reject non-admins. Audit events are written. CI runs ruff, pytest, typecheck, and build.

## Phase 1: League setup (Administrator)

- Seasons, Match Weeks, and deadlines (LGE-06, CFG-02–04).
- Divisions (match day, default start time), Clubs, and Teams (LGE-01–05, CFG-05).
- Admin creation of Player accounts.
- Schedule: double round-robin generation, editing, validation, and Rescheduling with history (SCH-01–06).
- Season activation checks (two Captains per Team, Starting PPGs set, a valid schedule, timezone set).

**Exit:** an Administrator can set up a Season with Divisions, Teams, and a validated 18-week schedule, and can reschedule a Team Match.

## Phase 2: Rosters

- Season Roster Entries. Captain roster management before the deadline, and admin bypass with a reason afterwards (ROS-01–03).
- Assigned Courts and their deadline (ROS-04–06).
- Captain designation (ROS-07).
- Starting PPG entry with pre-fill from the previous Season (PWR-03).
- Roster print and download (ROS-08).
- Basic team dashboard: overview, schedule, and roster (DSH-01 basic).

**Exit:** the deadline tests (before, at, and after each deadline, timezone boundaries) pass. Captains can't touch other Teams.

## Phase 3: Lineups

- `power`: the ledger read side and PPG derivation (PWR-02, PWR-04, PWR-09), so that PPG exists for validation.
- Availability (AVL-01–07).
- The lineup domain: eligibility, ordering, Preceding Team Match, and `validity_unknown` (LIN-01–12).
- The planner UI with backend validation (LIN-13–16, ADR-005).
- Lock with snapshot, automatic exchange at start time, and admin unlock, edit, or entry (LIN-17–22).
- Lineup export (LIN-23).
- Player view basics: next match, Availability, PPG (DSH-02 basic).

**Exit:** every case in the lineup-validation test list (REQUIREMENTS §15) passes. A Captain can't lock an invalid or `validity_unknown` Lineup.

## Phase 4: Results, Power and Standings → **first release**

- Score Submission by either Team, confirmation and disputes, and admin resolution (SUB-01–07).
- Set and Court points and Team Match totals (SCR-01–06).
- Court Result classification and the Needs Classification queue (CRS-01–03).
- Power awards, reversals, and adjustments, with idempotency (PWR-01, PWR-05–08, PWR-10).
- Lineup Violations and point adjustments (PEN-01–05).
- Division standings (STD-01–02).
- Admin work queues: discrepancies, classification, missing Lineups, overdue scores (DSH-03).
- Operations: a backup mechanism decided and running (OQ-10), production hosting chosen (OQ-9).

**Exit:** a simulated full Season (fixtures for 10 Teams × 18 weeks, including a reschedule, a dispute, a correction, a timed Set, and a violation) produces correct standings and PPGs with no double-counting. Backups are verified by a restore.

---

## Phase 5: Dashboards and statistics

- Opponent read-only dashboards (VIS-01).
- Full team dashboard and statistics (DSH-01 full, STD-04).
- Full player history: PPG progression, Power by Court, past Seasons (STD-03 full).
- Division statistics (STD-05).
- A "how was this PPG produced?" ledger view for players and admins.

## Phase 6: Later

- Notifications: in-app first, then email (reminders for deadlines, lineups, and overdue scores, plus schedule changes and results).
- Email-based activation and password reset.
- Digital simultaneous Lineup exchange (LIN-24).
- Profile pictures.
- Internal team notes, private to Captains.
- Administrator exports (rosters, schedules, results, standings, statistics, PPG history, adjustments) as CSV.

## Continuous: open questions

Re-check [REQUIREMENTS §16](REQUIREMENTS.md#16-open-questions) at every phase boundary. When the league answers one, update its requirement and interim behavior, and add an ADR if the change is architectural (e.g. OQ-1 replacing manual classification with a rule).
