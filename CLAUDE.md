# Invictus - National Manager

Vue 3 + TypeScript + Pinia + Capacitor (Android only). Manage one of the 211 FIFA
members' senior national teams from 1 September 2026, inspired by True Football National
Manager. Package manager: **pnpm**. English only.

Full reasoning behind these rules: [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Commands

```bash
pnpm dev                # vite dev server on :2010
pnpm lint               # eslint
pnpm exec vue-tsc -b    # type check
pnpm test               # vitest run (the 20-season soak test runs with LONGRUN=1)
pnpm build              # vue-tsc -b && vitest run && vite build
pnpm gen:world          # regenerate src/data from scripts/raw (deterministic)
```

## Where code goes

```
scripts/          One-off data builders (generate-world.ts) and their raw inputs.
src/
  assets/style/   Global CSS only: tokens, base, layout, utilities.
  components/
    layout/       App shell (header, bottom nav, error boundary).
    ui/           Design-system primitives. Only place reka-ui may be imported.
  composables/    App-wide composables.
  data/           Static game data: nations, clubs, starting players, name pools,
                  real draws in progress on the start date (start.ts).
  engine/         Pure game logic. No Vue, no stores, no DOM. Well tested.
    match/        Minute-by-minute match engine and commentary.
    competition/  Competition runtime and every competition's definition (defs/).
    calendar/     Dates and the FIFA international windows.
    players/      Ability, development, retirement, youth intake, clubs.
    ai/           Squad and line-up selection for AI coaches.
    career/       Objectives, confidence, sacking, job offers.
    world/        The world state and the day-by-day loop.
  i18n/           vue-i18n setup (en only).
  lib/            Infrastructure adapters (IndexedDB, flags).
  modules/        Feature modules (career, competitions, core, match, nations, news,
                  settings, squad, world).
  router/
```

Every module uses the same skeleton — use these names, not synonyms:

```
src/modules/<name>/
  components/     Only .vue. Subfolders group by feature, each with an index.ts barrel.
  composables/    Only use*.ts.
  pages/          Route targets.
  services/       IO and side effects (persistence).
  store.ts        Pinia store — OR store/ when split into slices. Never both.
  utils/          Pure helpers. No reactivity, no IO.
```

## Rules

**Engine** — pure and seeded. Every random draw goes through `engine/rng.ts` streams
derived from the world seed and a key; never `Math.random` in game logic. No module-level
mutable config.

**World state** — `World` (engine/world/world.ts) owns `WorldState` and mutates it in
place. The Pinia store keeps it `markRaw` and bumps `tick`; read it through
`world.derive(fn, fallback)`. Saves are written by hand to IndexedDB slots
(modules/world/services/saves.ts); the world store opts out of the persistence plugin.

**Imports** — always `@/`. `./sibling` and `../types` are fine; `../../` or deeper is not.

**UI** — feature modules never import `reka-ui`. Compose the wrappers in
`@/components/ui`. Mobile first: design for 360–767px; the bottom bar is the navigation.

**Styling** — `<style scoped>` for one component; a sibling `.css` for a folder; tokens
in `src/assets/style/`. Use `var(--token)`, never literal hex (pitch colours are tokens).

**Tests** — `__tests__/` next to the code. Engine tests are plain function tests.

## Conventions

- Conventional Commits (commitlint + husky).
- Prettier + ESLint run on staged files via lint-staged.
- Order in SFCs: `<script>`, `<template>`, `<style>`.
