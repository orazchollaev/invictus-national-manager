import type { CommentaryText } from "@/engine/match/commentary"

/** Live commentary in Dutch; same placeholders as the English set. */
const commentary: CommentaryText = {
  assist: " Assist van {a}.",
  forward: "naar voren",
  lane: {
    left: "via links",
    centre: "door het midden",
    right: "via rechts",
  },
  shots: {
    long: {
      goal: [
        "DOELPUNT! {p} haalt van veraf uit en het is raak!{assist}",
        "DOELPUNT! Een knaller van {p} van buiten het strafschopgebied!{assist}",
      ],
      "shot-saved": [
        "{p} waagt een poging van afstand — {o} grijpt hem.",
        "Een schot van veraf van {p}, geen probleem voor {o}.",
      ],
      "shot-wide": [
        "{p} schiet van afstand. Naast.",
        "{p} probeert het van twintig meter — over de lat.",
      ],
      "shot-blocked": ["Het afstandsschot van {p} wordt geblokkeerd door {o}."],
      woodwork: ["{p} raakt van afstand het houtwerk!"],
    },
    close: {
      goal: [
        "DOELPUNT! {p} tikt van dichtbij binnen!{assist}",
        "DOELPUNT! {p} werkt de terugleggertje binnen!{assist}",
      ],
      "shot-saved": ["{o} houdt {p} van dichtbij wonderbaarlijk van scoren af!"],
      "big-chance-missed": [
        "{p} mist op wonderbaarlijke wijze van vijf meter!",
        "Het ligt op een presenteerblaadje voor {p}... en hij schiet naast!",
      ],
    },
    header: {
      goal: [
        "DOELPUNT! {p} stijgt het hoogst op en kopt hem binnen!{assist}",
        "DOELPUNT! Een torenhoge kopbal van {p}!{assist}",
      ],
      "shot-saved": ["{p} kopt hem op doel, maar {o} redt.", "Een kopbal van {p} — recht op {o}."],
      "shot-wide": ["{p} kopt over.", "{p} komt net bij de voorzet, maar zijn kopbal gaat naast."],
      woodwork: ["De kopbal van {p} ketst van de lat!"],
      "big-chance-missed": ["{p} kan vrij koppen en mist het doel!"],
    },
    "one-on-one": {
      goal: [
        "DOELPUNT! {p} paseert de keeper en scoort!{assist}",
        "DOELPUNT! {p} houdt het hoofd koel oog in oog met de keeper en schuift hem erlangs!{assist}",
      ],
      "shot-saved": [
        "{p} is helemaal vrij... {o} maakt zich breed en redt!",
        "Briljant van {o}! Hij blijft overeind tegen {p}, een-tegen-een.",
      ],
      "big-chance-missed": [
        "{p} komt alleen voor de keeper... en schiet naast! Wat een misser!",
        "{p} staat oog in oog met de keeper en trekt hem naast de paal!",
      ],
    },
    "free-kick": {
      goal: [
        "DOELPUNT! {p} draait de vrije trap in de kruising!",
        "DOELPUNT! Wat een vrije trap van {p}!",
      ],
      "shot-saved": [
        "{p} schiet op doel uit de vrije trap — {o} tikt hem over de lat!",
        "De vrije trap van {p} wordt gered door {o}.",
      ],
      "shot-wide": [
        "De vrije trap van {p} gaat over de lat.",
        "{p} draait de vrije trap net naast.",
      ],
      "shot-blocked": ["De vrije trap van {p} blijft in de muur hangen."],
      woodwork: ["De vrije trap van {p} knalt tegen de paal!"],
    },
    rebound: {
      goal: [
        "DOELPUNT! {p} is er als de kippen bij op de rebound!",
        "DOELPUNT! De keeper stuit hem terug en {p} is er als eerste bij!",
      ],
      "shot-saved": ["{p} zet de rebound na, maar {o} redt opnieuw!"],
      "shot-wide": ["{p} haast zich bij de rebound en schiet naast."],
    },
  },
  moves: {
    counter: { before: "Op de counter! ", after: " Een vernietigende counter." },
    press: {
      before: "Hoog op het veld veroverd! ",
      after: " Afgestraft voor het weggeven van de bal.",
    },
  },
  lines: {
    kickoff: [
      "We zijn begonnen!",
      "De scheidsrechter fluit en {team:home} trapt af.",
      "Aftrap. Daar gaan we.",
    ],
    "half-time": [
      "De scheidsrechter fluit voor de rust.",
      "Dat was de eerste helft.",
      "Rust. De spelers lopen richting de kleedkamer.",
    ],
    "second-half": ["De tweede helft is begonnen.", "We gaan weer van start voor de tweede helft."],
    "full-time": ["De scheidsrechter fluit voor het einde!", "Het zit erop!", "Einde wedstrijd."],
    "et-start": [
      "De verlenging begint. Nog dertig minuten om dit te beslissen.",
      "Daar komt de verlenging.",
    ],
    "et-half-time": ["Rust in de verlenging. Nog vijftien minuten te gaan."],
    "et-second-half": ["De laatste vijftien minuten van de verlenging zijn begonnen."],
    "et-end": [
      "Nog steeds geen verschil. Het wordt strafschoppen!",
      "Ook de verlenging brengt geen beslissing — dan maar strafschoppen.",
    ],
    attack: [
      "{p} dringt op voor {team} {lane}, maar {o} grijpt in.",
      "{team} speelt het {lane} uit, maar de laatste bal wordt onderschept door {o}.",
      "{p} zoekt een weg door. {o} leest het goed.",
      "Geduldige opbouw van {team}, maar de laatste pass is slecht.",
      "{p} probeert een steekpass — onderschept door {o}.",
    ],
    goal: [
      "DOELPUNT! {p} schiet raak voor {team}!{assist}",
      "DOELPUNT! {p} laat het niet liggen!{assist}",
      "DOELPUNT! Wat een afronding van {p}!{assist}",
      "DOELPUNT! {p} schuift hem binnen voor {team}!{assist}",
      "DOELPUNT! {p} is er als de kippen bij om hem binnen te werken!{assist}",
    ],
    "own-goal": [
      "EIGEN DOELPUNT! {p} werkt de bal in het eigen net. Een drama voor hem.",
      "EIGEN DOELPUNT! {p} kan de bal alleen nog langs zijn eigen keeper werken.",
    ],
    "penalty-awarded": [
      "STRAFSCHOP! {o} haalt {p} neer in het strafschopgebied!",
      "De scheidsrechter wijst naar de stip! {p} wordt gevloerd door {o}.",
    ],
    "pen-goal": [
      "DOELPUNT! {p} stuurt de keeper de verkeerde kant op vanaf de stip!",
      "DOELPUNT! {p} verzilvert de strafschop!",
    ],
    "pen-saved": [
      "GERED! {o} kiest de goede hoek en stopt de strafschop van {p}!",
      "De strafschop van {p} wordt gestopt door {o}!",
    ],
    "pen-miss": [
      "{p} knalt de strafschop over de lat!",
      "{p} trekt de strafschop naast! Dat scheelt enorm.",
    ],
    "shot-saved": [
      "{p} test de keeper — {o} redt.",
      "Goede poging van {p}, maar {o} duikt erop af.",
      "{p} schiet op doel. Makkelijk voor {o}.",
      "Sterke redding van {o} om {p} van scoren af te houden!",
    ],
    "shot-wide": [
      "{p} schiet van afstand. Naast.",
      "{p} haalt uit, maar de bal vliegt over.",
      "{p} schiet overhaast en de kans is verkeken.",
      "{p} draait er een net langs de paal.",
    ],
    "shot-blocked": [
      "{p} schiet — geblokkeerd door {o}!",
      "De poging van {p} wordt geblokt.",
      "Moedig blok van {o} om {p} te stoppen.",
    ],
    woodwork: [
      "{p} raakt de paal!",
      "Op de lat! {p} scoort bijna!",
      "{p} laat het houtwerk trillen!",
    ],
    "big-chance-missed": [
      "Wat een kans! {p} moet scoren, maar schiet naast!",
      "{p} staat helemaal vrij... en mist! Ongelooflijk.",
      "{p} hoeft alleen de keeper nog te verslaan en verprutst het!",
    ],
    corner: [
      "Hoekschop voor {team}.",
      "{team} verdient een hoekschop.",
      "Hij wordt uit de baan gekopt: hoekschop voor {team}.",
    ],
    "free-kick": [
      "Vrije trap voor {team} op een gevaarlijke plek.",
      "{p} wordt neergehaald. Vrije trap, en binnen schootsafstand.",
    ],
    foul: [
      "Overtreding van {p} op {o}.",
      "{p} komt van achteren in op {o}. Vrije trap.",
      "{p} schopt {o} aan. De scheidsrechter fluit.",
    ],
    yellow: [
      "Gele kaart voor {p}.",
      "{p} gaat in het boekje.",
      "De scheidsrechter trekt geel voor {p}.",
    ],
    "second-yellow": [
      "Tweede geel voor {p}! Hij moet eraf!",
      "{p} krijgt zijn tweede gele kaart en wordt van het veld gestuurd!",
    ],
    red: [
      "RODE KAART! {p} wordt van het veld gestuurd!",
      "Direct rood voor {p}! {team} met tien man.",
    ],
    offside: [
      "{p} wordt buitenspel gevlagd.",
      "De vlag gaat omhoog tegen {p}.",
      "{p} startte te vroeg. Buitenspel.",
    ],
    injury: [
      "{p} ligt op de grond en heeft behandeling nodig.",
      "Zorgen bij {team}: {p} is geblesseerd.",
      "{p} blijft staan en grijpt naar zijn been.",
    ],
    sub: ["Wissel bij {team}: {p} komt erin voor {o}.", "{team} wisselt. {o} eruit, {p} erin."],
    tactics: ["{team} past zijn aanpak aan.", "De bank van {team} stuurt bij."],
    "shootout-goal": ["{p} scoort.", "{p} schiet raak.", "{p} — in de kruising!"],
    "shootout-miss": ["{p} mist!", "De poging van {p} wordt gestopt!", "{p} schiet over!"],
    "shootout-end": ["{team} wint de strafschoppenserie!", "{team} houdt het hoofd koel!"],
  },
}

export default commentary
