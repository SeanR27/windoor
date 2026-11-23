# Project Vision

## What we are building

**Windoor** is a web application for running a Women's Winter Indoor Doubles Tennis League. It manages the league as a whole (seasons, skill-based divisions, clubs, teams, schedules, results, and standings) and gives every team a private workspace in which its two captains plan weekly lineups.

Its defining feature is the **lineup planner**. Each week a captain places eight players on four ranked courts. The app enforces the league's player-strength rules as the captain works:

- each player may only play on their Assigned Court or an adjacent one
- the Combined PPG of each court's pair must strictly increase from Court 1 to Court 4

The app explains every violation in plain language.

Around the planner, the app records match scores, calculates Team Points and each player's Power and PPG, maintains standings and statistics, and gives administrators the tools and audit trail they need to correct records and apply penalties.

## Why

The league's rules are precise but laborious to apply by hand:

- **Lineup validity depends on arithmetic captains currently do on paper.** PPG averages, combined sums, and strict ordering across four courts are easy to get wrong, and a mistake costs a team its points on that court.
- **PPG depends on every previous result being recorded correctly.** A single mis-recorded score silently corrupts every later lineup decision. The league needs one authoritative, traceable record of how each player's PPG was produced.
- **Teams need privacy.** Captains must be able to prepare lineups without exposing them to the opponent, and teams must not be able to see each other's private information.
- **Administrators need oversight.** Corrections, penalties, and exceptions must be possible, explained, and auditable.

## Who it serves

| Audience | What they get |
|---|---|
| **Captains** (two per team, equal authority) | Roster and Assigned Court management, a validated lineup planner, Availability at a glance, score submission, limited opponent scouting. |
| **Players** | Their own schedule, Availability reporting, personal Power/PPG history, team results and standings. |
| **Administrators** (all equal) | League setup, schedules, the power to bypass any deadline or lock with a recorded reason, score dispute resolution, penalties, and audit logs. |

## Product principles

1. **Accuracy over convenience.** Scoring, Power, and lineup validation must be mathematically exact and consistent.
2. **Backend authority.** Every league rule is enforced by the backend. The frontend displays, but never decides.
3. **Privacy by default.** Teams see only their own private data. What opponents can see is deliberately limited.
4. **Historical integrity.** Results, lineups, Power awards, and adjustments are traceable, and corrections never erase history.
5. **Configurability.** Deadlines, dates, match days, and policy toggles are settings, not constants.
6. **Clear captain workflows.** The planner minimizes errors and makes rule violations understandable.
7. **Modular implementation.** League domains stay separated inside one deployable application.
8. **Incremental delivery.** The core season workflow ships first. Analytics and conveniences follow.
9. **Don't invent league policy.** Where the league hasn't decided a rule, the app records it as an open question and requires an administrator's decision, rather than guessing.

## Success looks like

- A full 18-week season runs in the app without paper-based PPG calculation.
- No lineup is locked that breaks the eligibility or ordering rules.
- Every player's PPG can be explained entry by entry from the Power Ledger.
- Every correction, penalty, and deadline bypass has an actor, a reason, and a timestamp.
- Captains can't reach another team's private information through the UI or the API.

## Out of scope

- Playoffs, brackets, or tournaments (the league has none).
- Moving teams between divisions.
- Collecting personal data beyond what identification and league operation require (no date of birth, experience, biography, emergency contacts, or partner preferences).
- Multiple leagues in one installation.

## Related documents

- [REQUIREMENTS.md](REQUIREMENTS.md): what the application must do
- [ARCHITECTURE.md](ARCHITECTURE.md): how the system is structured
- [DATA_MODEL.md](DATA_MODEL.md): what data exists and how it relates
- [ROADMAP.md](ROADMAP.md): build order
- [DECISIONS.md](DECISIONS.md): why key technical decisions were made
- [../GLOSSARY.md](../GLOSSARY.md): canonical domain language
