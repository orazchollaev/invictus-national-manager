import type { Ref } from "vue"
import { useWorldStore } from "@/modules/world/store"

/** Everything the club page shows about one club, or null when there is no such club. */
export function useClub(id: Ref<string>) {
  const world = useWorldStore()
  return world.derive((w) => {
    const club = w.clubs.get(id.value)
    if (!club) return null
    const profile = w.clubProfile(club.id)
    const me = w.userNation
    const byAbility = (a: { ca: number }, b: { ca: number }) => b.ca - a.ca
    const mine = me
      ? w
          .pool(me)
          .filter((p) => p.clubId === club.id)
          .sort(byAbility)
      : []
    const best = w
      .playerList()
      .filter((p) => p.clubId === club.id)
      .sort(byAbility)
      .slice(0, 8)
    const rival = profile.rival ? w.clubs.get(profile.rival) : undefined
    const league = (w.clubIndex.get(club.nationId) ?? []).map((ids, i) => ({
      level: i + 1,
      clubs: ids
        .map((cid) => w.clubs.get(cid))
        .filter((c): c is NonNullable<typeof c> => !!c)
        .map((c) => ({ id: c.id, name: c.name })),
    }))
    return {
      club,
      profile,
      rival: rival ? { id: rival.id, name: rival.name } : null,
      mine,
      best,
      league: league.filter((l) => l.clubs.length),
    }
  }, null)
}
