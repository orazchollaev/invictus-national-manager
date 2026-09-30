# Architecture

How the game is put together and why. The short version lives in [`CLAUDE.md`](CLAUDE.md).

---

## The loop

The game is a calendar. `World.nextDay()` (engine/world/world.ts) moves the date on by
one day and runs whatever that day holds:

1. AI fixtures dated today are played by the match engine.
2. Competitions advance: draws due today are made, finished rounds produce the next,
   finished competitions produce outcomes (champions, qualifiers, next tiers).
3. Month start: ranking snapshot, board objectives refreshed, finished stadium works open.
4. 1 January: veterans retire and the year's youngsters come through (listed in the inbox);
   federations decide on new stadium works.
   1 July: season rollover — a season of development and the summer transfers.
5. Mondays: the abstract club week (form, sharpness, injuries).
6. 24 days before a window: friendlies arranged for every free date.
7. 10 days before a nation's next fixture: its squad is named.

`World.advance()` repeats that until the user is needed — a job offer arrives or his nation
is awarded a tournament (both shown as popups wherever he is), his call-up is due, his team
plays today, or he is out of work with offers waiting — and returns an `Interrupt`.
The store's `proceed(step)` runs it one day at a time — 1, 7 or 30 days, or up to the
next match (Settings → Continue moves on) — painting each day.

## Static data

`scripts/generate-world.ts` builds `src/data/{nations,clubs,players}.json` once, from:

- the official FIFA men's ranking of 20 July 2026 (api.fifa.com), all 211 members;
- `scripts/data/non-fifa.ts`: the 11 confederation and regional members outside FIFA,
  appended after the FIFA members, with points from their Elo. They never enter World
  Cup qualifying and their matches do not move the FIFA ranking (`NationDef.nonFifa`);
- eloratings.net (the strength signal, blended 70/30 with FIFA points);
- `scripts/data/nation-meta.ts`: flags, regional federations, naming cultures;
- `src/data/names`: ~55 naming cultures (the runtime needs them for newgens too).

Every nation gets 80 fictional players drawn from its strength; the seed is fixed, so
the output is byte-identical on every run. Real draws already made on the start date
(Nations League 2026–27 leagues, AFCON 2027 qualifying groups, Asian Cup 2027 groups,
awarded hosts) live in `src/data/start.ts`.

## Match engine

`engine/match/engine.ts` plays a match one minute at a time. The eleven on the pitch are
rolled up into defence, midfield and attack units by the role each fills (fit, fatigue,
form, home advantage, mentality). Each minute:

- possession is contested in midfield;
- the side on the ball may attack (attack vs defence edge, tempo, mentality);
- an attack breaks down, goes offside, wins a penalty, or becomes a shot whose quality
  (xG) depends on the edge; the shooter's finishing against the keeper decides it;
- fouls (pressing, temperament) bring cards and set pieces; players tire and get hurt.

Every player has an **archetype** (`engine/players/archetypes.ts`): Poacher, Target man,
Ball winner, Sweeper-keeper… drawn once from his id and natural position, so it needs no
saved state and never changes. It shades his share of the side's defence, midfield and
attack, who shoots, assists, heads, tackles and fouls, and finishing or shot-stopping by a
point or two. Factors average out to 1 per position, so mixed squads keep the calibration
below and only lopsided ones feel different. Badges (Big-game player, Reliable, Erratic,
Injury-prone, Tires early) are read from character and age and describe effects the engine
already has.

Every attack comes down a **lane** (`engine/match/lanes.ts`): left, centre or right of the
attacking team. The lane follows where the side's attacking players are, how wide it is asked
to play, and the flank where the opponent is weakest; the players involved, and the defenders
who meet them, are those in or near that lane. Attacks, shots, goals and offsides carry it, so
the feed draws an arrow for each and the stats show where each side attacked from.

Each slot can ask for a **role** (`engine/match/roles.ts`: Stopper, Wing-back, Poacher,
Pressing forward…). A role reshapes the slot like an archetype does, always as a trade-off,
and a player whose archetype suits it plays two ability points above himself. A sheet
without roles plays as before; a role the slot cannot ask for is ignored; changing shape
mid-match clears them. The AI coach gives each player the role that suits him.

Team instructions (defensive line, width, counter-attack, next to mentality, pressing and
tempo) are read by `engine/match/matchup.ts`: each has a small cost and benefit of its own,
and meeting the opponent's way of playing adds matchups (balls in behind a high line,
a patient side pressed, a lone striker against three centre-backs, width against a back
five). Tests pin that no style is unbeatable and none is a free gain. AI coaches pick a
habit from their strength and their nation, so opponents differ.

Before a match the staff write a **scouting report** (`engine/match/scouting.ts`) on the
opponent's expected sheet: how they play, four players to watch (best, goal threat, creator,
weak link), and which matchups favour whom. The matchups are the same `RULES` table the
engine multiplies by, so the report cannot promise what the match will not deliver. The
assistant's advice tries every defensive line, width and counter-attack setting against the
opponent and suggests the best one if it is worth at least one per cent; tempo and pressing are
left alone because their costs are paid elsewhere. Looking changes nothing: squads are named ten
days before a match, and earlier the report uses who would be picked today. With "Assistant
picks the team" on, the assistant plays the advice himself.

The score is only what those events add up to. Knockout matches go to extra time and a
kick-by-kick shootout. The AI touchline chases games late, sits on leads and makes
planned changes; the user's side is left alone (injuries wait for him). Calibration is
pinned in `__tests__/engine.test.ts` (≈2.6 goals, ≈12 shots a side, realistic upsets).

## Competitions

`engine/competition/runtime.ts` is format-agnostic: a competition is a list of stages
(group stages and knockout stages). Each **definition** in `defs/` says, per edition, what
the stages are, when they are drawn, their dates and who enters (usually the outcome of
another competition). The runtime draws, schedules around clashes (never into the past),
and advances. Stage plans are matched to state by key, and structural choices (a
preliminary round or not) are fixed when an edition is created, so a saved competition
never reshapes itself.

Builders cover almost everything: `finalsDef` (groups then a bracket, best thirds, third
place), `qualifierDef` (optional preliminary round, groups, play-off paths, places to the
inter-confederation play-off), `nationsLeagueDef` (tiers with promotion and relegation).

Calendar: FIFA windows 2026–2030 are the published ones; later years follow the same
shape. Every edition after the known ones is generated from the same rules, with hosts
chosen in-game, so 2040 plays like 2028.

## Long-run consistency

A nation's `youthLevel` anchors its pool: newgens are drawn from the same distribution
as the starting pool, development follows an age curve shaped by professionalism, club
level and playing time, and decline and retirement mirror it. Success nudges a youth
level by at most ±4. `__tests__/longrun.test.ts` (LONGRUN=1) plays twenty seasons and
checks pool sizes, ages and that national strength stays within a band.

## Persistence

The world is one JSON string per save slot (three slots) in IndexedDB, with a small meta
record for the slot list. It is written after every user match, call-up and `proceed()`.
Settings persist through `pinia-plugin-persistedstate-2`; the world store opts out.

## Federations

Every nation has a federation reputation (1–10), in `engine/world/federation.ts`.
Reputation rises with trophies and qualifications and drifts back towards what the
ranking points suggest. Once a year it moves the academies' level (at most ±6 from where
the nation started).

## Stadiums and hosting

`engine/world/stadiums.ts`, after True Football National Manager. Every nation has grounds
city by city (`src/data/stadiums.ts`: real grounds and capacities, a national stadium in
the capital for the rest, and the grounds being built on the start date). Their size sets
a stadium level (1–5), which gives the home advantage.

Tournaments ask their hosts, together, for a number of grounds above a size and one
showpiece (World Cup: 12 of 40,000 and one of 80,000; each confederation's cup and the
regional cups less). Hosts are picked among the nations whose grounds — counting works
under way — reach at least half of that, weighted by strength, stature and readiness; a
World Cup or continental host that falls short is joined by co-hosts from its
confederation. The user's federation can bid, which counts four times over.

Each 1 January a federation may start a project — expanding a ground or building a new
one, over one to four years — more often the higher its reputation and the more it
outperforms its ranking. A nation awarded a tournament builds what it still lacks, done
four months before kick-off. The user's nation being awarded one stops the calendar
with a popup.

## UEFA formats in transition

The 2026–27 Nations League is the last with four leagues: its promotion and relegation
fill three leagues of 18 (League D all goes up, nobody leaves C). From 2028–29 each league
is three groups of six, six matches each (`sixMatchRounds` in competition/draw.ts). Euro
2028 qualifying is twelve groups of four or five with the hosts playing and two places
reserved for them. From 2028 the European Qualifiers (`defs/uefaQualifiers.ts`) split UEFA
into League 1 (three Swiss groups of 12) and League 2 — World Cup 2030 qualifying and
Euro 2032 qualifying onwards. Where UEFA had not published a detail yet (the split
between direct places and play-offs, the Nations League quarter-finals with three
groups), the definitions say how it is modelled.

## Squads and draws

A squad is named once per period: a window, or a tournament. Friendlies in the window
just before a tournament (up to ~3½ weeks ahead) use the tournament squad, so the user
names one squad for both. With "Assistant picks the team" on, squads and elevens are
chosen by the AI coach logic and the loop never stops for them.

Draws involving the user stop the loop (`Interrupt` kind `draw`) so they can be watched
on the draw screen, which replays the already-made draw pot by pot. "Watch my draws"
turns the stop off.
