import type { CommentaryText } from "@/engine/match/commentary"

/** Live commentary in Uzbek; same placeholders as the English set. */
const commentary: CommentaryText = {
  assist: " Assist: {a}.",
  forward: "oldinga",
  lane: {
    left: "chap qanotdan",
    centre: "markazdan",
    right: "o'ng qanotdan",
  },
  shots: {
    long: {
      goal: [
        "GOL! {p} uzoqdan zarba berdi va to'p to'rda!{assist}",
        "GOL! {p} jarima maydoni tashqarisidan zambarakdek zarba berdi!{assist}",
      ],
      "shot-saved": [
        "{p} uzoqdan urdi — {o} to'pni ushladi.",
        "{p}ning uzoqdan zarbasi {o}ning qo'lida ishonchli qoldi.",
      ],
      "shot-wide": [
        "{p} uzoqdan zarba berdi. To'p chetdan o'tdi.",
        "{p} jarima maydoni tashqarisidan urdi — to'p darvoza ustidan ketdi.",
      ],
      "shot-blocked": ["{p}ning uzoqdan zarbasini {o} to'sib qo'ydi."],
      woodwork: ["{p} uzoqdan zarba berib, to'pni darvoza ustuniga tegizdi!"],
    },
    close: {
      goal: [
        "GOL! {p} yaqindan to'pni to'rga yo'lladi!{assist}",
        "GOL! {p} orqaga uzatilgan to'pni gol qildi!{assist}",
      ],
      "shot-saved": ["{o} {p}ning yaqindan zarbasini qaytardi, gol bo'lmadi!"],
      "big-chance-missed": [
        "{p} darvoza oldidan ishonib bo'lmas darajada xato qildi!",
        "To'p {p}ga tayyor holda keldi... va u to'pni chetga uchirdi!",
      ],
    },
    header: {
      goal: [
        "GOL! {p} hammadan baland sakrab, to'pni boshi bilan to'rga yo'lladi!{assist}",
        "GOL! {p}ning ajoyib boshli zarbasi!{assist}",
      ],
      "shot-saved": [
        "{p} boshi bilan urdi, ammo {o} to'pni ushladi.",
        "{p}ning boshli zarbasi — to'g'ri {o}ga.",
      ],
      "shot-wide": [
        "{p} boshi bilan urdi, to'p ustidan ketdi.",
        "{p} to'pga yetib keldi, ammo boshli zarba nishonga bormadi.",
      ],
      woodwork: ["{p}ning boshli zarbasi to'singa tegdi!"],
      "big-chance-missed": [
        "{p} hech kim to'sqinlik qilmagan holda boshi bilan urdi va xato qildi!",
      ],
    },
    "one-on-one": {
      goal: [
        "GOL! {p} darvozabonni aldab o'tib, gol urdi!{assist}",
        "GOL! {p} yakkama-yakkada sovuqqonlik bilan to'pni darvozabon yonidan o'tkazdi!{assist}",
      ],
      "shot-saved": [
        "{p} yakkama-yakka chiqdi... {o} burchakni yopib, to'pni qaytardi!",
        "{o}dan ajoyib seyv! {p} bilan yakkama-yakkada ustun keldi.",
      ],
      "big-chance-missed": [
        "{p} darvozabon bilan yuzma-yuz qoldi... va to'pni chetga uchirdi! Ishonib bo'lmaydi!",
        "{p} darvozabon bilan yakkama-yakka qolib, to'pni ustun yonidan o'tkazib yubordi!",
      ],
    },
    "free-kick": {
      goal: [
        "GOL! {p} jarima zarbasini to'g'ri burchakka yo'lladi!",
        "GOL! {p}ning ajoyib jarima zarbasi!",
      ],
      "shot-saved": [
        "{p} jarima zarbasini to'g'ridan-to'g'ri urdi — {o} to'pni burchakka chiqarib yubordi!",
        "{p}ning jarima zarbasini {o} qaytardi.",
      ],
      "shot-wide": [
        "{p}ning jarima zarbasi darvoza ustidan ketdi.",
        "{p} to'pni egib yubordi, ammo ustun yonidan o'tib ketdi.",
      ],
      "shot-blocked": ["{p}ning zarbasi devorga tegdi."],
      woodwork: ["{p}ning jarima zarbasi ustunga tegdi!"],
    },
    rebound: {
      goal: [
        "GOL! {p} qaytgan to'pni gol qildi!",
        "GOL! Darvozabon to'pni qaytardi va {p} birinchi bo'lib yetib keldi!",
      ],
      "shot-saved": ["{p} qaytgan to'pga yetdi, ammo {o} yana qaytardi!"],
      "shot-wide": ["{p} qaytgan to'pga shoshib urdi va chetdan o'tkazib yubordi."],
    },
  },
  moves: {
    counter: { before: "Qarshi hujum! ", after: " Chaqmoqdek qarshi hujum." },
    press: {
      before: "To'p hujum zonasida tortib olindi! ",
      after: " To'pni yo'qotgani uchun jazo.",
    },
  },
  lines: {
    kickoff: [
      "O'yin boshlandi!",
      "Hakam hushtak chaldi, {team:home} o'yinni boshladi.",
      "To'p markazdan qo'zg'aldi. Boshladik.",
    ],
    "half-time": [
      "Hakam birinchi bo'lim tugaganini bildirdi.",
      "Birinchi bo'lim yakunlandi.",
      "Tanaffus. O'yinchilar kiyinish xonasiga ketmoqda.",
    ],
    "second-half": [
      "Ikkinchi bo'lim boshlandi.",
      "Oxirgi qirq besh daqiqa uchun to'p markazdan qo'zg'aldi.",
    ],
    "full-time": ["Hakam o'yin yakuni hushtagini chaldi!", "Tamom!", "O'yin yakunlandi."],
    "et-start": [
      "Qo'shimcha vaqt boshlandi. Hal qiluvchi yana o'ttiz daqiqa.",
      "Qo'shimcha vaqt boshlandi.",
    ],
    "et-half-time": ["Qo'shimcha vaqt tanaffusi. O'n besh daqiqa qoldi."],
    "et-second-half": ["Qo'shimcha vaqtning oxirgi o'n besh daqiqasi boshlandi."],
    "et-end": [
      "Jamoalarni hech narsa ajratmadi. Gap penaltilarda hal bo'ladi!",
      "Qo'shimcha vaqt g'olibni aniqlamadi — penaltilar seriyasi.",
    ],
    attack: [
      "{p} {team} uchun {lane} oldinga intildi, ammo {o} to'sqinlik qildi.",
      "{team} hujumni {lane} rivojlantirdi, ammo oxirgi uzatmani {o} uzib qo'ydi.",
      "{p} yo'l izlamoqda. {o} o'yinni yaxshi o'qidi.",
      "{team}ning sabrli hujumi, ammo oxirgi uzatma xato ketdi.",
      "{p} oraliq uzatma berishga urindi — {o} to'pni to'sib oldi.",
    ],
    goal: [
      "GOL! {p} {team} uchun to'rni larzaga keltirdi!{assist}",
      "GOL! {p} xato qilmadi!{assist}",
      "GOL! {p}ning ajoyib yakuni!{assist}",
      "GOL! {p} {team} uchun to'pni to'rga joyladi!{assist}",
      "GOL! {p} to'g'ri joyda bo'lib, to'pni to'rga yo'lladi!{assist}",
    ],
    "own-goal": [
      "O'Z DARVOZASIGA GOL! {p} to'pni o'z to'riga yubordi. Uning uchun fojia.",
      "O'Z DARVOZASIGA GOL! {p} to'pni faqat o'z darvozabonining ustidan oshirib yubora oldi.",
    ],
    "penalty-awarded": [
      "PENALTI! {o} {p}ni jarima maydonida yiqitdi!",
      "Hakam penalti nuqtasiga ishora qildi! {p} {o} tomonidan yiqitildi.",
    ],
    "pen-goal": [
      "GOL! {p} penaltida darvozabonni aldab, to'pni boshqa tomonga yo'lladi!",
      "GOL! {p} penaltini aniq amalga oshirdi!",
    ],
    "pen-saved": [
      "SEYV! {o} burchakni topib, {p}ning penaltisini qaytardi!",
      "{p}ning penaltisini {o} qaytardi!",
    ],
    "pen-miss": [
      "{p} penaltini to'sin ustidan uchirdi!",
      "{p} penaltini chetga urdi! Katta yengillik.",
    ],
    "shot-saved": [
      "{p} darvozabonni sinadi — {o} to'pni ushladi.",
      "{p}dan yaxshi urinish, ammo {o} to'pga o'z vaqtida yetib bordi.",
      "{p} darvozaga zarba berdi. {o} uchun oson seyv.",
      "{o}dan {p}ga qarshi kuchli seyv!",
    ],
    "shot-wide": [
      "{p} uzoqdan zarba berdi. Chetdan.",
      "{p} zarba berdi, ammo to'p ustidan ketdi.",
      "{p} zarbaga shoshildi va imkoniyat boy berildi.",
      "{p} to'pni egib yubordi, ammo ustun yonidan o'tib ketdi.",
    ],
    "shot-blocked": [
      "{p} zarba berdi — {o} to'sib qo'ydi!",
      "{p}ning zarbasi to'sib qo'yildi.",
      "{o}dan {p}ni to'xtatish uchun jasur to'siq.",
    ],
    woodwork: [
      "{p} ustunga urdi!",
      "To'singa tegdi! {p} gol urishga sal qoldi!",
      "{p} darvoza yog'ochini larzaga keltirdi!",
    ],
    "big-chance-missed": [
      "Qanday imkoniyat! {p} gol urishi kerak edi, ammo to'pni chetga uchirdi!",
      "{p} yakka o'zi chiqdi... va o'tkazib yubordi! Ishonib bo'lmaydi.",
      "{p} oldida faqat darvozabon bor edi, ammo imkoniyatni yo'qotdi!",
    ],
    corner: [
      "{team} burchak to'pi bajaradi.",
      "{team} burchak to'pi oldi.",
      "To'p qaytdi va chiziqdan chiqdi: {team} uchun burchak.",
    ],
    "free-kick": [
      "{team} uchun xavfli joyda jarima zarbasi.",
      "{p} yiqitildi. Jarima zarbasi, darvozaga yaqin.",
    ],
    foul: [
      "{p}ning {o}ga qoidabuzarligi.",
      "{p} {o}ni orqadan urdi. Qoidabuzarlik.",
      "{p} {o}ga tegdi. Hakam qoidabuzarlikni belgiladi.",
    ],
    yellow: [
      "{p}ga sariq kartochka.",
      "{p} hakam daftariga tushdi.",
      "Hakam {p}ga sariq kartochka ko'rsatdi.",
    ],
    "second-yellow": [
      "{p}ga ikkinchi sariq kartochka! U maydondan chetlatildi!",
      "{p} ikkinchi ogohlantirishni oldi va maydondan chiqarildi!",
    ],
    red: [
      "QIZIL KARTOCHKA! {p} maydondan chetlatildi!",
      "{p}ga to'g'ridan-to'g'ri qizil kartochka! {team} o'n kishi qoldi.",
    ],
    offside: [
      "{p} ofsaydda ushlandi.",
      "Yon hakam {p}ga qarshi bayroqchani ko'tardi.",
      "{p} juda erta yugurib chiqdi. Ofsayd.",
    ],
    injury: [
      "{p} yiqilib qoldi, unga yordam kerak.",
      "{team} uchun xavotir: {p} jarohat oldi.",
      "{p} oyog'ini ushlab to'xtab qoldi.",
    ],
    sub: [
      "{team}da almashtirish: {o} o'rniga {p} maydonga tushdi.",
      "{team} o'zgartirish kiritdi. {o} chiqdi, {p} kirdi.",
    ],
    tactics: [
      "{team} o'yin uslubini o'zgartirmoqda.",
      "{team} zaxira o'rindig'i tuzatishlar kiritmoqda.",
    ],
    "shootout-goal": ["{p} gol urdi.", "{p} aniq bajardi.", "{p} — to'g'ri burchakka!"],
    "shootout-miss": [
      "{p} o'tkazib yubordi!",
      "{p}ning zarbasi qaytarildi!",
      "{p} to'pni ustidan uchirdi!",
    ],
    "shootout-end": [
      "{team} penaltilar seriyasida g'alaba qozondi!",
      "{team} sovuqqonligini saqladi!",
    ],
  },
}

export default commentary
