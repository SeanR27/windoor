# Glossary

Canonical domain language for the Windoor league application. Use these terms in code, docs, and conversation. Terms listed under _Avoid_ are ambiguous and should not be used.

## League structure

**Season**
One winter league season: 18 Match Weeks with a fixed schedule known before it begins. Player power and PPG reset at the start of each Season.

**Division**
A skill-based group of about 10 Teams that plays only within itself, on a single match day of the week, with its own schedule, standings, and statistics.

**Club**
The venue a Team belongs to. The home Team hosts at its Club.

**Team**
A group of players that competes in one Division. It persists across Seasons and never changes Division. A Team has exactly two Captains.
_Avoid_: Opponent (as an entity). "Opponent" only describes another Team from one Team's point of view.

**Season Roster Entry**
A Player's membership on a Team for one Season. It carries that Player's Assigned Court for the Season. A Player has at most one Season Roster Entry per Season.
_Avoid_: membership, registration

**Roster**
All Season Roster Entries for one Team in one Season. It is frozen after the Roster Deadline.

## People and roles

**Player**
A person with an individual login who plays for a Team.

**Captain**
A Player who is one of the two equally empowered managers of a Team.

**Administrator**
A league official with full access to all league data and management. All Administrators have identical permissions.

## Courts and lineups

**Court**
One of the four ranked playing positions in a Team Match, numbered 1 (strongest) to 4 (weakest).

**Assigned Court**
The Court a Captain designates for a Player for the Season. It determines which Courts that Player is eligible for (the Assigned Court and the adjacent ones). It is fixed after the Assigned-Court Deadline.
_Avoid_: home court, default court

**Playing Court**
The Court a Player actually plays on in a given Lineup.

**Lineup**
A Team's assignment of eight distinct Players, two per Court, for one Team Match. It progresses from draft, to locked, to exchanged.

**Lineup Draft**
A Lineup that hasn't been locked yet. It is private to the Team's Captains and Administrators.

**Preceding Team Match**
For a given Team Match, the same Team's Team Match scheduled most recently before it, by current date and after any Rescheduling. The first Team Match of a Season has none.

**Validity Unknown**
A Lineup's status when its Team's Preceding Team Match doesn't yet have final Power for that Team's Players, so up-to-date PPG isn't available. A Lineup with this status can't be locked.

**Combined PPG**
The sum of the PPGs of the two Players on one Court in a Lineup. It must strictly increase from Court 1 to Court 4.

**Lineup Violation**
An Administrator's finding that a Team's Lineup, as actually played on a specific Court, broke the lineup rules. It forfeits that Team's points on that Court and denies power to that Team's two Players on it.

**Availability**
A Player's self-reported indication, before a Team Match, of whether they can play. It helps Captains build Lineups but never restricts them. Captains may change any Player's Availability.
_Avoid_: presence, attendance, RSVP

## Matches and scoring

**Match Week**
One of the 18 numbered weeks of a Season.

**Team Match**
The weekly meeting of two Teams in a Division: one home Team, one away Team, four Court Matches played simultaneously.
_Avoid_: "match" on its own when it could mean a Court Match

**Court Match**
The doubles contest between the two Teams' pairs on one Court: up to three Sets within two hours.
_Avoid_: "match" on its own, "game" (for this meaning)

**Set**
A tennis set within a Court Match. It is either completed, or stopped because time ran out.

**Game**
A tennis game within a Set. It is used only in this sense.
_Avoid_: "game" to mean a Court Match or an Appearance

**Score Submission**
One Team's report of the Set scores for a Team Match. Either Team's Captains may submit one. The first Score Submission accepted becomes the official score.

**Score Discrepancy**
When a later Score Submission from the other Team disagrees with the official score. An Administrator resolves it.

**Court Result**
Whether a Court Match counts as a win, tie, or loss for each pair, for Power purposes. It is distinct from the Team Points earned on that Court.

**Team Points**
League standings points a Team earns: per Set, summed per Court (max 6) and per Team Match (max 24), after penalties and adjustments.

**Rescheduling**
Moving a Team Match to a new date because of weather or a power outage, decided by the home Team's Captain. A Team Match is never cancelled.

## Player strength

**Appearance**
One Player playing one Court Match. This is what "Games Played" counts in PPG.
_Avoid_: game, game played (as a standalone term)

**Power**
Points a Player accrues per Appearance: 1×, 1.25×, or 1.5× the Playing Court number for a win, tie, or loss. Lower totals mean stronger results.

**PPG (Power Per Game)**
A Player's total Power divided by their Appearances within the current Season. Lower PPG means a stronger Player. The name is kept because the league uses it, even though the denominator is Appearances.

**Starting PPG**
A PPG value an Administrator sets for each Player at the start of a Season. It serves as the Player's PPG until their first Appearance of that Season, after which their real PPG applies.

**Power Ledger**
The permanent, append-only record of every Power award and adjustment for a Player in a Season. A Player's total Power, Appearances, and PPG are always derived from it.
