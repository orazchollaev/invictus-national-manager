/**
 * Turns match events into commentary lines. The engine stores events as data; the
 * text is produced when shown, so a saved match costs no strings. The variant for
 * each line is picked from the event's position in the match, so re-opening a
 * report reads the same.
 */
import type { Lane, MatchEvent, MatchEventKind } from "./types"

export interface CommentaryNames {
  player: (id: string | undefined) => string
  team: (side: "home" | "away") => string
}

type Template = string

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

/** The text for one event. `index` is the event's place in the match, for variety. */
export function commentaryLine(ev: MatchEvent, index: number, names: CommentaryNames): string {
  const options = T[ev.kind]
  if (!options) return ""
  const template = options[(index * 7 + ev.minute) % options.length]
  const team = ev.side ? names.team(ev.side) : ""
  const assist = ev.kind === "goal" && ev.otherId ? ` Assisted by ${names.player(ev.otherId)}.` : ""
  return template
    .replace("{team:home}", names.team("home"))
    .replace(/\{team\}/g, team)
    .replace(/\{p\}/g, names.player(ev.playerId))
    .replace(/\{o\}/g, names.player(ev.otherId))
    .replace("{assist}", assist)
    .replace(/{lane}/g, ev.lane ? LANE_PHRASE[ev.lane] : "forward")
}

const LANE_PHRASE: Record<Lane, string> = {
  left: "down the left",
  centre: "through the middle",
  right: "down the right",
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
