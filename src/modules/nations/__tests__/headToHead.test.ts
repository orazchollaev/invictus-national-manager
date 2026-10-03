import { describe, expect, it } from "vitest"
import type { Fixture } from "@/engine/competition/types"
import { headToHead } from "@/modules/nations/utils/headToHead"

function fx(id: string, date: string, home: string, away: string, h?: number, a?: number): Fixture {
  return {
    id,
    compId: "friendly",
    stage: "friendly",
    label: "",
    date,
    home,
    away,
    atHome: true,
    importance: "friendly",
    result: h === undefined ? undefined : { h, a: a! },
  }
}

describe("head to head", () => {
  it("counts finished meetings from the first nation's side, home or away", () => {
    const h2h = headToHead(
      [
        fx("1", "2027-03-25", "TUR", "GRE", 2, 1),
        fx("2", "2027-06-10", "GRE", "TUR", 3, 0),
        fx("3", "2027-09-08", "TUR", "GRE", 1, 1),
        fx("4", "2027-10-12", "TUR", "AUT", 4, 0),
        fx("5", "2028-03-25", "GRE", "TUR"),
      ],
      "TUR",
      "GRE"
    )
    expect(h2h).toMatchObject({ played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 5 })
    expect(h2h.last?.id).toBe("3")
  })

  it("is empty before they meet", () => {
    expect(headToHead([], "TUR", "GRE")).toMatchObject({ played: 0, last: null })
  })
})
