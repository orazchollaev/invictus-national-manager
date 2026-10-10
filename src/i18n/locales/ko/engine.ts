import type en from "../en/engine"

const engine: typeof en = {
  obj: {
    qualify: "{comp} 본선 진출",
    unbeaten: "{text} 무패",
    promotion: "리그 {letter} 승격",
    relegation: "리그 {letter} 강등 피하기",
    win: "{comp} 우승",
    reach: {
      knockout: "{comp} 토너먼트 진출",
      "quarter-finals": "{comp} 8강 진출",
      "semi-finals": "{comp} 4강 진출",
      final: "{comp} 결승 진출",
    },
    debuts: "{year}년에 21세 이하 선수 {count}명에게 A매치 데뷔 기회 주기",
    raiseNote: "보상 ×{reward}; 달성하지 못하면 신임도 {cost} 하락, 이후 원래 목표가 적용됩니다",
    lowerNote: "지금 신임도 {cost} 하락; 보상 절반",
    lowerNeeds: "협회는 신임도가 {n}% 이상일 때만 요청을 들어줍니다",
  },
  news: {
    raise: {
      title: "기준을 높였습니다",
      body: '협회에 더 높은 목표를 약속했습니다: "{text}". 약속을 지키면 협회가 기억할 것입니다.',
    },
    lower: {
      title: "기대치 하향",
      body: '협회가 마지못해 낮은 목표를 받아들였습니다: "{text}".',
    },
    broken: {
      title: "약속 불이행",
      body: '"{promised}"을(를) 약속했지만 달성하지 못했습니다. 협회는 여전히 "{target}"을(를) 기대하고 있습니다.',
    },
    met: {
      title: "목표 달성",
      body: '협회가 매우 기뻐합니다: "{text}" — 달성. 추가 지원은 아카데미에도 돌아갑니다.',
    },
    missed: {
      title: "목표 미달성",
      body: '협회가 불만입니다: "{text}"을(를) 이루지 못했습니다.',
    },
    friendly: "평가전",
    derbyWin: {
      title: "더비의 주인공은 {us}",
      body: "{comp}에서 오랜 숙적 {them}을(를) {score}로 꺾었습니다. 거리마다 축제 분위기입니다.",
    },
    derbyLoss: {
      title: "{them}에 더비 패배",
      body: "{comp}에서 {them}에 {score}로 졌습니다. 팬들은 이 경기를 쉽게 잊지 못할 것입니다.",
    },
    derbyDraw: {
      title: "더비는 팽팽한 무승부",
      body: "{us}와(과) {them}이(가) {comp}에서 {score}로 비겼습니다. 어느 쪽도 자존심을 세우지 못했습니다.",
    },
    fans: {
      angry: {
        title: "팬들이 감독에게 등을 돌렸습니다",
        body: "{nation} 서포터들이 분노를 분명히 드러냈습니다. 협회가 귀를 기울이고 있습니다.",
      },
      adore: {
        title: "팬들이 당신 편입니다",
        body: "{nation} 서포터들이 감독의 이름을 연호하고 있습니다. 경기장이 들썩일 것입니다.",
      },
    },
    invitational: {
      title: "{host}, {comp} 개최",
      body: "{host}에서 {comp}이(가) 열리며 {teams}이(가) 참가합니다. 대회는 {date}에 시작합니다.",
    },
    invite: {
      title: "{host}의 초청",
      body: "{host}이(가) {date}부터 시작하는 기간에 열리는 {n}개 팀 대회에 우리를 초청했습니다. 답변이 필요합니다.",
    },
    inviteLapsed: {
      title: "초청 만료",
      body: "{host}의 초청에 제때 답하지 못해 우리 없이 대회가 진행됩니다.",
    },
    inviteOff: {
      title: "대회 취소",
      body: "{host}의 대회는 일부 팀이 더 이상 참가할 수 없어 열리지 못했습니다.",
    },
    riot: {
      title: "{us}, {them}을(를) 압도하다",
      body: "{comp}에서 {them}을(를) {score}로 대파했습니다. 팬들이 오래 기억할 경기입니다.",
    },
    shock: {
      title: "{them}에 충격의 승리",
      body: "아무도 기대하지 않았지만 {comp}에서 {them}을(를) {score}로 꺾었습니다.",
    },
    humiliation: {
      title: "{them}에 굴욕적인 패배",
      body: "{comp}에서 {them}에 {score}로 패했습니다. 감독에 대한 의문이 제기되고 있습니다.",
    },
    embarrassing: {
      title: "{them}에 창피한 패배",
      body: "승리가 기대되었지만 {comp}에서 {them}에 {score}로 졌습니다.",
    },
    cap: {
      title: "{name}, A매치 {caps}경기 출전",
      body: "{name} 선수가 {nation} 대표팀에서 통산 {caps}경기를 뛰었습니다.",
    },
    goals: {
      title: "{name}, A매치 {goals}골 달성",
      body: "{name} 선수가 {nation} 대표팀에서 통산 {goals}골을 기록했습니다.",
    },
    debut: {
      title: "{name}, 첫 A매치 출전",
      body: "{opp}전에서 A매치 데뷔: {names}.",
    },
    debuts: {
      title: "데뷔 선수 {n}명",
    },
    milestone: "이정표 달성",
    ultimatum: {
      title: "최후 경고",
      body: "협회가 인내심을 잃었습니다. 공식 경기 {matches}경기 안에 신임도를 {lifted}%까지 끌어올리지 못하면 경질됩니다.",
    },
    eases: {
      title: "압박이 풀렸습니다",
      body: "성적이 반등했습니다. 협회가 최후 경고를 거두었습니다.",
    },
    sacked: {
      title: "경질",
      body: "{nation} 축구협회가 당신을 해임했습니다.",
    },
    resigned: {
      title: "사임했습니다",
      body: "{nation} 대표팀 감독직에서 물러났습니다.",
    },
    notRenewed: {
      title: "계약 불발",
      body: "{nation} 축구협회가 계약을 갱신하지 않기로 결정했습니다.",
    },
    renewed: {
      title: "계약 갱신",
      body: "{nation} 축구협회가 {date}까지 계약을 갱신했습니다.",
    },
    extended: {
      title: "1년 연장",
      body: "{nation} 축구협회가 계약을 딱 1년만 연장했습니다. 발전하는 모습을 보고 싶어 합니다.",
    },
    coachChange: {
      title: "{nation}, 감독 교체",
      body: "{nation}이(가) {coach}을(를) 새 감독으로 선임했습니다.",
    },
    coachSacked: {
      title: "{nation}, {coach} 경질",
      body: "{nation}이(가) 부진 끝에 {coach} 감독과 결별했습니다. 후임 물색이 시작되었습니다.",
    },
    coachRetired: {
      title: "{coach}, 은퇴",
      body: "{coach} 감독이 {nation} 대표팀 지휘봉을 내려놓고 지도자 생활에서 은퇴했습니다.",
    },
    offer: {
      title: "감독직 제안: {nation}",
      body: "{nation} 축구협회가 당신을 새 감독으로 원합니다. 제안은 {date}까지 유효합니다.",
    },
    newJob: {
      title: "새 직장: {nation}",
      body: "당신은 이제 {nation} 대표팀의 새 감독입니다.",
    },
    tourney: {
      through: "{comp}: 진출",
      throughTo: "{round} 진출에 성공했습니다.",
      throughBare: "진출에 성공했습니다.",
      out: "{comp}: 탈락",
      groupOut: "{group}을(를) 통과하지 못하고 마쳤습니다.",
      knockedOut: "{round}에서 탈락했습니다.",
      runnersUp: "{comp}: 준우승",
      lostFinal: "결승에서 패했습니다.",
    },
    qualified: {
      title: "{finals} 본선 진출",
      body: "{finals} 본선행 티켓을 따냈습니다.",
    },
    playoff: {
      title: "플레이오프 진출",
      body: "{finals} 대륙간 플레이오프에 올랐습니다.",
    },
    missedOut: {
      title: "본선 진출 실패",
      body: "{finals} 본선 진출에 실패했습니다.",
    },
    finalsGeneric: "본선",
    injury: {
      title: "{name} 부상",
      body: "{name} 선수가 소속팀에서 {injury} 부상을 당해 {date}까지 결장합니다.",
    },
    newClub: "새 클럽",
    bigMove: {
      title: "{name}, 빅 클럽 이적",
      body: "{name} 선수가 대표팀에서의 활약에 힘입어 {club}에 입단합니다.",
    },
    move: {
      title: "{name} 이적",
      body: "{name} 선수가 {club}에 입단합니다.",
    },
    prospects: {
      title: "이번 시즌 유망주",
      body: "지켜보던 유망주들의 성장 결과입니다: {list}.",
    },
    season: {
      title: "{from}–{to} 시즌 개막",
      body: "지난 시즌 동안 선수들이 성장했고 여름 이적 시장이 마감되었습니다.",
    },
    retired: {
      entry: "{name} ({pos}, {age}세)",
      entryCaps: "{name} ({pos}, {age}세, A매치 {caps}경기)",
    },
    retire: {
      title: "{name}, 대표팀 은퇴",
      body: "{name} 선수({age}세, A매치 {caps}경기)가 대표팀 은퇴를 발표했습니다.",
    },
    wonderkid: {
      title: "원더키드 등장: {name}",
      body: "스카우트들이 {club}의 {age}세 {pos} {name} 선수에게 극찬을 보내고 있습니다.",
    },
    newgen: {
      entry: "{name} ({pos}, {age}세, {club})",
    },
    retiredMany: {
      title: "선수 {n}명 은퇴",
      body: "다음 선수들이 현역에서 물러났습니다: {list}.",
    },
    newgens: {
      title: "유망주 {n}명 합류",
      body: "우리 대표팀 자격을 갖춘 새 세대입니다: {list}.",
    },
    stadium: {
      build: {
        title: "{stadium} 공사 시작",
        body: "협회가 {city}에 {seats}석 규모의 경기장을 짓고 있으며 {date} 개장 예정입니다.",
      },
      expand: {
        title: "{stadium} 증축",
        body: "{city}의 {stadium}은(는) 공사가 끝나는 {date}부터 {seats}석을 수용합니다.",
      },
      opened: {
        build: "{nation}, {stadium} 개장",
        expand: "{stadium} 증축 완료",
        body: "{city}의 {stadium}이(가) 이제 {seats}석을 수용합니다{ready}.",
      },
      readyFor: ", {comp} 준비 완료",
    },
    champions: {
      title: "{winner}, {comp} 우승",
      body: "{winner}이(가) 우승했습니다{beat}.",
      beat: ", 결승에서 {runnerUp}을(를) 꺾었습니다",
    },
    draw: {
      title: "{comp}: {stage}",
      group: "조 추첨이 끝났습니다. 우리는 {others}와(과) 만납니다.",
      tie: "{opp}와(과) 맞붙게 되었습니다.",
    },
    and: "{a} 및 {b}",
    host: {
      title: "{list}, {comp} 개최",
      one: "{list}에서 {date}부터 {comp}이(가) 열립니다.",
      many: "{list}에서 {date}부터 {comp}이(가) 공동 개최됩니다.",
    },
    placeholder: {
      title: "{team}, 본선 합류",
      body: "{team}이(가) {label}에서 승리해 추첨의 빈자리를 채웁니다.",
    },
  },
  ms: {
    trophy: "첫 트로피: {comp}.",
    world: "세계 챔피언! {nation}이(가) {comp}에서 우승했습니다.",
    continental: "대륙 챔피언: {comp}.",
    qualification: "{nation}을(를) 메이저 대회로 이끌었습니다.",
    worldCup: "{nation}을(를) 월드컵으로 이끌었습니다.",
    firstWin: "A매치 감독으로서의 첫 승리.",
    matches: "A매치 감독으로 {n}경기를 지휘했습니다.",
    debuts: "당신 아래에서 {n}명의 선수가 첫 A매치를 치렀습니다.",
    youthDebuts: "21세 이하 선수 다섯 명이 A매치 무대를 밟았습니다.",
    unbeaten: "공식전 10경기 무패.",
    top10: "{nation}이(가) 당신 아래에서 세계 10위권에 올랐습니다.",
    no1: "{nation}이(가) 세계 최강팀이 되었습니다.",
  },
  review: {
    reached: {
      champions: "우승",
      knockedOut: "탈락",
      qualified: "본선 진출",
      notQualified: "본선 진출 실패",
      leagueStage: "리그 스테이지",
      promoted: "리그 {letter} 승격",
      relegated: "리그 {letter} 강등",
      stayed: "리그 {letter} 잔류",
      runnersUp: "준우승",
      groups: "조별리그",
    },
    msg: {
      delightedChampion:
        "협회가 매우 기뻐합니다. {comp} 우승은 누구도 감히 바라지 못한 성과이며, 당신의 위상은 그 어느 때보다 높습니다.",
      delighted: "협회는 {comp}의 결과에 매우 만족합니다. 기대 이상의 성과를 안겨 주었습니다.",
      satisfied:
        "협회는 {comp}의 결과에 만족합니다. 맡은 일을 해냈으니, 이제는 이를 발판으로 삼기를 기대합니다.",
      disappointed:
        "협회는 {comp}의 결과에 실망했습니다. 더 큰 성과를 기대했으며, 인내심에도 한계가 있습니다.",
      ultimatum:
        "{comp} 이후 협회의 인내심이 바닥났습니다. 당장 성적이 나아지지 않으면 결과를 낼 다른 사람을 찾을 것입니다.",
      sacked: "{comp}가 마지막 계기였습니다. 협회가 당신을 해임하기로 결정했습니다.",
      contractEnd: "{comp}로 계약이 끝났으며, 협회는 계약을 갱신하지 않기로 결정했습니다.",
    },
  },
  fx: {
    friendly: "A매치 평가전",
    window: "A매치 기간",
    matchday: "{stage} · {n}차전",
    groupMatchday: "{stage} · {group} · {n}차전",
    round: "{round}",
    stageRound: "{stage} · {round}",
    roundLeg: "{round} · {leg}차전",
    stageRoundLeg: "{stage} · {round} · {leg}차전",
  },
  lineup: {
    nobody: "{pos} 포지션에 뛰는 선수가 없습니다",
    notInSquad: "{name}({pos}) 선수는 스쿼드에 없습니다",
    injured: "{name}({pos}) 선수가 부상 중입니다 ({label})",
    suspended: "{name}({pos}) 선수가 출전 정지 중입니다",
  },
  placeholder: {
    uefa: "UEFA 플레이오프 {path}경로",
    path: "플레이오프 {path}경로",
    tournament: "플레이오프 토너먼트",
    qualifier: "예선 {n}",
    winner: "{base} 승자",
    tournamentWinner: "플레이오프 토너먼트 승자 {n}",
    shortIc: "대륙간 {n}",
    shortPo: "PO {path}",
  },
  injury: {
    "hamstring-strain": "햄스트링 근육 손상",
    "ankle-sprain": "발목 염좌",
    "calf-strain": "종아리 근육 손상",
    "groin-strain": "사타구니 근육 손상",
    "thigh-strain": "허벅지 근육 손상",
    "knee-injury": "무릎 부상",
    "broken-foot": "발 골절",
    "cruciate-ligament-rupture": "십자인대 파열",
    knock: "타박상",
  },
  stage: {
    group: "{name}조",
    league: "리그",
    leagueN: "리그 {x}",
    roundOf: "{n}강",
    "round-of-16": "16강",
    "round-of-32": "32강",
    "quarter-finals": "8강",
    "semi-finals": "4강",
    final: "결승",
    finals: "결승전",
    "third-place": "3위 결정전",
    "bronze-final": "3·4위전",
    "group-stage": "조별리그",
    "knockout-stage": "토너먼트",
    "league-phase": "리그 스테이지",
    qualifying: "예선",
    "preliminary-round": "예비 라운드",
    preliminaryN: "예비 라운드 {n}",
    prelims: "예비전",
    "first-round": "1차 예선",
    "second-round": "2차 예선",
    "third-round": "3차 예선",
    "fourth-round": "4차 예선",
    "fifth-round": "5차 예선",
    "final-round": "최종 라운드",
    "play-offs": "플레이오프",
    "play-in": "플레이인",
    "play-off-round": "플레이오프 라운드",
    "play-off-semi-finals": "플레이오프 준결승",
    "play-off-finals": "플레이오프 결승",
    "play-off-final": "플레이오프 결승",
    "play-off-tournament": "플레이오프 토너먼트",
    "promotion-relegation-play-offs": "승강 플레이오프",
    "league-a-quarter-finals": "리그 A 8강",
    "league-a-finals": "리그 A 파이널",
    "league-b-finals": "리그 B 파이널",
    "league-c-finals": "리그 C 파이널",
  },
  comp: {
    wc: {
      name: "{year} 월드컵",
      short: "월드컵",
      plain: "월드컵",
    },
    "wcq-uefa": {
      name: "{year} 월드컵 예선 · UEFA",
      short: "유럽 예선",
      plain: "월드컵 예선 · UEFA",
    },
    "wcq-caf": {
      name: "{year} 월드컵 예선 · CAF",
      short: "아프리카 예선",
      plain: "월드컵 예선 · CAF",
    },
    "wcq-afc": {
      name: "{year} 월드컵 예선 · AFC",
      short: "아시아 예선",
      plain: "월드컵 예선 · AFC",
    },
    "wcq-concacaf": {
      name: "{year} 월드컵 예선 · CONCACAF",
      short: "CONCACAF 예선",
      plain: "월드컵 예선 · CONCACAF",
    },
    "wcq-conmebol": {
      name: "{year} 월드컵 예선 · CONMEBOL",
      short: "남미 예선",
      plain: "월드컵 예선 · CONMEBOL",
    },
    "wcq-ofc": {
      name: "{year} 월드컵 예선 · OFC",
      short: "오세아니아 예선",
      plain: "월드컵 예선 · OFC",
    },
    "wcq-ic": {
      name: "{year} 월드컵 플레이오프 토너먼트",
      short: "플레이오프",
      plain: "월드컵 플레이오프 토너먼트",
    },
    euro: {
      name: "UEFA 유로 {year}",
      short: "유로",
      plain: "UEFA 유로",
    },
    euroq: {
      name: "UEFA 유로 {year} 예선",
      short: "유로 예선",
      plain: "UEFA 유로 예선",
    },
    unl: {
      name: "UEFA 네이션스리그 {year}–{year2}",
      short: "네이션스리그",
      plain: "UEFA 네이션스리그",
    },
    finalissima: {
      name: "{year} 피날리시마",
      short: "피날리시마",
      plain: "피날리시마",
    },
    afcon: {
      name: "{year} 아프리카 네이션스컵",
      short: "아프리카 네이션스컵",
      plain: "아프리카 네이션스컵",
    },
    afconq: {
      name: "{year} 아프리카 네이션스컵 예선",
      short: "아프리카 네이션스컵 예선",
      plain: "아프리카 네이션스컵 예선",
    },
    "asian-cup": {
      name: "{year} AFC 아시안컵",
      short: "아시안컵",
      plain: "AFC 아시안컵",
    },
    "asian-cupq": {
      name: "{year} AFC 아시안컵 예선",
      short: "아시안컵 예선",
      plain: "AFC 아시안컵 예선",
    },
    copa: {
      name: "{year} 코파 아메리카",
      short: "코파 아메리카",
      plain: "코파 아메리카",
    },
    "ofc-cup": {
      name: "{year} OFC 네이션스컵",
      short: "OFC 네이션스컵",
      plain: "OFC 네이션스컵",
    },
    cnl: {
      name: "CONCACAF 네이션스리그 {year}–{year2}",
      short: "CONCACAF 네이션스리그",
      plain: "CONCACAF 네이션스리그",
    },
    gcq: {
      name: "{year} CONCACAF 골드컵 예선",
      short: "골드컵 예선",
      plain: "CONCACAF 골드컵 예선",
    },
    "gold-cup": {
      name: "{year} CONCACAF 골드컵",
      short: "골드컵",
      plain: "CONCACAF 골드컵",
    },
    "arab-cup": {
      name: "{year} 아랍컵",
      short: "아랍컵",
      plain: "아랍컵",
    },
    "gulf-cup": {
      name: "{year} 아라비안 걸프컵",
      short: "걸프컵",
      plain: "아라비안 걸프컵",
    },
    aff: {
      name: "{year} ASEAN 챔피언십",
      short: "ASEAN 챔피언십",
      plain: "ASEAN 챔피언십",
    },
    "asean-cup": {
      name: "{year} ASEAN컵",
      short: "ASEAN컵",
      plain: "ASEAN컵",
    },
    "asean-challenge": {
      name: "{year} ASEAN 챌린지컵",
      short: "ASEAN 챌린지컵",
      plain: "ASEAN 챌린지컵",
    },
    "inv-mar": {
      name: "{year} 3월 초청 대회",
      short: "3월 초청 대회",
      plain: "3월 초청 대회",
    },
    "inv-jun": {
      name: "{year} 6월 초청 대회",
      short: "6월 초청 대회",
      plain: "6월 초청 대회",
    },
    "inv-sep": {
      name: "{year} 가을 초청 대회",
      short: "가을 초청 대회",
      plain: "가을 초청 대회",
    },
    "inv-nov": {
      name: "{year} 11월 초청 대회",
      short: "11월 초청 대회",
      plain: "11월 초청 대회",
    },
    e1: {
      name: "{year} EAFF E-1 챔피언십",
      short: "E-1",
      plain: "EAFF E-1 챔피언십",
    },
    cafa: {
      name: "{year} CAFA 네이션스컵",
      short: "CAFA 네이션스컵",
      plain: "CAFA 네이션스컵",
    },
    waff: {
      name: "{year} WAFF 챔피언십",
      short: "WAFF 챔피언십",
      plain: "WAFF 챔피언십",
    },
    saff: {
      name: "{year} SAFF 챔피언십",
      short: "SAFF 챔피언십",
      plain: "SAFF 챔피언십",
    },
    cosafa: {
      name: "{year} COSAFA컵",
      short: "COSAFA컵",
      plain: "COSAFA컵",
    },
    cecafa: {
      name: "{year} CECAFA 시니어 챌린지컵",
      short: "CECAFA컵",
      plain: "CECAFA 시니어 챌린지컵",
    },
    wafu: {
      name: "{year} WAFU 지역컵",
      short: "WAFU컵",
      plain: "WAFU 지역컵",
    },
    baltic: {
      name: "{year} 발트컵",
      short: "발트컵",
      plain: "발트컵",
    },
  },
  role: {
    stopper: {
      label: "스토퍼",
      blurb: "앞으로 나서서 볼을 따내고 모든 공중볼을 처리하지만, 볼 소유 시 도움은 적습니다.",
    },
    "ball-playing": {
      label: "빌드업 수비수",
      blurb: "볼을 몰고 미드필드로 올라서지만, 태클은 다소 약합니다.",
    },
    cover: {
      label: "커버 수비수",
      blurb: "깊게 머물며 안정적으로 수비하고, 파울도 드물지만 공격 전개도 거의 하지 않습니다.",
    },
    "defensive-full-back": {
      label: "수비형 풀백",
      blurb: "라인을 지키며 태클하고, 공격에는 가담하지 않습니다.",
    },
    "wing-back": {
      label: "윙백",
      blurb: "측면 전체를 오르내리며 크로스와 슈팅을 시도하지만, 뒷공간을 내줍니다.",
    },
    "inverted-full-back": {
      label: "인버티드 풀백",
      blurb: "중원으로 좁혀 들어와 빌드업을 돕지만, 측면을 비워 둡니다.",
    },
    anchor: {
      label: "앵커",
      blurb: "수비 앞에 자리 잡고 수비를 보호하며 단순하게 플레이합니다.",
    },
    "ball-winner": {
      label: "볼 위너",
      blurb: "중원 곳곳에서 볼을 따내려 하다 보니 파울도 잦습니다.",
    },
    "deep-playmaker": {
      label: "딥 라잉 플레이메이커",
      blurb: "깊은 위치에서 경기를 조율하지만, 수비 커버는 줄어듭니다.",
    },
    "box-to-box": {
      label: "박스 투 박스",
      blurb: "그라운드 전역을 누비며 박스 안에 늦게 침투합니다.",
    },
    playmaker: {
      label: "플레이메이커",
      blurb: "템포를 조절하고 결정적인 패스를 찔러 주지만, 수비는 덜 합니다.",
    },
    destroyer: {
      label: "디스트로이어",
      blurb: "상대 공격을 끊고 파울도 잦으며, 공격 기여는 적습니다.",
    },
    "advanced-playmaker": {
      label: "공격형 플레이메이커",
      blurb: "라인 사이에서 플레이하며 기회를 만들지만, 직접 득점은 적습니다.",
    },
    "shadow-striker": {
      label: "섀도 스트라이커",
      blurb: "공격수 뒤에서 침투해 슈팅하지만, 기회 창출은 적습니다.",
    },
    tracker: {
      label: "트래커",
      blurb: "전방에서 압박하고 되돌아 수비하지만, 위협은 덜합니다.",
    },
    winger: {
      label: "윙어",
      blurb: "터치라인을 따라 달리며 크로스를 올립니다.",
    },
    "inside-forward": {
      label: "인사이드 포워드",
      blurb: "안으로 파고들어 슈팅하지만, 폭과 크로스는 줄어듭니다.",
    },
    "tracking-winger": {
      label: "수비 가담형 윙어",
      blurb: "풀백을 돕기 위해 내려와 수비하지만, 공격 가담은 줄어듭니다.",
    },
    "target-man": {
      label: "타깃맨",
      blurb: "헤딩 경합에서 이기고 볼을 지켜 내지만, 결정력은 뛰어나지 않습니다.",
    },
    poacher: {
      label: "포처",
      blurb: "박스 안에서 기회를 기다리며, 그 외에는 아무것도 하지 않습니다.",
    },
    "complete-forward": {
      label: "만능 공격수",
      blurb: "득점하고, 연계하고, 기회를 만듭니다.",
    },
    "pressing-forward": {
      label: "압박형 공격수",
      blurb: "전방에서 수비수를 끈질기게 압박하지만, 박스 안 위협은 덜합니다.",
    },
  },
  arch: {
    "shot-stopper": {
      label: "슈트 스토퍼",
      blurb: "골문을 장악하고 막기 어려운 슈팅도 막아 냅니다.",
    },
    "sweeper-keeper": {
      label: "스위퍼 키퍼",
      blurb: "수비 뒤를 쓸어 담고 공격을 시작하지만, 골라인에서는 조금 덜 안정적입니다.",
    },
    stopper: {
      label: "스토퍼",
      blurb: "경합에서 이기고 공을 걷어 내지만, 빌드업에는 도움이 적습니다.",
    },
    "ball-playing-defender": {
      label: "빌드업 수비수",
      blurb: "후방에서 공격을 시작하지만, 태클은 조금 약합니다.",
    },
    "defensive-full-back": {
      label: "수비형 풀백",
      blurb: "뒤에 머물며 태클하고 측면을 커버합니다.",
    },
    "attacking-full-back": {
      label: "공격형 풀백",
      blurb: "오버래핑하고 크로스를 올리며 박스 안까지 들어가지만, 뒷공간을 내줍니다.",
    },
    "ball-winner": {
      label: "볼 위너",
      blurb: "수비 앞에서 상대 공격을 끊지만 파울도 범합니다.",
    },
    "deep-playmaker": {
      label: "딥 라잉 플레이메이커",
      blurb: "깊은 위치에서 롱패스로 경기를 조율합니다.",
    },
    "box-to-box": {
      label: "박스 투 박스",
      blurb: "그라운드 구석구석을 누비며 박스에 늦게 침투합니다.",
    },
    playmaker: {
      label: "플레이메이커",
      blurb: "템포를 조절하고 결정적인 패스를 찔러 줍니다.",
    },
    creator: {
      label: "크리에이터",
      blurb: "라인 사이에서 플레이하며 득점보다 도움이 많습니다.",
    },
    "shadow-striker": {
      label: "섀도 스트라이커",
      blurb: "공격수 뒤에서 침투해 직접 득점합니다.",
    },
    winger: {
      label: "윙어",
      blurb: "터치라인을 따라 달리며 크로스를 올립니다.",
    },
    "inside-forward": {
      label: "인사이드 포워드",
      blurb: "측면에서 안으로 파고들어 슈팅합니다.",
    },
    "target-man": {
      label: "타깃맨",
      blurb: "헤딩 경합에서 이기고 볼을 지켜 내지만, 결정력은 뛰어나지 않습니다.",
    },
    poacher: {
      label: "포처",
      blurb: "박스 안에서 살다시피 하며 오는 기회를 마무리하지만, 그 외에는 거의 없습니다.",
    },
    "complete-forward": {
      label: "만능 공격수",
      blurb: "득점하고, 연계하고, 기회를 만듭니다.",
    },
  },
  rule: {
    "behind-high-line": "높은 수비 라인 뒤로 넘기는 공",
    "counter-into-deep-block": "깊게 내려앉은 수비 블록에는 역습할 공간이 없음",
    "width-into-back-five": "파이브백을 상대로 한 폭 넓은 공격은 소용없음",
    "width-into-open-flanks": "측면이 열린 포백을 상대로 한 폭 넓은 공격",
    "patience-into-press": "높은 압박에 맞서는 인내심 있는 빌드업",
    "direct-past-press": "높은 압박을 뚫는 직선적인 플레이",
    "lone-striker-into-back-three": "스리백을 상대하는 원톱",
    "two-strikers-into-flat-four": "플랫 포백을 상대하는 투톱",
    "midfield-numbers": "중앙에서 수적 우위",
    "midfield-outnumbered": "중앙에서 수적 열세",
    "press-patient-side": "차분한 팀에 맞서는 높은 압박",
    "narrow-into-wide": "좁게 서는 팀이 중앙을 두텁게 해 넓게 서는 팀에 대응",
  },
  badge: {
    "big-game": {
      label: "빅게임 플레이어",
      text: "결승과 중요한 경기에서 제 실력 이상을 발휘하며, 페널티 스폿에서도 침착합니다.",
    },
    reliable: {
      label: "믿음직함",
      text: "거의 모든 경기에서 제 실력을 발휘합니다.",
    },
    erratic: {
      label: "기복 심함",
      text: "경기 평점이 들쭉날쭉합니다. 어느 날은 눈부시고 다음 날은 부진합니다.",
    },
    "injury-prone": {
      label: "부상 잦음",
      text: "경기 중 부상을 당할 가능성이 더 높습니다.",
    },
    "tires-early": {
      label: "빨리 지침",
      text: "젊은 선수보다 체력이 일찍 떨어집니다.",
    },
  },
  bond: {
    clubmates: "클럽 동료",
    friends: "친구",
    feud: "불화",
  },
  spirit: {
    tight: "끈끈함",
    good: "좋음",
    neutral: "보통",
    uneasy: "불안함",
    divided: "분열됨",
  },
  scout: {
    trait: {
      attack: "공격 지향",
      cautious: "신중함",
      highLine: "높은 수비 라인",
      deepLine: "깊은 수비 라인",
      wide: "측면 활용",
      narrow: "좁게 플레이",
      counter: "역습 위주",
      highPress: "높은 압박",
      dropsOff: "내려앉음",
      direct: "직선적",
      patient: "차분함",
      balanced: "균형",
    },
    reason: {
      star: "팀 내 최고 선수",
      threat: "주요 득점 위협",
      creator: "대부분의 기회를 만들어 냄",
      weak: "약한 고리",
    },
    level: {
      "0": "깊음",
      "1": "표준",
      "2": "높음",
    },
    width: {
      "0": "좁게",
      "1": "표준",
      "2": "넓게",
    },
    change: {
      line: "수비 라인: {from} → {to}",
      width: "폭: {from} → {to}",
      counter: "역습: {from} → {to}",
    },
    on: "켬",
    off: "끔",
  },
}

export default engine
