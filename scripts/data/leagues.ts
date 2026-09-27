/**
 * Club football, abstracted: which nations run leagues at which quality tiers, and
 * the cities their fictional clubs are named after. Tier 1 is an elite club, tier 5
 * a semi-professional one. Counts are clubs per tier.
 *
 * Nations not listed get a small domestic league sized from their strength, with
 * clubs named after the nation itself.
 */
export type ClubFamily =
  | "english"
  | "spanish"
  | "portuguese"
  | "german"
  | "italian"
  | "french"
  | "dutch"
  | "turkish"
  | "slavic"
  | "nordic"
  | "greek"
  | "arabic"
  | "asian"
  | "hungarian"
  | "romanian"

export interface LeagueDef {
  tiers: [number, number, number, number, number]
  family: ClubFamily
  cities: string
}

export const LEAGUES: Record<string, LeagueDef> = {
  ENG: {
    tiers: [6, 8, 10, 12, 8],
    family: "english",
    cities:
      "London Manchester Liverpool Birmingham Leeds Newcastle Sheffield Bristol Nottingham Leicester Southampton Brighton Norwich Derby Sunderland Middlesbrough Portsmouth Coventry Stoke Ipswich Reading Hull Plymouth Blackburn Burnley Preston Wigan Bolton Luton Watford Swindon Oxford Cambridge Exeter Bradford Barnsley Wolverhampton Bournemouth Huddersfield Charlton",
  },
  ESP: {
    tiers: [5, 6, 7, 8, 6],
    family: "spanish",
    cities:
      "Madrid Barcelona Sevilla Valencia Bilbao Málaga Zaragoza Vigo Gijón Oviedo Santander Pamplona Vitoria Granada Cádiz Almería Murcia Córdoba Valladolid Salamanca Alicante Elche Huelva Burgos Girona Tarragona Castellón Albacete Logroño León",
  },
  GER: {
    tiers: [4, 6, 8, 8, 6],
    family: "german",
    cities:
      "Berlin Hamburg München Köln Frankfurt Stuttgart Düsseldorf Dortmund Essen Leipzig Bremen Dresden Hannover Nürnberg Duisburg Bochum Bielefeld Bonn Mannheim Karlsruhe Augsburg Freiburg Kiel Rostock Mainz Kassel Magdeburg Braunschweig",
  },
  ITA: {
    tiers: [4, 6, 8, 8, 6],
    family: "italian",
    cities:
      "Milano Roma Torino Napoli Genova Firenze Bologna Palermo Bari Verona Venezia Catania Parma Cagliari Lecce Bergamo Udine Brescia Pisa Modena Salerno Perugia Ancona Trieste Como Cremona Ferrara Monza",
  },
  FRA: {
    tiers: [2, 6, 8, 8, 6],
    family: "french",
    cities:
      "Paris Marseille Lyon Toulouse Nice Nantes Strasbourg Montpellier Bordeaux Lille Rennes Reims Le_Havre Saint-Étienne Toulon Grenoble Dijon Angers Nîmes Brest Metz Lens Caen Lorient Amiens Tours Auxerre Sochaux",
  },
  POR: {
    tiers: [1, 3, 5, 6, 4],
    family: "portuguese",
    cities:
      "Lisboa Porto Braga Guimarães Coimbra Setúbal Funchal Aveiro Faro Leiria Viseu Barcelos Famalicão Chaves Vizela Estoril Arouca",
  },
  NED: {
    tiers: [1, 3, 5, 6, 4],
    family: "dutch",
    cities:
      "Amsterdam Rotterdam Eindhoven Utrecht Den_Haag Groningen Tilburg Almere Breda Nijmegen Enschede Arnhem Zwolle Heerenveen Alkmaar Sittard Waalwijk Deventer",
  },
  BEL: {
    tiers: [0, 3, 4, 6, 4],
    family: "dutch",
    cities:
      "Brussel Antwerpen Gent Brugge Luik Charleroi Genk Mechelen Leuven Kortrijk Oostende Westerlo Sint-Truiden Eupen Aalst Lommel",
  },
  TUR: {
    tiers: [0, 4, 5, 8, 4],
    family: "turkish",
    cities:
      "İstanbul Ankara İzmir Bursa Antalya Konya Adana Gaziantep Kayseri Trabzon Samsun Eskişehir Sivas Rize Kocaeli Sakarya Malatya Denizli Manisa Hatay Alanya Bodrum",
  },
  SCO: {
    tiers: [0, 1, 3, 5, 4],
    family: "english",
    cities:
      "Glasgow Edinburgh Aberdeen Dundee Kilmarnock Motherwell Perth Inverness Paisley Livingston Hamilton Falkirk Ayr",
  },
  AUT: {
    tiers: [0, 1, 3, 5, 4],
    family: "german",
    cities: "Wien Graz Salzburg Linz Innsbruck Klagenfurt Altach Wolfsberg Hartberg Ried",
  },
  SUI: {
    tiers: [0, 1, 3, 5, 4],
    family: "german",
    cities: "Zürich Basel Bern Genève Lausanne Luzern Lugano St._Gallen Sion Winterthur Thun Aarau",
  },
  GRE: {
    tiers: [0, 1, 3, 5, 4],
    family: "greek",
    cities: "Athína Thessaloníki Piraeus Pátra Iráklio Lárisa Vólos Ioánnina Kalamáta Xánthi",
  },
  RUS: {
    tiers: [0, 2, 4, 6, 4],
    family: "slavic",
    cities:
      "Moskva Sankt-Peterburg Kazan Krasnodar Rostov Samara Sochi Ekaterinburg Nizhny_Novgorod Tula Voronezh Makhachkala Grozny Omsk",
  },
  UKR: {
    tiers: [0, 1, 3, 5, 4],
    family: "slavic",
    cities: "Kyiv Kharkiv Dnipro Lviv Odesa Donetsk Zaporizhzhia Poltava Kryvyi_Rih Oleksandriya",
  },
  CRO: {
    tiers: [0, 1, 2, 4, 4],
    family: "slavic",
    cities: "Zagreb Split Rijeka Osijek Varaždin Pula Zadar Šibenik",
  },
  SRB: {
    tiers: [0, 1, 2, 4, 4],
    family: "slavic",
    cities: "Beograd Novi_Sad Niš Kragujevac Subotica Čačak Novi_Pazar",
  },
  CZE: {
    tiers: [0, 1, 3, 4, 4],
    family: "slavic",
    cities: "Praha Brno Ostrava Plzeň Olomouc Liberec Jablonec Zlín Teplice",
  },
  POL: {
    tiers: [0, 1, 3, 5, 4],
    family: "slavic",
    cities:
      "Warszawa Kraków Łódź Wrocław Poznań Gdańsk Szczecin Katowice Lublin Białystok Chorzów Zabrze",
  },
  DEN: {
    tiers: [0, 1, 3, 4, 4],
    family: "nordic",
    cities: "København Aarhus Odense Aalborg Brøndby Herning Randers Silkeborg Viborg Vejle",
  },
  SWE: {
    tiers: [0, 1, 2, 5, 4],
    family: "nordic",
    cities:
      "Stockholm Göteborg Malmö Uppsala Norrköping Helsingborg Örebro Kalmar Halmstad Värnamo",
  },
  NOR: {
    tiers: [0, 1, 2, 4, 4],
    family: "nordic",
    cities: "Oslo Bergen Trondheim Stavanger Bodø Tromsø Molde Fredrikstad Lillestrøm Sarpsborg",
  },
  HUN: {
    tiers: [0, 0, 2, 4, 4],
    family: "hungarian",
    cities: "Budapest Debrecen Szeged Győr Pécs Kecskemét Zalaegerszeg Paks",
  },
  ROU: {
    tiers: [0, 0, 2, 4, 4],
    family: "romanian",
    cities: "București Cluj Craiova Iași Constanța Timișoara Ploiești Brașov",
  },
  ISR: {
    tiers: [0, 0, 2, 3, 4],
    family: "english",
    cities: "Tel_Aviv Haifa Jerusalem Be'er_Sheva Netanya Ashdod",
  },
  CYP: {
    tiers: [0, 0, 2, 3, 3],
    family: "greek",
    cities: "Lefkosia Limassol Larnaca Paphos Famagusta",
  },
  KSA: {
    tiers: [0, 3, 4, 6, 4],
    family: "arabic",
    cities: "Riyadh Jeddah Dammam Mecca Medina Taif Abha Buraidah Khobar Hofuf Tabuk Najran",
  },
  QAT: {
    tiers: [0, 1, 2, 4, 4],
    family: "arabic",
    cities: "Doha Rayyan Wakrah Khor Umm_Salal Gharafa Lusail Shahaniya",
  },
  UAE: {
    tiers: [0, 1, 2, 4, 4],
    family: "arabic",
    cities: "Dubai Abu_Dhabi Sharjah Ain Ajman Fujairah Ras_Al_Khaimah Khor_Fakkan",
  },
  EGY: {
    tiers: [0, 1, 2, 4, 4],
    family: "arabic",
    cities: "Cairo Alexandria Giza Port_Said Ismailia Suez Mansoura Tanta Aswan",
  },
  MAR: {
    tiers: [0, 1, 2, 4, 4],
    family: "french",
    cities: "Casablanca Rabat Fès Marrakech Tanger Agadir Oujda Berkane Tétouan Safi",
  },
  TUN: {
    tiers: [0, 0, 2, 3, 4],
    family: "french",
    cities: "Tunis Sfax Sousse Bizerte Monastir Gabès",
  },
  ALG: {
    tiers: [0, 0, 2, 3, 4],
    family: "french",
    cities: "Alger Oran Constantine Sétif Annaba Tlemcen",
  },
  RSA: {
    tiers: [0, 0, 2, 4, 4],
    family: "english",
    cities: "Johannesburg Pretoria Durban Cape_Town Soweto Polokwane Bloemfontein Gqeberha",
  },
  USA: {
    tiers: [0, 2, 5, 8, 6],
    family: "english",
    cities:
      "New_York Los_Angeles Chicago Houston Dallas Seattle Atlanta Miami Denver Portland Boston Philadelphia San_Diego Nashville Austin Charlotte Columbus Cincinnati Orlando Kansas_City Salt_Lake Minneapolis St._Louis San_Jose",
  },
  MEX: {
    tiers: [0, 2, 4, 6, 4],
    family: "spanish",
    cities:
      "Ciudad_de_México Guadalajara Monterrey Puebla Toluca León Tijuana Querétaro Torreón Pachuca Mazatlán Aguascalientes Morelia Veracruz",
  },
  BRA: {
    tiers: [0, 3, 5, 8, 6],
    family: "portuguese",
    cities:
      "São_Paulo Rio_de_Janeiro Belo_Horizonte Porto_Alegre Salvador Recife Fortaleza Curitiba Goiânia Belém Manaus Florianópolis Campinas Santos Natal Cuiabá Maceió Juiz_de_Fora Ribeirão_Preto Londrina",
  },
  ARG: {
    tiers: [0, 2, 4, 6, 5],
    family: "spanish",
    cities:
      "Buenos_Aires Rosario Córdoba La_Plata Mendoza Avellaneda Santa_Fe Tucumán Mar_del_Plata Bahía_Blanca Salta Quilmes Lanús Banfield",
  },
  COL: {
    tiers: [0, 0, 2, 4, 4],
    family: "spanish",
    cities: "Bogotá Medellín Cali Barranquilla Bucaramanga Manizales Pereira Pasto",
  },
  CHI: {
    tiers: [0, 0, 2, 4, 4],
    family: "spanish",
    cities: "Santiago Valparaíso Concepción Viña_del_Mar Antofagasta Temuco La_Serena Rancagua",
  },
  URU: {
    tiers: [0, 0, 2, 3, 4],
    family: "spanish",
    cities: "Montevideo Maldonado Paysandú Salto Rivera Colonia",
  },
  ECU: {
    tiers: [0, 0, 1, 3, 4],
    family: "spanish",
    cities: "Quito Guayaquil Cuenca Manta Ambato Loja",
  },
  PAR: {
    tiers: [0, 0, 1, 3, 4],
    family: "spanish",
    cities: "Asunción Luque Encarnación Ciudad_del_Este Villarrica Itauguá",
  },
  PER: {
    tiers: [0, 0, 1, 3, 4],
    family: "spanish",
    cities: "Lima Arequipa Trujillo Cusco Chiclayo Piura",
  },
  JPN: {
    tiers: [0, 1, 3, 6, 4],
    family: "asian",
    cities:
      "Tokyo Yokohama Osaka Nagoya Kobe Kawasaki Saitama Hiroshima Kashima Sapporo Fukuoka Sendai Niigata Shimizu Kyoto Iwata",
  },
  KOR: {
    tiers: [0, 1, 2, 5, 4],
    family: "asian",
    cities: "Seoul Busan Incheon Daegu Daejeon Gwangju Ulsan Suwon Jeonju Pohang Gangneung Jeju",
  },
  CHN: {
    tiers: [0, 1, 2, 5, 4],
    family: "asian",
    cities:
      "Beijing Shanghai Guangzhou Shenzhen Chengdu Wuhan Tianjin Chongqing Jinan Hangzhou Dalian Qingdao Changchun Zhengzhou",
  },
  AUS: {
    tiers: [0, 0, 2, 4, 4],
    family: "english",
    cities:
      "Sydney Melbourne Brisbane Perth Adelaide Newcastle Wellington Gold_Coast Canberra Central_Coast",
  },
}

/** Name patterns per family; `{c}` is the city. */
export const CLUB_PATTERNS: Record<ClubFamily | "generic", string[]> = {
  english: [
    "{c} United",
    "{c} City",
    "{c} Athletic",
    "{c} Rovers",
    "{c} Town",
    "{c} FC",
    "{c} Wanderers",
    "{c} Albion",
  ],
  spanish: [
    "Real {c}",
    "Deportivo {c}",
    "Atlético {c}",
    "CD {c}",
    "{c} CF",
    "Racing {c}",
    "Club {c}",
    "Unión {c}",
    "Sporting {c}",
  ],
  portuguese: [
    "Sporting {c}",
    "{c} FC",
    "Atlético {c}",
    "EC {c}",
    "SC {c}",
    "Clube {c}",
    "União {c}",
  ],
  german: [
    "FC {c}",
    "{c} SV",
    "VfB {c}",
    "SC {c}",
    "1. FC {c}",
    "SpVgg {c}",
    "TSV {c}",
    "Fortuna {c}",
  ],
  italian: ["AC {c}", "{c} Calcio", "US {c}", "FC {c}", "SS {c}", "Virtus {c}"],
  french: ["{c} FC", "Olympique {c}", "Stade {c}", "AS {c}", "RC {c}", "FC {c}", "US {c}"],
  dutch: ["{c} FC", "SC {c}", "FC {c}", "VV {c}", "Sparta {c}", "Go_Ahead {c}"],
  turkish: ["{c}spor", "{c} FK", "{c} Gençlik", "{c} Belediyespor", "{c} İdmanyurdu"],
  slavic: [
    "FK {c}",
    "Dinamo {c}",
    "Lokomotiv {c}",
    "Slavia {c}",
    "{c} FC",
    "Spartak {c}",
    "Rudar {c}",
  ],
  nordic: ["{c} IF", "{c} FK", "{c} BK", "IK {c}", "{c} FC"],
  greek: ["{c} FC", "Asteras {c}", "Ethnikos {c}", "Apollon {c}", "Aris {c}"],
  arabic: ["Al {c}", "{c} Club", "Al-Shabab {c}", "Al-Nasr {c}", "{c} SC", "Al-Wahda {c}"],
  asian: ["{c} FC", "{c} United", "FC {c}", "{c} Reds", "{c} Stars", "{c} Lions"],
  hungarian: ["{c} FC", "{c} SE", "{c} TE", "Vasas {c}"],
  romanian: ["FC {c}", "CS {c}", "Universitatea {c}", "Rapid {c}", "Dinamo {c}"],
  generic: [
    "{c} Police",
    "{c} Army",
    "{c} Stars",
    "{c} United",
    "{c} Rangers",
    "{c} Dynamos",
    "{c} Rovers",
    "Real {c}",
    "{c} City",
    "Sporting {c}",
    "{c} Warriors",
    "{c} Eagles",
  ],
}
