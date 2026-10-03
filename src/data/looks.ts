/**
 * Where a face comes from: the looks of each naming culture, and the mix a
 * multicultural squad is drawn from. Faces only — nothing in the game depends on it.
 */

/** Broad appearance groups: skin, hair and eye shapes are drawn from each. */
export type Look =
  | "nordic"
  | "european"
  | "mediterranean"
  | "latin"
  | "arab"
  | "south-asian"
  | "african"
  | "east-asian"
  | "southeast-asian"
  | "central-asian"
  | "pacific"

export const CULTURE_LOOKS: Record<string, [Look, number][]> = {
  english: [["european", 1]],
  german: [["european", 1]],
  dutch: [["european", 1]],
  french: [["european", 1]],
  "slavic-south": [["european", 1]],
  "slavic-east": [["european", 1]],
  "slavic-west": [["european", 1]],
  baltic: [
    ["european", 0.6],
    ["nordic", 0.4],
  ],
  hungarian: [["european", 1]],
  romanian: [
    ["european", 0.6],
    ["mediterranean", 0.4],
  ],
  nordic: [["nordic", 1]],
  icelandic: [["nordic", 1]],
  finnish: [["nordic", 1]],
  spanish: [["mediterranean", 1]],
  portuguese: [["mediterranean", 1]],
  italian: [["mediterranean", 1]],
  greek: [["mediterranean", 1]],
  albanian: [["mediterranean", 1]],
  turkish: [
    ["mediterranean", 0.7],
    ["arab", 0.3],
  ],
  caucasus: [
    ["mediterranean", 0.7],
    ["arab", 0.3],
  ],
  hebrew: [["mediterranean", 1]],
  maltese: [["mediterranean", 1]],
  latam: [["latin", 1]],
  brazilian: [
    ["latin", 0.5],
    ["african", 0.3],
    ["european", 0.2],
  ],
  "caribbean-anglo": [
    ["african", 0.9],
    ["latin", 0.1],
  ],
  "caribbean-franco": [["african", 1]],
  "dutch-caribbean": [
    ["african", 0.8],
    ["latin", 0.2],
  ],
  maghreb: [["arab", 1]],
  "arabic-egypt": [["arab", 1]],
  "arabic-gulf": [["arab", 1]],
  "arabic-levant": [["arab", 1]],
  "arabic-sudan": [
    ["african", 0.7],
    ["arab", 0.3],
  ],
  persian: [["arab", 1]],
  "west-african-franco": [["african", 1]],
  "west-african-anglo": [["african", 1]],
  "central-african": [["african", 1]],
  "east-african": [["african", 1]],
  "southern-african": [["african", 1]],
  "lusophone-african": [["african", 1]],
  ethiopian: [["african", 1]],
  somali: [["african", 1]],
  comorian: [
    ["african", 0.7],
    ["arab", 0.3],
  ],
  malagasy: [
    ["african", 0.5],
    ["southeast-asian", 0.5],
  ],
  mauritian: [
    ["south-asian", 0.6],
    ["african", 0.4],
  ],
  maldivian: [["south-asian", 1]],
  "south-asian": [["south-asian", 1]],
  "central-asian": [["central-asian", 1]],
  turkmen: [
    ["central-asian", 0.6],
    ["arab", 0.4],
  ],
  mongolian: [["east-asian", 1]],
  japanese: [["east-asian", 1]],
  korean: [["east-asian", 1]],
  chinese: [["east-asian", 1]],
  thai: [["southeast-asian", 1]],
  vietnamese: [
    ["southeast-asian", 0.6],
    ["east-asian", 0.4],
  ],
  malay: [["southeast-asian", 1]],
  filipino: [["southeast-asian", 1]],
  burmese: [["southeast-asian", 1]],
  "khmer-lao": [["southeast-asian", 1]],
  pacific: [["pacific", 1]],
  melanesian: [
    ["pacific", 0.4],
    ["african", 0.6],
  ],
}

/**
 * Names that say where a player's family is from: a match wins over the nation's
 * mix (a Diallo in the France squad is drawn as West African).
 */
export const TELLING_LOOKS = new Set<Look>([
  "african",
  "arab",
  "east-asian",
  "south-asian",
  "southeast-asian",
  "pacific",
])

/** Squads whose faces are a mix the naming cultures alone would not give. */
export const NATION_LOOKS: Record<string, [Look, number][]> = {
  FRA: [
    ["african", 0.5],
    ["european", 0.3],
    ["arab", 0.15],
    ["mediterranean", 0.05],
  ],
  ENG: [
    ["european", 0.65],
    ["african", 0.3],
    ["south-asian", 0.05],
  ],
  BEL: [
    ["european", 0.55],
    ["african", 0.35],
    ["arab", 0.1],
  ],
  NED: [
    ["european", 0.6],
    ["african", 0.3],
    ["arab", 0.1],
  ],
  GER: [
    ["european", 0.75],
    ["african", 0.12],
    ["mediterranean", 0.13],
  ],
  SUI: [
    ["european", 0.6],
    ["african", 0.2],
    ["mediterranean", 0.2],
  ],
  AUT: [
    ["european", 0.8],
    ["african", 0.08],
    ["mediterranean", 0.12],
  ],
  POR: [
    ["mediterranean", 0.72],
    ["african", 0.28],
  ],
  ESP: [
    ["mediterranean", 0.85],
    ["african", 0.15],
  ],
  ITA: [
    ["mediterranean", 0.9],
    ["african", 0.1],
  ],
  SWE: [
    ["nordic", 0.7],
    ["african", 0.15],
    ["arab", 0.1],
    ["european", 0.05],
  ],
  NOR: [
    ["nordic", 0.85],
    ["african", 0.15],
  ],
  DEN: [
    ["nordic", 0.9],
    ["african", 0.1],
  ],
  FIN: [
    ["nordic", 0.9],
    ["african", 0.1],
  ],
  IRL: [
    ["european", 0.88],
    ["african", 0.12],
  ],
  WAL: [
    ["european", 0.9],
    ["african", 0.1],
  ],
  SCO: [
    ["european", 0.94],
    ["african", 0.06],
  ],
  USA: [
    ["european", 0.45],
    ["african", 0.35],
    ["latin", 0.2],
  ],
  CAN: [
    ["european", 0.45],
    ["african", 0.35],
    ["latin", 0.1],
    ["south-asian", 0.1],
  ],
  AUS: [
    ["european", 0.75],
    ["mediterranean", 0.15],
    ["african", 0.1],
  ],
  NZL: [
    ["european", 0.7],
    ["pacific", 0.3],
  ],
  BRA: [
    ["latin", 0.45],
    ["african", 0.35],
    ["european", 0.2],
  ],
  COL: [
    ["latin", 0.65],
    ["african", 0.35],
  ],
  ECU: [
    ["latin", 0.5],
    ["african", 0.5],
  ],
  VEN: [
    ["latin", 0.8],
    ["african", 0.2],
  ],
  PAN: [
    ["latin", 0.5],
    ["african", 0.5],
  ],
  CRC: [
    ["latin", 0.75],
    ["african", 0.25],
  ],
  HON: [
    ["latin", 0.6],
    ["african", 0.4],
  ],
  ARG: [
    ["mediterranean", 0.7],
    ["latin", 0.3],
  ],
  URU: [
    ["mediterranean", 0.65],
    ["latin", 0.3],
    ["african", 0.05],
  ],
  CHI: [
    ["latin", 0.8],
    ["mediterranean", 0.2],
  ],
  CUB: [
    ["latin", 0.5],
    ["african", 0.5],
  ],
  DOM: [
    ["latin", 0.6],
    ["african", 0.4],
  ],
  PUR: [
    ["latin", 0.8],
    ["african", 0.2],
  ],
  QAT: [
    ["arab", 0.6],
    ["african", 0.4],
  ],
  ISR: [
    ["mediterranean", 0.8],
    ["arab", 0.2],
  ],
  KAZ: [
    ["central-asian", 0.7],
    ["european", 0.3],
  ],
  RUS: [
    ["european", 0.92],
    ["mediterranean", 0.08],
  ],
  SGP: [
    ["southeast-asian", 0.6],
    ["east-asian", 0.25],
    ["south-asian", 0.15],
  ],
  PHI: [
    ["southeast-asian", 0.85],
    ["european", 0.15],
  ],
  IDN: [
    ["southeast-asian", 0.85],
    ["european", 0.15],
  ],
  LUX: [
    ["european", 0.7],
    ["mediterranean", 0.3],
  ],
  CPV: [
    ["african", 0.8],
    ["latin", 0.2],
  ],
}
