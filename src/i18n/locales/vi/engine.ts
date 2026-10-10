import type en from "../en/engine"

const engine: typeof en = {
  obj: {
    qualify: "Giành vé dự {comp}",
    unbeaten: "{text} không thua",
    promotion: "Thăng hạng từ League {letter}",
    relegation: "Tránh xuống hạng khỏi League {letter}",
    win: "Vô địch {comp}",
    reach: {
      knockout: "Vào vòng loại trực tiếp của {comp}",
      "quarter-finals": "Vào tứ kết {comp}",
      "semi-finals": "Vào bán kết {comp}",
      final: "Vào chung kết {comp}",
    },
    debuts: "Cho {count} cầu thủ từ 21 tuổi trở xuống ra mắt đội tuyển trong năm {year}",
    raiseNote:
      "Phần thưởng ×{reward}; nếu không đạt sẽ mất {cost} tín nhiệm, sau đó mục tiêu ban đầu được áp dụng lại",
    lowerNote: "Mất {cost} tín nhiệm ngay bây giờ; phần thưởng giảm một nửa",
    lowerNeeds: "Ban lãnh đạo chỉ lắng nghe khi mức tín nhiệm từ {n}% trở lên",
  },
  news: {
    raise: {
      title: "Bạn nâng cao tiêu chuẩn",
      body: 'Bạn đã hứa với liên đoàn nhiều hơn: "{text}". Hãy thực hiện được, họ sẽ không quên điều đó.',
    },
    lower: {
      title: "Đã hạ kỳ vọng",
      body: 'Liên đoàn miễn cưỡng đồng ý với một mục tiêu thấp hơn: "{text}".',
    },
    broken: {
      title: "Thất hứa",
      body: 'Bạn đã hứa sẽ "{promised}" nhưng không đạt được. Liên đoàn vẫn kỳ vọng bạn sẽ "{target}".',
    },
    met: {
      title: "Hoàn thành mục tiêu",
      body: 'Liên đoàn rất hài lòng: "{text}" — đã hoàn thành. Sự hậu thuẫn thêm cũng sẽ đến với các học viện.',
    },
    missed: {
      title: "Không đạt mục tiêu",
      body: 'Liên đoàn không hài lòng: chúng ta đã không thể "{text}".',
    },
    friendly: "một trận giao hữu",
    derbyWin: {
      title: "Ngày derby thuộc về {us}",
      body: "Chiến thắng {score} trước kình địch {them} ở {comp}. Đường phố ngập tràn niềm vui.",
    },
    derbyLoss: {
      title: "Thua derby trước {them}",
      body: "Thua {them} {score} ở {comp}. CĐV sẽ không sớm quên trận này.",
    },
    derbyDraw: {
      title: "Hòa nhau trong trận derby",
      body: "{us} và {them} hòa {score} ở {comp}. Không bên nào giành được quyền tự hào.",
    },
    fans: {
      angry: {
        title: "CĐV quay lưng với huấn luyện viên",
        body: "CĐV {nation} đã bày tỏ rõ sự giận dữ. Ban lãnh đạo đang lắng nghe.",
      },
      adore: {
        title: "CĐV đứng về phía bạn",
        body: "CĐV {nation} đang hát vang tên huấn luyện viên. Sân vận động sẽ rực lửa.",
      },
    },
    invitational: {
      title: "{host} sẽ tổ chức {comp}",
      body: "{host} sẽ đăng cai {comp} với sự tham dự của {teams}. Giải khai mạc vào {date}.",
    },
    invite: {
      title: "Lời mời từ {host}",
      body: "{host} mời chúng ta dự giải đấu {n} đội trong kỳ thi đấu bắt đầu từ {date}. Họ cần một câu trả lời.",
    },
    inviteLapsed: {
      title: "Lời mời đã hết hạn",
      body: "Chúng ta đã không trả lời lời mời của {host} kịp thời; giải đấu vẫn diễn ra mà không có chúng ta.",
    },
    inviteOff: {
      title: "Giải đấu bị hủy",
      body: "Giải đấu của {host} không thể diễn ra: không phải đội nào cũng còn rảnh.",
    },
    riot: {
      title: "{us} thắng đậm {them}",
      body: "Chiến thắng {score} trước {them} ở {comp}. CĐV sẽ nhớ mãi trận này.",
    },
    shock: {
      title: "Bất ngờ thắng {them}",
      body: "Ít người tin vào chúng ta, nhưng chúng ta đã đánh bại {them} {score} ở {comp}.",
    },
    humiliation: {
      title: "Bẽ mặt trước {them}",
      body: "Thất bại {score} trước {them} ở {comp}. Huấn luyện viên đang bị chất vấn.",
    },
    embarrassing: {
      title: "Thất bại đáng xấu hổ trước {them}",
      body: "Chúng ta được kỳ vọng sẽ thắng, nhưng lại thua {them} {score} ở {comp}.",
    },
    cap: {
      title: "{name} có lần khoác áo tuyển thứ {caps}",
      body: "{name} đã có {caps} lần khoác áo {nation}.",
    },
    goals: {
      title: "{name} đạt {goals} bàn thắng cho đội tuyển",
      body: "{name} đã ghi {goals} bàn cho {nation}.",
    },
    debut: {
      title: "Lần đầu khoác áo tuyển của {name}",
      body: "Ra mắt đội tuyển trong trận gặp {opp}: {names}.",
    },
    debuts: {
      title: "{n} cầu thủ ra mắt",
    },
    milestone: "Đạt cột mốc",
    ultimatum: {
      title: "Cảnh báo cuối cùng",
      body: "Liên đoàn đã hết kiên nhẫn. Hãy nâng mức tín nhiệm lên {lifted}% trong {matches} trận chính thức, nếu không bạn sẽ bị thay thế.",
    },
    eases: {
      title: "Áp lực dịu đi",
      body: "Kết quả đã khởi sắc. Liên đoàn đã rút lại cảnh báo cuối cùng.",
    },
    sacked: {
      title: "Bị sa thải",
      body: "Liên đoàn {nation} đã miễn nhiệm bạn.",
    },
    resigned: {
      title: "Bạn đã từ chức",
      body: "Bạn đã rời cương vị huấn luyện viên trưởng của {nation}.",
    },
    notRenewed: {
      title: "Hợp đồng không được gia hạn",
      body: "Liên đoàn {nation} quyết định không gia hạn hợp đồng của bạn.",
    },
    renewed: {
      title: "Hợp đồng được gia hạn",
      body: "Liên đoàn {nation} đã gia hạn hợp đồng của bạn đến {date}.",
    },
    extended: {
      title: "Thêm một năm nữa",
      body: "Liên đoàn {nation} đã gia hạn hợp đồng của bạn đúng một năm. Họ muốn thấy sự tiến bộ.",
    },
    coachChange: {
      title: "{nation} thay huấn luyện viên",
      body: "{nation} đã bổ nhiệm {coach} làm huấn luyện viên trưởng mới.",
    },
    coachSacked: {
      title: "{nation} sa thải {coach}",
      body: "{nation} đã chia tay huấn luyện viên trưởng {coach} sau chuỗi kết quả kém. Việc tìm người kế nhiệm đã bắt đầu.",
    },
    coachRetired: {
      title: "{coach} giải nghệ",
      body: "{coach} đã rời cương vị huấn luyện viên trưởng của {nation} và giải nghệ khỏi nghề huấn luyện.",
    },
    offer: {
      title: "Lời mời làm việc: {nation}",
      body: "Liên đoàn {nation} muốn bạn làm huấn luyện viên trưởng mới. Lời mời có hiệu lực đến {date}.",
    },
    newJob: {
      title: "Công việc mới: {nation}",
      body: "Bạn là huấn luyện viên trưởng mới của {nation}.",
    },
    tourney: {
      through: "{comp}: đi tiếp",
      throughTo: "Chúng ta đã vào {round}.",
      throughBare: "Chúng ta đã đi tiếp.",
      out: "{comp}: bị loại",
      groupOut: "Chúng ta kết thúc {group} mà không đi tiếp.",
      knockedOut: "Chúng ta đã bị loại ở {round}.",
      runnersUp: "{comp}: á quân",
      lostFinal: "Chúng ta đã thua trận chung kết.",
    },
    qualified: {
      title: "Giành vé dự {finals}",
      body: "Chúng ta đã giành suất dự {finals}.",
    },
    playoff: {
      title: "Vào play-off",
      body: "Chúng ta đã vào play-off liên lục địa để tranh vé dự {finals}.",
    },
    missedOut: {
      title: "Không giành được vé",
      body: "Chúng ta đã lỡ hẹn với {finals}.",
    },
    finalsGeneric: "vòng chung kết",
    injury: {
      title: "{name} chấn thương",
      body: "{name} dính chấn thương {injury} ở cấp câu lạc bộ và sẽ vắng mặt đến {date}.",
    },
    newClub: "một câu lạc bộ mới",
    bigMove: {
      title: "{name} có bến đỗ lớn",
      body: "{name} gia nhập {club} nhờ bước đột phá ở đội tuyển.",
    },
    move: {
      title: "{name} đổi bến đỗ",
      body: "{name} gia nhập {club}.",
    },
    prospects: {
      title: "Các cầu thủ triển vọng của bạn mùa này",
      body: "Các cầu thủ trẻ bạn theo dõi đã phát triển ra sao: {list}.",
    },
    season: {
      title: "Mùa giải {from}–{to} bắt đầu",
      body: "Các cầu thủ đã phát triển trong mùa giải vừa qua và kỳ chuyển nhượng mùa hè đã đóng cửa.",
    },
    retired: {
      entry: "{name} ({pos}, {age})",
      entryCaps: "{name} ({pos}, {age}, {caps} lần khoác áo)",
    },
    retire: {
      title: "{name} giã từ đội tuyển",
      body: "{name} ({age} tuổi, {caps} lần khoác áo) đã tuyên bố giã từ đội tuyển quốc gia.",
    },
    wonderkid: {
      title: "Thần đồng xuất hiện: {name}",
      body: "Các tuyển trạch viên đang ngợi ca {name}, {pos} {age} tuổi của {club}.",
    },
    newgen: {
      entry: "{name} ({pos}, {age}, {club})",
    },
    retiredMany: {
      title: "{n} cầu thủ giải nghệ",
      body: "Những cầu thủ này đã treo giày: {list}.",
    },
    newgens: {
      title: "{n} cầu thủ trẻ trưởng thành",
      body: "Thế hệ mới đủ điều kiện khoác áo đội tuyển: {list}.",
    },
    stadium: {
      build: {
        title: "Khởi công {stadium}",
        body: "Liên đoàn đang xây một sân vận động {seats} chỗ ở {city}, dự kiến khánh thành vào {date}.",
      },
      expand: {
        title: "{stadium} sẽ được mở rộng",
        body: "{stadium} ở {city} sẽ chứa {seats} chỗ khi hoàn thành công trình vào {date}.",
      },
      opened: {
        build: "{nation} khánh thành {stadium}",
        expand: "{stadium} đã được mở rộng",
        body: "{stadium} ở {city} nay có sức chứa {seats}{ready}.",
      },
      readyFor: ", sẵn sàng cho {comp}",
    },
    champions: {
      title: "{winner} vô địch {comp}",
      body: "{winner} là nhà vô địch{beat}.",
      beat: ", đánh bại {runnerUp} ở trận chung kết",
    },
    draw: {
      title: "{comp}: {stage}",
      group: "Lễ bốc thăm đã hoàn tất. Chúng ta sẽ gặp {others}.",
      tie: "Chúng ta đã được bốc thăm gặp {opp}.",
    },
    and: "{a} và {b}",
    host: {
      title: "{list} đăng cai {comp}",
      one: "{list} sẽ đăng cai {comp}, khai mạc từ {date}.",
      many: "{list} sẽ đồng đăng cai {comp}, khai mạc từ {date}.",
    },
    placeholder: {
      title: "{team} giành suất",
      body: "{team} vô địch {label} và lấp vào vị trí đó trong lễ bốc thăm.",
    },
  },
  ms: {
    trophy: "Chiếc cúp đầu tiên của bạn: {comp}.",
    world: "Nhà vô địch thế giới! {nation} đăng quang {comp}.",
    continental: "Nhà vô địch châu lục của bạn: {comp}.",
    qualification: "Bạn đã đưa {nation} đến một giải đấu lớn.",
    worldCup: "Bạn đã đưa {nation} đến World Cup.",
    firstWin:
      "Chiến thắng đầu tiên của bạn trên cương vị huấn luyện viên trưởng đội tuyển quốc gia.",
    matches: "{n} trận trên cương vị huấn luyện viên trưởng đội tuyển quốc gia.",
    debuts: "{n} cầu thủ đã có lần đầu khoác áo tuyển dưới thời bạn.",
    youthDebuts: "Năm cầu thủ từ 21 tuổi trở xuống đã được thử lửa ở cấp độ quốc tế.",
    unbeaten: "Mười trận chính thức không thua.",
    top10: "{nation} nằm trong top mười thế giới dưới thời bạn.",
    no1: "{nation} là đội mạnh nhất thế giới.",
  },
  review: {
    reached: {
      champions: "Nhà vô địch",
      knockedOut: "Bị loại",
      qualified: "Giành vé",
      notQualified: "Không giành được vé",
      leagueStage: "Vòng league",
      promoted: "Thăng hạng lên League {letter}",
      relegated: "Xuống hạng League {letter}",
      stayed: "Trụ lại League {letter}",
      runnersUp: "Á quân",
      groups: "Vòng bảng",
    },
    msg: {
      delightedChampion:
        "Liên đoàn vô cùng hài lòng. Vô địch {comp} vượt xa những gì bất kỳ ai dám hy vọng, và vị thế của bạn chưa bao giờ cao đến thế.",
      delighted:
        "Liên đoàn rất hài lòng với {comp}. Bạn đã mang lại nhiều hơn những gì họ yêu cầu.",
      satisfied:
        "Liên đoàn hài lòng với {comp}. Nhiệm vụ đã hoàn thành; giờ họ kỳ vọng bạn tiếp tục phát huy.",
      disappointed:
        "Liên đoàn thất vọng với {comp}. Họ kỳ vọng nhiều hơn, và sự kiên nhẫn của họ không phải vô hạn.",
      ultimatum:
        "Sau {comp}, liên đoàn đã hết kiên nhẫn. Kết quả phải cải thiện ngay lập tức, nếu không họ sẽ tìm người có thể làm được.",
      sacked: "{comp} là giọt nước tràn ly. Liên đoàn đã quyết định miễn nhiệm bạn.",
      contractEnd:
        "{comp} đánh dấu sự kết thúc hợp đồng của bạn, và liên đoàn đã quyết định không gia hạn.",
    },
  },
  fx: {
    friendly: "Giao hữu quốc tế",
    window: "Kỳ FIFA Days",
    matchday: "{stage} · Lượt trận {n}",
    groupMatchday: "{stage} · {group} · Lượt trận {n}",
    round: "{round}",
    stageRound: "{stage} · {round}",
    roundLeg: "{round} · Lượt {leg}",
    stageRoundLeg: "{stage} · {round} · Lượt {leg}",
  },
  lineup: {
    nobody: "Không có ai chơi ở vị trí {pos}",
    notInSquad: "{name} ({pos}) không có trong đội hình",
    injured: "{name} ({pos}) bị chấn thương ({label})",
    suspended: "{name} ({pos}) bị treo giò",
  },
  placeholder: {
    uefa: "Play-off UEFA nhánh {path}",
    path: "Play-off nhánh {path}",
    tournament: "Giải play-off",
    qualifier: "Vòng loại {n}",
    winner: "Đội thắng {base}",
    tournamentWinner: "Đội thắng giải play-off {n}",
    shortIc: "LL {n}",
    shortPo: "PO {path}",
  },
  injury: {
    "hamstring-strain": "Căng cơ gân kheo",
    "ankle-sprain": "Bong gân mắt cá",
    "calf-strain": "Căng cơ bắp chân",
    "groin-strain": "Căng cơ háng",
    "thigh-strain": "Căng cơ đùi",
    "knee-injury": "Chấn thương đầu gối",
    "broken-foot": "Gãy xương bàn chân",
    "cruciate-ligament-rupture": "Đứt dây chằng chéo",
    knock: "Va chạm nhẹ",
  },
  stage: {
    group: "Bảng {name}",
    league: "League",
    leagueN: "League {x}",
    roundOf: "Vòng {n} đội",
    "round-of-16": "Vòng 16 đội",
    "round-of-32": "Vòng 32 đội",
    "quarter-finals": "Tứ kết",
    "semi-finals": "Bán kết",
    final: "Chung kết",
    finals: "Vòng chung kết",
    "third-place": "Tranh hạng ba",
    "bronze-final": "Chung kết tranh hạng ba",
    "group-stage": "Vòng bảng",
    "knockout-stage": "Vòng loại trực tiếp",
    "league-phase": "Vòng league",
    qualifying: "Vòng loại",
    "preliminary-round": "Vòng sơ loại",
    preliminaryN: "Vòng sơ loại {n}",
    prelims: "Sơ loại",
    "first-round": "Vòng một",
    "second-round": "Vòng hai",
    "third-round": "Vòng ba",
    "fourth-round": "Vòng bốn",
    "fifth-round": "Vòng năm",
    "final-round": "Vòng cuối",
    "play-offs": "Play-off",
    "play-in": "Play-In",
    "play-off-round": "Vòng play-off",
    "play-off-semi-finals": "Bán kết play-off",
    "play-off-finals": "Chung kết play-off",
    "play-off-final": "Chung kết play-off",
    "play-off-tournament": "Giải play-off",
    "promotion-relegation-play-offs": "Play-off thăng hạng/xuống hạng",
    "league-a-quarter-finals": "Tứ kết League A",
    "league-a-finals": "Chung kết League A",
    "league-b-finals": "Chung kết League B",
    "league-c-finals": "Chung kết League C",
  },
  comp: {
    wc: {
      name: "World Cup {year}",
      short: "World Cup",
      plain: "World Cup",
    },
    "wcq-uefa": {
      name: "Vòng loại World Cup {year} · UEFA",
      short: "VL châu Âu",
      plain: "Vòng loại World Cup · UEFA",
    },
    "wcq-caf": {
      name: "Vòng loại World Cup {year} · CAF",
      short: "VL châu Phi",
      plain: "Vòng loại World Cup · CAF",
    },
    "wcq-afc": {
      name: "Vòng loại World Cup {year} · AFC",
      short: "VL châu Á",
      plain: "Vòng loại World Cup · AFC",
    },
    "wcq-concacaf": {
      name: "Vòng loại World Cup {year} · CONCACAF",
      short: "VL CONCACAF",
      plain: "Vòng loại World Cup · CONCACAF",
    },
    "wcq-conmebol": {
      name: "Vòng loại World Cup {year} · CONMEBOL",
      short: "VL Nam Mỹ",
      plain: "Vòng loại World Cup · CONMEBOL",
    },
    "wcq-ofc": {
      name: "Vòng loại World Cup {year} · OFC",
      short: "VL châu Đại Dương",
      plain: "Vòng loại World Cup · OFC",
    },
    "wcq-ic": {
      name: "Giải play-off World Cup {year}",
      short: "Play-off",
      plain: "Giải play-off World Cup",
    },
    euro: {
      name: "UEFA Euro {year}",
      short: "Euro",
      plain: "UEFA Euro",
    },
    euroq: {
      name: "Vòng loại UEFA Euro {year}",
      short: "VL Euro",
      plain: "Vòng loại UEFA Euro",
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
      name: "Cúp bóng đá châu Phi {year}",
      short: "AFCON",
      plain: "Cúp bóng đá châu Phi",
    },
    afconq: {
      name: "Vòng loại Cúp bóng đá châu Phi {year}",
      short: "VL AFCON",
      plain: "Vòng loại Cúp bóng đá châu Phi",
    },
    "asian-cup": {
      name: "AFC Asian Cup {year}",
      short: "Asian Cup",
      plain: "AFC Asian Cup",
    },
    "asian-cupq": {
      name: "Vòng loại AFC Asian Cup {year}",
      short: "VL Asian Cup",
      plain: "Vòng loại AFC Asian Cup",
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
      name: "Vòng sơ loại CONCACAF Gold Cup {year}",
      short: "Sơ loại Gold Cup",
      plain: "Vòng sơ loại CONCACAF Gold Cup",
    },
    "gold-cup": {
      name: "CONCACAF Gold Cup {year}",
      short: "Gold Cup",
      plain: "CONCACAF Gold Cup",
    },
    "arab-cup": {
      name: "Cúp bóng đá Ả Rập {year}",
      short: "Cúp Ả Rập",
      plain: "Cúp bóng đá Ả Rập",
    },
    "gulf-cup": {
      name: "Cúp vùng Vịnh Ả Rập {year}",
      short: "Cúp vùng Vịnh",
      plain: "Cúp vùng Vịnh Ả Rập",
    },
    aff: {
      name: "Giải vô địch ASEAN {year}",
      short: "Giải vô địch ASEAN",
      plain: "Giải vô địch ASEAN",
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
      name: "Giải mời tháng Ba {year}",
      short: "Giải mời tháng Ba",
      plain: "Giải mời tháng Ba",
    },
    "inv-jun": {
      name: "Giải mời tháng Sáu {year}",
      short: "Giải mời tháng Sáu",
      plain: "Giải mời tháng Sáu",
    },
    "inv-sep": {
      name: "Giải mời mùa thu {year}",
      short: "Giải mời mùa thu",
      plain: "Giải mời mùa thu",
    },
    "inv-nov": {
      name: "Giải mời tháng Mười Một {year}",
      short: "Giải mời tháng Mười Một",
      plain: "Giải mời tháng Mười Một",
    },
    e1: {
      name: "Giải vô địch EAFF E-1 {year}",
      short: "E-1",
      plain: "Giải vô địch EAFF E-1",
    },
    cafa: {
      name: "CAFA Nations Cup {year}",
      short: "CAFA Nations Cup",
      plain: "CAFA Nations Cup",
    },
    waff: {
      name: "Giải vô địch WAFF {year}",
      short: "Giải vô địch WAFF",
      plain: "Giải vô địch WAFF",
    },
    saff: {
      name: "Giải vô địch SAFF {year}",
      short: "Giải vô địch SAFF",
      plain: "Giải vô địch SAFF",
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
      name: "Cúp Baltic {year}",
      short: "Cúp Baltic",
      plain: "Cúp Baltic",
    },
  },
  role: {
    stopper: {
      label: "Trung vệ truy cản",
      blurb: "Bước lên tranh bóng và đánh đầu mọi tình huống; ít hỗ trợ khi có bóng.",
    },
    "ball-playing": {
      label: "Trung vệ chơi bóng",
      blurb: "Dâng lên tuyến giữa cùng bóng; tranh cướp nhẹ hơn.",
    },
    cover: {
      label: "Trung vệ bọc lót",
      blurb: "Lùi sâu và chắc chắn; hiếm khi phạm lỗi, hiếm khi khởi xướng pha bóng.",
    },
    "defensive-full-back": {
      label: "Hậu vệ biên phòng ngự",
      blurb: "Giữ vững đường biên và tranh cướp; không dâng cao.",
    },
    "wing-back": {
      label: "Hậu vệ cánh",
      blurb: "Chạy dọc cả đường biên, tạt bóng và sút; để lại khoảng trống phía sau.",
    },
    "inverted-full-back": {
      label: "Hậu vệ biên cài trong",
      blurb: "Thu vào giữa sân để triển khai bóng; bỏ ngỏ đường biên.",
    },
    anchor: {
      label: "Tiền vệ đánh chặn",
      blurb: "Đứng trước hàng phòng ngự; che chắn và chơi đơn giản.",
    },
    "ball-winner": {
      label: "Tiền vệ thu hồi bóng",
      blurb: "Săn bóng khắp khu trung tuyến và phạm lỗi khi làm vậy.",
    },
    "deep-playmaker": {
      label: "Tiền vệ kiến thiết lùi sâu",
      blurb: "Điều phối từ phía sau; bọc lót cho hàng thủ ít hơn.",
    },
    "box-to-box": {
      label: "Tiền vệ box-to-box",
      blurb: "Bao quát cả sân và xuất hiện muộn trong vòng cấm.",
    },
    playmaker: {
      label: "Nhạc trưởng",
      blurb: "Định đoạt nhịp độ và tìm đường chuyền quyết định; ít phòng ngự hơn.",
    },
    destroyer: {
      label: "Tiền vệ phá bóng",
      blurb: "Phá lối chơi và hay phạm lỗi; đóng góp ít khi tấn công.",
    },
    "advanced-playmaker": {
      label: "Tiền vệ kiến thiết dâng cao",
      blurb: "Chơi giữa các tuyến và tạo cơ hội; tự ghi bàn ít hơn.",
    },
    "shadow-striker": {
      label: "Tiền đạo bóng ma",
      blurb: "Băng lên từ phía sau tiền đạo và dứt điểm; kiến tạo ít hơn.",
    },
    tracker: {
      label: "Tiền vệ lùi về hỗ trợ",
      blurb: "Pressing từ tuyến đầu và lùi về theo kèm; ít đe dọa hơn.",
    },
    winger: {
      label: "Tiền vệ cánh",
      blurb: "Bám đường biên và tạt bóng vào.",
    },
    "inside-forward": {
      label: "Tiền đạo cánh cắt vào",
      blurb: "Cắt vào trong để dứt điểm; ít bám biên và ít tạt bóng hơn.",
    },
    "tracking-winger": {
      label: "Tiền vệ cánh lùi về phòng ngự",
      blurb: "Lùi về giúp hậu vệ biên; ít dâng lên tấn công hơn.",
    },
    "target-man": {
      label: "Tiền đạo cắm",
      blurb: "Thắng các pha đánh đầu và giữ bóng; không phải người dứt điểm sắc bén nhất.",
    },
    poacher: {
      label: "Tiền đạo săn bàn",
      blurb: "Chờ cơ hội trong vòng cấm; không làm gì khác.",
    },
    "complete-forward": {
      label: "Tiền đạo toàn diện",
      blurb: "Ghi bàn, phối hợp và tạo cơ hội.",
    },
    "pressing-forward": {
      label: "Tiền đạo pressing",
      blurb: "Quấy rối hậu vệ từ tuyến đầu; ít đe dọa trong vòng cấm hơn.",
    },
  },
  arch: {
    "shot-stopper": {
      label: "Thủ môn cản phá",
      blurb: "Làm chủ khung thành và cứu thua những quả tưởng chừng không thể.",
    },
    "sweeper-keeper": {
      label: "Thủ môn quét",
      blurb:
        "Quét bóng sau lưng hàng thủ và khởi đầu các đợt tấn công; trên vạch vôi kém chắc hơn một chút.",
    },
    stopper: {
      label: "Trung vệ truy cản",
      blurb: "Thắng các pha tranh chấp và đánh đầu phá bóng, nhưng đóng góp ít khi triển khai.",
    },
    "ball-playing-defender": {
      label: "Trung vệ chơi bóng",
      blurb: "Khởi đầu các pha bóng từ phía sau; tranh cướp nhẹ hơn đôi chút.",
    },
    "defensive-full-back": {
      label: "Hậu vệ biên phòng ngự",
      blurb: "Ở lại phía sau, tranh cướp và bọc lót cánh.",
    },
    "attacking-full-back": {
      label: "Hậu vệ biên tấn công",
      blurb: "Dâng cao hỗ trợ, tạt bóng và vào vòng cấm; để lại khoảng trống phía sau.",
    },
    "ball-winner": {
      label: "Tiền vệ thu hồi bóng",
      blurb: "Phá lối chơi trước hàng thủ và phạm lỗi khi làm vậy.",
    },
    "deep-playmaker": {
      label: "Tiền vệ kiến thiết lùi sâu",
      blurb: "Điều phối trận đấu từ xa bằng những đường chuyền dài.",
    },
    "box-to-box": {
      label: "Tiền vệ box-to-box",
      blurb: "Phủ kín từng tấc cỏ và xuất hiện muộn trong vòng cấm.",
    },
    playmaker: {
      label: "Nhạc trưởng",
      blurb: "Định đoạt nhịp độ và tìm đường chuyền quyết định.",
    },
    creator: {
      label: "Người kiến tạo",
      blurb: "Chơi giữa các tuyến; kiến tạo nhiều hơn ghi bàn.",
    },
    "shadow-striker": {
      label: "Tiền đạo bóng ma",
      blurb: "Băng lên từ phía sau tiền đạo và tự ghi bàn.",
    },
    winger: {
      label: "Tiền vệ cánh",
      blurb: "Bám đường biên và tạt bóng vào.",
    },
    "inside-forward": {
      label: "Tiền đạo cánh cắt vào",
      blurb: "Cắt từ cánh vào trong để dứt điểm.",
    },
    "target-man": {
      label: "Tiền đạo cắm",
      blurb: "Thắng các pha đánh đầu và giữ bóng; không phải người dứt điểm sắc bén nhất.",
    },
    poacher: {
      label: "Tiền đạo săn bàn",
      blurb: "Sống trong vòng cấm và dứt điểm những gì đến với mình; ngoài ra không làm gì nhiều.",
    },
    "complete-forward": {
      label: "Tiền đạo toàn diện",
      blurb: "Ghi bàn, phối hợp và tạo cơ hội.",
    },
  },
  rule: {
    "behind-high-line": "Bóng bổng sau lưng hàng thủ đẩy cao",
    "counter-into-deep-block": "Không có khoảng trống để phản công trước hàng thủ lùi sâu",
    "width-into-back-five": "Chơi bề rộng là vô ích trước hàng thủ năm người",
    "width-into-open-flanks":
      "Chơi bề rộng trước hàng thủ bốn người ngang hàng với hai cánh bỏ ngỏ",
    "patience-into-press": "Triển khai kiên nhẫn trước pressing tầm cao",
    "direct-past-press": "Chơi trực diện vượt qua pressing tầm cao",
    "lone-striker-into-back-three": "Một tiền đạo đơn độc trước ba trung vệ",
    "two-strikers-into-flat-four": "Hai tiền đạo trước hàng thủ bốn người ngang hàng",
    "midfield-numbers": "Đông người hơn ở trung lộ",
    "midfield-outnumbered": "Ít người hơn ở trung lộ",
    "press-patient-side": "Pressing tầm cao trước đối thủ chơi kiên nhẫn",
    "narrow-into-wide": "Đội chơi hẹp dồn đông trung lộ trước đội chơi rộng",
  },
  badge: {
    "big-game": {
      label: "Cầu thủ của những trận lớn",
      text: "Chơi vượt trình ở các trận chung kết và trận quyết định, và giữ được bình tĩnh trên chấm phạt đền.",
    },
    reliable: {
      label: "Đáng tin cậy",
      text: "Chơi đúng trình độ gần như mọi trận.",
    },
    erratic: {
      label: "Thất thường",
      text: "Điểm số trận đấu dao động; hôm nay xuất sắc, hôm sau lại kém.",
    },
    "injury-prone": {
      label: "Dễ chấn thương",
      text: "Dễ dính chấn thương hơn trong trận đấu.",
    },
    "tires-early": {
      label: "Mau hết hơi",
      text: "Cạn sức sớm hơn một cầu thủ trẻ hơn.",
    },
  },
  bond: {
    clubmates: "Đồng đội ở CLB",
    friends: "Bạn bè",
    feud: "Mâu thuẫn",
  },
  spirit: {
    tight: "Gắn kết chặt chẽ",
    good: "Tốt",
    neutral: "Bình thường",
    uneasy: "Bất an",
    divided: "Chia rẽ",
  },
  scout: {
    trait: {
      attack: "Thiên về tấn công",
      cautious: "Thận trọng",
      highLine: "Đường phòng ngự cao",
      deepLine: "Đường phòng ngự lùi sâu",
      wide: "Chơi rộng",
      narrow: "Chơi hẹp",
      counter: "Phản công",
      highPress: "Pressing tầm cao",
      dropsOff: "Lùi về phòng ngự",
      direct: "Trực diện",
      patient: "Kiên nhẫn",
      balanced: "Cân bằng",
    },
    reason: {
      star: "Cầu thủ hay nhất của họ",
      threat: "Mối đe dọa ghi bàn chính của họ",
      creator: "Người tạo ra phần lớn cơ hội cho họ",
      weak: "Mắt xích yếu",
    },
    level: {
      "0": "Lùi sâu",
      "1": "Tiêu chuẩn",
      "2": "Cao",
    },
    width: {
      "0": "Hẹp",
      "1": "Tiêu chuẩn",
      "2": "Rộng",
    },
    change: {
      line: "Đường phòng ngự: {from} → {to}",
      width: "Độ rộng: {from} → {to}",
      counter: "Phản công: {from} → {to}",
    },
    on: "bật",
    off: "tắt",
  },
}

export default engine
