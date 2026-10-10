import type en from "../en/engine"

const engine: typeof en = {
  obj: {
    qualify: "Qualificarsi per: {comp}",
    unbeaten: "{text} senza sconfitte",
    promotion: "Ottenere la promozione dalla Lega {letter}",
    relegation: "Evitare la retrocessione dalla Lega {letter}",
    win: "Vincere: {comp}",
    reach: {
      knockout: "Raggiungere la fase a eliminazione diretta: {comp}",
      "quarter-finals": "Raggiungere i quarti di finale: {comp}",
      "semi-finals": "Raggiungere le semifinali: {comp}",
      final: "Raggiungere la finale: {comp}",
    },
    debuts: "Far esordire in nazionale {count} giocatori di 21 anni o meno nel {year}",
    raiseNote:
      "Premi ×{reward}; fallire costa {cost} di fiducia, poi torna valido l'obiettivo originale",
    lowerNote: "Costa {cost} di fiducia ora; premi dimezzati",
    lowerNeeds: "La dirigenza ascolta solo con una fiducia del {n}% o superiore",
  },
  news: {
    raise: {
      title: "Alzi l'asticella",
      body: 'Hai promesso di più alla federazione: "{text}". Mantieni la parola, e non lo dimenticheranno.',
    },
    lower: {
      title: "Aspettative ridotte",
      body: 'La federazione ha accettato a malincuore un obiettivo più basso: "{text}".',
    },
    broken: {
      title: "Promessa non mantenuta",
      body: 'Avevi promesso di "{promised}" e non ci sei riuscito. La federazione si aspetta ancora che tu possa "{target}".',
    },
    met: {
      title: "Obiettivo raggiunto",
      body: 'La federazione è entusiasta: "{text}" — fatto. Il sostegno extra arriverà anche alle accademie.',
    },
    missed: {
      title: "Obiettivo mancato",
      body: 'La federazione è scontenta: non siamo riusciti a "{text}".',
    },
    friendly: "un'amichevole",
    derbyWin: {
      title: "Il derby è di {us}",
      body: "Vittoria per {score} sull'eterna rivale, {them}, in {comp}. Le strade sono in festa.",
    },
    derbyLoss: {
      title: "Derby perso contro {them}",
      body: "Battuti per {score} da {them} in {comp}. I tifosi non dimenticheranno presto questa partita.",
    },
    derbyDraw: {
      title: "Derby in parità",
      body: "{us} e {them} hanno pareggiato {score} in {comp}. Nessuna delle due ha il diritto di vantarsi.",
    },
    fans: {
      angry: {
        title: "I tifosi si rivoltano contro l'allenatore",
        body: "I tifosi di {nation} hanno espresso chiaramente la loro rabbia. La dirigenza ascolta.",
      },
      adore: {
        title: "I tifosi sono con te",
        body: "I tifosi di {nation} cantano il nome dell'allenatore. Lo stadio sarà un inferno.",
      },
    },
    invitational: {
      title: "{host} organizza: {comp}",
      body: "{host} ospiterà {comp}, con la partecipazione di {teams}. Inizia il {date}.",
    },
    invite: {
      title: "Invito da {host}",
      body: "{host} ci invita a un torneo a {n} squadre nella finestra che inizia il {date}. Aspettano una risposta.",
    },
    inviteLapsed: {
      title: "Invito scaduto",
      body: "Non abbiamo risposto in tempo all'invito di {host}; il torneo si farà senza di noi.",
    },
    inviteOff: {
      title: "Torneo annullato",
      body: "Il torneo di {host} non si può più fare: non tutte le squadre sono ancora libere.",
    },
    riot: {
      title: "{us} dilaga contro {them}",
      body: "Vittoria per {score} su {them} in {comp}. I tifosi se la ricorderanno.",
    },
    shock: {
      title: "Colpaccio contro {them}",
      body: "In pochi ci davano una possibilità, ma abbiamo battuto {them} per {score} in {comp}.",
    },
    humiliation: {
      title: "Umiliazione contro {them}",
      body: "Sconfitta per {score} contro {them} in {comp}. All'allenatore vengono poste delle domande.",
    },
    embarrassing: {
      title: "Sconfitta imbarazzante contro {them}",
      body: "Eravamo favoriti, ma abbiamo perso {score} contro {them} in {comp}.",
    },
    cap: {
      title: "{name} raggiunge le {caps} presenze",
      body: "{name} ha ormai giocato {caps} volte con {nation}.",
    },
    goals: {
      title: "{name} arriva a {goals} gol in nazionale",
      body: "{name} ha ormai segnato {goals} gol con {nation}.",
    },
    debut: {
      title: "Prima presenza per {name}",
      body: "Esordiscono in nazionale contro {opp}: {names}.",
    },
    debuts: {
      title: "{n} esordi",
    },
    milestone: "Traguardo raggiunto",
    ultimatum: {
      title: "Ultimo avvertimento",
      body: "La federazione ha perso la pazienza. Riporta la sua fiducia al {lifted}% entro {matches} partite ufficiali, o sarai sostituito.",
    },
    eases: {
      title: "La pressione cala",
      body: "I risultati sono cambiati. La federazione ha ritirato il suo ultimo avvertimento.",
    },
    sacked: {
      title: "Esonerato",
      body: "La federazione di {nation} ti ha sollevato dall'incarico.",
    },
    resigned: {
      title: "Ti sei dimesso",
      body: "Hai lasciato la guida tecnica di {nation}.",
    },
    notRenewed: {
      title: "Contratto non rinnovato",
      body: "La federazione di {nation} ha deciso di non rinnovare il tuo contratto.",
    },
    renewed: {
      title: "Contratto rinnovato",
      body: "La federazione di {nation} ha rinnovato il tuo contratto fino al {date}.",
    },
    extended: {
      title: "Un altro anno",
      body: "La federazione di {nation} ha prorogato il tuo contratto di un solo anno. Vuole vedere dei progressi.",
    },
    coachChange: {
      title: "{nation} cambia allenatore",
      body: "{nation} ha nominato {coach} nuovo commissario tecnico.",
    },
    coachSacked: {
      title: "{nation} esonera {coach}",
      body: "{nation} si è separata dal commissario tecnico {coach} dopo una serie negativa. È iniziata la ricerca del successore.",
    },
    coachRetired: {
      title: "{coach} si ritira",
      body: "{coach} ha lasciato la panchina di {nation} e si è ritirato dalla carriera di allenatore.",
    },
    offer: {
      title: "Offerta di lavoro: {nation}",
      body: "La federazione di {nation} ti vorrebbe come nuovo commissario tecnico. L'offerta è valida fino al {date}.",
    },
    newJob: {
      title: "Nuovo incarico: {nation}",
      body: "Sei il nuovo commissario tecnico di {nation}.",
    },
    tourney: {
      through: "{comp}: passa il turno",
      throughTo: "Siamo qualificati: {round}.",
      throughBare: "Siamo qualificati.",
      out: "{comp}: eliminati",
      groupOut: "Abbiamo chiuso il girone ({group}) senza qualificarci.",
      knockedOut: "Siamo stati eliminati: {round}.",
      runnersUp: "{comp}: finalisti",
      lostFinal: "Abbiamo perso la finale.",
    },
    qualified: {
      title: "Qualificati per {finals}",
      body: "Ci siamo guadagnati un posto a {finals}.",
    },
    playoff: {
      title: "Allo spareggio",
      body: "Abbiamo raggiunto lo spareggio tra confederazioni per {finals}.",
    },
    missedOut: {
      title: "Non qualificati",
      body: "Abbiamo mancato la qualificazione a {finals}.",
    },
    finalsGeneric: "alla fase finale",
    injury: {
      title: "{name} infortunato",
      body: "{name} si è procurato un infortunio ({injury}) con il club e starà fuori fino al {date}.",
    },
    newClub: "un nuovo club",
    bigMove: {
      title: "{name} conquista un grande trasferimento",
      body: "{name} passa a {club} grazie alla sua affermazione in nazionale.",
    },
    move: {
      title: "{name} cambia squadra",
      body: "{name} passa a {club}.",
    },
    prospects: {
      title: "I tuoi prospetti in questa stagione",
      body: "Come sono cresciuti i giovani che stai seguendo: {list}.",
    },
    season: {
      title: "Inizia la stagione {from}–{to}",
      body: "I giocatori sono cresciuti nell'ultima stagione e il mercato estivo è chiuso.",
    },
    retired: {
      entry: "{name} ({pos}, {age})",
      entryCaps: "{name} ({pos}, {age}, {caps} presenze)",
    },
    retire: {
      title: "{name} lascia la nazionale",
      body: "{name} ({age} anni, {caps} presenze) ha annunciato il ritiro dal calcio internazionale.",
    },
    wonderkid: {
      title: "Spunta un predestinato: {name}",
      body: "Gli osservatori sono entusiasti di {name}, {pos} di {age} anni di {club}.",
    },
    newgen: {
      entry: "{name} ({pos}, {age}, {club})",
    },
    retiredMany: {
      title: "{n} giocatori si ritirano",
      body: "Questi giocatori hanno appeso gli scarpini al chiodo: {list}.",
    },
    newgens: {
      title: "{n} giovani vengono fuori",
      body: "La nuova generazione selezionabile per noi: {list}.",
    },
    stadium: {
      build: {
        title: "Iniziano i lavori per lo stadio {stadium}",
        body: "La federazione sta costruendo a {city} uno stadio da {seats} posti, che aprirà il {date}.",
      },
      expand: {
        title: "Ampliamento dello stadio {stadium}",
        body: "Lo stadio {stadium} di {city} avrà {seats} posti a lavori finiti, il {date}.",
      },
      opened: {
        build: "{nation} inaugura lo stadio {stadium}",
        expand: "Stadio {stadium} ampliato",
        body: "Lo stadio {stadium} di {city} ha ora {seats} posti{ready}.",
      },
      readyFor: ", pronto per: {comp}",
    },
    champions: {
      title: "{winner} vince: {comp}",
      body: "{winner} è campione{beat}.",
      beat: ", battendo {runnerUp} in finale",
    },
    draw: {
      title: "{comp}: {stage}",
      group: "Il sorteggio è fatto. Affronteremo {others}.",
      tie: "Siamo stati sorteggiati contro {opp}.",
    },
    and: "{a} e {b}",
    host: {
      title: "{list} ospita: {comp}",
      one: "{list} ospiterà {comp}, con inizio il {date}.",
      many: "{list} ospiteranno insieme {comp}, con inizio il {date}.",
    },
    placeholder: {
      title: "{team} prende il suo posto",
      body: "{team} vince {label} e occupa quel posto nel sorteggio.",
    },
  },
  ms: {
    trophy: "Il tuo primo trofeo: {comp}.",
    world: "Campioni del mondo! {nation} vince {comp}.",
    continental: "Campioni del tuo continente: {comp}.",
    qualification: "Hai portato {nation} a un grande torneo.",
    worldCup: "Hai portato {nation} a un Mondiale.",
    firstWin: "La tua prima vittoria da commissario tecnico di una nazionale.",
    matches: "{n} partite da commissario tecnico di una nazionale.",
    debuts: "{n} giocatori hanno collezionato la prima presenza con te.",
    youthDebuts: "Cinque giocatori di 21 anni o meno lanciati a livello internazionale.",
    unbeaten: "Dieci partite ufficiali senza sconfitte.",
    top10: "Con te, {nation} è tra le prime dieci del mondo.",
    no1: "{nation} è la squadra più forte del mondo.",
  },
  review: {
    reached: {
      champions: "Campione",
      knockedOut: "Eliminata",
      qualified: "Qualificata",
      notQualified: "Non qualificata",
      leagueStage: "Fase a campionato",
      promoted: "Promossa in Lega {letter}",
      relegated: "Retrocessa in Lega {letter}",
      stayed: "Rimasta in Lega {letter}",
      runnersUp: "Finalista",
      groups: "Fase a gironi",
    },
    msg: {
      delightedChampion:
        "La federazione è entusiasta. Vincere: {comp} va oltre ciò che chiunque osasse sperare, e la tua considerazione non è mai stata così alta.",
      delighted:
        "La federazione è entusiasta di come è andata: {comp}. Le hai dato più di quanto chiedesse.",
      satisfied:
        "La federazione è soddisfatta di: {comp}. Il lavoro è stato fatto; ora si aspetta che tu costruisca su questa base.",
      disappointed:
        "La federazione è delusa da: {comp}. Si aspettava di più, e la sua pazienza non è infinita.",
      ultimatum:
        "Dopo: {comp}, la federazione ha esaurito la pazienza. I risultati devono migliorare subito, o troverà qualcuno in grado di ottenerli.",
      sacked:
        "{comp} è stata la goccia che ha fatto traboccare il vaso. La federazione ha deciso di sollevarti dall'incarico.",
      contractEnd:
        "{comp} segna la fine del tuo contratto, e la federazione ha deciso di non rinnovarlo.",
    },
  },
  fx: {
    friendly: "Amichevole internazionale",
    window: "Finestra internazionale",
    matchday: "{stage} · Giornata {n}",
    groupMatchday: "{stage} · {group} · Giornata {n}",
    round: "{round}",
    stageRound: "{stage} · {round}",
    roundLeg: "{round} · {leg}ª partita",
    stageRoundLeg: "{stage} · {round} · {leg}ª partita",
  },
  lineup: {
    nobody: "Nessuno gioca come {pos}",
    notInSquad: "{name} ({pos}) non è in rosa",
    injured: "{name} ({pos}) è infortunato ({label})",
    suspended: "{name} ({pos}) è squalificato",
  },
  placeholder: {
    uefa: "Spareggio UEFA, percorso {path}",
    path: "Spareggio, percorso {path}",
    tournament: "Torneo di spareggio",
    qualifier: "Qualificata {n}",
    winner: "Vincitrice: {base}",
    tournamentWinner: "Vincitrice {n} del torneo di spareggio",
    shortIc: "SC {n}",
    shortPo: "SP {path}",
  },
  injury: {
    "hamstring-strain": "Stiramento ai flessori",
    "ankle-sprain": "Distorsione alla caviglia",
    "calf-strain": "Stiramento al polpaccio",
    "groin-strain": "Stiramento all'inguine",
    "thigh-strain": "Stiramento alla coscia",
    "knee-injury": "Infortunio al ginocchio",
    "broken-foot": "Frattura al piede",
    "cruciate-ligament-rupture": "Rottura del legamento crociato",
    knock: "Contusione",
  },
  stage: {
    group: "Girone {name}",
    league: "Lega",
    leagueN: "Lega {x}",
    roundOf: "Turno da {n}",
    "round-of-16": "Ottavi di finale",
    "round-of-32": "Sedicesimi di finale",
    "quarter-finals": "Quarti di finale",
    "semi-finals": "Semifinali",
    final: "Finale",
    finals: "Fasi finali",
    "third-place": "Terzo posto",
    "bronze-final": "Finale per il bronzo",
    "group-stage": "Fase a gironi",
    "knockout-stage": "Fase a eliminazione diretta",
    "league-phase": "Fase a campionato",
    qualifying: "Qualificazioni",
    "preliminary-round": "Turno preliminare",
    preliminaryN: "Turno preliminare {n}",
    prelims: "Preliminari",
    "first-round": "Primo turno",
    "second-round": "Secondo turno",
    "third-round": "Terzo turno",
    "fourth-round": "Quarto turno",
    "fifth-round": "Quinto turno",
    "final-round": "Turno finale",
    "play-offs": "Spareggi",
    "play-in": "Play-In",
    "play-off-round": "Turno di spareggio",
    "play-off-semi-finals": "Semifinali di spareggio",
    "play-off-finals": "Finali di spareggio",
    "play-off-final": "Finale di spareggio",
    "play-off-tournament": "Torneo di spareggio",
    "promotion-relegation-play-offs": "Spareggi promozione/retrocessione",
    "league-a-quarter-finals": "Quarti di finale della Lega A",
    "league-a-finals": "Finali della Lega A",
    "league-b-finals": "Finali della Lega B",
    "league-c-finals": "Finali della Lega C",
  },
  comp: {
    wc: {
      name: "Mondiali {year}",
      short: "Mondiali",
      plain: "Mondiali",
    },
    "wcq-uefa": {
      name: "Qualificazioni Mondiali {year} · UEFA",
      short: "Qual. Europa",
      plain: "Qualificazioni Mondiali · UEFA",
    },
    "wcq-caf": {
      name: "Qualificazioni Mondiali {year} · CAF",
      short: "Qual. Africa",
      plain: "Qualificazioni Mondiali · CAF",
    },
    "wcq-afc": {
      name: "Qualificazioni Mondiali {year} · AFC",
      short: "Qual. Asia",
      plain: "Qualificazioni Mondiali · AFC",
    },
    "wcq-concacaf": {
      name: "Qualificazioni Mondiali {year} · CONCACAF",
      short: "Qual. CONCACAF",
      plain: "Qualificazioni Mondiali · CONCACAF",
    },
    "wcq-conmebol": {
      name: "Qualificazioni Mondiali {year} · CONMEBOL",
      short: "Qual. Sud America",
      plain: "Qualificazioni Mondiali · CONMEBOL",
    },
    "wcq-ofc": {
      name: "Qualificazioni Mondiali {year} · OFC",
      short: "Qual. Oceania",
      plain: "Qualificazioni Mondiali · OFC",
    },
    "wcq-ic": {
      name: "Torneo di spareggio Mondiali {year}",
      short: "Spareggio",
      plain: "Torneo di spareggio Mondiali",
    },
    euro: {
      name: "UEFA Euro {year}",
      short: "Euro",
      plain: "UEFA Euro",
    },
    euroq: {
      name: "Qualificazioni UEFA Euro {year}",
      short: "Qual. Euro",
      plain: "Qualificazioni UEFA Euro",
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
      name: "Coppa d'Africa {year}",
      short: "Coppa d'Africa",
      plain: "Coppa d'Africa",
    },
    afconq: {
      name: "Qualificazioni Coppa d'Africa {year}",
      short: "Qual. Coppa d'Africa",
      plain: "Qualificazioni Coppa d'Africa",
    },
    "asian-cup": {
      name: "Coppa d'Asia AFC {year}",
      short: "Coppa d'Asia",
      plain: "Coppa d'Asia AFC",
    },
    "asian-cupq": {
      name: "Qualificazioni Coppa d'Asia AFC {year}",
      short: "Qual. Coppa d'Asia",
      plain: "Qualificazioni Coppa d'Asia AFC",
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
      name: "Preliminari CONCACAF Gold Cup {year}",
      short: "Prel. Gold Cup",
      plain: "Preliminari CONCACAF Gold Cup",
    },
    "gold-cup": {
      name: "CONCACAF Gold Cup {year}",
      short: "Gold Cup",
      plain: "CONCACAF Gold Cup",
    },
    "arab-cup": {
      name: "Coppa araba {year}",
      short: "Coppa araba",
      plain: "Coppa araba",
    },
    "gulf-cup": {
      name: "Coppa del Golfo Arabico {year}",
      short: "Coppa del Golfo",
      plain: "Coppa del Golfo Arabico",
    },
    aff: {
      name: "Campionato ASEAN {year}",
      short: "Campionato ASEAN",
      plain: "Campionato ASEAN",
    },
    "asean-cup": {
      name: "Coppa ASEAN {year}",
      short: "Coppa ASEAN",
      plain: "Coppa ASEAN",
    },
    "asean-challenge": {
      name: "ASEAN Challenge Cup {year}",
      short: "ASEAN Challenge Cup",
      plain: "ASEAN Challenge Cup",
    },
    "inv-mar": {
      name: "Torneo a inviti di marzo {year}",
      short: "Torneo di marzo",
      plain: "Torneo a inviti di marzo",
    },
    "inv-jun": {
      name: "Torneo a inviti di giugno {year}",
      short: "Torneo di giugno",
      plain: "Torneo a inviti di giugno",
    },
    "inv-sep": {
      name: "Torneo a inviti d'autunno {year}",
      short: "Torneo d'autunno",
      plain: "Torneo a inviti d'autunno",
    },
    "inv-nov": {
      name: "Torneo a inviti di novembre {year}",
      short: "Torneo di novembre",
      plain: "Torneo a inviti di novembre",
    },
    e1: {
      name: "Campionato EAFF E-1 {year}",
      short: "E-1",
      plain: "Campionato EAFF E-1",
    },
    cafa: {
      name: "CAFA Nations Cup {year}",
      short: "CAFA Nations Cup",
      plain: "CAFA Nations Cup",
    },
    waff: {
      name: "Campionato WAFF {year}",
      short: "Campionato WAFF",
      plain: "Campionato WAFF",
    },
    saff: {
      name: "Campionato SAFF {year}",
      short: "Campionato SAFF",
      plain: "Campionato SAFF",
    },
    cosafa: {
      name: "Coppa COSAFA {year}",
      short: "Coppa COSAFA",
      plain: "Coppa COSAFA",
    },
    cecafa: {
      name: "CECAFA Senior Challenge Cup {year}",
      short: "Coppa CECAFA",
      plain: "CECAFA Senior Challenge Cup",
    },
    wafu: {
      name: "Coppa di zona WAFU {year}",
      short: "Coppa WAFU",
      plain: "Coppa di zona WAFU",
    },
    baltic: {
      name: "Coppa del Baltico {year}",
      short: "Coppa del Baltico",
      plain: "Coppa del Baltico",
    },
  },
  role: {
    stopper: {
      label: "Stopper",
      blurb: "Esce a recuperare palla e vince ogni duello aereo; meno aiuto col pallone.",
    },
    "ball-playing": {
      label: "Difensore con piedi buoni",
      blurb: "Avanza a centrocampo col pallone; meno incisivo nel contrasto.",
    },
    cover: {
      label: "Difensore di copertura",
      blurb: "Resta basso e sicuro; fa pochi falli e imposta poco.",
    },
    "defensive-full-back": {
      label: "Terzino difensivo",
      blurb: "Tiene la linea e contrasta; non si sovrappone.",
    },
    "wing-back": {
      label: "Esterno a tutta fascia",
      blurb: "Corre su tutta la fascia, crossa e tira; lascia spazio alle spalle.",
    },
    "inverted-full-back": {
      label: "Terzino invertito",
      blurb: "Si accentra a centrocampo per costruire; abbandona la fascia.",
    },
    anchor: {
      label: "Frangiflutti",
      blurb: "Sta davanti alla difesa; la protegge e semplifica il gioco.",
    },
    "ball-winner": {
      label: "Recuperapalloni",
      blurb: "Dà la caccia al pallone a centrocampo e per questo commette falli.",
    },
    "deep-playmaker": {
      label: "Regista arretrato",
      blurb: "Detta i tempi dal basso; protegge meno la difesa.",
    },
    "box-to-box": {
      label: "Box-to-box",
      blurb: "Copre tutto il campo e arriva a rimorchio in area.",
    },
    playmaker: {
      label: "Regista",
      blurb: "Dà il ritmo e trova il passaggio decisivo; difende meno.",
    },
    destroyer: {
      label: "Mediano di rottura",
      blurb: "Spezza il gioco e fa molti falli; porta poco in avanti.",
    },
    "advanced-playmaker": {
      label: "Trequartista",
      blurb: "Gioca tra le linee e crea; segna meno.",
    },
    "shadow-striker": {
      label: "Seconda punta",
      blurb: "Si inserisce alle spalle dell'attaccante e tira; crea meno.",
    },
    tracker: {
      label: "Incursore di pressing",
      blurb: "Pressa dall'alto e rincorre gli avversari; meno pericoloso.",
    },
    winger: {
      label: "Ala",
      blurb: "Allarga il gioco sulla linea laterale e mette i cross.",
    },
    "inside-forward": {
      label: "Ala a piede invertito",
      blurb: "Rientra per tirare; meno ampiezza e meno cross.",
    },
    "tracking-winger": {
      label: "Ala di sacrificio",
      blurb: "Rientra ad aiutare il terzino; meno spinta in avanti.",
    },
    "target-man": {
      label: "Boa",
      blurb: "Vince i duelli aerei e protegge palla; non è il finalizzatore più lucido.",
    },
    poacher: {
      label: "Rapinatore d'area",
      blurb: "Aspetta le occasioni in area; non fa altro.",
    },
    "complete-forward": {
      label: "Attaccante completo",
      blurb: "Segna, dialoga coi compagni e crea.",
    },
    "pressing-forward": {
      label: "Attaccante di pressing",
      blurb: "Aggredisce i difensori dall'alto; meno pericoloso in area.",
    },
  },
  arch: {
    "shot-stopper": {
      label: "Portiere di riflessi",
      blurb: "Comanda la linea e para anche l'imparabile.",
    },
    "sweeper-keeper": {
      label: "Portiere libero",
      blurb:
        "Spazza alle spalle della difesa e fa partire l'azione; un po' meno sicuro sulla linea.",
    },
    stopper: {
      label: "Stopper",
      blurb: "Vince i duelli e libera di testa, ma dà poco alla costruzione.",
    },
    "ball-playing-defender": {
      label: "Difensore con piedi buoni",
      blurb: "Fa partire l'azione da dietro; un filo meno incisivo nel contrasto.",
    },
    "defensive-full-back": {
      label: "Terzino difensivo",
      blurb: "Resta indietro, contrasta e copre la fascia.",
    },
    "attacking-full-back": {
      label: "Terzino di spinta",
      blurb: "Si sovrappone, crossa e arriva in area; lascia spazio alle spalle.",
    },
    "ball-winner": {
      label: "Recuperapalloni",
      blurb: "Spezza il gioco davanti alla difesa e per questo commette falli.",
    },
    "deep-playmaker": {
      label: "Regista arretrato",
      blurb: "Detta il gioco dal basso con lanci lunghi.",
    },
    "box-to-box": {
      label: "Box-to-box",
      blurb: "Copre ogni centimetro di campo e arriva a rimorchio in area.",
    },
    playmaker: {
      label: "Regista",
      blurb: "Dà il ritmo e trova il passaggio decisivo.",
    },
    creator: {
      label: "Rifinitore",
      blurb: "Gioca tra le linee; più assist che gol.",
    },
    "shadow-striker": {
      label: "Seconda punta",
      blurb: "Si inserisce alle spalle dell'attaccante e segna.",
    },
    winger: {
      label: "Ala",
      blurb: "Allarga il gioco sulla linea laterale e mette i cross.",
    },
    "inside-forward": {
      label: "Ala a piede invertito",
      blurb: "Rientra dalla fascia per tirare.",
    },
    "target-man": {
      label: "Boa",
      blurb: "Vince i duelli aerei e protegge palla; non è il finalizzatore più lucido.",
    },
    poacher: {
      label: "Rapinatore d'area",
      blurb: "Vive in area e finalizza ciò che gli arriva; poco altro.",
    },
    "complete-forward": {
      label: "Attaccante completo",
      blurb: "Segna, dialoga coi compagni e crea.",
    },
  },
  rule: {
    "behind-high-line": "Palloni alle spalle di una linea alta",
    "counter-into-deep-block": "Nessuno spazio per ripartire contro un blocco basso",
    "width-into-back-five": "L'ampiezza è sprecata contro una difesa a cinque",
    "width-into-open-flanks": "Ampiezza contro una linea a quattro con le fasce scoperte",
    "patience-into-press": "Costruzione paziente contro un pressing alto",
    "direct-past-press": "Gioco diretto per superare un pressing alto",
    "lone-striker-into-back-three": "Una sola punta contro tre centrali",
    "two-strikers-into-flat-four": "Due punte contro una linea a quattro",
    "midfield-numbers": "Più giocatori in mezzo al campo",
    "midfield-outnumbered": "In inferiorità numerica in mezzo al campo",
    "press-patient-side": "Un pressing alto contro una squadra paziente",
    "narrow-into-wide": "Una squadra stretta intasa il centro contro una larga",
  },
  badge: {
    "big-game": {
      label: "Uomo da grandi partite",
      text: "Rende oltre il suo livello nelle finali e negli spareggi, e non trema dal dischetto.",
    },
    reliable: {
      label: "Affidabile",
      text: "Rende al proprio livello quasi ogni partita.",
    },
    erratic: {
      label: "Discontinuo",
      text: "I voti oscillano: brillante un giorno, scarso il successivo.",
    },
    "injury-prone": {
      label: "Fragile",
      text: "Più esposto a infortuni durante una partita.",
    },
    "tires-early": {
      label: "Cala presto",
      text: "Perde energie prima di un giocatore più giovane.",
    },
  },
  bond: {
    clubmates: "Compagni di club",
    friends: "Amici",
    feud: "Rivalità",
  },
  spirit: {
    tight: "Molto unito",
    good: "Buono",
    neutral: "Neutro",
    uneasy: "Teso",
    divided: "Diviso",
  },
  scout: {
    trait: {
      attack: "Offensiva",
      cautious: "Prudente",
      highLine: "Linea alta",
      deepLine: "Linea bassa",
      wide: "Gioca largo",
      narrow: "Gioca stretto",
      counter: "Di contropiede",
      highPress: "Pressing alto",
      dropsOff: "Si abbassa",
      direct: "Diretta",
      patient: "Paziente",
      balanced: "Equilibrata",
    },
    reason: {
      star: "Il loro giocatore migliore",
      threat: "La loro principale minaccia in zona gol",
      creator: "Crea la maggior parte delle loro occasioni",
      weak: "L'anello debole",
    },
    level: {
      "0": "Bassa",
      "1": "Standard",
      "2": "Alta",
    },
    width: {
      "0": "Stretta",
      "1": "Standard",
      "2": "Ampia",
    },
    change: {
      line: "Linea difensiva: {from} → {to}",
      width: "Ampiezza: {from} → {to}",
      counter: "Contropiede: {from} → {to}",
    },
    on: "sì",
    off: "no",
  },
}

export default engine
