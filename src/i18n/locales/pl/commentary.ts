import type { CommentaryText } from "@/engine/match/commentary"

/** Live commentary in Polish; same placeholders as the English set. */
const commentary: CommentaryText = {
  assist: " Asysta: {a}.",
  forward: "do przodu",
  lane: {
    left: "lewą stroną",
    centre: "środkiem",
    right: "prawą stroną",
  },
  shots: {
    long: {
      goal: [
        "GOL! {p} uderza z dystansu i piłka wpada do siatki!{assist}",
        "GOL! Bomba {p} zza pola karnego!{assist}",
      ],
      "shot-saved": [
        "{p} próbuje szczęścia z daleka — {o} łapie piłkę.",
        "Uderzenie z dystansu {p}, pewnie w rękach {o}.",
      ],
      "shot-wide": [
        "{p} strzela z dystansu. Niecelnie.",
        "{p} próbuje zza pola karnego — nad poprzeczką.",
      ],
      "shot-blocked": ["Strzał z dystansu {p} zablokowany przez {o}."],
      woodwork: ["{p} trafia w obramowanie bramki z dużej odległości!"],
    },
    close: {
      goal: [
        "GOL! {p} dobija piłkę do siatki z bliska!{assist}",
        "GOL! {p} wpycha do bramki wycofaną piłkę!{assist}",
      ],
      "shot-saved": ["{o} cudem broni strzał {p} z najbliższej odległości!"],
      "big-chance-missed": [
        "{p} niewiarygodnie pudłuje z pięciu metrów!",
        "Piłka leży jak na tacy dla {p}... a ten posyła ją obok bramki!",
      ],
    },
    header: {
      goal: [
        "GOL! {p} wyskakuje najwyżej i głową umieszcza piłkę w siatce!{assist}",
        "GOL! Potężne uderzenie głową {p}!{assist}",
      ],
      "shot-saved": ["{p} uderza głową, ale {o} broni.", "Główka {p} — prosto w {o}."],
      "shot-wide": [
        "{p} uderza głową ponad poprzeczką.",
        "{p} dochodzi do dośrodkowania, ale główka mija bramkę.",
      ],
      woodwork: ["Główka {p} huczy o poprzeczkę!"],
      "big-chance-missed": ["{p} uderza głową zupełnie niepilnowany i pudłuje!"],
    },
    "one-on-one": {
      goal: [
        "GOL! {p} mija bramkarza i trafia do pustej bramki!{assist}",
        "GOL! {p} zachowuje zimną krew sam na sam i przelicza bramkarza!{assist}",
      ],
      "shot-saved": [
        "{p} wychodzi sam na sam... {o} zamyka kąt i broni!",
        "Co za interwencja {o}! Wygrywa pojedynek sam na sam z {p}.",
      ],
      "big-chance-missed": [
        "{p} wychodzi sam na sam... i strzela obok bramki! Co za pudło!",
        "{p} staje oko w oko z bramkarzem i uderza tuż obok słupka!",
      ],
    },
    "free-kick": {
      goal: ["GOL! {p} wkłada rzut wolny w okienko!", "GOL! Co za rzut wolny w wykonaniu {p}!"],
      "shot-saved": [
        "{p} uderza z rzutu wolnego wprost — {o} odbija na rzut rożny!",
        "Rzut wolny {p} wyłapany przez {o}.",
      ],
      "shot-wide": [
        "Rzut wolny {p} przelatuje nad poprzeczką.",
        "{p} strzela z rzutu wolnego z podkręceniem, tuż obok słupka.",
      ],
      "shot-blocked": ["Strzał {p} z rzutu wolnego odbija się od muru."],
      woodwork: ["Rzut wolny {p} trafia w słupek!"],
    },
    rebound: {
      goal: [
        "GOL! {p} wykorzystuje dobitkę!",
        "GOL! Bramkarz odbija piłkę przed siebie, a {p} jest pierwszy przy niej!",
      ],
      "shot-saved": ["{p} dobija, ale {o} znów broni!"],
      "shot-wide": ["{p} spieszy się przy dobitce i strzela obok."],
    },
  },
  moves: {
    counter: { before: "Kontratak! ", after: " Błyskawiczna kontra." },
    press: {
      before: "Odbiór piłki wysoko! ",
      after: " Rywal zapłacił za stratę.",
    },
  },
  lines: {
    kickoff: [
      "Zaczynamy mecz!",
      "Sędzia gwiżdże i {team:home} rozpoczyna grę.",
      "Piłka w grze. Do dzieła.",
    ],
    "half-time": [
      "Sędzia kończy pierwszą połowę.",
      "To koniec pierwszej połowy.",
      "Przerwa. Zawodnicy schodzą do szatni.",
    ],
    "second-half": [
      "Zaczyna się druga połowa.",
      "Piłka w grze na ostatnie czterdzieści pięć minut.",
    ],
    "full-time": ["Sędzia kończy mecz!", "Po wszystkim!", "Koniec spotkania."],
    "et-start": [
      "Zaczyna się dogrywka. Kolejne trzydzieści minut, by rozstrzygnąć mecz.",
      "Oto dogrywka.",
    ],
    "et-half-time": ["Przerwa w dogrywce. Zostało piętnaście minut."],
    "et-second-half": ["Zaczyna się ostatnie piętnaście minut dogrywki."],
    "et-end": [
      "Nic nie dzieli obu drużyn. Będą rzuty karne!",
      "Dogrywka nie rozstrzygnęła — decydują karne.",
    ],
    attack: [
      "{p} przedziera się z piłką dla {team} {lane}, ale wkracza {o}.",
      "{team} rozgrywa akcję {lane}, lecz ostatnie podanie przecina {o}.",
      "{p} szuka luki. {o} dobrze czyta grę.",
      "Cierpliwe budowanie akcji {team}, ale ostatnie podanie nie wychodzi.",
      "{p} próbuje prostopadłego podania — przechwytuje je {o}.",
    ],
    goal: [
      "GOL! {p} trafia do siatki dla {team}!{assist}",
      "GOL! {p} nie wybacza!{assist}",
      "GOL! Co za wykończenie w wykonaniu {p}!{assist}",
      "GOL! {p} umieszcza piłkę w bramce dla {team}!{assist}",
      "GOL! {p} pojawia się w odpowiednim miejscu i wpycha piłkę do siatki!{assist}",
    ],
    "own-goal": [
      "SAMOBÓJ! {p} kieruje piłkę do własnej bramki. To katastrofa.",
      "SAMOBÓJ! {p} jedynie przelobowuje własnego bramkarza.",
    ],
    "penalty-awarded": [
      "RZUT KARNY! {o} przewraca {p} w polu karnym!",
      "Sędzia wskazuje na jedenasty metr! {p} faulowany przez {o}.",
    ],
    "pen-goal": [
      "GOL! {p} posyła bramkarza w przeciwny róg z jedenastu metrów!",
      "GOL! {p} pewnie wykorzystuje rzut karny!",
    ],
    "pen-saved": [
      "OBRONIONE! {o} wyczuwa róg i broni rzut karny {p}!",
      "Rzut karny {p} wyłapany przez {o}!",
    ],
    "pen-miss": [
      "{p} posyła rzut karny nad poprzeczką!",
      "{p} strzela obok bramki z rzutu karnego! Ogromna ulga.",
    ],
    "shot-saved": [
      "{p} sprawdza bramkarza — {o} broni.",
      "Dobry strzał {p}, ale {o} świetnie interweniuje.",
      "{p} uderza na bramkę. Spokojna interwencja {o}.",
      "Wielka obrona {o}, która odbiera gola {p}!",
    ],
    "shot-wide": [
      "{p} strzela z daleka. Niecelnie.",
      "{p} uderza, ale piłka leci nad poprzeczką.",
      "{p} nie trafia czysto w piłkę i okazja przepada.",
      "{p} uderza technicznie, ale piłka mija słupek.",
    ],
    "shot-blocked": [
      "{p} strzela — zablokowane przez {o}!",
      "Strzał {p} zostaje zablokowany.",
      "Odważny blok {o}, który zatrzymuje {p}.",
    ],
    woodwork: [
      "{p} trafia w słupek!",
      "W poprzeczkę! {p} był o krok od gola!",
      "{p} sprawdza wytrzymałość słupka!",
    ],
    "big-chance-missed": [
      "Co za okazja! {p} powinien strzelić, ale pudłuje!",
      "{p} jest niepilnowany przed bramką... i marnuje! Niewiarygodne.",
      "{p} miał przed sobą już tylko bramkarza i marnuje szansę!",
    ],
    corner: [
      "Rzut rożny dla {team}.",
      "{team} wywalcza rzut rożny.",
      "Piłka po rykoszecie na aut: rożny dla {team}.",
    ],
    "free-kick": [
      "Rzut wolny dla {team} w groźnym miejscu.",
      "{p} zostaje faulowany. Rzut wolny, i to w zasięgu bramki.",
    ],
    foul: [
      "Faul {p} na {o}.",
      "{p} wchodzi w {o} od tyłu. Faul.",
      "{p} uderza {o}. Sędzia przerywa grę.",
    ],
    yellow: [
      "Żółta kartka dla {p}.",
      "{p} trafia do notesu sędziego.",
      "Sędzia pokazuje żółtą kartkę {p}.",
    ],
    "second-yellow": [
      "Druga żółta kartka dla {p}! Czerwona kartka!",
      "{p} dostaje drugą żółtą kartkę i musi opuścić boisko!",
    ],
    red: [
      "CZERWONA KARTKA! {p} wylatuje z boiska!",
      "Bezpośrednia czerwona kartka dla {p}! {team} gra w dziesiątkę.",
    ],
    offside: [
      "{p} na spalonym.",
      "Chorąży podnosi chorągiewkę przeciw {p}.",
      "{p} wystartował za wcześnie. Spalony.",
    ],
    injury: [
      "{p} leży na murawie i potrzebuje pomocy medycznej.",
      "Powód do niepokoju dla {team}: {p} doznaje urazu.",
      "{p} zatrzymuje się, łapiąc się za nogę.",
    ],
    sub: [
      "Zmiana w {team}: {p} wchodzi za {o}.",
      "{team} dokonuje zmiany. Schodzi {o}, wchodzi {p}.",
    ],
    tactics: ["{team} zmienia sposób gry.", "Ławka {team} wprowadza korekty."],
    "shootout-goal": ["{p} trafia.", "{p} wykorzystuje.", "{p} — w okienko!"],
    "shootout-miss": ["{p} pudłuje!", "Rzut karny {p} obroniony!", "{p} strzela nad poprzeczką!"],
    "shootout-end": ["{team} wygrywa konkurs rzutów karnych!", "To {team} zachowuje zimną krew!"],
  },
}

export default commentary
