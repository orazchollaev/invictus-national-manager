import type en from "../en/engine"

const engine: typeof en = {
  obj: {
    qualify: "Lolos ke {comp}",
    unbeaten: "{text} tanpa terkalahkan",
    promotion: "Promosi dari Liga {letter}",
    relegation: "Hindari degradasi dari Liga {letter}",
    win: "Juarai {comp}",
    reach: {
      knockout: "Capai fase gugur {comp}",
      "quarter-finals": "Capai perempat final {comp}",
      "semi-finals": "Capai semifinal {comp}",
      final: "Capai final {comp}",
    },
    debuts: "Berikan debut internasional kepada {count} pemain berusia 21 tahun ke bawah di {year}",
    raiseNote:
      "Hadiah ×{reward}; jika gagal, kepercayaan berkurang {cost}, lalu target awal kembali berlaku",
    lowerNote: "Mengurangi kepercayaan {cost} sekarang; hadiah dipotong setengah",
    lowerNeeds: "Dewan hanya akan mendengar jika kepercayaan {n}% atau lebih",
  },
  news: {
    raise: {
      title: "Anda menaikkan standar",
      body: 'Anda berjanji kepada federasi untuk mencapai lebih: "{text}". Penuhi janji itu, dan mereka tidak akan melupakannya.',
    },
    lower: {
      title: "Ekspektasi diturunkan",
      body: 'Federasi dengan berat hati menyetujui target yang lebih rendah: "{text}".',
    },
    broken: {
      title: "Janji tak terpenuhi",
      body: 'Anda berjanji untuk "{promised}" tetapi gagal. Federasi tetap berharap Anda "{target}".',
    },
    met: {
      title: "Target tercapai",
      body: 'Federasi sangat senang: "{text}" — tuntas. Dukungan tambahan juga akan sampai ke akademi.',
    },
    missed: {
      title: "Target gagal tercapai",
      body: 'Federasi kecewa: kita gagal untuk "{text}".',
    },
    friendly: "laga persahabatan",
    derbyWin: {
      title: "Hari derbi milik {us}",
      body: "Kemenangan {score} atas musuh bebuyutan, {them}, di {comp}. Jalanan dipenuhi perayaan.",
    },
    derbyLoss: {
      title: "Kalah di derbi lawan {them}",
      body: "Kalah {score} dari {them} di {comp}. Para suporter tidak akan cepat melupakan laga ini.",
    },
    derbyDraw: {
      title: "Imbang di derbi",
      body: "{us} dan {them} bermain imbang {score} di {comp}. Tak ada pihak yang berhak membanggakan diri.",
    },
    fans: {
      angry: {
        title: "Para suporter berbalik melawan pelatih",
        body: "Suporter {nation} telah menunjukkan kemarahan mereka dengan jelas. Dewan mendengarkan.",
      },
      adore: {
        title: "Para suporter mendukung Anda",
        body: "Suporter {nation} menyanyikan nama pelatih. Stadion akan bergemuruh.",
      },
    },
    invitational: {
      title: "{host} menggelar {comp}",
      body: "{host} akan menjadi tuan rumah {comp}, diikuti oleh {teams}. Turnamen dimulai pada {date}.",
    },
    invite: {
      title: "Undangan dari {host}",
      body: "{host} mengundang kita ke turnamen {n} tim pada periode yang dimulai {date}. Mereka menunggu jawaban.",
    },
    inviteLapsed: {
      title: "Undangan kedaluwarsa",
      body: "Kita tidak menjawab undangan {host} tepat waktu; turnamen berlangsung tanpa kita.",
    },
    inviteOff: {
      title: "Turnamen dibatalkan",
      body: "Turnamen {host} tidak bisa dilanjutkan: tidak semua tim masih tersedia.",
    },
    riot: {
      title: "{us} menggasak {them}",
      body: "Kemenangan {score} atas {them} di {comp}. Para suporter akan mengingat laga ini.",
    },
    shock: {
      title: "Kemenangan mengejutkan atas {them}",
      body: "Hanya sedikit yang memberi kita peluang, tetapi kita mengalahkan {them} {score} di {comp}.",
    },
    humiliation: {
      title: "Dipermalukan oleh {them}",
      body: "Kekalahan {score} dari {them} di {comp}. Pelatih mulai dipertanyakan.",
    },
    embarrassing: {
      title: "Kekalahan memalukan dari {them}",
      body: "Kita diunggulkan menang, tetapi kalah {score} dari {them} di {comp}.",
    },
    cap: {
      title: "{name} meraih caps ke-{caps}",
      body: "{name} kini telah bermain {caps} kali untuk {nation}.",
    },
    goals: {
      title: "{name} mencapai {goals} gol internasional",
      body: "{name} kini telah mencetak {goals} gol untuk {nation}.",
    },
    debut: {
      title: "Caps pertama untuk {name}",
      body: "Melakoni debut internasional melawan {opp}: {names}.",
    },
    debuts: {
      title: "{n} debut",
    },
    milestone: "Tonggak sejarah tercapai",
    ultimatum: {
      title: "Peringatan terakhir",
      body: "Federasi telah kehilangan kesabaran. Naikkan kepercayaan mereka hingga {lifted}% dalam {matches} laga kompetitif, atau Anda akan digantikan.",
    },
    eases: {
      title: "Tekanan mereda",
      body: "Hasil pertandingan membaik. Federasi telah mencabut peringatan terakhirnya.",
    },
    sacked: {
      title: "Dipecat",
      body: "Federasi {nation} telah memberhentikan Anda dari tugas.",
    },
    resigned: {
      title: "Anda mengundurkan diri",
      body: "Anda telah mundur sebagai pelatih kepala {nation}.",
    },
    notRenewed: {
      title: "Kontrak tidak diperpanjang",
      body: "Federasi {nation} memutuskan untuk tidak memperpanjang kontrak Anda.",
    },
    renewed: {
      title: "Kontrak diperpanjang",
      body: "Federasi {nation} telah memperpanjang kontrak Anda hingga {date}.",
    },
    extended: {
      title: "Satu tahun lagi",
      body: "Federasi {nation} memperpanjang kontrak Anda hanya satu tahun. Mereka ingin melihat kemajuan.",
    },
    coachChange: {
      title: "{nation} berganti pelatih",
      body: "{nation} telah menunjuk {coach} sebagai pelatih kepala baru mereka.",
    },
    coachSacked: {
      title: "{nation} memecat {coach}",
      body: "{nation} telah berpisah dengan pelatih kepala {coach} setelah hasil buruk. Pencarian pengganti telah dimulai.",
    },
    coachRetired: {
      title: "{coach} pensiun",
      body: "{coach} telah mundur sebagai pelatih kepala {nation} dan pensiun dari dunia kepelatihan.",
    },
    offer: {
      title: "Tawaran kerja: {nation}",
      body: "Federasi {nation} menginginkan Anda sebagai pelatih kepala baru mereka. Tawaran berlaku hingga {date}.",
    },
    newJob: {
      title: "Pekerjaan baru: {nation}",
      body: "Anda adalah pelatih kepala baru {nation}.",
    },
    tourney: {
      through: "{comp}: lolos",
      throughTo: "Kita lolos ke {round}.",
      throughBare: "Kita lolos.",
      out: "{comp}: tersingkir",
      groupOut: "Kita menyelesaikan {group} tanpa lolos.",
      knockedOut: "Kita tersingkir di {round}.",
      runnersUp: "{comp}: runner-up",
      lostFinal: "Kita kalah di final.",
    },
    qualified: {
      title: "Lolos ke {finals}",
      body: "Kita telah meraih tempat di {finals}.",
    },
    playoff: {
      title: "Menuju play-off",
      body: "Kita telah mencapai play-off antarkonfederasi untuk {finals}.",
    },
    missedOut: {
      title: "Gagal lolos",
      body: "Kita gagal lolos ke {finals}.",
    },
    finalsGeneric: "putaran final",
    injury: {
      title: "{name} cedera",
      body: "{name} mengalami {injury} di level klub dan akan absen hingga {date}.",
    },
    newClub: "klub baru",
    bigMove: {
      title: "{name} meraih transfer besar",
      body: "{name} bergabung dengan {club} berkat penampilan gemilangnya di tim nasional.",
    },
    move: {
      title: "{name} pindah klub",
      body: "{name} bergabung dengan {club}.",
    },
    prospects: {
      title: "Pemain muda Anda musim ini",
      body: "Perkembangan para pemain muda yang Anda pantau: {list}.",
    },
    season: {
      title: "Musim {from}–{to} dimulai",
      body: "Para pemain telah berkembang selama musim lalu dan bursa transfer musim panas telah ditutup.",
    },
    retired: {
      entry: "{name} ({pos}, {age})",
      entryCaps: "{name} ({pos}, {age}, {caps} caps)",
    },
    retire: {
      title: "{name} mundur dari sepak bola internasional",
      body: "{name} ({age}, {caps} caps) telah mengumumkan pensiun dari sepak bola internasional.",
    },
    wonderkid: {
      title: "Wonderkid muncul: {name}",
      body: "Para pemandu bakat memuji {name}, {pos} berusia {age} tahun di {club}.",
    },
    newgen: {
      entry: "{name} ({pos}, {age}, {club})",
    },
    retiredMany: {
      title: "{n} pemain pensiun",
      body: "Para pemain ini telah menggantung sepatu: {list}.",
    },
    newgens: {
      title: "{n} pemain muda muncul",
      body: "Generasi baru yang memenuhi syarat membela kita: {list}.",
    },
    stadium: {
      build: {
        title: "Pembangunan {stadium} dimulai",
        body: "Federasi membangun stadion berkapasitas {seats} kursi di {city}, dijadwalkan dibuka pada {date}.",
      },
      expand: {
        title: "{stadium} akan diperluas",
        body: "{stadium} di {city} akan menampung {seats} setelah pekerjaan selesai, pada {date}.",
      },
      opened: {
        build: "{nation} membuka {stadium}",
        expand: "{stadium} diperluas",
        body: "{stadium} di {city} kini menampung {seats}{ready}.",
      },
      readyFor: ", siap untuk {comp}",
    },
    champions: {
      title: "{winner} juara {comp}",
      body: "{winner} menjadi juara{beat}.",
      beat: ", mengalahkan {runnerUp} di final",
    },
    draw: {
      title: "{comp}: {stage}",
      group: "Undian telah dilakukan. Kita akan menghadapi {others}.",
      tie: "Kita diundi menghadapi {opp}.",
    },
    and: "{a} dan {b}",
    host: {
      title: "{list} menjadi tuan rumah {comp}",
      one: "{list} akan menjadi tuan rumah {comp}, mulai {date}.",
      many: "{list} akan menjadi tuan rumah bersama {comp}, mulai {date}.",
    },
    placeholder: {
      title: "{team} mengambil tempatnya",
      body: "{team} memenangi {label} dan mengisi tempat itu dalam undian.",
    },
  },
  ms: {
    trophy: "Trofi pertama Anda: {comp}.",
    world: "Juara dunia! {nation} memenangi {comp}.",
    continental: "Juara benua Anda: {comp}.",
    qualification: "Anda telah membawa {nation} ke turnamen besar.",
    worldCup: "Anda telah membawa {nation} ke Piala Dunia.",
    firstWin: "Kemenangan pertama Anda sebagai pelatih kepala tim nasional.",
    matches: "{n} laga sebagai pelatih kepala tim nasional.",
    debuts: "{n} pemain meraih caps pertama mereka di bawah asuhan Anda.",
    youthDebuts: "Lima pemain berusia 21 tahun ke bawah diturunkan di level internasional.",
    unbeaten: "Sepuluh laga kompetitif tanpa terkalahkan.",
    top10: "{nation} masuk sepuluh besar dunia di bawah asuhan Anda.",
    no1: "{nation} adalah tim terbaik di dunia.",
  },
  review: {
    reached: {
      champions: "Juara",
      knockedOut: "Tersingkir",
      qualified: "Lolos",
      notQualified: "Gagal lolos",
      leagueStage: "Fase liga",
      promoted: "Promosi ke Liga {letter}",
      relegated: "Degradasi ke Liga {letter}",
      stayed: "Bertahan di Liga {letter}",
      runnersUp: "Runner-up",
      groups: "Fase grup",
    },
    msg: {
      delightedChampion:
        "Federasi sangat senang. Memenangi {comp} melampaui apa yang berani diharapkan siapa pun, dan reputasi Anda belum pernah setinggi ini.",
      delighted:
        "Federasi sangat senang dengan hasil di {comp}. Anda memberi mereka lebih dari yang diminta.",
      satisfied:
        "Federasi puas dengan hasil di {comp}. Tugas telah diselesaikan; kini mereka berharap Anda membangun dari sana.",
      disappointed:
        "Federasi kecewa dengan hasil di {comp}. Mereka mengharapkan lebih, dan kesabaran mereka tidak tak terbatas.",
      ultimatum:
        "Setelah {comp}, federasi kehabisan kesabaran. Hasil harus segera membaik, atau mereka akan mencari orang yang mampu mewujudkannya.",
      sacked:
        "{comp} adalah batas akhir kesabaran. Federasi memutuskan untuk memberhentikan Anda dari tugas.",
      contractEnd:
        "{comp} menandai berakhirnya kontrak Anda, dan federasi memutuskan untuk tidak memperpanjangnya.",
    },
  },
  fx: {
    friendly: "Laga persahabatan internasional",
    window: "Jendela internasional",
    matchday: "{stage} · Pekan {n}",
    groupMatchday: "{stage} · {group} · Pekan {n}",
    round: "{round}",
    stageRound: "{stage} · {round}",
    roundLeg: "{round} · Leg {leg}",
    stageRoundLeg: "{stage} · {round} · Leg {leg}",
  },
  lineup: {
    nobody: "Tidak ada yang bermain sebagai {pos}",
    notInSquad: "{name} ({pos}) tidak ada dalam skuad",
    injured: "{name} ({pos}) cedera ({label})",
    suspended: "{name} ({pos}) terkena skorsing",
  },
  placeholder: {
    uefa: "Jalur play-off UEFA {path}",
    path: "Jalur play-off {path}",
    tournament: "Turnamen play-off",
    qualifier: "Kualifikasi {n}",
    winner: "Pemenang {base}",
    tournamentWinner: "Pemenang Turnamen play-off {n}",
    shortIc: "IC {n}",
    shortPo: "PO {path}",
  },
  injury: {
    "hamstring-strain": "Cedera otot hamstring",
    "ankle-sprain": "Terkilir pergelangan kaki",
    "calf-strain": "Cedera otot betis",
    "groin-strain": "Cedera otot selangkangan",
    "thigh-strain": "Cedera otot paha",
    "knee-injury": "Cedera lutut",
    "broken-foot": "Patah tulang kaki",
    "cruciate-ligament-rupture": "Robek ligamen krusiatum",
    knock: "Benturan",
  },
  stage: {
    group: "Grup {name}",
    league: "Liga",
    leagueN: "Liga {x}",
    roundOf: "Babak {n} besar",
    "round-of-16": "Babak 16 besar",
    "round-of-32": "Babak 32 besar",
    "quarter-finals": "Perempat final",
    "semi-finals": "Semifinal",
    final: "Final",
    finals: "Putaran final",
    "third-place": "Perebutan tempat ketiga",
    "bronze-final": "Final perunggu",
    "group-stage": "Fase grup",
    "knockout-stage": "Fase gugur",
    "league-phase": "Fase liga",
    qualifying: "Kualifikasi",
    "preliminary-round": "Babak pendahuluan",
    preliminaryN: "Babak pendahuluan {n}",
    prelims: "Pendahuluan",
    "first-round": "Putaran pertama",
    "second-round": "Putaran kedua",
    "third-round": "Putaran ketiga",
    "fourth-round": "Putaran keempat",
    "fifth-round": "Putaran kelima",
    "final-round": "Putaran final",
    "play-offs": "Play-off",
    "play-in": "Play-In",
    "play-off-round": "Putaran play-off",
    "play-off-semi-finals": "Semifinal play-off",
    "play-off-finals": "Final play-off",
    "play-off-final": "Final play-off",
    "play-off-tournament": "Turnamen play-off",
    "promotion-relegation-play-offs": "Play-off promosi/degradasi",
    "league-a-quarter-finals": "Perempat final Liga A",
    "league-a-finals": "Final Liga A",
    "league-b-finals": "Final Liga B",
    "league-c-finals": "Final Liga C",
  },
  comp: {
    wc: {
      name: "Piala Dunia {year}",
      short: "Piala Dunia",
      plain: "Piala Dunia",
    },
    "wcq-uefa": {
      name: "Kualifikasi Piala Dunia {year} · UEFA",
      short: "KPD Eropa",
      plain: "Kualifikasi Piala Dunia · UEFA",
    },
    "wcq-caf": {
      name: "Kualifikasi Piala Dunia {year} · CAF",
      short: "KPD Afrika",
      plain: "Kualifikasi Piala Dunia · CAF",
    },
    "wcq-afc": {
      name: "Kualifikasi Piala Dunia {year} · AFC",
      short: "KPD Asia",
      plain: "Kualifikasi Piala Dunia · AFC",
    },
    "wcq-concacaf": {
      name: "Kualifikasi Piala Dunia {year} · CONCACAF",
      short: "KPD CONCACAF",
      plain: "Kualifikasi Piala Dunia · CONCACAF",
    },
    "wcq-conmebol": {
      name: "Kualifikasi Piala Dunia {year} · CONMEBOL",
      short: "KPD Amerika Selatan",
      plain: "Kualifikasi Piala Dunia · CONMEBOL",
    },
    "wcq-ofc": {
      name: "Kualifikasi Piala Dunia {year} · OFC",
      short: "KPD Oseania",
      plain: "Kualifikasi Piala Dunia · OFC",
    },
    "wcq-ic": {
      name: "Turnamen Play-off Piala Dunia {year}",
      short: "Play-off",
      plain: "Turnamen Play-off Piala Dunia",
    },
    euro: {
      name: "UEFA Euro {year}",
      short: "Euro",
      plain: "UEFA Euro",
    },
    euroq: {
      name: "Kualifikasi UEFA Euro {year}",
      short: "Kualifikasi Euro",
      plain: "Kualifikasi UEFA Euro",
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
      name: "Piala Afrika {year}",
      short: "AFCON",
      plain: "Piala Afrika",
    },
    afconq: {
      name: "Kualifikasi Piala Afrika {year}",
      short: "Kualifikasi AFCON",
      plain: "Kualifikasi Piala Afrika",
    },
    "asian-cup": {
      name: "Piala Asia AFC {year}",
      short: "Piala Asia",
      plain: "Piala Asia AFC",
    },
    "asian-cupq": {
      name: "Kualifikasi Piala Asia AFC {year}",
      short: "Kualifikasi Piala Asia",
      plain: "Kualifikasi Piala Asia AFC",
    },
    copa: {
      name: "Copa América {year}",
      short: "Copa América",
      plain: "Copa América",
    },
    "ofc-cup": {
      name: "Piala Bangsa-Bangsa OFC {year}",
      short: "Piala Bangsa OFC",
      plain: "Piala Bangsa-Bangsa OFC",
    },
    cnl: {
      name: "CONCACAF Nations League {year}–{year2}",
      short: "CONCACAF NL",
      plain: "CONCACAF Nations League",
    },
    gcq: {
      name: "Pendahuluan Piala Emas CONCACAF {year}",
      short: "Pendahuluan Piala Emas",
      plain: "Pendahuluan Piala Emas CONCACAF",
    },
    "gold-cup": {
      name: "Piala Emas CONCACAF {year}",
      short: "Piala Emas",
      plain: "Piala Emas CONCACAF",
    },
    "arab-cup": {
      name: "Piala Arab {year}",
      short: "Piala Arab",
      plain: "Piala Arab",
    },
    "gulf-cup": {
      name: "Piala Teluk Arab {year}",
      short: "Piala Teluk",
      plain: "Piala Teluk Arab",
    },
    aff: {
      name: "Piala AFF {year}",
      short: "Piala AFF",
      plain: "Piala AFF",
    },
    "asean-cup": {
      name: "Piala ASEAN {year}",
      short: "Piala ASEAN",
      plain: "Piala ASEAN",
    },
    "asean-challenge": {
      name: "Piala Tantangan ASEAN {year}",
      short: "Piala Tantangan ASEAN",
      plain: "Piala Tantangan ASEAN",
    },
    "inv-mar": {
      name: "Turnamen Undangan Maret {year}",
      short: "Undangan Maret",
      plain: "Turnamen Undangan Maret",
    },
    "inv-jun": {
      name: "Turnamen Undangan Juni {year}",
      short: "Undangan Juni",
      plain: "Turnamen Undangan Juni",
    },
    "inv-sep": {
      name: "Turnamen Undangan Musim Gugur {year}",
      short: "Undangan Musim Gugur",
      plain: "Turnamen Undangan Musim Gugur",
    },
    "inv-nov": {
      name: "Turnamen Undangan November {year}",
      short: "Undangan November",
      plain: "Turnamen Undangan November",
    },
    e1: {
      name: "Kejuaraan EAFF E-1 {year}",
      short: "E-1",
      plain: "Kejuaraan EAFF E-1",
    },
    cafa: {
      name: "Piala Bangsa-Bangsa CAFA {year}",
      short: "Piala Bangsa CAFA",
      plain: "Piala Bangsa-Bangsa CAFA",
    },
    waff: {
      name: "Kejuaraan WAFF {year}",
      short: "Kejuaraan WAFF",
      plain: "Kejuaraan WAFF",
    },
    saff: {
      name: "Kejuaraan SAFF {year}",
      short: "Kejuaraan SAFF",
      plain: "Kejuaraan SAFF",
    },
    cosafa: {
      name: "Piala COSAFA {year}",
      short: "Piala COSAFA",
      plain: "Piala COSAFA",
    },
    cecafa: {
      name: "Piala Tantangan Senior CECAFA {year}",
      short: "Piala CECAFA",
      plain: "Piala Tantangan Senior CECAFA",
    },
    wafu: {
      name: "Piala Zona WAFU {year}",
      short: "Piala WAFU",
      plain: "Piala Zona WAFU",
    },
    baltic: {
      name: "Piala Baltik {year}",
      short: "Piala Baltik",
      plain: "Piala Baltik",
    },
  },
  role: {
    stopper: {
      label: "Stopper",
      blurb: "Maju merebut bola dan menyapu semua sundulan; kurang membantu saat menguasai bola.",
    },
    "ball-playing": {
      label: "Bek pembangun serangan",
      blurb: "Maju ke lini tengah sambil membawa bola; kurang tajam dalam tekel.",
    },
    cover: {
      label: "Bek penyapu",
      blurb: "Bertahan di belakang dan bermain aman; jarang melanggar, jarang memulai serangan.",
    },
    "defensive-full-back": {
      label: "Bek sayap bertahan",
      blurb: "Menjaga posisinya dan menekel; tidak ikut naik menyerang.",
    },
    "wing-back": {
      label: "Wing-back",
      blurb:
        "Menyisir seluruh sisi lapangan, mengirim umpan silang dan menembak; meninggalkan ruang di belakang.",
    },
    "inverted-full-back": {
      label: "Bek sayap menyempit",
      blurb: "Masuk ke lini tengah untuk membangun serangan; melepas sisi lapangan.",
    },
    anchor: {
      label: "Jangkar",
      blurb: "Berdiri di depan lini belakang; melindunginya dan bermain sederhana.",
    },
    "ball-winner": {
      label: "Perebut bola",
      blurb: "Memburu bola di seluruh lini tengah dan melakukan pelanggaran saat melakukannya.",
    },
    "deep-playmaker": {
      label: "Deep-lying playmaker",
      blurb: "Mengatur permainan dari belakang; kurang melindungi lini pertahanan.",
    },
    "box-to-box": {
      label: "Box-to-box",
      blurb: "Menjelajah seluruh lapangan dan datang terlambat ke kotak penalti.",
    },
    playmaker: {
      label: "Playmaker",
      blurb: "Mengatur tempo dan menemukan umpan mematikan; lebih sedikit bertahan.",
    },
    destroyer: {
      label: "Perusak serangan",
      blurb:
        "Menghancurkan permainan lawan dan sering melanggar; sedikit kontribusi saat menyerang.",
    },
    "advanced-playmaker": {
      label: "Playmaker maju",
      blurb: "Bermain di antara garis dan menciptakan peluang; sendiri kurang mencetak gol.",
    },
    "shadow-striker": {
      label: "Striker bayangan",
      blurb: "Berlari di belakang penyerang utama dan menembak; kurang menciptakan peluang.",
    },
    tracker: {
      label: "Pemburu bola",
      blurb: "Menekan dari depan dan kembali membantu bertahan; kurang berbahaya.",
    },
    winger: {
      label: "Penyerang sayap",
      blurb: "Menempel di garis tepi dan mengirim umpan silang.",
    },
    "inside-forward": {
      label: "Inside forward",
      blurb: "Memotong ke dalam untuk menembak; kurang melebar dan lebih sedikit umpan silang.",
    },
    "tracking-winger": {
      label: "Sayap pekerja keras",
      blurb: "Kembali membantu bek sayap; kurang naik menyerang.",
    },
    "target-man": {
      label: "Target man",
      blurb: "Menang dalam duel udara dan menahan bola; bukan penyelesai yang paling tajam.",
    },
    poacher: {
      label: "Poacher",
      blurb: "Menunggu peluang di kotak penalti; tidak melakukan hal lain.",
    },
    "complete-forward": {
      label: "Penyerang lengkap",
      blurb: "Mencetak gol, terhubung dengan rekan, dan menciptakan peluang.",
    },
    "pressing-forward": {
      label: "Penyerang pressing",
      blurb: "Mengejar para bek dari depan; kurang berbahaya di kotak penalti.",
    },
  },
  arch: {
    "shot-stopper": {
      label: "Penghenti tembakan",
      blurb: "Menguasai garis gawangnya dan menyelamatkan bola-bola yang mustahil.",
    },
    "sweeper-keeper": {
      label: "Kiper penyapu",
      blurb:
        "Menyapu bola di belakang lini pertahanan dan memulai serangan; sedikit kurang yakin di garis gawang.",
    },
    stopper: {
      label: "Stopper",
      blurb:
        "Memenangi duel dan menyapu bola dengan sundulan, tetapi sedikit membantu pembangunan serangan.",
    },
    "ball-playing-defender": {
      label: "Bek pembangun serangan",
      blurb: "Memulai serangan dari belakang; sedikit kurang tajam dalam tekel.",
    },
    "defensive-full-back": {
      label: "Bek sayap bertahan",
      blurb: "Bertahan di belakang, menekel, dan menutup sisi lapangan.",
    },
    "attacking-full-back": {
      label: "Bek sayap menyerang",
      blurb:
        "Overlap, mengirim umpan silang, dan masuk ke kotak penalti; meninggalkan ruang di belakang.",
    },
    "ball-winner": {
      label: "Perebut bola",
      blurb:
        "Menghancurkan permainan di depan lini belakang dan melakukan pelanggaran saat melakukannya.",
    },
    "deep-playmaker": {
      label: "Deep-lying playmaker",
      blurb: "Mengatur permainan dari belakang dengan umpan-umpan panjang.",
    },
    "box-to-box": {
      label: "Box-to-box",
      blurb: "Menjelajah setiap sudut lapangan dan datang terlambat ke kotak penalti.",
    },
    playmaker: {
      label: "Playmaker",
      blurb: "Mengatur tempo dan menemukan umpan mematikan.",
    },
    creator: {
      label: "Kreator",
      blurb: "Bermain di antara garis; lebih banyak assist daripada gol.",
    },
    "shadow-striker": {
      label: "Striker bayangan",
      blurb: "Berlari di belakang penyerang utama dan mencetak gol sendiri.",
    },
    winger: {
      label: "Penyerang sayap",
      blurb: "Menempel di garis tepi dan mengirim umpan silang.",
    },
    "inside-forward": {
      label: "Inside forward",
      blurb: "Memotong ke dalam dari sayap untuk menembak.",
    },
    "target-man": {
      label: "Target man",
      blurb: "Menang dalam duel udara dan menahan bola; bukan penyelesai yang paling tajam.",
    },
    poacher: {
      label: "Poacher",
      blurb: "Hidup di kotak penalti dan menuntaskan bola yang datang; tidak banyak yang lain.",
    },
    "complete-forward": {
      label: "Penyerang lengkap",
      blurb: "Mencetak gol, terhubung dengan rekan, dan menciptakan peluang.",
    },
  },
  rule: {
    "behind-high-line": "Bola di belakang garis pertahanan tinggi",
    "counter-into-deep-block": "Tak ada ruang untuk serangan balik melawan blok rendah",
    "width-into-back-five": "Lebar lapangan sia-sia melawan lima bek",
    "width-into-open-flanks": "Lebar lapangan melawan empat bek sejajar dengan sisi terbuka",
    "patience-into-press": "Build-up sabar melawan pressing tinggi",
    "direct-past-press": "Permainan langsung melewati pressing tinggi",
    "lone-striker-into-back-three": "Satu penyerang melawan tiga bek tengah",
    "two-strikers-into-flat-four": "Dua penyerang melawan empat bek sejajar",
    "midfield-numbers": "Lebih banyak pemain di tengah",
    "midfield-outnumbered": "Kalah jumlah di tengah",
    "press-patient-side": "Pressing tinggi melawan tim yang sabar",
    "narrow-into-wide": "Tim yang bermain sempit memadati tengah melawan tim yang bermain lebar",
  },
  badge: {
    "big-game": {
      label: "Pemain laga besar",
      text: "Bermain di atas levelnya di final dan laga penentu, serta tetap tenang di titik penalti.",
    },
    reliable: {
      label: "Andal",
      text: "Tampil sesuai levelnya hampir di setiap laga.",
    },
    erratic: {
      label: "Tak konsisten",
      text: "Rating pertandingan naik turun; brilian satu hari, buruk di hari berikutnya.",
    },
    "injury-prone": {
      label: "Rawan cedera",
      text: "Lebih mudah mengalami benturan dalam pertandingan.",
    },
    "tires-early": {
      label: "Cepat lelah",
      text: "Kehabisan tenaga lebih cepat daripada pemain yang lebih muda.",
    },
  },
  bond: {
    clubmates: "Rekan seklub",
    friends: "Sahabat",
    feud: "Bermusuhan",
  },
  spirit: {
    tight: "Sangat kompak",
    good: "Baik",
    neutral: "Netral",
    uneasy: "Kurang nyaman",
    divided: "Terpecah",
  },
  scout: {
    trait: {
      attack: "Berorientasi menyerang",
      cautious: "Hati-hati",
      highLine: "Garis tinggi",
      deepLine: "Garis rendah",
      wide: "Bermain lebar",
      narrow: "Bermain sempit",
      counter: "Mengandalkan serangan balik",
      highPress: "Pressing tinggi",
      dropsOff: "Mundur ke belakang",
      direct: "Langsung",
      patient: "Sabar",
      balanced: "Seimbang",
    },
    reason: {
      star: "Pemain terbaik mereka",
      threat: "Ancaman gol utama mereka",
      creator: "Menciptakan sebagian besar peluang mereka",
      weak: "Mata rantai terlemah",
    },
    level: {
      "0": "Rendah",
      "1": "Standar",
      "2": "Tinggi",
    },
    width: {
      "0": "Sempit",
      "1": "Standar",
      "2": "Lebar",
    },
    change: {
      line: "Garis pertahanan: {from} → {to}",
      width: "Lebar: {from} → {to}",
      counter: "Serangan balik: {from} → {to}",
    },
    on: "aktif",
    off: "nonaktif",
  },
}

export default engine
