import type en from "../en/engine"

const engine: typeof en = {
  obj: {
    qualify: "Clasificarse: {comp}",
    unbeaten: "{text} sin perder",
    promotion: "Lograr el ascenso desde la Liga {letter}",
    relegation: "Evitar el descenso de la Liga {letter}",
    win: "Ser campeón: {comp}",
    reach: {
      knockout: "Llegar a la fase eliminatoria: {comp}",
      "quarter-finals": "Llegar a cuartos de final: {comp}",
      "semi-finals": "Llegar a semifinales: {comp}",
      final: "Llegar a la final: {comp}",
    },
    debuts: "Dar el debut con la selección a {count} jugadores de 21 años o menos en {year}",
    raiseNote:
      "Recompensas ×{reward}; quedarse corto cuesta {cost} de confianza y el objetivo original vuelve a regir",
    lowerNote: "Cuesta {cost} de confianza ahora; recompensas a la mitad",
    lowerNeeds: "La directiva solo escuchará con una confianza del {n}% o más",
  },
  news: {
    raise: {
      title: "Subes el listón",
      body: "Has prometido más a la federación: “{text}”. Cumple y no lo olvidarán.",
    },
    lower: {
      title: "Expectativas rebajadas",
      body: "La federación ha aceptado a regañadientes un objetivo menor: “{text}”.",
    },
    broken: {
      title: "Promesa incumplida",
      body: "Prometiste “{promised}” y te quedaste corto. La federación sigue esperando que cumplas “{target}”.",
    },
    met: {
      title: "Objetivo cumplido",
      body: "La federación está encantada: “{text}” — hecho. El respaldo extra llegará también a las canteras.",
    },
    missed: {
      title: "Objetivo fallido",
      body: "La federación está descontenta: no logramos “{text}”.",
    },
    friendly: "un amistoso",
    derbyWin: {
      title: "El día del clásico es de {us}",
      body: "Victoria por {score} sobre el eterno rival, {them}, en {comp}. Las calles celebran.",
    },
    derbyLoss: {
      title: "Derrota en el clásico ante {them}",
      body: "Derrota por {score} ante {them} en {comp}. La afición no olvidará esta fácilmente.",
    },
    derbyDraw: {
      title: "Tablas en el clásico",
      body: "{us} y {them} empataron {score} en {comp}. Ninguno se queda con el orgullo.",
    },
    fans: {
      angry: {
        title: "La afición se vuelve contra el seleccionador",
        body: "Los aficionados de {nation} han dejado clara su ira. La directiva escucha.",
      },
      adore: {
        title: "La afición está contigo",
        body: "Los seguidores de {nation} cantan el nombre del seleccionador. El estadio vibrará.",
      },
    },
    invitational: {
      title: "{host} organizará: {comp}",
      body: "{host} será sede de {comp}, con la participación de {teams}. Empieza el {date}.",
    },
    invite: {
      title: "Invitación de {host}",
      body: "{host} nos invita a un torneo de {n} equipos en la ventana que comienza el {date}. Necesitan una respuesta.",
    },
    inviteLapsed: {
      title: "Invitación caducada",
      body: "No respondimos a tiempo a la invitación de {host}; el torneo sigue adelante sin nosotros.",
    },
    inviteOff: {
      title: "Torneo cancelado",
      body: "El torneo de {host} no pudo celebrarse: no todos los equipos siguen libres.",
    },
    riot: {
      title: "{us} arrasa a {them}",
      body: "Victoria por {score} sobre {them} en {comp}. La afición recordará esta.",
    },
    shock: {
      title: "Sorpresa ante {them}",
      body: "Pocos nos daban opciones, pero vencimos a {them} por {score} en {comp}.",
    },
    humiliation: {
      title: "Humillación ante {them}",
      body: "Derrota por {score} ante {them} en {comp}. Se cuestiona al seleccionador.",
    },
    embarrassing: {
      title: "Derrota bochornosa ante {them}",
      body: "Se esperaba que ganáramos, pero perdimos por {score} ante {them} en {comp}.",
    },
    cap: {
      title: "{name} llega a {caps} partidos con la selección",
      body: "{name} ya ha jugado {caps} veces con {nation}.",
    },
    goals: {
      title: "{name} alcanza los {goals} goles con la selección",
      body: "{name} ya ha marcado {goals} goles con {nation}.",
    },
    debut: {
      title: "Primer partido de {name}",
      body: "Debutan con la selección ante {opp}: {names}.",
    },
    debuts: {
      title: "{n} debuts",
    },
    milestone: "Hito alcanzado",
    ultimatum: {
      title: "Último aviso",
      body: "La federación ha perdido la paciencia. Sube su confianza al {lifted}% en {matches} partidos oficiales o serás reemplazado.",
    },
    eases: {
      title: "La presión se alivia",
      body: "Los resultados han cambiado. La federación ha retirado su último aviso.",
    },
    sacked: {
      title: "Destituido",
      body: "La federación de {nation} te ha relevado de tus funciones.",
    },
    resigned: {
      title: "Has dimitido",
      body: "Has dejado el cargo de seleccionador de {nation}.",
    },
    notRenewed: {
      title: "Contrato sin renovar",
      body: "La federación de {nation} ha decidido no renovar tu contrato.",
    },
    renewed: {
      title: "Contrato renovado",
      body: "La federación de {nation} ha renovado tu contrato hasta el {date}.",
    },
    extended: {
      title: "Un año más",
      body: "La federación de {nation} ha ampliado tu contrato por un solo año. Quieren ver progresos.",
    },
    coachChange: {
      title: "{nation} cambia de entrenador",
      body: "{nation} ha nombrado a {coach} como nuevo seleccionador.",
    },
    coachSacked: {
      title: "{nation} destituye a {coach}",
      body: "{nation} se ha separado del seleccionador {coach} tras una mala racha. Ha comenzado la búsqueda de un sucesor.",
    },
    coachRetired: {
      title: "{coach} se retira",
      body: "{coach} ha dejado el cargo de seleccionador de {nation} y se ha retirado de los banquillos.",
    },
    offer: {
      title: "Oferta de trabajo: {nation}",
      body: "La federación de {nation} te quiere como su nuevo seleccionador. La oferta sigue en pie hasta el {date}.",
    },
    newJob: {
      title: "Nuevo puesto: {nation}",
      body: "Eres el nuevo seleccionador de {nation}.",
    },
    tourney: {
      through: "{comp}: clasificados",
      throughTo: "Pasamos a: {round}.",
      throughBare: "Pasamos de ronda.",
      out: "{comp}: eliminados",
      groupOut: "Terminamos en {group} sin pasar de ronda.",
      knockedOut: "Hemos quedado eliminados en: {round}.",
      runnersUp: "{comp}: subcampeones",
      lostFinal: "Perdimos la final.",
    },
    qualified: {
      title: "Clasificados para {finals}",
      body: "Nos hemos ganado un lugar en {finals}.",
    },
    playoff: {
      title: "Al play-off",
      body: "Hemos llegado al play-off intercontinental por {finals}.",
    },
    missedOut: {
      title: "No nos clasificamos",
      body: "Nos hemos quedado fuera de {finals}.",
    },
    finalsGeneric: "la fase final",
    injury: {
      title: "{name} lesionado",
      body: "{name} ha sufrido una lesión ({injury}) con su club y estará de baja hasta el {date}.",
    },
    newClub: "un nuevo club",
    bigMove: {
      title: "{name} da un gran salto",
      body: "{name} ficha por {club} tras su irrupción con la selección.",
    },
    move: {
      title: "{name} cambia de aires",
      body: "{name} ficha por {club}.",
    },
    prospects: {
      title: "Tus promesas esta temporada",
      body: "Cómo se desarrollaron los jóvenes que sigues: {list}.",
    },
    season: {
      title: "Comienza la temporada {from}–{to}",
      body: "Los jugadores se han desarrollado durante la última temporada y el mercado de fichajes de verano ha cerrado.",
    },
    retired: {
      entry: "{name} ({pos}, {age})",
      entryCaps: "{name} ({pos}, {age}, {caps} partidos)",
    },
    retire: {
      title: "{name} deja la selección",
      body: "{name} ({age} años, {caps} partidos) ha anunciado su retirada del fútbol internacional.",
    },
    wonderkid: {
      title: "Surge una joven promesa: {name}",
      body: "Los ojeadores no paran de elogiar a {name}, {pos} de {age} años en {club}.",
    },
    newgen: {
      entry: "{name} ({pos}, {age}, {club})",
    },
    retiredMany: {
      title: "Se retiran {n} jugadores",
      body: "Estos jugadores han colgado las botas: {list}.",
    },
    newgens: {
      title: "Llegan {n} jóvenes",
      body: "La nueva generación elegible para nosotros: {list}.",
    },
    stadium: {
      build: {
        title: "Comienzan las obras del {stadium}",
        body: "La federación construye un estadio de {seats} localidades en {city}, que abrirá el {date}.",
      },
      expand: {
        title: "Ampliación del {stadium}",
        body: "El {stadium} de {city} tendrá capacidad para {seats} cuando terminen las obras, el {date}.",
      },
      opened: {
        build: "{nation} inaugura el {stadium}",
        expand: "{stadium} ampliado",
        body: "El {stadium} de {city} ya tiene capacidad para {seats}{ready}.",
      },
      readyFor: ", listo para: {comp}",
    },
    champions: {
      title: "{winner} gana: {comp}",
      body: "{winner} es campeón{beat}.",
      beat: ", tras vencer a {runnerUp} en la final",
    },
    draw: {
      title: "{comp}: {stage}",
      group: "Se hace el sorteo. Nos enfrentamos a {others}.",
      tie: "Nos ha tocado {opp}.",
    },
    and: "{a} y {b}",
    host: {
      title: "{list} organizará: {comp}",
      one: "{list} organizará {comp}, a partir del {date}.",
      many: "{list} coorganizarán {comp}, a partir del {date}.",
    },
    placeholder: {
      title: "{team} ocupa su lugar",
      body: "{team} gana {label} y ocupa ese lugar en el sorteo.",
    },
  },
  ms: {
    trophy: "Tu primer trofeo: {comp}.",
    world: "¡Campeones del mundo! {nation} gana {comp}.",
    continental: "Campeones de tu continente: {comp}.",
    qualification: "Has llevado a {nation} a un gran torneo.",
    worldCup: "Has llevado a {nation} a un Mundial.",
    firstWin: "Tu primera victoria como seleccionador.",
    matches: "{n} partidos como seleccionador.",
    debuts: "{n} jugadores han debutado con la selección bajo tu mando.",
    youthDebuts: "Cinco jugadores de 21 años o menos se estrenaron a nivel internacional.",
    unbeaten: "Diez partidos oficiales sin perder.",
    top10: "{nation} está entre las diez mejores selecciones del mundo bajo tu mando.",
    no1: "{nation} es la mejor selección del mundo.",
  },
  review: {
    reached: {
      champions: "Campeones",
      knockedOut: "Eliminados",
      qualified: "Clasificados",
      notQualified: "No clasificados",
      leagueStage: "Fase de liga",
      promoted: "Ascenso a la Liga {letter}",
      relegated: "Descenso a la Liga {letter}",
      stayed: "Permanencia en la Liga {letter}",
      runnersUp: "Subcampeones",
      groups: "Fase de grupos",
    },
    msg: {
      delightedChampion:
        "La federación está encantada. Ganar {comp} supera lo que nadie se atrevía a esperar, y tu prestigio nunca ha sido tan alto.",
      delighted: "La federación está encantada con {comp}. Les has dado más de lo que pedían.",
      satisfied:
        "La federación está satisfecha con {comp}. El trabajo está hecho; ahora esperan que sigas construyendo sobre ello.",
      disappointed:
        "La federación está decepcionada con {comp}. Esperaban más y su paciencia no es infinita.",
      ultimatum:
        "Tras {comp}, la federación ha agotado su paciencia. Los resultados deben mejorar de inmediato o buscarán a alguien que los consiga.",
      sacked:
        "{comp} fue la gota que colmó el vaso. La federación ha decidido relevarte de tus funciones.",
      contractEnd:
        "{comp} marca el final de tu contrato, y la federación ha decidido no renovarlo.",
    },
  },
  fx: {
    friendly: "Amistoso internacional",
    window: "Ventana internacional",
    matchday: "{stage} · Jornada {n}",
    groupMatchday: "{stage} · {group} · Jornada {n}",
    round: "{round}",
    stageRound: "{stage} · {round}",
    roundLeg: "{round} · Partido {leg}",
    stageRoundLeg: "{stage} · {round} · Partido {leg}",
  },
  lineup: {
    nobody: "Nadie juega de {pos}",
    notInSquad: "{name} ({pos}) no está en la convocatoria",
    injured: "{name} ({pos}) está lesionado ({label})",
    suspended: "{name} ({pos}) está sancionado",
  },
  placeholder: {
    uefa: "Play-off UEFA, vía {path}",
    path: "Play-off, vía {path}",
    tournament: "Torneo de play-off",
    qualifier: "Clasificado {n}",
    winner: "Ganador de {base}",
    tournamentWinner: "Ganador {n} del torneo de play-off",
    shortIc: "IC {n}",
    shortPo: "PO {path}",
  },
  injury: {
    "hamstring-strain": "Distensión de isquiotibiales",
    "ankle-sprain": "Esguince de tobillo",
    "calf-strain": "Distensión de gemelo",
    "groin-strain": "Distensión inguinal",
    "thigh-strain": "Distensión de muslo",
    "knee-injury": "Lesión de rodilla",
    "broken-foot": "Fractura de pie",
    "cruciate-ligament-rupture": "Rotura del ligamento cruzado",
    knock: "Golpe",
  },
  stage: {
    group: "Grupo {name}",
    league: "Liga",
    leagueN: "Liga {x}",
    roundOf: "Ronda de {n}",
    "round-of-16": "Octavos de final",
    "round-of-32": "Dieciseisavos de final",
    "quarter-finals": "Cuartos de final",
    "semi-finals": "Semifinales",
    final: "Final",
    finals: "Fase final",
    "third-place": "Tercer puesto",
    "bronze-final": "Final de bronce",
    "group-stage": "Fase de grupos",
    "knockout-stage": "Fase eliminatoria",
    "league-phase": "Fase de liga",
    qualifying: "Clasificación",
    "preliminary-round": "Ronda preliminar",
    preliminaryN: "Ronda preliminar {n}",
    prelims: "Previa",
    "first-round": "Primera ronda",
    "second-round": "Segunda ronda",
    "third-round": "Tercera ronda",
    "fourth-round": "Cuarta ronda",
    "fifth-round": "Quinta ronda",
    "final-round": "Ronda final",
    "play-offs": "Play-offs",
    "play-in": "Play-In",
    "play-off-round": "Ronda de play-off",
    "play-off-semi-finals": "Semifinales de play-off",
    "play-off-finals": "Finales de play-off",
    "play-off-final": "Final de play-off",
    "play-off-tournament": "Torneo de play-off",
    "promotion-relegation-play-offs": "Play-offs de ascenso/descenso",
    "league-a-quarter-finals": "Cuartos de final de la Liga A",
    "league-a-finals": "Fase final de la Liga A",
    "league-b-finals": "Fase final de la Liga B",
    "league-c-finals": "Fase final de la Liga C",
  },
  comp: {
    wc: {
      name: "Copa Mundial {year}",
      short: "Mundial",
      plain: "Copa Mundial",
    },
    "wcq-uefa": {
      name: "Clasificación Mundial {year} · UEFA",
      short: "Clasif. Europa",
      plain: "Clasificación Mundial · UEFA",
    },
    "wcq-caf": {
      name: "Clasificación Mundial {year} · CAF",
      short: "Clasif. África",
      plain: "Clasificación Mundial · CAF",
    },
    "wcq-afc": {
      name: "Clasificación Mundial {year} · AFC",
      short: "Clasif. Asia",
      plain: "Clasificación Mundial · AFC",
    },
    "wcq-concacaf": {
      name: "Clasificación Mundial {year} · CONCACAF",
      short: "Clasif. CONCACAF",
      plain: "Clasificación Mundial · CONCACAF",
    },
    "wcq-conmebol": {
      name: "Clasificación Mundial {year} · CONMEBOL",
      short: "Clasif. Sudamérica",
      plain: "Clasificación Mundial · CONMEBOL",
    },
    "wcq-ofc": {
      name: "Clasificación Mundial {year} · OFC",
      short: "Clasif. Oceanía",
      plain: "Clasificación Mundial · OFC",
    },
    "wcq-ic": {
      name: "Torneo de play-off del Mundial {year}",
      short: "Play-off",
      plain: "Torneo de play-off del Mundial",
    },
    euro: {
      name: "Eurocopa UEFA {year}",
      short: "Eurocopa",
      plain: "Eurocopa UEFA",
    },
    euroq: {
      name: "Clasificación Eurocopa UEFA {year}",
      short: "Clasif. Eurocopa",
      plain: "Clasificación Eurocopa UEFA",
    },
    unl: {
      name: "Liga de Naciones UEFA {year}–{year2}",
      short: "Liga de Naciones",
      plain: "Liga de Naciones UEFA",
    },
    finalissima: {
      name: "Finalissima {year}",
      short: "Finalissima",
      plain: "Finalissima",
    },
    afcon: {
      name: "Copa Africana de Naciones {year}",
      short: "CAN",
      plain: "Copa Africana de Naciones",
    },
    afconq: {
      name: "Clasificación Copa Africana de Naciones {year}",
      short: "Clasif. CAN",
      plain: "Clasificación Copa Africana de Naciones",
    },
    "asian-cup": {
      name: "Copa Asiática AFC {year}",
      short: "Copa Asiática",
      plain: "Copa Asiática AFC",
    },
    "asian-cupq": {
      name: "Clasificación Copa Asiática AFC {year}",
      short: "Clasif. Copa Asiática",
      plain: "Clasificación Copa Asiática AFC",
    },
    copa: {
      name: "Copa América {year}",
      short: "Copa América",
      plain: "Copa América",
    },
    "ofc-cup": {
      name: "Copa de Naciones OFC {year}",
      short: "Copa de Naciones OFC",
      plain: "Copa de Naciones OFC",
    },
    cnl: {
      name: "Liga de Naciones CONCACAF {year}–{year2}",
      short: "LN CONCACAF",
      plain: "Liga de Naciones CONCACAF",
    },
    gcq: {
      name: "Previa de la Copa Oro CONCACAF {year}",
      short: "Previa Copa Oro",
      plain: "Previa de la Copa Oro CONCACAF",
    },
    "gold-cup": {
      name: "Copa Oro CONCACAF {year}",
      short: "Copa Oro",
      plain: "Copa Oro CONCACAF",
    },
    "arab-cup": {
      name: "Copa Árabe {year}",
      short: "Copa Árabe",
      plain: "Copa Árabe",
    },
    "gulf-cup": {
      name: "Copa del Golfo Arábigo {year}",
      short: "Copa del Golfo",
      plain: "Copa del Golfo Arábigo",
    },
    aff: {
      name: "Campeonato de la ASEAN {year}",
      short: "Campeonato ASEAN",
      plain: "Campeonato de la ASEAN",
    },
    "asean-cup": {
      name: "Copa ASEAN {year}",
      short: "Copa ASEAN",
      plain: "Copa ASEAN",
    },
    "asean-challenge": {
      name: "Copa Challenge ASEAN {year}",
      short: "Copa Challenge ASEAN",
      plain: "Copa Challenge ASEAN",
    },
    "inv-mar": {
      name: "Torneo Invitacional de Marzo {year}",
      short: "Invitacional de Marzo",
      plain: "Torneo Invitacional de Marzo",
    },
    "inv-jun": {
      name: "Torneo Invitacional de Junio {year}",
      short: "Invitacional de Junio",
      plain: "Torneo Invitacional de Junio",
    },
    "inv-sep": {
      name: "Torneo Invitacional de Otoño {year}",
      short: "Invitacional de Otoño",
      plain: "Torneo Invitacional de Otoño",
    },
    "inv-nov": {
      name: "Torneo Invitacional de Noviembre {year}",
      short: "Invitacional de Noviembre",
      plain: "Torneo Invitacional de Noviembre",
    },
    e1: {
      name: "Campeonato E-1 de la EAFF {year}",
      short: "E-1",
      plain: "Campeonato E-1 de la EAFF",
    },
    cafa: {
      name: "Copa de Naciones CAFA {year}",
      short: "Copa CAFA",
      plain: "Copa de Naciones CAFA",
    },
    waff: {
      name: "Campeonato WAFF {year}",
      short: "Campeonato WAFF",
      plain: "Campeonato WAFF",
    },
    saff: {
      name: "Campeonato SAFF {year}",
      short: "Campeonato SAFF",
      plain: "Campeonato SAFF",
    },
    cosafa: {
      name: "Copa COSAFA {year}",
      short: "Copa COSAFA",
      plain: "Copa COSAFA",
    },
    cecafa: {
      name: "Copa Challenge Senior CECAFA {year}",
      short: "Copa CECAFA",
      plain: "Copa Challenge Senior CECAFA",
    },
    wafu: {
      name: "Copa de la Zona WAFU {year}",
      short: "Copa WAFU",
      plain: "Copa de la Zona WAFU",
    },
    baltic: {
      name: "Copa Báltica {year}",
      short: "Copa Báltica",
      plain: "Copa Báltica",
    },
  },
  role: {
    stopper: {
      label: "Stopper",
      blurb: "Sale a ganar el balón y despeja todo de cabeza; menos ayuda con el balón.",
    },
    "ball-playing": {
      label: "Defensa con salida de balón",
      blurb: "Se incorpora al medio campo con el balón; más flojo en la entrada.",
    },
    cover: {
      label: "Defensa de cobertura",
      blurb: "Se queda atrás y seguro; rara vez comete faltas y rara vez inicia una jugada.",
    },
    "defensive-full-back": {
      label: "Lateral defensivo",
      blurb: "Mantiene su línea y corta; no se proyecta al ataque.",
    },
    "wing-back": {
      label: "Carrilero",
      blurb: "Recorre toda la banda, centra y dispara; deja espacio a su espalda.",
    },
    "inverted-full-back": {
      label: "Lateral invertido",
      blurb: "Se mete al medio campo para construir juego; cede la banda.",
    },
    anchor: {
      label: "Ancla",
      blurb: "Se sitúa delante de la defensa; la protege y juega simple.",
    },
    "ball-winner": {
      label: "Recuperador",
      blurb: "Persigue el balón por todo el medio campo y comete faltas al hacerlo.",
    },
    "deep-playmaker": {
      label: "Organizador retrasado",
      blurb: "Dirige el juego desde atrás; menos cobertura para la defensa.",
    },
    "box-to-box": {
      label: "Box to box",
      blurb: "Cubre todo el campo y llega tarde al área.",
    },
    playmaker: {
      label: "Mediapunta creador",
      blurb: "Marca el ritmo y encuentra el pase decisivo; defiende menos.",
    },
    destroyer: {
      label: "Destructor",
      blurb: "Corta el juego y comete muchas faltas; aporta poco en ataque.",
    },
    "advanced-playmaker": {
      label: "Organizador adelantado",
      blurb: "Juega entre líneas y crea; marca menos él mismo.",
    },
    "shadow-striker": {
      label: "Segundo delantero",
      blurb: "Se desmarca a la espalda del delantero y dispara; crea menos.",
    },
    tracker: {
      label: "Mediocentro de ida y vuelta",
      blurb: "Presiona arriba y repliega; menos amenaza.",
    },
    winger: {
      label: "Extremo",
      blurb: "Se pega a la banda y pone centros.",
    },
    "inside-forward": {
      label: "Extremo interior",
      blurb: "Se mete hacia dentro para disparar; menos amplitud y menos centros.",
    },
    "tracking-winger": {
      label: "Extremo trabajador",
      blurb: "Repliega para ayudar al lateral; menos presencia en ataque.",
    },
    "target-man": {
      label: "Delantero referencia",
      blurb: "Gana los balones aéreos y aguanta el balón; no es el más fino en la definición.",
    },
    poacher: {
      label: "Cazagoles",
      blurb: "Espera en el área las ocasiones; no hace nada más.",
    },
    "complete-forward": {
      label: "Delantero total",
      blurb: "Marca, combina y crea.",
    },
    "pressing-forward": {
      label: "Delantero presionante",
      blurb: "Acosa a los defensas desde arriba; menos peligro en el área.",
    },
  },
  arch: {
    "shot-stopper": {
      label: "Portero de reflejos",
      blurb: "Domina su línea y detiene lo imposible.",
    },
    "sweeper-keeper": {
      label: "Portero líbero",
      blurb: "Barre por detrás de la defensa e inicia ataques; algo menos seguro bajo palos.",
    },
    stopper: {
      label: "Stopper",
      blurb: "Gana los duelos y despeja de cabeza, pero aporta poco a la salida de balón.",
    },
    "ball-playing-defender": {
      label: "Defensa con salida de balón",
      blurb: "Inicia las jugadas desde atrás; algo más flojo en la entrada.",
    },
    "defensive-full-back": {
      label: "Lateral defensivo",
      blurb: "Se queda atrás, corta y cubre la banda.",
    },
    "attacking-full-back": {
      label: "Lateral ofensivo",
      blurb: "Sube por la banda, centra y se mete en el área; deja espacio a su espalda.",
    },
    "ball-winner": {
      label: "Recuperador",
      blurb: "Corta el juego delante de la defensa y comete faltas al hacerlo.",
    },
    "deep-playmaker": {
      label: "Organizador retrasado",
      blurb: "Dirige el juego desde atrás con pases largos.",
    },
    "box-to-box": {
      label: "Box to box",
      blurb: "Cubre cada palmo de césped y llega tarde al área.",
    },
    playmaker: {
      label: "Mediapunta creador",
      blurb: "Marca el ritmo y encuentra el pase decisivo.",
    },
    creator: {
      label: "Creador",
      blurb: "Juega entre líneas; más asistencias que goles.",
    },
    "shadow-striker": {
      label: "Segundo delantero",
      blurb: "Se desmarca a la espalda del delantero y marca él mismo.",
    },
    winger: {
      label: "Extremo",
      blurb: "Se pega a la banda y pone centros.",
    },
    "inside-forward": {
      label: "Extremo interior",
      blurb: "Se mete desde la banda hacia dentro para disparar.",
    },
    "target-man": {
      label: "Delantero referencia",
      blurb: "Gana los balones aéreos y aguanta el balón; no es el más fino en la definición.",
    },
    poacher: {
      label: "Cazagoles",
      blurb: "Vive en el área y remata lo que le llega; poco más.",
    },
    "complete-forward": {
      label: "Delantero total",
      blurb: "Marca, combina y crea.",
    },
  },
  rule: {
    "behind-high-line": "Balones a la espalda de una línea adelantada",
    "counter-into-deep-block": "Sin espacio para el contraataque ante un bloque bajo",
    "width-into-back-five": "La amplitud se desperdicia ante una defensa de cinco",
    "width-into-open-flanks": "Amplitud ante una línea de cuatro con bandas abiertas",
    "patience-into-press": "Construcción paciente ante una presión alta",
    "direct-past-press": "Juego directo para superar una presión alta",
    "lone-striker-into-back-three": "Un delantero solo ante tres centrales",
    "two-strikers-into-flat-four": "Dos delanteros ante una línea de cuatro",
    "midfield-numbers": "Más jugadores por el centro",
    "midfield-outnumbered": "En inferioridad por el centro",
    "press-patient-side": "Una presión alta ante un equipo paciente",
    "narrow-into-wide": "Un equipo cerrado satura el centro ante uno abierto",
  },
  badge: {
    "big-game": {
      label: "Jugador de grandes citas",
      text: "Rinde por encima de su nivel en finales y partidos decisivos, y no le tiembla el pulso desde los once metros.",
    },
    reliable: {
      label: "Fiable",
      text: "Rinde a su nivel casi todos los partidos.",
    },
    erratic: {
      label: "Irregular",
      text: "Sus notas oscilan; brillante un día, flojo al siguiente.",
    },
    "injury-prone": {
      label: "Propenso a lesiones",
      text: "Más probabilidades de sufrir un golpe en un partido.",
    },
    "tires-early": {
      label: "Se cansa pronto",
      text: "Se queda sin fuelle antes que un jugador más joven.",
    },
  },
  bond: {
    clubmates: "Compañeros de club",
    friends: "Amigos",
    feud: "Enemistad",
  },
  spirit: {
    tight: "Muy unido",
    good: "Bueno",
    neutral: "Neutro",
    uneasy: "Inquieto",
    divided: "Dividido",
  },
  scout: {
    trait: {
      attack: "Ofensivo",
      cautious: "Cauto",
      highLine: "Línea alta",
      deepLine: "Línea baja",
      wide: "Juega por las bandas",
      narrow: "Juega cerrado",
      counter: "Contraataque",
      highPress: "Presión alta",
      dropsOff: "Se repliega",
      direct: "Directo",
      patient: "Paciente",
      balanced: "Equilibrado",
    },
    reason: {
      star: "Su mejor jugador",
      threat: "Su principal amenaza de gol",
      creator: "Crea la mayoría de sus ocasiones",
      weak: "El eslabón débil",
    },
    level: {
      "0": "Atrasada",
      "1": "Estándar",
      "2": "Adelantada",
    },
    width: {
      "0": "Cerrada",
      "1": "Estándar",
      "2": "Abierta",
    },
    change: {
      line: "Línea defensiva: {from} → {to}",
      width: "Amplitud: {from} → {to}",
      counter: "Contraataque: {from} → {to}",
    },
    on: "sí",
    off: "no",
  },
}

export default engine
