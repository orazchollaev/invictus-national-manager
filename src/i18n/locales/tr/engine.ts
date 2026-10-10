import type en from "../en/engine"

const engine: typeof en = {
  obj: {
    qualify: "{comp} turnuvasına katıl",
    unbeaten: "{text} yenilgisiz",
    promotion: "{letter} Ligi'nden yüksel",
    relegation: "{letter} Ligi'nden düşmekten kaçın",
    win: "{comp} turnuvasını kazan",
    reach: {
      knockout: "{comp} turnuvasında eleme aşamasına ulaş",
      "quarter-finals": "{comp} turnuvasında çeyrek finale ulaş",
      "semi-finals": "{comp} turnuvasında yarı finale ulaş",
      final: "{comp} turnuvasında finale ulaş",
    },
    debuts: "{year} yılında 21 yaş ve altı {count} oyuncuyu milli takımda ilk kez oynat",
    raiseNote:
      "Ödüller ×{reward}; hedefin altında kalmak {cost} güven kaybettirir, ardından asıl hedef geçerli olur",
    lowerNote: "Şimdi {cost} güven kaybettirir; ödüller yarıya iner",
    lowerNeeds: "Yönetim yalnızca %{n} ve üzeri güvenle dinler",
  },
  news: {
    raise: {
      title: "Çıtayı yükseltiyorsunuz",
      body: 'Federasyona daha fazlasını vaat ettiniz: "{text}". Sözünüzü tutun, unutmayacaklardır.',
    },
    lower: {
      title: "Beklentiler düşürüldü",
      body: 'Federasyon istemeye istemeye daha düşük bir hedefi kabul etti: "{text}".',
    },
    broken: {
      title: "Söz tutulmadı",
      body: '"{promised}" sözü verdiniz ama başaramadınız. Federasyon hâlâ "{target}" hedefini bekliyor.',
    },
    met: {
      title: "Hedefe ulaşıldı",
      body: 'Federasyon çok memnun: "{text}" — tamam. Ek destek akademilere de ulaşacak.',
    },
    missed: {
      title: "Hedef kaçırıldı",
      body: 'Federasyon memnun değil: "{text}" hedefini başaramadık.',
    },
    friendly: "bir hazırlık maçı",
    derbyWin: {
      title: "Derbi günü {us} takımının",
      body: "{comp} içinde eski rakip {them} karşısında {score} kazandık. Sokaklarda bayram var.",
    },
    derbyLoss: {
      title: "{them} karşısında derbi yenilgisi",
      body: "{comp} içinde {them} karşısında {score} yenildik. Taraftarlar bunu kolay kolay unutmayacak.",
    },
    derbyDraw: {
      title: "Derbide kazanan çıkmadı",
      body: "{us} ve {them}, {comp} içinde {score} berabere kaldı. Hiçbir taraf üstünlüğü ilan edemiyor.",
    },
    fans: {
      angry: {
        title: "Taraftarlar teknik direktöre karşı",
        body: "{nation} taraftarları öfkesini açıkça gösterdi. Yönetim dinliyor.",
      },
      adore: {
        title: "Taraftarlar arkanızda",
        body: "{nation} taraftarları teknik direktörün adını haykırıyor. Stadyum yıkılacak.",
      },
    },
    invitational: {
      title: "{host}, {comp} turnuvasına ev sahipliği yapacak",
      body: "{host}, {teams} katılımıyla {comp} turnuvasına ev sahipliği yapacak. Turnuva {date} tarihinde başlıyor.",
    },
    invite: {
      title: "{host} tarafından davet",
      body: "{host}, bizi {date} tarihinde başlayan aralıktaki {n} takımlı turnuvaya davet ediyor. Yanıt bekliyorlar.",
    },
    inviteLapsed: {
      title: "Davetin süresi doldu",
      body: "{host} davetine zamanında yanıt vermedik; turnuva bizsiz devam ediyor.",
    },
    inviteOff: {
      title: "Turnuva iptal edildi",
      body: "{host} turnuvası yapılamadı: her takım hâlâ müsait değil.",
    },
    riot: {
      title: "{us}, {them} karşısında şov yaptı",
      body: "{comp} içinde {them} karşısında {score} kazandık. Taraftarlar bu maçı unutmayacak.",
    },
    shock: {
      title: "{them} karşısında sürpriz galibiyet",
      body: "Pek kimse bize şans tanımadı ama {comp} içinde {them} takımını {score} yendik.",
    },
    humiliation: {
      title: "{them} karşısında rezalet",
      body: "{comp} içinde {them} karşısında {score} yenildik. Teknik direktör hakkında sorular soruluyor.",
    },
    embarrassing: {
      title: "{them} karşısında utanç verici yenilgi",
      body: "Kazanmamız bekleniyordu ama {comp} içinde {them} karşısında {score} kaybettik.",
    },
    cap: {
      title: "{name} {caps}. milli maçına çıktı",
      body: "{name}, {nation} formasıyla şimdiye kadar {caps} maça çıktı.",
    },
    goals: {
      title: "{name} milli takımda {goals} gole ulaştı",
      body: "{name}, {nation} formasıyla şimdiye kadar {goals} gol attı.",
    },
    debut: {
      title: "{name} için ilk milli maç",
      body: "{opp} karşısında milli takımda ilk kez forma giyenler: {names}.",
    },
    debuts: {
      title: "{n} ilk milli maç",
    },
    milestone: "Dönüm noktasına ulaşıldı",
    ultimatum: {
      title: "Son uyarı",
      body: "Federasyonun sabrı tükendi. {matches} resmî maç içinde güvenlerini %{lifted} seviyesine çıkarın, yoksa görevden alınacaksınız.",
    },
    eases: {
      title: "Baskı hafifliyor",
      body: "Sonuçlar döndü. Federasyon son uyarısını geri çekti.",
    },
    sacked: {
      title: "Görevden alındınız",
      body: "{nation} federasyonu sizi görevden aldı.",
    },
    resigned: {
      title: "İstifa ettiniz",
      body: "{nation} teknik direktörlüğünden ayrıldınız.",
    },
    notRenewed: {
      title: "Sözleşme yenilenmedi",
      body: "{nation} federasyonu sözleşmenizi yenilememeye karar verdi.",
    },
    renewed: {
      title: "Sözleşme yenilendi",
      body: "{nation} federasyonu sözleşmenizi {date} tarihine kadar yeniledi.",
    },
    extended: {
      title: "Bir yıl daha",
      body: "{nation} federasyonu sözleşmenizi yalnızca bir yıl uzattı. İlerleme görmek istiyorlar.",
    },
    coachChange: {
      title: "{nation} teknik direktörü değiştirdi",
      body: "{nation}, yeni teknik direktörü olarak {coach} ile anlaştı.",
    },
    coachSacked: {
      title: "{nation}, {coach} ile yollarını ayırdı",
      body: "{nation}, kötü gidişat sonrası teknik direktör {coach} ile yollarını ayırdı. Halef arayışı başladı.",
    },
    coachRetired: {
      title: "{coach} emekli oluyor",
      body: "{coach}, {nation} teknik direktörlüğünden ayrıldı ve antrenörlüğü bıraktı.",
    },
    offer: {
      title: "İş teklifi: {nation}",
      body: "{nation} federasyonu sizi yeni teknik direktörü olarak görmek istiyor. Teklif {date} tarihine kadar geçerli.",
    },
    newJob: {
      title: "Yeni görev: {nation}",
      body: "Artık {nation} teknik direktörüsünüz.",
    },
    tourney: {
      through: "{comp}: tur atladık",
      throughTo: "{round} turuna yükseldik.",
      throughBare: "Tur atladık.",
      out: "{comp}: elendik",
      groupOut: "{group} grubunu tur atlayamadan tamamladık.",
      knockedOut: "{round} turunda elendik.",
      runnersUp: "{comp}: ikincilik",
      lostFinal: "Finali kaybettik.",
    },
    qualified: {
      title: "{finals} için katılım hakkı kazanıldı",
      body: "{finals} için yerimizi aldık.",
    },
    playoff: {
      title: "Play-off'a kaldık",
      body: "{finals} için konfederasyonlar arası play-off'a ulaştık.",
    },
    missedOut: {
      title: "Katılım hakkı kazanılamadı",
      body: "{finals} turnuvasını kaçırdık.",
    },
    finalsGeneric: "final turnuvası",
    injury: {
      title: "{name} sakatlandı",
      body: "{name} kulüp seviyesinde {injury} yaşadı ve {date} tarihine kadar yok.",
    },
    newClub: "yeni bir kulüp",
    bigMove: {
      title: "{name} büyük bir transfer yaptı",
      body: "{name}, milli takımdaki çıkışının ardından {club} takımına katıldı.",
    },
    move: {
      title: "{name} yeni takımında",
      body: "{name}, {club} takımına katıldı.",
    },
    prospects: {
      title: "Bu sezon gençleriniz",
      body: "İzlediğiniz gençler nasıl gelişti: {list}.",
    },
    season: {
      title: "{from}–{to} sezonu başlıyor",
      body: "Oyuncular geçen sezon boyunca gelişti ve yaz transfer dönemi kapandı.",
    },
    retired: {
      entry: "{name} ({pos}, {age})",
      entryCaps: "{name} ({pos}, {age}, {caps} milli maç)",
    },
    retire: {
      title: "{name} milli takımı bıraktı",
      body: "{name} ({age}, {caps} milli maç) milli takımdan emekli olduğunu açıkladı.",
    },
    wonderkid: {
      title: "Harika çocuk ortaya çıktı: {name}",
      body: "Gözlemciler {club} takımında oynayan {age} yaşındaki {pos} {name} için övgüler yağdırıyor.",
    },
    newgen: {
      entry: "{name} ({pos}, {age}, {club})",
    },
    retiredMany: {
      title: "{n} oyuncu emekli oldu",
      body: "Şu oyuncular kramponlarını astı: {list}.",
    },
    newgens: {
      title: "{n} genç yetişti",
      body: "Bizim için uygun yeni nesil: {list}.",
    },
    stadium: {
      build: {
        title: "{stadium} için çalışmalar başlıyor",
        body: "Federasyon {city} şehrinde {seats} koltuklu bir stadyum inşa ediyor; açılış {date} tarihinde.",
      },
      expand: {
        title: "{stadium} genişletilecek",
        body: "{city} şehrindeki {stadium}, çalışmalar bittiğinde {date} tarihinde {seats} kişi alacak.",
      },
      opened: {
        build: "{nation}, {stadium} stadyumunu açtı",
        expand: "{stadium} genişletildi",
        body: "{city} şehrindeki {stadium} artık {seats} kişi alıyor{ready}.",
      },
      readyFor: ", {comp} için hazır",
    },
    champions: {
      title: "{winner}, {comp} turnuvasını kazandı",
      body: "{winner} şampiyon oldu{beat}.",
      beat: ", finalde {runnerUp} takımını yenerek",
    },
    draw: {
      title: "{comp}: {stage}",
      group: "Kura çekildi. Rakiplerimiz: {others}.",
      tie: "{opp} ile eşleştik.",
    },
    and: "{a} ve {b}",
    host: {
      title: "{comp} ev sahibi: {list}",
      one: "{comp} turnuvasına {date} tarihinde başlayarak {list} ev sahipliği yapacak.",
      many: "{comp} turnuvasına {date} tarihinde başlayarak {list} ortaklaşa ev sahipliği yapacak.",
    },
    placeholder: {
      title: "{team} yerini aldı",
      body: "{team}, {label} turnuvasını kazandı ve kuradaki o yeri doldurdu.",
    },
  },
  ms: {
    trophy: "İlk kupanız: {comp}.",
    world: "Dünya şampiyonu! {nation}, {comp} turnuvasını kazandı.",
    continental: "Kıtanızın şampiyonu: {comp}.",
    qualification: "{nation} takımını büyük bir turnuvaya taşıdınız.",
    worldCup: "{nation} takımını Dünya Kupası'na taşıdınız.",
    firstWin: "Milli takım teknik direktörü olarak ilk galibiyetiniz.",
    matches: "Milli takım teknik direktörü olarak {n} maç.",
    debuts: "Sizin döneminizde {n} oyuncu ilk milli maçına çıktı.",
    youthDebuts: "21 yaş ve altı beş oyuncu milli takım seviyesinde ilk kez oynadı.",
    unbeaten: "Resmî maçlarda on maçtır yenilgisiz.",
    top10: "{nation}, sizin döneminizde dünya ilk onunda.",
    no1: "{nation}, dünyanın en iyi takımı.",
  },
  review: {
    reached: {
      champions: "Şampiyon",
      knockedOut: "Elendi",
      qualified: "Katılım hakkı kazandı",
      notQualified: "Katılım hakkı kazanamadı",
      leagueStage: "Lig aşaması",
      promoted: "{letter} Ligi'ne yükseldi",
      relegated: "{letter} Ligi'ne düştü",
      stayed: "{letter} Ligi'nde kaldı",
      runnersUp: "İkinci",
      groups: "Grup aşaması",
    },
    msg: {
      delightedChampion:
        "Federasyon çok memnun. {comp} turnuvasını kazanmak kimsenin hayal etmeye cesaret edemediğinin ötesinde ve itibarınız hiç bu kadar yüksek olmamıştı.",
      delighted:
        "Federasyon {comp} performansından çok memnun. İstediklerinden fazlasını verdiniz.",
      satisfied:
        "Federasyon {comp} performansından memnun. İş görüldü; şimdi bunun üzerine inşa etmenizi bekliyorlar.",
      disappointed:
        "Federasyon {comp} performansından hayal kırıklığına uğradı. Daha fazlasını bekliyorlardı ve sabırları sonsuz değil.",
      ultimatum:
        "{comp} sonrasında federasyonun sabrı tükendi. Sonuçlar hemen düzelmeli, yoksa bunu başarabilecek birini bulacaklar.",
      sacked: "{comp} bardağı taşıran son damla oldu. Federasyon sizi görevden almaya karar verdi.",
      contractEnd: "{comp} sözleşmenizin sonu oldu ve federasyon onu yenilememeye karar verdi.",
    },
  },
  fx: {
    friendly: "Uluslararası hazırlık maçı",
    window: "Uluslararası takvim aralığı",
    matchday: "{stage} · {n}. hafta",
    groupMatchday: "{stage} · {group} · {n}. hafta",
    round: "{round}",
    stageRound: "{stage} · {round}",
    roundLeg: "{round} · {leg}. ayak",
    stageRoundLeg: "{stage} · {round} · {leg}. ayak",
  },
  lineup: {
    nobody: "{pos} mevkiinde kimse oynamıyor",
    notInSquad: "{name} ({pos}) kadroda değil",
    injured: "{name} ({pos}) sakat ({label})",
    suspended: "{name} ({pos}) cezalı",
  },
  placeholder: {
    uefa: "UEFA play-off {path} Yolu",
    path: "Play-off {path} Yolu",
    tournament: "Play-off Turnuvası",
    qualifier: "Eleme {n}",
    winner: "{base} kazananı",
    tournamentWinner: "Play-off Turnuvası {n}. kazananı",
    shortIc: "KA {n}",
    shortPo: "PO {path}",
  },
  injury: {
    "hamstring-strain": "Arka adale zorlanması",
    "ankle-sprain": "Ayak bileği burkulması",
    "calf-strain": "Kalf adalesi zorlanması",
    "groin-strain": "Kasık zorlanması",
    "thigh-strain": "Uyluk zorlanması",
    "knee-injury": "Diz sakatlığı",
    "broken-foot": "Ayak kırığı",
    "cruciate-ligament-rupture": "Çapraz bağ kopması",
    knock: "Darbe",
  },
  stage: {
    group: "{name} Grubu",
    league: "Lig",
    leagueN: "{x} Ligi",
    roundOf: "Son {n} turu",
    "round-of-16": "Son 16 turu",
    "round-of-32": "Son 32 turu",
    "quarter-finals": "Çeyrek final",
    "semi-finals": "Yarı final",
    final: "Final",
    finals: "Finaller",
    "third-place": "Üçüncülük maçı",
    "bronze-final": "Bronz final",
    "group-stage": "Grup aşaması",
    "knockout-stage": "Eleme aşaması",
    "league-phase": "Lig aşaması",
    qualifying: "Eleme",
    "preliminary-round": "Ön eleme turu",
    preliminaryN: "{n}. ön eleme turu",
    prelims: "Ön elemeler",
    "first-round": "Birinci tur",
    "second-round": "İkinci tur",
    "third-round": "Üçüncü tur",
    "fourth-round": "Dördüncü tur",
    "fifth-round": "Beşinci tur",
    "final-round": "Son tur",
    "play-offs": "Play-off",
    "play-in": "Play-In",
    "play-off-round": "Play-off turu",
    "play-off-semi-finals": "Play-off yarı finalleri",
    "play-off-finals": "Play-off finalleri",
    "play-off-final": "Play-off finali",
    "play-off-tournament": "Play-off turnuvası",
    "promotion-relegation-play-offs": "Yükselme/düşme play-off'ları",
    "league-a-quarter-finals": "A Ligi çeyrek finalleri",
    "league-a-finals": "A Ligi Finalleri",
    "league-b-finals": "B Ligi Finalleri",
    "league-c-finals": "C Ligi Finalleri",
  },
  comp: {
    wc: {
      name: "{year} Dünya Kupası",
      short: "Dünya Kupası",
      plain: "Dünya Kupası",
    },
    "wcq-uefa": {
      name: "{year} Dünya Kupası Elemeleri · UEFA",
      short: "DK Elemeleri Avrupa",
      plain: "Dünya Kupası Elemeleri · UEFA",
    },
    "wcq-caf": {
      name: "{year} Dünya Kupası Elemeleri · CAF",
      short: "DK Elemeleri Afrika",
      plain: "Dünya Kupası Elemeleri · CAF",
    },
    "wcq-afc": {
      name: "{year} Dünya Kupası Elemeleri · AFC",
      short: "DK Elemeleri Asya",
      plain: "Dünya Kupası Elemeleri · AFC",
    },
    "wcq-concacaf": {
      name: "{year} Dünya Kupası Elemeleri · CONCACAF",
      short: "DK Elemeleri CONCACAF",
      plain: "Dünya Kupası Elemeleri · CONCACAF",
    },
    "wcq-conmebol": {
      name: "{year} Dünya Kupası Elemeleri · CONMEBOL",
      short: "DK Elemeleri Güney Amerika",
      plain: "Dünya Kupası Elemeleri · CONMEBOL",
    },
    "wcq-ofc": {
      name: "{year} Dünya Kupası Elemeleri · OFC",
      short: "DK Elemeleri Okyanusya",
      plain: "Dünya Kupası Elemeleri · OFC",
    },
    "wcq-ic": {
      name: "{year} Dünya Kupası Play-off Turnuvası",
      short: "Play-off",
      plain: "Dünya Kupası Play-off Turnuvası",
    },
    euro: {
      name: "UEFA Euro {year}",
      short: "Euro",
      plain: "UEFA Euro",
    },
    euroq: {
      name: "UEFA Euro {year} Elemeleri",
      short: "Euro Elemeleri",
      plain: "UEFA Euro Elemeleri",
    },
    unl: {
      name: "UEFA Uluslar Ligi {year}–{year2}",
      short: "Uluslar Ligi",
      plain: "UEFA Uluslar Ligi",
    },
    finalissima: {
      name: "Finalissima {year}",
      short: "Finalissima",
      plain: "Finalissima",
    },
    afcon: {
      name: "{year} Afrika Uluslar Kupası",
      short: "AFCON",
      plain: "Afrika Uluslar Kupası",
    },
    afconq: {
      name: "{year} Afrika Uluslar Kupası Elemeleri",
      short: "AFCON Elemeleri",
      plain: "Afrika Uluslar Kupası Elemeleri",
    },
    "asian-cup": {
      name: "{year} AFC Asya Kupası",
      short: "Asya Kupası",
      plain: "AFC Asya Kupası",
    },
    "asian-cupq": {
      name: "{year} AFC Asya Kupası Elemeleri",
      short: "Asya Kupası Elemeleri",
      plain: "AFC Asya Kupası Elemeleri",
    },
    copa: {
      name: "Copa América {year}",
      short: "Copa América",
      plain: "Copa América",
    },
    "ofc-cup": {
      name: "{year} OFC Uluslar Kupası",
      short: "OFC Uluslar Kupası",
      plain: "OFC Uluslar Kupası",
    },
    cnl: {
      name: "CONCACAF Uluslar Ligi {year}–{year2}",
      short: "CONCACAF UL",
      plain: "CONCACAF Uluslar Ligi",
    },
    gcq: {
      name: "CONCACAF Gold Cup {year} Ön Elemeleri",
      short: "Gold Cup Ön Eleme",
      plain: "CONCACAF Gold Cup Ön Elemeleri",
    },
    "gold-cup": {
      name: "CONCACAF Gold Cup {year}",
      short: "Gold Cup",
      plain: "CONCACAF Gold Cup",
    },
    "arab-cup": {
      name: "{year} Arap Kupası",
      short: "Arap Kupası",
      plain: "Arap Kupası",
    },
    "gulf-cup": {
      name: "{year} Arap Körfez Kupası",
      short: "Körfez Kupası",
      plain: "Arap Körfez Kupası",
    },
    aff: {
      name: "{year} ASEAN Şampiyonası",
      short: "ASEAN Şampiyonası",
      plain: "ASEAN Şampiyonası",
    },
    "asean-cup": {
      name: "{year} ASEAN Kupası",
      short: "ASEAN Kupası",
      plain: "ASEAN Kupası",
    },
    "asean-challenge": {
      name: "{year} ASEAN Challenge Kupası",
      short: "ASEAN Challenge Kupası",
      plain: "ASEAN Challenge Kupası",
    },
    "inv-mar": {
      name: "{year} Mart Davetli Turnuvası",
      short: "Mart Davetli",
      plain: "Mart Davetli Turnuvası",
    },
    "inv-jun": {
      name: "{year} Haziran Davetli Turnuvası",
      short: "Haziran Davetli",
      plain: "Haziran Davetli Turnuvası",
    },
    "inv-sep": {
      name: "{year} Sonbahar Davetli Turnuvası",
      short: "Sonbahar Davetli",
      plain: "Sonbahar Davetli Turnuvası",
    },
    "inv-nov": {
      name: "{year} Kasım Davetli Turnuvası",
      short: "Kasım Davetli",
      plain: "Kasım Davetli Turnuvası",
    },
    e1: {
      name: "{year} EAFF E-1 Şampiyonası",
      short: "E-1",
      plain: "EAFF E-1 Şampiyonası",
    },
    cafa: {
      name: "{year} CAFA Uluslar Kupası",
      short: "CAFA Uluslar Kupası",
      plain: "CAFA Uluslar Kupası",
    },
    waff: {
      name: "{year} WAFF Şampiyonası",
      short: "WAFF Şampiyonası",
      plain: "WAFF Şampiyonası",
    },
    saff: {
      name: "{year} SAFF Şampiyonası",
      short: "SAFF Şampiyonası",
      plain: "SAFF Şampiyonası",
    },
    cosafa: {
      name: "{year} COSAFA Kupası",
      short: "COSAFA Kupası",
      plain: "COSAFA Kupası",
    },
    cecafa: {
      name: "{year} CECAFA Büyükler Challenge Kupası",
      short: "CECAFA Kupası",
      plain: "CECAFA Büyükler Challenge Kupası",
    },
    wafu: {
      name: "{year} WAFU Bölge Kupası",
      short: "WAFU Kupası",
      plain: "WAFU Bölge Kupası",
    },
    baltic: {
      name: "{year} Baltık Kupası",
      short: "Baltık Kupası",
      plain: "Baltık Kupası",
    },
  },
  role: {
    stopper: {
      label: "Stoper",
      blurb: "Topu kapmak için öne çıkar ve her havadaki topa gider; top ayağındayken desteği az.",
    },
    "ball-playing": {
      label: "Oyun kurucu defans",
      blurb: "Topla orta sahaya çıkar; top kapmada daha hafif.",
    },
    cover: {
      label: "Kapatan defans",
      blurb: "Geride ve güvenli kalır; nadiren faul yapar, nadiren atak başlatır.",
    },
    "defensive-full-back": {
      label: "Defansif bek",
      blurb: "Hattını korur ve top kapar; ileri çıkmaz.",
    },
    "wing-back": {
      label: "Kanat bek",
      blurb: "Tüm kanadı koşar, orta yapar ve şut atar; arkasında boşluk bırakır.",
    },
    "inverted-full-back": {
      label: "İçe kayan bek",
      blurb: "Oyun kurmak için orta sahaya sokulur; kanadı boş bırakır.",
    },
    anchor: {
      label: "Çapa",
      blurb: "Savunmanın önünde durur; onu korur ve oyunu basit tutar.",
    },
    "ball-winner": {
      label: "Top kazanıcı",
      blurb: "Orta sahanın her yerinde topun peşine düşer ve bunu yaparken faul yapar.",
    },
    "deep-playmaker": {
      label: "Geri oyun kurucu",
      blurb: "Oyunu geriden yönetir; savunmaya daha az destek verir.",
    },
    "box-to-box": {
      label: "Alan alana",
      blurb: "Sahanın her yerini kat eder ve ceza sahasına geç gelir.",
    },
    playmaker: {
      label: "Oyun kurucu",
      blurb: "Tempoyu belirler ve öldürücü pası bulur; daha az savunma yapar.",
    },
    destroyer: {
      label: "Yıkıcı",
      blurb: "Oyunu bozar ve sık faul yapar; hücuma az katkı verir.",
    },
    "advanced-playmaker": {
      label: "İleri oyun kurucu",
      blurb: "Hatlar arasında oynar ve yaratıcılık katar; kendisi daha az gol atar.",
    },
    "shadow-striker": {
      label: "Gölge forvet",
      blurb: "Forvetin arkasından koşar ve şut çeker; daha az yaratıcı.",
    },
    tracker: {
      label: "Geri dönen",
      blurb: "Önden pres yapar ve geri döner; tehdidi daha az.",
    },
    winger: {
      label: "Kanat oyuncusu",
      blurb: "Kenar çizgisine yakın oynar ve orta yapar.",
    },
    "inside-forward": {
      label: "İçe kat eden forvet",
      blurb: "Şut için içe kat eder; kanatta daha az genişlik, daha az orta.",
    },
    "tracking-winger": {
      label: "Geri dönen kanat",
      blurb: "Bek'e yardım için geri çalışır; ileri daha az çıkar.",
    },
    "target-man": {
      label: "Hedef adam",
      blurb: "Kafa toplarını kazanır ve topu tutar; en keskin bitirici değil.",
    },
    poacher: {
      label: "Ceza sahası forveti",
      blurb: "Fırsatlar için ceza sahasında bekler; başka bir şey yapmaz.",
    },
    "complete-forward": {
      label: "Komple forvet",
      blurb: "Gol atar, oyunla bağ kurar ve fırsat yaratır.",
    },
    "pressing-forward": {
      label: "Pres yapan forvet",
      blurb: "Savunmacıları önden bunaltır; ceza sahasında tehdidi daha az.",
    },
  },
  arch: {
    "shot-stopper": {
      label: "Şut kurtaran kaleci",
      blurb: "Çizgisine hükmeder ve kurtarılmaması gerekeni kurtarır.",
    },
    "sweeper-keeper": {
      label: "Libero kaleci",
      blurb: "Savunmanın arkasını süpürür ve ataklar başlatır; çizgide biraz daha az emin.",
    },
    stopper: {
      label: "Stoper",
      blurb:
        "İkili mücadeleleri kazanır ve topu kafayla uzaklaştırır, ama oyun kurulumuna az katkı verir.",
    },
    "ball-playing-defender": {
      label: "Oyun kurucu defans",
      blurb: "Atakları geriden başlatır; top kapmada biraz daha hafif.",
    },
    "defensive-full-back": {
      label: "Defansif bek",
      blurb: "Geride kalır, top kapar ve kanadı kapatır.",
    },
    "attacking-full-back": {
      label: "Hücumcu bek",
      blurb: "Bindirir, orta yapar ve ceza sahasına girer; arkasında boşluk bırakır.",
    },
    "ball-winner": {
      label: "Top kazanıcı",
      blurb: "Savunmanın önünde oyunu bozar ve bunu yaparken faul yapar.",
    },
    "deep-playmaker": {
      label: "Geri oyun kurucu",
      blurb: "Oyunu geriden uzun toplarla yönetir.",
    },
    "box-to-box": {
      label: "Alan alana",
      blurb: "Sahanın her karışını kat eder ve ceza sahasına geç gelir.",
    },
    playmaker: {
      label: "Oyun kurucu",
      blurb: "Tempoyu belirler ve öldürücü pası bulur.",
    },
    creator: {
      label: "Yaratıcı",
      blurb: "Hatlar arasında oynar; gol atmaktan çok asist yapar.",
    },
    "shadow-striker": {
      label: "Gölge forvet",
      blurb: "Forvetin arkasından koşar ve golü kendisi atar.",
    },
    winger: {
      label: "Kanat oyuncusu",
      blurb: "Kenar çizgisine yakın oynar ve orta yapar.",
    },
    "inside-forward": {
      label: "İçe kat eden forvet",
      blurb: "Kanattan içe kat edip şut çeker.",
    },
    "target-man": {
      label: "Hedef adam",
      blurb: "Kafa toplarını kazanır ve topu tutar; en keskin bitirici değil.",
    },
    poacher: {
      label: "Ceza sahası forveti",
      blurb: "Ceza sahasında yaşar ve önüne gelen topu bitirir; başka bir şey yapmaz.",
    },
    "complete-forward": {
      label: "Komple forvet",
      blurb: "Gol atar, oyunla bağ kurar ve fırsat yaratır.",
    },
  },
  rule: {
    "behind-high-line": "Yüksek hattın arkasına atılan toplar",
    "counter-into-deep-block": "Derin bir bloğa karşı kontra yapacak alan yok",
    "width-into-back-five": "Beşli savunmaya karşı genişlik boşa gider",
    "width-into-open-flanks": "Kanatları açık dörtlü hatta karşı genişlik",
    "patience-into-press": "Yüksek komuta karşı sabırlı oyun kurma",
    "direct-past-press": "Yüksek presi aşan direkt oyun",
    "lone-striker-into-back-three": "Üç stoper karşısında tek forvet",
    "two-strikers-into-flat-four": "Dörtlü hat karşısında iki forvet",
    "midfield-numbers": "Ortadan daha fazla oyuncu",
    "midfield-outnumbered": "Ortada sayıca az",
    "press-patient-side": "Sabırlı bir takıma karşı yüksek pres",
    "narrow-into-wide": "Dar oynayan takım, geniş oynayana karşı ortayı kapatır",
  },
  badge: {
    "big-game": {
      label: "Büyük maç oyuncusu",
      text: "Finallerde ve belirleyici maçlarda seviyesinin üstünde oynar, penaltı noktasında soğukkanlılığını korur.",
    },
    reliable: {
      label: "Güvenilir",
      text: "Neredeyse her maç seviyesine uygun oynar.",
    },
    erratic: {
      label: "Dengesiz",
      text: "Maç puanları inip çıkar; bir gün muhteşem, ertesi gün kötü.",
    },
    "injury-prone": {
      label: "Sakatlığa yatkın",
      text: "Maçta darbe alma olasılığı daha yüksek.",
    },
    "tires-early": {
      label: "Erken yorulur",
      text: "Genç bir oyuncudan daha çabuk gücünü tüketir.",
    },
  },
  bond: {
    clubmates: "Kulüp arkadaşları",
    friends: "Arkadaşlar",
    feud: "Husumet",
  },
  spirit: {
    tight: "Kenetlenmiş",
    good: "İyi",
    neutral: "Nötr",
    uneasy: "Huzursuz",
    divided: "Bölünmüş",
  },
  scout: {
    trait: {
      attack: "Hücum odaklı",
      cautious: "Temkinli",
      highLine: "Yüksek hat",
      deepLine: "Derin hat",
      wide: "Geniş oynar",
      narrow: "Dar oynar",
      counter: "Kontra atak",
      highPress: "Yüksek pres",
      dropsOff: "Geri çekilir",
      direct: "Direkt",
      patient: "Sabırlı",
      balanced: "Dengeli",
    },
    reason: {
      star: "En iyi oyuncuları",
      threat: "Başlıca gol tehdidi",
      creator: "Fırsatlarının çoğunu yaratıyor",
      weak: "Zayıf halka",
    },
    level: {
      "0": "Derin",
      "1": "Standart",
      "2": "Yüksek",
    },
    width: {
      "0": "Dar",
      "1": "Standart",
      "2": "Geniş",
    },
    change: {
      line: "Savunma hattı: {from} → {to}",
      width: "Genişlik: {from} → {to}",
      counter: "Kontra atak: {from} → {to}",
    },
    on: "açık",
    off: "kapalı",
  },
}

export default engine
