import type { CommentaryText } from "@/engine/match/commentary"

/** Live commentary in Indonesian; same placeholders as the English set. */
const commentary: CommentaryText = {
  assist: " Assist dari {a}.",
  forward: "ke depan",
  lane: {
    left: "lewat sisi kiri",
    centre: "lewat tengah",
    right: "lewat sisi kanan",
  },
  shots: {
    long: {
      goal: [
        "GOL! {p} melepaskan tembakan jarak jauh dan bola masuk!{assist}",
        "GOL! Tendangan geledek {p} dari luar kotak penalti!{assist}",
      ],
      "shot-saved": [
        "{p} mencoba dari jauh — {o} menangkapnya dengan aman.",
        "Tembakan jarak jauh {p}, jatuh tepat di pelukan {o}.",
      ],
      "shot-wide": [
        "{p} menembak dari jauh. Melebar.",
        "{p} mencoba dari luar kotak penalti — di atas mistar.",
      ],
      "shot-blocked": ["Tembakan jarak jauh {p} diblok oleh {o}."],
      woodwork: ["{p} menghantam tiang gawang dari jarak jauh!"],
    },
    close: {
      goal: [
        "GOL! {p} tinggal mendorong bola masuk dari jarak dekat!{assist}",
        "GOL! {p} menuntaskan umpan tarik itu!{assist}",
      ],
      "shot-saved": ["{o} berhasil menggagalkan {p} dari jarak sangat dekat!"],
      "big-chance-missed": [
        "{p} menyia-nyiakan peluang emas dari jarak dekat, sulit dipercaya!",
        "Bola matang di kaki {p}... dan ia menendangnya melebar!",
      ],
    },
    header: {
      goal: [
        "GOL! {p} melompat paling tinggi dan menyundul bola masuk!{assist}",
        "GOL! Sundulan yang luar biasa dari {p}!{assist}",
      ],
      "shot-saved": [
        "{p} menyundul, tetapi {o} menepisnya.",
        "Sundulan {p} — langsung ke arah {o}.",
      ],
      "shot-wide": [
        "{p} menyundul di atas mistar.",
        "{p} menyambut umpan silang, tetapi sundulannya melenceng.",
      ],
      woodwork: ["Sundulan {p} menghantam mistar gawang!"],
      "big-chance-missed": ["{p} menyundul tanpa pengawalan dan gagal mengarahkan bola!"],
    },
    "one-on-one": {
      goal: [
        "GOL! {p} mengelabui kiper dan mencetak gol!{assist}",
        "GOL! {p} begitu tenang satu lawan satu dan menyodorkan bola melewati kiper!{assist}",
      ],
      "shot-saved": [
        "{p} lolos satu lawan satu... {o} menutup sudut dan menepisnya!",
        "Penyelamatan hebat dari {o}! Ia bertahan menghadapi {p} dalam duel satu lawan satu.",
      ],
      "big-chance-missed": [
        "{p} berlari bebas di depan gawang... dan menendang melebar! Peluang yang terbuang!",
        "{p} berhadapan langsung dengan kiper dan bola melenceng tipis dari tiang!",
      ],
    },
    "free-kick": {
      goal: [
        "GOL! {p} menempatkan tendangan bebas itu di pojok atas gawang!",
        "GOL! Tendangan bebas yang luar biasa dari {p}!",
      ],
      "shot-saved": [
        "{p} menendang bebas langsung — {o} menepisnya menjadi tendangan sudut!",
        "Tendangan bebas {p} berhasil ditahan oleh {o}.",
      ],
      "shot-wide": [
        "Tendangan bebas {p} melambung di atas mistar.",
        "{p} melengkungkan tendangan bebas, melenceng tipis dari tiang.",
      ],
      "shot-blocked": ["Tendangan bebas {p} menghantam pagar betis."],
      woodwork: ["Tendangan bebas {p} menghantam tiang gawang!"],
    },
    rebound: {
      goal: [
        "GOL! {p} menyambar bola muntah!",
        "GOL! Kiper melepaskan bola dan {p} datang lebih dulu!",
      ],
      "shot-saved": ["{p} menyambar bola muntah, tetapi {o} menepisnya lagi!"],
      "shot-wide": ["{p} terburu-buru menyambar bola muntah dan menendangnya melebar."],
    },
  },
  moves: {
    counter: { before: "Serangan balik! ", after: " Serangan balik yang mematikan." },
    press: {
      before: "Bola direbut di area lawan! ",
      after: " Hukuman karena kehilangan bola.",
    },
  },
  lines: {
    kickoff: [
      "Pertandingan dimulai!",
      "Wasit meniup peluit dan {team:home} melakukan tendangan pertama.",
      "Bola bergulir. Mari kita mulai.",
    ],
    "half-time": [
      "Wasit meniup peluit akhir babak pertama.",
      "Babak pertama berakhir.",
      "Turun minum. Para pemain menuju ruang ganti.",
    ],
    "second-half": ["Babak kedua dimulai.", "Bola bergulir untuk empat puluh lima menit terakhir."],
    "full-time": ["Wasit meniup peluit panjang!", "Selesai!", "Pertandingan usai."],
    "et-start": [
      "Perpanjangan waktu dimulai. Tiga puluh menit lagi untuk menentukan pemenang.",
      "Kita masuk ke perpanjangan waktu.",
    ],
    "et-half-time": ["Jeda perpanjangan waktu. Masih ada lima belas menit tersisa."],
    "et-second-half": ["Lima belas menit terakhir perpanjangan waktu dimulai."],
    "et-end": [
      "Tidak ada yang bisa memisahkan kedua tim. Lanjut ke adu penalti!",
      "Perpanjangan waktu tidak menentukan pemenang — semua akan diputuskan lewat adu penalti.",
    ],
    attack: [
      "{p} membawa bola maju untuk {team} {lane}, tetapi {o} menghadangnya.",
      "{team} membangun serangan {lane}, tetapi umpan akhirnya dipotong oleh {o}.",
      "{p} mencari celah. {o} membaca permainan dengan baik.",
      "Build-up yang sabar dari {team}, tetapi umpan terakhirnya salah sasaran.",
      "{p} mencoba umpan terobosan — dicegat oleh {o}.",
    ],
    goal: [
      "GOL! {p} menjebol gawang untuk {team}!{assist}",
      "GOL! {p} tidak memberi ampun!{assist}",
      "GOL! Penyelesaian akhir yang luar biasa dari {p}!{assist}",
      "GOL! {p} menaruh bola ke gawang untuk {team}!{assist}",
      "GOL! {p} muncul untuk menyundul bola masuk!{assist}",
    ],
    "own-goal": [
      "GOL BUNUH DIRI! {p} memasukkan bola ke gawangnya sendiri. Bencana bagi dirinya.",
      "GOL BUNUH DIRI! {p} hanya bisa membelokkan bola melewati kipernya sendiri.",
    ],
    "penalty-awarded": [
      "PENALTI! {o} menjatuhkan {p} di dalam kotak penalti!",
      "Wasit menunjuk titik putih! {p} dijatuhkan oleh {o}.",
    ],
    "pen-goal": [
      "GOL! {p} mengecoh kiper ke arah yang salah dari titik penalti!",
      "GOL! {p} mengeksekusi penalti dengan sempurna!",
    ],
    "pen-saved": [
      "DITEPIS! {o} menebak arahnya dan menggagalkan penalti {p}!",
      "Penalti {p} berhasil ditepis oleh {o}!",
    ],
    "pen-miss": [
      "{p} menendang penalti di atas mistar!",
      "{p} menendang penalti melebar! Kelegaan yang luar biasa.",
    ],
    "shot-saved": [
      "{p} menguji kiper — {o} menepisnya.",
      "Tembakan bagus dari {p}, tetapi {o} menjatuhkan diri dengan tepat.",
      "{p} menembak ke arah gawang. Penyelamatan mudah dari {o}.",
      "Penyelamatan hebat dari {o} untuk menggagalkan {p}!",
    ],
    "shot-wide": [
      "{p} menembak dari jauh. Melebar.",
      "{p} melepaskan tembakan, tetapi bola melambung di atas mistar.",
      "{p} salah dalam menendang dan peluang pun hilang.",
      "{p} menempatkan bola, tetapi melenceng tipis dari tiang.",
    ],
    "shot-blocked": [
      "{p} menembak — diblok oleh {o}!",
      "Tembakan {p} diblok.",
      "Blok yang berani dari {o} untuk menghentikan {p}.",
    ],
    woodwork: [
      "{p} menghantam tiang gawang!",
      "Mengenai mistar! {p} nyaris mencetak gol!",
      "{p} membuat tiang gawang bergetar!",
    ],
    "big-chance-missed": [
      "Peluang emas! {p} seharusnya mencetak gol, tetapi menendang melebar!",
      "{p} bebas di depan gawang... dan gagal! Sulit dipercaya.",
      "{p} hanya berhadapan dengan kiper dan menyia-nyiakannya!",
    ],
    corner: [
      "Tendangan sudut untuk {team}.",
      "{team} mendapatkan tendangan sudut.",
      "Bola membentur pemain lalu keluar: tendangan sudut untuk {team}.",
    ],
    "free-kick": [
      "Tendangan bebas untuk {team} di posisi berbahaya.",
      "{p} dijatuhkan. Tendangan bebas, dan masih dalam jangkauan gawang.",
    ],
    foul: [
      "Pelanggaran oleh {p} terhadap {o}.",
      "{p} menjegal {o} dari belakang. Pelanggaran.",
      "{p} menghantam {o}. Wasit meniup peluit.",
    ],
    yellow: [
      "Kartu kuning untuk {p}.",
      "{p} masuk buku catatan wasit.",
      "Wasit mengeluarkan kartu kuning untuk {p}.",
    ],
    "second-yellow": [
      "Kartu kuning kedua untuk {p}! Ia diusir keluar lapangan!",
      "{p} menerima kartu kuning kedua dan harus keluar!",
    ],
    red: [
      "KARTU MERAH! {p} diusir keluar lapangan!",
      "Kartu merah langsung untuk {p}! {team} harus bermain dengan sepuluh pemain.",
    ],
    offside: [
      "{p} tertangkap offside.",
      "Hakim garis mengangkat bendera untuk {p}.",
      "{p} berlari terlalu cepat. Offside.",
    ],
    injury: [
      "{p} terkapar dan membutuhkan perawatan.",
      "Kekhawatiran bagi {team}: {p} cedera.",
      "{p} berhenti sambil memegangi kakinya.",
    ],
    sub: [
      "Pergantian pemain di {team}: {p} masuk menggantikan {o}.",
      "{team} melakukan pergantian. {o} keluar, {p} masuk.",
    ],
    tactics: ["{team} mengubah cara bermain.", "Bangku cadangan {team} melakukan penyesuaian."],
    "shootout-goal": ["{p} mencetak gol.", "{p} berhasil.", "{p} — di pojok gawang!"],
    "shootout-miss": ["{p} gagal!", "Tendangan {p} ditepis!", "{p} menendang di atas mistar!"],
    "shootout-end": ["{team} memenangi adu penalti!", "{team} yang mampu menjaga ketenangan!"],
  },
}

export default commentary
