import type { Player } from "@/engine/types"
import {
  BOND_LABELS,
  BOND_POINTS,
  bondBetween,
  bondsAmong,
  chemistryOf,
  type BondKind,
} from "@/engine/players/bonds"

export interface Relation {
  player: Player
  kind: BondKind
  points: number
}

const ORDER: Record<BondKind, number> = { feud: 0, friends: 1, clubmates: 2 }

/** The bonds a player has with some others, feuds first. */
export function relationsOf(player: Player, others: Player[]): Relation[] {
  const out: Relation[] = []
  for (const o of others) {
    const kind = bondBetween(player, o)
    if (kind) out.push({ player: o, kind, points: BOND_POINTS[kind] })
  }
  return out.sort(
    (a, b) => ORDER[a.kind] - ORDER[b.kind] || a.player.last.localeCompare(b.player.last)
  )
}

export interface BondLine {
  key: string
  kind: BondKind
  text: string
  /** Ability points each of the two gets from it. */
  points: number
}

const name = (p: Player) => `${p.first ? `${p.first[0]}. ` : ""}${p.last}`

/** The bonds inside an eleven, one line each, feuds first. */
export function bondLines(
  players: Player[],
  clubName: (id: string) => string | undefined
): BondLine[] {
  const byId = new Map(players.map((p) => [p.id, p]))
  return bondsAmong(players)
    .map((b) => {
      const a = byId.get(b.a)!
      const c = byId.get(b.b)!
      const club = b.kind === "clubmates" ? clubName(a.clubId) : undefined
      return {
        key: `${b.a}|${b.b}`,
        kind: b.kind,
        text: `${name(a)} & ${name(c)} · ${BOND_LABELS[b.kind]}${club ? ` at ${club}` : ""}`,
        points: BOND_POINTS[b.kind],
      }
    })
    .sort((x, y) => ORDER[x.kind] - ORDER[y.kind])
}

/**
 * What a player would bring to an eleven through his bonds with it, leaving out whoever
 * he would replace: the points a manager sees next to his name when picking.
 */
export function chemistryWith(candidate: Player, eleven: Player[], replacing?: Player): number {
  return chemistryOf(
    candidate,
    eleven.filter((p) => p.id !== candidate.id && p.id !== replacing?.id)
  )
}

/** "+0.8", "−1" — a chemistry figure for display, empty for none. */
export function signed(points: number): string {
  if (Math.abs(points) < 0.05) return ""
  const v = Math.round(points * 10) / 10
  return `${v > 0 ? "+" : "−"}${Math.abs(v)}`
}
