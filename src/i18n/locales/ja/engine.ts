import type en from "../en/engine"

const engine: typeof en = {
  obj: {
    qualify: "{comp}への出場権を獲得",
    unbeaten: "{text}無敗",
    promotion: "リーグ{letter}から昇格",
    relegation: "リーグ{letter}からの降格を回避",
    win: "{comp}で優勝",
    reach: {
      knockout: "{comp}の決勝トーナメントに進出",
      "quarter-finals": "{comp}の準々決勝に進出",
      "semi-finals": "{comp}の準決勝に進出",
      final: "{comp}の決勝に進出",
    },
    debuts: "{year}年に21歳以下の選手{count}人を代表デビューさせる",
    raiseNote: "報酬×{reward}。届かなければ信頼度が{cost}下がり、元の目標に戻ります",
    lowerNote: "今すぐ信頼度が{cost}下がり、報酬は半分になります",
    lowerNeeds: "協会は信頼度が{n}%以上ある場合にのみ耳を傾けます",
  },
  news: {
    raise: {
      title: "ハードルを上げた",
      body: "協会により多くを約束しました: 「{text}」。結果を出せば、協会は忘れません。",
    },
    lower: {
      title: "期待を引き下げ",
      body: "協会はしぶしぶ低い目標を受け入れました: 「{text}」。",
    },
    broken: {
      title: "約束を反故にした",
      body: "「{promised}」と約束しながら達成できませんでした。協会は引き続き「{target}」を求めています。",
    },
    met: {
      title: "目標達成",
      body: "協会は大喜びです: 「{text}」— 達成。追加の支援はアカデミーにも行き渡ります。",
    },
    missed: {
      title: "目標未達",
      body: "協会は不満です。「{text}」を達成できませんでした。",
    },
    friendly: "親善試合",
    derbyWin: {
      title: "ダービーは{us}のもの",
      body: "宿敵{them}に{comp}で{score}の勝利。街は祝賀ムードです。",
    },
    derbyLoss: {
      title: "{them}にダービーで敗戦",
      body: "{comp}で{them}に{score}で敗れました。ファンはこの一戦をすぐには忘れないでしょう。",
    },
    derbyDraw: {
      title: "ダービーは痛み分け",
      body: "{us}と{them}は{comp}で{score}の引き分け。どちらも自慢はできません。",
    },
    fans: {
      angry: {
        title: "ファンが監督に背を向けた",
        body: "{nation}のサポーターは怒りをはっきりと示しました。協会も耳を傾けています。",
      },
      adore: {
        title: "ファンはあなたの味方",
        body: "{nation}のサポーターが監督の名前を歌っています。スタジアムは熱気に包まれるでしょう。",
      },
    },
    invitational: {
      title: "{host}が{comp}を開催",
      body: "{host}が{comp}を開催し、{teams}が参加します。開幕は{date}です。",
    },
    invite: {
      title: "{host}からの招待",
      body: "{host}が{date}開始の期間に行う{n}チームの大会に我々を招待しています。返事が必要です。",
    },
    inviteLapsed: {
      title: "招待が失効",
      body: "{host}の招待に期限内に回答しなかったため、大会は我々抜きで行われます。",
    },
    inviteOff: {
      title: "大会が中止",
      body: "{host}の大会は開催できませんでした。まだ全チームが空いているわけではありません。",
    },
    riot: {
      title: "{us}が{them}を圧倒",
      body: "{comp}で{them}に{score}の勝利。ファンはこの試合を覚えているでしょう。",
    },
    shock: {
      title: "{them}に衝撃の勝利",
      body: "ほとんど誰も期待していませんでしたが、{comp}で{them}を{score}で下しました。",
    },
    humiliation: {
      title: "{them}に屈辱の敗戦",
      body: "{comp}で{them}に{score}で敗れました。監督に疑問の声が上がっています。",
    },
    embarrassing: {
      title: "{them}に恥ずべき敗戦",
      body: "勝利が期待されていましたが、{comp}で{them}に{score}で敗れました。",
    },
    cap: {
      title: "{name}が通算{caps}キャップ目",
      body: "{name}は{nation}代表として通算{caps}試合に出場しました。",
    },
    goals: {
      title: "{name}が代表通算{goals}ゴールに到達",
      body: "{name}は{nation}代表として通算{goals}ゴールを挙げました。",
    },
    debut: {
      title: "{name}が初キャップ",
      body: "{opp}戦で代表デビュー: {names}。",
    },
    debuts: {
      title: "{n}人がデビュー",
    },
    milestone: "マイルストーン達成",
    ultimatum: {
      title: "最後通告",
      body: "協会は我慢の限界です。公式戦{matches}試合以内に信頼度を{lifted}%まで回復させなければ、解任されます。",
    },
    eases: {
      title: "プレッシャーが和らぐ",
      body: "結果が好転しました。協会は最後通告を撤回しました。",
    },
    sacked: {
      title: "解任",
      body: "{nation}協会はあなたを解任しました。",
    },
    resigned: {
      title: "辞任しました",
      body: "{nation}代表監督を退任しました。",
    },
    notRenewed: {
      title: "契約非更新",
      body: "{nation}協会はあなたの契約を更新しないことを決定しました。",
    },
    renewed: {
      title: "契約更新",
      body: "{nation}協会はあなたの契約を{date}まで更新しました。",
    },
    extended: {
      title: "あと1年",
      body: "{nation}協会はあなたの契約を1年だけ延長しました。成長の跡を見たいとのことです。",
    },
    coachChange: {
      title: "{nation}が監督交代",
      body: "{nation}は{coach}を新監督に任命しました。",
    },
    coachSacked: {
      title: "{nation}が{coach}を解任",
      body: "{nation}は不振を受けて{coach}監督と袂を分かちました。後任探しが始まっています。",
    },
    coachRetired: {
      title: "{coach}が引退",
      body: "{coach}は{nation}代表監督を退任し、指導者を引退しました。",
    },
    offer: {
      title: "オファー: {nation}",
      body: "{nation}協会があなたを新監督に迎えたいと考えています。オファーの期限は{date}までです。",
    },
    newJob: {
      title: "新たな仕事: {nation}",
      body: "あなたは{nation}の新監督です。",
    },
    tourney: {
      through: "{comp}: 突破",
      throughTo: "{round}に進出しました。",
      throughBare: "突破しました。",
      out: "{comp}: 敗退",
      groupOut: "{group}で突破ならず敗退しました。",
      knockedOut: "{round}で敗退しました。",
      runnersUp: "{comp}: 準優勝",
      lostFinal: "決勝で敗れました。",
    },
    qualified: {
      title: "{finals}への出場権を獲得",
      body: "{finals}への出場権を手にしました。",
    },
    playoff: {
      title: "プレーオフへ",
      body: "{finals}の大陸間プレーオフに進出しました。",
    },
    missedOut: {
      title: "出場権を逃す",
      body: "{finals}への出場を逃しました。",
    },
    finalsGeneric: "本大会",
    injury: {
      title: "{name}が負傷",
      body: "{name}はクラブで{injury}を負い、{date}まで離脱します。",
    },
    newClub: "新天地",
    bigMove: {
      title: "{name}が大型移籍",
      body: "{name}は代表での飛躍を受けて{club}に加入します。",
    },
    move: {
      title: "{name}が移籍",
      body: "{name}が{club}に加入します。",
    },
    prospects: {
      title: "今シーズンの有望株",
      body: "注目していた若手の成長ぶり: {list}。",
    },
    season: {
      title: "{from}–{to}シーズン開幕",
      body: "選手たちは昨シーズンで成長し、夏の移籍市場は閉じました。",
    },
    retired: {
      entry: "{name}（{pos}、{age}歳）",
      entryCaps: "{name}（{pos}、{age}歳、{caps}キャップ）",
    },
    retire: {
      title: "{name}が代表引退",
      body: "{name}（{age}歳、{caps}キャップ）が代表からの引退を発表しました。",
    },
    wonderkid: {
      title: "神童現る: {name}",
      body: "スカウトたちは{club}の{age}歳の{pos}、{name}に熱狂しています。",
    },
    newgen: {
      entry: "{name}（{pos}、{age}歳、{club}）",
    },
    retiredMany: {
      title: "{n}人が引退",
      body: "次の選手たちがスパイクを脱ぎました: {list}。",
    },
    newgens: {
      title: "{n}人の若手が台頭",
      body: "代表資格を持つ新世代: {list}。",
    },
    stadium: {
      build: {
        title: "{stadium}の建設開始",
        body: "協会は{city}に{seats}席のスタジアムを建設中で、{date}に開業予定です。",
      },
      expand: {
        title: "{stadium}を増築へ",
        body: "{city}の{stadium}は、{date}の工事完了後に{seats}席になります。",
      },
      opened: {
        build: "{nation}が{stadium}を開業",
        expand: "{stadium}が増築",
        body: "{city}の{stadium}は{seats}席になりました{ready}。",
      },
      readyFor: "。{comp}の開催準備は万全です",
    },
    champions: {
      title: "{winner}が{comp}を制覇",
      body: "{winner}が王者に輝きました{beat}。",
      beat: "。決勝で{runnerUp}を下しました",
    },
    draw: {
      title: "{comp}: {stage}",
      group: "抽選が行われました。対戦相手は{others}です。",
      tie: "対戦相手は{opp}に決まりました。",
    },
    and: "{a}と{b}",
    host: {
      title: "{list}が{comp}を開催",
      one: "{list}が{comp}を開催します。開幕は{date}です。",
      many: "{list}が{comp}を共催します。開幕は{date}です。",
    },
    placeholder: {
      title: "{team}が出場",
      body: "{team}が{label}を制し、抽選の枠を埋めました。",
    },
  },
  ms: {
    trophy: "初めてのトロフィー: {comp}。",
    world: "世界王者！{nation}が{comp}を制覇。",
    continental: "大陸王者: {comp}。",
    qualification: "{nation}を主要大会へ導きました。",
    worldCup: "{nation}をワールドカップへ導きました。",
    firstWin: "代表監督として初勝利。",
    matches: "代表監督として{n}試合。",
    debuts: "あなたの下で{n}人が初キャップを獲得しました。",
    youthDebuts: "21歳以下の選手5人を代表デビューさせました。",
    unbeaten: "公式戦10試合無敗。",
    top10: "あなたの下で{nation}は世界トップ10入り。",
    no1: "{nation}は世界最強のチームです。",
  },
  review: {
    reached: {
      champions: "優勝",
      knockedOut: "敗退",
      qualified: "出場権獲得",
      notQualified: "出場権を逃す",
      leagueStage: "リーグステージ",
      promoted: "リーグ{letter}に昇格",
      relegated: "リーグ{letter}に降格",
      stayed: "リーグ{letter}に残留",
      runnersUp: "準優勝",
      groups: "グループステージ",
    },
    msg: {
      delightedChampion:
        "協会は大喜びです。{comp}の優勝は誰もが望みすらしなかった快挙で、あなたの評価はかつてないほど高まっています。",
      delighted: "協会は{comp}の結果に大満足です。期待以上の成果を挙げました。",
      satisfied:
        "協会は{comp}の結果に満足しています。任務は果たされました。次はこれを土台に積み上げることが期待されます。",
      disappointed:
        "協会は{comp}の結果に失望しています。もっと期待していましたが、協会の我慢にも限りがあります。",
      ultimatum:
        "{comp}を経て、協会は我慢の限界に達しました。ただちに結果を改善しなければ、結果を出せる人物を探すでしょう。",
      sacked: "{comp}が決定打となりました。協会はあなたの解任を決定しました。",
      contractEnd: "{comp}をもってあなたの契約は終了し、協会は更新しないことを決定しました。",
    },
  },
  fx: {
    friendly: "国際親善試合",
    window: "国際試合期間",
    matchday: "{stage} · 第{n}節",
    groupMatchday: "{stage} · {group} · 第{n}節",
    round: "{round}",
    stageRound: "{stage} · {round}",
    roundLeg: "{round} · 第{leg}戦",
    stageRoundLeg: "{stage} · {round} · 第{leg}戦",
  },
  lineup: {
    nobody: "{pos}を務める選手がいません",
    notInSquad: "{name}（{pos}）は代表メンバーにいません",
    injured: "{name}（{pos}）は負傷中（{label}）",
    suspended: "{name}（{pos}）は出場停止中",
  },
  placeholder: {
    uefa: "UEFAプレーオフ パス{path}",
    path: "プレーオフ パス{path}",
    tournament: "プレーオフ大会",
    qualifier: "予選{n}",
    winner: "{base}の勝者",
    tournamentWinner: "プレーオフ大会 勝者{n}",
    shortIc: "IC {n}",
    shortPo: "PO {path}",
  },
  injury: {
    "hamstring-strain": "ハムストリングの肉離れ",
    "ankle-sprain": "足首の捻挫",
    "calf-strain": "ふくらはぎの肉離れ",
    "groin-strain": "鼠径部の痛み",
    "thigh-strain": "太ももの肉離れ",
    "knee-injury": "膝の負傷",
    "broken-foot": "足の骨折",
    "cruciate-ligament-rupture": "十字靭帯断裂",
    knock: "打撲",
  },
  stage: {
    group: "グループ{name}",
    league: "リーグ",
    leagueN: "リーグ{x}",
    roundOf: "ラウンド{n}",
    "round-of-16": "ベスト16",
    "round-of-32": "ベスト32",
    "quarter-finals": "準々決勝",
    "semi-finals": "準決勝",
    final: "決勝",
    finals: "決勝ラウンド",
    "third-place": "3位決定戦",
    "bronze-final": "3位決定戦",
    "group-stage": "グループステージ",
    "knockout-stage": "決勝トーナメント",
    "league-phase": "リーグフェーズ",
    qualifying: "予選",
    "preliminary-round": "予備予選",
    preliminaryN: "予備予選{n}",
    prelims: "予備予選",
    "first-round": "1回戦",
    "second-round": "2回戦",
    "third-round": "3回戦",
    "fourth-round": "4回戦",
    "fifth-round": "5回戦",
    "final-round": "最終ラウンド",
    "play-offs": "プレーオフ",
    "play-in": "プレーイン",
    "play-off-round": "プレーオフラウンド",
    "play-off-semi-finals": "プレーオフ準決勝",
    "play-off-finals": "プレーオフ決勝",
    "play-off-final": "プレーオフ決勝",
    "play-off-tournament": "プレーオフ大会",
    "promotion-relegation-play-offs": "昇降格プレーオフ",
    "league-a-quarter-finals": "リーグA準々決勝",
    "league-a-finals": "リーグA決勝ラウンド",
    "league-b-finals": "リーグB決勝ラウンド",
    "league-c-finals": "リーグC決勝ラウンド",
  },
  comp: {
    wc: {
      name: "ワールドカップ{year}",
      short: "ワールドカップ",
      plain: "ワールドカップ",
    },
    "wcq-uefa": {
      name: "ワールドカップ{year}予選 · UEFA",
      short: "W杯予選 欧州",
      plain: "ワールドカップ予選 · UEFA",
    },
    "wcq-caf": {
      name: "ワールドカップ{year}予選 · CAF",
      short: "W杯予選 アフリカ",
      plain: "ワールドカップ予選 · CAF",
    },
    "wcq-afc": {
      name: "ワールドカップ{year}予選 · AFC",
      short: "W杯予選 アジア",
      plain: "ワールドカップ予選 · AFC",
    },
    "wcq-concacaf": {
      name: "ワールドカップ{year}予選 · CONCACAF",
      short: "W杯予選 CONCACAF",
      plain: "ワールドカップ予選 · CONCACAF",
    },
    "wcq-conmebol": {
      name: "ワールドカップ{year}予選 · CONMEBOL",
      short: "W杯予選 南米",
      plain: "ワールドカップ予選 · CONMEBOL",
    },
    "wcq-ofc": {
      name: "ワールドカップ{year}予選 · OFC",
      short: "W杯予選 オセアニア",
      plain: "ワールドカップ予選 · OFC",
    },
    "wcq-ic": {
      name: "ワールドカップ{year}プレーオフ大会",
      short: "プレーオフ",
      plain: "ワールドカップ プレーオフ大会",
    },
    euro: {
      name: "UEFA欧州選手権{year}",
      short: "ユーロ",
      plain: "UEFA欧州選手権",
    },
    euroq: {
      name: "UEFA欧州選手権{year}予選",
      short: "ユーロ予選",
      plain: "UEFA欧州選手権予選",
    },
    unl: {
      name: "UEFAネーションズリーグ{year}–{year2}",
      short: "ネーションズリーグ",
      plain: "UEFAネーションズリーグ",
    },
    finalissima: {
      name: "フィナリッシマ{year}",
      short: "フィナリッシマ",
      plain: "フィナリッシマ",
    },
    afcon: {
      name: "アフリカ・ネイションズカップ{year}",
      short: "AFCON",
      plain: "アフリカ・ネイションズカップ",
    },
    afconq: {
      name: "アフリカ・ネイションズカップ{year}予選",
      short: "AFCON予選",
      plain: "アフリカ・ネイションズカップ予選",
    },
    "asian-cup": {
      name: "AFCアジアカップ{year}",
      short: "アジアカップ",
      plain: "AFCアジアカップ",
    },
    "asian-cupq": {
      name: "AFCアジアカップ{year}予選",
      short: "アジアカップ予選",
      plain: "AFCアジアカップ予選",
    },
    copa: {
      name: "コパ・アメリカ{year}",
      short: "コパ・アメリカ",
      plain: "コパ・アメリカ",
    },
    "ofc-cup": {
      name: "OFCネーションズカップ{year}",
      short: "OFCネーションズカップ",
      plain: "OFCネーションズカップ",
    },
    cnl: {
      name: "CONCACAFネーションズリーグ{year}–{year2}",
      short: "CONCACAF NL",
      plain: "CONCACAFネーションズリーグ",
    },
    gcq: {
      name: "CONCACAFゴールドカップ{year}予備予選",
      short: "ゴールドカップ予備予選",
      plain: "CONCACAFゴールドカップ予備予選",
    },
    "gold-cup": {
      name: "CONCACAFゴールドカップ{year}",
      short: "ゴールドカップ",
      plain: "CONCACAFゴールドカップ",
    },
    "arab-cup": {
      name: "アラブカップ{year}",
      short: "アラブカップ",
      plain: "アラブカップ",
    },
    "gulf-cup": {
      name: "アラビアン・ガルフカップ{year}",
      short: "ガルフカップ",
      plain: "アラビアン・ガルフカップ",
    },
    aff: {
      name: "ASEAN選手権{year}",
      short: "ASEAN選手権",
      plain: "ASEAN選手権",
    },
    "asean-cup": {
      name: "ASEANカップ{year}",
      short: "ASEANカップ",
      plain: "ASEANカップ",
    },
    "asean-challenge": {
      name: "ASEANチャレンジカップ{year}",
      short: "ASEANチャレンジカップ",
      plain: "ASEANチャレンジカップ",
    },
    "inv-mar": {
      name: "3月招待大会{year}",
      short: "3月招待大会",
      plain: "3月招待大会",
    },
    "inv-jun": {
      name: "6月招待大会{year}",
      short: "6月招待大会",
      plain: "6月招待大会",
    },
    "inv-sep": {
      name: "秋の招待大会{year}",
      short: "秋の招待大会",
      plain: "秋の招待大会",
    },
    "inv-nov": {
      name: "11月招待大会{year}",
      short: "11月招待大会",
      plain: "11月招待大会",
    },
    e1: {
      name: "EAFF E-1選手権{year}",
      short: "E-1",
      plain: "EAFF E-1選手権",
    },
    cafa: {
      name: "CAFAネーションズカップ{year}",
      short: "CAFAネーションズカップ",
      plain: "CAFAネーションズカップ",
    },
    waff: {
      name: "WAFF選手権{year}",
      short: "WAFF選手権",
      plain: "WAFF選手権",
    },
    saff: {
      name: "SAFF選手権{year}",
      short: "SAFF選手権",
      plain: "SAFF選手権",
    },
    cosafa: {
      name: "COSAFAカップ{year}",
      short: "COSAFAカップ",
      plain: "COSAFAカップ",
    },
    cecafa: {
      name: "CECAFAシニア・チャレンジカップ{year}",
      short: "CECAFAカップ",
      plain: "CECAFAシニア・チャレンジカップ",
    },
    wafu: {
      name: "WAFUゾーンカップ{year}",
      short: "WAFUカップ",
      plain: "WAFUゾーンカップ",
    },
    baltic: {
      name: "バルティックカップ{year}",
      short: "バルティックカップ",
      plain: "バルティックカップ",
    },
  },
  role: {
    stopper: {
      label: "ストッパー",
      blurb: "前に出てボールを奪い、空中戦をすべて制する。ボールを持つと頼りない。",
    },
    "ball-playing": {
      label: "ビルドアップ型DF",
      blurb: "ボールを持って中盤へ上がる。タックルはやや軽い。",
    },
    cover: {
      label: "カバーリングDF",
      blurb: "深く構えて安全に守る。ファウルも少なく、攻撃の起点にもなりにくい。",
    },
    "defensive-full-back": {
      label: "守備的サイドバック",
      blurb: "持ち場を守ってタックルする。攻め上がらない。",
    },
    "wing-back": {
      label: "ウイングバック",
      blurb: "サイドを一人で上下し、クロスやシュートを放つ。背後にスペースを空ける。",
    },
    "inverted-full-back": {
      label: "偽サイドバック",
      blurb: "中盤に入ってビルドアップに加わる。サイドは明け渡す。",
    },
    anchor: {
      label: "アンカー",
      blurb: "最終ラインの前に陣取り、守備を守ってプレーをシンプルにする。",
    },
    "ball-winner": {
      label: "ボールハンター",
      blurb: "中盤のあちこちでボールを追い回し、ファウルも多い。",
    },
    "deep-playmaker": {
      label: "ディープ・ライイング・プレーメーカー",
      blurb: "低い位置から試合を操る。守備のカバーは薄くなる。",
    },
    "box-to-box": {
      label: "ボックス・トゥ・ボックス",
      blurb: "ピッチ中を走り回り、遅れてペナルティエリアに入ってくる。",
    },
    playmaker: {
      label: "プレーメーカー",
      blurb: "テンポを作り、決定的なパスを通す。守備は控えめ。",
    },
    destroyer: {
      label: "デストロイヤー",
      blurb: "相手の攻撃を潰し、ファウルも多い。攻撃への貢献は小さい。",
    },
    "advanced-playmaker": {
      label: "アドバンスド・プレーメーカー",
      blurb: "ライン間でプレーしてチャンスを作る。自らのゴールは少ない。",
    },
    "shadow-striker": {
      label: "シャドーストライカー",
      blurb: "FWの背後から走り込んでシュートを放つ。チャンスメイクは少なめ。",
    },
    tracker: {
      label: "トラッカー",
      blurb: "前線から追い、戻って守備もする。攻撃の脅威は小さい。",
    },
    winger: {
      label: "ウイング",
      blurb: "タッチライン際に張り、クロスを供給する。",
    },
    "inside-forward": {
      label: "インサイドフォワード",
      blurb: "中に切り込んでシュートを狙う。幅やクロスは減る。",
    },
    "tracking-winger": {
      label: "守備的ウイング",
      blurb: "戻ってサイドバックを助ける。攻め上がりは控えめ。",
    },
    "target-man": {
      label: "ターゲットマン",
      blurb: "空中戦に勝ち、ボールを収める。決定力は鋭くない。",
    },
    poacher: {
      label: "ポーチャー",
      blurb: "ペナルティエリアでチャンスを待つ。それ以外はしない。",
    },
    "complete-forward": {
      label: "コンプリートフォワード",
      blurb: "得点し、つなぎ、チャンスも作る。",
    },
    "pressing-forward": {
      label: "プレッシングフォワード",
      blurb: "前線から守備陣を追い回す。ゴール前の脅威は小さい。",
    },
  },
  arch: {
    "shot-stopper": {
      label: "シュートストッパー",
      blurb: "ゴールラインを支配し、止められそうにないシュートも止める。",
    },
    "sweeper-keeper": {
      label: "スイーパーキーパー",
      blurb: "最終ラインの背後を掃除し、攻撃の起点にもなる。ライン上はやや不安定。",
    },
    stopper: {
      label: "ストッパー",
      blurb: "競り合いに勝ち、空中戦で跳ね返す。ビルドアップへの貢献は小さい。",
    },
    "ball-playing-defender": {
      label: "ビルドアップ型DF",
      blurb: "最終ラインから攻撃を組み立てる。タックルはやや軽い。",
    },
    "defensive-full-back": {
      label: "守備的サイドバック",
      blurb: "後ろに残り、タックルしてサイドをカバーする。",
    },
    "attacking-full-back": {
      label: "攻撃的サイドバック",
      blurb: "オーバーラップしてクロスを上げ、ペナルティエリアにも入る。背後にスペースを空ける。",
    },
    "ball-winner": {
      label: "ボールハンター",
      blurb: "最終ラインの前で相手の攻撃を潰し、ファウルも犯す。",
    },
    "deep-playmaker": {
      label: "ディープ・ライイング・プレーメーカー",
      blurb: "低い位置から長いパスで試合を操る。",
    },
    "box-to-box": {
      label: "ボックス・トゥ・ボックス",
      blurb: "ピッチの隅々までカバーし、遅れてペナルティエリアに入ってくる。",
    },
    playmaker: {
      label: "プレーメーカー",
      blurb: "テンポを作り、決定的なパスを通す。",
    },
    creator: {
      label: "クリエイター",
      blurb: "ライン間でプレーする。ゴールよりアシストが多い。",
    },
    "shadow-striker": {
      label: "シャドーストライカー",
      blurb: "FWの背後から走り込み、自らもゴールを奪う。",
    },
    winger: {
      label: "ウイング",
      blurb: "タッチライン際に張り、クロスを供給する。",
    },
    "inside-forward": {
      label: "インサイドフォワード",
      blurb: "サイドから中に切り込んでシュートを狙う。",
    },
    "target-man": {
      label: "ターゲットマン",
      blurb: "空中戦に勝ち、ボールを収める。決定力は鋭くない。",
    },
    poacher: {
      label: "ポーチャー",
      blurb: "ペナルティエリアに棲みつき、こぼれ球を仕留める。それ以外はほぼしない。",
    },
    "complete-forward": {
      label: "コンプリートフォワード",
      blurb: "得点し、つなぎ、チャンスも作る。",
    },
  },
  rule: {
    "behind-high-line": "高いラインの背後へのボール",
    "counter-into-deep-block": "引いて守る相手にはカウンターの余地がない",
    "width-into-back-five": "5バックには幅を使っても無駄",
    "width-into-open-flanks": "サイドが空いたフラット4に対する幅",
    "patience-into-press": "ハイプレスに対するじっくりしたビルドアップ",
    "direct-past-press": "ハイプレスを越えるダイレクトなプレー",
    "lone-striker-into-back-three": "センターバック3人に対する1トップ",
    "two-strikers-into-flat-four": "フラット4に対する2トップ",
    "midfield-numbers": "中央の人数で上回る",
    "midfield-outnumbered": "中央で人数が足りない",
    "press-patient-side": "じっくり構える相手へのハイプレス",
    "narrow-into-wide": "狭く構える側が、幅を使う相手に対し中央を固める",
  },
  badge: {
    "big-game": {
      label: "大一番に強い",
      text: "決勝や決戦では実力以上の力を発揮し、PKでも動じない。",
    },
    reliable: {
      label: "安定",
      text: "ほぼ毎試合、実力どおりのプレーをする。",
    },
    erratic: {
      label: "ムラっ気",
      text: "試合ごとの評価が大きく振れる。好調な日もあれば、不調な日もある。",
    },
    "injury-prone": {
      label: "怪我がち",
      text: "試合中に打撲などを負いやすい。",
    },
    "tires-early": {
      label: "スタミナ切れが早い",
      text: "若い選手より早くバテてしまう。",
    },
  },
  bond: {
    clubmates: "クラブの仲間",
    friends: "親友",
    feud: "不仲",
  },
  spirit: {
    tight: "結束",
    good: "良好",
    neutral: "普通",
    uneasy: "ぎくしゃく",
    divided: "分裂",
  },
  scout: {
    trait: {
      attack: "攻撃的",
      cautious: "慎重",
      highLine: "高いライン",
      deepLine: "低いライン",
      wide: "幅を使う",
      narrow: "中央重視",
      counter: "カウンター",
      highPress: "ハイプレス",
      dropsOff: "引いて守る",
      direct: "ダイレクト",
      patient: "じっくり",
      balanced: "バランス型",
    },
    reason: {
      star: "チーム最高の選手",
      threat: "最大の得点源",
      creator: "チャンスの多くを演出",
      weak: "弱点",
    },
    level: {
      "0": "低め",
      "1": "標準",
      "2": "高め",
    },
    width: {
      "0": "狭い",
      "1": "標準",
      "2": "広い",
    },
    change: {
      line: "守備ライン: {from} → {to}",
      width: "幅: {from} → {to}",
      counter: "カウンター: {from} → {to}",
    },
    on: "オン",
    off: "オフ",
  },
}

export default engine
