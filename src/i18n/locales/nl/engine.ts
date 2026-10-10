import type en from "../en/engine"

const engine: typeof en = {
  obj: {
    qualify: "Plaatsen voor het toernooi: {comp}",
    unbeaten: "{text} ongeslagen",
    promotion: "Promoveren uit Divisie {letter}",
    relegation: "Degradatie uit Divisie {letter} voorkomen",
    win: "Winnen: {comp}",
    reach: {
      knockout: "De knock-outfase halen: {comp}",
      "quarter-finals": "De kwartfinales halen: {comp}",
      "semi-finals": "De halve finales halen: {comp}",
      final: "De finale halen: {comp}",
    },
    debuts: "{count} spelers van 21 jaar of jonger in {year} hun interlanddebuut laten maken",
    raiseNote:
      "Beloningen ×{reward}; tekortschieten kost {cost} vertrouwen, daarna geldt weer het oorspronkelijke doel",
    lowerNote: "Kost nu {cost} vertrouwen; beloningen gehalveerd",
    lowerNeeds: "De bond luistert pas bij een vertrouwen van {n}% of meer",
  },
  news: {
    raise: {
      title: "Je legt de lat hoger",
      body: 'Je hebt de bond meer beloofd: "{text}". Lever het, dan vergeten ze het niet.',
    },
    lower: {
      title: "Verwachtingen bijgesteld",
      body: 'De bond is met tegenzin akkoord gegaan met een lager doel: "{text}".',
    },
    broken: {
      title: "Belofte gebroken",
      body: 'Je beloofde te "{promised}" en schoot tekort. De bond verwacht nog steeds dat je "{target}".',
    },
    met: {
      title: "Doel bereikt",
      body: 'De bond is dolblij: "{text}" — gelukt. De extra steun komt ook de jeugdopleidingen ten goede.',
    },
    missed: {
      title: "Doel gemist",
      body: 'De bond is ontevreden: het is ons niet gelukt om te "{text}".',
    },
    friendly: "een oefenwedstrijd",
    derbyWin: {
      title: "Derbydag is voor {us}",
      body: "Een {score}-overwinning op aartsrivaal {them} in {comp}. De straten vieren feest.",
    },
    derbyLoss: {
      title: "Derbynederlaag tegen {them}",
      body: "{score} verloren van {them} in {comp}. De fans zullen deze niet snel vergeten.",
    },
    derbyDraw: {
      title: "Gelijkspel in de derby",
      body: "{us} en {them} speelden {score} gelijk in {comp}. Geen van beide teams krijgt het pochrecht.",
    },
    fans: {
      angry: {
        title: "De fans keren zich tegen de bondscoach",
        body: "Supporters van {nation} hebben hun woede duidelijk gemaakt. De bond luistert mee.",
      },
      adore: {
        title: "De fans staan achter je",
        body: "De supporters van {nation} zingen de naam van de bondscoach. Het stadion zal beven.",
      },
    },
    invitational: {
      title: "{host} organiseert de {comp}",
      body: "{host} is gastheer van de {comp}, met {teams} als deelnemers. Het begint op {date}.",
    },
    invite: {
      title: "Uitnodiging van {host}",
      body: "{host} nodigt ons uit voor een toernooi met {n} teams in de periode die begint op {date}. Ze willen een antwoord.",
    },
    inviteLapsed: {
      title: "Uitnodiging verlopen",
      body: "We hebben de uitnodiging van {host} niet op tijd beantwoord; het toernooi gaat zonder ons door.",
    },
    inviteOff: {
      title: "Toernooi afgelast",
      body: "Het toernooi van {host} kon niet doorgaan: niet elk team is nog beschikbaar.",
    },
    riot: {
      title: "{us} maken gehakt van {them}",
      body: "Een {score}-overwinning op {them} in {comp}. De fans zullen deze onthouden.",
    },
    shock: {
      title: "Verrassende overwinning op {them}",
      body: "Weinigen gaven ons een kans, maar we versloegen {them} met {score} in {comp}.",
    },
    humiliation: {
      title: "Vernedering tegen {them}",
      body: "Een {score}-nederlaag tegen {them} in {comp}. Er worden vragen gesteld over de bondscoach.",
    },
    embarrassing: {
      title: "Gênante nederlaag tegen {them}",
      body: "We waren favoriet, maar verloren met {score} van {them} in {comp}.",
    },
    cap: {
      title: "{name} speelt zijn interland nummer {caps}",
      body: "{name} heeft nu {caps} keer voor {nation} gespeeld.",
    },
    goals: {
      title: "{name} bereikt {goals} interlanddoelpunten",
      body: "{name} heeft nu {goals} doelpunten gemaakt voor {nation}.",
    },
    debut: {
      title: "Eerste interland voor {name}",
      body: "Interlanddebuut tegen {opp}: {names}.",
    },
    debuts: {
      title: "{n} debuten",
    },
    milestone: "Mijlpaal bereikt",
    ultimatum: {
      title: "Laatste waarschuwing",
      body: "De bond heeft zijn geduld verloren. Breng het vertrouwen binnen {matches} officiële wedstrijden naar {lifted}%, anders word je vervangen.",
    },
    eases: {
      title: "De druk neemt af",
      body: "De resultaten zijn gekeerd. De bond heeft zijn laatste waarschuwing ingetrokken.",
    },
    sacked: {
      title: "Ontslagen",
      body: "De bond van {nation} heeft je van je taken ontheven.",
    },
    resigned: {
      title: "Je bent opgestapt",
      body: "Je bent opgestapt als bondscoach van {nation}.",
    },
    notRenewed: {
      title: "Contract niet verlengd",
      body: "De bond van {nation} heeft besloten je contract niet te verlengen.",
    },
    renewed: {
      title: "Contract verlengd",
      body: "De bond van {nation} heeft je contract verlengd tot {date}.",
    },
    extended: {
      title: "Nog één jaar",
      body: "De bond van {nation} heeft je contract met slechts een jaar verlengd. Ze willen vooruitgang zien.",
    },
    coachChange: {
      title: "{nation} wisselt van trainer",
      body: "{nation} heeft {coach} aangesteld als nieuwe bondscoach.",
    },
    coachSacked: {
      title: "{nation} ontslaat {coach}",
      body: "{nation} en bondscoach {coach} gaan na een slechte reeks uit elkaar. De zoektocht naar een opvolger is begonnen.",
    },
    coachRetired: {
      title: "{coach} stopt",
      body: "{coach} is opgestapt als bondscoach van {nation} en stopt als trainer.",
    },
    offer: {
      title: "Aanbieding: {nation}",
      body: "De bond van {nation} wil jou als nieuwe bondscoach. De aanbieding staat open tot {date}.",
    },
    newJob: {
      title: "Nieuwe baan: {nation}",
      body: "Je bent de nieuwe bondscoach van {nation}.",
    },
    tourney: {
      through: "{comp}: door",
      throughTo: "We staan in de {round}.",
      throughBare: "We zijn door.",
      out: "{comp}: uitgeschakeld",
      groupOut: "We eindigden in {group} zonder door te gaan.",
      knockedOut: "We zijn uitgeschakeld in de {round}.",
      runnersUp: "{comp}: tweede",
      lostFinal: "We verloren de finale.",
    },
    qualified: {
      title: "Geplaatst voor {finals}",
      body: "We hebben een plek bij {finals} veroverd.",
    },
    playoff: {
      title: "Naar de play-off",
      body: "We hebben de intercontinentale play-off voor {finals} bereikt.",
    },
    missedOut: {
      title: "Niet geplaatst",
      body: "We hebben {finals} gemist.",
    },
    finalsGeneric: "de eindronde",
    injury: {
      title: "{name} geblesseerd",
      body: "{name} heeft bij zijn club een {injury} opgelopen en is uitgeschakeld tot {date}.",
    },
    newClub: "een nieuwe club",
    bigMove: {
      title: "{name} verdient een grote stap",
      body: "{name} sluit zich aan bij {club} na zijn doorbraak bij het nationale team.",
    },
    move: {
      title: "{name} maakt een overstap",
      body: "{name} sluit zich aan bij {club}.",
    },
    prospects: {
      title: "Jouw talenten dit seizoen",
      body: "Zo ontwikkelden de jonge spelers die je volgt zich: {list}.",
    },
    season: {
      title: "Seizoen {from}–{to} begint",
      body: "Spelers hebben zich het afgelopen seizoen ontwikkeld en de zomerse transferperiode is gesloten.",
    },
    retired: {
      entry: "{name} ({pos}, {age})",
      entryCaps: "{name} ({pos}, {age}, {caps} interlands)",
    },
    retire: {
      title: "{name} stopt als international",
      body: "{name} ({age}, {caps} interlands) heeft zijn afscheid van het interlandvoetbal aangekondigd.",
    },
    wonderkid: {
      title: "Wonderkind opgedoken: {name}",
      body: "Scouts zijn laaiend enthousiast over {name}, een {age}-jarige {pos} bij {club}.",
    },
    newgen: {
      entry: "{name} ({pos}, {age}, {club})",
    },
    retiredMany: {
      title: "{n} spelers stoppen",
      body: "Deze spelers hebben hun voetbalschoenen aan de wilgen gehangen: {list}.",
    },
    newgens: {
      title: "{n} jonge spelers komen door",
      body: "De nieuwe generatie die voor ons uit mag komen: {list}.",
    },
    stadium: {
      build: {
        title: "Bouw van {stadium} begint",
        body: "De bond bouwt een stadion met {seats} zitplaatsen in {city}, dat op {date} opent.",
      },
      expand: {
        title: "{stadium} wordt uitgebreid",
        body: "Het {stadium} in {city} biedt na de werkzaamheden plaats aan {seats}, op {date}.",
      },
      opened: {
        build: "{nation} opent {stadium}",
        expand: "{stadium} uitgebreid",
        body: "Het {stadium} in {city} biedt nu plaats aan {seats}{ready}.",
      },
      readyFor: ", klaar voor de {comp}",
    },
    champions: {
      title: "{winner} wint de {comp}",
      body: "{winner} is kampioen{beat}.",
      beat: ", na winst op {runnerUp} in de finale",
    },
    draw: {
      title: "{comp}: {stage}",
      group: "De loting is gedaan. We spelen tegen {others}.",
      tie: "We zijn geloot tegen {opp}.",
    },
    and: "{a} en {b}",
    host: {
      title: "{list} organiseert de {comp}",
      one: "{list} is gastheer van de {comp}, die begint op {date}.",
      many: "{list} organiseren de {comp} samen, die begint op {date}.",
    },
    placeholder: {
      title: "{team} neemt de plek in",
      body: "{team} wint de {label} en vult die plek in de loting.",
    },
  },
  ms: {
    trophy: "Je eerste trofee: de {comp}.",
    world: "Wereldkampioen! {nation} wint de {comp}.",
    continental: "Kampioen van jouw continent: de {comp}.",
    qualification: "Je hebt {nation} naar een groot toernooi gebracht.",
    worldCup: "Je hebt {nation} naar een WK gebracht.",
    firstWin: "Je eerste overwinning als bondscoach.",
    matches: "{n} wedstrijden als bondscoach.",
    debuts: "{n} spelers hebben onder jou hun eerste interland gespeeld.",
    youthDebuts: "Vijf spelers van 21 jaar of jonger hebben op interlandniveau hun debuut gemaakt.",
    unbeaten: "Tien officiële wedstrijden ongeslagen.",
    top10: "{nation} staat onder jou in de wereldtop tien.",
    no1: "{nation} is het beste team ter wereld.",
  },
  review: {
    reached: {
      champions: "Kampioen",
      knockedOut: "Uitgeschakeld",
      qualified: "Geplaatst",
      notQualified: "Niet geplaatst",
      leagueStage: "Competitiefase",
      promoted: "Gepromoveerd naar Divisie {letter}",
      relegated: "Gedegradeerd naar Divisie {letter}",
      stayed: "Gebleven in Divisie {letter}",
      runnersUp: "Tweede",
      groups: "Groepsfase",
    },
    msg: {
      delightedChampion:
        "De bond is dolblij. De {comp} winnen gaat verder dan iemand durfde te hopen, en je aanzien is nog nooit zo hoog geweest.",
      delighted: "De bond is dolblij met de {comp}. Je hebt ze meer gegeven dan ze vroegen.",
      satisfied:
        "De bond is tevreden over de {comp}. De klus is geklaard; nu verwachten ze dat je hierop voortbouwt.",
      disappointed:
        "De bond is teleurgesteld over de {comp}. Ze verwachtten meer, en hun geduld is niet oneindig.",
      ultimatum:
        "Na de {comp} is het geduld van de bond op. De resultaten moeten onmiddellijk beter, anders zoeken ze iemand die ze wel kan leveren.",
      sacked: "De {comp} was de druppel. De bond heeft besloten je van je taken te ontheffen.",
      contractEnd:
        "Met de {comp} komt er een einde aan je contract, en de bond heeft besloten het niet te verlengen.",
    },
  },
  fx: {
    friendly: "Oefeninterland",
    window: "Interlandperiode",
    matchday: "{stage} · Speelronde {n}",
    groupMatchday: "{stage} · {group} · Speelronde {n}",
    round: "{round}",
    stageRound: "{stage} · {round}",
    roundLeg: "{round} · Wedstrijd {leg}",
    stageRoundLeg: "{stage} · {round} · Wedstrijd {leg}",
  },
  lineup: {
    nobody: "Niemand speelt als {pos}",
    notInSquad: "{name} ({pos}) zit niet in de selectie",
    injured: "{name} ({pos}) is geblesseerd ({label})",
    suspended: "{name} ({pos}) is geschorst",
  },
  placeholder: {
    uefa: "UEFA play-off Pad {path}",
    path: "Play-off Pad {path}",
    tournament: "Play-offtoernooi",
    qualifier: "Kwalificatie {n}",
    winner: "Winnaar {base}",
    tournamentWinner: "Winnaar play-offtoernooi {n}",
    shortIc: "IC {n}",
    shortPo: "PO {path}",
  },
  injury: {
    "hamstring-strain": "Hamstringblessure",
    "ankle-sprain": "Enkelverstuiking",
    "calf-strain": "Kuitblessure",
    "groin-strain": "Liesblessure",
    "thigh-strain": "Dijblessure",
    "knee-injury": "Knieblessure",
    "broken-foot": "Gebroken voet",
    "cruciate-ligament-rupture": "Gescheurde kruisband",
    knock: "Knauw",
  },
  stage: {
    group: "Groep {name}",
    league: "Divisie",
    leagueN: "Divisie {x}",
    roundOf: "Laatste {n}",
    "round-of-16": "Achtste finales",
    "round-of-32": "Zestiende finales",
    "quarter-finals": "Kwartfinales",
    "semi-finals": "Halve finales",
    final: "Finale",
    finals: "Finales",
    "third-place": "Derde plaats",
    "bronze-final": "Troostfinale",
    "group-stage": "Groepsfase",
    "knockout-stage": "Knock-outfase",
    "league-phase": "Competitiefase",
    qualifying: "Kwalificatie",
    "preliminary-round": "Voorronde",
    preliminaryN: "Voorronde {n}",
    prelims: "Voorrondes",
    "first-round": "Eerste ronde",
    "second-round": "Tweede ronde",
    "third-round": "Derde ronde",
    "fourth-round": "Vierde ronde",
    "fifth-round": "Vijfde ronde",
    "final-round": "Laatste ronde",
    "play-offs": "Play-offs",
    "play-in": "Play-In",
    "play-off-round": "Play-offronde",
    "play-off-semi-finals": "Play-off halve finales",
    "play-off-finals": "Play-off finales",
    "play-off-final": "Play-off finale",
    "play-off-tournament": "Play-offtoernooi",
    "promotion-relegation-play-offs": "Promotie-/degradatie-play-offs",
    "league-a-quarter-finals": "Kwartfinales Divisie A",
    "league-a-finals": "Finales Divisie A",
    "league-b-finals": "Finales Divisie B",
    "league-c-finals": "Finales Divisie C",
  },
  comp: {
    wc: {
      name: "WK {year}",
      short: "WK",
      plain: "Wereldkampioenschap",
    },
    "wcq-uefa": {
      name: "WK {year} kwalificatie · UEFA",
      short: "WK-kwal. Europa",
      plain: "WK-kwalificatie · UEFA",
    },
    "wcq-caf": {
      name: "WK {year} kwalificatie · CAF",
      short: "WK-kwal. Afrika",
      plain: "WK-kwalificatie · CAF",
    },
    "wcq-afc": {
      name: "WK {year} kwalificatie · AFC",
      short: "WK-kwal. Azië",
      plain: "WK-kwalificatie · AFC",
    },
    "wcq-concacaf": {
      name: "WK {year} kwalificatie · CONCACAF",
      short: "WK-kwal. CONCACAF",
      plain: "WK-kwalificatie · CONCACAF",
    },
    "wcq-conmebol": {
      name: "WK {year} kwalificatie · CONMEBOL",
      short: "WK-kwal. Zuid-Amerika",
      plain: "WK-kwalificatie · CONMEBOL",
    },
    "wcq-ofc": {
      name: "WK {year} kwalificatie · OFC",
      short: "WK-kwal. Oceanië",
      plain: "WK-kwalificatie · OFC",
    },
    "wcq-ic": {
      name: "WK {year} play-offtoernooi",
      short: "Play-off",
      plain: "WK-play-offtoernooi",
    },
    euro: {
      name: "UEFA EK {year}",
      short: "EK",
      plain: "UEFA EK",
    },
    euroq: {
      name: "UEFA EK {year} kwalificatie",
      short: "EK-kwalificatie",
      plain: "UEFA EK-kwalificatie",
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
      name: "Afrika Cup {year}",
      short: "AFCON",
      plain: "Afrika Cup",
    },
    afconq: {
      name: "Afrika Cup {year} kwalificatie",
      short: "AFCON-kwalificatie",
      plain: "Afrika Cup-kwalificatie",
    },
    "asian-cup": {
      name: "AFC Asian Cup {year}",
      short: "Asian Cup",
      plain: "AFC Asian Cup",
    },
    "asian-cupq": {
      name: "AFC Asian Cup {year} kwalificatie",
      short: "Asian Cup-kwalificatie",
      plain: "AFC Asian Cup-kwalificatie",
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
      name: "CONCACAF Gold Cup {year} voorrondes",
      short: "Gold Cup-voorrondes",
      plain: "CONCACAF Gold Cup-voorrondes",
    },
    "gold-cup": {
      name: "CONCACAF Gold Cup {year}",
      short: "Gold Cup",
      plain: "CONCACAF Gold Cup",
    },
    "arab-cup": {
      name: "Arab Cup {year}",
      short: "Arab Cup",
      plain: "Arab Cup",
    },
    "gulf-cup": {
      name: "Arabian Gulf Cup {year}",
      short: "Gulf Cup",
      plain: "Arabian Gulf Cup",
    },
    aff: {
      name: "ASEAN-kampioenschap {year}",
      short: "ASEAN-kampioenschap",
      plain: "ASEAN-kampioenschap",
    },
    "asean-cup": {
      name: "ASEAN Cup {year}",
      short: "ASEAN Cup",
      plain: "ASEAN Cup",
    },
    "asean-challenge": {
      name: "ASEAN Challenge Cup {year}",
      short: "ASEAN Challenge Cup",
      plain: "ASEAN Challenge Cup",
    },
    "inv-mar": {
      name: "Maarttoernooi {year}",
      short: "Maarttoernooi",
      plain: "Maarttoernooi",
    },
    "inv-jun": {
      name: "Junitoernooi {year}",
      short: "Junitoernooi",
      plain: "Junitoernooi",
    },
    "inv-sep": {
      name: "Herfsttoernooi {year}",
      short: "Herfsttoernooi",
      plain: "Herfsttoernooi",
    },
    "inv-nov": {
      name: "Novembertoernooi {year}",
      short: "Novembertoernooi",
      plain: "Novembertoernooi",
    },
    e1: {
      name: "EAFF E-1 Championship {year}",
      short: "E-1",
      plain: "EAFF E-1 Championship",
    },
    cafa: {
      name: "CAFA Nations Cup {year}",
      short: "CAFA Nations Cup",
      plain: "CAFA Nations Cup",
    },
    waff: {
      name: "WAFF-kampioenschap {year}",
      short: "WAFF-kampioenschap",
      plain: "WAFF-kampioenschap",
    },
    saff: {
      name: "SAFF-kampioenschap {year}",
      short: "SAFF-kampioenschap",
      plain: "SAFF-kampioenschap",
    },
    cosafa: {
      name: "COSAFA Cup {year}",
      short: "COSAFA Cup",
      plain: "COSAFA Cup",
    },
    cecafa: {
      name: "CECAFA Senior Challenge Cup {year}",
      short: "CECAFA Cup",
      plain: "CECAFA Senior Challenge Cup",
    },
    wafu: {
      name: "WAFU Zone Cup {year}",
      short: "WAFU Cup",
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
      label: "Stopper",
      blurb: "Stapt uit om de bal te winnen en kopt alles weg; minder hulp met de bal.",
    },
    "ball-playing": {
      label: "Opbouwende verdediger",
      blurb: "Stapt met de bal het middenveld in; minder scherp in de tackle.",
    },
    cover: {
      label: "Dekkende verdediger",
      blurb: "Blijft diep en veilig; maakt zelden overtredingen en start zelden een aanval.",
    },
    "defensive-full-back": {
      label: "Verdedigende back",
      blurb: "Houdt zijn linie en tackelt; gaat niet mee naar voren.",
    },
    "wing-back": {
      label: "Wingback",
      blurb: "Loopt de hele flank, voert voor en schiet; laat ruimte achter zich.",
    },
    "inverted-full-back": {
      label: "Invertende back",
      blurb: "Schuift naar het middenveld om op te bouwen; laat de flank open.",
    },
    anchor: {
      label: "Ankerman",
      blurb: "Zit voor de verdediging; schermt haar af en houdt het simpel.",
    },
    "ball-winner": {
      label: "Ballenafpakker",
      blurb: "Jaagt over het hele middenveld op de bal en maakt daarbij overtredingen.",
    },
    "deep-playmaker": {
      label: "Diepe spelmaker",
      blurb: "Dicteert vanuit de diepte; minder dekking voor de verdediging.",
    },
    "box-to-box": {
      label: "Box-to-box",
      blurb: "Bestrijkt het hele veld en duikt laat op in het strafschopgebied.",
    },
    playmaker: {
      label: "Spelmaker",
      blurb: "Bepaalt het tempo en vindt de beslissende pass; verdedigt minder.",
    },
    destroyer: {
      label: "Vernietiger",
      blurb:
        "Breekt het spel van de tegenstander en maakt veel overtredingen; voegt weinig toe aan de aanval.",
    },
    "advanced-playmaker": {
      label: "Aanvallende spelmaker",
      blurb: "Speelt tussen de linies en creëert; scoort zelf minder.",
    },
    "shadow-striker": {
      label: "Schaduwspits",
      blurb: "Loopt achter de spits mee en schiet; creëert minder.",
    },
    tracker: {
      label: "Terugwerker",
      blurb: "Zet van voren druk en werkt terug; minder gevaarlijk.",
    },
    winger: {
      label: "Vleugelspeler",
      blurb: "Houdt de lijn vast en levert voorzetten.",
    },
    "inside-forward": {
      label: "Binnendoorspeler",
      blurb: "Snijdt naar binnen om te schieten; minder breedte en minder voorzetten.",
    },
    "tracking-winger": {
      label: "Terugwerkende vleugelspeler",
      blurb: "Werkt terug om de back te helpen; minder naar voren.",
    },
    "target-man": {
      label: "Targetman",
      blurb: "Wint kopduels en houdt de bal vast; niet de scherpste afwerker.",
    },
    poacher: {
      label: "Strafschopgebiedspits",
      blurb: "Wacht in het strafschopgebied op kansen; doet verder niets.",
    },
    "complete-forward": {
      label: "Complete aanvaller",
      blurb: "Scoort, combineert en creëert.",
    },
    "pressing-forward": {
      label: "Pressende aanvaller",
      blurb: "Zit verdedigers van voren op de huid; minder gevaarlijk in het strafschopgebied.",
    },
  },
  arch: {
    "shot-stopper": {
      label: "Lijnkeeper",
      blurb: "Beheerst zijn doellijn en redt wat niet te redden is.",
    },
    "sweeper-keeper": {
      label: "Keeper-libero",
      blurb: "Veegt achter de verdediging op en start aanvallen; iets minder zeker op de lijn.",
    },
    stopper: {
      label: "Stopper",
      blurb: "Wint duels en kopt weg, maar draagt weinig bij aan de opbouw.",
    },
    "ball-playing-defender": {
      label: "Opbouwende verdediger",
      blurb: "Start aanvallen vanuit de achterhoede; iets minder scherp in de tackle.",
    },
    "defensive-full-back": {
      label: "Verdedigende back",
      blurb: "Blijft achter, tackelt en dekt de flank.",
    },
    "attacking-full-back": {
      label: "Aanvallende back",
      blurb: "Overlapt, voert voor en komt in het strafschopgebied; laat ruimte achter zich.",
    },
    "ball-winner": {
      label: "Ballenafpakker",
      blurb: "Breekt het spel voor de verdediging en maakt daarbij overtredingen.",
    },
    "deep-playmaker": {
      label: "Diepe spelmaker",
      blurb: "Dicteert het spel vanuit de diepte met lange passes.",
    },
    "box-to-box": {
      label: "Box-to-box",
      blurb: "Bestrijkt elke grasspriet en duikt laat op in het strafschopgebied.",
    },
    playmaker: {
      label: "Spelmaker",
      blurb: "Bepaalt het tempo en vindt de beslissende pass.",
    },
    creator: {
      label: "Creatieveling",
      blurb: "Speelt tussen de linies; meer assists dan doelpunten.",
    },
    "shadow-striker": {
      label: "Schaduwspits",
      blurb: "Loopt achter de spits mee en scoort zelf.",
    },
    winger: {
      label: "Vleugelspeler",
      blurb: "Houdt de lijn vast en levert voorzetten.",
    },
    "inside-forward": {
      label: "Binnendoorspeler",
      blurb: "Snijdt vanaf de flank naar binnen om te schieten.",
    },
    "target-man": {
      label: "Targetman",
      blurb: "Wint kopduels en houdt de bal vast; niet de scherpste afwerker.",
    },
    poacher: {
      label: "Strafschopgebiedspits",
      blurb: "Leeft in het strafschopgebied en maakt af wat op hem afkomt; verder weinig.",
    },
    "complete-forward": {
      label: "Complete aanvaller",
      blurb: "Scoort, combineert en creëert.",
    },
  },
  rule: {
    "behind-high-line": "Ballen in de rug van een hoge linie",
    "counter-into-deep-block": "Niets om op te counteren tegen een diep blok",
    "width-into-back-five": "Breedte is verspild tegen een vijfmansverdediging",
    "width-into-open-flanks": "Breedte tegen een vierkant viertal met open flanken",
    "patience-into-press": "Geduldige opbouw tegen hoge druk",
    "direct-past-press": "Direct spel voorbij hoge druk",
    "lone-striker-into-back-three": "Een eenzame spits tegen drie centrale verdedigers",
    "two-strikers-into-flat-four": "Twee spitsen tegen een vierkante vierhoek",
    "midfield-numbers": "Meer spelers door het midden",
    "midfield-outnumbered": "In de minderheid door het midden",
    "press-patient-side": "Hoge druk tegen een geduldige ploeg",
    "narrow-into-wide": "Een smalle ploeg pakt het midden dicht tegen een brede",
  },
  badge: {
    "big-game": {
      label: "Grote-wedstrijdspeler",
      text: "Speelt boven zijn niveau in finales en beslissende duels, en houdt zijn zenuwen in bedwang op de stip.",
    },
    reliable: {
      label: "Betrouwbaar",
      text: "Speelt bijna elke wedstrijd op zijn niveau.",
    },
    erratic: {
      label: "Wisselvallig",
      text: "Zijn cijfers schommelen; de ene dag briljant, de volgende dag zwak.",
    },
    "injury-prone": {
      label: "Blessuregevoelig",
      text: "Heeft meer kans om in een wedstrijd geblesseerd te raken.",
    },
    "tires-early": {
      label: "Raakt snel vermoeid",
      text: "Is eerder uitgeput dan een jongere speler.",
    },
  },
  bond: {
    clubmates: "Clubgenoten",
    friends: "Vrienden",
    feud: "Vete",
  },
  spirit: {
    tight: "Hecht",
    good: "Goed",
    neutral: "Neutraal",
    uneasy: "Ongemakkelijk",
    divided: "Verdeeld",
  },
  scout: {
    trait: {
      attack: "Aanvalslustig",
      cautious: "Voorzichtig",
      highLine: "Hoge linie",
      deepLine: "Diepe linie",
      wide: "Speelt breed",
      narrow: "Speelt smal",
      counter: "Counterend",
      highPress: "Hoge druk",
      dropsOff: "Zakt terug",
      direct: "Direct",
      patient: "Geduldig",
      balanced: "Evenwichtig",
    },
    reason: {
      star: "Hun beste speler",
      threat: "Hun grootste doelpuntengevaar",
      creator: "Creëert de meeste van hun kansen",
      weak: "De zwakke schakel",
    },
    level: {
      "0": "Diep",
      "1": "Standaard",
      "2": "Hoog",
    },
    width: {
      "0": "Smal",
      "1": "Standaard",
      "2": "Breed",
    },
    change: {
      line: "Verdedigingslinie: {from} → {to}",
      width: "Breedte: {from} → {to}",
      counter: "Counter: {from} → {to}",
    },
    on: "aan",
    off: "uit",
  },
}

export default engine
