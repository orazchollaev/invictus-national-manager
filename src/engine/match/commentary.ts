/**
 * Turns match events into commentary lines. The engine stores events as data; the
 * text is produced when shown, so a saved match costs no strings. The variant for
 * each line is picked from the event's position in the match, so re-opening a
 * report reads the same.
 */
import type { Lane, MatchEvent, MatchEventKind, Move, ShotType } from "./types"

export interface CommentaryNames {
  player: (id: string | undefined) => string
  team: (side: "home" | "away") => string
}

type Template = string

/** The events that are a shot, which can have lines for the kind of shot it was. */
export type ShotKind =
  "goal" | "shot-saved" | "shot-wide" | "shot-blocked" | "woodwork" | "big-chance-missed"

/** Everything the commentary says, so a language can swap the whole set. */
export interface CommentaryText {
  lines: Partial<Record<MatchEventKind, Template[]>>
  /** The assist tail of a goal line; `{a}` is the assisting player. */
  assist: string
  lane: Record<Lane, string>
  /** Used in an attack line that has no lane. */
  forward: string
  /** Lines for a kind of shot, used instead of the plain ones when there are any. */
  shots?: Partial<Record<ShotType, Partial<Record<ShotKind, Template[]>>>>
  /** Said before a shot from a counter-attack or a ball won high, and after such a goal. */
  moves?: Partial<Record<Move, { before: string; after: string }>>
}

const T: Partial<Record<MatchEventKind, Template[]>> = {
  kickoff: [
    "We're under way!",
    "The referee blows and {team:home} get us started.",
    "Kick-off. Here we go.",
  ],
  "half-time": [
    "The whistle goes for half-time.",
    "That's the end of the first half.",
    "Half-time. The players head for the tunnel.",
  ],
  "second-half": ["The second half is under way.", "We go again for the second forty-five."],
  "full-time": ["The referee blows the final whistle!", "It's all over!", "Full-time."],
  "et-start": ["Extra time begins. Thirty more minutes to settle this.", "Here comes extra time."],
  "et-half-time": ["Half-time in extra time. Fifteen minutes left."],
  "et-second-half": ["The final fifteen minutes of extra time are under way."],
  "et-end": [
    "Still nothing between them. It's going to penalties!",
    "Extra time can't separate them — penalties it is.",
  ],
  attack: [
    "{p} drives forward for {team} {lane}, but {o} steps in.",
    "{team} work it {lane}, but the final ball is cut out by {o}.",
    "{p} looks for a way through. {o} reads it well.",
    "Patient build-up from {team}, but the final ball goes astray.",
    "{p} tries to thread a pass — intercepted by {o}.",
  ],
  goal: [
    "GOAL! {p} finds the net for {team}!{assist}",
    "GOAL! {p} makes no mistake!{assist}",
    "GOAL! What a finish from {p}!{assist}",
    "GOAL! {p} slots it home for {team}!{assist}",
    "GOAL! {p} is there to turn it in!{assist}",
  ],
  "own-goal": [
    "OWN GOAL! {p} turns it into his own net. Disaster for him.",
    "OWN GOAL! {p} can only divert it past his keeper.",
  ],
  "penalty-awarded": [
    "PENALTY! {o} brings down {p} in the box!",
    "The referee points to the spot! {p} is fouled by {o}.",
  ],
  "pen-goal": [
    "GOAL! {p} sends the keeper the wrong way from the spot!",
    "GOAL! {p} buries the penalty!",
  ],
  "pen-saved": [
    "SAVED! {o} guesses right and keeps out {p}'s penalty!",
    "{p}'s penalty is saved by {o}!",
  ],
  "pen-miss": [
    "{p} blazes the penalty over the bar!",
    "{p} drags the penalty wide! A huge let-off.",
  ],
  "shot-saved": [
    "{p} tests the keeper — {o} saves.",
    "Good effort from {p}, but {o} gets down to it.",
    "{p} fires at goal. Comfortable for {o}.",
    "Strong save from {o} to deny {p}!",
  ],
  "shot-wide": [
    "{p} shoots from distance. Wide.",
    "{p} gets a shot away but it flies over.",
    "{p} snatches at it and the chance is gone.",
    "{p} curls one just past the post.",
  ],
  "shot-blocked": [
    "{p} shoots — blocked by {o}!",
    "{p}'s effort is charged down.",
    "Brave block from {o} to stop {p}.",
  ],
  woodwork: [
    "{p} hits the post!",
    "Off the crossbar! {p} so nearly scores!",
    "{p} rattles the woodwork!",
  ],
  "big-chance-missed": [
    "What a chance! {p} should score but puts it wide!",
    "{p} is clean through... and misses! Unbelievable.",
    "{p} has only the keeper to beat and fluffs it!",
  ],
  corner: ["Corner to {team}.", "{team} win a corner.", "It's deflected out for a {team} corner."],
  "free-kick": [
    "Free-kick to {team} in a dangerous position.",
    "{p} is brought down. Free-kick, and it's within range.",
  ],
  foul: [
    "Foul by {p} on {o}.",
    "{p} goes through the back of {o}. Free-kick.",
    "{p} clips {o}. The referee gives it.",
  ],
  yellow: [
    "Yellow card for {p}.",
    "{p} goes into the book.",
    "The referee shows {p} a yellow card.",
  ],
  "second-yellow": [
    "Second yellow for {p}! He's off!",
    "{p} picks up a second booking and is sent off!",
  ],
  red: ["RED CARD! {p} is sent off!", "Straight red for {p}! {team} are down to ten."],
  offside: [
    "{p} is flagged offside.",
    "The flag goes up against {p}.",
    "{p} timed his run too early. Offside.",
  ],
  injury: [
    "{p} is down and needs treatment.",
    "Concern for {team}: {p} is hurt.",
    "{p} pulls up clutching his leg.",
  ],
  sub: ["Substitution for {team}: {p} comes on for {o}.", "{team} make a change. {o} off, {p} on."],
  tactics: ["{team} change their approach.", "The {team} bench is making adjustments."],
  "shootout-goal": ["{p} scores.", "{p} converts.", "{p} — top corner!"],
  "shootout-miss": ["{p} misses!", "{p}'s kick is saved!", "{p} puts it over!"],
  "shootout-end": ["{team} win the shootout!", "It's {team} who hold their nerve!"],
}

const SHOTS: CommentaryText["shots"] = {
  long: {
    goal: [
      "GOAL! {p} lets fly from distance and it flies in!{assist}",
      "GOAL! A thunderbolt from {p} from outside the box!{assist}",
    ],
    "shot-saved": [
      "{p} tries his luck from range — {o} gathers it.",
      "A long-range drive from {p}, held by {o}.",
    ],
    "shot-wide": [
      "{p} shoots from distance. Wide.",
      "{p} tries his luck from twenty-five yards — over the bar.",
    ],
    "shot-blocked": ["{p}'s effort from distance is blocked by {o}."],
    woodwork: ["{p} hits the woodwork from long range!"],
  },
  close: {
    goal: [
      "GOAL! {p} taps in from close range!{assist}",
      "GOAL! {p} turns in the cut-back!{assist}",
    ],
    "shot-saved": ["{o} somehow keeps out {p} from point-blank range!"],
    "big-chance-missed": [
      "{p} somehow misses from six yards!",
      "It's on a plate for {p}... and he scuffs it wide!",
    ],
  },
  header: {
    goal: [
      "GOAL! {p} rises highest and heads it in!{assist}",
      "GOAL! A towering header from {p}!{assist}",
    ],
    "shot-saved": [
      "{p} gets his head to it, but {o} saves.",
      "A header from {p} — straight at {o}.",
    ],
    "shot-wide": [
      "{p} heads it over.",
      "{p} gets on the end of the cross but his header goes wide.",
    ],
    woodwork: ["{p}'s header crashes off the bar!"],
    "big-chance-missed": ["{p} has a free header and misses the target!"],
  },
  "one-on-one": {
    goal: [
      "GOAL! {p} rounds the keeper and scores!{assist}",
      "GOAL! {p} keeps his cool one-on-one and slots it past the keeper!{assist}",
    ],
    "shot-saved": [
      "{p} is clean through... {o} spreads himself and saves!",
      "Brilliant from {o}! He stands up to {p} one-on-one.",
    ],
    "big-chance-missed": [
      "{p} is through on goal... and puts it wide! What a miss!",
      "{p} is one-on-one with the keeper and drags it past the post!",
    ],
  },
  "free-kick": {
    goal: [
      "GOAL! {p} curls the free kick into the top corner!",
      "GOAL! What a free kick from {p}!",
    ],
    "shot-saved": [
      "{p} goes for goal from the free kick — {o} tips it over!",
      "{p}'s free kick is saved by {o}.",
    ],
    "shot-wide": ["{p}'s free kick clears the bar.", "{p} curls the free kick just wide."],
    "shot-blocked": ["{p}'s free kick hits the wall."],
    woodwork: ["{p}'s free kick smacks the post!"],
  },
  rebound: {
    goal: ["GOAL! {p} pounces on the rebound!", "GOAL! The keeper parries and {p} is first to it!"],
    "shot-saved": ["{p} follows up, but {o} saves again!"],
    "shot-wide": ["{p} snatches at the rebound and it goes wide."],
  },
}

const MOVES: CommentaryText["moves"] = {
  counter: { before: "On the break! ", after: " A devastating counter-attack." },
  press: { before: "Won back high up the pitch! ", after: " Punished for giving the ball away." },
}

const LANE_PHRASE: Record<Lane, string> = {
  left: "down the left",
  centre: "through the middle",
  right: "down the right",
}

/** The English commentary. */
export const DEFAULT_COMMENTARY: CommentaryText = {
  lines: T,
  assist: " Assisted by {a}.",
  lane: LANE_PHRASE,
  forward: "forward",
  shots: SHOTS,
  moves: MOVES,
}

/** The lines to pick from: the kind of shot's own, if the language has any. */
function optionsFor(ev: MatchEvent, text: CommentaryText): Template[] | undefined {
  const own = ev.shot && text.shots?.[ev.shot]?.[ev.kind as ShotKind]
  return own && own.length ? own : text.lines[ev.kind]
}

/** The text for one event. `index` is the event's place in the match, for variety. */
export function commentaryLine(
  ev: MatchEvent,
  index: number,
  names: CommentaryNames,
  text: CommentaryText = DEFAULT_COMMENTARY
): string {
  const options = optionsFor(ev, text)
  if (!options) return ""
  const template = options[(index * 7 + ev.minute) % options.length]
  const move = ev.move && ev.move !== "set-piece" ? text.moves?.[ev.move] : undefined
  const team = ev.side ? names.team(ev.side) : ""
  const assist =
    ev.kind === "goal" && ev.otherId ? text.assist.replace("{a}", names.player(ev.otherId)) : ""
  const line = template
    .replace("{team:home}", names.team("home"))
    .replace(/\{team\}/g, team)
    .replace(/\{p\}/g, names.player(ev.playerId))
    .replace(/\{o\}/g, names.player(ev.otherId))
    .replace("{assist}", assist)
    .replace(/{lane}/g, ev.lane ? text.lane[ev.lane] : text.forward)
  if (!move) return line
  return ev.kind === "goal" ? line + move.after : move.before + line
}

/** Clock label: 45+2', 90', 105+1'. */
export function clock(ev: Pick<MatchEvent, "minute" | "added">): string {
  return ev.added ? `${ev.minute}+${ev.added}'` : `${ev.minute}'`
}

/** Lines that make the short feed when minor commentary is hidden. */
const MINOR: ReadonlySet<MatchEventKind> = new Set([
  "attack",
  "foul",
  "corner",
  "offside",
  "tactics",
])
export function isMinor(kind: MatchEventKind): boolean {
  return MINOR.has(kind)
}
