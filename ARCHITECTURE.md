# Architecture

How the game is put together and why. The short version lives in [`CLAUDE.md`](CLAUDE.md).

---

## The loop

The game is a calendar. `World.nextDay()` (engine/world/world.ts) moves the date on by
one day and runs whatever that day holds:

1. AI fixtures dated today are played by the match engine.
2. Competitions advance: draws due today are made, finished rounds produce the next,
   finished competitions produce outcomes (champions, qualifiers, next tiers).
3. Month start: ranking snapshot, board objectives refreshed.
4. 1 January: veterans retire and the year's youngsters come through (listed in the inbox).
   1 July: season rollover — a season of development and the summer transfers.
5. Mondays: the abstract club week (form, sharpness, injuries).
6. 24 days before a window: friendlies arranged for every free date.
7. 10 days before a nation's next fixture: its squad is named.

`World.advance()` repeats that until the user is needed — his call-up is due, his team
plays today, or he is out of work with offers waiting — and returns an `Interrupt`.
The store's `proceed(step)` runs it one day at a time — 1, 7 or 30 days, or up to the
next match (Settings → Continue moves on) — painting each day.

## Static data

`scripts/generate-world.ts` builds `src/data/{nations,clubs,players}.json` once, from:

- the official FIFA men's ranking of 20 July 2026 (api.fifa.com), all 211 members;
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

Every nation has a federation reputation (1–10) and stadiums (1–5), in
`engine/world/federation.ts`. Reputation rises with trophies and qualifications and
drifts back towards what the ranking points suggest. Once a year it moves the academies'
level (at most ±6 from where the nation started) and, when high enough, the stadiums are
rebuilt. Stadiums set the size of the home advantage; reputation × stadiums weights who
is chosen to host future tournaments. New host decisions are announced in the news.

## Squads and draws

A squad is named once per period: a window, or a tournament. Friendlies in the window
just before a tournament (up to ~3½ weeks ahead) use the tournament squad, so the user
names one squad for both. With "Assistant picks the team" on, squads and elevens are
chosen by the AI coach logic and the loop never stops for them.

Draws involving the user stop the loop (`Interrupt` kind `draw`) so they can be watched
on the draw screen, which replays the already-made draw pot by pot. "Watch my draws"
turns the stop off.
