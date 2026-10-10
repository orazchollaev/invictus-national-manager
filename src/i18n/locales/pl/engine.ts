import type en from "../en/engine"

const engine: typeof en = {
  obj: {
    qualify: "Awansować na turniej: {comp}",
    unbeaten: "{text} bez porażki",
    promotion: "Awansować z Ligi {letter}",
    relegation: "Uniknąć spadku z Ligi {letter}",
    win: "Wygrać turniej: {comp}",
    reach: {
      knockout: "Dotrzeć do fazy pucharowej: {comp}",
      "quarter-finals": "Dotrzeć do ćwierćfinału: {comp}",
      "semi-finals": "Dotrzeć do półfinału: {comp}",
      final: "Dotrzeć do finału: {comp}",
    },
    debuts: "Dać szansę debiutu w reprezentacji {count} zawodnikom w wieku do 21 lat w roku {year}",
    raiseNote:
      "Nagrody ×{reward}; niepowodzenie kosztuje {cost} zaufania, a potem obowiązuje pierwotny cel",
    lowerNote: "Kosztuje teraz {cost} zaufania; nagrody o połowę mniejsze",
    lowerNeeds: "Zarząd wysłucha Cię tylko przy zaufaniu na poziomie co najmniej {n}%",
  },
  news: {
    raise: {
      title: "Podnosisz poprzeczkę",
      body: "Obiecałeś federacji więcej: „{text}”. Dotrzymaj słowa, a tego nie zapomną.",
    },
    lower: {
      title: "Obniżone oczekiwania",
      body: "Federacja niechętnie zgodziła się na niższy cel: „{text}”.",
    },
    broken: {
      title: "Obietnica złamana",
      body: "Obiecałeś: „{promised}”, ale się nie udało. Federacja nadal oczekuje: „{target}”.",
    },
    met: {
      title: "Cel osiągnięty",
      body: "Federacja jest zachwycona: „{text}” — zrobione. Dodatkowe wsparcie trafi też do akademii.",
    },
    missed: {
      title: "Cel nieosiągnięty",
      body: "Federacja jest niezadowolona: nie udało nam się zrealizować celu „{text}”.",
    },
    friendly: "mecz towarzyski",
    derbyWin: {
      title: "Dzień derbów należy do: {us}",
      body: "Zwycięstwo {score} nad odwiecznym rywalem, {them}, w rozgrywkach: {comp}. Ulice świętują.",
    },
    derbyLoss: {
      title: "Porażka w derbach z {them}",
      body: "Przegrana {score} z {them} w rozgrywkach: {comp}. Kibice tak szybko tego nie zapomną.",
    },
    derbyDraw: {
      title: "Remis w derbach",
      body: "{us} i {them} zremisowali {score} w rozgrywkach: {comp}. Żadna ze stron nie ma prawa do chwalenia się.",
    },
    fans: {
      angry: {
        title: "Kibice odwracają się od selekcjonera",
        body: "Kibice reprezentacji {nation} jasno okazali swój gniew. Zarząd słucha.",
      },
      adore: {
        title: "Kibice są za Tobą",
        body: "Kibice reprezentacji {nation} skandują nazwisko selekcjonera. Stadion będzie huczał.",
      },
    },
    invitational: {
      title: "{host} zorganizuje turniej: {comp}",
      body: "{host} będzie gospodarzem turnieju {comp}, w którym wezmą udział: {teams}. Start: {date}.",
    },
    invite: {
      title: "Zaproszenie od {host}",
      body: "{host} zaprasza nas na turniej {n} drużyn w oknie rozpoczynającym się {date}. Czekają na odpowiedź.",
    },
    inviteLapsed: {
      title: "Zaproszenie wygasło",
      body: "Nie odpowiedzieliśmy na czas na zaproszenie od {host}; turniej odbędzie się bez nas.",
    },
    inviteOff: {
      title: "Turniej odwołany",
      body: "Turniej gospodarza {host} nie mógł się odbyć: nie wszystkie drużyny są nadal wolne.",
    },
    riot: {
      title: "{us} rozbija {them}",
      body: "Zwycięstwo {score} nad {them} w rozgrywkach: {comp}. Kibice to zapamiętają.",
    },
    shock: {
      title: "Niespodziewane zwycięstwo nad {them}",
      body: "Niewielu dawało nam szansę, ale pokonaliśmy {them} {score} w rozgrywkach: {comp}.",
    },
    humiliation: {
      title: "Upokorzenie w meczu z {them}",
      body: "Porażka {score} z {them} w rozgrywkach: {comp}. Pojawiają się pytania o przyszłość selekcjonera.",
    },
    embarrassing: {
      title: "Kompromitująca porażka z {them}",
      body: "Byliśmy faworytem, ale przegraliśmy {score} z {them} w rozgrywkach: {comp}.",
    },
    cap: {
      title: "{name} zalicza {caps}. występ w kadrze",
      body: "{name} zagrał już {caps} razy w reprezentacji: {nation}.",
    },
    goals: {
      title: "{name} ma już {goals} goli w reprezentacji",
      body: "{name} strzelił już {goals} goli dla reprezentacji: {nation}.",
    },
    debut: {
      title: "Pierwszy występ w kadrze: {name}",
      body: "Reprezentacyjny debiut w meczu z {opp}: {names}.",
    },
    debuts: {
      title: "Debiutów: {n}",
    },
    milestone: "Osiągnięto kamień milowy",
    ultimatum: {
      title: "Ostatnie ostrzeżenie",
      body: "Federacja straciła cierpliwość. Podnieś jej zaufanie do {lifted}% w ciągu {matches} meczów o stawkę, bo zostaniesz zastąpiony.",
    },
    eases: {
      title: "Presja słabnie",
      body: "Wyniki się odwróciły. Federacja wycofała swoje ostatnie ostrzeżenie.",
    },
    sacked: {
      title: "Zwolniony",
      body: "Federacja reprezentacji {nation} zwolniła Cię z obowiązków.",
    },
    resigned: {
      title: "Zrezygnowałeś",
      body: "Ustąpiłeś ze stanowiska selekcjonera reprezentacji: {nation}.",
    },
    notRenewed: {
      title: "Kontrakt nie został przedłużony",
      body: "Federacja reprezentacji {nation} zdecydowała się nie przedłużać Twojego kontraktu.",
    },
    renewed: {
      title: "Kontrakt przedłużony",
      body: "Federacja reprezentacji {nation} przedłużyła Twój kontrakt do {date}.",
    },
    extended: {
      title: "Jeszcze jeden rok",
      body: "Federacja reprezentacji {nation} przedłużyła Twój kontrakt zaledwie o rok. Chcą zobaczyć postęp.",
    },
    coachChange: {
      title: "Zmiana trenera: {nation}",
      body: "Reprezentacja {nation} powołała na nowego selekcjonera: {coach}.",
    },
    coachSacked: {
      title: "{nation} zwalnia trenera: {coach}",
      body: "Reprezentacja {nation} rozstała się z selekcjonerem {coach} po słabej serii. Rozpoczęły się poszukiwania następcy.",
    },
    coachRetired: {
      title: "{coach} kończy karierę",
      body: "{coach} ustąpił ze stanowiska selekcjonera reprezentacji {nation} i zakończył karierę trenerską.",
    },
    offer: {
      title: "Oferta pracy: {nation}",
      body: "Federacja reprezentacji {nation} chciałaby widzieć Cię w roli nowego selekcjonera. Oferta obowiązuje do {date}.",
    },
    newJob: {
      title: "Nowa praca: {nation}",
      body: "Jesteś nowym selekcjonerem reprezentacji: {nation}.",
    },
    tourney: {
      through: "{comp}: awans",
      throughTo: "Awansowaliśmy do rundy: {round}.",
      throughBare: "Awansowaliśmy.",
      out: "{comp}: odpadnięcie",
      groupOut: "Zakończyliśmy grupę ({group}) bez awansu.",
      knockedOut: "Odpadliśmy w rundzie: {round}.",
      runnersUp: "{comp}: wicemistrzostwo",
      lostFinal: "Przegraliśmy finał.",
    },
    qualified: {
      title: "Awans na turniej: {finals}",
      body: "Zapewniliśmy sobie miejsce na turnieju: {finals}.",
    },
    playoff: {
      title: "Do baraży",
      body: "Dotarliśmy do baraży międzykontynentalnych o miejsce na turnieju: {finals}.",
    },
    missedOut: {
      title: "Brak awansu",
      body: "Nie awansowaliśmy na turniej: {finals}.",
    },
    finalsGeneric: "turniej finałowy",
    injury: {
      title: "Kontuzja: {name}",
      body: "{name} doznał w klubie urazu ({injury}) i będzie pauzował do {date}.",
    },
    newClub: "nowy klub",
    bigMove: {
      title: "{name} zalicza duży transfer",
      body: "{name} przechodzi do klubu {club} po reprezentacyjnym przełomie.",
    },
    move: {
      title: "{name} zmienia klub",
      body: "{name} przechodzi do klubu {club}.",
    },
    prospects: {
      title: "Twoje talenty w tym sezonie",
      body: "Jak rozwinęli się młodzi zawodnicy, których obserwujesz: {list}.",
    },
    season: {
      title: "Początek sezonu {from}–{to}",
      body: "Zawodnicy rozwinęli się w minionym sezonie, a letnie okno transferowe się zamknęło.",
    },
    retired: {
      entry: "{name} ({pos}, {age})",
      entryCaps: "{name} ({pos}, {age}, {caps} meczów w kadrze)",
    },
    retire: {
      title: "{name} kończy karierę reprezentacyjną",
      body: "{name} ({age}, {caps} meczów w kadrze) ogłosił zakończenie kariery reprezentacyjnej.",
    },
    wonderkid: {
      title: "Wschodzi talent: {name}",
      body: "Skauci zachwycają się zawodnikiem {name}, {age}-letnim graczem ({pos}) w klubie {club}.",
    },
    newgen: {
      entry: "{name} ({pos}, {age}, {club})",
    },
    retiredMany: {
      title: "Koniec kariery: {n} zawodników",
      body: "Ci zawodnicy odwiesili buty na kołek: {list}.",
    },
    newgens: {
      title: "Młodych zawodników: {n}",
      body: "Nowe pokolenie, które może grać dla nas: {list}.",
    },
    stadium: {
      build: {
        title: "Ruszają prace nad stadionem: {stadium}",
        body: "Federacja buduje stadion na {seats} miejsc w mieście {city}; otwarcie zaplanowano na {date}.",
      },
      expand: {
        title: "Rozbudowa stadionu: {stadium}",
        body: "Stadion {stadium} w mieście {city} pomieści {seats} widzów po zakończeniu prac, w dniu {date}.",
      },
      opened: {
        build: "{nation} otwiera stadion: {stadium}",
        expand: "Rozbudowano stadion: {stadium}",
        body: "Stadion {stadium} w mieście {city} mieści teraz {seats}{ready}.",
      },
      readyFor: ", gotowy na turniej: {comp}",
    },
    champions: {
      title: "{winner} wygrywa turniej: {comp}",
      body: "{winner} zostaje mistrzem{beat}.",
      beat: ", pokonując w finale drużynę {runnerUp}",
    },
    draw: {
      title: "{comp}: {stage}",
      group: "Losowanie zakończone. Zmierzymy się z: {others}.",
      tie: "Wylosowaliśmy rywala: {opp}.",
    },
    and: "{a} i {b}",
    host: {
      title: "Gospodarz turnieju {comp}: {list}",
      one: "Gospodarzem turnieju {comp} będzie: {list}. Start: {date}.",
      many: "Współgospodarzami turnieju {comp} będą: {list}. Start: {date}.",
    },
    placeholder: {
      title: "{team} zajmuje swoje miejsce",
      body: "{team} wygrywa rozgrywki ({label}) i zajmuje to miejsce w losowaniu.",
    },
  },
  ms: {
    trophy: "Twoje pierwsze trofeum: {comp}.",
    world: "Mistrzowie świata! {nation} wygrywa turniej: {comp}.",
    continental: "Mistrzowie Twojego kontynentu: {comp}.",
    qualification: "Zaprowadziłeś reprezentację {nation} na wielki turniej.",
    worldCup: "Zaprowadziłeś reprezentację {nation} na mistrzostwa świata.",
    firstWin: "Twoje pierwsze zwycięstwo w roli selekcjonera.",
    matches: "{n} meczów w roli selekcjonera.",
    debuts: "{n} zawodników zaliczyło pierwszy występ w kadrze pod Twoim wodzą.",
    youthDebuts: "Pięciu zawodników w wieku do 21 lat zadebiutowało na poziomie reprezentacyjnym.",
    unbeaten: "Dziesięć meczów o stawkę bez porażki.",
    top10: "Reprezentacja {nation} jest w światowej dziesiątce pod Twoim kierownictwem.",
    no1: "Reprezentacja {nation} jest najlepszą drużyną świata.",
  },
  review: {
    reached: {
      champions: "Mistrzowie",
      knockedOut: "Odpadnięcie",
      qualified: "Awans",
      notQualified: "Brak awansu",
      leagueStage: "Faza ligowa",
      promoted: "Awans do Ligi {letter}",
      relegated: "Spadek do Ligi {letter}",
      stayed: "Utrzymanie w Lidze {letter}",
      runnersUp: "Wicemistrzowie",
      groups: "Faza grupowa",
    },
    msg: {
      delightedChampion:
        "Federacja jest zachwycona. Zwycięstwo w turnieju ({comp}) przekracza to, na co ktokolwiek się odważył liczyć, a Twoja pozycja nigdy nie była wyższa.",
      delighted:
        "Federacja jest zachwycona występem w rozgrywkach: {comp}. Dałeś jej więcej, niż oczekiwała.",
      satisfied:
        "Federacja jest zadowolona z występu w rozgrywkach: {comp}. Zadanie wykonane; teraz oczekują, że pójdziesz za ciosem.",
      disappointed:
        "Federacja jest rozczarowana występem w rozgrywkach: {comp}. Oczekiwała więcej, a jej cierpliwość nie jest nieograniczona.",
      ultimatum:
        "Po rozgrywkach ({comp}) federacji skończyła się cierpliwość. Wyniki muszą natychmiast się poprawić, inaczej znajdzie kogoś, kto je zapewni.",
      sacked:
        "Rozgrywki ({comp}) przelały czarę goryczy. Federacja postanowiła zwolnić Cię z obowiązków.",
      contractEnd:
        "Rozgrywki ({comp}) kończą Twój kontrakt, a federacja zdecydowała się go nie przedłużać.",
    },
  },
  fx: {
    friendly: "Towarzyski mecz międzynarodowy",
    window: "Międzynarodowe okno meczowe",
    matchday: "{stage} · Kolejka {n}",
    groupMatchday: "{stage} · {group} · Kolejka {n}",
    round: "{round}",
    stageRound: "{stage} · {round}",
    roundLeg: "{round} · Mecz {leg}",
    stageRoundLeg: "{stage} · {round} · Mecz {leg}",
  },
  lineup: {
    nobody: "Nikt nie gra na pozycji: {pos}",
    notInSquad: "{name} ({pos}) nie ma w kadrze",
    injured: "{name} ({pos}) jest kontuzjowany ({label})",
    suspended: "{name} ({pos}) jest zawieszony",
  },
  placeholder: {
    uefa: "Baraże UEFA, ścieżka {path}",
    path: "Baraże, ścieżka {path}",
    tournament: "Turniej barażowy",
    qualifier: "Eliminacje {n}",
    winner: "Zwycięzca: {base}",
    tournamentWinner: "Zwycięzca turnieju barażowego {n}",
    shortIc: "MK {n}",
    shortPo: "BAR {path}",
  },
  injury: {
    "hamstring-strain": "Naciągnięcie mięśnia dwugłowego uda",
    "ankle-sprain": "Skręcenie kostki",
    "calf-strain": "Naciągnięcie łydki",
    "groin-strain": "Naciągnięcie pachwiny",
    "thigh-strain": "Naciągnięcie uda",
    "knee-injury": "Kontuzja kolana",
    "broken-foot": "Złamanie stopy",
    "cruciate-ligament-rupture": "Zerwanie więzadeł krzyżowych",
    knock: "Stłuczenie",
  },
  stage: {
    group: "Grupa {name}",
    league: "Liga",
    leagueN: "Liga {x}",
    roundOf: "1/{n} finału",
    "round-of-16": "1/8 finału",
    "round-of-32": "1/16 finału",
    "quarter-finals": "Ćwierćfinały",
    "semi-finals": "Półfinały",
    final: "Finał",
    finals: "Finały",
    "third-place": "Mecz o trzecie miejsce",
    "bronze-final": "Mecz o brąz",
    "group-stage": "Faza grupowa",
    "knockout-stage": "Faza pucharowa",
    "league-phase": "Faza ligowa",
    qualifying: "Eliminacje",
    "preliminary-round": "Runda wstępna",
    preliminaryN: "Runda wstępna {n}",
    prelims: "Wstępna",
    "first-round": "Pierwsza runda",
    "second-round": "Druga runda",
    "third-round": "Trzecia runda",
    "fourth-round": "Czwarta runda",
    "fifth-round": "Piąta runda",
    "final-round": "Runda finałowa",
    "play-offs": "Baraże",
    "play-in": "Play-In",
    "play-off-round": "Runda barażowa",
    "play-off-semi-finals": "Półfinały barażowe",
    "play-off-finals": "Finały barażowe",
    "play-off-final": "Finał barażowy",
    "play-off-tournament": "Turniej barażowy",
    "promotion-relegation-play-offs": "Baraże o awans i spadek",
    "league-a-quarter-finals": "Ćwierćfinały Ligi A",
    "league-a-finals": "Finały Ligi A",
    "league-b-finals": "Finały Ligi B",
    "league-c-finals": "Finały Ligi C",
  },
  comp: {
    wc: {
      name: "Mistrzostwa świata {year}",
      short: "Mistrzostwa świata",
      plain: "Mistrzostwa świata",
    },
    "wcq-uefa": {
      name: "Eliminacje do MŚ {year} · UEFA",
      short: "El. MŚ Europa",
      plain: "Eliminacje do MŚ · UEFA",
    },
    "wcq-caf": {
      name: "Eliminacje do MŚ {year} · CAF",
      short: "El. MŚ Afryka",
      plain: "Eliminacje do MŚ · CAF",
    },
    "wcq-afc": {
      name: "Eliminacje do MŚ {year} · AFC",
      short: "El. MŚ Azja",
      plain: "Eliminacje do MŚ · AFC",
    },
    "wcq-concacaf": {
      name: "Eliminacje do MŚ {year} · CONCACAF",
      short: "El. MŚ CONCACAF",
      plain: "Eliminacje do MŚ · CONCACAF",
    },
    "wcq-conmebol": {
      name: "Eliminacje do MŚ {year} · CONMEBOL",
      short: "El. MŚ Ameryka Płd.",
      plain: "Eliminacje do MŚ · CONMEBOL",
    },
    "wcq-ofc": {
      name: "Eliminacje do MŚ {year} · OFC",
      short: "El. MŚ Oceania",
      plain: "Eliminacje do MŚ · OFC",
    },
    "wcq-ic": {
      name: "Turniej barażowy MŚ {year}",
      short: "Baraże",
      plain: "Turniej barażowy MŚ",
    },
    euro: {
      name: "Mistrzostwa Europy UEFA {year}",
      short: "Euro",
      plain: "Mistrzostwa Europy UEFA",
    },
    euroq: {
      name: "Eliminacje do Mistrzostw Europy UEFA {year}",
      short: "El. Euro",
      plain: "Eliminacje do Mistrzostw Europy UEFA",
    },
    unl: {
      name: "Liga Narodów UEFA {year}–{year2}",
      short: "Liga Narodów",
      plain: "Liga Narodów UEFA",
    },
    finalissima: {
      name: "Finalissima {year}",
      short: "Finalissima",
      plain: "Finalissima",
    },
    afcon: {
      name: "Puchar Narodów Afryki {year}",
      short: "PNA",
      plain: "Puchar Narodów Afryki",
    },
    afconq: {
      name: "Eliminacje do Pucharu Narodów Afryki {year}",
      short: "El. PNA",
      plain: "Eliminacje do Pucharu Narodów Afryki",
    },
    "asian-cup": {
      name: "Puchar Azji AFC {year}",
      short: "Puchar Azji",
      plain: "Puchar Azji AFC",
    },
    "asian-cupq": {
      name: "Eliminacje do Pucharu Azji AFC {year}",
      short: "El. Pucharu Azji",
      plain: "Eliminacje do Pucharu Azji AFC",
    },
    copa: {
      name: "Copa América {year}",
      short: "Copa América",
      plain: "Copa América",
    },
    "ofc-cup": {
      name: "Puchar Narodów OFC {year}",
      short: "Puchar Narodów OFC",
      plain: "Puchar Narodów OFC",
    },
    cnl: {
      name: "Liga Narodów CONCACAF {year}–{year2}",
      short: "LN CONCACAF",
      plain: "Liga Narodów CONCACAF",
    },
    gcq: {
      name: "Eliminacje wstępne do Złotego Pucharu CONCACAF {year}",
      short: "El. wstępne ZP",
      plain: "Eliminacje wstępne do Złotego Pucharu CONCACAF",
    },
    "gold-cup": {
      name: "Złoty Puchar CONCACAF {year}",
      short: "Złoty Puchar",
      plain: "Złoty Puchar CONCACAF",
    },
    "arab-cup": {
      name: "Puchar Arabski {year}",
      short: "Puchar Arabski",
      plain: "Puchar Arabski",
    },
    "gulf-cup": {
      name: "Puchar Zatoki Perskiej {year}",
      short: "Puchar Zatoki",
      plain: "Puchar Zatoki Perskiej",
    },
    aff: {
      name: "Mistrzostwa ASEAN {year}",
      short: "Mistrzostwa ASEAN",
      plain: "Mistrzostwa ASEAN",
    },
    "asean-cup": {
      name: "Puchar ASEAN {year}",
      short: "Puchar ASEAN",
      plain: "Puchar ASEAN",
    },
    "asean-challenge": {
      name: "Puchar Wyzwań ASEAN {year}",
      short: "Puchar Wyzwań ASEAN",
      plain: "Puchar Wyzwań ASEAN",
    },
    "inv-mar": {
      name: "Turniej Marcowy {year}",
      short: "Turniej Marcowy",
      plain: "Turniej Marcowy",
    },
    "inv-jun": {
      name: "Turniej Czerwcowy {year}",
      short: "Turniej Czerwcowy",
      plain: "Turniej Czerwcowy",
    },
    "inv-sep": {
      name: "Turniej Jesienny {year}",
      short: "Turniej Jesienny",
      plain: "Turniej Jesienny",
    },
    "inv-nov": {
      name: "Turniej Listopadowy {year}",
      short: "Turniej Listopadowy",
      plain: "Turniej Listopadowy",
    },
    e1: {
      name: "Mistrzostwa EAFF E-1 {year}",
      short: "E-1",
      plain: "Mistrzostwa EAFF E-1",
    },
    cafa: {
      name: "Puchar Narodów CAFA {year}",
      short: "Puchar Narodów CAFA",
      plain: "Puchar Narodów CAFA",
    },
    waff: {
      name: "Mistrzostwa WAFF {year}",
      short: "Mistrzostwa WAFF",
      plain: "Mistrzostwa WAFF",
    },
    saff: {
      name: "Mistrzostwa SAFF {year}",
      short: "Mistrzostwa SAFF",
      plain: "Mistrzostwa SAFF",
    },
    cosafa: {
      name: "Puchar COSAFA {year}",
      short: "Puchar COSAFA",
      plain: "Puchar COSAFA",
    },
    cecafa: {
      name: "Seniorski Puchar Wyzwań CECAFA {year}",
      short: "Puchar CECAFA",
      plain: "Seniorski Puchar Wyzwań CECAFA",
    },
    wafu: {
      name: "Puchar Strefy WAFU {year}",
      short: "Puchar WAFU",
      plain: "Puchar Strefy WAFU",
    },
    baltic: {
      name: "Puchar Bałtycki {year}",
      short: "Puchar Bałtycki",
      plain: "Puchar Bałtycki",
    },
  },
  role: {
    stopper: {
      label: "Stoper",
      blurb: "Wychodzi do odbioru i wygrywa wszystko głową; mniej pomaga przy piłce.",
    },
    "ball-playing": {
      label: "Obrońca rozgrywający",
      blurb: "Wchodzi z piłką do drugiej linii; słabszy w odbiorze.",
    },
    cover: {
      label: "Obrońca asekurujący",
      blurb: "Gra głęboko i bezpiecznie; rzadko fauluje, rzadko rozpoczyna akcję.",
    },
    "defensive-full-back": {
      label: "Defensywny boczny obrońca",
      blurb: "Trzyma linię i odbiera piłkę; nie włącza się do ataku.",
    },
    "wing-back": {
      label: "Wahadłowy",
      blurb: "Biega całym skrzydłem, dośrodkowuje i strzela; zostawia przestrzeń za plecami.",
    },
    "inverted-full-back": {
      label: "Odwrócony boczny obrońca",
      blurb: "Wchodzi do środka pola, by budować grę; oddaje skrzydło.",
    },
    anchor: {
      label: "Defensywny pomocnik",
      blurb: "Gra przed obroną; osłania ją i trzyma prostotę.",
    },
    "ball-winner": {
      label: "Odbiorca piłki",
      blurb: "Poluje na piłkę w całej drugiej linii, przy okazji faulując.",
    },
    "deep-playmaker": {
      label: "Cofnięty rozgrywający",
      blurb: "Dyryguje grą z głębi pola; mniej asekuruje obronę.",
    },
    "box-to-box": {
      label: "Pomocnik box-to-box",
      blurb: "Pokrywa całe boisko i późno pojawia się w polu karnym.",
    },
    playmaker: {
      label: "Rozgrywający",
      blurb: "Nadaje tempo i znajduje zabójcze podanie; mniej broni.",
    },
    destroyer: {
      label: "Niszczyciel",
      blurb: "Przerywa akcje i często fauluje; mało daje w ataku.",
    },
    "advanced-playmaker": {
      label: "Wysunięty rozgrywający",
      blurb: "Gra między liniami i kreuje; sam strzela mniej.",
    },
    "shadow-striker": {
      label: "Cień napastnika",
      blurb: "Wbiega za plecy napastnika i strzela; mniej kreuje.",
    },
    tracker: {
      label: "Pomocnik pressujący",
      blurb: "Pressuje z przodu i wraca za rywalem; mniej groźny.",
    },
    winger: {
      label: "Skrzydłowy",
      blurb: "Trzyma się linii bocznej i dośrodkowuje.",
    },
    "inside-forward": {
      label: "Wewnętrzny skrzydłowy",
      blurb: "Schodzi do środka, by strzelać; mniej szerokości i dośrodkowań.",
    },
    "tracking-winger": {
      label: "Cofnięty skrzydłowy",
      blurb: "Wraca, by pomóc bocznemu obrońcy; mniej gra do przodu.",
    },
    "target-man": {
      label: "Wieża",
      blurb:
        "Wygrywa piłki głową i przytrzymuje futbolówkę; nie jest najskuteczniejszym egzekutorem.",
    },
    poacher: {
      label: "Lis pola karnego",
      blurb: "Czeka w polu karnym na okazje; nie robi nic więcej.",
    },
    "complete-forward": {
      label: "Napastnik kompletny",
      blurb: "Strzela, łączy grę i kreuje.",
    },
    "pressing-forward": {
      label: "Pressujący napastnik",
      blurb: "Nęka obrońców z przodu; mniej groźny w polu karnym.",
    },
  },
  arch: {
    "shot-stopper": {
      label: "Bramkarz na linii",
      blurb: "Dowodzi na swojej linii i broni to, czego nie powinien.",
    },
    "sweeper-keeper": {
      label: "Bramkarz-libero",
      blurb: "Sprząta za plecami obrońców i rozpoczyna ataki; nieco mniej pewny na linii.",
    },
    stopper: {
      label: "Stoper",
      blurb: "Wygrywa pojedynki i wybija głową, ale mało wnosi do budowania akcji.",
    },
    "ball-playing-defender": {
      label: "Obrońca rozgrywający",
      blurb: "Rozpoczyna akcje od tyłu; nieco słabszy w odbiorze.",
    },
    "defensive-full-back": {
      label: "Defensywny boczny obrońca",
      blurb: "Zostaje z tyłu, odbiera piłkę i zabezpiecza skrzydło.",
    },
    "attacking-full-back": {
      label: "Ofensywny boczny obrońca",
      blurb:
        "Wyprzedza skrzydłowego, dośrodkowuje i wchodzi w pole karne; zostawia przestrzeń za plecami.",
    },
    "ball-winner": {
      label: "Odbiorca piłki",
      blurb: "Przerywa akcje przed obroną i przy okazji fauluje.",
    },
    "deep-playmaker": {
      label: "Cofnięty rozgrywający",
      blurb: "Dyryguje grą z głębi pola długimi podaniami.",
    },
    "box-to-box": {
      label: "Pomocnik box-to-box",
      blurb: "Przebiega każdy metr murawy i późno pojawia się w polu karnym.",
    },
    playmaker: {
      label: "Rozgrywający",
      blurb: "Nadaje tempo i znajduje zabójcze podanie.",
    },
    creator: {
      label: "Kreator",
      blurb: "Gra między liniami; więcej asyst niż goli.",
    },
    "shadow-striker": {
      label: "Cień napastnika",
      blurb: "Wbiega za plecy napastnika i sam strzela gole.",
    },
    winger: {
      label: "Skrzydłowy",
      blurb: "Trzyma się linii bocznej i dośrodkowuje.",
    },
    "inside-forward": {
      label: "Wewnętrzny skrzydłowy",
      blurb: "Schodzi ze skrzydła do środka, by strzelać.",
    },
    "target-man": {
      label: "Wieża",
      blurb:
        "Wygrywa piłki głową i przytrzymuje futbolówkę; nie jest najskuteczniejszym egzekutorem.",
    },
    poacher: {
      label: "Lis pola karnego",
      blurb: "Żyje w polu karnym i wykańcza to, co do niego trafi; niewiele więcej.",
    },
    "complete-forward": {
      label: "Napastnik kompletny",
      blurb: "Strzela, łączy grę i kreuje.",
    },
  },
  rule: {
    "behind-high-line": "Piłki za wysoką linię obrony",
    "counter-into-deep-block": "Nie ma jak kontrować przeciw głębokiej obronie",
    "width-into-back-five": "Szerokość się marnuje przeciw pięciu obrońcom",
    "width-into-open-flanks": "Szerokość przeciw płaskiej czwórce z odkrytymi skrzydłami",
    "patience-into-press": "Cierpliwe budowanie gry przeciw wysokiemu pressingowi",
    "direct-past-press": "Gra bezpośrednia ponad wysokim pressingiem",
    "lone-striker-into-back-three": "Samotny napastnik przeciw trzem stoperom",
    "two-strikers-into-flat-four": "Dwóch napastników przeciw płaskiej czwórce",
    "midfield-numbers": "Więcej zawodników w środku pola",
    "midfield-outnumbered": "Przewaga rywala w środku pola",
    "press-patient-side": "Wysoki pressing przeciw cierpliwie grającej drużynie",
    "narrow-into-wide": "Wąsko grająca drużyna zagęszcza środek przeciw szeroko grającej",
  },
  badge: {
    "big-game": {
      label: "Zawodnik wielkich meczów",
      text: "W finałach i meczach decydujących gra ponad swój poziom i zachowuje zimną krew przy rzutach karnych.",
    },
    reliable: {
      label: "Niezawodny",
      text: "Prawie w każdym meczu gra na swoim poziomie.",
    },
    erratic: {
      label: "Nierówny",
      text: "Oceny za mecze mocno się wahają; jednego dnia znakomity, następnego słaby.",
    },
    "injury-prone": {
      label: "Podatny na kontuzje",
      text: "Częściej doznaje urazów w meczu.",
    },
    "tires-early": {
      label: "Szybko się męczy",
      text: "Traci siły szybciej niż młodszy zawodnik.",
    },
  },
  bond: {
    clubmates: "Koledzy z klubu",
    friends: "Przyjaciele",
    feud: "Konflikt",
  },
  spirit: {
    tight: "Zżyta",
    good: "Dobra",
    neutral: "Neutralna",
    uneasy: "Niespokojna",
    divided: "Podzielona",
  },
  scout: {
    trait: {
      attack: "Nastawiona na atak",
      cautious: "Ostrożna",
      highLine: "Wysoka linia",
      deepLine: "Głęboka linia",
      wide: "Gra szeroko",
      narrow: "Gra wąsko",
      counter: "Gra z kontry",
      highPress: "Wysoki pressing",
      dropsOff: "Cofa się",
      direct: "Bezpośrednia",
      patient: "Cierpliwa",
      balanced: "Wyważona",
    },
    reason: {
      star: "Ich najlepszy zawodnik",
      threat: "Ich główne zagrożenie strzeleckie",
      creator: "Kreuje większość ich okazji",
      weak: "Najsłabsze ogniwo",
    },
    level: {
      "0": "Głęboka",
      "1": "Standardowa",
      "2": "Wysoka",
    },
    width: {
      "0": "Wąsko",
      "1": "Standardowo",
      "2": "Szeroko",
    },
    change: {
      line: "Linia obrony: {from} → {to}",
      width: "Szerokość: {from} → {to}",
      counter: "Kontratak: {from} → {to}",
    },
    on: "wł.",
    off: "wył.",
  },
}

export default engine
