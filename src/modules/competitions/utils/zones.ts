import type { CompetitionInstance } from "@/engine/competition/types"
import type { CompContext } from "@/engine/competition/runtime"
import { WC_PLACES, afcFourthRoundGroups, worldCupHosts } from "@/engine/competition/defs/fifa"
import { AWARDED_HOSTS } from "@/data/start"

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
  | "acq"
  | "next"
  | "host-group"
  | "up-gc"
  | "up-pi"
  | "best-up"
  | "gcp"
  | "best-gcp"
  | "down-pi"

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
  "wc-ac": { label: "Third round and Asian Cup", tone: "var(--success)" },
  acq: { label: "Asian Cup qualifying", tone: "var(--pos-3)" },
  next: { label: "Next round", tone: "var(--warning)" },
  "host-group": { label: "Qualifies if the host finishes above", tone: "var(--warning)" },
  "up-gc": { label: "Promoted and qualifies for the Gold Cup", tone: "var(--success)" },
  "up-pi": { label: "Promoted and Play-In", tone: "var(--success)" },
  "best-up": { label: "Promoted and Play-In if the best runner-up", tone: "var(--warning)" },
  gcp: { label: "Gold Cup Prelims", tone: "var(--pos-3)" },
  "best-gcp": {
    label: "Gold Cup Prelims if among the two best runners-up",
    tone: "var(--warning)",
  },
  "down-pi": { label: "Relegated, Play-In for the Gold Cup Prelims", tone: "var(--danger)" },
}

const letterOf = (name: string) => name.replace(/\d+$/, "")

/** The group of a stage holds one of the finals' hosts (AFCON qualifying). */
function hostGroup(
  inst: CompetitionInstance,
  stageKey: string,
  groupName: string,
  ctx: CompContext
) {
  const finals = ctx.instance(inst.id.replace("afconq", "afcon"))
  const hosts = finals?.hosts ?? AWARDED_HOSTS[inst.id.replace("afconq", "afcon")] ?? []
  const group = inst.stages
    .find((s) => s.key === stageKey)
    ?.groups?.find((g) => g.name === groupName)
  return !!group?.teams.some((t) => hosts.includes(t))
}

/**
 * Zone per table position (index 0 = top) for one group of a competition's stage.
 * Each entry mirrors the rules in engine/competition/defs; keep the two in step.
 */
export function zonesFor(
  inst: CompetitionInstance,
  groupName: string,
  size: number,
  ctx: CompContext,
  stageKey = "groups"
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
          return z("qf", "qf", "gcp", "gcp", "down-pi", "down-pi")
        case "B":
          return size >= 4 ? last("down", "up-gc", "best-gcp") : z("up-gc", "best-gcp")
        default:
          return z("up-pi", "best-up")
      }

    // World Cup qualifying (see defs/fifa.ts).
    case "wcq-uefa":
    case "wcq-caf":
      return z("through", "playoff")
    case "wcq-afc": {
      const two = afcFourthRoundGroups(inst.year, ctx) === 2
      switch (stageKey) {
        case "r2":
          return z("wc-ac", "wc-ac", "acq", "acq")
        case "r3":
          return two ? z("through", "through", "next", "next") : z("through", "through", "next")
        case "r4":
          return z("through", two ? "next" : "ic")
        default:
          return z()
      }
    }
    case "wcq-concacaf": {
      if (stageKey === "r2") return z("next", "next")
      const hosts = worldCupHosts(inst.year, ctx).filter((h) => ctx.confedOf(h) === "CONCACAF")
      const places = WC_PLACES.CONCACAF - hosts.length
      // Three final-round groups: winners, then the best runners-up, while places last.
      if (places >= 6) return z("through", "through", "playoff")
      if (places > 3) return z("through", "maybe", "playoff")
      return places === 3 ? z("through", "playoff") : z("maybe", "playoff")
    }
    case "wcq-ofc":
      return z("advance", "advance")
    case "wcq-conmebol": {
      const hosts = worldCupHosts(inst.year, ctx).filter((h) => ctx.confedOf(h) === "CONMEBOL")
      const direct = WC_PLACES.CONMEBOL - hosts.length
      return z(...Array<Zone>(direct).fill("through"), "ic")
    }

    // Continental qualifying.
    case "euroq":
      return z("through", "through", "playoff")
    case "afconq":
      return hostGroup(inst, stageKey, groupName, ctx)
        ? z("through", "host-group")
        : z("through", "through")
    case "asian-cupq":
      return z("through")

    // Finals where the best third-placed teams also go through.
    case "wc":
    case "euro":
    case "afcon":
    case "asian-cup":
      return z("advance", "advance", "third")
    case "cosafa":
      return z("advance", "maybe")
    case "wafu":
    case "cafa":
      return z("advance")

    // Round-robin tournaments: the table is the result.
    case "e1":
    case "baltic":
      return z("champion")

    default:
      return inst.kind === "super-cup" ? z() : z("advance", "advance")
  }
}
