/** Text the engine produces: news, objectives, reviews, names. */
const engine = {
  obj: {
    qualify: "Qualify for the {comp}",
    unbeaten: "{text} unbeaten",
    promotion: "Win promotion from League {letter}",
    relegation: "Avoid relegation from League {letter}",
    win: "Win the {comp}",
    reach: {
      knockout: "Reach the knockout stage of the {comp}",
      "quarter-finals": "Reach the quarter-finals of the {comp}",
      "semi-finals": "Reach the semi-finals of the {comp}",
      final: "Reach the final of the {comp}",
    },
    debuts: "Hand international debuts to {count} players aged 21 or under in {year}",
    raiseNote:
      "Rewards ×{reward}; falling short costs {cost} confidence, then the original target stands",
    lowerNote: "Costs {cost} confidence now; rewards halved",
    lowerNeeds: "The board will only listen with confidence of {n}% or more",
  },
  news: {
    raise: {
      title: "You raise the bar",
      body: 'You have promised the federation more: "{text}". Deliver, and they will not forget it.',
    },
    lower: {
      title: "Expectations lowered",
      body: 'The federation has reluctantly agreed to a lesser target: "{text}".',
    },
    broken: {
      title: "Promise broken",
      body: 'You promised to "{promised}" and fell short. The federation still expects you to "{target}".',
    },
    met: {
      title: "Objective achieved",
      body: 'The federation is delighted: "{text}" — done. The extra backing will reach the academies too.',
    },
    missed: {
      title: "Objective missed",
      body: 'The federation is unhappy: we failed to "{text}".',
    },
    friendly: "a friendly",
    riot: {
      title: "{us} run riot against {them}",
      body: "A {score} win over {them} in {comp}. The fans will remember this one.",
    },
    shock: {
      title: "Shock win over {them}",
      body: "Few gave us a chance, but we beat {them} {score} in {comp}.",
    },
    humiliation: {
      title: "Humiliation against {them}",
      body: "A {score} defeat to {them} in {comp}. Questions are being asked of the manager.",
    },
    embarrassing: {
      title: "Embarrassing defeat to {them}",
      body: "We were expected to win, but lost {score} to {them} in {comp}.",
    },
    cap: {
      title: "{name} wins cap number {caps}",
      body: "{name} has now played {caps} times for {nation}.",
    },
    goals: {
      title: "{name} reaches {goals} international goals",
      body: "{name} has now scored {goals} goals for {nation}.",
    },
    debut: {
      title: "First cap for {name}",
      body: "Making their international debut against {opp}: {names}.",
    },
    debuts: {
      title: "{n} debuts",
    },
    milestone: "Milestone reached",
    ultimatum: {
      title: "Final warning",
      body: "The federation has lost patience. Lift their confidence to {lifted}% within {matches} competitive matches, or you will be replaced.",
    },
    eases: {
      title: "The pressure eases",
      body: "Results have turned. The federation has withdrawn its final warning.",
    },
    sacked: {
      title: "Sacked",
      body: "The {nation} federation has relieved you of your duties.",
    },
    resigned: {
      title: "You have resigned",
      body: "You have stepped down as head coach of {nation}.",
    },
    notRenewed: {
      title: "Contract not renewed",
      body: "The {nation} federation has decided not to renew your contract.",
    },
    renewed: {
      title: "Contract renewed",
      body: "The {nation} federation has renewed your contract until {date}.",
    },
    extended: {
      title: "One more year",
      body: "The {nation} federation has extended your contract by a single year. They want to see progress.",
    },
    coachChange: {
      title: "{nation} change coach",
      body: "{nation} have appointed {coach} as their new head coach.",
    },
    offer: {
      title: "Job offer: {nation}",
      body: "The {nation} federation would like you as their new head coach. The offer stands until {date}.",
    },
    newJob: {
      title: "New job: {nation}",
      body: "You are the new head coach of {nation}.",
    },
    tourney: {
      through: "{comp}: through",
      throughTo: "We are through to the {round}.",
      throughBare: "We are through.",
      out: "{comp}: out",
      groupOut: "We finished {group} without going through.",
      knockedOut: "We have been knocked out in the {round}.",
      runnersUp: "{comp}: runners-up",
      lostFinal: "We lost the final.",
    },
    qualified: {
      title: "Qualified for {finals}",
      body: "We have earned a place at {finals}.",
    },
    playoff: {
      title: "Into the play-off",
      body: "We have reached the inter-confederation play-off for {finals}.",
    },
    missedOut: {
      title: "Did not qualify",
      body: "We have missed out on {finals}.",
    },
    finalsGeneric: "the finals",
    injury: {
      title: "{name} injured",
      body: "{name} has picked up a {injury} at club level and will be out until {date}.",
    },
    newClub: "a new club",
    bigMove: {
      title: "{name} earns a big move",
      body: "{name} joins {club} on the back of his international breakthrough.",
    },
    move: {
      title: "{name} on the move",
      body: "{name} joins {club}.",
    },
    prospects: {
      title: "Your prospects this season",
      body: "How the youngsters you are watching developed: {list}.",
    },
    season: {
      title: "Season {from}–{to} begins",
      body: "Players have developed over the last season and the summer transfer window has closed.",
    },
    retired: {
      entry: "{name} ({pos}, {age})",
      entryCaps: "{name} ({pos}, {age}, {caps} caps)",
    },
    retire: {
      title: "{name} quits international football",
      body: "{name} ({age}, {caps} caps) has announced his retirement from international football.",
    },
    wonderkid: {
      title: "Wonderkid emerges: {name}",
      body: "Scouts are raving about {name}, a {age}-year-old {pos} at {club}.",
    },
    newgen: {
      entry: "{name} ({pos}, {age}, {club})",
    },
    retiredMany: {
      title: "{n} players retire",
      body: "These players have hung up their boots: {list}.",
    },
    newgens: {
      title: "{n} youngsters come through",
      body: "The new generation eligible for us: {list}.",
    },
    stadium: {
      build: {
        title: "Work begins on the {stadium}",
        body: "The federation is building a {seats}-seat stadium in {city}, due to open on {date}.",
      },
      expand: {
        title: "{stadium} to be expanded",
        body: "The {stadium} in {city} will hold {seats} once the work is done, on {date}.",
      },
      opened: {
        build: "{nation} open the {stadium}",
        expand: "{stadium} expanded",
        body: "The {stadium} in {city} now holds {seats}{ready}.",
      },
      readyFor: ", ready for the {comp}",
    },
    champions: {
      title: "{winner} win the {comp}",
      body: "{winner} are champions{beat}.",
      beat: ", beating {runnerUp} in the final",
    },
    draw: {
      title: "{comp}: {stage}",
      group: "The draw is made. We face {others}.",
      tie: "We have been drawn against {opp}.",
    },
    and: "{a} and {b}",
    host: {
      title: "{list} to host the {comp}",
      one: "{list} will host the {comp}, starting {date}.",
      many: "{list} will co-host the {comp}, starting {date}.",
    },
    placeholder: {
      title: "{team} take their place",
      body: "{team} win the {label} and fill that place in the draw.",
    },
  },
  ms: {
    trophy: "Your first trophy: the {comp}.",
    world: "World champions! {nation} win the {comp}.",
    continental: "Champions of your continent: the {comp}.",
    qualification: "You have taken {nation} to a major tournament.",
    worldCup: "You have taken {nation} to a World Cup.",
    firstWin: "Your first win as an international head coach.",
    matches: "{n} matches as an international head coach.",
    debuts: "{n} players have won their first cap under you.",
    youthDebuts: "Five players aged 21 or under blooded at international level.",
    unbeaten: "Ten competitive matches unbeaten.",
    top10: "{nation} are in the FIFA top ten under you.",
    no1: "{nation} are the best team in the world.",
  },
  review: {
    reached: {
      champions: "Champions",
      knockedOut: "Knocked out",
      qualified: "Qualified",
      notQualified: "Did not qualify",
      leagueStage: "League stage",
      promoted: "Promoted to League {letter}",
      relegated: "Relegated to League {letter}",
      stayed: "Stayed in League {letter}",
      runnersUp: "Runners-up",
      groups: "Group stage",
    },
    msg: {
      delightedChampion:
        "The federation is delighted. Winning the {comp} is beyond what anyone dared to hope for, and your standing has never been higher.",
      delighted:
        "The federation is delighted with the {comp}. You have given them more than they asked for.",
      satisfied:
        "The federation is satisfied with the {comp}. The job was done; now they expect you to build on it.",
      disappointed:
        "The federation is disappointed with the {comp}. They expected more, and their patience is not endless.",
      ultimatum:
        "After the {comp}, the federation has run out of patience. Results must improve at once, or they will find someone who can deliver them.",
      sacked:
        "The {comp} was the last straw. The federation has decided to relieve you of your duties.",
      contractEnd:
        "The {comp} marks the end of your contract, and the federation has decided not to renew it.",
    },
  },
  fx: {
    friendly: "International friendly",
    window: "International window",
    matchday: "{stage} · Matchday {n}",
    groupMatchday: "{stage} · {group} · Matchday {n}",
    round: "{round}",
    stageRound: "{stage} · {round}",
    roundLeg: "{round} · Leg {leg}",
    stageRoundLeg: "{stage} · {round} · Leg {leg}",
  },
  lineup: {
    nobody: "No one is playing {pos}",
    notInSquad: "{name} ({pos}) is not in the squad",
    injured: "{name} ({pos}) is injured ({label})",
    suspended: "{name} ({pos}) is suspended",
  },
  placeholder: {
    uefa: "UEFA play-off Path {path}",
    path: "Play-off Path {path}",
    tournament: "Play-off Tournament",
    qualifier: "Qualifier {n}",
    winner: "{base} winner",
    tournamentWinner: "Play-off Tournament winner {n}",
    shortIc: "IC {n}",
    shortPo: "PO {path}",
  },
  injury: {
    "hamstring-strain": "Hamstring strain",
    "ankle-sprain": "Ankle sprain",
    "calf-strain": "Calf strain",
    "groin-strain": "Groin strain",
    "thigh-strain": "Thigh strain",
    "knee-injury": "Knee injury",
    "broken-foot": "Broken foot",
    "cruciate-ligament-rupture": "Cruciate ligament rupture",
    knock: "Knock",
  },
  stage: {
    group: "Group {name}",
    league: "League",
    leagueN: "League {x}",
    roundOf: "Round of {n}",
    "round-of-16": "Round of 16",
    "round-of-32": "Round of 32",
    "quarter-finals": "Quarter-finals",
    "semi-finals": "Semi-finals",
    final: "Final",
    finals: "Finals",
    "third-place": "Third place",
    "group-stage": "Group stage",
    "knockout-stage": "Knockout stage",
    "league-phase": "League phase",
    qualifying: "Qualifying",
    "preliminary-round": "Preliminary round",
    prelims: "Prelims",
    "first-round": "First round",
    "second-round": "Second round",
    "third-round": "Third round",
    "fourth-round": "Fourth round",
    "fifth-round": "Fifth round",
    "final-round": "Final round",
    "play-offs": "Play-offs",
    "play-in": "Play-In",
    "play-off-round": "Play-off round",
    "play-off-semi-finals": "Play-off semi-finals",
    "play-off-finals": "Play-off finals",
    "play-off-final": "Play-off final",
    "play-off-tournament": "Play-off tournament",
    "promotion-relegation-play-offs": "Promotion/relegation play-offs",
    "league-a-quarter-finals": "League A quarter-finals",
    "league-a-finals": "League A Finals",
    "league-b-finals": "League B Finals",
    "league-c-finals": "League C Finals",
  },
  comp: {
    wc: {
      name: "FIFA World Cup {year}",
      short: "World Cup",
      plain: "FIFA World Cup",
    },
    "wcq-uefa": {
      name: "World Cup {year} Qualifying · UEFA",
      short: "WCQ Europe",
      plain: "World Cup Qualifying · UEFA",
    },
    "wcq-caf": {
      name: "World Cup {year} Qualifying · CAF",
      short: "WCQ Africa",
      plain: "World Cup Qualifying · CAF",
    },
    "wcq-afc": {
      name: "World Cup {year} Qualifying · AFC",
      short: "WCQ Asia",
      plain: "World Cup Qualifying · AFC",
    },
    "wcq-concacaf": {
      name: "World Cup {year} Qualifying · CONCACAF",
      short: "WCQ CONCACAF",
      plain: "World Cup Qualifying · CONCACAF",
    },
    "wcq-conmebol": {
      name: "World Cup {year} Qualifying · CONMEBOL",
      short: "WCQ South America",
      plain: "World Cup Qualifying · CONMEBOL",
    },
    "wcq-ofc": {
      name: "World Cup {year} Qualifying · OFC",
      short: "WCQ Oceania",
      plain: "World Cup Qualifying · OFC",
    },
    "wcq-ic": {
      name: "World Cup {year} Play-off Tournament",
      short: "Play-off",
      plain: "World Cup Play-off Tournament",
    },
    euro: {
      name: "UEFA Euro {year}",
      short: "Euro",
      plain: "UEFA Euro",
    },
    euroq: {
      name: "UEFA Euro {year} Qualifying",
      short: "Euro Qualifying",
      plain: "UEFA Euro Qualifying",
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
      name: "Africa Cup of Nations {year}",
      short: "AFCON",
      plain: "Africa Cup of Nations",
    },
    afconq: {
      name: "Africa Cup of Nations {year} Qualifying",
      short: "AFCON Qualifying",
      plain: "Africa Cup of Nations Qualifying",
    },
    "asian-cup": {
      name: "AFC Asian Cup {year}",
      short: "Asian Cup",
      plain: "AFC Asian Cup",
    },
    "asian-cupq": {
      name: "AFC Asian Cup {year} Qualifying",
      short: "Asian Cup Qualifying",
      plain: "AFC Asian Cup Qualifying",
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
      name: "CONCACAF Gold Cup {year} Prelims",
      short: "Gold Cup Prelims",
      plain: "CONCACAF Gold Cup Prelims",
    },
    "gold-cup": {
      name: "CONCACAF Gold Cup {year}",
      short: "Gold Cup",
      plain: "CONCACAF Gold Cup",
    },
    "arab-cup": {
      name: "FIFA Arab Cup {year}",
      short: "Arab Cup",
      plain: "FIFA Arab Cup",
    },
    "gulf-cup": {
      name: "Arabian Gulf Cup {year}",
      short: "Gulf Cup",
      plain: "Arabian Gulf Cup",
    },
    aff: {
      name: "ASEAN Championship {year}",
      short: "ASEAN Championship",
      plain: "ASEAN Championship",
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
      name: "WAFF Championship {year}",
      short: "WAFF Championship",
      plain: "WAFF Championship",
    },
    saff: {
      name: "SAFF Championship {year}",
      short: "SAFF Championship",
      plain: "SAFF Championship",
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
      blurb: "Steps out to win the ball and heads everything; less help on the ball.",
    },
    "ball-playing": {
      label: "Ball-playing defender",
      blurb: "Steps into midfield with the ball; lighter in the tackle.",
    },
    cover: {
      label: "Cover defender",
      blurb: "Stays deep and safe; rarely fouls, rarely starts a move.",
    },
    "defensive-full-back": {
      label: "Defensive full-back",
      blurb: "Holds his line and tackles; does not go forward.",
    },
    "wing-back": {
      label: "Wing-back",
      blurb: "Runs the whole flank, crossing and shooting; leaves space behind.",
    },
    "inverted-full-back": {
      label: "Inverted full-back",
      blurb: "Tucks into midfield to build play; gives up the flank.",
    },
    anchor: {
      label: "Anchor",
      blurb: "Sits in front of the defence; shields it and keeps it simple.",
    },
    "ball-winner": {
      label: "Ball winner",
      blurb: "Hunts the ball all over midfield and fouls doing it.",
    },
    "deep-playmaker": {
      label: "Deep playmaker",
      blurb: "Dictates from deep; less cover for the defence.",
    },
    "box-to-box": {
      label: "Box-to-box",
      blurb: "Covers the pitch and arrives late in the area.",
    },
    playmaker: {
      label: "Playmaker",
      blurb: "Sets the tempo and finds the killer pass; does less defending.",
    },
    destroyer: {
      label: "Destroyer",
      blurb: "Breaks up play and fouls often; adds little going forward.",
    },
    "advanced-playmaker": {
      label: "Advanced playmaker",
      blurb: "Plays between the lines and creates; scores less himself.",
    },
    "shadow-striker": {
      label: "Shadow striker",
      blurb: "Runs off the forward and shoots; creates less.",
    },
    tracker: {
      label: "Tracker",
      blurb: "Presses from the front and tracks back; less threat.",
    },
    winger: {
      label: "Winger",
      blurb: "Hugs the touchline and delivers crosses.",
    },
    "inside-forward": {
      label: "Inside forward",
      blurb: "Cuts in to shoot; less width and fewer crosses.",
    },
    "tracking-winger": {
      label: "Tracking winger",
      blurb: "Works back to help the full-back; less going forward.",
    },
    "target-man": {
      label: "Target man",
      blurb: "Wins headers and holds the ball up; not the sharpest finisher.",
    },
    poacher: {
      label: "Poacher",
      blurb: "Waits in the box for chances; does nothing else.",
    },
    "complete-forward": {
      label: "Complete forward",
      blurb: "Scores, links up and creates.",
    },
    "pressing-forward": {
      label: "Pressing forward",
      blurb: "Harries defenders from the front; less threat in the box.",
    },
  },
  arch: {
    "shot-stopper": {
      label: "Shot-stopper",
      blurb: "Commands his line and saves what he should not.",
    },
    "sweeper-keeper": {
      label: "Sweeper-keeper",
      blurb: "Sweeps up behind the defence and starts attacks; a little less sure on the line.",
    },
    stopper: {
      label: "Stopper",
      blurb: "Wins duels and heads clear, but brings little to the build-up.",
    },
    "ball-playing-defender": {
      label: "Ball-playing defender",
      blurb: "Starts moves from the back; a touch lighter in the tackle.",
    },
    "defensive-full-back": {
      label: "Defensive full-back",
      blurb: "Stays back, tackles and covers the wing.",
    },
    "attacking-full-back": {
      label: "Attacking full-back",
      blurb: "Overlaps, crosses and gets into the box; leaves space behind.",
    },
    "ball-winner": {
      label: "Ball winner",
      blurb: "Breaks up play in front of the defence and commits fouls doing it.",
    },
    "deep-playmaker": {
      label: "Deep playmaker",
      blurb: "Dictates play from deep with long passes.",
    },
    "box-to-box": {
      label: "Box-to-box",
      blurb: "Covers every blade of grass and arrives late in the area.",
    },
    playmaker: {
      label: "Playmaker",
      blurb: "Sets the tempo and finds the killer pass.",
    },
    creator: {
      label: "Creator",
      blurb: "Plays between the lines; more assists than goals.",
    },
    "shadow-striker": {
      label: "Shadow striker",
      blurb: "Runs off the forward and scores himself.",
    },
    winger: {
      label: "Winger",
      blurb: "Hugs the touchline and delivers crosses.",
    },
    "inside-forward": {
      label: "Inside forward",
      blurb: "Cuts in from the wing to shoot.",
    },
    "target-man": {
      label: "Target man",
      blurb: "Wins headers and holds the ball up; not the sharpest finisher.",
    },
    poacher: {
      label: "Poacher",
      blurb: "Lives in the box and finishes what comes to him; little else.",
    },
    "complete-forward": {
      label: "Complete forward",
      blurb: "Scores, links up and creates.",
    },
  },
  rule: {
    "behind-high-line": "Balls in behind a high line",
    "counter-into-deep-block": "Nothing to counter into against a deep block",
    "width-into-back-five": "Width is wasted against a back five",
    "width-into-open-flanks": "Width against a flat four with open flanks",
    "patience-into-press": "Patient build-up against a high press",
    "direct-past-press": "Direct play past a high press",
    "lone-striker-into-back-three": "A lone striker against three centre-backs",
    "two-strikers-into-flat-four": "Two strikers against a flat four",
    "midfield-numbers": "More players through the middle",
    "midfield-outnumbered": "Outnumbered through the middle",
    "press-patient-side": "A high press against a patient side",
    "narrow-into-wide": "A narrow side packs the middle against a wide one",
  },
  badge: {
    "big-game": {
      label: "Big-game player",
      text: "Plays above his level in finals and deciders, and keeps his nerve from the spot.",
    },
    reliable: {
      label: "Reliable",
      text: "Plays to his level almost every match.",
    },
    erratic: {
      label: "Erratic",
      text: "Match ratings swing; brilliant one day, poor the next.",
    },
    "injury-prone": {
      label: "Injury-prone",
      text: "More likely to pick up a knock in a match.",
    },
    "tires-early": {
      label: "Tires early",
      text: "Runs out of steam sooner than a younger player.",
    },
  },
  bond: {
    clubmates: "Club mates",
    friends: "Friends",
    feud: "Feud",
  },
  spirit: {
    tight: "Tight-knit",
    good: "Good",
    neutral: "Neutral",
    uneasy: "Uneasy",
    divided: "Divided",
  },
  scout: {
    trait: {
      attack: "Attack-minded",
      cautious: "Cautious",
      highLine: "High line",
      deepLine: "Deep line",
      wide: "Plays wide",
      narrow: "Plays narrow",
      counter: "Counter-attacking",
      highPress: "High press",
      dropsOff: "Drops off",
      direct: "Direct",
      patient: "Patient",
      balanced: "Balanced",
    },
    reason: {
      star: "Their best player",
      threat: "Their main goal threat",
      creator: "Creates most of their chances",
      weak: "The weak link",
    },
    level: {
      "0": "Deep",
      "1": "Standard",
      "2": "High",
    },
    width: {
      "0": "Narrow",
      "1": "Standard",
      "2": "Wide",
    },
    change: {
      line: "Defensive line: {from} → {to}",
      width: "Width: {from} → {to}",
      counter: "Counter-attack: {from} → {to}",
    },
    on: "on",
    off: "off",
  },
}

export default engine
