/**
 * Faces drawn with facesjs. facesjs picks its features with Math.random, so the
 * face itself is built here from a seeded stream: the same key always gives the
 * same face, and only the rendering is left to facesjs.
 *
 * A face has two layers. The base — skin, head, eyes, nose, mouth, natural hair
 * colour — comes from the key and the player's roots. The age layer comes from
 * the role: players are drawn young, coaches with lines, grey and thinning hair.
 * A former international keeps his base when he becomes a coach.
 */
import { display, faceToSvgString, svgsIndex, type FaceConfig } from "facesjs"
import type { FaceEdit } from "@/engine/types"
import { NAME_ALIASES, NAME_POOLS } from "@/data/names"
import { CULTURE_LOOKS, NATION_LOOKS, TELLING_LOOKS, type Look } from "@/data/looks"
import { deriveSeed, makeRng, pick, pickWeighted, type Rng } from "@/engine/rng"

export type FaceRole = "player" | "coach"

export interface FaceSubject {
  /** Stable key: a player's id, or a coach's face key. */
  key: string
  last: string
  nationId: string
  /** The nation's naming cultures, with weights. */
  cultures: [string, number][]
  role: FaceRole
  /** The nation's colour, for the shirt. */
  color?: string
  /** Features set by hand over the drawn face (a mod's edits). */
  edit?: FaceEdit
}

interface LookStyle {
  skin: string[]
  hair: [string, number][]
  eyes: string[]
  eyeAngle: [number, number]
  young: string[]
  old: string[]
  beard: number
}

const NARROW_EYES = ["eye7", "eye16", "eye17", "eye18", "eye19"]
/** Narrow but not as much: for South-East and Central Asia. */
const NARROWISH_EYES = [...NARROW_EYES, "eye6", "eye9", "eye5", "eye13"]
const OPEN_EYES = [
  "eye1",
  "eye2",
  "eye3",
  "eye4",
  "eye5",
  "eye8",
  "eye10",
  "eye11",
  "eye12",
  "eye13",
  "eye14",
  "eye15",
]

const BLACK: [string, number][] = [
  ["#272421", 3],
  ["#1c1008", 2],
  ["#0f0902", 1],
]
const DARK: [string, number][] = [
  ["#272421", 3],
  ["#2C1608", 2],
  ["#3D2314", 2],
  ["#5A3825", 1],
]

const YOUNG = [
  "crop-fade",
  "crop-fade2",
  "short-fade",
  "short-fade-2",
  "tall-fade",
  "faux-hawk",
  "fauxhawk-fade",
  "spike",
  "spike2",
  "spike3",
  "spike4",
  "messy",
  "messy-short",
  "middle-part",
  "parted",
  "short",
  "short2",
  "short3",
  "shortBangs",
  "crop",
  "high",
  "juice",
  "curly",
  "curly2",
  "shaggy1",
]
const YOUNG_AFRO = [
  "afro",
  "afro2",
  "cornrows",
  "dreads",
  "curlyFade1",
  "curlyFade2",
  "blowoutFade",
  "crop-fade",
  "short-fade",
  "short-fade-2",
  "tall-fade",
  "high",
  "juice",
  "bald",
]
const YOUNG_CURLY = [...YOUNG, "curly3", "curlyFade1", "curlyFade2", "blowoutFade"]
const YOUNG_ASIAN = [
  "middle-part",
  "parted",
  "short",
  "short2",
  "short3",
  "shortBangs",
  "spike",
  "spike2",
  "messy",
  "messy-short",
  "crop",
  "emo",
  "faux-hawk",
  "crop-fade",
  "short-fade",
]
const OLD = [
  "short",
  "short2",
  "short3",
  "parted",
  "middle-part",
  "crop",
  "messy-short",
  "hair",
  "short-bald",
  "short-bald",
  "bald",
]
const OLD_AFRO = ["short-fade", "crop", "bald", "short-bald", "high", "short", "crop-fade"]
const OLD_ASIAN = ["short", "short2", "parted", "middle-part", "short-bald", "crop"]

const STYLES: Record<Look, LookStyle> = {
  nordic: {
    skin: ["#f6ddd2", "#f2d6cb", "#ecc8b4"],
    hair: [
      ["#e9c67b", 3],
      ["#D7BF91", 3],
      ["#CC9966", 2],
      ["#B55239", 0.6],
      ["#5A3825", 1],
      ["#3D2314", 0.4],
    ],
    eyes: OPEN_EYES,
    eyeAngle: [-6, 8],
    young: YOUNG,
    old: OLD,
    beard: 0.4,
  },
  european: {
    skin: ["#f2d6cb", "#ecc8b4", "#ddb7a0"],
    hair: [
      ["#272421", 1],
      ["#3D2314", 2],
      ["#5A3825", 2],
      ["#CC9966", 1],
      ["#D7BF91", 0.6],
      ["#B55239", 0.3],
    ],
    eyes: OPEN_EYES,
    eyeAngle: [-8, 10],
    young: YOUNG,
    old: OLD,
    beard: 0.4,
  },
  mediterranean: {
    skin: ["#ecc8b4", "#ddb7a0", "#d5a98c"],
    hair: DARK,
    eyes: OPEN_EYES,
    eyeAngle: [-8, 10],
    young: YOUNG_CURLY,
    old: OLD,
    beard: 0.55,
  },
  latin: {
    skin: ["#ddb7a0", "#d1a183", "#bb876f", "#a67358"],
    hair: BLACK,
    eyes: OPEN_EYES,
    eyeAngle: [-6, 10],
    young: YOUNG_CURLY,
    old: OLD,
    beard: 0.45,
  },
  arab: {
    skin: ["#d5a98c", "#c69676", "#bb876f", "#aa816f"],
    hair: BLACK,
    eyes: OPEN_EYES,
    eyeAngle: [-8, 8],
    young: YOUNG_CURLY,
    old: OLD,
    beard: 0.7,
  },
  "south-asian": {
    skin: ["#bb876f", "#a67358", "#8d5b45"],
    hair: BLACK,
    eyes: OPEN_EYES,
    eyeAngle: [-6, 8],
    young: YOUNG,
    old: OLD,
    beard: 0.5,
  },
  african: {
    skin: ["#ad6453", "#8a5345", "#74453d", "#5c3937", "#4a2c2a"],
    hair: [["#272421", 1]],
    eyes: OPEN_EYES,
    eyeAngle: [-6, 8],
    young: YOUNG_AFRO,
    old: OLD_AFRO,
    beard: 0.4,
  },
  "east-asian": {
    skin: ["#fedac7", "#f0c5a3", "#eab687"],
    hair: BLACK,
    eyes: NARROW_EYES,
    eyeAngle: [3, 13],
    young: YOUNG_ASIAN,
    old: OLD_ASIAN,
    beard: 0.12,
  },
  "southeast-asian": {
    skin: ["#f0c5a3", "#e0b08a", "#d1a183", "#bb876f"],
    hair: BLACK,
    eyes: NARROWISH_EYES,
    eyeAngle: [0, 10],
    young: YOUNG_ASIAN,
    old: OLD_ASIAN,
    beard: 0.2,
  },
  "central-asian": {
    skin: ["#f0c5a3", "#e0b08a", "#d5a98c"],
    hair: BLACK,
    eyes: NARROWISH_EYES,
    eyeAngle: [2, 12],
    young: YOUNG_ASIAN,
    old: OLD_ASIAN,
    beard: 0.35,
  },
  pacific: {
    skin: ["#a67358", "#8d5b45", "#74453d"],
    hair: BLACK,
    eyes: OPEN_EYES,
    eyeAngle: [-6, 8],
    young: [...YOUNG_CURLY, "afro", "dreads"],
    old: OLD_AFRO,
    beard: 0.45,
  },
}

const GREYS = ["#8c8c8c", "#a8a8a8", "#c4c4c4", "#dcdcdc"]
const HEADS = Array.from({ length: 18 }, (_, i) => `head${i + 1}`)
const BODIES = ["body", "body2", "body3", "body4", "body5"]
const EYEBROWS = Array.from({ length: 20 }, (_, i) => `eyebrow${i + 1}`)
const NOSES = [
  "nose1",
  "nose2",
  "nose3",
  "nose4",
  "nose5",
  "nose6",
  "nose7",
  "nose8",
  "nose9",
  "nose10",
  "nose11",
  "nose12",
  "nose13",
  "nose14",
  "honker",
  "small",
]
const YOUNG_MOUTHS = [
  "mouth",
  "mouth2",
  "mouth3",
  "mouth4",
  "mouth5",
  "mouth6",
  "mouth7",
  "mouth8",
  "smile",
  "smile2",
  "smile3",
  "smile-closed",
  "closed",
  "side",
]
const OLD_MOUTHS = [
  "mouth",
  "mouth3",
  "mouth5",
  "mouth7",
  "closed",
  "straight",
  "side",
  "smile-closed",
]
const YOUNG_BEARDS = [
  "goatee-thin",
  "goatee-thin-stache",
  "soul",
  "soul-stache",
  "mustache-thin",
  "chin-strap",
  "chin-strapStache",
  "beard1",
  "beard2",
  "sideburns1",
  "fullgoatee",
  "goatee1",
  "goatee1-stache",
  "logan",
]
const OLD_BEARDS = [
  "beard1",
  "beard2",
  "beard3",
  "beard4",
  "beard5",
  "beard6",
  "fullgoatee",
  "fullgoatee2",
  "fullgoatee3",
  "mustache1",
  "goatee1-stache",
  "chin-strapStache",
  "honest-abe-stache",
  "beard-point",
  "loganGoatee2Stache",
]

const between = (rng: Rng, [lo, hi]: [number, number]) => lo + rng() * (hi - lo)
const round2 = (v: number) => Math.round(v * 100) / 100

let lastNames: Map<string, Set<string>> | null = null

/** Last names per naming culture, built on first use. */
function lastNamesOf(culture: string): Set<string> {
  lastNames ??= new Map()
  let set = lastNames.get(culture)
  if (!set) {
    const pool = NAME_POOLS[culture]
    set = new Set(pool ? pool.last.split(" ").map((n) => n.replace(/_/g, " ")) : [])
    lastNames.set(culture, set)
  }
  return set
}

/** Aliased cultures expanded into the ones with name lists. */
function expand(cultures: [string, number][]): [string, number][] {
  return cultures.flatMap(([c, w]) =>
    NAME_ALIASES[c]
      ? expand(NAME_ALIASES[c]).map(([a, x]) => [a, (w * x) / 100] as [string, number])
      : [[c, w]]
  )
}

/**
 * Where his face comes from: a name that tells (a West African surname in the
 * France squad), else the nation's own mix, else its naming cultures.
 */
export function lookOf(s: Pick<FaceSubject, "key" | "last" | "nationId" | "cultures">): Look {
  const rng = makeRng(deriveSeed(0, "face-look", s.key))
  const cultures = expand(s.cultures)
  const named = cultures.filter(([c]) => lastNamesOf(c).has(s.last))
  if (named.length) {
    const [culture] = pickWeighted(rng, named, ([, w]) => w)
    const [look] = pickWeighted(rng, CULTURE_LOOKS[culture] ?? [["european", 1]], ([, w]) => w)
    if (TELLING_LOOKS.has(look) || !NATION_LOOKS[s.nationId]) return look
  }
  const mix =
    NATION_LOOKS[s.nationId] ??
    cultures.flatMap(([c, w]) =>
      (CULTURE_LOOKS[c] ?? [["european", 1]]).map(([l, x]) => [l, w * x] as [Look, number])
    )
  if (!mix.length) return "european"
  return pickWeighted(rng, mix, ([, w]) => w)[0]
}

/** Darken a #rrggbb colour by a factor (0–1). */
function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1, 7), 16)
  if (Number.isNaN(n)) return hex
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * f))
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`
}

/** The face drawn for a subject, with any hand edits laid over it. */
export function buildFace(s: FaceSubject): FaceConfig {
  const face = drawFace(s)
  return s.edit ? applyEdit(face, s.edit) : face
}

// ── Hand edits ──────────────────────────────────────────────────────────────

/** Features picked from a list of facesjs ids. */
export const FACE_FEATURES = [
  "hair",
  "head",
  "ear",
  "eye",
  "eyebrow",
  "nose",
  "mouth",
  "facialHair",
  "glasses",
  "eyeLine",
  "smileLine",
  "miscLine",
] as const
export type FaceFeature = (typeof FACE_FEATURES)[number]

/** The ids a feature can take: facesjs's own, without its women's variants. */
export function faceOptions(feature: FaceFeature): string[] {
  return svgsIndex[feature].filter((id) => !id.startsWith("female"))
}

const luma = (hex: string) => {
  const n = parseInt(hex.slice(1, 7), 16)
  return ((n >> 16) & 255) + ((n >> 8) & 255) + (n & 255)
}
const lightToDark = (a: string, b: string) => luma(b) - luma(a)

/** The skin tones and hair colours the game draws from, for the editor's swatches. */
export const SKIN_TONES = [...new Set(Object.values(STYLES).flatMap((s) => s.skin))].sort(
  lightToDark
)
export const HAIR_COLORS = [
  ...new Set([...Object.values(STYLES).flatMap((s) => s.hair.map(([c]) => c)), ...GREYS]),
].sort(lightToDark)

const HEX = /^#[0-9a-f]{6}$/i

/** What a value from outside (a mod file) may say about a face; anything else is dropped. */
export function sanitizeFaceEdit(raw: unknown): FaceEdit {
  const out: FaceEdit = {}
  if (!raw || typeof raw !== "object") return out
  const r = raw as Record<string, unknown>
  for (const f of FACE_FEATURES) {
    const v = r[f]
    if (typeof v === "string" && faceOptions(f).includes(v)) out[f] = v
  }
  for (const f of ["skin", "hairColor"] as const) {
    const v = r[f]
    if (typeof v === "string" && HEX.test(v)) out[f] = v.toLowerCase()
  }
  if (typeof r.fatness === "number" && Number.isFinite(r.fatness))
    out.fatness = round2(Math.min(1, Math.max(0, r.fatness)))
  return out
}

/** One edit field read off a face, as the editor shows it. */
export function faceValue(face: FaceConfig, key: keyof FaceEdit): string | number {
  switch (key) {
    case "skin":
      return face.body.color
    case "hairColor":
      return face.hair.color
    case "fatness":
      return face.fatness
    default:
      return face[key].id
  }
}

function applyEdit(face: FaceConfig, e: FaceEdit): FaceConfig {
  const f = structuredClone(face)
  if (e.skin) f.body.color = e.skin
  if (e.hairColor) f.hair.color = e.hairColor
  if (e.hair) {
    f.hair.id = e.hair
    // The hair behind the head follows the style, as when it is drawn.
    f.hairBg.id = e.hair === "longHair" ? "longHair" : e.hair.startsWith("shaggy") ? "shaggy" : "none"
  }
  for (const k of FACE_FEATURES) if (k !== "hair" && e[k]) f[k].id = e[k]
  if (e.fatness !== undefined) f.fatness = e.fatness
  return f
}

function drawFace(s: FaceSubject): FaceConfig {
  const style = STYLES[lookOf(s)]
  // The base: the same for the player and for the coach he becomes.
  const b = makeRng(deriveSeed(0, "face-base", s.key))
  const skin = pick(b, style.skin)
  const naturalHair = pickWeighted(b, style.hair, ([, w]) => w)[0]
  const head = pick(b, HEADS)
  const body = pick(b, BODIES)
  const ear = pick(b, ["ear1", "ear2", "ear3"])
  const earSize = round2(between(b, [0.6, 1.3]))
  const eye = pick(b, style.eyes)
  const eyeAngle = Math.round(between(b, style.eyeAngle))
  const eyebrow = pick(b, EYEBROWS)
  const eyebrowAngle = Math.round(between(b, [-10, 15]))
  const nose = pick(b, NOSES)
  const noseFlip = b() < 0.5
  const noseSize = round2(between(b, [0.6, 1.15]))
  const build = b()
  const mouthFlip = b() < 0.5

  // The age layer.
  const coach = s.role === "coach"
  const a = makeRng(deriveSeed(0, `face-${s.role}`, s.key))
  const hair = pick(a, coach ? style.old : style.young)
  const grey = coach && style !== STYLES.african ? a() < 0.6 : coach && a() < 0.45
  const color = s.color && /^#[0-9a-f]{6}$/i.test(s.color) ? s.color : "#3a6ea5"
  return {
    fatness: round2(coach ? 0.25 + build * 0.6 : build * 0.35),
    teamColors: coach ? ["#2b2f36", color, "#ffffff"] : [color, "#ffffff", shade(color, 0.6)],
    hairBg: {
      id: hair === "longHair" ? "longHair" : hair.startsWith("shaggy") ? "shaggy" : "none",
    },
    body: { id: body, color: skin, size: round2(between(b, [0.96, 1.04])) },
    jersey: { id: coach ? "baseball" : "football" },
    ear: { id: ear, size: earSize },
    head: {
      id: head,
      shave: `rgba(0,0,0,${!coach && hair.includes("fade") && a() < 0.5 ? round2(between(a, [0.05, 0.2])) : 0})`,
    },
    eyeLine: {
      id: coach ? pick(a, ["line1", "line2", "line3", "line4", "line5", "line6"]) : "none",
    },
    smileLine: {
      id: coach
        ? a() < 0.85
          ? pick(a, ["line1", "line2", "line3", "line4"])
          : "none"
        : a() < 0.2
          ? "line1"
          : "none",
      size: round2(coach ? between(a, [1, 2]) : between(a, [0.3, 0.8])),
    },
    miscLine: {
      id: coach
        ? a() < 0.65
          ? pick(a, ["forehead1", "forehead2", "forehead3", "forehead4", "forehead5", "chin1"])
          : "none"
        : style === STYLES.nordic && a() < 0.1
          ? "freckles1"
          : "none",
    },
    facialHair: {
      id:
        a() < style.beard * (coach ? 1.1 : 0.9)
          ? pick(a, coach ? OLD_BEARDS : YOUNG_BEARDS)
          : "none",
    },
    eye: { id: eye, angle: eyeAngle },
    eyebrow: { id: eyebrow, angle: eyebrowAngle },
    hair: { id: hair, color: grey ? pick(a, GREYS) : naturalHair, flip: a() < 0.5 },
    mouth: { id: pick(a, coach ? OLD_MOUTHS : YOUNG_MOUTHS), flip: mouthFlip },
    nose: { id: nose, flip: noseFlip, size: noseSize },
    glasses: { id: coach && a() < 0.22 ? "glasses2-black" : "none" },
    accessories: { id: !coach && a() < 0.05 ? "headband" : "none" },
  }
}

let stage: HTMLDivElement | null = null

/**
 * The face as SVG markup. In a browser facesjs draws into a hidden element of the
 * page (it measures its shapes with getBBox); its own string renderer swaps the
 * global document for a fake one, which only works under Node.
 */
function render(face: FaceConfig): string {
  if (typeof document === "undefined") return faceToSvgString(face)
  if (!stage) {
    stage = document.createElement("div")
    stage.setAttribute("aria-hidden", "true")
    stage.style.cssText =
      "position:absolute;left:-10000px;top:0;width:400px;height:600px;visibility:hidden;pointer-events:none"
    document.body.appendChild(stage)
  }
  display(stage, face)
  const svg = stage.innerHTML
  stage.innerHTML = ""
  return svg
}

const cache = new Map<string, string>()

/** The face as an SVG string, cached. `head` crops to the head for small avatars. */
/**
 * How much of the picture to show: all of it (2:3), a head-and-shoulders card
 * (4:5) for lists, or the head in a circle for tokens on the pitch.
 */
export type FaceCrop = "full" | "card" | "round"

const CROPS: Record<Exclude<FaceCrop, "full">, string> = {
  card: 'viewBox="20 50 360 450" preserveAspectRatio="xMidYMin slice"',
  round: 'viewBox="-10 40 420 420" preserveAspectRatio="xMidYMin slice"',
}

export function faceSvg(s: FaceSubject, crop: FaceCrop = "full"): string {
  const id = `${s.role}|${s.key}|${s.nationId}|${s.color ?? ""}|${crop}|${s.edit ? JSON.stringify(s.edit) : ""}`
  let svg = cache.get(id)
  if (!svg) {
    svg = render(buildFace(s))
    if (crop !== "full")
      svg = svg.replace(/viewBox="[^"]*" preserveAspectRatio="[^"]*"/, CROPS[crop])
    if (cache.size > 500) cache.clear()
    cache.set(id, svg)
  }
  return svg
}
