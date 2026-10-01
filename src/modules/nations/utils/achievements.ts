import type { CompetitionInstance, CompetitionKind } from "@/engine/competition/types"

/** How far a nation went in one finished edition of a tournament. */
export interface Finish {
  compId: string
  defId: string
  year: number
  kind: CompetitionKind
  /** 1, 2 or 3 for a podium finish. */
  place: number | null
  /** The knockout round it went out in, as the engine names it. */
  round: string | null
  /** Its place in a league-only event. */
  position: number | null
  host: boolean
}

/** A tournament's tally for one nation, across every edition it took part in. */
export interface TournamentRecord {
  defId: string
  kind: CompetitionKind
  titles: number[]
  appearances: number
  best: Finish
}

/** Every edition counts for these; the rest only when the nation made the podium. */
const FULL: ReadonlySet<CompetitionKind> = new Set(["world-cup", "continental", "regional"])
const KIND_ORDER: CompetitionKind[] = [
  "world-cup",
  "continental",
  "nations-league",
  "regional",
  "super-cup",
]

function teamsOf(inst: CompetitionInstance): Set<string> {
  const out = new Set<string>()
  for (const s of inst.stages) {
    for (const g of s.groups ?? []) for (const t of g.teams) out.add(t)
    for (const r of s.rounds ?? [])
      for (const tie of r.ties) {
        if (tie.home) out.add(tie.home)
        if (tie.away) out.add(tie.away)
      }
  }
  return out
}

/** One nation's finish in a finished edition, or null if it was not there. */
export function finishIn(inst: CompetitionInstance, id: string): Finish | null {
  if (inst.status !== "done" || inst.kind === "qualifier") return null
  const o = inst.outcome
  const place = o.winner === id ? 1 : o.runnerUp === id ? 2 : o.third === id ? 3 : null
  if (!place && !FULL.has(inst.kind)) return null
  if (!place && !teamsOf(inst).has(id)) return null
  let round: string | null = null
  let knockout = false
  for (const s of inst.stages) {
    if (s.kind !== "knockout") continue
    knockout = true
    for (const r of s.rounds ?? []) if (r.ties.some((tie) => tie.loser === id)) round = r.name
  }
  const at = o.placings?.indexOf(id) ?? -1
  return {
    compId: inst.id,
    defId: inst.defId,
    year: inst.year,
    kind: inst.kind,
    place,
    round: place ? null : round,
    position: !place && !round && !knockout && at >= 0 ? at + 1 : null,
    host: inst.hosts.includes(id),
  }
}

/** Lower is better: podium, then the later the knockout round, then the league place. */
function rank(f: Finish, inst: CompetitionInstance): number {
  if (f.place) return f.place
  if (f.round) {
    const rounds = inst.stages.flatMap((s) => s.rounds ?? []).map((r) => r.name)
    return 10 + (rounds.length - rounds.indexOf(f.round))
  }
  if (f.position) return 100 + f.position
  return 1000
}

/** Every finished edition the nation played in, newest first, and a tally per tournament. */
export function achievementsOf(competitions: Record<string, CompetitionInstance>, id: string) {
  const insts = Object.values(competitions)
  const finishes = insts
    .map((inst) => ({ inst, f: finishIn(inst, id) }))
    .filter((x): x is { inst: CompetitionInstance; f: Finish } => !!x.f)
    .sort((a, b) => b.inst.end.localeCompare(a.inst.end))

  const byDef = new Map<string, TournamentRecord & { bestRank: number }>()
  for (const { inst, f } of finishes) {
    const r = rank(f, inst)
    const rec = byDef.get(f.defId)
    if (!rec) {
      byDef.set(f.defId, {
        defId: f.defId,
        kind: f.kind,
        titles: f.place === 1 ? [f.year] : [],
        appearances: 1,
        best: f,
        bestRank: r,
      })
      continue
    }
    rec.appearances++
    if (f.place === 1) rec.titles.push(f.year)
    if (r < rec.bestRank) Object.assign(rec, { best: f, bestRank: r })
  }
  const records: TournamentRecord[] = [...byDef.values()]
    .sort(
      (a, b) =>
        KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
        b.titles.length - a.titles.length ||
        a.bestRank - b.bestRank
    )
    .map(({ defId, kind, titles, appearances, best }) => ({
      defId,
      kind,
      titles,
      appearances,
      best,
    }))
  return { finishes: finishes.map((x) => x.f), records }
}
