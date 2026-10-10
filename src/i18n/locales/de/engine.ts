import type en from "../en/engine"

const engine: typeof en = {
  obj: {
    qualify: "Qualifikation für die {comp}",
    unbeaten: "{text} ungeschlagen",
    promotion: "Aufstieg aus Liga {letter}",
    relegation: "Abstieg aus Liga {letter} vermeiden",
    win: "{comp} gewinnen",
    reach: {
      knockout: "K.-o.-Phase der {comp} erreichen",
      "quarter-finals": "Viertelfinale der {comp} erreichen",
      "semi-finals": "Halbfinale der {comp} erreichen",
      final: "Finale der {comp} erreichen",
    },
    debuts: "{count} Spielern bis 21 Jahre im Jahr {year} ihr Länderspieldebüt geben",
    raiseNote:
      "Belohnung ×{reward}; bei Verfehlen kostet es {cost} Vertrauen, danach gilt wieder das ursprüngliche Ziel",
    lowerNote: "Kostet jetzt {cost} Vertrauen; Belohnung halbiert",
    lowerNeeds: "Der Vorstand hört nur zu, wenn das Vertrauen bei mindestens {n} % liegt",
  },
  news: {
    raise: {
      title: "Du legst die Latte höher",
      body: "Du hast dem Verband mehr versprochen: „{text}“. Liefere, und er wird es nicht vergessen.",
    },
    lower: {
      title: "Erwartungen gesenkt",
      body: "Der Verband hat sich widerwillig auf ein geringeres Ziel eingelassen: „{text}“.",
    },
    broken: {
      title: "Versprechen gebrochen",
      body: "Du hattest versprochen: „{promised}“ – und hast es verfehlt. Der Verband erwartet weiterhin: „{target}“.",
    },
    met: {
      title: "Ziel erreicht",
      body: "Der Verband ist begeistert: „{text}“ – geschafft. Der zusätzliche Rückhalt kommt auch den Akademien zugute.",
    },
    missed: {
      title: "Ziel verfehlt",
      body: "Der Verband ist unzufrieden: Uns ist nicht gelungen: „{text}“.",
    },
    friendly: "ein Freundschaftsspiel",
    derbyWin: {
      title: "Der Derbytag gehört {us}",
      body: "Ein {score}-Sieg gegen den alten Rivalen {them} in {comp}. Auf den Straßen wird gefeiert.",
    },
    derbyLoss: {
      title: "Derby-Niederlage gegen {them}",
      body: "{score} gegen {them} verloren in {comp}. Die Fans werden diese Niederlage nicht so schnell vergessen.",
    },
    derbyDraw: {
      title: "Im Derby ist alles offen geblieben",
      body: "{us} und {them} trennten sich {score} in {comp}. Keine Seite hat nun die Oberhand.",
    },
    fans: {
      angry: {
        title: "Die Fans wenden sich gegen den Trainer",
        body: "Die Anhänger von {nation} haben ihren Ärger deutlich gemacht. Der Vorstand hört zu.",
      },
      adore: {
        title: "Die Fans stehen hinter dir",
        body: "Die Anhänger von {nation} singen den Namen des Trainers. Das Stadion wird beben.",
      },
    },
    invitational: {
      title: "{host} richtet die {comp} aus",
      body: "{host} richtet die {comp} aus, mit {teams} als Teilnehmern. Sie beginnt am {date}.",
    },
    invite: {
      title: "Einladung von {host}",
      body: "{host} lädt uns zu einem Turnier mit {n} Teams im Zeitfenster ab dem {date} ein. Man braucht eine Antwort.",
    },
    inviteLapsed: {
      title: "Einladung verfallen",
      body: "Wir haben die Einladung von {host} nicht rechtzeitig beantwortet; das Turnier findet ohne uns statt.",
    },
    inviteOff: {
      title: "Turnier abgesagt",
      body: "Das Turnier von {host} konnte nicht stattfinden: Nicht mehr alle Teams sind frei.",
    },
    riot: {
      title: "{us} lässt {them} keine Chance",
      body: "Ein {score}-Sieg gegen {them} in {comp}. Die Fans werden sich an dieses Spiel erinnern.",
    },
    shock: {
      title: "Überraschungssieg gegen {them}",
      body: "Kaum jemand gab uns eine Chance, doch wir haben {them} in {comp} mit {score} geschlagen.",
    },
    humiliation: {
      title: "Demütigung gegen {them}",
      body: "Eine {score}-Niederlage gegen {them} in {comp}. Dem Trainer werden Fragen gestellt.",
    },
    embarrassing: {
      title: "Peinliche Niederlage gegen {them}",
      body: "Wir galten als Favorit, haben aber in {comp} mit {score} gegen {them} verloren.",
    },
    cap: {
      title: "{name} bestreitet sein Länderspiel Nummer {caps}",
      body: "{name} hat nun {caps} Länderspiele für {nation} bestritten.",
    },
    goals: {
      title: "{name} erreicht {goals} Länderspieltore",
      body: "{name} hat nun {goals} Tore für {nation} erzielt.",
    },
    debut: {
      title: "Erstes Länderspiel für {name}",
      body: "Ihr Länderspieldebüt gegen {opp} geben: {names}.",
    },
    debuts: {
      title: "{n} Debüts",
    },
    milestone: "Meilenstein erreicht",
    ultimatum: {
      title: "Letzte Warnung",
      body: "Dem Verband ist die Geduld ausgegangen. Steigere sein Vertrauen innerhalb von {matches} Pflichtspielen auf {lifted} %, sonst wirst du ersetzt.",
    },
    eases: {
      title: "Der Druck lässt nach",
      body: "Die Ergebnisse haben sich gedreht. Der Verband hat seine letzte Warnung zurückgenommen.",
    },
    sacked: {
      title: "Entlassen",
      body: "Der Verband von {nation} hat dich von deinen Aufgaben entbunden.",
    },
    resigned: {
      title: "Du bist zurückgetreten",
      body: "Du bist als Cheftrainer von {nation} zurückgetreten.",
    },
    notRenewed: {
      title: "Vertrag nicht verlängert",
      body: "Der Verband von {nation} hat beschlossen, deinen Vertrag nicht zu verlängern.",
    },
    renewed: {
      title: "Vertrag verlängert",
      body: "Der Verband von {nation} hat deinen Vertrag bis {date} verlängert.",
    },
    extended: {
      title: "Noch ein Jahr",
      body: "Der Verband von {nation} hat deinen Vertrag um nur ein Jahr verlängert. Man will Fortschritte sehen.",
    },
    coachChange: {
      title: "{nation} wechselt den Trainer",
      body: "{nation} hat {coach} zum neuen Cheftrainer ernannt.",
    },
    coachSacked: {
      title: "{nation} entlässt {coach}",
      body: "{nation} hat sich nach einer schwachen Serie von Cheftrainer {coach} getrennt. Die Suche nach einem Nachfolger hat begonnen.",
    },
    coachRetired: {
      title: "{coach} hört auf",
      body: "{coach} ist als Cheftrainer von {nation} zurückgetreten und beendet seine Trainerkarriere.",
    },
    offer: {
      title: "Jobangebot: {nation}",
      body: "Der Verband von {nation} möchte dich als neuen Cheftrainer. Das Angebot gilt bis {date}.",
    },
    newJob: {
      title: "Neuer Job: {nation}",
      body: "Du bist der neue Cheftrainer von {nation}.",
    },
    tourney: {
      through: "{comp}: weiter",
      throughTo: "Wir stehen in der Runde: {round}.",
      throughBare: "Wir sind weiter.",
      out: "{comp}: ausgeschieden",
      groupOut: "Wir haben {group} beendet, ohne weiterzukommen.",
      knockedOut: "Wir sind ausgeschieden in der Runde: {round}.",
      runnersUp: "{comp}: Vizemeister",
      lostFinal: "Wir haben das Finale verloren.",
    },
    qualified: {
      title: "Qualifiziert für {finals}",
      body: "Wir haben uns einen Platz bei {finals} verdient.",
    },
    playoff: {
      title: "Ab ins Playoff",
      body: "Wir haben das interkontinentale Playoff für {finals} erreicht.",
    },
    missedOut: {
      title: "Nicht qualifiziert",
      body: "Wir haben {finals} verpasst.",
    },
    finalsGeneric: "die Endrunde",
    injury: {
      title: "{name} verletzt",
      body: "{name} hat sich im Verein eine Verletzung zugezogen ({injury}) und fällt bis {date} aus.",
    },
    newClub: "ein neuer Verein",
    bigMove: {
      title: "{name} gelingt der große Wechsel",
      body: "{name} wechselt nach seinem Durchbruch in der Nationalmannschaft zu {club}.",
    },
    move: {
      title: "{name} wechselt",
      body: "{name} schließt sich {club} an.",
    },
    prospects: {
      title: "Deine Talente in dieser Saison",
      body: "So haben sich die Youngster entwickelt, die du beobachtest: {list}.",
    },
    season: {
      title: "Die Saison {from}–{to} beginnt",
      body: "Die Spieler haben sich in der letzten Saison weiterentwickelt, und das Sommer-Transferfenster ist geschlossen.",
    },
    retired: {
      entry: "{name} ({pos}, {age})",
      entryCaps: "{name} ({pos}, {age}, {caps} Länderspiele)",
    },
    retire: {
      title: "{name} beendet die Länderspielkarriere",
      body: "{name} ({age}, {caps} Länderspiele) hat seinen Rücktritt aus der Nationalmannschaft erklärt.",
    },
    wonderkid: {
      title: "Wunderkind taucht auf: {name}",
      body: "Die Scouts schwärmen von {name}, einem {age} Jahre alten Spieler ({pos}) bei {club}.",
    },
    newgen: {
      entry: "{name} ({pos}, {age}, {club})",
    },
    retiredMany: {
      title: "{n} Spieler hören auf",
      body: "Diese Spieler haben ihre Schuhe an den Nagel gehängt: {list}.",
    },
    newgens: {
      title: "{n} Youngster rücken nach",
      body: "Die neue Generation, die für uns spielberechtigt ist: {list}.",
    },
    stadium: {
      build: {
        title: "Bau des {stadium} beginnt",
        body: "Der Verband baut in {city} ein Stadion mit {seats} Plätzen, das am {date} eröffnet werden soll.",
      },
      expand: {
        title: "{stadium} wird ausgebaut",
        body: "Das {stadium} in {city} fasst nach Abschluss der Arbeiten am {date} {seats} Zuschauer.",
      },
      opened: {
        build: "{nation} eröffnet das {stadium}",
        expand: "{stadium} ausgebaut",
        body: "Das {stadium} in {city} fasst jetzt {seats}{ready}.",
      },
      readyFor: ", bereit für die {comp}",
    },
    champions: {
      title: "{winner} gewinnt die {comp}",
      body: "{winner} ist Sieger{beat}.",
      beat: " und schlägt im Finale {runnerUp}",
    },
    draw: {
      title: "{comp}: {stage}",
      group: "Die Auslosung ist erfolgt. Wir treffen auf {others}.",
      tie: "Uns wurde {opp} zugelost.",
    },
    and: "{a} und {b}",
    host: {
      title: "{list} richtet die {comp} aus",
      one: "{list} richtet die {comp} aus, Beginn am {date}.",
      many: "{list} richten die {comp} gemeinsam aus, Beginn am {date}.",
    },
    placeholder: {
      title: "{team} rückt nach",
      body: "{team} gewinnt {label} und füllt diesen Platz in der Auslosung.",
    },
  },
  ms: {
    trophy: "Deine erste Trophäe: die {comp}.",
    world: "Weltmeister! {nation} gewinnt die {comp}.",
    continental: "Meister deines Kontinents: die {comp}.",
    qualification: "Du hast {nation} zu einem großen Turnier geführt.",
    worldCup: "Du hast {nation} zu einer Weltmeisterschaft geführt.",
    firstWin: "Dein erster Sieg als Nationaltrainer.",
    matches: "{n} Spiele als Nationaltrainer.",
    debuts: "{n} Spieler haben unter dir ihr erstes Länderspiel bestritten.",
    youthDebuts: "Fünf Spieler bis 21 Jahre auf internationaler Ebene eingesetzt.",
    unbeaten: "Zehn Pflichtspiele ungeschlagen.",
    top10: "{nation} gehört unter dir zu den zehn besten Teams der Welt.",
    no1: "{nation} ist die beste Mannschaft der Welt.",
  },
  review: {
    reached: {
      champions: "Sieger",
      knockedOut: "Ausgeschieden",
      qualified: "Qualifiziert",
      notQualified: "Nicht qualifiziert",
      leagueStage: "Ligaphase",
      promoted: "Aufstieg in Liga {letter}",
      relegated: "Abstieg in Liga {letter}",
      stayed: "Klassenerhalt in Liga {letter}",
      runnersUp: "Zweiter",
      groups: "Gruppenphase",
    },
    msg: {
      delightedChampion:
        "Der Verband ist begeistert. Der Gewinn der {comp} übertrifft alles, was man zu hoffen wagte, und dein Ansehen war nie höher.",
      delighted:
        "Der Verband ist begeistert von der {comp}. Du hast ihm mehr gegeben, als er verlangt hatte.",
      satisfied:
        "Der Verband ist mit der {comp} zufrieden. Die Aufgabe ist erledigt; nun erwartet man, dass du darauf aufbaust.",
      disappointed:
        "Der Verband ist von der {comp} enttäuscht. Er hatte mehr erwartet, und seine Geduld ist nicht endlos.",
      ultimatum:
        "Nach der {comp} ist dem Verband die Geduld ausgegangen. Die Ergebnisse müssen sich sofort verbessern, sonst sucht man jemanden, der sie liefert.",
      sacked:
        "Die {comp} war der letzte Tropfen. Der Verband hat beschlossen, dich von deinen Aufgaben zu entbinden.",
      contractEnd:
        "Mit der {comp} endet dein Vertrag, und der Verband hat beschlossen, ihn nicht zu verlängern.",
    },
  },
  fx: {
    friendly: "Länderspiel-Freundschaftsspiel",
    window: "Internationales Zeitfenster",
    matchday: "{stage} · Spieltag {n}",
    groupMatchday: "{stage} · {group} · Spieltag {n}",
    round: "{round}",
    stageRound: "{stage} · {round}",
    roundLeg: "{round} · {leg}. Spiel",
    stageRoundLeg: "{stage} · {round} · {leg}. Spiel",
  },
  lineup: {
    nobody: "Niemand spielt {pos}",
    notInSquad: "{name} ({pos}) steht nicht im Kader",
    injured: "{name} ({pos}) ist verletzt ({label})",
    suspended: "{name} ({pos}) ist gesperrt",
  },
  placeholder: {
    uefa: "UEFA-Playoff, Pfad {path}",
    path: "Playoff-Pfad {path}",
    tournament: "Playoff-Turnier",
    qualifier: "Qualifikant {n}",
    winner: "Sieger {base}",
    tournamentWinner: "Sieger Playoff-Turnier {n}",
    shortIc: "IK {n}",
    shortPo: "PO {path}",
  },
  injury: {
    "hamstring-strain": "Muskelzerrung in der Oberschenkelrückseite",
    "ankle-sprain": "Sprunggelenksverstauchung",
    "calf-strain": "Wadenzerrung",
    "groin-strain": "Leistenzerrung",
    "thigh-strain": "Oberschenkelzerrung",
    "knee-injury": "Knieverletzung",
    "broken-foot": "Fußbruch",
    "cruciate-ligament-rupture": "Kreuzbandriss",
    knock: "Prellung",
  },
  stage: {
    group: "Gruppe {name}",
    league: "Liga",
    leagueN: "Liga {x}",
    roundOf: "Runde der letzten {n}",
    "round-of-16": "Achtelfinale",
    "round-of-32": "Sechzehntelfinale",
    "quarter-finals": "Viertelfinale",
    "semi-finals": "Halbfinale",
    final: "Finale",
    finals: "Endrunde",
    "third-place": "Spiel um Platz drei",
    "bronze-final": "Spiel um Bronze",
    "group-stage": "Gruppenphase",
    "knockout-stage": "K.-o.-Phase",
    "league-phase": "Ligaphase",
    qualifying: "Qualifikation",
    "preliminary-round": "Vorrunde",
    preliminaryN: "Vorrunde {n}",
    prelims: "Vorrunde",
    "first-round": "Erste Runde",
    "second-round": "Zweite Runde",
    "third-round": "Dritte Runde",
    "fourth-round": "Vierte Runde",
    "fifth-round": "Fünfte Runde",
    "final-round": "Finalrunde",
    "play-offs": "Playoffs",
    "play-in": "Play-In",
    "play-off-round": "Playoff-Runde",
    "play-off-semi-finals": "Playoff-Halbfinale",
    "play-off-finals": "Playoff-Finals",
    "play-off-final": "Playoff-Finale",
    "play-off-tournament": "Playoff-Turnier",
    "promotion-relegation-play-offs": "Auf-/Abstiegs-Playoffs",
    "league-a-quarter-finals": "Viertelfinale Liga A",
    "league-a-finals": "Endrunde Liga A",
    "league-b-finals": "Endrunde Liga B",
    "league-c-finals": "Endrunde Liga C",
  },
  comp: {
    wc: {
      name: "Weltmeisterschaft {year}",
      short: "WM",
      plain: "Weltmeisterschaft",
    },
    "wcq-uefa": {
      name: "WM-Qualifikation {year} · UEFA",
      short: "WM-Quali Europa",
      plain: "WM-Qualifikation · UEFA",
    },
    "wcq-caf": {
      name: "WM-Qualifikation {year} · CAF",
      short: "WM-Quali Afrika",
      plain: "WM-Qualifikation · CAF",
    },
    "wcq-afc": {
      name: "WM-Qualifikation {year} · AFC",
      short: "WM-Quali Asien",
      plain: "WM-Qualifikation · AFC",
    },
    "wcq-concacaf": {
      name: "WM-Qualifikation {year} · CONCACAF",
      short: "WM-Quali CONCACAF",
      plain: "WM-Qualifikation · CONCACAF",
    },
    "wcq-conmebol": {
      name: "WM-Qualifikation {year} · CONMEBOL",
      short: "WM-Quali Südamerika",
      plain: "WM-Qualifikation · CONMEBOL",
    },
    "wcq-ofc": {
      name: "WM-Qualifikation {year} · OFC",
      short: "WM-Quali Ozeanien",
      plain: "WM-Qualifikation · OFC",
    },
    "wcq-ic": {
      name: "WM-Playoff-Turnier {year}",
      short: "Playoff",
      plain: "WM-Playoff-Turnier",
    },
    euro: {
      name: "UEFA Euro {year}",
      short: "EM",
      plain: "UEFA Euro",
    },
    euroq: {
      name: "UEFA Euro {year} Qualifikation",
      short: "EM-Quali",
      plain: "UEFA Euro Qualifikation",
    },
    unl: {
      name: "UEFA Nations League {year}–{year2}",
      short: "Nations League",
      plain: "UEFA Nations League",
    },
    finalissima: {
      name: "Finalissima {year}",
      short: "Finalissima",
      plain: "Finalissima",
    },
    afcon: {
      name: "Afrika-Cup {year}",
      short: "AFCON",
      plain: "Afrika-Cup",
    },
    afconq: {
      name: "Afrika-Cup {year} Qualifikation",
      short: "AFCON-Quali",
      plain: "Afrika-Cup Qualifikation",
    },
    "asian-cup": {
      name: "AFC Asien-Cup {year}",
      short: "Asien-Cup",
      plain: "AFC Asien-Cup",
    },
    "asian-cupq": {
      name: "AFC Asien-Cup {year} Qualifikation",
      short: "Asien-Cup-Quali",
      plain: "AFC Asien-Cup Qualifikation",
    },
    copa: {
      name: "Copa América {year}",
      short: "Copa América",
      plain: "Copa América",
    },
    "ofc-cup": {
      name: "OFC Nations Cup {year}",
      short: "OFC Nations Cup",
      plain: "OFC Nations Cup",
    },
    cnl: {
      name: "CONCACAF Nations League {year}–{year2}",
      short: "CONCACAF NL",
      plain: "CONCACAF Nations League",
    },
    gcq: {
      name: "CONCACAF Gold Cup {year} Vorrunde",
      short: "Gold-Cup-Vorrunde",
      plain: "CONCACAF Gold Cup Vorrunde",
    },
    "gold-cup": {
      name: "CONCACAF Gold Cup {year}",
      short: "Gold Cup",
      plain: "CONCACAF Gold Cup",
    },
    "arab-cup": {
      name: "Arabien-Cup {year}",
      short: "Arabien-Cup",
      plain: "Arabien-Cup",
    },
    "gulf-cup": {
      name: "Golfpokal {year}",
      short: "Golfpokal",
      plain: "Arabischer Golfpokal",
    },
    aff: {
      name: "ASEAN-Meisterschaft {year}",
      short: "ASEAN-Meisterschaft",
      plain: "ASEAN-Meisterschaft",
    },
    "asean-cup": {
      name: "ASEAN-Cup {year}",
      short: "ASEAN-Cup",
      plain: "ASEAN-Cup",
    },
    "asean-challenge": {
      name: "ASEAN Challenge Cup {year}",
      short: "ASEAN Challenge Cup",
      plain: "ASEAN Challenge Cup",
    },
    "inv-mar": {
      name: "Märzturnier {year}",
      short: "Märzturnier",
      plain: "Märzturnier",
    },
    "inv-jun": {
      name: "Juniturnier {year}",
      short: "Juniturnier",
      plain: "Juniturnier",
    },
    "inv-sep": {
      name: "Herbstturnier {year}",
      short: "Herbstturnier",
      plain: "Herbstturnier",
    },
    "inv-nov": {
      name: "Novemberturnier {year}",
      short: "Novemberturnier",
      plain: "Novemberturnier",
    },
    e1: {
      name: "EAFF E-1-Meisterschaft {year}",
      short: "E-1",
      plain: "EAFF E-1-Meisterschaft",
    },
    cafa: {
      name: "CAFA Nations Cup {year}",
      short: "CAFA Nations Cup",
      plain: "CAFA Nations Cup",
    },
    waff: {
      name: "WAFF-Meisterschaft {year}",
      short: "WAFF-Meisterschaft",
      plain: "WAFF-Meisterschaft",
    },
    saff: {
      name: "SAFF-Meisterschaft {year}",
      short: "SAFF-Meisterschaft",
      plain: "SAFF-Meisterschaft",
    },
    cosafa: {
      name: "COSAFA-Cup {year}",
      short: "COSAFA-Cup",
      plain: "COSAFA-Cup",
    },
    cecafa: {
      name: "CECAFA Senior Challenge Cup {year}",
      short: "CECAFA-Cup",
      plain: "CECAFA Senior Challenge Cup",
    },
    wafu: {
      name: "WAFU Zone Cup {year}",
      short: "WAFU-Cup",
      plain: "WAFU Zone Cup",
    },
    baltic: {
      name: "Baltic Cup {year}",
      short: "Baltic Cup",
      plain: "Baltic Cup",
    },
  },
  role: {
    stopper: {
      label: "Vorstopper",
      blurb:
        "Rückt heraus, um den Ball zu erobern, und gewinnt jeden Kopfball; weniger Unterstützung am Ball.",
    },
    "ball-playing": {
      label: "Spielstarker Verteidiger",
      blurb: "Rückt mit dem Ball ins Mittelfeld vor; im Zweikampf etwas schwächer.",
    },
    cover: {
      label: "Absicherer",
      blurb: "Bleibt tief und sicher; foult selten, leitet selten einen Angriff ein.",
    },
    "defensive-full-back": {
      label: "Defensiver Außenverteidiger",
      blurb: "Hält seine Linie und geht in die Zweikämpfe; geht nicht nach vorn.",
    },
    "wing-back": {
      label: "Schienenspieler",
      blurb: "Beackert die ganze Außenbahn, flankt und schießt; lässt Räume hinter sich.",
    },
    "inverted-full-back": {
      label: "Inverser Außenverteidiger",
      blurb: "Rückt ins Mittelfeld ein, um das Spiel aufzubauen; gibt die Außenbahn auf.",
    },
    anchor: {
      label: "Abräumer vor der Abwehr",
      blurb: "Sitzt vor der Abwehr; schirmt sie ab und hält das Spiel einfach.",
    },
    "ball-winner": {
      label: "Balleroberer",
      blurb: "Jagt den Ball im ganzen Mittelfeld und foult dabei.",
    },
    "deep-playmaker": {
      label: "Tiefer Spielmacher",
      blurb: "Diktiert das Spiel aus der Tiefe; weniger Absicherung für die Abwehr.",
    },
    "box-to-box": {
      label: "Box-to-Box",
      blurb: "Deckt das ganze Feld ab und kommt spät in den Strafraum.",
    },
    playmaker: {
      label: "Spielmacher",
      blurb: "Gibt das Tempo vor und findet den tödlichen Pass; verteidigt weniger.",
    },
    destroyer: {
      label: "Zerstörer",
      blurb: "Unterbindet das Spiel und foult oft; bringt nach vorn wenig.",
    },
    "advanced-playmaker": {
      label: "Vorgeschobener Spielmacher",
      blurb: "Spielt zwischen den Linien und kreiert; trifft selbst weniger.",
    },
    "shadow-striker": {
      label: "Schattenstürmer",
      blurb: "Startet hinter dem Stürmer durch und schießt; kreiert weniger.",
    },
    tracker: {
      label: "Pressingspieler",
      blurb: "Presst von vorn und arbeitet nach hinten mit; weniger gefährlich.",
    },
    winger: {
      label: "Flügelspieler",
      blurb: "Bleibt an der Seitenlinie und liefert Flanken.",
    },
    "inside-forward": {
      label: "Inverser Flügel",
      blurb: "Zieht nach innen, um zu schießen; weniger Breite und weniger Flanken.",
    },
    "tracking-winger": {
      label: "Mitarbeitender Flügelspieler",
      blurb: "Arbeitet nach hinten, um dem Außenverteidiger zu helfen; geht weniger nach vorn.",
    },
    "target-man": {
      label: "Wandspieler",
      blurb: "Gewinnt Kopfbälle und behauptet den Ball; nicht der treffsicherste Abschließer.",
    },
    poacher: {
      label: "Strafraumstürmer",
      blurb: "Lauert im Strafraum auf Chancen; tut sonst nichts.",
    },
    "complete-forward": {
      label: "Kompletter Stürmer",
      blurb: "Trifft, bindet Mitspieler ein und kreiert.",
    },
    "pressing-forward": {
      label: "Pressingstürmer",
      blurb: "Setzt Verteidiger von vorn unter Druck; im Strafraum weniger gefährlich.",
    },
  },
  arch: {
    "shot-stopper": {
      label: "Linienkeeper",
      blurb: "Beherrscht seine Linie und hält, was nicht zu halten ist.",
    },
    "sweeper-keeper": {
      label: "Mitspielender Torwart",
      blurb: "Räumt hinter der Abwehr auf und leitet Angriffe ein; auf der Linie etwas unsicherer.",
    },
    stopper: {
      label: "Vorstopper",
      blurb: "Gewinnt Zweikämpfe und klärt per Kopf, bringt aber wenig in den Aufbau ein.",
    },
    "ball-playing-defender": {
      label: "Spielstarker Verteidiger",
      blurb: "Leitet Angriffe von hinten ein; im Zweikampf eine Spur schwächer.",
    },
    "defensive-full-back": {
      label: "Defensiver Außenverteidiger",
      blurb: "Bleibt hinten, geht in die Zweikämpfe und deckt die Außenbahn.",
    },
    "attacking-full-back": {
      label: "Offensiver Außenverteidiger",
      blurb: "Überlappt, flankt und rückt in den Strafraum ein; lässt Räume hinter sich.",
    },
    "ball-winner": {
      label: "Balleroberer",
      blurb: "Unterbindet das Spiel vor der Abwehr und foult dabei.",
    },
    "deep-playmaker": {
      label: "Tiefer Spielmacher",
      blurb: "Diktiert das Spiel aus der Tiefe mit langen Pässen.",
    },
    "box-to-box": {
      label: "Box-to-Box",
      blurb: "Läuft über jeden Grashalm und kommt spät in den Strafraum.",
    },
    playmaker: {
      label: "Spielmacher",
      blurb: "Gibt das Tempo vor und findet den tödlichen Pass.",
    },
    creator: {
      label: "Ideengeber",
      blurb: "Spielt zwischen den Linien; mehr Vorlagen als Tore.",
    },
    "shadow-striker": {
      label: "Schattenstürmer",
      blurb: "Startet hinter dem Stürmer durch und trifft selbst.",
    },
    winger: {
      label: "Flügelspieler",
      blurb: "Bleibt an der Seitenlinie und liefert Flanken.",
    },
    "inside-forward": {
      label: "Inverser Flügel",
      blurb: "Zieht vom Flügel nach innen, um zu schießen.",
    },
    "target-man": {
      label: "Wandspieler",
      blurb: "Gewinnt Kopfbälle und behauptet den Ball; nicht der treffsicherste Abschließer.",
    },
    poacher: {
      label: "Strafraumstürmer",
      blurb: "Lebt im Strafraum und verwertet, was kommt; sonst wenig.",
    },
    "complete-forward": {
      label: "Kompletter Stürmer",
      blurb: "Trifft, bindet Mitspieler ein und kreiert.",
    },
  },
  rule: {
    "behind-high-line": "Bälle in den Rücken einer hohen Abwehrlinie",
    "counter-into-deep-block": "Gegen einen tiefen Block gibt es nichts zu kontern",
    "width-into-back-five": "Breite verpufft gegen eine Fünferkette",
    "width-into-open-flanks": "Breite gegen eine flache Viererkette mit offenen Flanken",
    "patience-into-press": "Geduldiger Aufbau gegen hohes Pressing",
    "direct-past-press": "Direktes Spiel am hohen Pressing vorbei",
    "lone-striker-into-back-three": "Ein einzelner Stürmer gegen drei Innenverteidiger",
    "two-strikers-into-flat-four": "Zwei Stürmer gegen eine flache Viererkette",
    "midfield-numbers": "Mehr Spieler durch die Mitte",
    "midfield-outnumbered": "Durch die Mitte in Unterzahl",
    "press-patient-side": "Hohes Pressing gegen eine geduldige Mannschaft",
    "narrow-into-wide": "Ein schmales Team macht die Mitte gegen ein breites dicht",
  },
  badge: {
    "big-game": {
      label: "Spieler für große Spiele",
      text: "Spielt in Finals und Entscheidungen über seinem Niveau und behält vom Punkt die Nerven.",
    },
    reliable: {
      label: "Zuverlässig",
      text: "Spielt fast in jedem Spiel auf seinem Niveau.",
    },
    erratic: {
      label: "Unberechenbar",
      text: "Die Spielnoten schwanken; an einem Tag brillant, am nächsten schwach.",
    },
    "injury-prone": {
      label: "Verletzungsanfällig",
      text: "Zieht sich in einem Spiel eher eine Blessur zu.",
    },
    "tires-early": {
      label: "Ermüdet früh",
      text: "Geht die Puste früher aus als bei einem jüngeren Spieler.",
    },
  },
  bond: {
    clubmates: "Vereinskollegen",
    friends: "Freunde",
    feud: "Feindschaft",
  },
  spirit: {
    tight: "Eng verschworen",
    good: "Gut",
    neutral: "Neutral",
    uneasy: "Unruhig",
    divided: "Gespalten",
  },
  scout: {
    trait: {
      attack: "Offensiv ausgerichtet",
      cautious: "Vorsichtig",
      highLine: "Hohe Linie",
      deepLine: "Tiefe Linie",
      wide: "Spielt breit",
      narrow: "Spielt schmal",
      counter: "Konterstark",
      highPress: "Hohes Pressing",
      dropsOff: "Zieht sich zurück",
      direct: "Direkt",
      patient: "Geduldig",
      balanced: "Ausgewogen",
    },
    reason: {
      star: "Ihr bester Spieler",
      threat: "Ihre größte Torgefahr",
      creator: "Kreiert die meisten ihrer Chancen",
      weak: "Das schwächste Glied",
    },
    level: {
      "0": "Tief",
      "1": "Standard",
      "2": "Hoch",
    },
    width: {
      "0": "Schmal",
      "1": "Standard",
      "2": "Breit",
    },
    change: {
      line: "Abwehrlinie: {from} → {to}",
      width: "Breite: {from} → {to}",
      counter: "Konter: {from} → {to}",
    },
    on: "an",
    off: "aus",
  },
}

export default engine
