import { describe, expect, it } from "vitest"
import { makePlayer } from "@/engine/__tests__/helpers"
import { unavailability, unavailableIn } from "../utils/availability"

describe("availability", () => {
  it("names injured and suspended players, and only them", () => {
    const fit = makePlayer("a", "ST", 70)
    const hurt = makePlayer("b", "CB", 70, { injury: { until: "2026-10-01", label: "Knock" } })
    const healed = makePlayer("c", "CB", 70, { injury: { until: "2026-09-01", label: "Knock" } })
    const banned = makePlayer("d", "CM", 70, { banned: 1 })
    expect(unavailability(fit, "2026-09-10")).toBeNull()
    expect(unavailability(healed, "2026-09-10")).toBeNull()
    expect(unavailability(hurt, "2026-09-10")).toContain("injured")
    expect(unavailability(banned, "2026-09-10")).toContain("suspended")
    expect(unavailableIn([fit, hurt, banned, undefined], "2026-09-10")).toHaveLength(2)
  })

  it("lets a suspended player be named in a squad, but not an injured one", () => {
    const hurt = makePlayer("b", "CB", 70, { injury: { until: "2026-10-01", label: "Knock" } })
    const banned = makePlayer("d", "CM", 70, { banned: 1 })
    expect(unavailability(banned, "2026-09-10", false)).toBeNull()
    expect(unavailableIn([hurt, banned], "2026-09-10", false)).toEqual([
      "Test b is injured (Knock)",
    ])
  })
})
