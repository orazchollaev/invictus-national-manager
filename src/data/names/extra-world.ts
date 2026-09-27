import type { NamePool } from "./types"

/** More names per culture outside Europe, merged into the base pools for variety. */
export const EXTRA_WORLD: Record<string, NamePool> = {
  latam: {
    first:
      "Adrián Alejandro Álvaro Ariel Axel Benjamín Bruno Camilo Cristóbal Damián Daniel Dylan Eduardo Elías Emanuel Emmanuel Erik Fabián Fausto Fernando Francisco Gabriel Germán Gerónimo Guillermo Gustavo Héctor Horacio Hugo Ignacio Iván Jair Javier Jonathan Josué Leandro Leonel Lisandro Lucas Lucio Manuel Marcos Mariano Martín Mauricio Máximo Milton Nelson Octavio Omar Orlando Pablo Patricio Ramiro Ricardo Roberto Rubén Salvador Samuel Santino Sergio Tobías Tomás Ulises Walter Wilson Yair Yeison Duván Jhojan Wílmar Déiber Ronaldo",
    last: "Acevedo Aguilar Alvarado Andrade Aranda Ávila Barrera Bustos Calderón Campos Cárdenas Carrasco Castañeda Cepeda Chávez Cifuentes Córdoba Correa Delgado Duarte Escobar Estrada Fernández Figueroa Fonseca Galeano Gallego Gamarra Garay Guerrero Henao Hurtado Ibarra Jaramillo Lagos León Lozano Maldonado Mejía Meléndez Miranda Montoya Mora Moreira Ocampo Olivera Orozco Osorio Pacheco Palma Paredes Pineda Portillo Quintero Ramos Rendón Restrepo Robles Rosales Salcedo Sandoval Sepúlveda Serna Solís Sotelo Tello Toledo Trejo Urrutia Valdez Varela Velázquez Villalobos Zapata Zúñiga Barrios Benavídez Cabral Chamorro Ferrari Lugo Maidana Ortellado Samudio Riveros",
  },
  brazilian: {
    first:
      "Adriano Alan Alex Alexandre Anderson Augusto Bernardo Caio Carlos Cauã Cristian Daniel Davi Diego Dudu Eduardo Elias Enzo Erick Everaldo Fábio Fernando Flávio Francisco Gilberto Heitor Henrique Hugo Iago Ícaro Isaac Jean Jefferson Jhonatan Joaquim Jorge José Juan Juninho Kauã Kleber Lázaro Leandro Leonardo Lorenzo Luan Luciano Marcelo Marcos Mateus Maurício Miguel Nathan Nicolas Otávio Patrick Paulo Pietro Renan Renato Ricardo Robson Rodrigo Rogério Ronaldo Samuel Sandro Thiago Tiago Vagner Victor Wallace Walter Wanderson Yago",
    last: "Aguiar Alencar Amaral Antunes Arruda Assis Azevedo Barros Bastos Borges Braga Brandão Cabral Caldas Camargo Cardoso Carneiro Castro Cerqueira Conceição Couto Cruz Damasceno Duarte Esteves Falcão Fonseca Franco Freire Garcia Gomes Guedes Leal Leite Lemos Macedo Maciel Malta Matos Medeiros Meireles Melo Menezes Miranda Moraes Nogueira Novaes Pacheco Paiva Peixoto Prado Rezende Sales Salgado Seixas Serra Siqueira Soares Tavares Toledo Torres Valadares Vasconcelos Veloso Xavier",
  },
  "caribbean-anglo": {
    first:
      "Alvin Ashley Brandon Carlton Cecil Clive Corey Darnell Dean Delroy Desmond Donovan Earl Elijah Errol Everton Garfield Glenroy Horace Isaiah Jermaine Joel Junior Keston Kevon Kimani Lamar Linton Lloyd Malik Marlon Maurice Nathaniel Neville Orlando Paul Quinton Ricardo Rodney Romario Ryan Sheldon Stephon Trevor Troy Vernon Wayne Winston",
    last: "Allen Anderson Archer Bennett Blake Boyce Bryan Chambers Christian Clarke Dixon Duncan Ellis Findlay Forbes Gayle Gordon Hall Harris Hinds Hunter Jackson Jarrett Kelly Knight Lawrence Lewis Marshall McLean Miller Mills Moore Morris Nelson Osbourne Parris Pearson Phillips Richards Robinson Rose Scott Simpson Spence Taylor Thompson Tucker Walters Watson Whyte Wilson Young",
  },
  "caribbean-franco": {
    first:
      "Alexandre Anderson Bernard Chrisnel Claude David Dieuseul Emmanuel Evens Fabrice Fritz Gary Guerby James Jean-Robert Jeff Jimmy Junior Kervens Lesly Mackenzy Marc Nerlens Pascal Patrick Peterson Reginald Richard Sony Stanley Steve Tony Wesley Yves",
    last: "Alexandre Augustin Bazile Beauvais Bien-Aimé Brutus Célestin Charles Daniel Delva Destin Dorcé Edouard Estimé Exantus François Georges Hyppolite Jacques Jean-Baptiste Laguerre Laurent Lindor Louissaint Michel Moïse Nelson Noël Paul Petit-Frère Philippe Pierre-Louis Rémy Sanon Sylvain Théodore Valcin",
  },
  maghreb: {
    first:
      "Abdelkader Abdelaziz Adel Ahmed Akram Anouar Badr Bilel Chakib Djamel Driss Fayçal Fouad Ghaylen Habib Hakim Hassan Hicham Idriss Imad Iyad Jalal Kamel Khalil Lotfi Mahdi Malik Marouane Mounir Mustapha Nadir Nassim Othmane Rachid Reda Ridha Samir Seifeddine Soufiane Tarik Walid Wassim Yacine Younes Youssouf Zinedine",
    last: "Abdellaoui Aït_Ali Baba Bakkali Belkheir Benamar Benzia Bouhaddouz Boukhari Chafik Chaouchi Daoudi El_Arabi El_Haddadi El_Hilali El_Ouali Ferhat Guenaoui Hadji Hamdi Idrissi Jabrane Lahyani Meftah Mekki Messaoudi Naïli Ouahbi Rahmouni Sabri Saidi Tahiri Yahia Zerrouki Zaïdi",
  },
  "arabic-egypt": {
    first:
      "Abdelrahman Adham Alaa Amir Anwar Assem Atef Bassem Diaa Ehab Emad Essam Fady Hany Hesham Islam Kareem Karim Maher Mahmoud Marwan Mido Moamen Mohab Momen Mostafa Nasser Nour Omar Osama Ramy Reda Saad Salah Seif Shady Taher Walid Yasser Ziad",
    last: "Abdallah Abdelhamid Afify Ahmed Amer Ashraf Aziz Badr Bakr El_Said El_Shahat Eid Fahmy Farag Gamal Ghazi Hanafy Helmy Hosny Kamal Khalil Kotb Maher Mekkawy Metwally Mohsen Moussa Nabil Naguib Omar Ragab Ramadan Refaat Saleh Shaaban Shawky Sobhy Taha Wagdy Yousry Zidan",
  },
  "west-african-franco": {
    first:
      "Abdou Abou Adama Ahmed Alassane Alhassane Amara Arouna Babacar Bakary Birama Boubakar Daouda Demba Djibril Fodé Habib Hamidou Ibrahim Ismaël Issa Kalifa Kassoum Lassana Lamine Mahamadou Makan Malick Mamady Mohamed Moustapha Nfaly Ousseynou Papa Racine Saliou Salif Samba Siaka Sidy Souleymane Tidiane Yacouba Youssouf Zoumana Cheick Fousseni Arouna Kader Mory",
    last: "Badji Bangoura Barry Bathily Cissoko Condé Dabo Dia Diaby Diakhaté Diakité Diaw Diedhiou Dione Djiba Doumbia Fofana Gassama Goudiaby Haïdara Kanouté Keita Konaté Konté Koulibaly Kourouma Maïga Mbaye Ndao Ndour Niasse Samassa Sané Sangaré Sidibé Soumahoro Sylla Tall Thiam Tounkara Wade Yattara Zoungrana Ilboudo Nikiéma Ouédraogo Sanou Tiendrébéogo",
  },
  "west-african-anglo": {
    first:
      "Abdul Abdulrahman Adebola Ahmed Akinwale Alhaji Amadou Babajide Chidozie Chukwuemeka Daniel David Ebuka Emeka Ezekiel Gideon Godwin Ibrahim Ikenna Isaac Jamiu Joshua Kehinde Kolade Lanre Mustapha Nnamdi Obi Olamide Olumide Onyekachi Oscar Paul Peter Richard Rotimi Sadiq Sunday Tochukwu Umar Yakubu Yusuf Kojo Kwesi Kwaku Yaw Nana Ebenezer Felix Kelvin",
    last: "Abubakar Adeyemi Akpan Aliyu Amadi Anichebe Ayodele Bello Chima Dike Ebere Egwu Ekong Emenike Ezeh Ibe Ibrahim Idowu Isah Mohammed Musa Nnadi Nwankwo Nwosu Obasi Ogbu Okafor Okonkwo Okoro Olaniyan Onyekuru Osuji Salisu Sanusi Uche Umeh Yusuf Adjei Agyei Amoah Annan Antwi Asante Bonsu Dankwa Nkansah Obeng Ofori Sarpong Tetteh",
  },
  "central-african": {
    first:
      "Alain Albert Anicet Arnold Bertrand Brice Carlos Clinton Cyrille Dieudonné Eddy Elvis Emery Franck Freddy Gilles Glody Hervé Jacques Jeannot Jonathan Joel Landry Lionel Marcel Martial Michel Mohamed Noah Olivier Pascal Paulin Rolland Serge Stéphane Thierry Ulrich Vianney William Yves",
    last: "Abega Akono Bakary Belinga Bella Biyogo Bokila Bolingi Diangana Djamba Ebosse Eyong Fai Kalala Kanza Kitenge Lusamba Makanga Malonga Mavinga Mbenza Mbia Mokili Mombaerts Moukoko Mputu Ndongo Ngoyi Nkoulou Nsakala Nzola Ondoa Oyongo Siani Wamba Yango Zambo",
  },
  "east-african": {
    first:
      "Abdallah Adam Alex Ali Allan Amani Baraka Benson Bernard Boniface Charles Daniel Denis Derrick Edward Elvis Emmanuel Erasto Fred Geoffrey George Godfrey Hamisi Harrison Isaac Jackson James Jerry Joash Joseph Juma Kelvin Lawrence Maxwell Mohamed Musa Nelson Omar Raymond Richard Rodgers Said Samuel Shaban Stanley Tony Vincent Walter Yusuf Zakaria",
    last: "Achieng Anyang Barasa Chege Kariuki Kibet Kimani Kiprotich Kiptoo Langat Macharia Maina Mugo Muriuki Mutiso Ndirangu Njenga Nyaga Ochieng Odera Oduor Okoth Oluoch Omollo Onyango Otieno Owino Wekesa Wanjala Aziz Bakari Hamisi Kassim Mbwana Mfaume Mrisho Mussa Ngassa Seif Shabani Ssemanda Kagere Kalema Kasirye Lwasa Mayanja Mubiru Mutyaba Nsubuga Okello Opio Wasswa Manzi Mugabo Niyonsaba Uwimana",
  },
  ethiopian: {
    first:
      "Addis Alemayehu Amare Anteneh Asrat Biruk Dawit Elias Ermias Fasil Firaol Gatluak Getachew Haileyesus Kaleab Kebede Lemma Mesfin Mikias Natnael Samuel Solomon Tewodros Yabsira Yohannes Zelalem Eyob Filmon Henok Awet Merhawi Robel Tesfalem",
    last: "Abebe Admasu Asrat Bekele Birhanu Demissie Fikru Gebremedhin Gebru Hailu Kassa Kebede Lemma Mamo Mekuria Mesfin Negash Seyoum Shiferaw Tadesse Tamrat Tefera Tekle Wolde Worku Yirga Zewdie Andemariam Berhane Habtemariam Kahsay Tesfay Weldeslassie",
  },
  somali: {
    first:
      "Abdiaziz Abdifatah Abdikarim Abdinasir Abdiqani Abdullahi Adan Ahmed Ayanle Bashir Daud Farhan Hamza Hussein Ilyas Jamal Khalid Mahamed Mohamud Mukhtar Omar Rashid Said Sharif Suleiman Yasin Zakariye",
    last: "Aden Ahmed Ali Awale Farah Guled Hassan Hirsi Ibrahim Isse Jama Mahamud Mohamud Muse Noor Omar Osman Roble Salah Sheikh Warsame Yusuf",
  },
  "southern-african": {
    first:
      "Aphiwe Ayanda Bandile Bonginkosi Bradley Brandon Cole Dean Elias Gaston Grant Innocent Jabulani Karabo Keegan Lebogang Lehlogonolo Luke Lwazi Mandla Mfundo Mihlali Musa Nkosinathi Onke Pule Rivaldo Sanele Senzo Sifiso Sipho Siyanda Thabang Thabiso Thato Tebogo Thulani Vuyo Xolani Zakhele Bruce Chansa Chisomo Emmanuel Fackson Gift Joseph Kondwani Lameck Obinna Tawanda Tinashe Tafadzwa",
    last: "Baloyi Bhengu Cele Dlamini Gumede Hlatshwayo Khoza Kubheka Lamola Langa Mabunda Madlala Mahlaba Makhubela Malatji Maluleke Manyisa Masango Mashego Mathebula Mazibuko Mbatha Mhlongo Mkhwanazi Modise Mokoena Molefe Mthethwa Nhlapo Ntuli Nxumalo Radebe Sibiya Sithebe Thusi Vilakazi Zungu Bwalya Chanda Chilufya Kabwe Kangwa Lungu Mulenga Mwanza Ngoma Phiri Sakala Zulu Chikwanha Chimombe Dube Gumbo Marufu Moyo Ndlovu Nyathi Sibanda Zhou",
  },
  "lusophone-african": {
    first:
      "Aires Alexandre Ambrósio Anilton Armando Bruno Cláudio Dany Djalma Edson Elvis Fredson Geraldo Hélio Ivan Jacinto Jefferson Joaquim Júlio Lucas Manucho Márcio Nelson Nilson Paulo Ricardo Rolando Rui Sidnei Telmo Valdemar Wilson Yuri Zinho",
    last: "Almeida Alves Andrade Araújo Barbosa Cabral Cardoso Carvalho Costa Cruz Dias Domingos Fernandes Ferreira Gomes Lima Lopes Mendes Monteiro Nascimento Nunes Pereira Pina Ramos Rocha Santos Semedo Silva Soares Sousa Tavares Teixeira Varela Vaz Zacarias Mondlane Muchanga Mussa Sitoe Tembe",
  },
  malagasy: {
    first:
      "Alain Bruno Christian Dimitri Eric Fanomezana Fitahiana Harena Herizo Lanto Mahefa Manoa Nirina Rakoto Rivo Sitraka Tahiry Tojo Tsiory Zo",
    last: "Andriamasinoro Andrianasolo Rabemanantsoa Rafidimanana Rakotomanga Rakotonandrasana Ramaroson Randriambololona Randrianjatovo Ranaivoson Rasamoelina Ratsimandresy Razafindrabe Razanakoto",
  },
  "arabic-gulf": {
    first:
      "Abdulmajeed Abdulkarim Abdulwahab Adel Ammar Anas Ayoub Bandar Eid Fawaz Ghanem Hamza Hussain Ibrahim Jaber Jamal Khaled Mahmoud Majid Meshari Misfer Mohanad Motaz Musab Nayef Obaid Osama Qasim Rakan Riyadh Saad Salman Sami Suhail Tariq Thamer Waleed Yahya Zayed",
    last: "Al_Abed Al_Ahmadi Al_Ali Al_Asmari Al_Baqami Al_Bishi Al_Bulaihi Al_Dawsari Al_Fahad Al_Ghannam Al_Habsi Al_Hajji Al_Harthi Al_Jaber Al_Jasmi Al_Khaldi Al_Khatib Al_Maqbali Al_Muwallad Al_Nakhli Al_Obaidi Al_Owais Al_Qarni Al_Rashid Al_Ruwaili Al_Saeed Al_Shamrani Al_Subaie Al_Tamimi Al_Yami Al_Zaabi Al_Zubaidi",
  },
  "arabic-levant": {
    first:
      "Abdallah Adham Ahmad Ala Amer Anas Ayham Baraa Basil Emad Fadi Ghaith Hadi Haitham Hamzeh Hasan Hazem Imad Jihad Kamal Karam Majd Mazen Moutaz Munther Nabil Obada Qais Rabih Saif Salim Tarek Wael Yahya Yazan Zaid",
    last: "Abbas Abu_Hasan Al_Bashir Al_Dardour Al_Khatib Al_Masri Al_Rawabdeh Al_Shboul Al_Zein Assaf Awad Azar Bakri Daher Fakhoury Farhat Ghannam Haddad Hijazi Issa Jaber Karam Khoury Mansour Matar Nasr Qasem Rahal Saad Sabbagh Shaker Tannous Yassin Zayed",
  },
  persian: {
    first:
      "Abbas Abolfazl Ahmad Akbar Amin Arman Arsalan Babak Bahman Behnam Behrouz Danial Dariush Farhad Farzad Ghasem Hadi Hamed Iman Javad Kamran Kaveh Mahan Mahdi Majid Meysam Mohsen Navid Omid Pouya Reza Saeid Sajjad Sepehr Shahab Siavash Soroush Vahid Yasin Younes",
    last: "Afshar Alizadeh Ansari Asadi Azadi Bahrami Daei Dehghani Esfandiari Farahani Ghafouri Gholami Hosseini Kamali Karimzadeh Khorshidi Mahmoudi Mohammadzadeh Moradpour Nejati Nouri Pakdel Rahmani Rashidi Rezaee Sadeghi Salehi Shahbazi Shams Tavakoli Yazdani Zarei",
  },
  "central-asian": {
    first:
      "Akmal Alisher Anvar Aziz Bakhtiyor Bekzod Dilshod Farrukh Firdavs Ikrom Jasur Khurshid Laziz Mirjalol Nodir Otabek Rustam Sardor Shakhzod Shokhrukh Ulugbek Zafar Aibek Almas Arman Bauyrzhan Dauren Ermek Kanat Maksat Nurlan Serik Talgat Yerlan Zhanibek Aidar Atai Bektur Chyngyz Edil Kairat Tilek Amir Behruz Davron Firuz Parviz Shohrukh Batyr Merdan Serdar",
    last: "Abdurakhmonov Akhmedov Alimov Aminov Bakirov Davletov Ergashev Ibragimov Ismoilov Juraev Kamilov Khakimov Mirzaev Nurmatov Rahmonov Salimov Sharipov Toshmatov Usmonov Yuldashev Zokirov Abenov Akhmetov Baimukhanov Dzhumabekov Kenzhebayev Nurmagambetov Omarov Sagatov Tokhtarov Zhakupov Abdyrakhmanov Asanov Bekov Kadyrov Mamatov Osmonov Sydykov Tashiev Karimov Nazarov Rahimov Saidov Annayev Durdyyev Hojayev Mammedov Orazov Saparov",
  },
  japanese: {
    first:
      "Akito Asahi Atsuki Daiki Daisuke Genki Haruki Hiroshi Hiroya Hotaru Itsuki Jun Kaishu Kakeru Kazuki Keisuke Kenshin Koichi Kosei Kotaro Kyosuke Makoto Masaki Masato Minato Naoya Nobuki Reo Rikuto Ryota Ryusei Seiya Shinji Shion Shunsuke Soma Sosuke Taiga Takuya Tatsuya Tomoya Tsubasa Yamato Yosuke Yuta Yuya",
    last: "Aoyama Arai Chiba Doi Fujimoto Fujiwara Fukushima Furukawa Hara Hirano Honda Horie Ichikawa Iida Imai Iwasaki Kawaguchi Kawano Kikuchi Kitamura Kojima Kubo Kudo Maeda Masuda Matsui Miyamoto Mizuno Mochizuki Morita Murata Nagai Nakajima Nakano Nishida Noguchi Ogawa Onishi Sakai Sano Shibata Sugimoto Sugiyama Taguchi Takada Takagi Takeda Tamura Tsuchiya Ueda Ueno Uchida Yamashita Yamauchi Yano Yokoyama Yoshikawa",
  },
  korean: {
    first:
      "Byung-hoon Chan-woo Chul-min Dae-won Dong-hyun Eun-seok Gun-hee Hae-sung Han-gyeol Hyeon-jun Hyun-soo In-seong Jae-hyun Jae-won Ji-hwan Ji-won Jong-woo Jun-seo Kyu-hyun Min-hyuk Min-jun Min-seok Myung-jae Sang-min Se-hun Seung-min Si-hyun Soo-bin Sung-hoon Tae-yang Won-sang Woo-jin Ye-jun Yeong-jae Yong-rae Yu-min",
    last: "Bang Byun Choo Do Gil Go Gu Gwak Hyun Jang Jeong Jo Jun Kang Kong Ku Lee Maeng Myung Nam Ok Pyo Seok Seol Sim So Uhm Wang Wi Yeo Yoo Yun",
  },
  chinese: {
    first:
      "Anbang Baojun Boyu Chenglong Dawei Dezhi Fangzhou Guangyu Haiyang Hanwen Hongbo Jiacheng Jianguo Jiawei Jinhao Kaiwen Lingfeng Mingyu Qiang Ruiqi Shengli Shuo Tianyu Weihao Wenbo Xiaodong Xinyu Xuanyu Yifan Yuhang Zekai Zhengyang Zhihao Zhuoran Ka_Ho Chun_Hei Wai_Lok Yu_Hin Tsz_Chun",
    last: "Bai Bi Cui Dai Du Fan Fang Gong Gu Hao Hou Jia Jiang Kang Kong Lei Lu Lü Ma Meng Mo Niu Pang Qian Qin Qiu Shi Tan Tao Wan Wei Wen Xia Xiong Yan Yin You Zhai Zou Kwok Leung Ng Tam Yip",
  },
  thai: {
    first:
      "Adisak Anusorn Apichart Arthit Chaiwat Chakrit Chanin Ekkachai Jirawat Kittisak Kraiwit Manop Nattapong Natthawut Nopphon Pakorn Panuwat Pattara Phanuphong Pongsakorn Prasit Rattapong Sarawut Siwakorn Supachai Suriya Teerapat Thanawat Thanakorn Thirawat Wanchalerm Wattana Worachit",
    last: "Boonmee Boonprasert Chaisri Chanthawong Inthasorn Jaidee Kaewdee Kongsri Maneerat Nakprasert Pattanakul Phromsuk Prasertsuk Rattanachai Sangkham Siriwat Sriwong Suksawat Thongsuk Wattanasiri Wongsawat Yodsuk",
  },
  vietnamese: {
    first:
      "An Bảo Công Cường Danh Đạt Đông Đức Duy Giang Hào Hiếu Hoà Huy Hưng Khải Khánh Kiên Lâm Linh Lộc Long Luân Mạnh Minh Nam Nghĩa Ngọc Nhân Phát Phong Phúc Quân Quyết Sơn Tài Thái Thắng Thịnh Thuận Tiến Trí Trọng Tuấn Tùng Văn Việt Vũ",
    last: "Bạch Chu Diệp Đàm Giáp Hứa Khổng Kiều Lạc Lục Mạc Nghiêm Ông Phí Quách Tăng Thái Thân Tống Trương Văn Vương Âu Doãn",
  },
  malay: {
    first:
      "Adam Afiq Aidil Akmal Amir Amirul Arif Asyraf Azri Azwan Danial Faiz Farhan Fauzi Firdaus Hafiz Hakim Hazwan Ikhwan Imran Izzat Kamal Khairul Mazlan Nabil Nazmi Rahmat Razak Ridzuan Rizal Shafiq Syafiq Syazwan Zaquan Zulfahmi Andik Arhan Bagas Dimas Evan Febri Hansamu Ilija Marc Rafli Riko Saddil Shayne Yandi Yanto",
    last: "Abdul_Rahman Ahmad Aziz Bakar Daud Hamzah Harun Hashim Idris Jamil Kamaruddin Mansor Mat_Nor Mohd_Ali Rahim Ramli Salleh Shamsul Talib Yusoff Zakaria Anggara Firmansyah Gunawan Hakim Hermawan Irawan Kusuma Lestaluhu Maulana Nugraha Prakoso Rahmadani Ramadhan Sulistyo Susilo Wibowo",
  },
  filipino: {
    first:
      "Adrian Alvin Ariel Carlo Christopher Daniel Dennis Edward Emmanuel Francis Gerald Jayson Jerome Joshua Kenneth Lawrence Marvin Nathaniel Patrick Paolo Ramon Renato Rodel Ronald Sebastian Vincent",
    last: "Abad Andrada Bernardo Castro Cortez Domingo Enriquez Ferrer Flores Guevara Ignacio Javier Lorenzo Magno Morales Panganiban Rosales Salazar Santiago Tan Uy Velasco Zamora",
  },
  "south-asian": {
    first:
      "Abhishek Aditya Ajay Akash Alok Aman Aniket Ankit Arun Ashish Bikash Deepak Gaurav Harpreet Jaspreet Jeevan Karan Lalengmawia Lalremsanga Manoj Naorem Nikhil Pritam Rahim Rakesh Ritwik Sachin Sandeep Sanjay Shubham Sumit Sunil Suraj Tanvir Vikas Vinit Yash Anisur Fahim Habibur Masuk Rakib Sohel Ali_Raza Bilal Faisal Haris Mohsin Shahzad Usman Zeeshan Anjan Bishal Dinesh Rohit Sujal",
    last: "Bagan Bhattacharya Bhutia Das Deka Dutta Gupta Hmar Jha Joshi Kamath Kharbanda Lalthanzuala Lepcha Mondal Nag Namdev Negi Pandey Patel Ralte Sangma Sarkar Sen Sethi Sinha Thakur Varghese Yadav Akhter Chowdhury Faruk Haque Miah Rana Akram Anwar Javed Latif Riaz Tariq Adhikari Basnet Bhandari Chaudhary Pokharel Thapa_Magar",
  },
  burmese: {
    first:
      "Bo Chit Hla Htoo Kaung Khant Lin Myat Nanda Phone Pyae_Sone Sai Si Thura Wai Yan Zayar Zin_Ko",
    last: "Aung_Kyaw Htwe Khaing Linn Myo_Min Nay_Lin Oo_Naing Phyo_Wai Sithu Thant_Zin Thet_Paing Tun_Lin Win_Htike Zaw_Min",
  },
  "khmer-lao": {
    first:
      "Bora Chanty Chhay Dara Heng Kosal Makara Narong Pheara Rotha Sakda Samnang Seiha Sokha Somchai Sopheak Thavy Vanna Bounmy Khampheng Phonsavanh Somphone Thongphan Viengsay",
    last: "Chea Chhun Hem Kang Keo Kong Leng Mao Nhem Ouk Phan Prak Seng Tep Un Vong Bounmixay Chanthavong Inthavong Keomany Phommachanh Sayavong Sisavath Vongsavanh",
  },
  mongolian: {
    first:
      "Altangerel Batbayar Bayasgalan Chinbat Dashdorj Erdene Ganbaatar Khuslen Munkhjargal Nasanbayar Oyunbold Sukhbat Tamir Tulga Zolboo",
    last: "Amarsaikhan Batsukh Chuluunbaatar Damdin Enkhbold Gantulga Jargal Lkhagva Narantsetseg Ochir Sainbayar Tserendorj",
  },
  pacific: {
    first:
      "Aisake Alapati Filipo Iosefa Kalolo Kiliona Lemeki Manase Maka Mikaele Penitoa Petelo Salesi Sefo Sitani Taniela Tavita Teuila Tomasi Vaea Vaisua Viliame Isireli Jone Josaia Kitione Maika Osea Samisoni Semi Waisale Heimana Manaarii Raiarii Tamatea Teiva",
    last: "Aufai Fifita Folau Hufanga Kata Lolohea Mahe Naufahu Pulu Taione Tapueluelu Tu'ipulotu Vainikolo Leilua Lemalu Pouono Sapolu Tuimavave Vaifale Bola Cavuilati Delai Koroi Naivalu Ravai Tuilevu Vakacegu Voka Haumani Moux Tamarii Teriitau Tuheiava",
  },
  melanesian: {
    first:
      "Alick Benjamin Clifford Daniel Elijah Francis Hensly Jeffery Joel Kelvin Leslie Nelson Owen Patrick Richard Ricky Selwyn Stanley Timothy Wesley",
    last: "Aba Faarodo Gando Houkarawa Kaitu Kakadi Kalontang Kenu Lea Luvu Maemae Nena Olis Rex Siaru Totori Tuiaba Wai Wale Yam",
  },
}
