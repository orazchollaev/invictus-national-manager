import type { CommentaryText } from "@/engine/match/commentary"

/** Live commentary in French; same placeholders as the English set. */
const commentary: CommentaryText = {
  assist: " Passe décisive de {a}.",
  forward: "vers l'avant",
  lane: {
    left: "côté gauche",
    centre: "dans l'axe",
    right: "côté droit",
  },
  shots: {
    long: {
      goal: [
        "BUT ! {p} arme sa frappe de loin et elle finit au fond !{assist}",
        "BUT ! Une véritable bombe de {p} depuis l'extérieur de la surface !{assist}",
      ],
      "shot-saved": [
        "{p} tente sa chance de loin — {o} bloque.",
        "Frappe de loin de {p}, captée par {o}.",
      ],
      "shot-wide": [
        "{p} frappe de loin. À côté.",
        "{p} tente de l'extérieur de la surface — au-dessus de la barre.",
      ],
      "shot-blocked": ["La frappe lointaine de {p} est contrée par {o}."],
      woodwork: ["{p} trouve le poteau d'une frappe de loin !"],
    },
    close: {
      goal: [
        "BUT ! {p} n'a plus qu'à pousser le ballon au fond !{assist}",
        "BUT ! {p} reprend le ballon en retrait !{assist}",
      ],
      "shot-saved": ["{o} sort on ne sait comment la frappe de {p} à bout portant !"],
      "big-chance-missed": [
        "{p} rate on ne sait comment à six mètres !",
        "Le ballon est servi sur un plateau à {p}... et il le tire à côté !",
      ],
    },
    header: {
      goal: [
        "BUT ! {p} s'élève plus haut que tout le monde et envoie sa tête au fond !{assist}",
        "BUT ! Quelle tête de {p} !{assist}",
      ],
      "shot-saved": ["{p} place sa tête, mais {o} repousse.", "Une tête de {p} — droit sur {o}."],
      "shot-wide": [
        "{p} envoie sa tête au-dessus.",
        "{p} reprend le centre, mais sa tête passe à côté.",
      ],
      woodwork: ["La tête de {p} s'écrase sur la barre !"],
      "big-chance-missed": ["{p} est seul pour la tête et manque le cadre !"],
    },
    "one-on-one": {
      goal: [
        "BUT ! {p} élimine le gardien et marque !{assist}",
        "BUT ! {p} garde son sang-froid face au gardien et le bat !{assist}",
      ],
      "shot-saved": [
        "{p} est seul face au but... {o} se jette et repousse !",
        "Superbe {o} ! Il tient tête à {p} dans ce face-à-face.",
      ],
      "big-chance-missed": [
        "{p} est lancé face au but... et tire à côté ! Quel raté !",
        "{p} est seul face au gardien et frappe à côté du poteau !",
      ],
    },
    "free-kick": {
      goal: ["BUT ! {p} envoie le coup franc dans la lucarne !", "BUT ! Quel coup franc de {p} !"],
      "shot-saved": [
        "{p} tente directement le coup franc — {o} le détourne au-dessus !",
        "Le coup franc de {p} est arrêté par {o}.",
      ],
      "shot-wide": [
        "Le coup franc de {p} passe au-dessus de la barre.",
        "{p} enroule son coup franc, juste à côté.",
      ],
      "shot-blocked": ["Le coup franc de {p} s'écrase dans le mur."],
      woodwork: ["Le coup franc de {p} claque sur le poteau !"],
    },
    rebound: {
      goal: [
        "BUT ! {p} se jette sur le ballon relâché !",
        "BUT ! Le gardien repousse et {p} est le premier dessus !",
      ],
      "shot-saved": ["{p} suit l'action, mais {o} repousse encore !"],
      "shot-wide": ["{p} précipite sa reprise et le ballon passe à côté."],
    },
  },
  moves: {
    counter: { before: "En contre ! ", after: " Une contre-attaque dévastatrice." },
    press: {
      before: "Ballon récupéré très haut ! ",
      after: " Sanction pour avoir perdu le ballon.",
    },
  },
  lines: {
    kickoff: [
      "C'est parti !",
      "L'arbitre siffle et {team:home} donne le coup d'envoi.",
      "Coup d'envoi. Allons-y.",
    ],
    "half-time": [
      "L'arbitre siffle la mi-temps.",
      "C'est la fin de la première période.",
      "Mi-temps. Les joueurs rejoignent le vestiaire.",
    ],
    "second-half": [
      "La seconde période est lancée.",
      "On repart pour les quarante-cinq dernières minutes.",
    ],
    "full-time": ["L'arbitre siffle la fin du match !", "C'est terminé !", "Fin du match."],
    "et-start": [
      "La prolongation commence. Trente minutes de plus pour les départager.",
      "Voici la prolongation.",
    ],
    "et-half-time": ["Mi-temps de la prolongation. Il reste quinze minutes."],
    "et-second-half": ["Les quinze dernières minutes de la prolongation sont lancées."],
    "et-end": [
      "Toujours rien entre les deux équipes. Ce sera aux tirs au but !",
      "La prolongation n'a pas suffi — direction les tirs au but.",
    ],
    attack: [
      "{p} perce vers l'avant pour {team} {lane}, mais {o} intervient.",
      "{team} construit {lane}, mais la dernière passe est coupée par {o}.",
      "{p} cherche la faille. {o} lit bien le jeu.",
      "Construction patiente de {team}, mais la dernière passe est ratée.",
      "{p} tente une passe en profondeur — interceptée par {o}.",
    ],
    goal: [
      "BUT ! {p} fait trembler les filets pour {team} !{assist}",
      "BUT ! {p} ne tremble pas !{assist}",
      "BUT ! Quelle finition de {p} !{assist}",
      "BUT ! {p} conclut pour {team} !{assist}",
      "BUT ! {p} est au bon endroit pour pousser le ballon au fond !{assist}",
    ],
    "own-goal": [
      "CSC ! {p} marque dans son propre but. Quel cauchemar pour lui.",
      "CSC ! {p} ne peut que dévier le ballon au-dessus de son propre gardien.",
    ],
    "penalty-awarded": [
      "PENALTY ! {o} fauche {p} dans la surface !",
      "L'arbitre désigne le point de penalty ! {p} est accroché par {o}.",
    ],
    "pen-goal": [
      "BUT ! {p} trompe le gardien sur le penalty !",
      "BUT ! {p} transforme le penalty !",
    ],
    "pen-saved": [
      "ARRÊTÉ ! {o} devine le bon côté et repousse le penalty de {p} !",
      "Le penalty de {p} est arrêté par {o} !",
    ],
    "pen-miss": [
      "{p} envoie son penalty au-dessus de la barre !",
      "{p} tire son penalty à côté ! Un énorme soulagement.",
    ],
    "shot-saved": [
      "{p} met le gardien à contribution — {o} repousse.",
      "Belle tentative de {p}, mais {o} plonge sur le ballon.",
      "{p} cadre sa frappe. Arrêt facile pour {o}.",
      "Superbe arrêt de {o} pour priver {p} !",
    ],
    "shot-wide": [
      "{p} frappe de loin. À côté.",
      "{p} déclenche sa frappe, mais elle passe au-dessus.",
      "{p} se précipite et l'occasion s'envole.",
      "{p} enroule sa frappe, juste à côté du poteau.",
    ],
    "shot-blocked": [
      "{p} frappe — contré par {o} !",
      "La tentative de {p} est contrée.",
      "Contre courageux de {o} pour stopper {p}.",
    ],
    woodwork: [
      "{p} trouve le poteau !",
      "Sur la barre ! {p} a failli marquer !",
      "{p} fait trembler la charpente !",
    ],
    "big-chance-missed": [
      "Quelle occasion ! {p} devait marquer mais tire à côté !",
      "{p} est lancé seul... et rate ! Incroyable.",
      "{p} n'avait plus que le gardien à battre et il gâche tout !",
    ],
    corner: ["Corner pour {team}.", "{team} obtient un corner.", "Dévié en corner pour {team}."],
    "free-kick": [
      "Coup franc pour {team} dans une position dangereuse.",
      "{p} est fauché. Coup franc, et à bonne distance.",
    ],
    foul: [
      "Faute de {p} sur {o}.",
      "{p} accroche {o} par derrière. Coup franc.",
      "{p} touche {o}. L'arbitre siffle.",
    ],
    yellow: [
      "Carton jaune pour {p}.",
      "{p} écope d'un carton.",
      "L'arbitre sort le jaune pour {p}.",
    ],
    "second-yellow": [
      "Deuxième jaune pour {p} ! Il est expulsé !",
      "{p} prend un second avertissement et est expulsé !",
    ],
    red: ["CARTON ROUGE ! {p} est expulsé !", "Rouge direct pour {p} ! {team} se retrouve à dix."],
    offside: [
      "{p} est signalé hors-jeu.",
      "Le drapeau se lève contre {p}.",
      "{p} a lancé sa course trop tôt. Hors-jeu.",
    ],
    injury: [
      "{p} est au sol et a besoin de soins.",
      "Inquiétude pour {team} : {p} est touché.",
      "{p} s'arrête en se tenant la jambe.",
    ],
    sub: [
      "Changement pour {team} : {p} remplace {o}.",
      "{team} procède à un changement. {o} sort, {p} entre.",
    ],
    tactics: ["{team} change son approche.", "Le banc de {team} procède à des ajustements."],
    "shootout-goal": ["{p} marque.", "{p} transforme.", "{p} — en pleine lucarne !"],
    "shootout-miss": ["{p} manque son tir !", "Le tir de {p} est arrêté !", "{p} tire au-dessus !"],
    "shootout-end": ["{team} remporte la séance !", "C'est {team} qui garde son sang-froid !"],
  },
}

export default commentary
