/**
 * The real state of international football on the start date, 1 September 2026,
 * where a draw has already been made. Everything else is drawn by the game.
 *
 * Sources (Wikipedia, September 2026):
 *  - 2026–27 UEFA Nations League A, B, C and D (league phase groups, by pot)
 *  - 2026–27 CONCACAF Nations League (draw of 23 July 2026; Template:…group tables)
 *  - 2027 Africa Cup of Nations qualification (group stage; Template:…group tables)
 *  - 2027 AFC Asian Cup (group draw)
 *  - 2030 FIFA World Cup (six host nations qualify automatically)
 */

export const START_DATE = "2026-09-01"

/**
 * League phase groups, each listed by pot (pot 1 first), from the League A–D
 * articles. Summary tables elsewhere list the pots' rows, not the groups — easy to
 * copy by mistake (this file once had Leagues B and C that way).
 */
export const NATIONS_LEAGUE_2026: Record<string, string[][]> = {
  A: [
    ["FRA", "ITA", "BEL", "TUR"],
    ["GER", "NED", "SRB", "GRE"],
    ["ESP", "CRO", "ENG", "CZE"],
    ["POR", "DEN", "NOR", "WAL"],
  ],
  B: [
    ["SCO", "SUI", "SVN", "MKD"],
    ["HUN", "UKR", "GEO", "NIR"],
    ["ISR", "AUT", "IRL", "KOS"],
    ["POL", "BIH", "ROU", "SWE"],
  ],
  C: [
    ["ALB", "FIN", "BLR", "SMR"],
    ["MNE", "ARM", "CYP", "LVA"],
    ["KAZ", "SVK", "FRO", "MDA"],
    ["ISL", "BUL", "EST", "LUX"],
  ],
  // The last League D: all six go up, the 2028–29 edition having three leagues of 18.
  D: [
    ["MLT", "GIB", "AND"],
    ["LTU", "AZE", "LIE"],
  ],
}

/**
 * League A's four best ranked go straight to the quarter-finals (best first); every
 * group lists its teams by pot, which sets League A's Swiss fixtures.
 */
export const CONCACAF_NATIONS_LEAGUE_2026: {
  byes: string[]
  groups: Record<string, string[][]>
} = {
  byes: ["MEX", "USA", "CAN", "PAN"],
  groups: {
    A: [
      ["CRC", "HAI", "TRI", "CUW", "NCA", "DOM"],
      ["HON", "JAM", "GUA", "SUR", "MTQ", "SLV"],
    ],
    B: [
      ["GUY", "PUR", "DMA", "CAY"],
      ["GLP", "BER", "LCA", "BRB"],
      ["CUB", "GRN", "SKN", "BOE"],
      ["GUF", "VIN", "BLZ", "SXM"],
    ],
    C: [
      ["MSR", "TCA", "VGB"],
      ["SMN", "ARU", "BAH"],
      ["ATG", "AIA", "VIR"],
    ],
  },
}

export const AFCON_2027_QUALIFYING: string[][] = [
  ["MAR", "NIG", "LES", "GAB"],
  ["MWI", "ANG", "EGY", "SSD"],
  ["CIV", "GAM", "SOM", "GHA"],
  ["RSA", "KEN", "ERI", "GUI"],
  ["COD", "ZIM", "SLE", "EQG"],
  ["MTN", "BEN", "BFA", "CTA"],
  ["CMR", "NAM", "CGO", "COM"],
  ["BOT", "LBY", "UGA", "TUN"],
  ["ALG", "TOG", "BDI", "ZAM"],
  ["SDN", "SEN", "MOZ", "ETH"],
  ["MLI", "RWA", "CPV", "LBR"],
  ["GNB", "NGA", "MAD", "TAN"],
]

export const ASIAN_CUP_2027: string[][] = [
  ["KSA", "KUW", "OMA", "PLE"],
  ["UZB", "BHR", "PRK", "JOR"],
  ["IRN", "SYR", "KGZ", "CHN"],
  ["AUS", "TJK", "IRQ", "SGP"],
  ["KOR", "UAE", "VIE", "YEM"],
  ["JPN", "QAT", "THA", "IDN"],
]

/**
 * Hosts of tournaments already awarded. Later editions are awarded in-game. The
 * order matters: hosts head groups A, B, C… and the first plays the opening match
 * (2030: the centenary opener in Montevideo).
 */
export const AWARDED_HOSTS: Record<string, string[]> = {
  "wc-2030": ["URU", "ARG", "PAR", "ESP", "POR", "MAR"],
  "wc-2034": ["KSA"],
  "euro-2028": ["ENG", "SCO", "WAL", "IRL"],
  "euro-2032": ["ITA", "TUR"],
  "afcon-2027": ["KEN", "TAN", "UGA"],
  "asian-cup-2027": ["KSA"],
  "gulf-cup-2026": ["KSA"],
  "arab-cup-2029": ["QAT"],
  "arab-cup-2033": ["QAT"],
}
