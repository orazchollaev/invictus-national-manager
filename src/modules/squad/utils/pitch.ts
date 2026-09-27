import type { Position } from "@/engine/types"
import { FORMATIONS } from "@/engine/match/formations"
import type { Formation } from "@/engine/match/types"

/**
 * Where each slot of a formation is drawn on a portrait pitch, as [x, y]
 * percentages, own goal at the bottom. Purely visual: the engine reads roles.
 */
export function slotPositions(formation: Formation): [number, number][] {
  const roles = FORMATIONS[formation]
  const backThree = formation.startsWith("3")
  const wideMidfield = /^(4-4|5-4|4-1-4|3-4)/.test(formation)
  const count = (r: Position) => roles.filter((x) => x === r).length
  const seen = new Map<Position, number>()

  const spread = (n: number, i: number, from: number, to: number) =>
    n === 1 ? 50 : from + ((to - from) * i) / (n - 1)

  return roles.map((role) => {
    const i = seen.get(role) ?? 0
    seen.set(role, i + 1)
    const n = count(role)
    switch (role) {
      case "GK":
        return [50, 91]
      case "CB":
        return [spread(n, i, n === 3 ? 26 : 36, n === 3 ? 74 : 64), 75]
      case "LB":
        return [12, backThree ? 48 : 70]
      case "RB":
        return [88, backThree ? 48 : 70]
      case "DM":
        return [spread(n, i, 36, 64), 59]
      case "CM":
        return [spread(n, i, n === 2 ? 36 : 30, n === 2 ? 64 : 70), 47]
      case "AM":
        return [50, 33]
      case "LW":
        return [14, wideMidfield ? 45 : 24]
      case "RW":
        return [86, wideMidfield ? 45 : 24]
      case "ST":
        return [spread(n, i, 38, 62), 13]
    }
  })
}
