import type { CompetitionInstance } from "@/engine/competition/types"
import type { CompContext } from "@/engine/competition/runtime"
import { WC_PLACES, afcFourthRoundGroups, worldCupHosts } from "@/engine/competition/defs/fifa"
import { AWARDED_HOSTS } from "@/data/start"
import { isTransitionEdition } from "@/engine/competition/defs/nationsLeague"
import { qualifierSplit } from "@/engine/competition/defs/uefaQualifiers"

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
  | "qf-third"
  | "playoff-risk"
  | "host"

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
  "qf-third": { label: "Quarter-finals if among the two best thirds", tone: "var(--warning)" },
  "playoff-risk": {
    label: "Relegation play-off if among the two worst thirds",
    tone: "var(--warning)",
  },
  host: { label: "Qualified as host", tone: "var(--success)" },
}

/**
 * League 1 of the European Qualifiers: the direct places, then the positions that
 * can still reach the play-offs.
 */
function europeanQualifierZones(
  places: number,
  stageKey: string,
  z: (...list: (Zone | null)[]) => (Zone | null)[],
  hosts: string[] = [],
  rows: string[] = []
) {
  if (stageKey === "l2") return z("playoff")
  const { perGroup, ties } = qualifierSplit(places)
  const playoffRows = Math.ceil(Math.max(0, ties * 2 - 3) / 3)
  if (!rows.some((t) => hosts.includes(t)))
    return z(...Array<Zone>(perGroup).fill("through"), ...Array<Zone>(playoffRows).fill("playoff"))
  // A host has its place already and takes none of the group's: the places pass down.
  let others = 0
  return z(
    ...rows.map((t): Zone | null => {
      if (hosts.includes(t)) return "host"
      others++
      return others <= perGroup ? "through" : others <= perGroup + playoffRows ? "playoff" : null
    })
  )
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
  stageKey = "groups",
  /** The group's teams in table order, for competitions whose places depend on who they are. */
  rows: string[] = []
): (Zone | null)[] {
  const z = (...list: (Zone | null)[]) => Array.from({ length: size }, (_, i) => list[i] ?? null)
  /** `top` from first place down, and `zone` for last place. */
  const last = (zone: Zone, ...top: (Zone | null)[]) =>
    z(...top, ...Array<null>(Math.max(0, size - 1 - top.length)).fill(null), zone)

  switch (inst.defId) {
    // Nations Leagues (see defs/nationsLeague.ts).
    case "unl":
      // 2026–27: rebalanced for three leagues of 18 (nobody leaves League C).
      if (isTransitionEdition(inst.year))
        switch (letterOf(groupName)) {
          case "A":
            return z("qf", "qf", "playoff-risk", "risk")
          case "B":
            return z("up", "playoff-up", null, "playoff-down")
          case "C":
            return z("up", "playoff-up")
          default:
            return z(...Array<Zone>(size).fill("up"))
        }
      // From 2028–29: three leagues of 18, groups of six.
      switch (letterOf(groupName)) {
        case "A":
          return last("down", "qf", "qf", "qf-third", null, "playoff-down")
        case "B":
          return last("down", "up", "playoff-up", null, null, "playoff-down")
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
    case "wcq-uefa": {
      const hosts = worldCupHosts(inst.year, ctx).filter((h) => ctx.confedOf(h) === "UEFA")
      return europeanQualifierZones(WC_PLACES.UEFA - hosts.length, stageKey, z, hosts, rows)
    }
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
    case "euroq": {
      // Euro 2028: winners, the eight best runners-up, then play-offs.
      if (inst.year <= 2028) return z("through", "maybe")
      const all =
        ctx.instance(`euro-${inst.year}`)?.hosts ?? AWARDED_HOSTS[`euro-${inst.year}`] ?? []
      // The two best ranked hosts qualify without playing for it.
      const hosts = [...all].sort((a, b) => ctx.points(b) - ctx.points(a)).slice(0, 2)
      return europeanQualifierZones(24 - hosts.length, stageKey, z, hosts, rows)
    }
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
