import type en from "../en/engine"

const engine: typeof en = {
  obj: {
    qualify: "Saralashdan o'tish: {comp}",
    unbeaten: "{text} mag'lub bo'lmasdan",
    promotion: "{letter}-ligadan yuqori ligaga chiqish",
    relegation: "{letter}-ligadan tushib ketmaslik",
    win: "G'olib bo'lish: {comp}",
    reach: {
      knockout: "Pley-off bosqichiga chiqish: {comp}",
      "quarter-finals": "Chorak finalga chiqish: {comp}",
      "semi-finals": "Yarim finalga chiqish: {comp}",
      final: "Finalga chiqish: {comp}",
    },
    debuts:
      "{year}-yilda 21 yosh va undan kichik {count} ta o'yinchiga terma jamoada debyut qilish imkonini berish",
    raiseNote:
      "Mukofotlar ×{reward}; uddalay olmasangiz ishonch {cost} ga kamayadi, so'ng dastlabki vazifa qayta kuchga kiradi",
    lowerNote: "Hozir ishonch {cost} ga kamayadi; mukofotlar ikki baravar kamayadi",
    lowerNeeds: "Rahbariyat faqat ishonch {n}% yoki undan yuqori bo'lsa quloq soladi",
  },
  news: {
    raise: {
      title: "Siz darajani ko'tarmoqdasiz",
      body: "Siz federatsiyaga ko'proq va'da berdingiz: \"{text}\". Uddalang, ular buni unutmaydi.",
    },
    lower: {
      title: "Talablar pasaytirildi",
      body: 'Federatsiya istar-istamas yengilroq vazifaga rozi bo\'ldi: "{text}".',
    },
    broken: {
      title: "Va'da bajarilmadi",
      body: 'Siz "{promised}" deb va\'da berdingiz, ammo uddalay olmadingiz. Federatsiya hamon sizdan "{target}" ni kutmoqda.',
    },
    met: {
      title: "Vazifa bajarildi",
      body: "Federatsiya xursand: \"{text}\" — bajarildi. Qo'shimcha qo'llab-quvvatlash akademiyalarga ham yetib boradi.",
    },
    missed: {
      title: "Vazifa bajarilmadi",
      body: 'Federatsiya norozi: biz "{text}" ni uddalay olmadik.',
    },
    friendly: "do'stona o'yin",
    derbyWin: {
      title: "Derbi kuni {us} jamoasiniki",
      body: "Qadimiy raqib {them} ustidan {comp} doirasida {score} hisobida g'alaba. Ko'chalarda bayram.",
    },
    derbyLoss: {
      title: "{them} jamoasiga derbi mag'lubiyati",
      body: "{comp} doirasida {them} jamoasidan {score} hisobida yutqazdik. Muxlislar buni tezda unutmaydi.",
    },
    derbyDraw: {
      title: "Derbida durang",
      body: "{us} va {them} {comp} doirasida {score} hisobida durang o'ynadi. Hech bir jamoa maqtanolmaydi.",
    },
    fans: {
      angry: {
        title: "Muxlislar murabbiydan yuz o'girdi",
        body: "{nation} muxlislari g'azabini yashirmayapti. Rahbariyat quloq solmoqda.",
      },
      adore: {
        title: "Muxlislar sizning yoningizda",
        body: "{nation} muxlislari murabbiy nomini kuylamoqda. Stadion larzaga keladi.",
      },
    },
    invitational: {
      title: "{host} {comp} turnirini o'tkazadi",
      body: "{host} {comp} turnirini o'tkazadi, qatnashchilar: {teams}. Turnir {date} kuni boshlanadi.",
    },
    invite: {
      title: "{host} dan taklifnoma",
      body: "{host} bizni {date} dan boshlanadigan oynada {n} jamoali turnirga taklif qilmoqda. Javob kutilmoqda.",
    },
    inviteLapsed: {
      title: "Taklifnoma muddati o'tdi",
      body: "Biz {host} taklifnomasiga o'z vaqtida javob bermadik; turnir biz holda o'tadi.",
    },
    inviteOff: {
      title: "Turnir bekor qilindi",
      body: "{host} turniri o'tmaydi: hamma jamoa ham endi bo'sh emas.",
    },
    riot: {
      title: "{us} {them} jamoasini ezib tashladi",
      body: "{comp} doirasida {them} ustidan {score} hisobida g'alaba. Muxlislar buni eslab yuradi.",
    },
    shock: {
      title: "{them} ustidan kutilmagan g'alaba",
      body: "Bizga kam kishi ishongan edi, ammo {comp} doirasida {them} jamoasini {score} hisobida yutdik.",
    },
    humiliation: {
      title: "{them} jamoasiga qarshi sharmandali mag'lubiyat",
      body: "{comp} doirasida {them} jamoasiga {score} hisobida yutqazdik. Murabbiydan savol so'ralmoqda.",
    },
    embarrassing: {
      title: "{them} jamoasiga uyatli mag'lubiyat",
      body: "G'alaba kutilgan edi, ammo {comp} doirasida {them} jamoasiga {score} hisobida yutqazdik.",
    },
    cap: {
      title: "{name} {caps}-o'yinini o'tkazdi",
      body: "{name} {nation} terma jamoasi safida {caps} marta maydonga tushdi.",
    },
    goals: {
      title: "{name} terma jamoada {goals} gol urdi",
      body: "{name} {nation} terma jamoasi uchun jami {goals} gol urdi.",
    },
    debut: {
      title: "{name} terma jamoadagi birinchi o'yinida",
      body: "{opp} ga qarshi terma jamoada debyut qilmoqda: {names}.",
    },
    debuts: {
      title: "{n} ta debyut",
    },
    milestone: "Muhim marraga erishildi",
    ultimatum: {
      title: "Oxirgi ogohlantirish",
      body: "Federatsiyaning sabri tugadi. Ularning ishonchini {matches} ta rasmiy o'yin ichida {lifted}% ga ko'taring, aks holda o'rningizga boshqasi keladi.",
    },
    eases: {
      title: "Bosim yengillashdi",
      body: "Natijalar o'zgardi. Federatsiya oxirgi ogohlantirishni qaytarib oldi.",
    },
    sacked: {
      title: "Ishdan haydaldingiz",
      body: "{nation} federatsiyasi sizni lavozimingizdan ozod qildi.",
    },
    resigned: {
      title: "Siz iste'fo berdingiz",
      body: "Siz {nation} bosh murabbiyligidan iste'fo berdingiz.",
    },
    notRenewed: {
      title: "Shartnoma uzaytirilmadi",
      body: "{nation} federatsiyasi shartnomangizni uzaytirmaslikka qaror qildi.",
    },
    renewed: {
      title: "Shartnoma uzaytirildi",
      body: "{nation} federatsiyasi shartnomangizni {date} gacha uzaytirdi.",
    },
    extended: {
      title: "Yana bir yil",
      body: "{nation} federatsiyasi shartnomangizni faqat bir yilga uzaytirdi. Ular o'sishni ko'rishni xohlaydi.",
    },
    coachChange: {
      title: "{nation} murabbiyni almashtirdi",
      body: "{nation} yangi bosh murabbiy etib {coach} ni tayinladi.",
    },
    coachSacked: {
      title: "{nation} {coach} ni ishdan haydadi",
      body: "{nation} yomon natijalardan so'ng bosh murabbiy {coach} bilan yo'llarini ajratdi. Vorisni qidirish boshlandi.",
    },
    coachRetired: {
      title: "{coach} nafaqaga chiqdi",
      body: "{coach} {nation} bosh murabbiyligidan ketdi va murabbiylik faoliyatini tugatdi.",
    },
    offer: {
      title: "Ish taklifi: {nation}",
      body: "{nation} federatsiyasi sizni yangi bosh murabbiy sifatida ko'rmoqchi. Taklif {date} gacha amal qiladi.",
    },
    newJob: {
      title: "Yangi ish: {nation}",
      body: "Siz {nation} ning yangi bosh murabbiyisiz.",
    },
    tourney: {
      through: "{comp}: o'tdik",
      throughTo: "Biz {round} bosqichiga chiqdik.",
      throughBare: "Biz keyingi bosqichga chiqdik.",
      out: "{comp}: chiqib ketdik",
      groupOut: "{group} da yakunladik, ammo keyingi bosqichga o'ta olmadik.",
      knockedOut: "Biz {round} bosqichida turnirdan chiqib ketdik.",
      runnersUp: "{comp}: ikkinchi o'rin",
      lostFinal: "Finalda yutqazdik.",
    },
    qualified: {
      title: "{finals} ga yo'llanma oldik",
      body: "Biz {finals} da qatnashish huquqini qo'lga kiritdik.",
    },
    playoff: {
      title: "Pley-offga chiqdik",
      body: "Biz {finals} uchun konfederatsiyalararo pley-offga chiqdik.",
    },
    missedOut: {
      title: "Yo'llanma olinmadi",
      body: "Biz {finals} ga yo'llanma ola olmadik.",
    },
    finalsGeneric: "final bosqichi",
    injury: {
      title: "{name} jarohat oldi",
      body: "{name} klubda {injury} oldi va {date} gacha safdan chiqdi.",
    },
    newClub: "yangi klub",
    bigMove: {
      title: "{name} katta transferga erishdi",
      body: "{name} terma jamoadagi yutuqlari tufayli {club} ga o'tdi.",
    },
    move: {
      title: "{name} yangi klubga o'tmoqda",
      body: "{name} {club} ga o'tdi.",
    },
    prospects: {
      title: "Shu mavsumdagi istiqbolli o'yinchilaringiz",
      body: "Siz kuzatayotgan yoshlar qanday rivojlandi: {list}.",
    },
    season: {
      title: "{from}–{to} mavsumi boshlandi",
      body: "O'yinchilar o'tgan mavsumda rivojlandi va yozgi transfer oynasi yopildi.",
    },
    retired: {
      entry: "{name} ({pos}, {age})",
      entryCaps: "{name} ({pos}, {age}, {caps} o'yin)",
    },
    retire: {
      title: "{name} terma jamoadagi faoliyatini tugatdi",
      body: "{name} ({age} yosh, {caps} o'yin) terma jamoadan nafaqaga chiqqanini e'lon qildi.",
    },
    wonderkid: {
      title: "Vunderkind paydo bo'ldi: {name}",
      body: "Skautlar {club} klubidagi {age} yoshli {pos} {name} haqida hayajon bilan gapirmoqda.",
    },
    newgen: {
      entry: "{name} ({pos}, {age}, {club})",
    },
    retiredMany: {
      title: "{n} ta o'yinchi nafaqaga chiqdi",
      body: "Bu o'yinchilar butsalarini mixga osdi: {list}.",
    },
    newgens: {
      title: "{n} ta yosh futbolchi yetishib chiqdi",
      body: "Biz uchun o'ynay oladigan yangi avlod: {list}.",
    },
    stadium: {
      build: {
        title: "{stadium} qurilishi boshlandi",
        body: "Federatsiya {city} shahrida {seats} o'rinli stadion qurmoqda, ochilish sanasi: {date}.",
      },
      expand: {
        title: "{stadium} kengaytiriladi",
        body: "{city} shahridagi {stadium} ishlar tugagach, {date} kuni {seats} o'rinli bo'ladi.",
      },
      opened: {
        build: "{nation} {stadium} stadionini ochdi",
        expand: "{stadium} kengaytirildi",
        body: "{city} shahridagi {stadium} endi {seats} o'rinli{ready}.",
      },
      readyFor: ", {comp} ga tayyor",
    },
    champions: {
      title: "{winner} {comp} g'olibi bo'ldi",
      body: "{winner} chempion{beat}.",
      beat: ", finalda {runnerUp} jamoasini yengib",
    },
    draw: {
      title: "{comp}: {stage}",
      group: "Qur'a tashlandi. Biz {others} bilan o'ynaymiz.",
      tie: "Qur'a bizni {opp} jamoasi bilan juftladi.",
    },
    and: "{a} va {b}",
    host: {
      title: "{list} {comp} mezbonlari",
      one: "{list} {comp} turnirini {date} dan boshlab o'tkazadi.",
      many: "{list} {comp} turnirini {date} dan boshlab birgalikda o'tkazadi.",
    },
    placeholder: {
      title: "{team} o'z o'rnini egalladi",
      body: "{team} {label} da g'olib bo'ldi va qur'adagi o'rinni to'ldirdi.",
    },
  },
  ms: {
    trophy: "Birinchi kuboklaringiz: {comp}.",
    world: "Jahon chempionlari! {nation} {comp} g'olibi bo'ldi.",
    continental: "Qit'a chempionlari: {comp}.",
    qualification: "Siz {nation} jamoasini yirik turnirga olib chiqdingiz.",
    worldCup: "Siz {nation} jamoasini Jahon chempionatiga olib chiqdingiz.",
    firstWin: "Terma jamoa bosh murabbiyi sifatidagi birinchi g'alabangiz.",
    matches: "Terma jamoa bosh murabbiyi sifatida {n} ta o'yin.",
    debuts: "Sizning qo'l ostingizda {n} ta o'yinchi terma jamoadagi birinchi o'yinini o'tkazdi.",
    youthDebuts:
      "21 yosh va undan kichik besh nafar o'yinchi terma jamoa darajasida sinovdan o'tdi.",
    unbeaten: "O'n ta rasmiy o'yinda mag'lub bo'lmadingiz.",
    top10: "Sizning qo'l ostingizda {nation} jahon o'ntaligida.",
    no1: "{nation} dunyodagi eng yaxshi jamoa.",
  },
  review: {
    reached: {
      champions: "Chempionlar",
      knockedOut: "Turnirdan chiqib ketgan",
      qualified: "Yo'llanma olgan",
      notQualified: "Yo'llanma ololmagan",
      leagueStage: "Liga bosqichi",
      promoted: "{letter}-ligaga yuksaldi",
      relegated: "{letter}-ligaga tushdi",
      stayed: "{letter}-ligada qoldi",
      runnersUp: "Ikkinchi o'rin",
      groups: "Guruh bosqichi",
    },
    msg: {
      delightedChampion:
        "Federatsiya xursand. {comp} da g'olib bo'lish hech kim umid qilishga jur'at etmagan natija, obro'ingiz hech qachon bunchalik baland bo'lmagan.",
      delighted:
        "Federatsiya {comp} natijalaridan xursand. Siz ulardan so'ralganidan ko'prog'ini berdingiz.",
      satisfied:
        "Federatsiya {comp} natijalaridan mamnun. Vazifa bajarildi; endi ular bundan keyin ham yuksalishingizni kutadi.",
      disappointed:
        "Federatsiya {comp} natijalaridan xafa. Ular ko'proq narsa kutgan edi, sabr-toqatlari cheksiz emas.",
      ultimatum:
        "{comp} dan so'ng federatsiyaning sabri tugadi. Natijalar zudlik bilan yaxshilanishi kerak, aks holda ularni ta'minlay oladigan kishini topishadi.",
      sacked:
        "{comp} sabr kosasini to'ldirdi. Federatsiya sizni lavozimingizdan ozod qilishga qaror qildi.",
      contractEnd:
        "{comp} shartnomangizning yakuni bo'ldi, federatsiya uni uzaytirmaslikka qaror qildi.",
    },
  },
  fx: {
    friendly: "Xalqaro do'stona o'yin",
    window: "Xalqaro oyna",
    matchday: "{stage} · {n}-tur",
    groupMatchday: "{stage} · {group} · {n}-tur",
    round: "{round}",
    stageRound: "{stage} · {round}",
    roundLeg: "{round} · {leg}-o'yin",
    stageRoundLeg: "{stage} · {round} · {leg}-o'yin",
  },
  lineup: {
    nobody: "{pos} pozitsiyasida hech kim o'ynamayapti",
    notInSquad: "{name} ({pos}) tarkibda yo'q",
    injured: "{name} ({pos}) jarohatli ({label})",
    suspended: "{name} ({pos}) diskvalifikatsiya qilingan",
  },
  placeholder: {
    uefa: "UEFA pley-off {path}-yo'li",
    path: "Pley-off {path}-yo'li",
    tournament: "Pley-off turniri",
    qualifier: "Saralash g'olibi {n}",
    winner: "{base} g'olibi",
    tournamentWinner: "Pley-off turniri g'olibi {n}",
    shortIc: "KP {n}",
    shortPo: "PO {path}",
  },
  injury: {
    "hamstring-strain": "Son orqasi mushaklari cho'zilishi",
    "ankle-sprain": "Boldir-tovon bo'g'imi burkalishi",
    "calf-strain": "Boldir mushaklari cho'zilishi",
    "groin-strain": "Chov mushaklari cho'zilishi",
    "thigh-strain": "Son mushaklari cho'zilishi",
    "knee-injury": "Tizza jarohati",
    "broken-foot": "Oyoq suyagi sinishi",
    "cruciate-ligament-rupture": "Xochsimon boylam uzilishi",
    knock: "Zarba",
  },
  stage: {
    group: "{name}-guruh",
    league: "Liga",
    leagueN: "{x}-liga",
    roundOf: "1/{n} final",
    "round-of-16": "1/8 final",
    "round-of-32": "1/16 final",
    "quarter-finals": "Chorak final",
    "semi-finals": "Yarim final",
    final: "Final",
    finals: "Final bosqichi",
    "third-place": "Uchinchi o'rin",
    "bronze-final": "Bronza final",
    "group-stage": "Guruh bosqichi",
    "knockout-stage": "Pley-off bosqichi",
    "league-phase": "Liga bosqichi",
    qualifying: "Saralash",
    "preliminary-round": "Dastlabki bosqich",
    preliminaryN: "{n}-dastlabki bosqich",
    prelims: "Dastlabki bosqich",
    "first-round": "Birinchi bosqich",
    "second-round": "Ikkinchi bosqich",
    "third-round": "Uchinchi bosqich",
    "fourth-round": "To'rtinchi bosqich",
    "fifth-round": "Beshinchi bosqich",
    "final-round": "Yakuniy bosqich",
    "play-offs": "Pley-off",
    "play-in": "Play-In",
    "play-off-round": "Pley-off bosqichi",
    "play-off-semi-finals": "Pley-off yarim finali",
    "play-off-finals": "Pley-off finali",
    "play-off-final": "Pley-off finali",
    "play-off-tournament": "Pley-off turniri",
    "promotion-relegation-play-offs": "Yuksalish/tushish pley-offi",
    "league-a-quarter-finals": "A-liga chorak finali",
    "league-a-finals": "A-liga finali",
    "league-b-finals": "B-liga finali",
    "league-c-finals": "C-liga finali",
  },
  comp: {
    wc: {
      name: "Jahon chempionati {year}",
      short: "Jahon chempionati",
      plain: "Jahon chempionati",
    },
    "wcq-uefa": {
      name: "Jahon chempionati {year} saralashi · UEFA",
      short: "JCh saralashi Yevropa",
      plain: "Jahon chempionati saralashi · UEFA",
    },
    "wcq-caf": {
      name: "Jahon chempionati {year} saralashi · CAF",
      short: "JCh saralashi Afrika",
      plain: "Jahon chempionati saralashi · CAF",
    },
    "wcq-afc": {
      name: "Jahon chempionati {year} saralashi · AFC",
      short: "JCh saralashi Osiyo",
      plain: "Jahon chempionati saralashi · AFC",
    },
    "wcq-concacaf": {
      name: "Jahon chempionati {year} saralashi · CONCACAF",
      short: "JCh saralashi CONCACAF",
      plain: "Jahon chempionati saralashi · CONCACAF",
    },
    "wcq-conmebol": {
      name: "Jahon chempionati {year} saralashi · CONMEBOL",
      short: "JCh saralashi Janubiy Amerika",
      plain: "Jahon chempionati saralashi · CONMEBOL",
    },
    "wcq-ofc": {
      name: "Jahon chempionati {year} saralashi · OFC",
      short: "JCh saralashi Okeaniya",
      plain: "Jahon chempionati saralashi · OFC",
    },
    "wcq-ic": {
      name: "Jahon chempionati {year} pley-off turniri",
      short: "Pley-off",
      plain: "Jahon chempionati pley-off turniri",
    },
    euro: {
      name: "UEFA Yevro {year}",
      short: "Yevro",
      plain: "UEFA Yevro",
    },
    euroq: {
      name: "UEFA Yevro {year} saralashi",
      short: "Yevro saralashi",
      plain: "UEFA Yevro saralashi",
    },
    unl: {
      name: "UEFA Millatlar ligasi {year}–{year2}",
      short: "Millatlar ligasi",
      plain: "UEFA Millatlar ligasi",
    },
    finalissima: {
      name: "Finalissima {year}",
      short: "Finalissima",
      plain: "Finalissima",
    },
    afcon: {
      name: "Afrika millatlar kubogi {year}",
      short: "AFCON",
      plain: "Afrika millatlar kubogi",
    },
    afconq: {
      name: "Afrika millatlar kubogi {year} saralashi",
      short: "AFCON saralashi",
      plain: "Afrika millatlar kubogi saralashi",
    },
    "asian-cup": {
      name: "AFC Osiyo kubogi {year}",
      short: "Osiyo kubogi",
      plain: "AFC Osiyo kubogi",
    },
    "asian-cupq": {
      name: "AFC Osiyo kubogi {year} saralashi",
      short: "Osiyo kubogi saralashi",
      plain: "AFC Osiyo kubogi saralashi",
    },
    copa: {
      name: "Kopa Amerika {year}",
      short: "Kopa Amerika",
      plain: "Kopa Amerika",
    },
    "ofc-cup": {
      name: "OFC Millatlar kubogi {year}",
      short: "OFC Millatlar kubogi",
      plain: "OFC Millatlar kubogi",
    },
    cnl: {
      name: "CONCACAF Millatlar ligasi {year}–{year2}",
      short: "CONCACAF ML",
      plain: "CONCACAF Millatlar ligasi",
    },
    gcq: {
      name: "CONCACAF Oltin kubok {year} saralashi",
      short: "Oltin kubok saralashi",
      plain: "CONCACAF Oltin kubok saralashi",
    },
    "gold-cup": {
      name: "CONCACAF Oltin kubogi {year}",
      short: "Oltin kubok",
      plain: "CONCACAF Oltin kubogi",
    },
    "arab-cup": {
      name: "Arab kubogi {year}",
      short: "Arab kubogi",
      plain: "Arab kubogi",
    },
    "gulf-cup": {
      name: "Arab ko'rfazi kubogi {year}",
      short: "Ko'rfaz kubogi",
      plain: "Arab ko'rfazi kubogi",
    },
    aff: {
      name: "ASEAN chempionati {year}",
      short: "ASEAN chempionati",
      plain: "ASEAN chempionati",
    },
    "asean-cup": {
      name: "ASEAN kubogi {year}",
      short: "ASEAN kubogi",
      plain: "ASEAN kubogi",
    },
    "asean-challenge": {
      name: "ASEAN Challenge kubogi {year}",
      short: "ASEAN Challenge kubogi",
      plain: "ASEAN Challenge kubogi",
    },
    "inv-mar": {
      name: "Mart taklifnoma turniri {year}",
      short: "Mart turniri",
      plain: "Mart taklifnoma turniri",
    },
    "inv-jun": {
      name: "Iyun taklifnoma turniri {year}",
      short: "Iyun turniri",
      plain: "Iyun taklifnoma turniri",
    },
    "inv-sep": {
      name: "Kuz taklifnoma turniri {year}",
      short: "Kuz turniri",
      plain: "Kuz taklifnoma turniri",
    },
    "inv-nov": {
      name: "Noyabr taklifnoma turniri {year}",
      short: "Noyabr turniri",
      plain: "Noyabr taklifnoma turniri",
    },
    e1: {
      name: "EAFF E-1 chempionati {year}",
      short: "E-1",
      plain: "EAFF E-1 chempionati",
    },
    cafa: {
      name: "CAFA Millatlar kubogi {year}",
      short: "CAFA kubogi",
      plain: "CAFA Millatlar kubogi",
    },
    waff: {
      name: "WAFF chempionati {year}",
      short: "WAFF chempionati",
      plain: "WAFF chempionati",
    },
    saff: {
      name: "SAFF chempionati {year}",
      short: "SAFF chempionati",
      plain: "SAFF chempionati",
    },
    cosafa: {
      name: "COSAFA kubogi {year}",
      short: "COSAFA kubogi",
      plain: "COSAFA kubogi",
    },
    cecafa: {
      name: "CECAFA Senior Challenge kubogi {year}",
      short: "CECAFA kubogi",
      plain: "CECAFA Senior Challenge kubogi",
    },
    wafu: {
      name: "WAFU zona kubogi {year}",
      short: "WAFU kubogi",
      plain: "WAFU zona kubogi",
    },
    baltic: {
      name: "Boltiq kubogi {year}",
      short: "Boltiq kubogi",
      plain: "Boltiq kubogi",
    },
  },
  role: {
    stopper: {
      label: "Stopper",
      blurb:
        "To'pni olish uchun oldinga chiqadi va hamma boshli to'plarni oladi; to'p bilan kamroq yordam beradi.",
    },
    "ball-playing": {
      label: "O'yin quruvchi himoyachi",
      blurb: "To'p bilan yarim himoyaga chiqadi; to'pni olishda yengilroq.",
    },
    cover: {
      label: "Sug'urtalovchi himoyachi",
      blurb:
        "Chuqur va ishonchli turadi; kamdan-kam qoidabuzarlik qiladi, kamdan-kam hujum boshlaydi.",
    },
    "defensive-full-back": {
      label: "Himoyaviy chekka himoyachi",
      blurb: "O'z chizig'ini saqlaydi va to'pni oladi; oldinga chiqmaydi.",
    },
    "wing-back": {
      label: "Qanot himoyachisi",
      blurb:
        "Butun qanotni bosib o'tadi, markazga to'p tashlaydi va zarba beradi; orqasida bo'shliq qoldiradi.",
    },
    "inverted-full-back": {
      label: "Ichkariga o'tuvchi chekka himoyachi",
      blurb: "O'yin qurish uchun yarim himoyaga o'tadi; qanotni bo'sh qoldiradi.",
    },
    anchor: {
      label: "Langar",
      blurb: "Himoya oldida turadi; uni to'sib turadi va o'yinni sodda saqlaydi.",
    },
    "ball-winner": {
      label: "To'p oluvchi",
      blurb: "Yarim himoyaning hamma joyida to'pni quvadi va shu bois qoidabuzarlik qiladi.",
    },
    "deep-playmaker": {
      label: "Chuqur o'yin quruvchi",
      blurb: "O'yinni chuqurdan boshqaradi; himoyaga kamroq yordam beradi.",
    },
    "box-to-box": {
      label: "Jarima maydonidan jarima maydoniga",
      blurb: "Butun maydonni qamrab oladi va jarima maydoniga kech yetib keladi.",
    },
    playmaker: {
      label: "O'yin quruvchi",
      blurb: "Sur'atni belgilaydi va hal qiluvchi uzatmani topadi; himoyada kamroq ishlaydi.",
    },
    destroyer: {
      label: "Buzg'unchi",
      blurb: "Raqib o'yinini buzadi va ko'p qoidabuzarlik qiladi; hujumga kam qo'shadi.",
    },
    "advanced-playmaker": {
      label: "Oldingi o'yin quruvchi",
      blurb: "Chiziqlar orasida o'ynaydi va imkoniyat yaratadi; o'zi kamroq gol uradi.",
    },
    "shadow-striker": {
      label: "Soya hujumchi",
      blurb: "Hujumchi ortidan yuguradi va zarba beradi; kamroq imkoniyat yaratadi.",
    },
    tracker: {
      label: "Kuzatuvchi",
      blurb: "Oldindan pressing qiladi va orqaga qaytadi; xavfi kamroq.",
    },
    winger: {
      label: "Qanot hujumchisi",
      blurb: "Chiziq bo'ylab yuradi va markazga to'p tashlaydi.",
    },
    "inside-forward": {
      label: "Ichkariga o'tuvchi hujumchi",
      blurb:
        "Zarba berish uchun ichkariga kiradi; qanotni kam kengaytiradi, kam markazga to'p tashlaydi.",
    },
    "tracking-winger": {
      label: "Orqaga qaytuvchi qanot",
      blurb: "Chekka himoyachiga yordam berish uchun orqaga qaytadi; oldinga kam chiqadi.",
    },
    "target-man": {
      label: "Nishon hujumchi",
      blurb: "Boshli to'plarni yutadi va to'pni ushlab turadi; eng o'tkir yakunlovchi emas.",
    },
    poacher: {
      label: "Jarima maydoni ovchisi",
      blurb: "Jarima maydonida imkoniyat kutadi; boshqa hech narsa qilmaydi.",
    },
    "complete-forward": {
      label: "Universal hujumchi",
      blurb: "Gol uradi, sheriklar bilan bog'lanadi va imkoniyat yaratadi.",
    },
    "pressing-forward": {
      label: "Pressingchi hujumchi",
      blurb: "Himoyachilarni oldindan bezovta qiladi; jarima maydonida xavfi kamroq.",
    },
  },
  arch: {
    "shot-stopper": {
      label: "Zarba qaytaruvchi",
      blurb: "O'z chizig'ini boshqaradi va qaytarib bo'lmaydigan to'plarni qaytaradi.",
    },
    "sweeper-keeper": {
      label: "Libero darvozabon",
      blurb: "Himoya ortini tozalaydi va hujum boshlaydi; chiziqda biroz kamroq ishonchli.",
    },
    stopper: {
      label: "Stopper",
      blurb: "Duellarda yutadi va to'pni uzoqqa uradi, ammo o'yin qurishga kam hissa qo'shadi.",
    },
    "ball-playing-defender": {
      label: "O'yin quruvchi himoyachi",
      blurb: "Hujumni orqadan boshlaydi; to'pni olishda biroz yengilroq.",
    },
    "defensive-full-back": {
      label: "Himoyaviy chekka himoyachi",
      blurb: "Orqada qoladi, to'pni oladi va qanotni yopadi.",
    },
    "attacking-full-back": {
      label: "Hujumkor chekka himoyachi",
      blurb:
        "Qanotdan o'tadi, markazga to'p tashlaydi va jarima maydoniga kiradi; orqasida bo'shliq qoldiradi.",
    },
    "ball-winner": {
      label: "To'p oluvchi",
      blurb: "Himoya oldida raqib o'yinini buzadi va shu bois qoidabuzarlik qiladi.",
    },
    "deep-playmaker": {
      label: "Chuqur o'yin quruvchi",
      blurb: "O'yinni chuqurdan uzun uzatmalar bilan boshqaradi.",
    },
    "box-to-box": {
      label: "Jarima maydonidan jarima maydoniga",
      blurb: "Maydonning har bir qarichini qamrab oladi va jarima maydoniga kech yetib keladi.",
    },
    playmaker: {
      label: "O'yin quruvchi",
      blurb: "Sur'atni belgilaydi va hal qiluvchi uzatmani topadi.",
    },
    creator: {
      label: "Yaratuvchi",
      blurb: "Chiziqlar orasida o'ynaydi; golga qaraganda assist ko'proq.",
    },
    "shadow-striker": {
      label: "Soya hujumchi",
      blurb: "Hujumchi ortidan yuguradi va o'zi gol uradi.",
    },
    winger: {
      label: "Qanot hujumchisi",
      blurb: "Chiziq bo'ylab yuradi va markazga to'p tashlaydi.",
    },
    "inside-forward": {
      label: "Ichkariga o'tuvchi hujumchi",
      blurb: "Zarba berish uchun qanotdan ichkariga kiradi.",
    },
    "target-man": {
      label: "Nishon hujumchi",
      blurb: "Boshli to'plarni yutadi va to'pni ushlab turadi; eng o'tkir yakunlovchi emas.",
    },
    poacher: {
      label: "Jarima maydoni ovchisi",
      blurb: "Jarima maydonida yashaydi va unga kelgan to'pni gol qiladi; boshqa kam narsa qiladi.",
    },
    "complete-forward": {
      label: "Universal hujumchi",
      blurb: "Gol uradi, sheriklar bilan bog'lanadi va imkoniyat yaratadi.",
    },
  },
  rule: {
    "behind-high-line": "Yuqori chiziq ortiga uzatmalar",
    "counter-into-deep-block": "Chuqur blokka qarshi qarshi hujum uchun bo'shliq yo'q",
    "width-into-back-five": "Beshta himoyachiga qarshi kenglik behuda ketadi",
    "width-into-open-flanks": "Ochiq qanotli to'rt himoyachiga qarshi kenglik",
    "patience-into-press": "Yuqori pressingga qarshi sabrli o'yin qurish",
    "direct-past-press": "Yuqori pressingni chetlab o'tuvchi to'g'ridan-to'g'ri o'yin",
    "lone-striker-into-back-three": "Uchta markaziy himoyachiga qarshi yolg'iz hujumchi",
    "two-strikers-into-flat-four": "To'rt himoyachiga qarshi ikkita hujumchi",
    "midfield-numbers": "Markazda ko'proq o'yinchi",
    "midfield-outnumbered": "Markazda sonda kam",
    "press-patient-side": "Sabrli jamoaga qarshi yuqori pressing",
    "narrow-into-wide": "Tor jamoa keng jamoaga qarshi markazni to'ldiradi",
  },
  badge: {
    "big-game": {
      label: "Katta o'yin futbolchisi",
      text: "Final va hal qiluvchi o'yinlarda o'z darajasidan yuqori o'ynaydi va penalti nuqtasida sovuqqonligini saqlaydi.",
    },
    reliable: {
      label: "Ishonchli",
      text: "Deyarli har bir o'yinda o'z darajasida o'ynaydi.",
    },
    erratic: {
      label: "Beqaror",
      text: "O'yin baholari o'zgarib turadi; bir kuni ajoyib, ertasi kuni yomon.",
    },
    "injury-prone": {
      label: "Jarohatga moyil",
      text: "O'yinda jarohat olish ehtimoli yuqori.",
    },
    "tires-early": {
      label: "Erta charchaydi",
      text: "Yosh o'yinchiga qaraganda tezroq holdan toyadi.",
    },
  },
  bond: {
    clubmates: "Klubdoshlar",
    friends: "Do'stlar",
    feud: "Nizo",
  },
  spirit: {
    tight: "Chambarchas",
    good: "Yaxshi",
    neutral: "Neytral",
    uneasy: "Bezovta",
    divided: "Ikkiga bo'lingan",
  },
  scout: {
    trait: {
      attack: "Hujumga yo'naltirilgan",
      cautious: "Ehtiyotkor",
      highLine: "Yuqori chiziq",
      deepLine: "Chuqur chiziq",
      wide: "Qanotdan o'ynaydi",
      narrow: "Tor o'ynaydi",
      counter: "Qarshi hujumchi",
      highPress: "Yuqori pressing",
      dropsOff: "Orqaga tushadi",
      direct: "To'g'ridan-to'g'ri",
      patient: "Sabrli",
      balanced: "Muvozanatli",
    },
    reason: {
      star: "Ularning eng yaxshi o'yinchisi",
      threat: "Ularning asosiy gol xavfi",
      creator: "Imkoniyatlarning ko'pini yaratadi",
      weak: "Zaif bo'g'in",
    },
    level: {
      "0": "Chuqur",
      "1": "Standart",
      "2": "Yuqori",
    },
    width: {
      "0": "Tor",
      "1": "Standart",
      "2": "Keng",
    },
    change: {
      line: "Himoya chizig'i: {from} → {to}",
      width: "Kenglik: {from} → {to}",
      counter: "Qarshi hujum: {from} → {to}",
    },
    on: "yoq",
    off: "o'ch",
  },
}

export default engine
