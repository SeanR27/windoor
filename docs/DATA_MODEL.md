# Data Model

This document describes what data exists and how it relates. It is a logical model: names and shapes guide the SQLAlchemy models, but Alembic migrations are the authoritative schema once they exist. The domain terms are defined in [GLOSSARY.md](../GLOSSARY.md), and the rules are in [REQUIREMENTS.md](REQUIREMENTS.md).

## Conventions

- **IDs** are integer surrogate keys. Never expose sequential IDs as an authorization mechanism (see ARCHITECTURE: Authorization).
- **Timestamps** are UTC (`*_at`). **Calendar dates** (`*_date`) are local dates in the league timezone.
- **Exact numbers** (see ADR-004):
  - Power is stored as integer **quarter-points** (`power_q`; 1.25 power = 5).
  - Team Points are stored as integer **half-points** (`points_h`; 0.5 points = 1).
  - PPG is never stored as a float. It is computed as an exact fraction.
- **Append-only** tables (marked ⛔) are never updated or deleted. Corrections are new rows.
- Every table has `created_at`. Mutable tables also have `updated_at`.
- SQLite: foreign keys are enforced, and partial unique indexes are used where noted.

## Entity overview

```text
User ─┬─< SeasonRosterEntry >── Team >── Club
      │          │                │
      │          │                └── Division (fixed)
      │          └── Season ──< MatchWeek
      │
      ├─< Availability >── TeamMatch ──< RescheduleEvent
      │                       │  (home Team, away Team, MatchWeek)
      │                       ├──< Lineup ──< LineupSlot >── User
      │                       ├──< ScoreSubmission
      │                       ├──< ScoreRevision ──< SetScore
      │                       │         └──< CourtResult
      │                       ├──< ScoreDiscrepancy
      │                       ├──< LineupViolation
      │                       └──< PointAdjustment
      │
      ├─< PowerLedgerEntry ⛔ (per Season; optionally per TeamMatch + Court)
      ├─< AccountToken
      ├─< Session
      └─< AuditEvent ⛔ (as actor)

LeagueSettings (single row)
```

## Identity

### User
| Field | Notes |
|---|---|
| id | |
| email | unique, case-insensitive |
| first_name, last_name | |
| password_hash | null until activated |
| status | `pending_activation` \| `active` \| `deactivated` |
| is_admin | bool |

### AccountToken
Activation and password-reset links.
| Field | Notes |
|---|---|
| user_id | → User |
| purpose | `activation` \| `password_reset` |
| token_hash | only the hash is stored |
| expires_at, used_at | single-use |
| created_by_id | → User (the Captain or Admin who generated it) |

### Session
| Field | Notes |
|---|---|
| id_hash | hash of the cookie value |
| user_id | → User |
| expires_at, last_seen_at | |

## League

### LeagueSettings (singleton)
| Field | Notes |
|---|---|
| timezone | IANA name, required before any Season is activated (OQ-5) |
| opponents_see_assigned_courts | bool, default false (CFG-06) |

### Season
| Field | Notes |
|---|---|
| name | e.g. "Winter 2026–27" |
| start_date, end_date | |
| roster_deadline_at | UTC instant |
| assigned_court_deadline_at | UTC instant |
| status | `draft` \| `active` \| `archived` |

### MatchWeek
| Field | Notes |
|---|---|
| season_id | → Season |
| number | 1–18; unique (season_id, number) |
| week_start_date | the Team Match date is the Division's match day within this week |

### Division
| Field | Notes |
|---|---|
| name | |
| skill_rank | ordering for display |
| match_day | weekday 0–6 |
| default_start_time | local time (OQ-7) |

### Club
| Field | Notes |
|---|---|
| name, address | |

### Team
| Field | Notes |
|---|---|
| name | |
| club_id | → Club |
| division_id | → Division; never changes |

### SeasonRosterEntry
One Player on one Team for one Season.
| Field | Notes |
|---|---|
| season_id, team_id, user_id | |
| assigned_court | 1–4 |
| is_captain | bool; ≤ 2 per (season, team), exactly 2 once the Season is active |
| removed_at | null while active |

Constraint: unique (season_id, user_id) where removed_at is null.

## Schedule

### TeamMatch
| Field | Notes |
|---|---|
| season_id, division_id, match_week_id | |
| home_team_id, away_team_id | different Teams in the same Division |
| original_date | never changes |
| scheduled_date | current date (changes on Rescheduling) |
| start_time | null means the Division default |
| official_score_status | `none` \| `unconfirmed` \| `confirmed` \| `disputed` |
| current_revision_id | → ScoreRevision, null until the first submission |

Constraint: a Team appears in at most one TeamMatch per MatchWeek.

**Preceding Team Match** (derived, not stored): for Team T and TeamMatch M, it is T's TeamMatch with the greatest (scheduled_date, start_time) strictly earlier than M's. If several TeamMatches share a date, the earlier Match Week number goes first.

### RescheduleEvent ⛔
| Field | Notes |
|---|---|
| team_match_id | |
| from_date, to_date | |
| reason | `weather` \| `power_outage` |
| decided_by_id | home Captain or Admin |

## Availability

### Availability
| Field | Notes |
|---|---|
| team_match_id, user_id | unique pair |
| status | `available` \| `unavailable` (no row means `no_response`) |
| set_by_id | the Player themselves or a Captain |

On Rescheduling, all rows for the TeamMatch are deleted (the deletion is audited).

## Lineups

### Lineup
| Field | Notes |
|---|---|
| team_match_id, team_id | unique pair |
| state | `draft` \| `locked` \| `exchanged` |
| locked_at, locked_by_id | |
| validation_snapshot | JSON: per-Court results and reasons at lock time |
| entered_by_admin | bool; admin-entered Lineups may be invalid as played |

### LineupSlot
| Field | Notes |
|---|---|
| lineup_id | |
| court | 1–4 |
| position | 1–2 |
| user_id | → User |
| assigned_court_snapshot | set on lock |
| ppg_snapshot | exact fraction stored as numerator/denominator integers; set on lock |

Constraints: unique (lineup_id, court, position) and unique (lineup_id, user_id). Drafts may have empty positions (no row).

Combined PPG per Court is derived from the two slots' `ppg_snapshot` values.

## Results

### ScoreSubmission ⛔
Every captain action on a score.
| Field | Notes |
|---|---|
| team_match_id | |
| team_id | the submitting Captain's Team |
| submitted_by_id | |
| kind | `initial` \| `confirm` \| `dispute` |
| sets | JSON of reported Set scores (`initial` and `dispute` only) |

### ScoreRevision ⛔
An official score version.
| Field | Notes |
|---|---|
| team_match_id | |
| revision_no | 1, 2, …; unique per team_match |
| source | `submission` \| `admin_correction` |
| source_submission_id | for revision 1 |
| created_by_id, reason | the reason is required for admin corrections |

### SetScore ⛔
| Field | Notes |
|---|---|
| revision_id, court, set_no | court 1–4, set_no 1–3; unique triple |
| home_games, away_games | |
| ending | `completed` \| `timed` |

Set points and Court points are derived from SetScores (pure function). They may be cached, but they are always recomputable.

### CourtResult
Per revision and Court, for Power.
| Field | Notes |
|---|---|
| revision_id, court | unique pair |
| home_outcome | `win` \| `tie` \| `loss` \| `needs_classification` (the away outcome is the mirror) |
| classified_by_id, classified_at | set when an Admin classifies |

### ScoreDiscrepancy
| Field | Notes |
|---|---|
| team_match_id | |
| disputed_revision_id | the official revision at the time |
| dispute_submission_id | → ScoreSubmission (kind `dispute`) |
| status | `open` \| `resolved` |
| resolution | `kept` \| `corrected` |
| resolved_by_id, resolved_at, note | |

### LineupViolation
| Field | Notes |
|---|---|
| team_match_id, team_id, court | |
| reason | |
| deny_opponent_power | bool, default false (OQ-2) |
| recorded_by_id | |
| voided_at, voided_by_id | an Admin can void a violation with a reason |

### PointAdjustment ⛔
| Field | Notes |
|---|---|
| team_match_id, team_id | |
| court | null means it applies to the Team Match total |
| delta_points_h | signed half-points |
| kind | `violation_forfeit` \| `penalty` \| `bonus` \| `custom` \| `reversal` |
| lineup_violation_id | for `violation_forfeit` |
| reverses_id | for `reversal` |
| reason, created_by_id | |

The original and adjusted values are derivable: the Court total before and after applying adjustments in order.

**Team Points for a Team in a TeamMatch** = Σ over Courts of (Set points from the current revision) + Σ unreversed adjustments.

## Power

### PowerLedgerEntry ⛔
| Field | Notes |
|---|---|
| season_id, user_id | |
| kind | `award` \| `reversal` \| `adjustment` |
| team_match_id, court, revision_id | for `award` (and copied onto its `reversal`) |
| outcome | `win` \| `tie` \| `loss` for `award` |
| power_q | signed quarter-points |
| appearances_delta | +1 for an award, −1 for its reversal, 0 or ±1 for an adjustment |
| reverses_id | for `reversal` |
| reason, created_by_id | required for `adjustment`; system actor for awards |

Constraints:
- unique (user_id, team_match_id, revision_id) where kind = `award`, which makes awards idempotent per revision
- unique (reverses_id), so an entry can be reversed at most once

Derived per (season, user):
- `total_power = Σ power_q / 4`
- `appearances = Σ appearances_delta`
- `PPG = total_power / appearances` if appearances > 0, else the Starting PPG: the `assigned_court` of the Player's active SeasonRosterEntry (PWR-03)

**Power finality for a Team in a TeamMatch** (used by LIN-07): a current revision exists, none of its CourtResults are `needs_classification`, and the Team's Lineup exists in state `locked` or `exchanged` (or was entered by an Admin).

## Audit

### AuditEvent ⛔
| Field | Notes |
|---|---|
| occurred_at | |
| actor_id | → User, or null for the system |
| action | dotted name, e.g. `lineup.locked`, `roster.entry_added`, `score.dispute_resolved` |
| entity_type, entity_id | |
| before, after | JSON, where practical |
| reason | required for admin bypasses and corrections |
| team_match_id, team_id, season_id | optional, for filtering |

## Deferred entities (later phases)

- `Notification`: in-app or email (Phase 6).
- `LineupExchange`: digital simultaneous-reveal handshake state per TeamMatch (Phase 6). It fits on top of the `locked` → `exchanged` transition.
- `TeamNote`: private captain notes (Phase 6).
- `User.profile_picture` (Phase 6).
