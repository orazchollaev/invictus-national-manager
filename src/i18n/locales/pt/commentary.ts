import type { CommentaryText } from "@/engine/match/commentary"

/** Live commentary in Portuguese; same placeholders as the English set. */
const commentary: CommentaryText = {
  assist: " Assistência de {a}.",
  forward: "para a frente",
  lane: {
    left: "pela esquerda",
    centre: "pelo meio",
    right: "pela direita",
  },
  lines: {
    kickoff: [
      "Começa o jogo!",
      "O árbitro apita e {team:home} dá a saída.",
      "Bola rolando. Vamos lá.",
    ],
    "half-time": [
      "O árbitro apita o fim do primeiro tempo.",
      "Termina a primeira etapa.",
      "Intervalo. Os jogadores vão para o vestiário.",
    ],
    "second-half": [
      "Começa o segundo tempo.",
      "Bola rolando para os últimos quarenta e cinco minutos.",
    ],
    "full-time": ["O árbitro apita o fim de jogo!", "Acabou!", "Fim de jogo."],
    "et-start": [
      "Começa a prorrogação. Mais trinta minutos para decidir.",
      "Aí vem a prorrogação.",
    ],
    "et-half-time": ["Intervalo da prorrogação. Faltam quinze minutos."],
    "et-second-half": ["Começam os quinze minutos finais da prorrogação."],
    "et-end": [
      "Nada separa as equipes. Vai para os pênaltis!",
      "A prorrogação não decidiu — será nos pênaltis.",
    ],
    attack: [
      "{p} avança com a bola para {team} {lane}, mas {o} aparece.",
      "{team} trabalha a jogada {lane}, mas o passe final é cortado por {o}.",
      "{p} procura espaço. {o} lê bem a jogada.",
      "Construção paciente de {team}, mas o passe final sai errado.",
      "{p} tenta um passe enfiado — interceptado por {o}.",
    ],
    goal: [
      "GOL! {p} balança a rede para {team}!{assist}",
      "GOL! {p} não perdoa!{assist}",
      "GOL! Que finalização de {p}!{assist}",
      "GOL! {p} guarda para {team}!{assist}",
      "GOL! {p} aparece para empurrar para dentro!{assist}",
    ],
    "own-goal": [
      "GOL CONTRA! {p} manda para a própria rede. Um desastre para ele.",
      "GOL CONTRA! {p} só consegue desviar por cima do próprio goleiro.",
    ],
    "penalty-awarded": [
      "PÊNALTI! {o} derruba {p} dentro da área!",
      "O árbitro aponta para a marca! {p} é derrubado por {o}.",
    ],
    "pen-goal": [
      "GOL! {p} manda o goleiro para o outro lado na cobrança!",
      "GOL! {p} converte o pênalti!",
    ],
    "pen-saved": [
      "DEFENDEU! {o} adivinha o canto e pega o pênalti de {p}!",
      "O pênalti de {p} é defendido por {o}!",
    ],
    "pen-miss": [
      "{p} manda o pênalti por cima do travessão!",
      "{p} chuta o pênalti para fora! Um alívio enorme.",
    ],
    "shot-saved": [
      "{p} testa o goleiro — {o} defende.",
      "Bom chute de {p}, mas {o} cai bem na bola.",
      "{p} chuta a gol. Defesa tranquila de {o}.",
      "Grande defesa de {o} para negar {p}!",
    ],
    "shot-wide": [
      "{p} chuta de longe. Para fora.",
      "{p} finaliza, mas a bola vai por cima.",
      "{p} se atrapalha na hora do chute e a chance se vai.",
      "{p} cobra colocado e a bola passa rente à trave.",
    ],
    "shot-blocked": [
      "{p} chuta — bloqueado por {o}!",
      "A finalização de {p} é bloqueada.",
      "Bloqueio corajoso de {o} para parar {p}.",
    ],
    woodwork: ["{p} acerta a trave!", "No travessão! {p} quase marca!", "{p} balança o poste!"],
    "big-chance-missed": [
      "Que chance! {p} devia marcar, mas manda para fora!",
      "{p} está livre na frente... e perde! Inacreditável.",
      "{p} só tinha o goleiro pela frente e desperdiça!",
    ],
    corner: [
      "Escanteio para {team}.",
      "{team} conquista um escanteio.",
      "Desvia e sai: escanteio para {team}.",
    ],
    "free-kick": [
      "Falta para {team} em posição perigosa.",
      "{p} é derrubado. Falta, e está ao alcance do gol.",
    ],
    foul: [
      "Falta de {p} em {o}.",
      "{p} chega por trás em {o}. Falta.",
      "{p} acerta {o}. O árbitro marca.",
    ],
    yellow: [
      "Cartão amarelo para {p}.",
      "{p} entra para a caderneta.",
      "O árbitro mostra o amarelo para {p}.",
    ],
    "second-yellow": [
      "Segundo amarelo para {p}! Está expulso!",
      "{p} leva o segundo cartão e é expulso!",
    ],
    red: ["CARTÃO VERMELHO! {p} é expulso!", "Vermelho direto para {p}! {team} fica com dez."],
    offside: [
      "{p} é flagrado em impedimento.",
      "O bandeirinha levanta a bandeira contra {p}.",
      "{p} arrancou cedo demais. Impedimento.",
    ],
    injury: [
      "{p} está caído e precisa de atendimento.",
      "Preocupação para {team}: {p} se machucou.",
      "{p} para segurando a perna.",
    ],
    sub: [
      "Substituição em {team}: {p} entra no lugar de {o}.",
      "{team} faz uma mudança. Sai {o}, entra {p}.",
    ],
    tactics: ["{team} muda a forma de jogar.", "O banco de {team} faz ajustes."],
    "shootout-goal": ["{p} marca.", "{p} converte.", "{p} — no ângulo!"],
    "shootout-miss": ["{p} perde!", "A cobrança de {p} é defendida!", "{p} chuta por cima!"],
    "shootout-end": ["{team} vence a disputa!", "É {team} quem mantém a frieza!"],
  },
}

export default commentary
