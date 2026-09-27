import type { CompetitionInstance } from "@/engine/competition/types"
import type { CompContext } from "@/engine/competition/runtime"
import { WC_PLACES, worldCupHosts } from "@/engine/competition/defs/fifa"

/** What finishing in a table position leads to. */
export type Zone =
  | "qf"
  | "up"
  | "playoff-up"
  | "playoff-down"
  | "risk"
  | "down"
  | "through"
  | "playoff"
  | "ic"
  | "maybe"
  | "advance"
  | "third"
  | "champion"
  | "wc-ac"
  | "playoff-ac"
  | "cup"
  | "ofc"

export const ZONE_INFO: Record<Zone, { label: string; tone: string }> = {
  qf: { label: "Quarter-finals", tone: "var(--pos-2)" },
  up: { label: "Promoted", tone: "var(--success)" },
  "playoff-up": { label: "Promotion play-off", tone: "var(--pos-3)" },
  "playoff-down": { label: "Relegation play-off", tone: "var(--warning)" },
  risk: { label: "Relegation or relegation play-off", tone: "var(--warning)" },
  down: { label: "Relegated", tone: "var(--danger)" },
  through: { label: "Qualifies", tone: "var(--success)" },
  playoff: { label: "Play-offs (best placed)", tone: "var(--warning)" },
  ic: { label: "Inter-confederation play-off (best placed)", tone: "var(--pos-3)" },
  maybe: { label: "Qualifies if among the best runners-up", tone: "var(--warning)" },
  advance: { label: "Knockout stage", tone: "var(--success)" },
  third: { label: "Knockout stage if among the best thirds", tone: "var(--warning)" },
  champion: { label: "Champions", tone: "var(--gold)" },
  "wc-ac": { label: "World Cup and Asian Cup", tone: "var(--success)" },
  "playoff-ac": { label: "World Cup play-off (best placed) and Asian Cup", tone: "var(--warning)" },
  cup: { label: "Asian Cup (best third-placed)", tone: "var(--pos-3)" },
  ofc: { label: "World Cup, or inter-confederation play-off", tone: "var(--success)" },
}

const letterOf = (name: string) => name.replace(/\d+$/, "")

/**
 * Zone per table position (index 0 = top) for one group of a competition. Each
 * entry mirrors the rules in engine/competition/defs; keep the two in step.
 */
export function zonesFor(
  inst: CompetitionInstance,
  groupName: string,
  size: number,
  ctx: CompContext
): (Zone | null)[] {
  const z = (...list: (Zone | null)[]) => Array.from({ length: size }, (_, i) => list[i] ?? null)
  /** `top` from first place down, and `zone` for last place. */
  const last = (zone: Zone, ...top: (Zone | null)[]) =>
    z(...top, ...Array<null>(Math.max(0, size - 1 - top.length)).fill(null), zone)

  switch (inst.defId) {
    // Nations Leagues (see defs/nationsLeague.ts).
    case "unl":
      switch (letterOf(groupName)) {
        case "A":
          return last("down", "qf", "qf", "playoff-down")
        case "B":
          return last("down", "up", "playoff-up", "playoff-down")
        case "C":
          // The two worst fourth-placed go down, the other two play off.
          return last("risk", "up", "playoff-up")
        default:
          return z("up", "playoff-up")
      }
    case "cnl":
      switch (letterOf(groupName)) {
        case "A":
          return last("down", "qf", "qf")
        case "B":
          // Only the worst of the fourth-placed makes way for League C's winner.
          return size >= 4 ? last("risk", "up") : z("up")
        default:
          return z("up")
      }

    // World Cup qualifying (see defs/fifa.ts).
    case "wcq-uefa":
    case "wcq-caf":
      return z("through", "playoff")
    case "wcq-afc":
      return z("wc-ac", "playoff-ac", "cup")
    case "wcq-concacaf":
      return z("through", "ic")
    case "wcq-ofc":
      return z("ofc")
    case "wcq-conmebol": {
      const hosts = worldCupHosts(inst.year, ctx).filter((h) => ctx.confedOf(h) === "CONMEBOL")
      const direct = WC_PLACES.CONMEBOL - hosts.length
      return z(...Array<Zone>(direct).fill("through"), "ic")
    }

    // Continental qualifying.
    case "euroq":
      return z("through", "through", "playoff")
    case "afconq":
      return z("through", "maybe")

    // Finals where the best third-placed teams also go through.
    case "wc":
    case "euro":
    case "afcon":
    case "asian-cup":
      return z("advance", "advance", "third")
    case "cosafa":
      return z("advance", "maybe")
    case "wafu":
      return z("advance")

    // Round-robin tournaments: the table is the result.
    case "e1":
    case "baltic":
      return z("champion")

    default:
      return inst.kind === "super-cup" ? z() : z("advance", "advance")
  }
}
