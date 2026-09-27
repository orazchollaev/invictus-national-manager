import type { NamePool } from "./types"

// Space separated; an underscore inside a name stands for a space ("Van_Dijk").
export const EUROPE: Record<string, NamePool> = {
  english: {
    first:
      "Jack Harry Oliver George James Charlie Thomas Jacob Alfie Joshua William Daniel Ethan Samuel Joseph Mason Lewis Ryan Callum Connor Jordan Kieran Declan Marcus Luke Jamie Aaron Ben Adam Nathan Liam Tyler Owen Max Reece Harvey Kyle Dominic Conor Rory Tom Jake Scott Craig Ross Stuart Sean Aidan Cameron Billy Morgan Rhys Gareth",
    last: "Smith Jones Taylor Brown Wilson Evans Walker Wright Robinson Thompson White Hughes Edwards Green Hall Wood Harris Lewis Martin Jackson Clarke Clark Turner Hill Scott Cooper Morris Ward Moore King Watson Baker Harrison Morgan Patel Young Allen Mitchell James Anderson Phillips Lee Bell Parker Davies Bennett Shaw Cook Richardson Kelly Murphy Campbell Stewart MacDonald Reid Fraser Ross Henderson Duffy Gallagher McCarthy Doherty Quinn Byrne Barnes Chambers Fletcher Holmes Lowe Mills Dunn",
  },
  spanish: {
    first:
      "Alejandro Pablo Álvaro Hugo Daniel Adrián David Javier Sergio Mario Diego Carlos Iván Rubén Raúl Jorge Marcos Víctor Iker Unai Aitor Mikel Óscar Gonzalo Íñigo Fernando Pedro Rodrigo Nacho Dani Borja Jesús Miguel Ander Aleix Pau Marc Jordi Gerard Oriol Bruno Nico Lamine Fermín Alberto Andrés Santi",
    last: "García Fernández González Rodríguez López Martínez Sánchez Pérez Gómez Martín Jiménez Ruiz Hernández Díaz Moreno Muñoz Álvarez Romero Alonso Gutiérrez Navarro Torres Domínguez Vázquez Ramos Gil Ramírez Serrano Blanco Molina Morales Suárez Ortega Delgado Castro Ortiz Rubio Marín Sanz Iglesias Nuñez Medina Garrido Cortés Castillo Lozano Guerrero Cano Prieto Méndez Calvo Gallego Vidal León Herrera Márquez Peña Cabrera Flores Campos Vega Fuentes Carrasco Diez Aguirre Etxeberria Olabarria Merino",
  },
  portuguese: {
    first:
      "João Pedro Tiago Diogo Rafael Gonçalo Rúben Bruno Bernardo Nuno Ricardo André Miguel Francisco Tomás Rodrigo Vitinha Hugo Luís Filipe Duarte Afonso Martim Gustavo Henrique Fábio Nélson Renato Daniel Samuel Otávio Paulo Sérgio Jorge Vasco Simão Leonardo",
    last: "Silva Santos Ferreira Pereira Oliveira Costa Rodrigues Martins Jesus Sousa Fernandes Gonçalves Gomes Lopes Marques Alves Almeida Ribeiro Pinto Carvalho Teixeira Moreira Correia Mendes Nunes Soares Vieira Monteiro Cardoso Rocha Neves Coelho Cruz Cunha Pires Ramos Reis Simões Antunes Matos Fonseca Morais Conceição Castro Barbosa Tavares Batista Faria Freitas Azevedo Machado Magalhães Figueiredo Sequeira Rebelo Loureiro Brito Vaz Amaral Esteves",
  },
  french: {
    first:
      "Lucas Hugo Théo Nathan Louis Enzo Mathis Raphaël Tom Gabriel Jules Arthur Maxime Antoine Kylian Paul Adrien Aurélien Benjamin Clément Florian Jordan Kévin Lucas Mattéo Noah Olivier Pierre Quentin Rayan Romain Samuel Thomas Valentin Warren Yann Dayot Jonathan Hugo Bradley Désiré Rémi Loïc Axel Baptiste Corentin Mathys",
    last: "Martin Bernard Dubois Thomas Robert Richard Petit Durand Leroy Moreau Simon Laurent Lefebvre Michel Garcia David Bertrand Roux Vincent Fournier Morel Girard André Lefèvre Mercier Dupont Lambert Bonnet François Martinez Legrand Garnier Faure Rousseau Blanc Guérin Muller Henry Roussel Nicolas Perrin Morin Mathieu Clément Gauthier Dumont Lopez Fontaine Chevalier Robin Masson Sanchez Lemaire Boucher Leclerc Barbier Arnaud Picard Colin Vidal Caron Renard Fabre Brun Gaillard Joly Aubert Marchand Lacroix Rolland",
  },
  italian: {
    first:
      "Lorenzo Alessandro Andrea Matteo Leonardo Francesco Gabriele Riccardo Tommaso Federico Marco Giovanni Luca Davide Nicolò Simone Stefano Giacomo Mattia Filippo Samuele Christian Daniele Emanuele Manuel Gianluigi Alessio Sandro Pietro Giorgio Mario Fabio Antonio Salvatore Raoul Destiny Moise Guglielmo",
    last: "Rossi Russo Ferrari Esposito Bianchi Romano Colombo Ricci Marino Greco Bruno Gallo Conti De_Luca Mancini Costa Giordano Rizzo Lombardi Moretti Barbieri Fontana Santoro Mariani Rinaldi Caruso Ferrara Galli Martini Leone Longo Gentile Martinelli Vitale Lombardo Serra Coppola De_Santis D'Angelo Marchetti Parisi Villa Conte Ferri Fabbri Bellini Cattaneo Sartori Morelli Negri Monti Pellegrino Palumbo Rizzi Testa Grasso Benedetti Carbone Orlando Ferraro Donati Silvestri Guerra",
  },
  german: {
    first:
      "Lukas Leon Luca Finn Jonas Felix Ben Paul Elias Noah Maximilian Julian Niklas Tim Jan Tom Florian Kai Leroy Joshua Serge Thomas Manuel Marc Antonio Robin Nico Jamal Florian David Alexander Christian Matthias Sebastian Stefan Tobias Dominik Kevin Marvin Moritz Timo Lennart Aleksandar Deniz Karim Benjamin Pascal",
    last: "Müller Schmidt Schneider Fischer Weber Meyer Wagner Becker Schulz Hoffmann Koch Bauer Richter Klein Wolf Schröder Neumann Schwarz Zimmermann Braun Krüger Hofmann Hartmann Lange Schmitt Werner Schmitz Krause Meier Lehmann Schmid Schulze Maier Köhler Herrmann König Walter Mayer Huber Kaiser Fuchs Peters Lang Scholz Möller Weiß Jung Hahn Vogel Baumann Brandt Lorenz Böhm Winkler Engel Frank Berger Graf Ziegler Kühn Seidel Pohl Busch Horn Voigt Sauer Arnold",
  },
  dutch: {
    first:
      "Daan Sem Lucas Levi Finn Milan Jesse Luuk Bram Thijs Stijn Ruben Jasper Tim Kevin Frenkie Matthijs Virgil Denzel Cody Memphis Xavi Joey Wout Teun Jurriën Micky Quinten Jeremie Lutsharel Mats Joshua Justin Tijjani Ryan Brian Donny Steven Arne Bart",
    last: "de_Jong Jansen de_Vries van_den_Berg van_Dijk Bakker Janssen Visser Smit Meijer de_Boer Mulder de_Groot Bos Vos Peters Hendriks van_Leeuwen Dekker Brouwer de_Wit Dijkstra Smits de_Graaf van_der_Meer van_der_Linden Kok Jacobs de_Haan Vermeulen van_den_Heuvel van_der_Veen van_den_Broek de_Bruijn de_Bruin van_der_Heijden Schouten van_Beek Willems van_Vliet Kuipers Verhoeven Postma Hoekstra Wouters Boer Kramer Maas van_Dam Koster Prins Blom Huisman van_Wijk Veenstra Hoogland",
  },
  nordic: {
    first:
      "Erling Martin Alexander Sander Kristoffer Mathias Magnus Jonas Oscar William Lucas Emil Viktor Isak Anton Gustav Jesper Rasmus Christian Mikkel Andreas Pierre Joachim Kasper Thomas Simon Jens Frederik Morten Anders Daniel Victor Hugo Filip Joel Ludvig Elias Hampus Dejan Leo Aron Felix",
    last: "Hansen Johansen Olsen Larsen Andersen Pedersen Nilsen Kristiansen Jensen Karlsen Johnsen Pettersen Eriksen Berg Haugen Hagen Johannessen Andreassen Jacobsen Halvorsen Solberg Nielsen Christensen Rasmussen Poulsen Madsen Kristensen Thomsen Andersson Johansson Karlsson Nilsson Eriksson Larsson Olsson Persson Svensson Gustafsson Pettersson Lindqvist Lindberg Forsberg Holm Sjöberg Lund Dahl Moe Strand Bakke Lie Aas Eide Bjørnstad Vestergaard Friis Holst Dahlberg Sundberg Åberg Bergström Lindström Engström Holmberg Axelsson Sandberg Håkansson",
  },
  icelandic: {
    first:
      "Gylfi Aron Jóhann Alfreð Hörður Birkir Rúnar Sverrir Arnór Albert Ísak Hákon Andri Jón Kristian Guðlaugur Mikael Willum Stefán Daníel Hjörtur Orri Logi Valgeir Sævar Kolbeinn",
    last: "Sigurðsson Gunnarsson Guðmundsson Finnbogason Magnússon Bjarnason Jónsson Ingason Traustason Haraldsson Þórðarson Baldursson Eggertsson Guðjohnsen Kristinsson Ellertsson Árnason Stefánsson Óskarsson Helgason Halldórsson Pálsson Einarsson Björnsson Kárason Friðjónsson Ólafsson Hallgrímsson Sveinsson Þorsteinsson Hauksson Ragnarsson Sigurjónsson Birgisson Grétarsson Vilhjálmsson",
  },
  finnish: {
    first:
      "Teemu Lukas Joel Jere Glen Fredrik Robin Robert Juhani Oliver Topi Matti Onni Leo Eetu Aapo Niko Tuomas Jesse Miro Otso Arttu Rasmus Kaan Pyry Juho Ilmari Santeri Veeti",
    last: "Ivanov Jensen Hämäläinen Virtanen Korhonen Mäkinen Nieminen Mäkelä Laine Heikkinen Koskinen Järvinen Lehtonen Lehtinen Saarinen Salminen Heinonen Niemi Heikkilä Kinnunen Salonen Turunen Salo Laitinen Tuominen Rantanen Karjalainen Jokinen Mattila Savolainen Lahtinen Ahonen Ahola Leppänen Hiltunen Mustonen Aaltonen Väisänen Toivonen Kokkonen Rautio Peltonen",
  },
  "slavic-south": {
    first:
      "Luka Ivan Marko Mateo Josip Nikola Stefan Aleksandar Dušan Filip Andrej Petar Milan Lazar Dejan Mario Ante Domagoj Duje Borna Lovro Martin Jan Benjamin Jasmin Edin Ermedin Haris Amar Kenan Stevan Sergej Nemanja Veljko Strahinja Kristijan Milos Darko Bojan Todor Georgi Kiril Dimitar Valentin Ilija Enis Adnan Miralem",
    last: "Lukić Živković Kostić Ilić Stojković Nikolić Petrović Jovanović Popović Marković Đorđević Stanković Radovanović Georgiev Petkov Iliev Dimitrov Todorov Horvat Kovačević Babić Marić Jurić Novak Knežević Vuković Matić Tomić Pavić Božić Blažević Grgić Perić Radić Šimić Lovrić Petković Ivanović Janković Mladenović Savić Stojanović Obradović Ristić Vasić Milošević Begić Hodžić Mehmedović Salihović Omerović Kovač Zupan Potočnik Kranjc Krajnc Hribar Mlinar Stojanovski Petrovski Nikolovski Angelov Stoyanov Hristov Kolev",
  },
  "slavic-east": {
    first:
      "Aleksandr Dmitri Sergei Andrei Alexei Maxim Ivan Artem Nikita Daniil Kirill Mikhail Roman Igor Vladislav Yevgeni Pavel Denis Anton Ilya Oleksandr Mykola Andriy Vitaliy Ruslan Taras Mykhailo Georgiy Heorhiy Volodymyr Bohdan Viktor Anatoliy Yegor Matvei Vadim Stanislav Timofei",
    last: "Ivanov Smirnov Kuznetsov Popov Vasiliev Petrov Sokolov Mikhailov Novikov Fedorov Morozov Volkov Alekseev Lebedev Semenov Egorov Pavlov Kozlov Stepanov Nikolaev Orlov Andreev Makarov Zakharov Zaitsev Solovyov Kovalenko Bondarenko Tkachenko Kravchenko Shevchenko Melnyk Boyko Savchenko Rudenko Moroz Lysenko Kovalev Belov Tarasov Komarov Kiselev Frolov Gusev Titov Kuzmin Ilyin Karpov Nikitin Romanov Vinogradov Belousov Kravets Ponomarenko Marchenko Kuzmenko Oliynyk Pavlenko Polishchuk Honcharenko",
  },
  "slavic-west": {
    first:
      "Jakub Kacper Mateusz Piotr Krzysztof Michał Łukasz Bartosz Tomasz Kamil Paweł Wojciech Sebastian Robert Przemysław Nicola Karol Szymon Dawid Adam Patryk Tomáš Jan Ondřej Adam Lukáš Vladimír Patrik Pavel Matěj Martin David Václav Milan Stanislav Dávid Róbert Juraj Peter Marek Ondrej",
    last: "Nowak Kowalski Wiśniewski Wójcik Kowalczyk Kamiński Lewandowski Zieliński Szymański Woźniak Dąbrowski Kozłowski Jankowski Mazur Kwiatkowski Krawczyk Piotrowski Grabowski Novák Svoboda Novotný Dvořák Černý Procházka Kučera Veselý Horák Němec Wróbel Pawlak Michalski Król Wieczorek Jabłoński Nowicki Majewski Olszewski Stępień Malinowski Jaworski Adamczyk Dudek Nowakowski Pokorný Marek Pospíšil Hájek Jelínek Král Růžička Beneš Fiala Sedláček Doležal Zeman Kolář Navrátil Čermák Horváth Kováč Varga Tóth Nagy Baláž Molnár Szabó Lukáč Oravec",
  },
  baltic: {
    first:
      "Artūras Gvidas Justas Fedor Edgaras Armandas Domantas Paulius Karolis Rokas Vykintas Kristers Roberts Jānis Vladislavs Raivis Dmitrijs Mārcis Eduards Kārlis Rauno Mattias Konstantin Henri Vlasiy Markus Karol Ken Sergei Martin Tanel",
    last: "Kazlauskas Jankauskas Šimkus Tamulevičius Dolžnikovas Sorokins Tamm Kams Soomets Kait Ojamaa Mets Kallaste Puri Petrauskas Stankevičius Vasiliauskas Žukauskas Butkus Paulauskas Urbonas Kavaliauskas Navickas Ramanauskas Bērziņš Kalniņš Ozoliņš Jansons Liepiņš Krūmiņš Balodis Zariņš Pētersons Vītols Kļaviņš Saar Sepp Mägi Kask Kukk Rebane Ilves Pärn Koppel Lepik",
  },
  hungarian: {
    first:
      "Dominik Roland Ádám Attila Péter Bence Dániel Márton Loïc Milos Zsolt Kristóf Barnabás Callum Botond Balázs Gábor Tamás László Norbert Krisztián Levente Zalán András Máté Bálint Gergő Csaba",
    last: "Nagy Varga Lang Kovács Tóth Szabó Horváth Kiss Molnár Németh Farkas Balogh Papp Takács Juhász Lakatos Mészáros Oláh Simon Rácz Fekete Szilágyi Török Fehér Gál Pintér Vörös Szűcs Hajdu Lukács Boros Jakab Sándor Vincze Katona Dudás Bognár Bíró Soós Veres Király",
  },
  romanian: {
    first:
      "Ianis Nicolae Răzvan Denis Florin Radu Andrei Alexandru Marius Valentin Vlad Dennis Darius Ionuț Bogdan Adrian Cristian Mihai Ștefan Octavian Deian Louis Horațiu Alexandru Constantin Vadim Artur Ion Victor",
    last: "Marin Man Popescu Ionescu Popa Radu Dumitru Stan Stoica Gheorghe Matei Ciobanu Moldovan Dobre Tănase Munteanu Constantin Florea Dima Barbu Nistor Florescu Cristea Tudor Mocanu Ene Ungureanu Toma Lazăr Petrescu Sârbu Ardeleanu Voicu Ilie Oprea Enache Vasile Neagu Pop Rusu Lungu Ceban Țurcan",
  },
  greek: {
    first:
      "Giorgos Konstantinos Dimitris Nikos Kostas Christos Vangelis Anastasios Tasos Fotis Petros Manolis Pantelis Giannis Thanasis Lazaros Odysseas Christoforos Sotiris Vasilis Stavros Charalampos Andreas Pieros Grigoris Ioannis Alexandros Minas Kostakis",
    last: "Papadopoulos Papanikolaou Georgiou Nikolaou Ioannou Christodoulou Antoniou Konstantinou Charalambous Kyriakou Demetriou Panayiotou Sotiriou Loizou Karagiannis Vlachos Oikonomou Makris Athanasiou Dimitriou Stavrou Anagnostou Petridis Alexiou Christou Katsaros Lambrou Mitropoulos Nikolaidis Papadakis Theodorou Vasileiou Zervas Kontos Michailidis Spanos Tsakiris Gkotsis Kalogeropoulos Anastasiou Georgiadis Karamanlis",
  },
  albanian: {
    first:
      "Armando Nedim Kristjan Arber Ermir Berat Taulant Jasir Rey Myrto Elseid Ardian Mario Ylber Klaus Amir Edon Florent Vedat Milot Arijanet Leart Fidan Lirim Donat Lumbardh Toni Arlind Qendrim Ermal",
    last: "Hoxha Berisha Krasniqi Shala Gashi Ramadani Bytyqi Hajdari Kastrati Daku Mitaj Leka Dervishi Kola Meta Prifti Shehu Marku Çela Bushati Rama Hasani Ahmeti Morina Kelmendi Rexhepi Zeqiri Sylejmani Selimi Jashari Bytyçi Musliu Osmani Hyseni Halili Mustafa Kurti Demaj Pacolli Dema Veliu Tahiri Hajrizi",
  },
  turkish: {
    first:
      "Arda Kenan Hakan Ferdi Orkun Barış İsmail Kerem Merih Abdülkerim Mert Uğurcan Zeki Samet Salih Kaan İrfan Cenk Yunus Semih Oğuz Burak Emre Ozan Can Berkan Eren Yusuf Doğukan Halil Efe Kerem Bertuğ Enes Onur Umut Emirhan Batuhan Çağlar Altay Kağan Mustafa Mehmet Ahmet",
    last: "Yıldız Yılmaz Çelik Özcan Özdemir Aydın Sara Akman Gül Uzun Kılıç Arslan Şahin Doğan Kara Koç Kurt Öztürk Polat Erdem Aslan Çetin Korkmaz Bulut Keskin Ünal Güneş Taşdemir Yüksek Karaca Yıldırım Aydoğan Öz Tekin Çınar Kaya Acar Özkan Ateş Yavuz Toprak Sarı Aksoy Kocaman Tunç Eren Durmaz Akın Sezer Özer Tuna Coşkun",
  },
  caucasus: {
    first:
      "Khvicha Georges Giorgi Budu Otar Saba Levan Zuriko Guram Luka Anzor Irakli Giorgi Nika Henrikh Varazdat Tigran Artak Eduard Lucas Ugochukwu Grant Hovhannes Kamo Zhirayr Nair Aras Armen Edgar Arman",
    last: "Hovhannisyan Grigoryan Harutyunyan Sargsyan Petrosyan Muradyan Dashyan Beridze Tabatadze Gelashvili Kapanadze Nemsadze Japaridze Kvirikashvili Tsiklauri Shengelia Lomidze Gogoladze Chkheidze Kharaishvili Mamedov Aliyev Huseynov Hasanov Guliyev Ismayilov Mammadli Karapetyan Hakobyan Vardanyan Avetisyan Ghazaryan Martirosyan Minasyan Simonyan Mkrtchyan Galstyan",
  },
  hebrew: {
    first:
      "Eran Manor Dor Oscar Liel Roy Shon Omer Yarden Eli Tai Gabi Yonatan Idan Daniel Mohammad Anan Mahmoud Ofir Stav Ilay Dan Itay Or Ben Nir Tomer Yoav Amir Raz",
    last: "Peretz Cohen Levi Mizrahi Biton Dahan Avraham Friedman Azulay Malka Ohana Katz Shalom Hazan Gabay Levy Elbaz Ben_Haim Rosenberg Shapira Goldberg Weiss Klein Almog Tal Carmi Barak Sasson Ashkenazi Golan Yosef Amar Toledano",
  },
  maltese: {
    first:
      "Jurgen Teddy Matthew Joseph Kurt Enrico Jake Paul Zach Steve Ryan Cain Luke Kemar Adam Karl Nicholas Jean Neil Clayton",
    last: "Borg Camilleri Vella Farrugia Zammit Galea Micallef Grech Attard Spiteri Azzopardi Cassar Pace Mifsud Agius Muscat Caruana Mizzi Bonello Pisani Buhagiar Apap Xuereb Fenech Debono Bugeja Schembri Sultana Gauci Portelli Vassallo Ellul Tabone",
  },
}
