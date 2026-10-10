import type { CommentaryText } from "@/engine/match/commentary"

/** Live commentary in Turkish; same placeholders as the English set. */
const commentary: CommentaryText = {
  assist: " Asist: {a}.",
  forward: "ileri",
  lane: {
    left: "sol kanattan",
    centre: "ortadan",
    right: "sağ kanattan",
  },
  shots: {
    long: {
      goal: [
        "GOL! {p} uzaktan bir bomba patlatıyor ve top ağlarda!{assist}",
        "GOL! {p} ceza sahası dışından roketi ateşledi!{assist}",
      ],
      "shot-saved": [
        "{p} uzaktan deniyor — {o} topu kolayca tutuyor.",
        "{p}'nin uzaktan şutu, {o}'nun avuçlarında.",
      ],
      "shot-wide": [
        "{p} uzaktan vuruyor. Top dışarıda.",
        "{p} ceza sahası dışından deniyor — top üstten auta gidiyor.",
      ],
      "shot-blocked": ["{p}'nin uzaktan şutu {o} tarafından engelleniyor."],
      woodwork: ["{p}'nin uzaktan şutu direkten dönüyor!"],
    },
    close: {
      goal: [
        "GOL! {p} yakından topu ağlara gönderiyor!{assist}",
        "GOL! {p} geri çekilen topu ağlara bırakıyor!{assist}",
      ],
      "shot-saved": ["{o}, {p}'nin yakın mesafeden şutunu çıkarıyor!"],
      "big-chance-missed": [
        "{p} küçük alanın içinden inanılmaz bir şekilde kaçırıyor!",
        "Top {p}'nin önüne düştü... ve dışarı atıyor!",
      ],
    },
    header: {
      goal: [
        "GOL! {p} herkesten yükseğe çıkıyor ve kafayı ağlara gönderiyor!{assist}",
        "GOL! {p}'den harika bir kafa vuruşu!{assist}",
      ],
      "shot-saved": [
        "{p} kafayı vuruyor ama {o} kurtarıyor.",
        "{p}'nin kafası — doğrudan {o}'nun üzerine.",
      ],
      "shot-wide": [
        "{p} kafayı üstten auta gönderiyor.",
        "{p} ortaya geliyor ama kafa isabet etmiyor.",
      ],
      woodwork: ["{p}'nin kafa vuruşu üst direkte patlıyor!"],
      "big-chance-missed": ["{p} serbest kafa vuruyor ve hedefi bulamıyor!"],
    },
    "one-on-one": {
      goal: [
        "GOL! {p} kaleciyi çalımlıyor ve topu ağlara yolluyor!{assist}",
        "GOL! {p} bire birde soğukkanlı, kalecinin çıkışında topu geçiriyor!{assist}",
      ],
      "shot-saved": [
        "{p} kaleciyle karşı karşıya... {o} açıyı kapatıyor ve kurtarıyor!",
        "{o}'dan müthiş kurtarış! {p} ile bire birde ayakta kalıyor.",
      ],
      "big-chance-missed": [
        "{p} tek başına kaleyle karşı karşıya... ve dışarı atıyor! Ne kaçırış!",
        "{p} kaleciyle karşı karşıya kalıyor ve top direğin yanından geçiyor!",
      ],
    },
    "free-kick": {
      goal: ["GOL! {p} frikiği köşeye yerleştiriyor!", "GOL! {p}'den harika bir serbest vuruş!"],
      "shot-saved": [
        "{p} direkt vuruyor — {o} topu kornere çeliyor!",
        "{p}'nin serbest vuruşunu {o} kurtarıyor.",
      ],
      "shot-wide": [
        "{p}'nin serbest vuruşu üstten auta gidiyor.",
        "{p} frikiği falsolu vuruyor, top direğin dibinden dışarı çıkıyor.",
      ],
      "shot-blocked": ["{p}'nin vuruşu barajda patlıyor."],
      woodwork: ["{p}'nin frikiği direkte patlıyor!"],
    },
    rebound: {
      goal: [
        "GOL! {p} dönen topu değerlendiriyor!",
        "GOL! Kaleci topu çeliyor, {p} ilk ona yetişiyor!",
      ],
      "shot-saved": ["{p} dönen topa gidiyor ama {o} yine kurtarıyor!"],
      "shot-wide": ["{p} dönen topa acele ediyor ve dışarı atıyor."],
    },
  },
  moves: {
    counter: { before: "Kontra atakta! ", after: " Yıldırım gibi bir kontra atak." },
    press: {
      before: "Top hücum bölgesinde kazanıldı! ",
      after: " Topu kaybetmenin bedeli.",
    },
  },
  lines: {
    kickoff: [
      "Maç başlıyor!",
      "Hakem düdüğü çalıyor ve {team:home} başlama vuruşunu yapıyor.",
      "Top oyunda. Hadi bakalım.",
    ],
    "half-time": [
      "Hakem ilk yarının bitiş düdüğünü çalıyor.",
      "İlk yarı sona erdi.",
      "Devre arası. Oyuncular soyunma odasına gidiyor.",
    ],
    "second-half": ["İkinci yarı başlıyor.", "Son kırk beş dakika için top oyunda."],
    "full-time": ["Hakem maçın bitiş düdüğünü çalıyor!", "Maç bitti!", "Karşılaşma sona erdi."],
    "et-start": [
      "Uzatmalar başlıyor. Karar için otuz dakika daha var.",
      "Uzatma dakikaları başlıyor.",
    ],
    "et-half-time": ["Uzatmada devre arası. On beş dakika kaldı."],
    "et-second-half": ["Uzatmanın son on beş dakikası başlıyor."],
    "et-end": [
      "İki takımı ayıran bir şey yok. Maç penaltılara gidiyor!",
      "Uzatmalar da karar vermedi — penaltılar belirleyecek.",
    ],
    attack: [
      "{p} {team} için topla {lane} ilerliyor ama {o} araya giriyor.",
      "{team} {lane} atağı kuruyor ama son pası {o} kesiyor.",
      "{p} boşluk arıyor. {o} oyunu iyi okuyor.",
      "{team}'dan sabırlı bir oyun kurma ama son pas isabetsiz.",
      "{p} ara pası deniyor — {o} araya giriyor.",
    ],
    goal: [
      "GOL! {p} {team} için ağları havalandırıyor!{assist}",
      "GOL! {p} affetmiyor!{assist}",
      "GOL! {p}'den müthiş bir bitiriş!{assist}",
      "GOL! {p} {team} için topu ağlara gönderiyor!{assist}",
      "GOL! {p} tam zamanında yetişip topu ağlara itiyor!{assist}",
    ],
    "own-goal": [
      "KENDİ KALESİNE! {p} topu kendi ağlarına gönderiyor. Onun için tam bir felaket.",
      "KENDİ KALESİNE! {p} topu kendi kalecisinin üstünden aşırmaktan başka bir şey yapamıyor.",
    ],
    "penalty-awarded": [
      "PENALTI! {o}, {p}'yi ceza sahası içinde düşürüyor!",
      "Hakem penaltı noktasını gösteriyor! {p}, {o} tarafından düşürüldü.",
    ],
    "pen-goal": [
      "GOL! {p} penaltıda kaleciyi ters köşeye yatırıyor!",
      "GOL! {p} penaltıyı gole çeviriyor!",
    ],
    "pen-saved": [
      "KURTARDI! {o} köşeyi sezip {p}'nin penaltısını çıkarıyor!",
      "{p}'nin penaltısını {o} kurtarıyor!",
    ],
    "pen-miss": [
      "{p} penaltıyı üstten auta atıyor!",
      "{p} penaltıyı dışarı atıyor! Büyük bir rahatlama.",
    ],
    "shot-saved": [
      "{p} kaleciyi yokluyor — {o} kurtarıyor.",
      "{p}'den güzel şut ama {o} topun üzerine iyi kapanıyor.",
      "{p} kaleyi buluyor. {o}'dan rahat bir kurtarış.",
      "{p}'yi çaresiz bırakan {o}'dan büyük bir kurtarış!",
    ],
    "shot-wide": [
      "{p} uzaktan vuruyor. Top dışarıda.",
      "{p} şutunu çekiyor ama top üstten gidiyor.",
      "{p} vuruş anında yanlış adım atıyor ve fırsat gidiyor.",
      "{p} köşeyi kolluyor ama top direğin dibinden dışarı çıkıyor.",
    ],
    "shot-blocked": [
      "{p} vuruyor — {o} engelliyor!",
      "{p}'nin şutu engelleniyor.",
      "{p}'yi durdurmak için {o}'dan cesur bir blok.",
    ],
    woodwork: [
      "{p} direğe çarpıyor!",
      "Üst direkte! {p} neredeyse golü buluyordu!",
      "{p} direği titretiyor!",
    ],
    "big-chance-missed": [
      "Ne fırsat! {p} gol atmalıydı ama dışarı atıyor!",
      "{p} önde serbest kaldı... ve kaçırıyor! İnanılmaz.",
      "{p}'nin önünde sadece kaleci vardı ve fırsatı tepiyor!",
    ],
    corner: [
      "{team} için korner.",
      "{team} bir korner kazanıyor.",
      "Top değip çıkıyor: {team} için korner.",
    ],
    "free-kick": [
      "{team} için tehlikeli bölgede serbest vuruş.",
      "{p} düşürülüyor. Faul ve kale menzilinde.",
    ],
    foul: [
      "{p}'den {o}'ya faul.",
      "{p}, {o}'ya arkadan giriyor. Faul.",
      "{p}, {o}'ya çarpıyor. Hakem düdüğü çalıyor.",
    ],
    yellow: ["{p} için sarı kart.", "{p} kartını görüyor.", "Hakem {p}'ye sarı kartı gösteriyor."],
    "second-yellow": [
      "{p} için ikinci sarı! Oyundan atılıyor!",
      "{p} ikinci kartını görüyor ve oyundan atılıyor!",
    ],
    red: ["KIRMIZI KART! {p} oyundan atılıyor!", "{p} için direkt kırmızı! {team} on kişi kaldı."],
    offside: [
      "{p} ofsayta yakalanıyor.",
      "Yardımcı hakem {p} için bayrağı kaldırıyor.",
      "{p} erken kalkmış. Ofsayt.",
    ],
    injury: [
      "{p} yerde ve tedavi görmesi gerekiyor.",
      "{team} için endişe: {p} sakatlandı.",
      "{p} bacağını tutarak duruyor.",
    ],
    sub: [
      "{team}'da değişiklik: {o} çıkıyor, yerine {p} giriyor.",
      "{team} bir değişikliğe gidiyor. {o} çıkıyor, {p} giriyor.",
    ],
    tactics: ["{team} oyun anlayışını değiştiriyor.", "{team} yedek kulübesi ayarlamalar yapıyor."],
    "shootout-goal": ["{p} gol atıyor.", "{p} dönüştürüyor.", "{p} — köşeye!"],
    "shootout-miss": ["{p} kaçırıyor!", "{p}'nin atışı kurtarılıyor!", "{p} üstten auta atıyor!"],
    "shootout-end": ["{team} atışları kazanıyor!", "Soğukkanlılığını koruyan {team}!"],
  },
}

export default commentary
