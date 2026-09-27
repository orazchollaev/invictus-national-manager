import type { Position } from "../types"
import type { Formation } from "./types"

/** Slot roles, keeper first, back to front. */
export const FORMATIONS: Record<Formation, Position[]> = {
  "4-4-2": ["GK", "RB", "CB", "CB", "LB", "RW", "CM", "CM", "LW", "ST", "ST"],
  "4-3-3": ["GK", "RB", "CB", "CB", "LB", "CM", "DM", "CM", "RW", "ST", "LW"],
  "4-2-3-1": ["GK", "RB", "CB", "CB", "LB", "DM", "DM", "RW", "AM", "LW", "ST"],
  "4-1-4-1": ["GK", "RB", "CB", "CB", "LB", "DM", "RW", "CM", "CM", "LW", "ST"],
  "4-4-1-1": ["GK", "RB", "CB", "CB", "LB", "RW", "CM", "CM", "LW", "AM", "ST"],
  "4-3-1-2": ["GK", "RB", "CB", "CB", "LB", "CM", "DM", "CM", "AM", "ST", "ST"],
  "3-5-2": ["GK", "CB", "CB", "CB", "RB", "CM", "DM", "CM", "LB", "ST", "ST"],
  "3-4-3": ["GK", "CB", "CB", "CB", "RB", "CM", "CM", "LB", "RW", "ST", "LW"],
  "5-3-2": ["GK", "RB", "CB", "CB", "CB", "LB", "CM", "DM", "CM", "ST", "ST"],
  "5-4-1": ["GK", "RB", "CB", "CB", "CB", "LB", "RW", "CM", "CM", "LW", "ST"],
}

export const FORMATION_LIST = Object.keys(FORMATIONS) as Formation[]
