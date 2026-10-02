/** UEFA's real players. Format: ./index.ts. */
import { UEFA_REST } from "./uefa-rest"

export const UEFA: Record<string, string> = {
  ESP: `
    RW,LW L | Lamine | Yamel | 2007-07-13 | 92/96 | Barcelona
    CM,AM R | Pedro | Gonzáles | 2002-11-25 | 91/93 | Barcelona
    DM,CM R | Rodrigo | Hernandes | 1996-06-22 | 89 | Manchester C
    DM,CM R | Martín | Zubimenda | 1999-02-02 | 87 | N. London
    CM L | Fabián | Ruis | 1996-04-03 | 87 | Paris SG
    GK R | David | Raja | 1995-09-15 | 87 | N. London
    LW,RW R | Nico | Wiliams | 2002-07-12 | 86 | A. Bilbao
    AM,LW R | Dani | Olma | 1998-05-07 | 86 | Barcelona
    CB R | Pau | Cubarsá | 2007-01-22 | 86/93 | Barcelona
    LB L | Marc | Cucarella | 1998-07-22 | 85 | Chelsea
    CB R | Dean | Huysen | 2005-04-14 | 85/91 | R. Madrid
    CM,DM L | Mikel | Merina | 1996-06-22 | 85 | N. London
    ST,LW L | Mikel | Oyarzaval | 1997-04-21 | 85 | R. Sociedad
    GK R | Unai | Simán | 1997-06-11 | 85 | A. Bilbao
    GK R | Joan | Garcés | 2001-05-04 | 85 | Barcelona
    RB,RW R | Pedro | Poro | 1999-09-13 | 84 | Tottenham H
    AM,LW L | Álex | Baina | 2001-07-20 | 84 | A. Madrid
    CM,AM R | Fermín | Lopes | 2003-05-11 | 84/88 | Barcelona
    CM R | Pablo | Gavirra | 2004-08-05 | 84/89 | Barcelona
    LB L | Álvaro | Carrera | 2003-03-23 | 84/88 | R. Madrid
    LB,LW L | Álex | Grimalda | 1995-09-20 | 84 | B. Leverkusen
    RB,CM R | Marcos | Llorante | 1995-01-30 | 83 | A. Madrid
    ST,LW R | Ferran | Tores | 2000-02-29 | 83 | Barcelona
    CB L | Aymeric | Laportte | 1994-05-27 | 82 | A. Bilbao
    CB R | Robin | Le Normant | 1996-11-11 | 82 | A. Madrid
    RB R | Dani | Carbajal | 1992-01-11 | 82 | R. Madrid
    CM,DM R | Pablo | Barrio | 2003-06-15 | 82 | A. Madrid
    AM L | Francisco | Alarcos | 1992-04-21 | 82 | B. Sevilla
    RW,LW L | Yeremi | Pino | 2002-10-20 | 82 | C. Palace
    DM,CM R | Aleix | Gracia | 1997-06-28 | 82 | B. Leverkusen
    GK R | Robert | Sanches | 1997-11-18 | 81 | Chelsea
    CB L | Dani | Vivien | 1999-07-05 | 81 | A. Bilbao
    ST,RW L | Ayoze | Peres | 1993-07-29 | 81 | Villarreal
    CB,RB R | Óscar | Minguesa | 1999-05-13 | 81 | C. Vigo
    ST R | Samu | Omorodin | 2004-05-05 | 81/86 | Porto
    CM R | Javi | Guerro | 2003-05-13 | 80/85 | Valencia
    ST R | Gonzalo | Garci | 2004-03-24 | 80/86 | R. Madrid
    ST R | Álvaro | Morato | 1992-10-23 | 79 | Como
  `,
  FRA: `
    ST,LW R | Kylian | Mbapé | 1998-12-20 | 94 | R. Madrid
    RW,ST L | Ousmane | Dembelle | 1997-05-15 | 92 | Paris SG
    RW,AM L | Michael | Olisse | 2001-12-12 | 89 | B. München
    CB R | William | Salliba | 2001-03-24 | 89 | N. London
    RW,LW R | Désiré | Doé | 2005-06-03 | 87/93 | Paris SG
    DM,CB R | Aurélien | Tchouamani | 2000-01-27 | 87 | R. Madrid
    GK R | Mike | Maignon | 1995-07-03 | 87 | AC Milano
    RB,CB R | Jules | Kondé | 1998-11-12 | 87 | Barcelona
    CB R | Dayot | Upamekano | 1998-10-27 | 85 | B. München
    CB R | Ibrahima | Konatá | 1999-05-25 | 85 | L. Pool
    LW R | Bradley | Barkola | 2002-09-02 | 85 | Paris SG
    ST,LW R | Marcus | Thouram | 1997-08-06 | 85 | I. Milano
    AM,RW R | Rayan | Cherky | 2003-08-17 | 85/89 | Manchester C
    ST L | Hugo | Ekitiqué | 2002-06-20 | 85/88 | L. Pool
    LB L | Theo | Hernandes | 1997-10-06 | 84 | H. Riyadh
    CM,DM L | Adrien | Rabiott | 1995-04-03 | 84 | AC Milano
    CM,DM L | Eduardo | Kamavinga | 2002-11-10 | 84 | R. Madrid
    CM R | Khéphren | Thouram | 2001-03-26 | 84 | J. Torino
    CM,DM L | Manu | Konné | 2001-05-17 | 84 | Roma
    GK R | Lucas | Chevallier | 2001-11-06 | 84 | Paris SG
    CM,DM R | Warren | Zaïre-Emeri | 2006-03-08 | 83/90 | Paris SG
    CB,LB L | Lucas | Hernandes | 1996-02-14 | 83 | Paris SG
    CB L | Castello | Loukeba | 2002-12-17 | 83 | R. Leipzig
    DM R | N'Golo | Kanta | 1991-03-29 | 82 | I. Jeddah
    ST R | Jean-Philippe | Mattéta | 1997-06-28 | 82 | C. Palace
    LW,RW R | Kingsley | Komán | 1996-06-13 | 82 | N. Riyadh
    CB R | Maxence | Lacroy | 2000-04-06 | 82 | C. Palace
    RB R | Malo | Gousto | 2003-05-19 | 82 | Chelsea
    CB R | Pierre | Kaloulu | 2000-06-05 | 82 | J. Torino
    AM,RW L | Maghnes | Aklouche | 2002-02-25 | 82 | Monaco
    CM R | Mattéo | Guendousi | 1999-04-14 | 82 | F. Bahçe
    DM,CM R | Youssouf | Fofanna | 1999-01-10 | 82 | AC Milano
    GK R | Brice | Sambá | 1994-04-25 | 81 | S. Rennes
    ST R | Randal | Kolo Muany | 1998-12-05 | 81 | Tottenham H
    AM,ST R | Christopher | Nkounku | 1997-11-14 | 81 | AC Milano
    LB L | Lucas | Dignee | 1993-07-20 | 80 | A. Villa
    LW,ST R | Mathys | Tell | 2005-04-27 | 80/86 | Tottenham H
  `,
  ENG: `
    ST R | Harry | Kaine | 1993-07-28 | 90 | B. München
    AM,CM R | Jude | Bellinghan | 2003-06-29 | 89 | R. Madrid
    RW L | Bukayo | Sakka | 2001-09-05 | 89 | N. London
    CM,DM R | Declan | Rise | 1999-01-14 | 89 | N. London
    AM,RW L | Cole | Palmar | 2002-05-06 | 87 | Chelsea
    AM,LW L | Phil | Fodden | 2000-05-28 | 86 | Manchester C
    RB,CM R | Trent | Alexander-Arnald | 1998-10-07 | 85 | R. Madrid
    GK R | Jordan | Pickfort | 1994-03-07 | 85 | Everton
    CB R | Marc | Guéhy | 2000-07-13 | 85 | Manchester C
    CB,RB R | Ezri | Konza | 1997-10-23 | 85 | A. Villa
    RB,CB R | Reece | Jaimes | 1999-12-08 | 85 | Chelsea
    AM,LW R | Eberechi | Ezeh | 1998-06-29 | 85 | N. London
    LW,RW R | Anthony | Gordan | 2001-02-24 | 85 | Newcastle U
    CM,DM L | Elliot | Andersen | 2002-11-06 | 85/87 | Nottingham F
    AM,LW R | Morgan | Rodgers | 2002-07-26 | 85/88 | A. Villa
    LW,ST R | Marcus | Rashfort | 1997-10-31 | 83 | Barcelona
    ST R | Ollie | Watkens | 1995-12-30 | 83 | A. Villa
    RW,ST L | Jarrod | Bowan | 1996-12-20 | 83 | West Ham U
    GK R | Dean | Hendersen | 1997-03-12 | 83 | C. Palace
    CM,DM R | Kobbie | Mainou | 2005-04-19 | 82/88 | Manchester U
    RW,LW L | Noni | Maduake | 2002-03-10 | 82 | N. London
    CB L | Levi | Colwil | 2003-02-26 | 82 | Chelsea
    RB,LB R | Tino | Livramenta | 2002-11-12 | 82 | Newcastle U
    CM R | Conor | Gallager | 2000-02-06 | 82 | A. Madrid
    DM,CM L | Adam | Whartan | 2004-02-06 | 82/87 | C. Palace
    AM,LW R | Jack | Grealysh | 1995-09-10 | 82 | Everton
    LB,CM L | Myles | Lewis-Skelley | 2006-09-26 | 81/88 | N. London
    CB R | Jarell | Quansa | 2003-01-29 | 81 | B. Leverkusen
    CB L | Jarrad | Branthwait | 2002-06-27 | 81 | Everton
    CB R | Trevoh | Chalobba | 1999-07-05 | 81 | Chelsea
    LB L | Lewis | Hal | 2004-09-08 | 81 | Newcastle U
    ST R | Ivan | Tony | 1996-03-16 | 81 | A. Jeddah
    GK R | James | Traffort | 2002-10-10 | 80 | Manchester C
    ST R | Dominic | Solankee | 1997-09-14 | 80 | Tottenham H
    RB,CM R | Rico | Lewiss | 2004-11-21 | 80 | Manchester C
    CB R | John | Stonnes | 1994-05-28 | 80 | Manchester C
    CB L | Harry | Maguirre | 1993-03-05 | 79 | Manchester U
  `,
  GER: `
    AM,LW R | Jamal | Musialla | 2003-02-26 | 89/92 | B. München
    AM,LW R | Florian | Wirts | 2003-05-03 | 88/92 | L. Pool
    DM,RB R | Joshua | Kimich | 1995-02-08 | 88 | B. München
    CB R | Jonathan | Taah | 1996-02-11 | 86 | B. München
    ST,AM L | Kai | Haverts | 1999-06-11 | 85 | N. London
    DM,CM R | Aleksandar | Pavlovitch | 2004-05-03 | 85/89 | B. München
    CB R | Antonio | Rüdinger | 1993-03-03 | 84 | R. Madrid
    GK R | Marc-André | ter Stegan | 1992-04-30 | 84 | Barcelona
    CB L | Nico | Schlotterbek | 1999-12-01 | 84 | B. Dortmund
    ST R | Nick | Woltemadde | 2002-02-14 | 84/86 | Newcastle U
    LW,RW L | Leroy | Sanne | 1996-01-11 | 84 | G. Saray
    RW,LW R | Serge | Gnabri | 1995-07-14 | 83 | B. München
    DM,CM R | Angelo | Stiler | 2001-04-04 | 83 | Stuttgart
    GK R | Oliver | Baumman | 1990-06-02 | 82 | Hoffenheim
    CM,DM R | Leon | Goretska | 1995-02-06 | 82 | B. München
    LB L | David | Raumm | 1998-04-22 | 82 | R. Leipzig
    CB R | Waldemar | Antón | 1996-07-20 | 82 | B. Dortmund
    ST R | Deniz | Undaf | 1996-07-19 | 82 | Stuttgart
    LW,ST R | Karim | Adeyemy | 2002-01-18 | 82 | B. Dortmund
    ST,RW R | Maximilian | Beyer | 2002-10-17 | 82/85 | B. Dortmund
    CM L | Felix | Nmetcha | 2000-10-10 | 82 | B. Dortmund
    LB,LW L | Nathaniel | Braun | 2003-06-16 | 82/86 | E. Frankfurt
    CB R | Malick | Thiav | 2001-08-08 | 82 | Newcastle U
    ST R | Jonathan | Burkhardt | 2000-07-11 | 82 | E. Frankfurt
    GK R | Alexander | Nubel | 1996-09-30 | 82 | Stuttgart
    CM,AM R | Pascal | Groos | 1991-06-15 | 81 | B. Dortmund
    LB L | Maximilian | Mittelstedt | 1997-03-18 | 81 | Stuttgart
    RB,RW R | Ridle | Bakú | 1998-04-08 | 81 | R. Leipzig
    CB R | Robin | Kock | 1996-07-17 | 81 | E. Frankfurt
    DM R | Robert | Andrick | 1994-09-22 | 81 | B. Leverkusen
    LW,RW R | Jamie | Lewelling | 2001-02-26 | 81 | Stuttgart
    RW,AM L | Lennart | Karll | 2008-02-22 | 80/92 | B. München
    ST R | Tim | Kleindiest | 1995-08-31 | 80 | M'gladbach
    CM,AM R | Tom | Bishoff | 2005-06-28 | 80/87 | B. München
    AM,LW R | Said | El Malla | 2006-10-05 | 79/88 | Köln
    AM L | Paul | Wanerr | 2005-12-23 | 79/86 | P. Eindhoven
    CM R | Assan | Ouédraogó | 2006-05-09 | 79/88 | R. Leipzig
  `,
  POR: `
    CM,DM R | Vítor | Ferreyra | 2000-02-13 | 90 | Paris SG
    LB L | Nuno | Mendez | 2002-06-19 | 89 | Paris SG
    CM,DM R | João | Neve | 2004-09-27 | 88/93 | Paris SG
    AM,CM R | Bruno | Fernandez | 1994-09-08 | 87 | Manchester U
    CB R | Rúben | Diaz | 1997-05-14 | 87 | Manchester C
    AM,RW L | Bernardo | Sylva | 1994-08-10 | 86 | Manchester C
    LW,ST R | Rafael | Leãu | 1999-06-10 | 86 | AC Milano
    GK R | Diogo | Kosta | 1999-09-19 | 86 | Porto
    ST R | Cristiano | Rolando | 1985-02-05 | 84 | N. Riyadh
    RW,LW L | Pedro | Netto | 2000-03-09 | 84 | Chelsea
    CB L | Gonçalo | Inácia | 2001-08-25 | 84 | S. Lisboa
    DM,CM R | João | Palinha | 1995-07-09 | 83 | Tottenham H
    RW,AM L | Francisco | Trincau | 1999-12-29 | 83 | S. Lisboa
    RW L | Francisco | Concepção | 2002-12-14 | 83 | J. Torino
    RB,LB R | João | Cancello | 1994-05-27 | 82 | H. Riyadh
    CB R | António | Silvas | 2003-10-30 | 82 | B. Lisboa
    RB,LB R | Diogo | Dalott | 1999-03-18 | 82 | Manchester U
    CM,DM R | Rúben | Nevez | 1997-03-13 | 82 | H. Riyadh
    CM,AM L | Matheus | Nunez | 1998-08-27 | 82 | Manchester C
    ST R | Gonçalo | Ramus | 2001-06-20 | 81 | Paris SG
    ST,AM R | João | Félis | 1999-11-10 | 81 | N. Riyadh
    CB,LB L | Renato | Veyga | 2003-07-29 | 81 | Villarreal
    GK R | Rui | Silvo | 1994-02-07 | 81 | S. Lisboa
    CB R | Tomás | Arújo | 2002-05-16 | 81 | B. Lisboa
    RB R | Nélson | Semedu | 1993-11-16 | 80 | F. Bahçe
    GK R | José | Sáa | 1993-01-17 | 80 | Wolverhampton W
    AM,RW R | Rodrigo | Morra | 2007-05-05 | 80/91 | Porto
    RW,RB L | Geovany | Quinda | 2007-04-30 | 80/90 | Chelsea
    CM R | Samu | Coster | 2000-11-27 | 80 | R. Mallorca
    LB L | Francisco | Mourra | 2000-08-16 | 80 | Porto
    LW,RW L | Gonçalo | Guedez | 1996-11-29 | 79 | R. Sociedad
    LB L | Nuno | Tavarez | 2000-01-26 | 79 | Lazio
    LW,RW R | Andreas | Schjelderupp | 2004-06-01 | 79 | B. Lisboa
  `,
  NED: `
    CB R | Virgil | van Dyk | 1991-07-08 | 88 | L. Pool
    CM,DM R | Frenkie | de Jongh | 1997-05-12 | 88 | Barcelona
    DM,CM R | Ryan | Gravenberg | 2002-05-16 | 87 | L. Pool
    CM,AM R | Tijjani | Reynders | 1998-07-29 | 86 | Manchester C
    RB,CB R | Jurriën | Tymber | 2001-06-17 | 86 | N. London
    LW,ST R | Cody | Gakpó | 1999-05-07 | 85 | L. Pool
    AM,LW R | Xavi | Simmons | 2003-04-21 | 85/88 | Tottenham H
    RB,RW R | Denzel | Dumfriez | 1996-04-18 | 85 | I. Milano
    CB L | Micky | van der Ven | 2001-04-19 | 85 | Tottenham H
    RB,RW R | Jeremie | Frimpon | 2000-12-10 | 84 | L. Pool
    GK R | Bart | Verbrugen | 2002-08-18 | 83 | Brighton
    AM,LW R | Justin | Kluyvert | 1999-05-05 | 83 | Bournemouth
    CB,LB L | Nathan | Akké | 1995-02-18 | 82 | Manchester C
    ST,RW R | Donyell | Malén | 1999-01-19 | 82 | A. Villa
    CM,AM L | Teun | Koopmeyners | 1998-02-28 | 82 | J. Torino
    CB R | Matthijs | de Licht | 1999-08-12 | 82 | Manchester U
    CB R | Jan Paul | van Heck | 2000-06-08 | 82 | Brighton
    LB,CB L | Jorrel | Hatto | 2006-03-07 | 82/89 | Chelsea
    CM,DM R | Quinten | Tymber | 2001-06-17 | 82 | F. Rotterdam
    ST,LW R | Memphis | Depaij | 1994-02-13 | 81 | C. São Paulo
    LW,RW R | Noa | Lango | 1999-06-17 | 81 | Napoli
    CB R | Stefan | de Vrei | 1992-02-05 | 80 | I. Milano
    ST R | Brian | Brobey | 2002-02-01 | 80 | Sunderland
    LW,RW L | Crysencio | Sommerville | 2001-10-14 | 80 | West Ham U
    LB L | Ian | Maatzen | 2002-03-10 | 80 | A. Villa
    GK R | Mark | Flecken | 1993-06-13 | 80 | B. Leverkusen
    DM,RB R | Mats | Wiefer | 1999-11-16 | 79 | Brighton
    ST L | Joshua | Zirksee | 2001-05-22 | 79 | Manchester U
    AM,CM R | Guus | Till | 1997-12-22 | 79 | P. Eindhoven
    ST R | Wout | Weghorts | 1992-08-07 | 78 | A. Amsterdam
  `,
  ITA: `
    GK R | Gianluigi | Donarumma | 1999-02-25 | 88 | Manchester C
    CM R | Nicolò | Barela | 1997-02-07 | 86 | I. Milano
    CB L | Alessandro | Bastone | 1999-04-13 | 86 | I. Milano
    CM,DM R | Sandro | Tonalli | 2000-05-08 | 85 | Newcastle U
    LB,LW L | Federico | Dimarca | 1997-11-10 | 85 | I. Milano
    CB,LB L | Riccardo | Calafiore | 2002-05-19 | 84 | N. London
    GK R | Guglielmo | Vicarrio | 1996-10-07 | 84 | Tottenham H
    RB R | Giovanni | Di Lorenso | 1993-08-04 | 83 | Napoli
    ST R | Moise | Keen | 2000-02-28 | 83 | Firenze
    ST R | Mateo | Reteghi | 1999-04-20 | 82 | Q. Khobar
    DM,CM R | Manuel | Locatelly | 1998-01-08 | 82 | J. Torino
    RB,LB R | Andrea | Cambiasso | 2000-02-20 | 82 | J. Torino
    CB L | Alessandro | Buongiorna | 1999-06-06 | 82 | Napoli
    CB R | Gianluca | Mancinni | 1996-04-17 | 82 | Roma
    RW L | Riccardo | Orsolino | 1997-01-24 | 82 | Bologna
    GK R | Marco | Carnesechi | 2000-07-01 | 82 | A. Bergamo
    CM R | Davide | Fratesi | 1999-09-22 | 81 | I. Milano
    DM R | Samuele | Ricchi | 2001-08-21 | 81 | AC Milano
    RW L | Matteo | Politanno | 1993-08-03 | 81 | Napoli
    CB R | Federico | Gati | 1998-06-24 | 81 | J. Torino
    LW R | Mattia | Zacagni | 1995-06-16 | 81 | Lazio
    DM,CM R | Nicolò | Rovela | 2001-12-04 | 81 | Lazio
    ST R | Giacomo | Raspadory | 2000-02-18 | 80 | A. Madrid
    ST R | Gianluca | Scamaca | 1999-01-01 | 80 | A. Bergamo
    AM,CM R | Lorenzo | Pelegrini | 1996-06-19 | 80 | Roma
    ST R | Francesco_Pio | Esposita | 2005-06-28 | 80/88 | I. Milano
    LB L | Destiny | Udoghie | 2002-11-28 | 80 | Tottenham H
    CM,DM R | Nicolò | Fagiolo | 2001-02-12 | 80 | Firenze
    CB R | Giorgio | Scalvinni | 2003-12-11 | 80 | A. Bergamo
    RB R | Raoul | Belanova | 2000-05-17 | 80 | A. Bergamo
    RW,LW R | Federico | Chiessa | 1997-10-25 | 79 | L. Pool
    CB R | Pietro | Comuzo | 2005-02-20 | 79/85 | Firenze
    DM,CM L | Bryan | Cristanté | 1995-03-03 | 79 | Roma
  `,
  BEL: `
    GK L | Thibaut | Curtois | 1992-05-11 | 89 | R. Madrid
    AM,CM R | Kevin | De Bruine | 1991-06-28 | 86 | Napoli
    LW,RW R | Jérémy | Dokú | 2002-05-27 | 85 | Manchester C
    AM,ST L | Charles | De Ketelaer | 2001-03-10 | 84 | A. Bergamo
    CM,DM R | Youri | Tielmans | 1997-05-07 | 83 | A. Villa
    DM,CM L | Amadou | Onanna | 2001-08-16 | 82 | A. Villa
    LW,AM R | Leandro | Trosard | 1994-12-04 | 82 | N. London
    RW,LW L | Johan | Bakajoko | 2003-04-20 | 82 | R. Leipzig
    ST R | Romelu | Lukako | 1993-05-13 | 81 | Napoli
    ST R | Loïs | Opendá | 2000-02-16 | 81 | J. Torino
    CB,LB L | Arthur | Theatte | 2000-05-25 | 81 | E. Frankfurt
    RW,RB R | Alexis | Saelemakers | 1999-06-27 | 81 | AC Milano
    RW,LW L | Dodi | Lukebakyo | 1997-09-24 | 81 | B. Lisboa
    GK R | Senne | Lamens | 2002-07-07 | 81 | Manchester U
    LW,RW R | Malick | Fofanah | 2005-03-31 | 81/87 | O. Lyon
    RB R | Timothy | Castagnne | 1995-12-05 | 80 | Fulham
    CB R | Zeno | Debasst | 2003-10-24 | 80 | S. Lisboa
    LB L | Maxim | De Cuiper | 2000-12-22 | 80 | Brighton
    DM,CM R | Orel | Mangalla | 1998-03-18 | 80 | O. Lyon
    AM,CM L | Hans | Vanaaken | 1992-08-24 | 80 | Brugge
    CB R | Brandon | Mechelle | 1993-01-28 | 80 | Brugge
    CB R | Wout | Faas | 1998-04-03 | 79 | Monaco
    LW,RW R | Mika | Gotds | 2005-06-07 | 79/86 | A. Amsterdam
    CB L | Koni | De Wynter | 2002-07-12 | 79 | O. Marseille
    LW R | Diego | Moreyra | 2004-08-06 | 79 | Strasbourg
  `,
  CRO: `
    CB,LB L | Joško | Gvardiel | 2002-01-23 | 87 | Manchester C
    CM,DM R | Mateo | Kovačič | 1994-05-06 | 83 | Manchester C
    CM,AM R | Luka | Modrič | 1985-09-09 | 82 | AC Milano
    GK R | Dominik | Livakovič | 1995-01-09 | 82 | Girona
    RB,CB R | Josip | Stanišič | 2000-04-02 | 82 | B. München
    ST,AM R | Andrej | Kramarič | 1991-06-19 | 81 | Hoffenheim
    CB R | Josip | Šutallo | 2000-02-28 | 81 | A. Amsterdam
    CM,AM R | Luka | Sučič | 2002-09-08 | 81 | R. Sociedad
    AM,CM R | Martin | Baturinna | 2003-02-16 | 81/86 | Como
    AM,CM L | Mario | Pašalič | 1995-02-09 | 81 | A. Bergamo
    DM R | Marcelo | Brozovič | 1992-11-16 | 80 | N. Riyadh
    ST R | Ante | Budimer | 1991-07-22 | 80 | O. Pamplona
    AM,ST L | Lovro | Majerr | 1998-01-17 | 80 | Wolfsburg
    CM R | Petar | Sušić | 2003-10-25 | 80/85 | I. Milano
    LW,LB R | Ivan | Perišič | 1989-02-02 | 79 | P. Eindhoven
    CB R | Marin | Pongračič | 1997-09-11 | 79 | Firenze
    CB L | Martin | Erlič | 1998-01-24 | 79 | Midtjylland
    LB L | Borna | Sossa | 1998-01-21 | 79 | A. Amsterdam
    CB R | Luka | Vuškovič | 2007-02-25 | 79/87 | Hamburg
    CB R | Duje | Ćaleta-Carr | 1996-09-17 | 79 | R. Sociedad
    CM R | Nikola | Morro | 1998-03-12 | 79 | Bologna
    ST R | Igor | Matanovič | 2003-03-31 | 78 | Freiburg
    GK R | Ivor | Pandurič | 2000-10-19 | 77 | H. Split
  `,
  SUI: `
    GK R | Gregor | Kobell | 1997-12-06 | 86 | B. Dortmund
    CB R | Manuel | Akandji | 1995-07-19 | 84 | I. Milano
    CM,DM L | Granit | Xhakka | 1992-09-27 | 83 | Sunderland
    GK R | Yann | Somer | 1988-12-17 | 82 | I. Milano
    RW,LW R | Dan | N'Doye | 2000-10-25 | 82 | Nottingham F
    DM,CM R | Denis | Zakarya | 1996-11-20 | 81 | Monaco
    CM,DM R | Ardon | Jasari | 2002-07-30 | 81/84 | AC Milano
    ST R | Breel | Embollo | 1997-02-14 | 80 | S. Rennes
    CM R | Remo | Froyler | 1992-04-15 | 80 | Bologna
    CB R | Nico | Elvadi | 1996-09-30 | 80 | M'gladbach
    LW,RW L | Ruben | Vargaz | 1998-08-05 | 80 | Sevilla
    RB R | Silvan | Widmerr | 1993-03-05 | 79 | Mainz
    LB L | Ricardo | Rodrigues | 1992-08-25 | 79 | B. Sevilla
    CM,AM R | Johan | Manzambé | 2005-09-14 | 79/87 | Freiburg
    LW,ST R | Noah | Okaffor | 2000-05-24 | 79 | Leeds U
    CM,RB R | Michel | Aebisher | 1997-01-06 | 78 | Pisa
    ST R | Zeki | Amdouny | 2000-12-04 | 78 | Burnley
    AM,CM L | Fabian | Rieter | 2002-02-16 | 78 | Augsburg
    LB L | Miro | Muheym | 1998-03-24 | 78 | Hamburg
    CB L | Aurèle | Amenta | 2003-07-31 | 78/84 | E. Frankfurt
    CB R | Eray | Cömertt | 2000-02-04 | 78 | Valencia
  `,
  NOR: `
    ST L | Erling | Haland | 2000-07-21 | 93 | Manchester C
    AM L | Martin | Ødegård | 1998-12-17 | 87 | N. London
    ST L | Alexander | Sørlot | 1995-12-05 | 82 | A. Madrid
    LW,RW R | Antonio | Nussa | 2005-04-17 | 82/89 | R. Leipzig
    DM,CM R | Sander | Bergé | 1998-02-14 | 81 | Fulham
    RB,LB R | Julian | Ryersen | 1997-11-17 | 80 | B. Dortmund
    RW,AM L | Oscar | Bob | 2003-07-12 | 80/84 | Manchester C
    CM,RB L | Fredrik | Aursness | 1995-12-10 | 80 | B. Lisboa
    CB R | Kristoffer | Ajerr | 1998-04-17 | 79 | Brentford
    CB R | Leo | Østigaard | 1999-11-28 | 79 | Genoa
    CB R | Torbjørn | Heggen | 1999-01-05 | 79 | Bologna
    LW,RW L | Jens_Petter | Hauje | 1999-10-12 | 79 | Bodø
    ST R | Jørgen | Strand Larssen | 2000-02-06 | 79 | C. Palace
    CM,DM R | Patrick | Bergh | 1997-11-24 | 78 | Bodø
    AM,CM R | Kristian | Thorstved | 1999-03-13 | 78 | Sassuolo
    GK R | Ørjan | Nylund | 1990-09-10 | 78 | Sevilla
    LB L | David_Møller | Wolf | 2002-02-23 | 78 | Alkmaar
    RB R | Marcus | Pedersson | 2000-06-08 | 78 | Torino
    CM,AM R | Sverre | Nippan | 2006-12-19 | 77/86 | Manchester C
    AM,CM R | Thelo | Aasgård | 2002-05-02 | 77 | Glasgow R
  `,
  DEN: `
    DM,CM R | Morten | Hjulmann | 1999-06-25 | 84 | S. Lisboa
    ST L | Rasmus | Højlunt | 2003-02-04 | 83/87 | Napoli
    CM,DM R | Pierre-Emile | Højberg | 1995-08-05 | 82 | O. Marseille
    CB R | Andreas | Christenssen | 1996-04-10 | 81 | Barcelona
    CB L | Joachim | Andersson | 1996-05-31 | 81 | Fulham
    LB,LW L | Patrick | Dorgú | 2004-10-26 | 81/86 | Manchester U
    AM,LW R | Mikkel | Damsgård | 2000-07-03 | 81 | Brentford
    CM,DM R | Morten | Frendrupp | 2001-04-07 | 80 | Genoa
    RB R | Alexander | Bahh | 1997-12-09 | 80 | B. Lisboa
    GK R | Mads | Hermanssen | 2000-07-11 | 80 | West Ham U
    ST L | Mika | Bieret | 2003-02-08 | 80/85 | Monaco
    AM,CM R | Christian | Erikssen | 1992-02-14 | 79 | Wolfsburg
    RW,LW L | Gustav | Isaksson | 2001-04-19 | 79 | Lazio
    ST R | Jonas | Windt | 1999-02-07 | 79 | Wolfsburg
    RW,LW L | Anders | Dreier | 1998-05-02 | 79 | San Diego
    DM R | Christian | Nørgård | 1994-03-10 | 79 | N. London
    RB R | Rasmus | Kristenssen | 1997-07-11 | 79 | E. Frankfurt
    CM R | Victor | Froholt | 2006-03-28 | 79/87 | Porto
    ST R | Conrad | Harter | 2005-04-08 | 79/86 | R. Leipzig
    GK R | Kasper | Schmeichl | 1986-11-05 | 78 | Glasgow C
    LB,RB L | Joakim | Mæhlé | 1997-05-20 | 78 | Wolfsburg
  `,
  AUT: `
    CM,RB R | Konrad | Laymer | 1997-05-27 | 84 | B. München
    AM,LW R | Christoph | Baumgarten | 1999-08-01 | 82 | R. Leipzig
    CM,AM R | Marcel | Sabizer | 1994-03-17 | 82 | B. Dortmund
    CB R | Kevin | Dansó | 1998-09-19 | 82 | Tottenham H
    DM,CM R | Xaver | Schlagger | 1997-09-28 | 81 | R. Leipzig
    DM,CM R | Nicolas | Seywald | 2001-05-04 | 81 | R. Leipzig
    CB,LB L | David | Alabá | 1992-06-24 | 80 | R. Madrid
    CM,AM R | Romano | Schmidd | 2000-01-27 | 80 | W. Bremen
    CB R | Philipp | Lienhardt | 1996-07-11 | 79 | Freiburg
    RB R | Stefan | Poch | 1997-05-14 | 79 | Como
    CM,DM R | Florian | Grillich | 1995-08-07 | 79 | S. Braga
    RW,LW R | Patrick | Wimmerr | 1999-05-30 | 79 | Wolfsburg
    LB L | Alexander | Prassl | 2001-05-26 | 79 | Hoffenheim
    CB R | Leopold | Querfelt | 2003-12-20 | 79/83 | U. Berlin
    GK R | Alexander | Schlagger | 1996-02-01 | 79 | R. Salzburg
    ST R | Marko | Arnautovič | 1989-04-19 | 78 | C. Beograd
    ST L | Michael | Gregorich | 1994-04-18 | 78 | Augsburg
    LB,RB R | Phillipp | Mwené | 1994-01-29 | 78 | Mainz
    CB L | Marco | Friedel | 1998-03-16 | 78 | W. Bremen
    GK R | Patrick | Pens | 1997-01-02 | 77 | Brøndby
  `,
  TUR: `
    AM,RW L | Arda | Güller | 2005-02-25 | 86/93 | R. Madrid
    DM,CM R | Hakan | Çalanoğlu | 1994-02-08 | 85 | I. Milano
    LW,ST R | Kenan | Yıldıs | 2005-05-04 | 85/92 | J. Torino
    GK R | Uğurcan | Çakar | 1996-04-05 | 83 | G. Saray
    LW,RW R | Kerem | Aktürkoğlo | 1998-10-21 | 82 | F. Bahçe
    RW,ST R | Barış_Alper | Yılmas | 2000-05-23 | 82 | G. Saray
    CM,AM R | Orkun | Kökcü | 2000-12-29 | 82 | Beşiktaş
    LB,RB R | Ferdi | Kadıoglu | 1999-10-07 | 82 | Brighton
    AM,ST L | Can | Uzan | 2005-11-11 | 82/88 | E. Frankfurt
    CB R | Merih | Demirel | 1998-03-05 | 81 | A. Jeddah
    CB L | Abdülkerim | Bardakçı | 1994-09-07 | 80 | G. Saray
    DM R | İsmail | Yüksel | 1999-01-26 | 80 | F. Bahçe
    CB R | Ozan | Kabaak | 2000-03-25 | 80 | Hoffenheim
    RW,LW L | Yunus | Akgül | 2000-07-07 | 80 | G. Saray
    CB,DM R | Kaan | Ayhun | 1994-11-10 | 79 | G. Saray
    RB R | Zeki | Çelek | 1997-02-17 | 79 | Roma
    RB R | Mert | Mülder | 1999-04-03 | 79 | F. Bahçe
    GK R | Mert | Günök | 1989-03-01 | 79 | F. Bahçe
    RW,AM L | Oğuz | Aydan | 2000-10-27 | 79 | F. Bahçe
    LB L | Eren | Almalı | 2000-07-07 | 79 | G. Saray
    CB R | Çağlar | Söyünçü | 1996-05-23 | 79 | F. Bahçe
    ST R | Deniz | Güll | 2004-07-02 | 78/85 | Porto
    ST R | Semih | Kılıçsöy | 2005-08-15 | 77/85 | Cagliari
    RW,AM L | İrfan_Can | Kahveçi | 1995-07-15 | 78 | F. Bahçe
  `,
  UKR: `
    GK R | Anatoliy | Trubyn | 2001-08-01 | 84 | B. Lisboa
    CB R | Illia | Zabarny | 2002-09-01 | 84 | Paris SG
    AM,CM R | Heorhiy | Sudakoff | 2002-09-01 | 82/85 | B. Lisboa
    ST R | Artem | Dovbik | 1997-06-21 | 81 | Roma
    RW L | Viktor | Tsigankov | 1997-11-15 | 81 | Girona
    GK R | Andriy | Lunyn | 1999-02-11 | 81 | R. Madrid
    LB L | Vitaliy | Mykolenka | 1999-05-29 | 80 | Everton
    LB,CM L | Oleksandr | Zinchenka | 1996-12-15 | 79 | Nottingham F
    AM,CM L | Ruslan | Malinovsky | 1993-05-04 | 79 | Genoa
    ST R | Roman | Yaremchuck | 1995-11-27 | 79 | O. Piraeus
    ST R | Vladyslav | Vanatt | 2002-01-04 | 79 | Girona
    CB L | Mykola | Matvienko | 1996-05-02 | 79 | S. Donetsk
    CM R | Mykola | Shaparenka | 1998-10-04 | 79 | D. Kyiv
    RW,LW R | Oleksandr | Zubkoff | 1996-08-03 | 79 | Trabzon
    LW,RW R | Mykhailo | Mudrik | 2001-01-05 | 78 | Chelsea
    DM,CM R | Volodymyr | Brazhka | 2002-01-23 | 78 | D. Kyiv
    RB R | Yukhym | Konoplia | 1999-08-26 | 78 | S. Donetsk
    CB R | Valeriy | Bondarr | 1999-02-27 | 78 | S. Donetsk
    CB R | Oleksandr | Svatock | 1994-09-27 | 77 | Austin
    RB R | Oleksandr | Tymchick | 1997-01-20 | 77 | D. Kyiv
  `,
  ...UEFA_REST,
}
