import type { CommentaryText } from "@/engine/match/commentary"

/** Live commentary in German; same placeholders as the English set. */
const commentary: CommentaryText = {
  assist: " Vorlage von {a}.",
  forward: "nach vorn",
  lane: {
    left: "über links",
    centre: "durch die Mitte",
    right: "über rechts",
  },
  shots: {
    long: {
      goal: [
        "TOOOR! {p} zieht aus der Distanz ab, und der Ball schlägt ein!{assist}",
        "TOOOR! Ein Hammer von {p} von der Strafraumgrenze!{assist}",
      ],
      "shot-saved": [
        "{p} versucht es aus der Ferne – {o} hat den Ball sicher.",
        "Distanzschuss von {p}, sicher in den Händen von {o}.",
      ],
      "shot-wide": [
        "{p} probiert es aus der Ferne. Vorbei.",
        "{p} schießt von außerhalb des Strafraums – drüber.",
      ],
      "shot-blocked": ["Der Distanzschuss von {p} wird von {o} geblockt."],
      woodwork: ["{p} trifft aus der Distanz den Pfosten!"],
    },
    close: {
      goal: [
        "TOOOR! {p} drückt den Ball aus kurzer Distanz über die Linie!{assist}",
        "TOOOR! {p} vollendet den Rückpass!{assist}",
      ],
      "shot-saved": ["{o} vereitelt den Treffer von {p} aus nächster Nähe!"],
      "big-chance-missed": [
        "{p} vergibt unfassbar aus fünf Metern!",
        "Der Ball liegt mundgerecht für {p} da ... und er schießt vorbei!",
      ],
    },
    header: {
      goal: [
        "TOOOR! {p} steigt höher als alle anderen und köpft ein!{assist}",
        "TOOOR! Was für ein Kopfball von {p}!{assist}",
      ],
      "shot-saved": ["{p} köpft, aber {o} pariert.", "Kopfball von {p} – direkt auf {o}."],
      "shot-wide": [
        "{p} köpft drüber.",
        "{p} kommt an die Flanke, aber der Kopfball geht daneben.",
      ],
      woodwork: ["Der Kopfball von {p} kracht an die Latte!"],
      "big-chance-missed": ["{p} köpft völlig frei am Tor vorbei!"],
    },
    "one-on-one": {
      goal: [
        "TOOOR! {p} umkurvt den Torwart und schiebt ein!{assist}",
        "TOOOR! {p} bleibt im Eins-gegen-eins eiskalt und schiebt am Torwart vorbei!{assist}",
      ],
      "shot-saved": [
        "{p} läuft allein aufs Tor zu ... {o} verkürzt den Winkel und hält!",
        "Was für eine Parade von {o}! Er bleibt im Eins-gegen-eins gegen {p} lange stehen.",
      ],
      "big-chance-missed": [
        "{p} ist allein vor dem Tor ... und schießt vorbei! Was für eine Chance!",
        "{p} steht dem Torwart allein gegenüber und setzt den Ball knapp neben den Pfosten!",
      ],
    },
    "free-kick": {
      goal: [
        "TOOOR! {p} zirkelt den Freistoß in den Winkel!",
        "TOOOR! Was für ein Freistoß von {p}!",
      ],
      "shot-saved": [
        "{p} schießt den Freistoß direkt – {o} lenkt ihn zur Ecke!",
        "Der Freistoß von {p} wird von {o} gehalten.",
      ],
      "shot-wide": [
        "Der Freistoß von {p} fliegt drüber.",
        "{p} schlenzt den Freistoß knapp am Pfosten vorbei.",
      ],
      "shot-blocked": ["Der Freistoß von {p} kracht in die Mauer."],
      woodwork: ["Der Freistoß von {p} knallt an den Pfosten!"],
    },
    rebound: {
      goal: [
        "TOOOR! {p} staubt ab!",
        "TOOOR! Der Torwart lässt abprallen, und {p} ist zur Stelle!",
      ],
      "shot-saved": ["{p} kommt an den Abpraller, aber {o} hält erneut!"],
      "shot-wide": ["{p} übereilt den Nachschuss und schießt vorbei."],
    },
  },
  moves: {
    counter: { before: "Konter! ", after: " Ein blitzschneller Konter." },
    press: {
      before: "Ballgewinn im Angriffsdrittel! ",
      after: " Die Strafe für den Ballverlust.",
    },
  },
  lines: {
    kickoff: [
      "Es geht los!",
      "Der Schiedsrichter pfeift, und {team:home} hat Anstoß.",
      "Anpfiff. Los geht's.",
    ],
    "half-time": [
      "Der Schiedsrichter pfeift zur Halbzeit.",
      "Das war die erste Halbzeit.",
      "Halbzeit. Die Spieler gehen in die Kabine.",
    ],
    "second-half": [
      "Die zweite Halbzeit läuft.",
      "Weiter geht's mit den zweiten fünfundvierzig Minuten.",
    ],
    "full-time": ["Der Schiedsrichter pfeift ab!", "Das war's!", "Abpfiff."],
    "et-start": [
      "Die Verlängerung beginnt. Noch dreißig Minuten, um die Entscheidung zu suchen.",
      "Jetzt geht es in die Verlängerung.",
    ],
    "et-half-time": ["Seitenwechsel in der Verlängerung. Noch fünfzehn Minuten."],
    "et-second-half": ["Die letzten fünfzehn Minuten der Verlängerung laufen."],
    "et-end": [
      "Noch immer nichts zwischen den Teams. Es geht ins Elfmeterschießen!",
      "Auch die Verlängerung bringt keine Entscheidung – es gibt Elfmeterschießen.",
    ],
    attack: [
      "{p} treibt den Ball für {team} {lane} nach vorn, aber {o} geht dazwischen.",
      "{team} spielt es {lane}, doch der letzte Pass wird von {o} abgefangen.",
      "{p} sucht eine Lücke. {o} liest das Spiel gut.",
      "Geduldiger Aufbau von {team}, aber der letzte Pass kommt nicht an.",
      "{p} versucht es mit einem Steilpass – abgefangen von {o}.",
    ],
    goal: [
      "TOOOR! {p} schnürt für {team} den Ball ins Netz!{assist}",
      "TOOOR! {p} lässt nichts anbrennen!{assist}",
      "TOOOR! Was für ein Abschluss von {p}!{assist}",
      "TOOOR! {p} netzt für {team} ein!{assist}",
      "TOOOR! {p} ist zur Stelle und drückt den Ball über die Linie!{assist}",
    ],
    "own-goal": [
      "EIGENTOR! {p} schießt den Ball ins eigene Netz. Ein Albtraum für ihn.",
      "EIGENTOR! {p} lenkt den Ball über den eigenen Torwart hinweg ins Tor.",
    ],
    "penalty-awarded": [
      "ELFMETER! {o} bringt {p} im Strafraum zu Fall!",
      "Der Schiedsrichter zeigt auf den Punkt! {p} wird von {o} gefoult.",
    ],
    "pen-goal": [
      "TOOOR! {p} schickt den Torwart in die falsche Ecke!",
      "TOOOR! {p} verwandelt den Elfmeter!",
    ],
    "pen-saved": [
      "GEHALTEN! {o} ahnt die Ecke und pariert den Elfmeter von {p}!",
      "Der Elfmeter von {p} wird von {o} gehalten!",
    ],
    "pen-miss": [
      "{p} setzt den Elfmeter über die Latte!",
      "{p} schießt den Elfmeter am Tor vorbei! Eine riesige Erleichterung.",
    ],
    "shot-saved": [
      "{p} prüft den Torwart – {o} hält.",
      "Guter Schuss von {p}, aber {o} ist zur Stelle.",
      "{p} schießt aufs Tor. Sichere Parade von {o}.",
      "Starke Parade von {o} gegen {p}!",
    ],
    "shot-wide": [
      "{p} probiert es aus der Ferne. Vorbei.",
      "{p} schließt ab, aber der Ball fliegt drüber.",
      "{p} verstolpert den Schuss, und die Chance ist dahin.",
      "{p} zielt, und der Ball geht knapp am Pfosten vorbei.",
    ],
    "shot-blocked": [
      "{p} schießt – geblockt von {o}!",
      "Der Schuss von {p} wird geblockt.",
      "Mutiger Block von {o} gegen {p}.",
    ],
    woodwork: [
      "{p} trifft den Pfosten!",
      "Latte! {p} war dem Tor ganz nah!",
      "{p} lässt den Pfosten wackeln!",
    ],
    "big-chance-missed": [
      "Was für eine Chance! {p} muss treffen, schießt aber vorbei!",
      "{p} steht frei vor dem Tor ... und vergibt! Unfassbar.",
      "{p} hatte nur noch den Torwart vor sich und lässt es liegen!",
    ],
    corner: [
      "Ecke für {team}.",
      "{team} erkämpft sich eine Ecke.",
      "Abgefälscht und raus: Ecke für {team}.",
    ],
    "free-kick": [
      "Freistoß für {team} in gefährlicher Position.",
      "{p} wird gefoult. Freistoß, in Schussweite des Tores.",
    ],
    foul: [
      "Foul von {p} an {o}.",
      "{p} kommt von hinten gegen {o}. Foul.",
      "{p} trifft {o}. Der Schiedsrichter pfeift.",
    ],
    yellow: [
      "Gelbe Karte für {p}.",
      "{p} sieht Gelb.",
      "Der Schiedsrichter zeigt {p} die Gelbe Karte.",
    ],
    "second-yellow": [
      "Zweite Gelbe Karte für {p}! Er muss runter!",
      "{p} sieht Gelb-Rot und wird des Feldes verwiesen!",
    ],
    red: ["ROTE KARTE! {p} fliegt vom Platz!", "Glatt Rot für {p}! {team} ist nur noch zu zehnt."],
    offside: [
      "{p} wird beim Abseits ertappt.",
      "Der Linienrichter hebt die Fahne gegen {p}.",
      "{p} ist zu früh gestartet. Abseits.",
    ],
    injury: [
      "{p} liegt am Boden und braucht Behandlung.",
      "Sorge bei {team}: {p} hat sich wehgetan.",
      "{p} bleibt stehen und hält sich das Bein.",
    ],
    sub: [
      "Wechsel bei {team}: {p} kommt für {o}.",
      "{team} wechselt. Raus geht {o}, rein kommt {p}.",
    ],
    tactics: ["{team} ändert die Spielweise.", "Die Bank von {team} stellt um."],
    "shootout-goal": ["{p} trifft.", "{p} verwandelt.", "{p} – in den Winkel!"],
    "shootout-miss": [
      "{p} verschießt!",
      "Der Schuss von {p} wird gehalten!",
      "{p} schießt drüber!",
    ],
    "shootout-end": ["{team} gewinnt das Elfmeterschießen!", "{team} behält die Nerven!"],
  },
}

export default commentary
