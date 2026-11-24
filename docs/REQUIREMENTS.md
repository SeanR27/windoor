# Requirements

This document defines what the application must do. It supersedes the original `description.txt` specification. Terms in **bold** are defined in [GLOSSARY.md](../GLOSSARY.md). Requirement IDs (e.g. `LIN-07`) are stable: reference them in code comments, tests, and commits. Unresolved league policies are listed under [Open Questions](#16-open-questions) as `OQ-n`. Never resolve one silently in code.

Priority: **v1** means part of the first release (Roadmap Phases 0–4). **Later** means Phase 5 or 6.

---

## 1. League structure

| ID | Requirement | Priority |
|---|---|---|
| LGE-01 | The installation hosts one league containing multiple skill-based **Divisions**. | v1 |
| LGE-02 | Divisions operate independently: Teams play only Teams in their own Division, and each Division has its own schedule, match day, standings, and statistics. | v1 |
| LGE-03 | Each Division has a regular match day of the week. All of its Team Matches fall on that day unless rescheduled. | v1 |
| LGE-04 | A **Team** belongs to exactly one Division and never changes Division. Teams persist across Seasons. | v1 |
| LGE-05 | A Team is associated with one **Club**. A Club may have any number of Teams, in any Divisions (including several in the same Division). | v1 |
| LGE-06 | A **Season** has 18 numbered **Match Weeks** and a schedule fixed before it begins. A Season is `draft`, `active`, or `archived`. | v1 |
| LGE-07 | There are no playoffs or brackets. | v1 |

## 2. Configurable settings

None of these may be hard-coded.

| ID | Setting | Scope | Priority |
|---|---|---|---|
| CFG-01 | League timezone (IANA name; no default, see OQ-5) | League | v1 |
| CFG-02 | Season start and end dates; Match Week dates | Season | v1 |
| CFG-03 | **Roster Deadline** | Season (applies league-wide) | v1 |
| CFG-04 | **Assigned-Court Deadline**, separate from the Roster Deadline | Season (applies league-wide) | v1 |
| CFG-05 | Division match day and default start time | Division | v1 |
| CFG-06 | Whether opposing Captains can see Assigned Courts (default: **no**) | League | v1 |

All timestamps are stored in UTC. Deadlines are evaluated, and dates displayed, in the league timezone (CFG-01). A deadline is a precise instant, and an action exactly at the deadline instant is rejected.

## 3. Users, roles and access

### 3.1 Accounts

| ID | Requirement | Priority |
|---|---|---|
| USR-01 | Every Player has an individual login (email + password). Passwords are stored only as strong one-way hashes. | v1 |
| USR-02 | Account status is `pending_activation`, `active`, or `deactivated`. Only `active` accounts can sign in. | v1 |
| USR-03 | When a Captain or Administrator creates a Player, the app generates a single-use, expiring **activation link**, which the creator shares manually. Opening it lets the Player set a password and become `active`. | v1 |
| USR-04 | Password recovery: an Administrator generates a single-use, expiring **reset link** and shares it manually. There is no email delivery in v1. | v1 |
| USR-05 | Players cannot change their own email. Captains (for their own Team's Players) and Administrators can. | v1 |
| USR-06 | Stored player fields: first name, last name, email, account status. Profile pictures are deferred. No other personal data is collected (see Project Vision, Out of scope). | v1 |
| USR-07 | Removing a Player from a Roster doesn't delete their account or history. | v1 |
| USR-08 | A user can be an Administrator, a Player, or both. | v1 |

### 3.2 Roles

- **Player**: a user with a **Season Roster Entry** on a Team.
- **Captain**: a Player flagged as one of their Team's two Captains for the Season. Both Captains have identical authority. Captains have all Player capabilities.
- **Administrator**: full access to everything. All Administrators are equal.

### 3.3 Permission matrix

"Own Team" means the Team of the user's current Season Roster Entry.

| Capability | Player | Captain | Admin |
|---|---|---|---|
| View own Team dashboard, roster, schedule, results, standings | ✓ | ✓ | ✓ (all Teams) |
| View own profile, Power/PPG history | ✓ | ✓ | ✓ (all) |
| Set own **Availability** | ✓ | ✓ | ✓ |
| Set any own-Team Player's Availability | | ✓ | ✓ |
| Create Player accounts for own Team; add/remove roster entries (before Roster Deadline) | | ✓ | ✓ (any time, with reason) |
| Edit own-Team Player info (name, email) | | ✓ | ✓ |
| Change Assigned Courts (before Assigned-Court Deadline) | | ✓ | ✓ (any time, with reason) |
| View own-Team Players' detailed performance history | | ✓ | ✓ |
| Draft, validate, and lock own-Team **Lineups** | | ✓ | ✓ |
| View own-Team Lineup Drafts | | ✓ | ✓ (all) |
| Submit, confirm, or dispute a **Score Submission** for own Team Match | | ✓ | |
| View opponent read-only dashboard (§3.4) | | ✓ | ✓ |
| Print/download own roster; export own Lineups | | ✓ | ✓ |
| Seasons, Divisions, Clubs, Teams, Captains, schedules, settings | | | ✓ |
| Unlock or edit a locked/exchanged Lineup; correct scores; resolve **Score Discrepancies** | | | ✓ (with reason) |
| Classify Court Results; record **Lineup Violations**; apply point adjustments | | | ✓ (with reason) |
| Apply Power adjustments | | | ✓ (with reason) |
| View audit log | | | ✓ |

Captains cannot invite an already-registered user onto their Team, transfer a Player from another Team, modify a locked Lineup, view another Team's drafts or Availability, or use another Team's tools.

### 3.4 Opponent visibility

| ID | Requirement | Priority |
|---|---|---|
| VIS-01 | Captains can view a read-only dashboard for any other Team in their Division. It shows: team name, Division, Club, current roster, Player PPG, Power, Appearances, performance history and statistics, schedule and past results, standings, and **exchanged** Lineups. The exact profile fields are subject to OQ-4. | Later (Phase 5) |
| VIS-02 | Never visible to opponents: Lineup Drafts, locked-but-not-exchanged Lineups, Availability, captain tools, administrative information, and Assigned Courts (unless CFG-06 is turned on). | v1 (enforced from the start) |
| VIS-03 | Non-captain Players get no access to other Teams' dashboards or rosters. | v1 |
| VIS-04 | All visibility rules are enforced by the backend for every request. Guessing or changing URLs, IDs, or parameters must not reveal anything. | v1 |

## 4. Rosters and Assigned Courts

| ID | Requirement | Priority |
|---|---|---|
| ROS-01 | Roster membership is per Season: a **Season Roster Entry** links one Player to one Team for one Season. A Player has at most one active entry per Season. | v1 |
| ROS-02 | Before the Roster Deadline, Captains may create Player accounts and add or remove entries on their own Roster. They can only add Players they create. They can't add existing users or users on another Team. | v1 |
| ROS-03 | After the Roster Deadline, the Roster is frozen for Captains. Administrators may change it with a recorded reason (OQ-11). | v1 |
| ROS-04 | Every entry has an **Assigned Court** from 1 to 4, chosen by the Captains. | v1 |
| ROS-05 | After the Assigned-Court Deadline, Assigned Courts are frozen for Captains. Administrators may change them with a recorded reason. | v1 |
| ROS-06 | Eligible **Playing Courts**: Assigned 1 → {1, 2}. Assigned 2 → {1, 2, 3}. Assigned 3 → {2, 3, 4}. Assigned 4 → {3, 4}. | v1 |
| ROS-07 | Each Team has exactly two Captains per Season, chosen from its Roster by an Administrator. This is enforced when the Season is activated and from then on. While a Season is in draft, a Team may temporarily have fewer. | v1 |
| ROS-08 | Captains can print or download their Team's Roster. | v1 |

## 5. Power and PPG

| ID | Requirement | Priority |
|---|---|---|
| PWR-01 | Each **Appearance** earns Power based on the Playing Court number *c* and the **Court Result**: win = *c*, tie = *c* + 0.25, loss = *c* + 0.5. For example, a tie on Court 3 earns 3.25. | v1 |
| PWR-02 | PPG = total Power ÷ Appearances, per Player, **within the current Season**. Power and PPG reset at each Season start. Lower PPG means a stronger Player. | v1 |
| PWR-03 | A Player's **Starting PPG** is their current **Assigned Court** number (1–4). It is derived, never entered: nobody sets or overrides it, and nothing carries over from a previous Season. If the Assigned Court changes before the Player's first Appearance, the Starting PPG follows it. | v1 |
| PWR-04 | A Player with zero Appearances in the Season has PPG = Starting PPG. From their first Appearance onwards, PPG is their real PPG, and the Starting PPG no longer counts. For example, a Player with Assigned Court 2 (PPG 2) who wins on Court 3 has PPG 3 ÷ 1 = 3. | v1 |
| PWR-05 | Total Power, Appearances, and PPG are always derived from the **Power Ledger**. They are never edited directly. Administrator corrections are ledger entries with a reason. | v1 |
| PWR-06 | A Player who doesn't play a Team Match gets no ledger entry for it. | v1 |
| PWR-07 | Players denied Power by a Lineup Violation (§8) get no award. Their PPG is unchanged. | v1 |
| PWR-08 | Power awards are idempotent: re-processing, re-entering, or confirming a score never double-awards. A score correction reverses the previous awards and records new ones. | v1 |
| PWR-09 | Power and PPG are computed with exact arithmetic. Combined-PPG comparisons for lineup ordering are exact, never floating-point. Display rounds to 2 decimals. | v1 |
| PWR-10 | Every Player's current PPG must be explainable from their ledger entries. | v1 |

## 6. Availability

| ID | Requirement | Priority |
|---|---|---|
| AVL-01 | For each upcoming Team Match, each Player on the Roster has an **Availability**: `available`, `unavailable`, or `no_response` (default). | v1 |
| AVL-02 | A Player may set their own Availability until their Team's Lineup for that Team Match is locked. | v1 |
| AVL-03 | Captains may set any own-Team Player's Availability up to the Team Match's start. | v1 |
| AVL-04 | Availability is visible to the Team's Players, Captains, and Administrators only. | v1 |
| AVL-05 | When a Team Match is rescheduled, all Availability for it resets to `no_response`. | v1 |
| AVL-06 | Availability never restricts Lineup building. Placing an `unavailable` (or `no_response`) Player in a Lineup shows a **warning** only, and doesn't affect validity. | v1 |
| AVL-07 | The planner shows each Player's Availability next to their name. | v1 |

## 7. Lineups

### 7.1 Composition and validation rules

A **Lineup** is **valid** when all of these hold:

| ID | Rule |
|---|---|
| LIN-01 | Exactly 8 distinct Players are selected. |
| LIN-02 | Exactly 2 Players are on each of Courts 1–4. |
| LIN-03 | Every Player has an active Season Roster Entry on the Team. |
| LIN-04 | Every Player's Playing Court is eligible for their Assigned Court (ROS-06). |
| LIN-05 | Combined PPG strictly increases: C1 < C2 < C3 < C4. Equal values on adjacent Courts are invalid. The comparison is within one Team's Lineup, never against the opponent. |

### 7.2 Validity state and the Preceding Team Match

| ID | Requirement | Priority |
|---|---|---|
| LIN-06 | A Lineup's validity status is `valid`, `invalid`, or `validity_unknown`. | v1 |
| LIN-07 | The status is `validity_unknown` while the Team's **Preceding Team Match** lacks final Power for this Team's Players. "Final" means all three of these: an official score exists, no Court of it is awaiting Court Result classification, and this Team's Lineup for it is present. | v1 |
| LIN-08 | The Preceding Team Match is determined by **current scheduled dates**, after any Rescheduling. Example: if week 5 is rescheduled to after week 6, then week 6's Preceding Team Match is week 4, and week 5's is week 6. | v1 |
| LIN-09 | Only the Team's own Preceding Team Match matters. The opponent's results don't. | v1 |
| LIN-10 | A Team's first Team Match of the Season has no Preceding Team Match. It is validated immediately against Starting PPGs. | v1 |
| LIN-11 | A preceding score that is Unconfirmed or under a Score Discrepancy still counts as having results. | v1 |
| LIN-12 | While `validity_unknown`, the planner still shows the per-Court eligibility checks (LIN-01–LIN-04) and the current Combined PPGs, marked **provisional**. It withholds the overall verdict and the ordering result (LIN-05), and explains why (e.g. "Validity unknown: no final results yet for the 12 Jan match vs. Riverside"). | v1 |

### 7.3 Workflow and states

| ID | Requirement | Priority |
|---|---|---|
| LIN-13 | Lineup states: `draft` → `locked` → `exchanged`. Each Team has at most one Lineup per Team Match. | v1 |
| LIN-14 | Captains can create, save (incomplete drafts allowed), reopen, and edit drafts. Drafts are private to the Team's Captains and Administrators. | v1 |
| LIN-15 | The planner shows four Court panels, each with two slots, Combined PPG, and validation status. Each player option shows name, PPG, Assigned Court, eligibility for the Court, and Availability. Violations are listed per Court with a plain-language reason. | v1 |
| LIN-16 | Validation is performed by the backend. The planner requests validation as the Captain edits. The frontend contains no rule logic. | v1 |
| LIN-17 | A Captain may lock a Lineup only when it is `valid`. Locking is impossible while `invalid` or `validity_unknown`. | v1 |
| LIN-18 | Locking must happen before the Team Match's start time. There is no other lock deadline in v1. | v1 |
| LIN-19 | On lock, the app snapshots each Player's Assigned Court and PPG, each Court's Combined PPG, the validation result, the timestamp, and the locking Captain. Validity is judged on this snapshot forever: later score corrections never re-open or invalidate a locked Lineup. | v1 |
| LIN-20 | v1 exchange is physical (on paper at the Club). A locked Lineup becomes `exchanged` automatically at the Team Match's start time. Captains can't modify a locked or exchanged Lineup. | v1 |
| LIN-21 | Administrators may unlock or edit any Lineup, or enter a missing one, with a recorded reason. An admin-entered Lineup is stored with its validation result even if it was invalid as played. | v1 |
| LIN-22 | Exchanged Lineups become visible to the opponent's Captains. Locked-but-not-exchanged ones don't. | v1 |
| LIN-23 | Captains can export their Team's Lineups. | v1 |
| LIN-24 | **Digital simultaneous exchange** (both Captains lock, then both Lineups are revealed together, with no peeking) is designed for but deferred. The state model above must accommodate it without migration of existing records. | Later (Phase 6) |

## 8. Match format, scoring and penalties

### 8.1 Format

- A Team Match is four **Court Matches** played simultaneously, one per Court (Court 1 highest).
- Each Court Match is at most 3 **Sets** within 2 hours.

### 8.2 Team Points

| ID | Requirement | Priority |
|---|---|---|
| SCR-01 | Completed Set: winner 2 points, loser 0. | v1 |
| SCR-02 | Set stopped by time: a lead of 2+ **Games** gives the leader 1 point and the other team 0. A tie or a 1-Game difference gives each team 0.5. | v1 |
| SCR-03 | A Team can earn at most 6 points per Court and 24 per Team Match, before administrative adjustments. | v1 |
| SCR-04 | A Team's Team Match total is the sum of its four Court totals plus any adjustments. Each Team's total is calculated independently. | v1 |
| SCR-05 | The app stores raw Set scores (Games per Team, completed or timed) and calculates points. It never stores captain-entered point totals. | v1 |
| SCR-06 | The app keeps separate records of raw scores, Set points, Court points, penalties and adjustments, final Team Points, and Power. | v1 |

### 8.3 Score submission

| ID | Requirement | Priority |
|---|---|---|
| SUB-01 | After a Team Match's start time, a Captain of **either** Team may submit the Set scores. The first accepted **Score Submission** becomes the official score (status `unconfirmed`) and is applied immediately (Team Points, Court Results, Power). | v1 |
| SUB-02 | A missing Lineup (from either Team) never blocks score submission. | v1 |
| SUB-03 | Once an official score exists, the other Team's Captains see it and may **Confirm** it (status `confirmed`) or **Report a different score**, which records their scores and opens a **Score Discrepancy** (status `disputed`). | v1 |
| SUB-04 | While disputed, the official score stays in effect. An Administrator resolves the dispute by keeping the official score or recording a corrected one. A correction is a new score revision, and Points and Power are recalculated (PWR-08). | v1 |
| SUB-05 | Captains can't edit a submission after submitting. There is no deadline to confirm or dispute. | v1 |
| SUB-06 | The home Team stays **responsible** for reporting: "score overdue" flags and reminders target the home Team's Captains. | v1 (flag), Later (reminders) |
| SUB-07 | All submissions, confirmations, disputes, and resolutions are audited. | v1 |

### 8.4 Court Results (for Power)

| ID | Requirement | Priority |
|---|---|---|
| CRS-01 | Court Results are classified automatically only when every Set played was completed: 2–0 or 2–1 in Sets is a win/loss, and 1–1 is a tie. | v1 |
| CRS-02 | Any Court Match containing a timed Set is marked **Needs Classification**. An Administrator chooses win/tie/loss for it (OQ-1). Power for that Court's Players waits until it is classified. | v1 |
| CRS-03 | If a Team's Lineup is missing, Team Points still apply to both Teams. Power for that Team's Players waits until an Administrator enters the Lineup, and the other Team's Players receive Power normally. | v1 |

### 8.5 Violations and adjustments

| ID | Requirement | Priority |
|---|---|---|
| PEN-01 | Captains can't lock an invalid Lineup, so violations arise only from what was actually played. An Administrator records a **Lineup Violation** against one Team on one Court, with a reason. | v1 |
| PEN-02 | Recording a Lineup Violation automatically: (a) adds an adjustment that sets the violating Team's points on that Court to 0 (the Administrator can change it), and (b) denies Power to the violating Team's two Players on that Court. | v1 |
| PEN-03 | By default the opposing Players on that Court still receive normal Power. The Administrator may deny it per violation (OQ-2). | v1 |
| PEN-04 | Administrators can apply point additions, deductions, or custom adjustments to a Court result or a Team Match total, for violations, coaching, or other infractions. Each adjustment records the reason, actor, timestamp, and original and adjusted values. | v1 |
| PEN-05 | Other Courts are never penalized automatically. | v1 |

### 8.6 Result processing

When an official score is recorded or revised, in one transaction:

1. Store the score revision (raw Sets per Court).
2. Calculate Set points and Court points for each Team.
3. Apply violation forfeits and adjustments, and derive Team Match totals.
4. Classify Court Results (or mark Needs Classification).
5. Reverse Power awards from any previous revision, and award Power for each eligible Appearance (Lineup present, Court classified, not denied).
6. Record audit events.

Standings and statistics are derived from these records.

## 9. Schedule and rescheduling

| ID | Requirement | Priority |
|---|---|---|
| SCH-01 | Administrators create each Division's schedule: one Team Match per Team per Match Week, with a home and away Team. Each Team Match takes place at the home Team's Club. | v1 |
| SCH-02 | Administrators can auto-generate a double round-robin for a Division and then edit it. | v1 |
| SCH-03 | Validation (on save and before activation): every pair of Teams meets exactly twice, once at each Team's home, and no Team plays twice in one Match Week. For a Division of *n* Teams this needs 2(*n*−1) weeks, which is 18 for *n* = 10. Divisions of other sizes are flagged (OQ-8). | v1 |
| SCH-04 | Team Match date = its Match Week's date on the Division's match day. Start time = the Division's default, optionally overridden per Team Match (OQ-7). | v1 |
| SCH-05 | **Rescheduling** is allowed only for weather or a power outage, and is initiated by a home-Team Captain (or an Administrator). It needs a new date. A Team Match is never cancelled. | v1 |
| SCH-06 | A rescheduled Team Match keeps its Match Week number. The app keeps the original date and a history of each change (old and new date, reason, actor, time). | v1 |

## 10. Standings and statistics

| ID | Requirement | Priority |
|---|---|---|
| STD-01 | Division standings rank Teams by total Team Points for the Season. Teams with equal points share a rank (shown as "T-3"). No tie-breakers until the league defines them (OQ-3). | v1 |
| STD-02 | Standings show Team Points by week, totals, and Team Match wins/ties/losses (by Team Points per Team Match). | v1 |
| STD-03 | Player view: current PPG, total Power, Appearances, Court Results, Power by Court, PPG progression, Team Match-by-Team Match history, and past Seasons. Current-season and historical values are clearly separated. | v1 (core), Later (full history views) |
| STD-04 | Team statistics: weekly and total points, Court-by-Court points, home/away record, recent results, player summaries, all scoped to the Season and Division. | Later |
| STD-05 | Division statistics: Court-level performance and player statistics within the Division. | Later |

## 11. Dashboards

| ID | Requirement | Priority |
|---|---|---|
| DSH-01 | **Team dashboard** (own Team only): overview (name, Division, Club, Captains, Season, current week, next opponent, recent result, standing, points, roster summary), the season schedule (week, date, opponent, home/away, Club, status, score, link), the roster (name, Assigned Court, PPG, Power, Appearances), and the lineup planner (Captains). | v1 (basic), Later (full) |
| DSH-02 | **Player view**: next Team Match, Availability, team schedule, personal stats, PPG and Power history, team results and standings. | v1 (basic), Later (full) |
| DSH-03 | **Admin dashboard**: Seasons, Divisions, Clubs, Teams and Captains, Players, schedules, Team Matches, scoring and rules, and the audit log. It also has work queues for: open Score Discrepancies, Courts needing classification, Team Matches with a missing Lineup (Power pending), and overdue scores. | v1 |
| DSH-04 | The UI is responsive and role-aware, with clear validation messages, useful empty states, loading and error states, and confirmation for irreversible actions (lock, submit, exchange). | v1 |

## 12. Audit

| ID | Requirement | Priority |
|---|---|---|
| AUD-01 | Audited actions: roster changes, account creation and edits, Assigned-Court changes, Lineup creation, lock, exchange, and admin edits, Availability changes, Score Submissions, confirmations, disputes, and resolutions, Court Result classifications, violations and adjustments, Power adjustments, schedule changes and Rescheduling, and settings changes. | v1 |
| AUD-02 | Each audit event records the actor, action, affected record, timestamp, before/after values where practical, and the reason (required for every administrator bypass or correction). | v1 |
| AUD-03 | Audit events are append-only and visible to Administrators. | v1 |

## 13. Security

| ID | Requirement | Priority |
|---|---|---|
| SEC-01 | Authentication is handled by the backend with server-side sessions in an HttpOnly, Secure, SameSite cookie, with CSRF protection on state-changing requests. | v1 |
| SEC-02 | Every endpoint authorizes on role, Team membership, Captain status, Admin status, and resource state (e.g. Lineup state for opponent access). | v1 |
| SEC-03 | Activation and reset tokens are single-use, expiring, and stored hashed. | v1 |
| SEC-04 | Exports respect the same permissions as the screens they come from. | v1 |

## 14. Data integrity invariants

The backend (and, where practical, database constraints) must guarantee:

- A Player has at most one active Season Roster Entry per Season.
- A Team has exactly two Captains in an active Season.
- A locked Lineup has 8 distinct Players, 2 per Court, all eligible, with strictly increasing Combined PPG.
- Captains can't modify a locked or exchanged Lineup, a frozen Roster, or an Assigned Court after its deadline.
- A Player receives at most one live Power award per Team Match.
- One Lineup per Team per Team Match, and one official score revision current per Team Match.

## 15. Testing requirements

Automated tests must cover at least the following.

- **Power:** win, tie, and loss on each Court; PPG after multiple Appearances; Starting PPG equals the Assigned Court before the first Appearance, follows an Assigned-Court change, and disappears after the first Appearance (e.g. Assigned 2, win on Court 3 → PPG 3); no change without an Appearance; no award for violation-denied Players; no double award on re-processing or correction; exact arithmetic (no float drift).
- **Lineup validation:** a valid lineup; 7 and 9 Players; a duplicate Player; a wrong count on a Court; a Player from another Team; Assigned 1 on Court 3; Assigned 2 on Court 4; valid adjacent placements; equal adjacent Combined PPG; wrong ordering; `validity_unknown` when the Preceding Team Match isn't final; Preceding Team Match after Rescheduling; first Team Match uses Starting PPG; lock blocked unless valid; modification after lock.
- **Scoring:** completed Set won and lost; timed Set with a 2-Game lead, a tie, and a 1-Game difference; three completed Sets; the 6-per-Court and 24-per-Team-Match maximums; violation forfeit; admin adjustment; auto-classification versus Needs Classification.
- **Score Submission:** first submission wins (either Team); confirm; dispute keeps the official score; admin correction recalculates; no edit after submission; missing Lineup doesn't block.
- **Permissions:** own Team access; other Team blocked (including by changing IDs); Captain tools; opponent view excludes drafts, Availability, and Assigned Courts; admin full access; non-admin blocked from admin operations.
- **Deadlines:** roster and Assigned-Court changes before, at, and after their deadline; timezone boundary behavior; draft editing before lock; modification after lock or exchange; Availability edit windows.

## 16. Open questions

League policies not yet decided. Each one has an interim behavior that the app implements until the league decides. Update this table when an answer arrives.

| ID | Question | Interim behavior |
|---|---|---|
| OQ-1 | How is a Court Match with a timed Set classified (win/tie/loss) for Power? E.g. one team won Set 1 and leads Set 2 by 2+ Games when time expires. | Marked Needs Classification; an Administrator decides (CRS-02). |
| OQ-2 | When one Team commits a Lineup Violation on a Court, do the opposing Players on that Court still receive Power? | Yes by default; the Administrator can deny per violation (PEN-03). |
| OQ-3 | What are the standings tie-breakers? Are standings based solely on Team Points? | Total Team Points only; ties share a rank (STD-01). |
| OQ-4 | Exactly which Player profile fields can opposing Captains see? | The VIS-01 list, excluding Assigned Court. |
| OQ-5 | What is the league's official timezone? | Setting required; no default (CFG-01). |
| OQ-6 | What are the Season date range, Roster Deadline, and Assigned-Court Deadline? | Configured per Season by Administrators. |
| OQ-7 | Do all Team Matches in a Division start at the same time? | Division default start time with a per-Team-Match override (SCH-04). |
| OQ-8 | How are schedule conflicts and Divisions with other than 10 Teams handled? | Validation flags them; an Administrator resolves them manually. |
| OQ-9 | Where will the application be hosted? | Undecided; architecture assumes a single small host. |
| OQ-10 | How are database backups performed and retained? | Undecided; must be settled before go-live (Roadmap Phase 4 exit). |
| OQ-11 | Will the league allow roster changes or Assigned-Court changes after the deadlines in practice? | The software lets Administrators do it with a reason (ROS-03, ROS-05). |
| OQ-12 | Is there a league guideline for a brand-new Player's Starting PPG? | **Resolved (2026-11-23):** Starting PPG is the Assigned Court number for every Player (PWR-03, ADR-011). |
