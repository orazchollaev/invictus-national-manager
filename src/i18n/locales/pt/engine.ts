import type en from "../en/engine"

const engine: typeof en = {
  obj: {
    qualify: "Classificar-se: {comp}",
    unbeaten: "{text} sem perder",
    promotion: "Conquistar o acesso da Liga {letter}",
    relegation: "Evitar o rebaixamento da Liga {letter}",
    win: "Ser campeão: {comp}",
    reach: {
      knockout: "Chegar à fase eliminatória: {comp}",
      "quarter-finals": "Chegar às quartas de final: {comp}",
      "semi-finals": "Chegar às semifinais: {comp}",
      final: "Chegar à final: {comp}",
    },
    debuts: "Dar estreias pela seleção a {count} jogadores de até 21 anos em {year}",
    raiseNote:
      "Recompensas ×{reward}; ficar aquém custa {cost} de confiança, e a meta original volta a valer",
    lowerNote: "Custa {cost} de confiança agora; recompensas pela metade",
    lowerNeeds: "A diretoria só ouve com confiança de {n}% ou mais",
  },
  news: {
    raise: {
      title: "Você eleva a barra",
      body: 'Você prometeu mais à federação: "{text}". Cumpra, e eles não esquecerão.',
    },
    lower: {
      title: "Expectativas reduzidas",
      body: 'A federação aceitou, a contragosto, uma meta menor: "{text}".',
    },
    broken: {
      title: "Promessa quebrada",
      body: 'Você prometeu "{promised}" e ficou aquém. A federação ainda espera que você cumpra: "{target}".',
    },
    met: {
      title: "Objetivo alcançado",
      body: 'A federação está encantada: "{text}" — cumprido. O apoio extra chegará também às categorias de base.',
    },
    missed: {
      title: "Objetivo não cumprido",
      body: 'A federação está insatisfeita: não conseguimos cumprir: "{text}".',
    },
    friendly: "um amistoso",
    riot: {
      title: "{us} atropela {them}",
      body: "Vitória por {score} sobre {them} em {comp}. Os torcedores vão lembrar deste jogo.",
    },
    shock: {
      title: "Vitória surpreendente sobre {them}",
      body: "Poucos nos davam chance, mas vencemos {them} por {score} em {comp}.",
    },
    humiliation: {
      title: "Humilhação contra {them}",
      body: "Derrota por {score} para {them} em {comp}. O técnico está sendo questionado.",
    },
    embarrassing: {
      title: "Derrota vexatória para {them}",
      body: "Esperava-se uma vitória, mas perdemos por {score} para {them} em {comp}.",
    },
    cap: {
      title: "{name} chega à marca de {caps} jogos",
      body: "{name} já atuou {caps} vezes por {nation}.",
    },
    goals: {
      title: "{name} chega a {goals} gols pela seleção",
      body: "{name} já marcou {goals} gols por {nation}.",
    },
    debut: {
      title: "Primeiro jogo de {name} pela seleção",
      body: "Estreando pela seleção contra {opp}: {names}.",
    },
    debuts: {
      title: "{n} estreias",
    },
    milestone: "Marco alcançado",
    ultimatum: {
      title: "Último aviso",
      body: "A federação perdeu a paciência. Eleve a confiança a {lifted}% em {matches} partidas oficiais, ou você será substituído.",
    },
    eases: {
      title: "A pressão diminui",
      body: "Os resultados melhoraram. A federação retirou o último aviso.",
    },
    sacked: {
      title: "Demitido",
      body: "A federação de {nation} dispensou você do cargo.",
    },
    notRenewed: {
      title: "Contrato não renovado",
      body: "A federação de {nation} decidiu não renovar o seu contrato.",
    },
    renewed: {
      title: "Contrato renovado",
      body: "A federação de {nation} renovou o seu contrato até {date}.",
    },
    extended: {
      title: "Mais um ano",
      body: "A federação de {nation} prorrogou o seu contrato por um único ano. Eles querem ver evolução.",
    },
    coachChange: {
      title: "{nation} muda de técnico",
      body: "{nation} nomeou {coach} como novo técnico.",
    },
    offer: {
      title: "Oferta de emprego: {nation}",
      body: "A federação de {nation} gostaria de você como novo técnico. A oferta vale até {date}.",
    },
    newJob: {
      title: "Novo emprego: {nation}",
      body: "Você é o novo técnico de {nation}.",
    },
    tourney: {
      through: "{comp}: classificado",
      throughTo: "Avançamos para: {round}.",
      throughBare: "Estamos classificados.",
      out: "{comp}: eliminado",
      groupOut: "Terminamos o {group} sem nos classificar.",
      knockedOut: "Fomos eliminados: {round}.",
      runnersUp: "{comp}: vice-campeão",
      lostFinal: "Perdemos a final.",
    },
    qualified: {
      title: "Classificado: {finals}",
      body: "Conquistamos uma vaga: {finals}.",
    },
    playoff: {
      title: "Na repescagem",
      body: "Chegamos à repescagem intercontinental: {finals}.",
    },
    missedOut: {
      title: "Não nos classificamos",
      body: "Ficamos fora: {finals}.",
    },
    finalsGeneric: "a fase final",
    injury: {
      title: "{name} lesionado",
      body: "{name} sofreu uma lesão ({injury}) no clube e ficará fora até {date}.",
    },
    newClub: "um novo clube",
    bigMove: {
      title: "{name} ganha uma grande transferência",
      body: "{name} se junta ao {club} depois de sua explosão pela seleção.",
    },
    move: {
      title: "{name} muda de clube",
      body: "{name} se junta ao {club}.",
    },
    prospects: {
      title: "Suas promessas nesta temporada",
      body: "Como evoluíram os jovens que você acompanha: {list}.",
    },
    season: {
      title: "Começa a temporada {from}–{to}",
      body: "Os jogadores evoluíram na última temporada e a janela de transferências de verão fechou.",
    },
    retired: {
      entry: "{name} ({pos}, {age})",
      entryCaps: "{name} ({pos}, {age}, {caps} jogos)",
    },
    retire: {
      title: "{name} deixa a seleção",
      body: "{name} ({age} anos, {caps} jogos) anunciou a aposentadoria da seleção.",
    },
    wonderkid: {
      title: "Surge um fenômeno: {name}",
      body: "Os olheiros estão encantados com {name}, {pos} de {age} anos no {club}.",
    },
    newgen: {
      entry: "{name} ({pos}, {age}, {club})",
    },
    retiredMany: {
      title: "{n} jogadores se aposentam",
      body: "Estes jogadores penduraram as chuteiras: {list}.",
    },
    newgens: {
      title: "{n} jovens surgem",
      body: "A nova geração elegível para nós: {list}.",
    },
    stadium: {
      build: {
        title: "Começam as obras do {stadium}",
        body: "A federação está construindo um estádio de {seats} lugares em {city}, com abertura prevista para {date}.",
      },
      expand: {
        title: "{stadium} será ampliado",
        body: "O {stadium} em {city} terá {seats} lugares quando a obra terminar, em {date}.",
      },
      opened: {
        build: "{nation} inaugura o {stadium}",
        expand: "{stadium} ampliado",
        body: "O {stadium} em {city} agora comporta {seats}{ready}.",
      },
      readyFor: ", pronto para {comp}",
    },
    champions: {
      title: "{winner} vence {comp}",
      body: "{winner} conquista o título{beat}.",
      beat: ", vencendo {runnerUp} na final",
    },
    draw: {
      title: "{comp}: {stage}",
      group: "O sorteio foi realizado. Enfrentaremos {others}.",
      tie: "Fomos sorteados contra {opp}.",
    },
    and: "{a} e {b}",
    host: {
      title: "{list} vai sediar {comp}",
      one: "{list} sediará {comp}, com início em {date}.",
      many: "{list} cosediarão {comp}, com início em {date}.",
    },
    placeholder: {
      title: "{team} garante a vaga",
      body: "{team} vence a disputa ({label}) e ocupa essa vaga no sorteio.",
    },
  },
  ms: {
    trophy: "Seu primeiro troféu: {comp}.",
    world: "Campeões do mundo! {nation} vence a {comp}.",
    continental: "Campeões do seu continente: {comp}.",
    qualification: "Você levou {nation} a um grande torneio.",
    worldCup: "Você levou {nation} a uma Copa do Mundo.",
    firstWin: "Sua primeira vitória como técnico de seleção.",
    matches: "{n} partidas como técnico de seleção.",
    debuts: "{n} jogadores ganharam a primeira convocação sob o seu comando.",
    youthDebuts: "Cinco jogadores de até 21 anos estrearam na seleção.",
    unbeaten: "Dez partidas oficiais sem perder.",
    top10: "{nation} está entre as dez melhores do ranking da FIFA sob o seu comando.",
    no1: "{nation} é a melhor seleção do mundo.",
  },
  review: {
    reached: {
      champions: "Campeão",
      knockedOut: "Eliminado",
      qualified: "Classificado",
      notQualified: "Não se classificou",
      leagueStage: "Fase de liga",
      promoted: "Promovido para a Liga {letter}",
      relegated: "Rebaixado para a Liga {letter}",
      stayed: "Permaneceu na Liga {letter}",
      runnersUp: "Vice-campeão",
      groups: "Fase de grupos",
    },
    msg: {
      delightedChampion:
        "A federação está encantada. Vencer {comp} está além do que qualquer um ousava esperar, e o seu prestígio nunca foi tão alto.",
      delighted:
        "A federação está encantada com o desempenho em {comp}. Você deu a eles mais do que pediram.",
      satisfied:
        "A federação está satisfeita com o desempenho em {comp}. O trabalho foi feito; agora esperam que você construa sobre ele.",
      disappointed:
        "A federação está decepcionada com o desempenho em {comp}. Esperava mais, e a paciência dela não é infinita.",
      ultimatum:
        "Depois de {comp}, a federação perdeu a paciência. Os resultados precisam melhorar já, ou ela encontrará alguém que os entregue.",
      sacked: "{comp} foi a gota d'água. A federação decidiu dispensar você do cargo.",
      contractEnd: "{comp} marca o fim do seu contrato, e a federação decidiu não renová-lo.",
    },
  },
  fx: {
    friendly: "Amistoso internacional",
    window: "Data internacional",
    matchday: "{stage} · Rodada {n}",
    groupMatchday: "{stage} · {group} · Rodada {n}",
    round: "{round}",
    stageRound: "{stage} · {round}",
    roundLeg: "{round} · Jogo {leg}",
    stageRoundLeg: "{stage} · {round} · Jogo {leg}",
  },
  lineup: {
    nobody: "Ninguém está jogando de {pos}",
    notInSquad: "{name} ({pos}) não está no elenco",
    injured: "{name} ({pos}) está lesionado ({label})",
    suspended: "{name} ({pos}) está suspenso",
  },
  placeholder: {
    uefa: "Chave {path} da repescagem da UEFA",
    path: "Chave {path} da repescagem",
    tournament: "Torneio de repescagem",
    qualifier: "Classificado {n}",
    winner: "Vencedor: {base}",
    tournamentWinner: "Vencedor do torneio de repescagem {n}",
    shortIc: "IC {n}",
    shortPo: "RP {path}",
  },
  injury: {
    "hamstring-strain": "Estiramento no posterior da coxa",
    "ankle-sprain": "Entorse no tornozelo",
    "calf-strain": "Estiramento na panturrilha",
    "groin-strain": "Estiramento na virilha",
    "thigh-strain": "Estiramento na coxa",
    "knee-injury": "Lesão no joelho",
    "broken-foot": "Fratura no pé",
    "cruciate-ligament-rupture": "Rompimento do ligamento cruzado",
    knock: "Pancada",
  },
  stage: {
    group: "Grupo {name}",
    league: "Liga",
    leagueN: "Liga {x}",
    roundOf: "Fase de {n}",
    "round-of-16": "Oitavas de final",
    "round-of-32": "16 avos de final",
    "quarter-finals": "Quartas de final",
    "semi-finals": "Semifinais",
    final: "Final",
    finals: "Fase final",
    "third-place": "Terceiro lugar",
    "group-stage": "Fase de grupos",
    "knockout-stage": "Fase eliminatória",
    "league-phase": "Fase de liga",
    qualifying: "Eliminatórias",
    "preliminary-round": "Fase preliminar",
    prelims: "Preliminares",
    "first-round": "Primeira fase",
    "second-round": "Segunda fase",
    "third-round": "Terceira fase",
    "fourth-round": "Quarta fase",
    "fifth-round": "Quinta fase",
    "final-round": "Fase final",
    "play-offs": "Repescagem",
    "play-in": "Play-In",
    "play-off-round": "Fase de repescagem",
    "play-off-semi-finals": "Semifinais da repescagem",
    "play-off-finals": "Finais da repescagem",
    "play-off-final": "Final da repescagem",
    "play-off-tournament": "Torneio de repescagem",
    "promotion-relegation-play-offs": "Repescagens de acesso e rebaixamento",
    "league-a-quarter-finals": "Quartas de final da Liga A",
    "league-a-finals": "Finais da Liga A",
    "league-b-finals": "Finais da Liga B",
    "league-c-finals": "Finais da Liga C",
  },
  comp: {
    wc: {
      name: "Copa do Mundo da FIFA {year}",
      short: "Copa do Mundo",
      plain: "Copa do Mundo da FIFA",
    },
    "wcq-uefa": {
      name: "Eliminatórias da Copa {year} · UEFA",
      short: "Elim. Europa",
      plain: "Eliminatórias da Copa · UEFA",
    },
    "wcq-caf": {
      name: "Eliminatórias da Copa {year} · CAF",
      short: "Elim. África",
      plain: "Eliminatórias da Copa · CAF",
    },
    "wcq-afc": {
      name: "Eliminatórias da Copa {year} · AFC",
      short: "Elim. Ásia",
      plain: "Eliminatórias da Copa · AFC",
    },
    "wcq-concacaf": {
      name: "Eliminatórias da Copa {year} · CONCACAF",
      short: "Elim. CONCACAF",
      plain: "Eliminatórias da Copa · CONCACAF",
    },
    "wcq-conmebol": {
      name: "Eliminatórias da Copa {year} · CONMEBOL",
      short: "Elim. América do Sul",
      plain: "Eliminatórias da Copa · CONMEBOL",
    },
    "wcq-ofc": {
      name: "Eliminatórias da Copa {year} · OFC",
      short: "Elim. Oceania",
      plain: "Eliminatórias da Copa · OFC",
    },
    "wcq-ic": {
      name: "Torneio de repescagem da Copa {year}",
      short: "Repescagem",
      plain: "Torneio de repescagem da Copa",
    },
    euro: {
      name: "Eurocopa {year} da UEFA",
      short: "Eurocopa",
      plain: "Eurocopa da UEFA",
    },
    euroq: {
      name: "Eliminatórias da Eurocopa {year}",
      short: "Elim. Eurocopa",
      plain: "Eliminatórias da Eurocopa",
    },
    unl: {
      name: "Liga das Nações da UEFA {year}–{year2}",
      short: "Liga das Nações",
      plain: "Liga das Nações da UEFA",
    },
    finalissima: {
      name: "Finalíssima {year}",
      short: "Finalíssima",
      plain: "Finalíssima",
    },
    afcon: {
      name: "Copa Africana de Nações {year}",
      short: "CAN",
      plain: "Copa Africana de Nações",
    },
    afconq: {
      name: "Eliminatórias da Copa Africana de Nações {year}",
      short: "Elim. CAN",
      plain: "Eliminatórias da Copa Africana de Nações",
    },
    "asian-cup": {
      name: "Copa da Ásia da AFC {year}",
      short: "Copa da Ásia",
      plain: "Copa da Ásia da AFC",
    },
    "asian-cupq": {
      name: "Eliminatórias da Copa da Ásia {year}",
      short: "Elim. Copa da Ásia",
      plain: "Eliminatórias da Copa da Ásia",
    },
    copa: {
      name: "Copa América {year}",
      short: "Copa América",
      plain: "Copa América",
    },
    "ofc-cup": {
      name: "Copa das Nações da OFC {year}",
      short: "Copa das Nações da OFC",
      plain: "Copa das Nações da OFC",
    },
    cnl: {
      name: "Liga das Nações da CONCACAF {year}–{year2}",
      short: "Liga das Nações CONCACAF",
      plain: "Liga das Nações da CONCACAF",
    },
    gcq: {
      name: "Pré-Copa Ouro da CONCACAF {year}",
      short: "Pré-Copa Ouro",
      plain: "Pré-Copa Ouro da CONCACAF",
    },
    "gold-cup": {
      name: "Copa Ouro da CONCACAF {year}",
      short: "Copa Ouro",
      plain: "Copa Ouro da CONCACAF",
    },
    "arab-cup": {
      name: "Copa Árabe da FIFA {year}",
      short: "Copa Árabe",
      plain: "Copa Árabe da FIFA",
    },
    "gulf-cup": {
      name: "Copa do Golfo Arábico {year}",
      short: "Copa do Golfo",
      plain: "Copa do Golfo Arábico",
    },
    aff: {
      name: "Campeonato da ASEAN {year}",
      short: "Campeonato da ASEAN",
      plain: "Campeonato da ASEAN",
    },
    e1: {
      name: "Campeonato E-1 da EAFF {year}",
      short: "E-1",
      plain: "Campeonato E-1 da EAFF",
    },
    cafa: {
      name: "Copa das Nações da CAFA {year}",
      short: "Copa das Nações da CAFA",
      plain: "Copa das Nações da CAFA",
    },
    waff: {
      name: "Campeonato da WAFF {year}",
      short: "Campeonato da WAFF",
      plain: "Campeonato da WAFF",
    },
    saff: {
      name: "Campeonato da SAFF {year}",
      short: "Campeonato da SAFF",
      plain: "Campeonato da SAFF",
    },
    cosafa: {
      name: "Copa COSAFA {year}",
      short: "Copa COSAFA",
      plain: "Copa COSAFA",
    },
    cecafa: {
      name: "Copa Desafio Sênior da CECAFA {year}",
      short: "Copa CECAFA",
      plain: "Copa Desafio Sênior da CECAFA",
    },
    wafu: {
      name: "Copa da Zona WAFU {year}",
      short: "Copa WAFU",
      plain: "Copa da Zona WAFU",
    },
    baltic: {
      name: "Copa Báltica {year}",
      short: "Copa Báltica",
      plain: "Copa Báltica",
    },
  },
  role: {
    stopper: {
      label: "Xerife",
      blurb: "Sai para ganhar a bola e vence tudo pelo alto; dá menos ajuda com a bola.",
    },
    "ball-playing": {
      label: "Zagueiro construtor",
      blurb: "Avança ao meio-campo com a bola; mais leve no desarme.",
    },
    cover: {
      label: "Zagueiro de cobertura",
      blurb: "Fica recuado e seguro; raramente faz falta, raramente inicia a jogada.",
    },
    "defensive-full-back": {
      label: "Lateral defensivo",
      blurb: "Segura a linha e desarma; não vai ao ataque.",
    },
    "wing-back": {
      label: "Ala",
      blurb: "Corre o corredor inteiro, cruzando e finalizando; deixa espaço atrás.",
    },
    "inverted-full-back": {
      label: "Lateral invertido",
      blurb: "Entra no meio-campo para construir; abre mão do corredor.",
    },
    anchor: {
      label: "Âncora",
      blurb: "Fica à frente da defesa; protege-a e joga simples.",
    },
    "ball-winner": {
      label: "Volante de marcação",
      blurb: "Caça a bola por todo o meio-campo e comete faltas ao fazê-lo.",
    },
    "deep-playmaker": {
      label: "Regista",
      blurb: "Comanda o jogo de trás; dá menos cobertura à defesa.",
    },
    "box-to-box": {
      label: "Box-to-box",
      blurb: "Cobre o campo todo e chega tarde na área.",
    },
    playmaker: {
      label: "Armador",
      blurb: "Dita o ritmo e acha o passe decisivo; defende menos.",
    },
    destroyer: {
      label: "Destruidor",
      blurb: "Quebra o jogo adversário e faz muitas faltas; pouco ajuda no ataque.",
    },
    "advanced-playmaker": {
      label: "Armador avançado",
      blurb: "Joga entre as linhas e cria; marca menos.",
    },
    "shadow-striker": {
      label: "Segundo atacante",
      blurb: "Corre atrás do centroavante e finaliza; cria menos.",
    },
    tracker: {
      label: "Marcador",
      blurb: "Pressiona lá na frente e volta marcando; menos ameaça.",
    },
    winger: {
      label: "Ponta",
      blurb: "Cola na linha lateral e cruza.",
    },
    "inside-forward": {
      label: "Ponta de dentro",
      blurb: "Corta para dentro para chutar; menos amplitude e menos cruzamentos.",
    },
    "tracking-winger": {
      label: "Ponta de recomposição",
      blurb: "Volta para ajudar o lateral; vai menos ao ataque.",
    },
    "target-man": {
      label: "Homem-alvo",
      blurb: "Vence os cabeceios e segura a bola; não é o finalizador mais afiado.",
    },
    poacher: {
      label: "Matador de área",
      blurb: "Espera as chances na área; não faz mais nada.",
    },
    "complete-forward": {
      label: "Atacante completo",
      blurb: "Marca, combina e cria.",
    },
    "pressing-forward": {
      label: "Atacante de pressão",
      blurb: "Pressiona os zagueiros lá na frente; menos ameaça na área.",
    },
  },
  arch: {
    "shot-stopper": {
      label: "Goleiro de reflexos",
      blurb: "Comanda a linha e defende o que não devia.",
    },
    "sweeper-keeper": {
      label: "Goleiro-líbero",
      blurb: "Varre atrás da defesa e inicia ataques; um pouco menos seguro na linha.",
    },
    stopper: {
      label: "Xerife",
      blurb: "Vence duelos e afasta de cabeça, mas pouco ajuda na construção.",
    },
    "ball-playing-defender": {
      label: "Zagueiro construtor",
      blurb: "Inicia jogadas lá de trás; um pouco mais leve no desarme.",
    },
    "defensive-full-back": {
      label: "Lateral defensivo",
      blurb: "Fica atrás, desarma e cobre o corredor.",
    },
    "attacking-full-back": {
      label: "Lateral ofensivo",
      blurb: "Apoia, cruza e chega à área; deixa espaço atrás.",
    },
    "ball-winner": {
      label: "Volante de marcação",
      blurb: "Quebra o jogo diante da defesa e comete faltas ao fazê-lo.",
    },
    "deep-playmaker": {
      label: "Regista",
      blurb: "Dita o jogo de trás com passes longos.",
    },
    "box-to-box": {
      label: "Box-to-box",
      blurb: "Cobre cada pedaço do gramado e chega tarde na área.",
    },
    playmaker: {
      label: "Armador",
      blurb: "Dita o ritmo e acha o passe decisivo.",
    },
    creator: {
      label: "Criador",
      blurb: "Joga entre as linhas; mais assistências do que gols.",
    },
    "shadow-striker": {
      label: "Segundo atacante",
      blurb: "Corre atrás do centroavante e marca ele mesmo.",
    },
    winger: {
      label: "Ponta",
      blurb: "Cola na linha lateral e cruza.",
    },
    "inside-forward": {
      label: "Ponta de dentro",
      blurb: "Corta da ponta para chutar.",
    },
    "target-man": {
      label: "Homem-alvo",
      blurb: "Vence os cabeceios e segura a bola; não é o finalizador mais afiado.",
    },
    poacher: {
      label: "Matador de área",
      blurb: "Vive na área e finaliza o que sobra; pouco mais.",
    },
    "complete-forward": {
      label: "Atacante completo",
      blurb: "Marca, combina e cria.",
    },
  },
  rule: {
    "behind-high-line": "Bolas nas costas de uma linha alta",
    "counter-into-deep-block": "Sem espaço para contra-atacar contra um bloco baixo",
    "width-into-back-five": "A amplitude se perde contra uma linha de cinco",
    "width-into-open-flanks": "Amplitude contra uma linha de quatro com corredores abertos",
    "patience-into-press": "Construção paciente contra uma pressão alta",
    "direct-past-press": "Jogo direto para passar a pressão alta",
    "lone-striker-into-back-three": "Um centroavante sozinho contra três zagueiros",
    "two-strikers-into-flat-four": "Dois atacantes contra uma linha de quatro",
    "midfield-numbers": "Mais jogadores pelo meio",
    "midfield-outnumbered": "Em inferioridade numérica pelo meio",
    "press-patient-side": "Pressão alta contra um time paciente",
    "narrow-into-wide": "Um time fechado lota o meio contra um time aberto",
  },
  badge: {
    "big-game": {
      label: "Jogador de jogos grandes",
      text: "Joga acima do seu nível em finais e decisões, e mantém a frieza na marca do pênalti.",
    },
    reliable: {
      label: "Confiável",
      text: "Rende no seu nível quase toda partida.",
    },
    erratic: {
      label: "Irregular",
      text: "As notas oscilam; brilhante num dia, fraco no outro.",
    },
    "injury-prone": {
      label: "Propenso a lesões",
      text: "Mais sujeito a se machucar numa partida.",
    },
    "tires-early": {
      label: "Cansa cedo",
      text: "Perde o fôlego antes que um jogador mais jovem.",
    },
  },
  bond: {
    clubmates: "Companheiros de clube",
    friends: "Amigos",
    feud: "Rivalidade",
  },
  spirit: {
    tight: "Muito unido",
    good: "Bom",
    neutral: "Neutro",
    uneasy: "Tenso",
    divided: "Dividido",
  },
  scout: {
    trait: {
      attack: "Ofensivo",
      cautious: "Cauteloso",
      highLine: "Linha alta",
      deepLine: "Linha recuada",
      wide: "Joga aberto",
      narrow: "Joga fechado",
      counter: "Contra-ataque",
      highPress: "Pressão alta",
      dropsOff: "Recua",
      direct: "Direto",
      patient: "Paciente",
      balanced: "Equilibrado",
    },
    reason: {
      star: "O melhor jogador deles",
      threat: "A maior ameaça de gol deles",
      creator: "Cria a maior parte das chances",
      weak: "O elo fraco",
    },
    level: {
      "0": "Recuada",
      "1": "Padrão",
      "2": "Alta",
    },
    width: {
      "0": "Estreita",
      "1": "Padrão",
      "2": "Aberta",
    },
    change: {
      line: "Linha defensiva: {from} → {to}",
      width: "Amplitude: {from} → {to}",
      counter: "Contra-ataque: {from} → {to}",
    },
    on: "ligado",
    off: "desligado",
  },
}

export default engine
