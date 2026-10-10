import type { CommentaryText } from "@/engine/match/commentary"

/** Live commentary in Italian; same placeholders as the English set. */
const commentary: CommentaryText = {
  assist: " Assist di {a}.",
  forward: "in avanti",
  lane: {
    left: "sulla sinistra",
    centre: "per vie centrali",
    right: "sulla destra",
  },
  shots: {
    long: {
      goal: [
        "GOL! {p} lascia partire un siluro da lontano ed è rete!{assist}",
        "GOL! Un missile di {p} da fuori area!{assist}",
      ],
      "shot-saved": [
        "{p} ci prova da lontano — {o} blocca.",
        "Tiro dalla distanza di {p}, facile preda di {o}.",
      ],
      "shot-wide": [
        "{p} tira da lontano. Fuori.",
        "{p} ci prova da fuori area — sopra la traversa.",
      ],
      "shot-blocked": ["Il tiro dalla distanza di {p} viene murato da {o}."],
      woodwork: ["{p} colpisce il palo da lontano!"],
    },
    close: {
      goal: [
        "GOL! {p} deve solo spingerla in rete da due passi!{assist}",
        "GOL! {p} insacca il pallone appena arretrato!{assist}",
      ],
      "shot-saved": ["{o} riesce a negare il gol a {p} da distanza ravvicinata!"],
      "big-chance-missed": [
        "{p} sbaglia incredibilmente da due passi!",
        "Il pallone è lì per {p}... e lui la manda fuori!",
      ],
    },
    header: {
      goal: [
        "GOL! {p} stacca più in alto di tutti e di testa la mette dentro!{assist}",
        "GOL! Che colpo di testa di {p}!{assist}",
      ],
      "shot-saved": ["{p} di testa, ma {o} para.", "Colpo di testa di {p} — dritto su {o}."],
      "shot-wide": [
        "{p} di testa, sopra la traversa.",
        "{p} arriva sul cross, ma il colpo di testa sfila.",
      ],
      woodwork: ["Il colpo di testa di {p} si stampa sulla traversa!"],
      "big-chance-missed": ["{p} è libero di testa e non trova la porta!"],
    },
    "one-on-one": {
      goal: [
        "GOL! {p} dribbla il portiere e segna!{assist}",
        "GOL! {p} è glaciale in uno contro uno e supera il portiere in uscita!{assist}",
      ],
      "shot-saved": [
        "{p} si ritrova solo davanti al portiere... {o} chiude l'angolo e para!",
        "Che parata di {o}! Resta in piedi nell'uno contro uno con {p}.",
      ],
      "big-chance-missed": [
        "{p} si ritrova solo davanti alla porta... e la spedisce fuori! Che errore!",
        "{p} solo contro il portiere e calcia a lato di un soffio!",
      ],
    },
    "free-kick": {
      goal: ["GOL! {p} infila la punizione all'incrocio!", "GOL! Che punizione di {p}!"],
      "shot-saved": [
        "{p} calcia la punizione di potenza — {o} devia in angolo!",
        "La punizione di {p} viene parata da {o}.",
      ],
      "shot-wide": [
        "La punizione di {p} finisce sopra la traversa.",
        "{p} calcia la punizione a giro, a lato di un soffio.",
      ],
      "shot-blocked": ["La punizione di {p} si stampa sulla barriera."],
      woodwork: ["La punizione di {p} si stampa sul palo!"],
    },
    rebound: {
      goal: [
        "GOL! {p} è il più lesto sulla respinta!",
        "GOL! Il portiere respinge e {p} ci arriva per primo!",
      ],
      "shot-saved": ["{p} arriva sulla ribattuta, ma {o} para ancora!"],
      "shot-wide": ["{p} ha fretta sulla ribattuta e la manda fuori."],
    },
  },
  moves: {
    counter: { before: "In contropiede! ", after: " Una ripartenza fulminea." },
    press: {
      before: "Palla rubata nella metà campo avversaria! ",
      after: " Punito l'errore in uscita.",
    },
  },
  lines: {
    kickoff: [
      "Si comincia!",
      "L'arbitro fischia e {team:home} dà il calcio d'inizio.",
      "Palla al centro. Si parte.",
    ],
    "half-time": [
      "L'arbitro fischia la fine del primo tempo.",
      "Finisce il primo tempo.",
      "Intervallo. I giocatori vanno negli spogliatoi.",
    ],
    "second-half": [
      "Comincia il secondo tempo.",
      "Palla in gioco per gli ultimi quarantacinque minuti.",
    ],
    "full-time": ["L'arbitro fischia la fine della partita!", "È finita!", "Fine della partita."],
    "et-start": [
      "Iniziano i tempi supplementari. Altri trenta minuti per decidere.",
      "Ecco i supplementari.",
    ],
    "et-half-time": ["Intervallo dei supplementari. Mancano quindici minuti."],
    "et-second-half": ["Iniziano gli ultimi quindici minuti dei supplementari."],
    "et-end": [
      "Nulla separa le squadre. Si va ai rigori!",
      "I supplementari non hanno deciso nulla — si va ai rigori.",
    ],
    attack: [
      "{p} avanza col pallone per {team} {lane}, ma {o} si fa trovare pronto.",
      "{team} costruisce l'azione {lane}, ma l'ultimo passaggio è intercettato da {o}.",
      "{p} cerca lo spazio. {o} legge bene la giocata.",
      "Costruzione paziente di {team}, ma l'ultimo passaggio è sbagliato.",
      "{p} prova il passaggio filtrante — intercettato da {o}.",
    ],
    goal: [
      "GOL! {p} fa gonfiare la rete per {team}!{assist}",
      "GOL! {p} non perdona!{assist}",
      "GOL! Che conclusione di {p}!{assist}",
      "GOL! {p} la mette dentro per {team}!{assist}",
      "GOL! {p} è al posto giusto per spingerla in rete!{assist}",
    ],
    "own-goal": [
      "AUTOGOL! {p} la manda nella propria porta. Un disastro per lui.",
      "AUTOGOL! {p} riesce solo a beffare il proprio portiere.",
    ],
    "penalty-awarded": [
      "RIGORE! {o} atterra {p} in area!",
      "L'arbitro indica il dischetto! {p} è steso da {o}.",
    ],
    "pen-goal": ["GOL! {p} spiazza il portiere dal dischetto!", "GOL! {p} trasforma il rigore!"],
    "pen-saved": [
      "PARATO! {o} intuisce l'angolo e ferma il rigore di {p}!",
      "Il rigore di {p} viene parato da {o}!",
    ],
    "pen-miss": [
      "{p} spedisce il rigore sopra la traversa!",
      "{p} calcia il rigore fuori! Un enorme sollievo.",
    ],
    "shot-saved": [
      "{p} mette alla prova il portiere — {o} para.",
      "Bel tiro di {p}, ma {o} è bravo a bloccare.",
      "{p} calcia in porta. Parata comoda di {o}.",
      "Grande intervento di {o} per negare il gol a {p}!",
    ],
    "shot-wide": [
      "{p} tira da lontano. Fuori.",
      "{p} conclude, ma la palla va sopra la traversa.",
      "{p} si sbilancia al momento del tiro e l'occasione sfuma.",
      "{p} piazza il tiro e la palla sfiora il palo.",
    ],
    "shot-blocked": [
      "{p} tira — murato da {o}!",
      "La conclusione di {p} viene respinta.",
      "Intervento coraggioso di {o} per fermare {p}.",
    ],
    woodwork: [
      "{p} colpisce il palo!",
      "Traversa! {p} ha sfiorato il gol!",
      "{p} fa tremare il palo!",
    ],
    "big-chance-missed": [
      "Che occasione! {p} doveva segnare, ma la manda fuori!",
      "{p} è solo davanti alla porta... e sbaglia! Incredibile.",
      "{p} aveva solo il portiere davanti e spreca!",
    ],
    corner: [
      "Calcio d'angolo per {team}.",
      "{team} si guadagna un corner.",
      "Deviazione e palla in fallo laterale di fondo: angolo per {team}.",
    ],
    "free-kick": [
      "Punizione per {team} in posizione pericolosa.",
      "{p} viene atterrato. Punizione, e siamo a tiro di porta.",
    ],
    foul: [
      "Fallo di {p} su {o}.",
      "{p} entra da dietro su {o}. Fallo.",
      "{p} colpisce {o}. L'arbitro fischia.",
    ],
    yellow: [
      "Cartellino giallo per {p}.",
      "{p} finisce sul taccuino dell'arbitro.",
      "L'arbitro estrae il giallo per {p}.",
    ],
    "second-yellow": [
      "Secondo giallo per {p}! È espulso!",
      "{p} prende il secondo cartellino e viene espulso!",
    ],
    red: ["CARTELLINO ROSSO! {p} è espulso!", "Rosso diretto per {p}! {team} resta in dieci."],
    offside: [
      "{p} è colto in fuorigioco.",
      "Il guardalinee alza la bandierina contro {p}.",
      "{p} è partito troppo presto. Fuorigioco.",
    ],
    injury: [
      "{p} è a terra e ha bisogno di cure.",
      "Preoccupazione per {team}: {p} si è fatto male.",
      "{p} si ferma tenendosi la gamba.",
    ],
    sub: ["Cambio per {team}: {p} entra al posto di {o}.", "{team} cambia. Esce {o}, entra {p}."],
    tactics: ["{team} cambia modo di giocare.", "La panchina di {team} fa degli aggiustamenti."],
    "shootout-goal": ["{p} segna.", "{p} realizza.", "{p} — all'incrocio!"],
    "shootout-miss": [
      "{p} sbaglia!",
      "Il rigore di {p} viene parato!",
      "{p} calcia sopra la traversa!",
    ],
    "shootout-end": [
      "{team} vince la lotteria dei rigori!",
      "È {team} che mantiene i nervi saldi!",
    ],
  },
}

export default commentary
