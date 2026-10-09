/**
 * Domain types shared by the engine and the app. The engine owns them because it is
 * the only layer every other one depends on; modules re-export what they need.
 */
import type { Text } from "./text"
import type { Attrs } from "./players/attributes"

/** Calendar date as `YYYY-MM-DD`. Lexical order is chronological order. */
export type ISODate = string

export type Confed = "UEFA" | "CAF" | "AFC" | "CONCACAF" | "CONMEBOL" | "OFC"
export const CONFEDS: Confed[] = ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"]

export type Position = "GK" | "CB" | "LB" | "RB" | "DM" | "CM" | "AM" | "LW" | "RW" | "ST"
export const POSITIONS: Position[] = ["GK", "CB", "LB", "RB", "DM", "CM", "AM", "LW", "RW", "ST"]

/** Coarse grouping used for event weights (who scores, who gets booked). */
export type PositionGroup = "GK" | "DEF" | "MID" | "FWD"

export type Foot = "L" | "R" | "B"

/** 1–20 each, hidden-ish traits that shape development, discipline and nerve. */
export interface Personality {
  professionalism: number
  ambition: number
  temperament: number
  consistency: number
  bigMatch: number
  injuryProne: number
  loyalty: number
}

export type ClubRole = "star" | "starter" | "rotation" | "bench" | "reserve"

export interface Club {
  id: string
  name: string
  /** Nation whose league the club plays in. */
  nationId: string
  /** 1 = elite, 5 = semi-professional. */
  tier: number
}

export interface Injury {
  /** First day the player is fit again. */
  until: ISODate
  label: Text
}

export interface PlayerSeason {
  /** Season start year: 2026 means 2026-27. */
  season: number
  ca: number
  clubId: string
  caps: number
  goals: number
  /** His attributes at the start of the season, for the card's change arrows. */
  attrs?: Attrs
}

/**
 * A face edited by hand: each field replaces one feature of the face drawn from the
 * player's id and leaves the others as they were. Ids are facesjs feature ids.
 */
export interface FaceEdit {
  /** Skin and hair colours as `#rrggbb`. */
  skin?: string
  hairColor?: string
  hair?: string
  head?: string
  ear?: string
  eye?: string
  eyebrow?: string
  nose?: string
  mouth?: string
  facialHair?: string
  glasses?: string
  eyeLine?: string
  smileLine?: string
  miscLine?: string
  /** 0 (lean) … 1 (heavy). */
  fatness?: number
}

export interface Player {
  id: string
  nationId: string
  first: string
  last: string
  born: ISODate
  pos: Position
  /** Positions the player can cover without the out-of-position penalty. */
  alt: Position[]
  foot: Foot
  /** Current ability, 1–99 with one decimal. */
  ca: number
  /** Potential ability, 1–99. Development pulls `ca` toward it. */
  pa: number
  /** What `ca` is made of. Drawn from his id when missing (old saves, bundled data). */
  attrs?: Attrs
  pers: Personality
  /** Features of his face a mod set by hand; the rest is drawn from his id. */
  face?: FaceEdit
  clubId: string
  role: ClubRole
  /** Recent club form, −5 (awful) … +5 (superb). */
  form: number
  /** Match sharpness from club minutes, 0–100. */
  sharp: number
  /** Happiness with the national team set-up, 0–100. */
  morale: number
  injury: Injury | null
  caps: number
  goals: number
  assists: number
  /** International matches kept clean in goal (a goalkeeper who played at least an hour). */
  cleanSheets?: number
  /** Retired from international football but still playing for a club. */
  intlRetired?: boolean
  /** Last time he was named in a national squad. */
  lastCall?: ISODate
  /** Matches still to serve for a red card. */
  banned?: number
  yellows?: number
  /** International minutes this season: they speed a youngster's development. */
  intlMin?: number
  /** International match ratings this season: [sum, count]. */
  intlRating?: [number, number]
  history: PlayerSeason[]
}

export interface NationDef {
  id: string
  name: string
  flag: string
  confed: Confed
  subFeds: string[]
  color: string
  /** Long-run quality anchor for the player pool, 1–100. */
  youthLevel: number
  /** FIFA ranking points at the start date (from Elo for teams outside FIFA). */
  points: number
  /** Suspended from competitions (still a member). */
  banned?: boolean
  /**
   * Not a FIFA member, so never in World Cup qualifying or the FIFA ranking.
   * "confederation": a full member of its confederation, playing its competitions;
   * "regional": an associate member or only in a regional federation — regional
   * cups and friendlies only.
   */
  nonFifa?: "confederation" | "regional"
  /** Naming cultures its players are drawn from, with weights. */
  cultures: [string, number][]
  /**
   * Grounds on the start date, set by a mod; without them the bundled ones
   * (src/data/stadiums.ts) are used.
   */
  grounds?: { city: string; name: string; capacity: number }[]
  /** Towns where new grounds can go, set by a mod (else the bundled CITIES). */
  cities?: string[]
  /**
   * Centre as [latitude, longitude], set by a mod for a nation the game does not
   * ship; without it the bundled table (src/data/geo.ts) is used. Co-hosts are chosen by it.
   */
  centre?: [number, number]
}
