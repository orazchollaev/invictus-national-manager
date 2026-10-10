import type en from "../en/engine"

const engine: typeof en = {
  obj: {
    qualify: "Se qualifier : {comp}",
    unbeaten: "{text} sans défaite",
    promotion: "Monter de la Ligue {letter}",
    relegation: "Éviter la relégation de la Ligue {letter}",
    win: "Être champion : {comp}",
    reach: {
      knockout: "Atteindre la phase à élimination directe : {comp}",
      "quarter-finals": "Atteindre les quarts de finale : {comp}",
      "semi-finals": "Atteindre les demi-finales : {comp}",
      final: "Atteindre la finale : {comp}",
    },
    debuts: "Offrir leur première sélection à {count} joueurs de 21 ans ou moins en {year}",
    raiseNote:
      "Récompenses ×{reward} ; échouer coûte {cost} de confiance, et l'objectif initial redevient la référence",
    lowerNote: "Coûte {cost} de confiance maintenant ; récompenses réduites de moitié",
    lowerNeeds: "La direction n'écoutera qu'avec une confiance de {n} % ou plus",
  },
  news: {
    raise: {
      title: "Vous placez la barre plus haut",
      body: "Vous avez promis plus à la fédération : « {text} ». Tenez parole, elle ne l'oubliera pas.",
    },
    lower: {
      title: "Attentes revues à la baisse",
      body: "La fédération a accepté à contrecœur un objectif moins ambitieux : « {text} ».",
    },
    broken: {
      title: "Promesse non tenue",
      body: "Vous aviez promis de « {promised} » et vous avez échoué. La fédération attend toujours de vous : « {target} ».",
    },
    met: {
      title: "Objectif atteint",
      body: "La fédération est ravie : « {text} » — c'est fait. Le soutien supplémentaire profitera aussi aux centres de formation.",
    },
    missed: {
      title: "Objectif manqué",
      body: "La fédération est mécontente : nous avons échoué à « {text} ».",
    },
    friendly: "un match amical",
    derbyWin: {
      title: "Le derby appartient à {us}",
      body: "Victoire {score} contre le vieil ennemi, {them}, en {comp}. Les rues sont en fête.",
    },
    derbyLoss: {
      title: "Défaite dans le derby contre {them}",
      body: "Battus {score} par {them} en {comp}. Les supporters n'oublieront pas celle-ci de sitôt.",
    },
    derbyDraw: {
      title: "Match nul dans le derby",
      body: "{us} et {them} ont fait match nul {score} en {comp}. Aucun des deux camps n'aura le droit de se vanter.",
    },
    fans: {
      angry: {
        title: "Les supporters se retournent contre le sélectionneur",
        body: "Les supporters de {nation} ont clairement exprimé leur colère. La direction est à l'écoute.",
      },
      adore: {
        title: "Les supporters sont derrière vous",
        body: "Les supporters de {nation} chantent le nom du sélectionneur. Le stade va trembler.",
      },
    },
    invitational: {
      title: "{host} organise : {comp}",
      body: "{host} accueillera {comp}, avec {teams} au départ. Le tournoi commence le {date}.",
    },
    invite: {
      title: "Invitation de {host}",
      body: "{host} nous invite à un tournoi à {n} équipes sur la fenêtre débutant le {date}. Ils attendent une réponse.",
    },
    inviteLapsed: {
      title: "Invitation expirée",
      body: "Nous n'avons pas répondu à temps à l'invitation de {host} ; le tournoi aura lieu sans nous.",
    },
    inviteOff: {
      title: "Tournoi annulé",
      body: "Le tournoi de {host} n'a pas pu avoir lieu : toutes les équipes ne sont plus libres.",
    },
    riot: {
      title: "{us} déroule contre {them}",
      body: "Victoire {score} contre {them} en {comp}. Les supporters s'en souviendront.",
    },
    shock: {
      title: "Victoire surprise contre {them}",
      body: "Peu nous donnaient une chance, mais nous avons battu {them} {score} en {comp}.",
    },
    humiliation: {
      title: "Humiliation contre {them}",
      body: "Défaite {score} contre {them} en {comp}. On s'interroge sur le sélectionneur.",
    },
    embarrassing: {
      title: "Défaite embarrassante contre {them}",
      body: "Nous étions censés gagner, mais nous avons perdu {score} contre {them} en {comp}.",
    },
    cap: {
      title: "{name} décroche sa {caps}e sélection",
      body: "{name} a désormais joué {caps} fois pour {nation}.",
    },
    goals: {
      title: "{name} atteint {goals} buts en sélection",
      body: "{name} a désormais marqué {goals} buts pour {nation}.",
    },
    debut: {
      title: "Première sélection pour {name}",
      body: "Débutent en sélection contre {opp} : {names}.",
    },
    debuts: {
      title: "{n} débuts",
    },
    milestone: "Étape franchie",
    ultimatum: {
      title: "Dernier avertissement",
      body: "La fédération a perdu patience. Remontez sa confiance à {lifted} % en {matches} matchs officiels, ou vous serez remplacé.",
    },
    eases: {
      title: "La pression retombe",
      body: "Les résultats se sont redressés. La fédération a retiré son dernier avertissement.",
    },
    sacked: {
      title: "Limogé",
      body: "La fédération de {nation} vous a relevé de vos fonctions.",
    },
    resigned: {
      title: "Vous avez démissionné",
      body: "Vous avez quitté votre poste de sélectionneur de {nation}.",
    },
    notRenewed: {
      title: "Contrat non renouvelé",
      body: "La fédération de {nation} a décidé de ne pas renouveler votre contrat.",
    },
    renewed: {
      title: "Contrat renouvelé",
      body: "La fédération de {nation} a renouvelé votre contrat jusqu'au {date}.",
    },
    extended: {
      title: "Une année de plus",
      body: "La fédération de {nation} a prolongé votre contrat d'une seule année. Elle veut voir des progrès.",
    },
    coachChange: {
      title: "{nation} change de sélectionneur",
      body: "{nation} a nommé {coach} nouveau sélectionneur.",
    },
    coachSacked: {
      title: "{nation} limoge {coach}",
      body: "{nation} se sépare de son sélectionneur {coach} après une mauvaise série. La recherche d'un successeur a commencé.",
    },
    coachRetired: {
      title: "{coach} prend sa retraite",
      body: "{coach} a quitté son poste de sélectionneur de {nation} et met fin à sa carrière d'entraîneur.",
    },
    offer: {
      title: "Offre d'emploi : {nation}",
      body: "La fédération de {nation} aimerait vous avoir comme nouveau sélectionneur. L'offre est valable jusqu'au {date}.",
    },
    newJob: {
      title: "Nouveau poste : {nation}",
      body: "Vous êtes le nouveau sélectionneur de {nation}.",
    },
    tourney: {
      through: "{comp} : qualifiés",
      throughTo: "Nous sommes qualifiés pour : {round}.",
      throughBare: "Nous sommes qualifiés.",
      out: "{comp} : éliminés",
      groupOut: "Nous avons terminé {group} sans nous qualifier.",
      knockedOut: "Nous avons été éliminés : {round}.",
      runnersUp: "{comp} : finalistes",
      lostFinal: "Nous avons perdu la finale.",
    },
    qualified: {
      title: "Qualifiés : {finals}",
      body: "Nous avons décroché une place : {finals}.",
    },
    playoff: {
      title: "En barrage",
      body: "Nous avons atteint le barrage intercontinental : {finals}.",
    },
    missedOut: {
      title: "Non qualifiés",
      body: "Nous avons manqué : {finals}.",
    },
    finalsGeneric: "la phase finale",
    injury: {
      title: "{name} blessé",
      body: "{name} s'est fait une blessure ({injury}) en club et sera absent jusqu'au {date}.",
    },
    newClub: "un nouveau club",
    bigMove: {
      title: "{name} décroche un gros transfert",
      body: "{name} rejoint {club} grâce à sa percée en sélection.",
    },
    move: {
      title: "{name} change d'air",
      body: "{name} rejoint {club}.",
    },
    prospects: {
      title: "Vos espoirs cette saison",
      body: "L'évolution des jeunes que vous suivez : {list}.",
    },
    season: {
      title: "Début de la saison {from}–{to}",
      body: "Les joueurs ont progressé durant la saison écoulée et le mercato estival est clos.",
    },
    retired: {
      entry: "{name} ({pos}, {age} ans)",
      entryCaps: "{name} ({pos}, {age} ans, {caps} sél.)",
    },
    retire: {
      title: "{name} quitte le football international",
      body: "{name} ({age} ans, {caps} sél.) a annoncé sa retraite internationale.",
    },
    wonderkid: {
      title: "Un crack émerge : {name}",
      body: "Les recruteurs s'enthousiasment pour {name}, {pos} de {age} ans à {club}.",
    },
    newgen: {
      entry: "{name} ({pos}, {age} ans, {club})",
    },
    retiredMany: {
      title: "{n} joueurs prennent leur retraite",
      body: "Ces joueurs ont raccroché les crampons : {list}.",
    },
    newgens: {
      title: "{n} jeunes arrivent",
      body: "La nouvelle génération éligible pour nous : {list}.",
    },
    stadium: {
      build: {
        title: "Début des travaux : {stadium}",
        body: "La fédération construit un stade de {seats} places à {city}, dont l'ouverture est prévue le {date}.",
      },
      expand: {
        title: "{stadium} va être agrandi",
        body: "Le {stadium} de {city} aura une capacité de {seats} places une fois les travaux terminés, le {date}.",
      },
      opened: {
        build: "{nation} inaugure le {stadium}",
        expand: "{stadium} agrandi",
        body: "Le {stadium} de {city} peut désormais accueillir {seats} spectateurs{ready}.",
      },
      readyFor: ", prêt pour : {comp}",
    },
    champions: {
      title: "{winner} remporte : {comp}",
      body: "{winner} est sacré champion{beat}.",
      beat: ", en battant {runnerUp} en finale",
    },
    draw: {
      title: "{comp} : {stage}",
      group: "Le tirage est fait. Nous affronterons {others}.",
      tie: "Nous avons tiré {opp}.",
    },
    and: "{a} et {b}",
    host: {
      title: "{list} organise : {comp}",
      one: "{list} accueillera {comp}, à partir du {date}.",
      many: "{list} co-organiseront {comp}, à partir du {date}.",
    },
    placeholder: {
      title: "{team} prend sa place",
      body: "{team} remporte {label} et occupe cette place dans le tirage.",
    },
  },
  ms: {
    trophy: "Votre premier trophée : {comp}.",
    world: "Champions du monde ! {nation} remporte : {comp}.",
    continental: "Champions de votre continent : {comp}.",
    qualification: "Vous avez mené {nation} à une grande compétition.",
    worldCup: "Vous avez mené {nation} à une Coupe du monde.",
    firstWin: "Votre première victoire en tant que sélectionneur.",
    matches: "{n} matchs en tant que sélectionneur.",
    debuts: "{n} joueurs ont connu leur première sélection sous vos ordres.",
    youthDebuts: "Cinq joueurs de 21 ans ou moins lancés au niveau international.",
    unbeaten: "Dix matchs officiels sans défaite.",
    top10: "{nation} est dans le top dix mondial sous vos ordres.",
    no1: "{nation} est la meilleure équipe du monde.",
  },
  review: {
    reached: {
      champions: "Champion",
      knockedOut: "Éliminé",
      qualified: "Qualifié",
      notQualified: "Non qualifié",
      leagueStage: "Phase de ligue",
      promoted: "Promu en Ligue {letter}",
      relegated: "Relégué en Ligue {letter}",
      stayed: "Maintenu en Ligue {letter}",
      runnersUp: "Finaliste",
      groups: "Phase de groupes",
    },
    msg: {
      delightedChampion:
        "La fédération est ravie. Remporter {comp} dépasse tout ce que l'on osait espérer, et votre cote n'a jamais été aussi haute.",
      delighted:
        "La fédération est ravie de son parcours en {comp}. Vous lui avez donné plus que ce qu'elle demandait.",
      satisfied:
        "La fédération est satisfaite de son parcours en {comp}. Le travail a été fait ; elle attend maintenant que vous construisiez dessus.",
      disappointed:
        "La fédération est déçue de son parcours en {comp}. Elle attendait mieux, et sa patience n'est pas infinie.",
      ultimatum:
        "Après {comp}, la fédération a perdu patience. Les résultats doivent s'améliorer immédiatement, sinon elle trouvera quelqu'un qui saura les obtenir.",
      sacked:
        "{comp} a été la goutte d'eau. La fédération a décidé de vous relever de vos fonctions.",
      contractEnd:
        "{comp} marque la fin de votre contrat, et la fédération a décidé de ne pas le renouveler.",
    },
  },
  fx: {
    friendly: "Match amical international",
    window: "Fenêtre internationale",
    matchday: "{stage} · Journée {n}",
    groupMatchday: "{stage} · {group} · Journée {n}",
    round: "{round}",
    stageRound: "{stage} · {round}",
    roundLeg: "{round} · Manche {leg}",
    stageRoundLeg: "{stage} · {round} · Manche {leg}",
  },
  lineup: {
    nobody: "Personne ne joue au poste de {pos}",
    notInSquad: "{name} ({pos}) n'est pas dans la liste",
    injured: "{name} ({pos}) est blessé ({label})",
    suspended: "{name} ({pos}) est suspendu",
  },
  placeholder: {
    uefa: "Barrages UEFA, voie {path}",
    path: "Barrages, voie {path}",
    tournament: "Tournoi de barrage",
    qualifier: "Qualifié {n}",
    winner: "Vainqueur {base}",
    tournamentWinner: "Vainqueur {n} du tournoi de barrage",
    shortIc: "IC {n}",
    shortPo: "BAR {path}",
  },
  injury: {
    "hamstring-strain": "Élongation aux ischio-jambiers",
    "ankle-sprain": "Entorse de la cheville",
    "calf-strain": "Élongation du mollet",
    "groin-strain": "Élongation à l'aine",
    "thigh-strain": "Élongation de la cuisse",
    "knee-injury": "Blessure au genou",
    "broken-foot": "Fracture du pied",
    "cruciate-ligament-rupture": "Rupture des ligaments croisés",
    knock: "Contusion",
  },
  stage: {
    group: "Groupe {name}",
    league: "Ligue",
    leagueN: "Ligue {x}",
    roundOf: "{n}es de finale",
    "round-of-16": "Huitièmes de finale",
    "round-of-32": "Seizièmes de finale",
    "quarter-finals": "Quarts de finale",
    "semi-finals": "Demi-finales",
    final: "Finale",
    finals: "Phase finale",
    "third-place": "Troisième place",
    "bronze-final": "Match pour la troisième place",
    "group-stage": "Phase de groupes",
    "knockout-stage": "Phase à élimination directe",
    "league-phase": "Phase de ligue",
    qualifying: "Qualifications",
    "preliminary-round": "Tour préliminaire",
    preliminaryN: "Tour préliminaire {n}",
    prelims: "Préliminaires",
    "first-round": "Premier tour",
    "second-round": "Deuxième tour",
    "third-round": "Troisième tour",
    "fourth-round": "Quatrième tour",
    "fifth-round": "Cinquième tour",
    "final-round": "Tour final",
    "play-offs": "Barrages",
    "play-in": "Play-In",
    "play-off-round": "Tour de barrage",
    "play-off-semi-finals": "Demi-finales de barrage",
    "play-off-finals": "Finales de barrage",
    "play-off-final": "Finale de barrage",
    "play-off-tournament": "Tournoi de barrage",
    "promotion-relegation-play-offs": "Barrages de promotion/relégation",
    "league-a-quarter-finals": "Quarts de finale de la Ligue A",
    "league-a-finals": "Phase finale de la Ligue A",
    "league-b-finals": "Phase finale de la Ligue B",
    "league-c-finals": "Phase finale de la Ligue C",
  },
  comp: {
    wc: {
      name: "Coupe du monde {year}",
      short: "Coupe du monde",
      plain: "Coupe du monde",
    },
    "wcq-uefa": {
      name: "Qualifications Coupe du monde {year} · UEFA",
      short: "Qualif. Europe",
      plain: "Qualifications Coupe du monde · UEFA",
    },
    "wcq-caf": {
      name: "Qualifications Coupe du monde {year} · CAF",
      short: "Qualif. Afrique",
      plain: "Qualifications Coupe du monde · CAF",
    },
    "wcq-afc": {
      name: "Qualifications Coupe du monde {year} · AFC",
      short: "Qualif. Asie",
      plain: "Qualifications Coupe du monde · AFC",
    },
    "wcq-concacaf": {
      name: "Qualifications Coupe du monde {year} · CONCACAF",
      short: "Qualif. CONCACAF",
      plain: "Qualifications Coupe du monde · CONCACAF",
    },
    "wcq-conmebol": {
      name: "Qualifications Coupe du monde {year} · CONMEBOL",
      short: "Qualif. Amérique du Sud",
      plain: "Qualifications Coupe du monde · CONMEBOL",
    },
    "wcq-ofc": {
      name: "Qualifications Coupe du monde {year} · OFC",
      short: "Qualif. Océanie",
      plain: "Qualifications Coupe du monde · OFC",
    },
    "wcq-ic": {
      name: "Tournoi de barrage Coupe du monde {year}",
      short: "Barrage",
      plain: "Tournoi de barrage Coupe du monde",
    },
    euro: {
      name: "Euro UEFA {year}",
      short: "Euro",
      plain: "Euro UEFA",
    },
    euroq: {
      name: "Qualifications Euro UEFA {year}",
      short: "Qualif. Euro",
      plain: "Qualifications Euro UEFA",
    },
    unl: {
      name: "Ligue des nations UEFA {year}–{year2}",
      short: "Ligue des nations",
      plain: "Ligue des nations UEFA",
    },
    finalissima: {
      name: "Finalissima {year}",
      short: "Finalissima",
      plain: "Finalissima",
    },
    afcon: {
      name: "Coupe d'Afrique des nations {year}",
      short: "CAN",
      plain: "Coupe d'Afrique des nations",
    },
    afconq: {
      name: "Qualifications Coupe d'Afrique des nations {year}",
      short: "Qualif. CAN",
      plain: "Qualifications Coupe d'Afrique des nations",
    },
    "asian-cup": {
      name: "Coupe d'Asie AFC {year}",
      short: "Coupe d'Asie",
      plain: "Coupe d'Asie AFC",
    },
    "asian-cupq": {
      name: "Qualifications Coupe d'Asie AFC {year}",
      short: "Qualif. Coupe d'Asie",
      plain: "Qualifications Coupe d'Asie AFC",
    },
    copa: {
      name: "Copa América {year}",
      short: "Copa América",
      plain: "Copa América",
    },
    "ofc-cup": {
      name: "Coupe des nations OFC {year}",
      short: "Coupe des nations OFC",
      plain: "Coupe des nations OFC",
    },
    cnl: {
      name: "Ligue des nations CONCACAF {year}–{year2}",
      short: "LN CONCACAF",
      plain: "Ligue des nations CONCACAF",
    },
    gcq: {
      name: "Préliminaires Gold Cup CONCACAF {year}",
      short: "Préliminaires Gold Cup",
      plain: "Préliminaires Gold Cup CONCACAF",
    },
    "gold-cup": {
      name: "Gold Cup CONCACAF {year}",
      short: "Gold Cup",
      plain: "Gold Cup CONCACAF",
    },
    "arab-cup": {
      name: "Coupe arabe {year}",
      short: "Coupe arabe",
      plain: "Coupe arabe",
    },
    "gulf-cup": {
      name: "Coupe du Golfe arabe {year}",
      short: "Coupe du Golfe",
      plain: "Coupe du Golfe arabe",
    },
    aff: {
      name: "Championnat de l'ASEAN {year}",
      short: "Championnat ASEAN",
      plain: "Championnat de l'ASEAN",
    },
    "asean-cup": {
      name: "Coupe de l'ASEAN {year}",
      short: "Coupe ASEAN",
      plain: "Coupe de l'ASEAN",
    },
    "asean-challenge": {
      name: "Challenge Cup de l'ASEAN {year}",
      short: "Challenge Cup ASEAN",
      plain: "Challenge Cup de l'ASEAN",
    },
    "inv-mar": {
      name: "Tournoi invitation de mars {year}",
      short: "Invitation de mars",
      plain: "Tournoi invitation de mars",
    },
    "inv-jun": {
      name: "Tournoi invitation de juin {year}",
      short: "Invitation de juin",
      plain: "Tournoi invitation de juin",
    },
    "inv-sep": {
      name: "Tournoi invitation d'automne {year}",
      short: "Invitation d'automne",
      plain: "Tournoi invitation d'automne",
    },
    "inv-nov": {
      name: "Tournoi invitation de novembre {year}",
      short: "Invitation de novembre",
      plain: "Tournoi invitation de novembre",
    },
    e1: {
      name: "Championnat E-1 de l'EAFF {year}",
      short: "E-1",
      plain: "Championnat E-1 de l'EAFF",
    },
    cafa: {
      name: "Coupe des nations CAFA {year}",
      short: "Coupe des nations CAFA",
      plain: "Coupe des nations CAFA",
    },
    waff: {
      name: "Championnat WAFF {year}",
      short: "Championnat WAFF",
      plain: "Championnat WAFF",
    },
    saff: {
      name: "Championnat SAFF {year}",
      short: "Championnat SAFF",
      plain: "Championnat SAFF",
    },
    cosafa: {
      name: "Coupe COSAFA {year}",
      short: "Coupe COSAFA",
      plain: "Coupe COSAFA",
    },
    cecafa: {
      name: "Coupe des seniors CECAFA {year}",
      short: "Coupe CECAFA",
      plain: "Coupe des seniors CECAFA",
    },
    wafu: {
      name: "Coupe de zone WAFU {year}",
      short: "Coupe WAFU",
      plain: "Coupe de zone WAFU",
    },
    baltic: {
      name: "Coupe baltique {year}",
      short: "Coupe baltique",
      plain: "Coupe baltique",
    },
  },
  role: {
    stopper: {
      label: "Stoppeur",
      blurb: "Sort pour récupérer le ballon et domine dans les airs ; apporte moins balle au pied.",
    },
    "ball-playing": {
      label: "Défenseur relanceur",
      blurb: "Monte au milieu avec le ballon ; moins dur dans le tacle.",
    },
    cover: {
      label: "Défenseur de couverture",
      blurb: "Reste en retrait et assure ; commet peu de fautes, lance rarement une action.",
    },
    "defensive-full-back": {
      label: "Latéral défensif",
      blurb: "Tient sa ligne et tacle ; ne monte pas.",
    },
    "wing-back": {
      label: "Piston",
      blurb: "Parcourt tout le couloir, centre et tire ; laisse de l'espace dans son dos.",
    },
    "inverted-full-back": {
      label: "Latéral inversé",
      blurb: "Rentre au milieu pour construire le jeu ; abandonne le couloir.",
    },
    anchor: {
      label: "Sentinelle",
      blurb: "Se place devant la défense ; la protège et joue simple.",
    },
    "ball-winner": {
      label: "Récupérateur",
      blurb: "Chasse le ballon dans tout le milieu et commet des fautes pour cela.",
    },
    "deep-playmaker": {
      label: "Meneur reculé",
      blurb: "Dicte le jeu depuis l'arrière ; offre moins de couverture à la défense.",
    },
    "box-to-box": {
      label: "Box-to-box",
      blurb: "Couvre tout le terrain et arrive en retard dans la surface.",
    },
    playmaker: {
      label: "Meneur de jeu",
      blurb: "Impose le tempo et trouve la passe décisive ; défend moins.",
    },
    destroyer: {
      label: "Destructeur",
      blurb: "Casse le jeu adverse et commet souvent des fautes ; apporte peu vers l'avant.",
    },
    "advanced-playmaker": {
      label: "Meneur avancé",
      blurb: "Joue entre les lignes et crée ; marque moins lui-même.",
    },
    "shadow-striker": {
      label: "Attaquant de soutien",
      blurb: "Se projette derrière l'avant-centre et tire ; crée moins.",
    },
    tracker: {
      label: "Milieu de repli",
      blurb: "Presse haut et repli défensif ; moins dangereux.",
    },
    winger: {
      label: "Ailier",
      blurb: "Colle à la ligne de touche et enchaîne les centres.",
    },
    "inside-forward": {
      label: "Ailier rentrant",
      blurb: "Repique dans l'axe pour tirer ; moins de largeur et moins de centres.",
    },
    "tracking-winger": {
      label: "Ailier de repli",
      blurb: "Revient aider le latéral ; moins présent vers l'avant.",
    },
    "target-man": {
      label: "Point d'appui",
      blurb: "Gagne les duels aériens et garde le ballon ; finisseur peu tranchant.",
    },
    poacher: {
      label: "Renard des surfaces",
      blurb: "Attend les occasions dans la surface ; ne fait rien d'autre.",
    },
    "complete-forward": {
      label: "Attaquant complet",
      blurb: "Marque, combine et crée.",
    },
    "pressing-forward": {
      label: "Attaquant pressant",
      blurb: "Harcèle les défenseurs dès l'avant ; moins dangereux dans la surface.",
    },
  },
  arch: {
    "shot-stopper": {
      label: "Gardien de ligne",
      blurb: "Domine sa ligne et sort des arrêts impossibles.",
    },
    "sweeper-keeper": {
      label: "Gardien libéro",
      blurb: "Balaie derrière la défense et lance les attaques ; un peu moins sûr sur sa ligne.",
    },
    stopper: {
      label: "Stoppeur",
      blurb: "Gagne ses duels et dégage de la tête, mais apporte peu à la construction.",
    },
    "ball-playing-defender": {
      label: "Défenseur relanceur",
      blurb: "Lance les actions depuis l'arrière ; un peu moins dur dans le tacle.",
    },
    "defensive-full-back": {
      label: "Latéral défensif",
      blurb: "Reste en retrait, tacle et couvre le couloir.",
    },
    "attacking-full-back": {
      label: "Latéral offensif",
      blurb: "Déborde, centre et pénètre dans la surface ; laisse de l'espace dans son dos.",
    },
    "ball-winner": {
      label: "Récupérateur",
      blurb: "Casse le jeu devant la défense et commet des fautes pour cela.",
    },
    "deep-playmaker": {
      label: "Meneur reculé",
      blurb: "Dicte le jeu depuis l'arrière avec de longues passes.",
    },
    "box-to-box": {
      label: "Box-to-box",
      blurb: "Couvre chaque brin d'herbe et arrive en retard dans la surface.",
    },
    playmaker: {
      label: "Meneur de jeu",
      blurb: "Impose le tempo et trouve la passe décisive.",
    },
    creator: {
      label: "Créateur",
      blurb: "Joue entre les lignes ; plus de passes décisives que de buts.",
    },
    "shadow-striker": {
      label: "Attaquant de soutien",
      blurb: "Se projette derrière l'avant-centre et marque lui-même.",
    },
    winger: {
      label: "Ailier",
      blurb: "Colle à la ligne de touche et enchaîne les centres.",
    },
    "inside-forward": {
      label: "Ailier rentrant",
      blurb: "Repique dans l'axe depuis l'aile pour tirer.",
    },
    "target-man": {
      label: "Point d'appui",
      blurb: "Gagne les duels aériens et garde le ballon ; finisseur peu tranchant.",
    },
    poacher: {
      label: "Renard des surfaces",
      blurb: "Vit dans la surface et conclut ce qui lui arrive ; peu de choses en plus.",
    },
    "complete-forward": {
      label: "Attaquant complet",
      blurb: "Marque, combine et crée.",
    },
  },
  rule: {
    "behind-high-line": "Ballons dans le dos d'une ligne haute",
    "counter-into-deep-block": "Rien à exploiter en contre face à un bloc bas",
    "width-into-back-five": "La largeur est inutile face à une défense à cinq",
    "width-into-open-flanks": "Largeur contre une défense à quatre aux couloirs ouverts",
    "patience-into-press": "Construction patiente face à un pressing haut",
    "direct-past-press": "Jeu direct pour contourner un pressing haut",
    "lone-striker-into-back-three": "Un seul attaquant face à trois défenseurs centraux",
    "two-strikers-into-flat-four": "Deux attaquants face à une défense à quatre",
    "midfield-numbers": "Plus de joueurs dans l'axe",
    "midfield-outnumbered": "En infériorité numérique dans l'axe",
    "press-patient-side": "Un pressing haut contre une équipe patiente",
    "narrow-into-wide": "Une équipe resserrée verrouille l'axe face à une équipe large",
  },
  badge: {
    "big-game": {
      label: "Joueur des grands matchs",
      text: "Se surpasse en finales et matchs décisifs, et garde son sang-froid sur penalty.",
    },
    reliable: {
      label: "Fiable",
      text: "Joue à son niveau presque à chaque match.",
    },
    erratic: {
      label: "Irrégulier",
      text: "Ses notes fluctuent ; brillant un jour, faible le lendemain.",
    },
    "injury-prone": {
      label: "Fragile",
      text: "Plus susceptible de se blesser en match.",
    },
    "tires-early": {
      label: "S'essouffle tôt",
      text: "Est à court de souffle plus tôt qu'un joueur plus jeune.",
    },
  },
  bond: {
    clubmates: "Coéquipiers de club",
    friends: "Amis",
    feud: "Brouille",
  },
  spirit: {
    tight: "Très soudé",
    good: "Bon",
    neutral: "Neutre",
    uneasy: "Tendu",
    divided: "Divisé",
  },
  scout: {
    trait: {
      attack: "Offensif",
      cautious: "Prudent",
      highLine: "Ligne haute",
      deepLine: "Ligne basse",
      wide: "Joue large",
      narrow: "Joue resserré",
      counter: "Contre-attaque",
      highPress: "Pressing haut",
      dropsOff: "Se replie",
      direct: "Direct",
      patient: "Patient",
      balanced: "Équilibré",
    },
    reason: {
      star: "Leur meilleur joueur",
      threat: "Leur principale menace offensive",
      creator: "Crée l'essentiel de leurs occasions",
      weak: "Le maillon faible",
    },
    level: {
      "0": "Basse",
      "1": "Standard",
      "2": "Haute",
    },
    width: {
      "0": "Étroit",
      "1": "Standard",
      "2": "Large",
    },
    change: {
      line: "Ligne défensive : {from} → {to}",
      width: "Largeur : {from} → {to}",
      counter: "Contre-attaque : {from} → {to}",
    },
    on: "activée",
    off: "désactivée",
  },
}

export default engine
