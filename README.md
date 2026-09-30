# Invictus - National Manager

<p align="center">
  <img src="public/logo.png" alt="Invictus - National Manager logo" width="128" height="128" />
</p>

Take charge of one of 222 senior national teams and lead it through
qualifiers, continental cups and the World Cup. The career starts on 1 September 2026
and runs for as long as you keep your job.

Inspired by True Football National Manager. Built with Vue 3, TypeScript and Capacitor
for Android; it also runs in the browser.

## Features

- **Every nation** — all 211 FIFA members, seeded from the official FIFA ranking of
  20 July 2026 and eloratings.net, plus the 11 teams outside FIFA that play in a
  confederation or regional federation (Martinique, Guadeloupe, Réunion, Zanzibar…),
  each with a pool of 80 fictional players.
- **A living calendar** — the real FIFA international windows for 2026–2030, and the same
  shape every year after. Advance one day, a week, a month or straight to the next match.
- **Real competition structures** — World Cup and every confederation's qualifying route
  (including the inter-confederation play-off), Euro, Copa América, AFCON, Asian Cup,
  Gold Cup, OFC Nations Cup, the UEFA and CONCACAF Nations Leagues, the Finalissima and
  regional cups such as the Arab Cup, Gulf Cup, ASEAN, SAFF, COSAFA and more.
- **Draws you can watch** — pots, confederation limits and host placement, replayed pot by
  pot on the draw screen. Draws are made before the last play-offs with placeholders for
  the open places.
- **Squad and tactics** — call up your squad for each window or tournament, pick the
  eleven, choose from ten formations and set mentality, tempo and pressing. Or let the
  assistant pick the team.
- **Player styles** — every player is a Poacher, Target man, Ball winner, Sweeper-keeper…
  with badges for big-game nerve, reliability and fragility. Styles change who scores,
  creates and tackles, so picking the eleven is more than sorting by rating.
- **Minute-by-minute matches** — a match engine that plays possession, attacks, shots
  (xG), fouls, cards, injuries and fatigue, with live text commentary, extra time and
  kick-by-kick shootouts, followed by a match report.
- **Career** — board objectives per competition, a confidence meter that results move,
  the sack when it runs out, and job offers from other federations when your reputation
  is there.
- **A world that keeps going** — players develop, decline and retire, youngsters come
  through every January, clubs trade every summer, federations grow and rebuild their
  stadiums, and future hosts are announced years ahead.
- **History** — FIFA ranking, honours, nation profiles and an inbox with the news.
- **Three save slots**, stored locally in IndexedDB. No account needed.

## Tech stack

| Area     | Tools                                                    |
| -------- | -------------------------------------------------------- |
| UI       | Vue 3, vue-router, reka-ui, Lucide icons, Chart.js       |
| State    | Pinia, pinia-plugin-persistedstate-2, idb-keyval         |
| Language | TypeScript, vue-i18n (English)                           |
| Build    | Vite, vue-tsc                                            |
| Mobile   | Capacitor 8 (Android)                                    |
| Quality  | Vitest, ESLint, Prettier, husky, lint-staged, commitlint |
| Release  | release-it with conventional changelog                   |

## Getting started

Requires Node.js and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev          # dev server on http://localhost:2010
```

### Scripts

| Command           | What it does                                                    |
| ----------------- | --------------------------------------------------------------- |
| `pnpm dev`        | Start the Vite dev server                                       |
| `pnpm build`      | Type check, run the tests, then build to `dist/`                |
| `pnpm preview`    | Serve the production build                                      |
| `pnpm test`       | Run the test suite once                                         |
| `pnpm test:watch` | Run the tests in watch mode                                     |
| `pnpm lint`       | Lint with ESLint (`lint:fix` to fix)                            |
| `pnpm format`     | Format with Prettier (`format:check` to check)                  |
| `pnpm gen:world`  | Regenerate `src/data` from `scripts/` (deterministic)           |
| `pnpm release`    | Bump the version, update `CHANGELOG.md` and tag (`release:dry`) |

The twenty-season soak test is skipped by default. Run it with `LONGRUN=1 pnpm test`
(or put `LONGRUN=1` in `.env`).

### Android

```bash
pnpm build
pnpm exec cap sync android
pnpm exec cap open android   # build and run from Android Studio
```

Icons and the splash screen are generated from `assets/` with
`pnpm exec capacitor-assets generate --android`.

## Project structure

```
scripts/          World generator and its raw inputs
src/
  assets/style/   Global CSS: tokens, base, layout, utilities
  components/     App shell (layout/) and design-system primitives (ui/)
  data/           Static game data: nations, clubs, players, name pools, real draws
  engine/         Pure, seeded game logic — no Vue, no stores, no DOM
    match/        Match engine and commentary
    competition/  Competition runtime and every competition's definition
    calendar/     Dates and FIFA international windows
    players/      Ability, development, retirement, youth intake, clubs
    ai/           Squad and line-up selection for AI coaches
    career/       Objectives, confidence, sacking, job offers
    world/        World state and the day-by-day loop
  modules/        Feature modules: career, competitions, core, match, nations,
                  news, settings, squad, world
  i18n/  lib/  router/
android/          Capacitor Android project
```

All game logic is deterministic: every random draw comes from a stream derived from the
world seed, so the same seed plays out the same way. See
[`ARCHITECTURE.md`](ARCHITECTURE.md) for how the game loop, match engine, competitions and
persistence fit together, and [`CLAUDE.md`](CLAUDE.md) for the coding rules.

## Contributing

Commits follow [Conventional Commits](https://www.conventionalcommits.org) and are
checked by commitlint. ESLint and Prettier run on staged files before each commit.
Changes are listed in [`CHANGELOG.md`](CHANGELOG.md).
