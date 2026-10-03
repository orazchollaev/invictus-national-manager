/**
 * The penalty shootout: five each, then sudden death. The best taker goes first and the
 * rest follow by finishing; a kick that has to go in to stay alive is harder to score,
 * less so for players who thrive on the big occasion. As in the laws, a side cannot use
 * more takers than the other has players left.
 */
import { clamp } from "../rng"
import type { MatchEvent, Side } from "./types"
import { finishing, keeperAbility } from "./strength"
import { penaltyTaker } from "./play"
import {
  emit,
  keeper,
  other,
  sideOf,
  type LivePlayer,
  type LiveSide,
  type MatchState,
} from "./state"

function kickOrder(side: LiveSide): LivePlayer[] {
  const first = penaltyTaker(side)
  const rest = side.pitch.filter((p) => p !== first).sort((a, b) => finishing(b) - finishing(a))
  return first ? [first, ...rest] : rest
}

export function playShootout(state: MatchState, out: MatchEvent[]) {
  const rng = state.rng
  const takers = Math.min(state.home.pitch.length, state.away.pitch.length)
  const order = {
    home: kickOrder(state.home).slice(0, takers),
    away: kickOrder(state.away).slice(0, takers),
  }
  const scored = { home: 0, away: 0 }
  const taken = { home: 0, away: 0 }
  // A miss now would lose it: the other side cannot be caught if this kick fails.
  const mustScore = (s: Side) => {
    const o = other(s)
    const left = Math.max(0, 5 - taken[s] - 1)
    return taken[s] >= 5 ? scored[o] > scored[s] : scored[s] + left < scored[o]
  }
  const convert = (s: Side, taker: LivePlayer) => {
    const gk = keeper(sideOf(state, other(s)))
    const nerve = (taker.bigMatch - 10) * 0.008
    const pressure = mustScore(s) ? 0.05 - (taker.bigMatch - 10) * 0.004 : 0
    const p = 0.75 + (finishing(taker) - keeperAbility(gk)) / 200 + nerve - pressure
    return { scored: rng() < clamp(p, 0.55, 0.9), gk }
  }
  // Best of five with the early finish, then sudden death in pairs.
  const decidedEarly = () =>
    scored.home + (5 - taken.home) < scored.away || scored.away + (5 - taken.away) < scored.home
  kicks: for (let round = 0; round < 40; round++) {
    for (const s of ["home", "away"] as Side[]) {
      const list = order[s]
      const taker = list[round % list.length]
      const kick = convert(s, taker)
      taken[s]++
      if (kick.scored) {
        scored[s]++
        emit(state, out, "shootout-goal", s, { playerId: taker.id })
      } else {
        emit(state, out, "shootout-miss", s, { playerId: taker.id, otherId: kick.gk?.id })
      }
      if (round < 5 && decidedEarly()) break kicks
    }
    if (round >= 4 && scored.home !== scored.away) break
  }
  state.pens = [scored.home, scored.away]
  emit(state, out, "shootout-end", scored.home > scored.away ? "home" : "away")
  state.phase = "done"
}
