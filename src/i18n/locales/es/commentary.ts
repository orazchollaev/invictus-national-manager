import type { CommentaryText } from "@/engine/match/commentary"

/** Live commentary in Spanish; same placeholders as the English set. */
const commentary: CommentaryText = {
  assist: " Asistencia de {a}.",
  forward: "hacia delante",
  lane: {
    left: "por la izquierda",
    centre: "por el centro",
    right: "por la derecha",
  },
  shots: {
    long: {
      goal: [
        "¡GOL! ¡{p} se inventa un zapatazo desde lejos y es gol!{assist}",
        "¡GOL! ¡Un misil de {p} desde fuera del área!{assist}",
      ],
      "shot-saved": [
        "{p} lo intenta de lejos — {o} se queda con el balón.",
        "Disparo lejano de {p}, bien sujetado por {o}.",
      ],
      "shot-wide": [
        "{p} dispara desde lejos. Fuera.",
        "{p} lo intenta desde fuera del área — por encima del larguero.",
      ],
      "shot-blocked": ["El disparo lejano de {p} es bloqueado por {o}."],
      woodwork: ["¡{p} estrella el balón en la madera desde lejos!"],
    },
    close: {
      goal: [
        "¡GOL! ¡{p} empuja el balón a placer, a bocajarro!{assist}",
        "¡GOL! ¡{p} remata el pase atrás!{assist}",
      ],
      "shot-saved": ["¡{o} evita como puede el gol de {p} a quemarropa!"],
      "big-chance-missed": [
        "¡{p} falla de forma increíble desde el punto de penalti!",
        "Se lo ponen en bandeja a {p}... ¡y la manda fuera!",
      ],
    },
    header: {
      goal: [
        "¡GOL! ¡{p} se eleva más que nadie y cabecea a la red!{assist}",
        "¡GOL! ¡Qué cabezazo de {p}!{assist}",
      ],
      "shot-saved": ["{p} cabecea, pero {o} ataja.", "Cabezazo de {p} — directo a {o}."],
      "shot-wide": [
        "{p} cabecea por encima del larguero.",
        "{p} llega al centro, pero su cabezazo se va fuera.",
      ],
      woodwork: ["¡El cabezazo de {p} se estrella en el larguero!"],
      "big-chance-missed": ["¡{p} cabecea solo y no encuentra la portería!"],
    },
    "one-on-one": {
      goal: [
        "¡GOL! ¡{p} regatea al portero y marca!{assist}",
        "¡GOL! ¡{p} mantiene la sangre fría en el mano a mano y se la cuela al portero!{assist}",
      ],
      "shot-saved": [
        "{p} se planta solo ante el portero... ¡{o} se estira y para!",
        "¡Qué intervención de {o}! Se crece en el mano a mano con {p}.",
      ],
      "big-chance-missed": [
        "{p} queda solo ante el portero... ¡y la manda fuera! ¡Qué fallo!",
        "¡{p} se planta solo ante el portero y la pone junto al poste!",
      ],
    },
    "free-kick": {
      goal: ["¡GOL! ¡{p} la mete por la escuadra de falta!", "¡GOL! ¡Qué golazo de falta de {p}!"],
      "shot-saved": [
        "{p} dispara la falta directa — ¡{o} la manda a córner!",
        "El lanzamiento de falta de {p} lo detiene {o}.",
      ],
      "shot-wide": [
        "La falta lanzada por {p} pasa por encima del larguero.",
        "{p} la pone con rosca, rozando el poste.",
      ],
      "shot-blocked": ["El lanzamiento de {p} se estrella en la barrera."],
      woodwork: ["¡La falta de {p} da en el poste!"],
    },
    rebound: {
      goal: ["¡GOL! ¡{p} aprovecha el rechace!", "¡GOL! ¡El portero rechaza y {p} llega primero!"],
      "shot-saved": ["{p} recoge el rechace, ¡pero {o} vuelve a parar!"],
      "shot-wide": ["{p} se precipita en el rechace y la manda fuera."],
    },
  },
  moves: {
    counter: { before: "¡Al contraataque! ", after: " Un contraataque letal." },
    press: {
      before: "¡Recupera el balón en campo rival! ",
      after: " Castigo por la pérdida.",
    },
  },
  lines: {
    kickoff: [
      "¡Arranca el partido!",
      "Pita el árbitro y {team:home} pone el balón en juego.",
      "Rueda el balón. Allá vamos.",
    ],
    "half-time": [
      "El árbitro pita el final de la primera parte.",
      "Termina el primer tiempo.",
      "Descanso. Los jugadores se marchan a los vestuarios.",
    ],
    "second-half": [
      "Comienza la segunda parte.",
      "Vuelve a rodar el balón para los últimos cuarenta y cinco minutos.",
    ],
    "full-time": ["¡El árbitro pita el final del partido!", "¡Se acabó!", "Final del partido."],
    "et-start": ["Empieza la prórroga. Treinta minutos más para decidirlo.", "Llega la prórroga."],
    "et-half-time": ["Descanso de la prórroga. Quedan quince minutos."],
    "et-second-half": ["Arrancan los quince minutos finales de la prórroga."],
    "et-end": [
      "Nada separa a los equipos. ¡Se va a los penaltis!",
      "La prórroga no desempata — será en los penaltis.",
    ],
    attack: [
      "{p} avanza con el balón para {team} {lane}, pero {o} sale al paso.",
      "{team} elabora la jugada {lane}, pero {o} corta el último pase.",
      "{p} busca un hueco. {o} lee bien la jugada.",
      "Construcción paciente de {team}, pero el último pase sale mal.",
      "{p} intenta un pase filtrado — interceptado por {o}.",
    ],
    goal: [
      "¡GOL! ¡{p} bate la red para {team}!{assist}",
      "¡GOL! ¡{p} no perdona!{assist}",
      "¡GOL! ¡Qué definición de {p}!{assist}",
      "¡GOL! ¡{p} la manda al fondo de la red para {team}!{assist}",
      "¡GOL! ¡{p} aparece para empujarla!{assist}",
    ],
    "own-goal": [
      "¡GOL EN PROPIA PUERTA! {p} la mete en su propia red. Un desastre para él.",
      "¡GOL EN PROPIA PUERTA! {p} solo consigue desviarla por encima de su portero.",
    ],
    "penalty-awarded": [
      "¡PENALTI! ¡{o} derriba a {p} dentro del área!",
      "¡El árbitro señala el punto de penalti! {o} comete falta sobre {p}.",
    ],
    "pen-goal": [
      "¡GOL! ¡{p} engaña al portero desde los once metros!",
      "¡GOL! ¡{p} convierte el penalti!",
    ],
    "pen-saved": [
      "¡PARADA! ¡{o} adivina la esquina y detiene el penalti de {p}!",
      "¡{o} para el penalti de {p}!",
    ],
    "pen-miss": [
      "¡{p} manda el penalti por encima del larguero!",
      "¡{p} lanza el penalti fuera! Un alivio enorme.",
    ],
    "shot-saved": [
      "{p} pone a prueba al portero — {o} atrapa el balón.",
      "Buen disparo de {p}, pero {o} responde bien.",
      "{p} dispara a puerta. Parada tranquila de {o}.",
      "¡Gran parada de {o} para negarle el gol a {p}!",
    ],
    "shot-wide": [
      "{p} dispara desde lejos. Fuera.",
      "{p} remata, pero el balón se va por encima.",
      "{p} se descoloca en el momento del disparo y se esfuma la ocasión.",
      "{p} coloca el balón y pasa rozando el poste.",
    ],
    "shot-blocked": [
      "¡{p} dispara — bloqueado por {o}!",
      "El remate de {p} es bloqueado.",
      "Valiente bloqueo de {o} para frenar a {p}.",
    ],
    woodwork: [
      "¡{p} da en el poste!",
      "¡En el larguero! ¡{p} estuvo cerca!",
      "¡{p} hace temblar el poste!",
    ],
    "big-chance-missed": [
      "¡Qué ocasión! ¡{p} tenía que marcar, pero la manda fuera!",
      "{p} está solo ante el gol... ¡y falla! Increíble.",
      "¡{p} solo tenía al portero delante y lo desperdicia!",
    ],
    corner: [
      "Córner para {team}.",
      "{team} consigue un córner.",
      "Desvía y sale: córner para {team}.",
    ],
    "free-kick": [
      "Falta para {team} en zona peligrosa.",
      "Derriban a {p}. Falta, y está al alcance de la portería.",
    ],
    foul: [
      "Falta de {p} sobre {o}.",
      "{p} llega tarde sobre {o}. Falta.",
      "{p} golpea a {o}. El árbitro pita.",
    ],
    yellow: [
      "Tarjeta amarilla para {p}.",
      "{p} se va a la libreta del árbitro.",
      "El árbitro saca la amarilla a {p}.",
    ],
    "second-yellow": [
      "¡Segunda amarilla para {p}! ¡Expulsado!",
      "¡{p} ve la segunda tarjeta y se va a la calle!",
    ],
    red: ["¡TARJETA ROJA! ¡{p} es expulsado!", "¡Roja directa para {p}! {team} se queda con diez."],
    offside: [
      "{p} es sorprendido en fuera de juego.",
      "El juez de línea levanta la bandera contra {p}.",
      "{p} salió demasiado pronto. Fuera de juego.",
    ],
    injury: [
      "{p} está en el suelo y necesita asistencia.",
      "Preocupación en {team}: {p} se ha lesionado.",
      "{p} se detiene agarrándose la pierna.",
    ],
    sub: [
      "Cambio en {team}: {p} entra por {o}.",
      "{team} mueve el banquillo. Sale {o}, entra {p}.",
    ],
    tactics: ["{team} cambia su forma de jugar.", "El banquillo de {team} hace ajustes."],
    "shootout-goal": ["{p} marca.", "{p} convierte.", "¡{p} — a la escuadra!"],
    "shootout-miss": [
      "¡{p} falla!",
      "¡Le paran el lanzamiento a {p}!",
      "¡{p} la manda por encima!",
    ],
    "shootout-end": ["¡{team} gana la tanda!", "¡{team} es quien mantiene la sangre fría!"],
  },
}

export default commentary
