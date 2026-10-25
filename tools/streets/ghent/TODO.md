# Gevels in kleur: ghent

Written by `node tools/todo.mjs ghent`; run it again after each street. Tick a street once its colours
are checked by eye (the contact sheet in tools/cache/looks/, then in the game): ticks are kept.

One street: `node tools/street.mjs ghent "<street>"`, then `node tools/looks.mjs ghent <street-slug>`.

**10292 / 29629 fronts done (35%)**, 379 / 978 streets.


## The wijken on the map

15 of the city's 25 wijken have house fronts on the map (the others lie outside it). Per wijk: how many streets and house fronts, how many of those are done (coloured from photos, or drawn by hand), and what is modelled in it on purpose: 3D landmarks (landmarks.js), squares with their own paving and drawn walls (squares.js), monuments (monuments.js), the sights on the tour (sights.js) and the places named on the big map (famous.js).

| Wijk | Streets | Fronts | Done | Photo | By hand | Landmarks | Squares | Monuments | Sights | Named places |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Brugse Poort - Rooigem | 114 | 4187 | 51% | 2131 | 0 | 0 | 0 | 0 | 0 | 2 |
| Binnenstad | 240 | 3914 | 69% | 2471 | 221 | 13 | 2 | 18 | 14 | 55 |
| Rabot - Blaisantvest | 67 | 2682 | 68% | 1827 | 0 | 1 | 0 | 0 | 0 | 6 |
| Stationsbuurt-Noord | 85 | 2572 | 11% | 251 | 21 | 3 | 0 | 2 | 3 | 13 |
| Bloemekenswijk | 46 | 2413 | 58% | 1400 | 0 | 0 | 0 | 0 | 0 | 1 |
| Sluizeken - Tolhuis - Ham | 78 | 2206 | 4% | 79 | 4 | 0 | 0 | 0 | 0 | 8 |
| Elisabethbegijnhof - Prinsenhof - Papegaai - Sint-Michiels | 69 | 1986 | 6% | 95 | 16 | 0 | 0 | 0 | 0 | 10 |
| Stationsbuurt-Zuid | 60 | 1952 | 24% | 457 | 15 | 0 | 0 | 1 | 0 | 3 |
| Sint-Amandsberg | 40 | 1912 | 2% | 42 | 0 | 0 | 0 | 0 | 0 | 1 |
| Dampoort | 36 | 1851 | 66% | 1227 | 0 | 0 | 0 | 1 | 0 | 3 |
| Watersportbaan - Ekkergem | 53 | 1374 | 1% | 8 | 0 | 0 | 0 | 2 | 3 | 7 |
| Macharius - Heirnis | 28 | 1091 | 2% | 19 | 0 | 0 | 0 | 0 | 0 | 2 |
| Ledeberg | 34 | 932 | 1% | 6 | 0 | 0 | 0 | 0 | 0 | 0 |
| Oud Gentbrugge | 8 | 295 | 0% | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Muide - Meulestede - Afrikalaan | 20 | 262 | 0% | 1 | 0 | 0 | 0 | 3 | 0 | 0 |

## Brugse Poort - Rooigem

114 streets, 4187 house fronts; 2131 done (51%): 2131 coloured from photos, 0 drawn by hand.

- **Houses:** besides the ones drawn by hand, 2966 stand in the brugse-poort quarter, with its own 'worker' fronts, and the rest have Ghent's ordinary fronts, in a colour picked by a hash unless coloured from photos.
- **Named on the big map:** Circuskerk, Volta

- [x] Rooigemlaan · 295 fronts · partial (105 coloured)
- [x] Bevrijdingslaan · 166 fronts · sampled (116 coloured)
- [x] Drongensesteenweg · 154 fronts · partial (65 coloured)
- [x] Kastanjestraat · 135 fronts · sampled (81 coloured)
- [x] Ooievaarstraat · 133 fronts · sampled (92 coloured)
- [x] Nekkersputstraat · 127 fronts · sampled (67 coloured)
- [x] Meibloemstraat · 124 fronts · sampled (84 coloured)
- [x] Geitstraat · 103 fronts · sampled (66 coloured)
- [x] Sparrestraat · 94 fronts · sampled (68 coloured)
- [x] Biezenstuk · 93 fronts · sampled (55 coloured)
- [x] Reinaertstraat · 92 fronts · partial (41 coloured)
- [x] Boerderijstraat · 90 fronts · sampled (76 coloured)
- [ ] Cederstraat · 80 fronts · sampled (56 coloured)
- [x] Phoenixstraat · 80 fronts · sampled (66 coloured)
- [x] Lieremanstraat · 77 fronts · sampled (39 coloured)
- [x] Peerstraat · 74 fronts · sampled (55 coloured)
- [x] Tulpstraat · 74 fronts · sampled (43 coloured)
- [x] Hulstboomstraat · 65 fronts · sampled (51 coloured)
- [x] Druifstraat · 64 fronts · sampled (56 coloured)
- [x] Kaarderijstraat · 62 fronts · partial (24 coloured)
- [x] Pieter Colpaertsteeg · 59 fronts · partial
- [x] Resedastraat · 57 fronts · sampled (43 coloured)
- [x] Slinke Molenstraat · 56 fronts · partial (19 coloured)
- [x] Leiekaai · 55 fronts · partial (11 coloured)
- [x] Aambeeldstraat · 51 fronts · sampled (28 coloured)
- [x] Nieuwewandeling · 51 fronts · partial (5 coloured)
- [x] Nadine Crappéstraat · 50 fronts · partial (1 coloured)
- [x] Zonnebloemstraat · 45 fronts · sampled (30 coloured)
- [x] Fonteineplein · 44 fronts · partial (19 coloured)
- [x] Goudensterstraat · 44 fronts · sampled (29 coloured)
- [x] Madeliefjesstraat · 44 fronts · partial (12 coloured)
- [x] Appelstraat · 42 fronts · sampled (26 coloured)
- [x] Acaciastraat · 41 fronts · sampled (25 coloured)
- [x] Beukelaarstraat · 40 fronts · sampled (20 coloured)
- [ ] Perzikstraat · 40 fronts · todo (1 coloured)
- [x] Heershagestraat · 38 fronts · sampled (21 coloured)
- [x] Klapeksterstraat · 38 fronts · partial (18 coloured)
- [ ] Schaverdijnstraat · 37 fronts · sampled (31 coloured)
- [x] Haspelstraat · 35 fronts · sampled (18 coloured)
- [x] Blazoenstraat · 34 fronts · sampled (20 coloured)
- [x] Herderstraat · 34 fronts · sampled (17 coloured)
- [x] Kokerstraat · 34 fronts · partial (3 coloured)
- [x] Kroonstraat · 34 fronts · partial (16 coloured)
- [x] Zuidkaai · 34 fronts · sampled (31 coloured)
- [ ] Koningsdal · 33 fronts · sampled (27 coloured)
- [x] Weversstraat · 33 fronts · sampled (22 coloured)
- [x] Batterijstraat · 31 fronts · sampled (20 coloured)
- [x] Breendonkstraat · 31 fronts · partial (2 coloured)
- [x] Violierstraat · 31 fronts · sampled (21 coloured)
- [x] Charles de l'Epéeplein · 30 fronts · partial (8 coloured)
- [x] Leiestraat · 30 fronts · sampled (22 coloured)
- [x] Vlasgaardstraat · 29 fronts · sampled (18 coloured)
- [x] Bellefleurstraat · 27 fronts · partial (3 coloured)
- [x] Charlotte Despardstraat · 27 fronts · partial (2 coloured)
- [x] Schrijnwerkersstraat · 26 fronts · partial (1 coloured)
- [x] Dapperheidstraat · 25 fronts · partial
- [x] Gatti de Gamondstraat · 25 fronts · partial (2 coloured)
- [x] Noordstraat · 25 fronts · partial (1 coloured)
- [x] Albert Schweitzerstraat · 24 fronts · partial (1 coloured)
- [x] Gaaipersstraat · 23 fronts · sampled (15 coloured)
- [x] Balsamierenstraat · 22 fronts · sampled (18 coloured)
- [ ] Hazelaarstraat · 22 fronts · todo (2 coloured)
- [x] Overzet · 22 fronts · sampled (15 coloured)
- [x] Zwaluwstraat · 22 fronts · sampled (11 coloured)
- [x] Kettingstraat · 21 fronts · sampled (15 coloured)
- [x] Politieke-Gevangenenlaan · 20 fronts · partial
- [x] Karel Waeriplein · 19 fronts · partial (7 coloured)
- [x] Luiklaan · 19 fronts · sampled (14 coloured)
- [x] Spinnerstraat · 19 fronts · partial (9 coloured)
- [ ] Noormanstraat · 18 fronts · todo
- [x] Einde Were · 16 fronts · partial (1 coloured)
- [ ] Houtemlaan · 16 fronts · sampled (8 coloured)
- [x] Portugalstraat · 16 fronts · partial (3 coloured)
- [x] Hekelaarsstraat · 15 fronts · sampled (10 coloured)
- [x] Pomonapad · 15 fronts · partial
- [x] Strodekkersstraat · 15 fronts · sampled (12 coloured)
- [x] Zesseptemberlaan · 15 fronts · partial (3 coloured)
- [x] Ramskapellelaan · 14 fronts · partial (2 coloured)
- [x] Acaciapark · 13 fronts · sampled (7 coloured)
- [x] Berthe Springaelstraat · 12 fronts · partial
- [ ] Oud-Strijderslaan · 11 fronts · sampled (7 coloured)
- [x] Sint-Jan-Baptiststraat · 11 fronts · partial (3 coloured)
- [x] Folke Bernadottestraat · 10 fronts · sampled (5 coloured)
- [ ] Heldenplein · 10 fronts · sampled (8 coloured)
- [x] Manaco · 10 fronts · partial (3 coloured)
- [ ] Weerstandsplein · 10 fronts · sampled (7 coloured)
- [x] Martin Luther Kingstraat · 9 fronts · partial (2 coloured)
- [x] Houthulststraat · 8 fronts · sampled (5 coloured)
- [x] Waldamkaai · 8 fronts · partial (3 coloured)
- [x] Bargiekaai · 7 fronts · sampled (6 coloured)
- [x] Madeleine Schauvliegestraat · 7 fronts · partial (2 coloured)
- [ ] Malemstraat · 7 fronts · sampled (6 coloured)
- [x] De Binnenweg · 6 fronts · sampled (5 coloured)
- [x] Elsa Guyssenspad · 6 fronts · partial
- [x] Herdenkingslaan · 6 fronts · partial (1 coloured)
- [x] Emilius Seghersplein · 5 fronts · sampled (5 coloured)
- [x] Guldenvliesstraat · 5 fronts · sampled (3 coloured)
- [ ] Lily Boeykensstraat · 4 fronts · todo
- [x] Sluikpersstraat · 4 fronts · partial
- [x] Broederlijke-Weversplein · 3 fronts · partial
- [x] Vossenkoer · 3 fronts · sampled (2 coloured)
- [x] Aloïs Joosstraat · 2 fronts · sampled (2 coloured)
- [ ] Jenny Walrystraat · 2 fronts · todo
- [x] Papiermolenstraat · 2 fronts · sampled (1 coloured)
- [x] Papinnestraat · 2 fronts · sampled (1 coloured)
- [x] August Hausstraat · 1 front · partial
- [x] Brughuizeken · 1 front · sampled (1 coloured)
- [x] Grijzezustersstraat · 1 front · partial
- [x] Johannes Schrantstraat · 1 front · partial
- [ ] Jozef De Veusterstraat · 1 front · todo
- [ ] Kraaidam · 1 front · todo
- [ ] Mahatma Gandhistraat · 1 front · todo
- [x] Nimfenstraat · 1 front · partial
- [x] Normandiëlaan · 1 front · sampled (1 coloured)

## Binnenstad

240 streets, 3914 house fronts; 2693 done (69%): 2471 coloured from photos, 221 drawn by hand, and streets drawn by hand all but a front or two.

- **Houses:** besides the ones drawn by hand, they have Ghent's ordinary fronts, in a colour picked by a hash unless coloured from photos.
- **3D landmarks:** Gravensteen, Stadshal (Schaapstal), Belfort, Lakenhalle, NTGent Schouwburg, Stadhuis, Sint-Baafskathedraal, Sint-Niklaaskerk, Sint-Michielskerk, Postgebouw (Post Plaza), Sint-Jacobskerk, Groot Vleeshuis, and 1 more
- **Squares:** Sint-Baafsplein, Korenmarkt
- **Monuments:** Jacob van Artevelde, Dulle Griet, Mammelokker, Trouwfeest, Fietsenstalling, Kiosk op de Kouter, Blauwe kiosk, Busstation Gent Zuid, Bloemenkraam, Neuzekeskraam, Piano onder de Stadshal, SGOL, and 6 more
- **Tour sights:** Sint-Baafskathedraal, Belfort, Gravensteen, Graslei en Korenlei, Sint-Michielsbrug, Sint-Niklaaskerk, Stadhuis, Vrijdagmarkt, Groot Vleeshuis, Glazen Straatje, Werregarenstraatje, Kouter, and 2 more
- **Named on the big map:** STAM, Design Museum Gent, Huis van Alijn, Museum Arnold Vander Haeghen, Opera Gent, Muziekcentrum De Bijloke, Handelsbeurs Concertzaal, Capitole Gent, and 47 more

- [ ] Kortrijksepoortstraat · 119 fronts · sampled (111 coloured)
- [ ] Brabantdam · 91 fronts · sampled (87 coloured)
- [ ] Karel Van Hulthemstraat · 73 fronts · sampled (49 coloured)
- [ ] Iepenstraat · 64 fronts · sampled (48 coloured)
- [ ] Sint-Kwintensberg · 59 fronts · sampled (54 coloured)
- [x] Burgstraat · 58 fronts · sampled (49 coloured)
- [ ] Keizer Karelstraat · 58 fronts · partial (26 coloured)
- [ ] Lange Boomgaardstraat · 50 fronts · sampled (39 coloured)
- [ ] Belgradostraat · 47 fronts · sampled (30 coloured)
- [x] Hoogpoort · 45 fronts · partial (16 coloured, 12 by hand)
- [ ] Luxemburgstraat · 45 fronts · sampled (39 coloured)
- [ ] Nieuwpoort · 45 fronts · partial (14 coloured)
- [ ] Oude Houtlei · 45 fronts · sampled (42 coloured)
- [x] Veldstraat · 40 fronts · sampled (21 coloured, 6 by hand)
- [ ] Vlaanderenstraat · 39 fronts · sampled (34 coloured)
- [ ] Wijngaardstraat · 39 fronts · sampled (37 coloured)
- [ ] Abeelstraat · 38 fronts · sampled (28 coloured)
- [x] Onderbergen · 37 fronts · sampled (35 coloured, 1 by hand)
- [x] Onderstraat · 37 fronts · sampled (20 coloured, 1 by hand)
- [ ] Pekelharing · 37 fronts · partial (18 coloured)
- [ ] Steendam · 37 fronts · partial (3 coloured)
- [x] Jeruzalemstraat · 36 fronts · partial (15 coloured)
- [x] Langemunt · 35 fronts · partial (10 coloured, 13 by hand)
- [x] Oudburg · 34 fronts · sampled (20 coloured, 2 by hand)
- [x] Savaanstraat · 34 fronts · sampled (20 coloured)
- [ ] Sint-Jacobsnieuwstraat · 34 fronts · partial (6 coloured, 13 by hand)
- [x] Donkersteeg · 33 fronts · partial (8 coloured, 1 by hand)
- [x] Geldmunt · 33 fronts · sampled (15 coloured, 12 by hand)
- [x] Hippolyte Metdepenningenstraat · 33 fronts · partial (5 coloured)
- [x] Kanunnikstraat · 31 fronts · sampled (23 coloured)
- [x] Nederkouter · 31 fronts · sampled (29 coloured)
- [x] Ketelvest · 30 fronts · sampled (18 coloured)
- [x] Mageleinstraat · 30 fronts · sampled (17 coloured, 3 by hand)
- [ ] Maagdestraat · 28 fronts · sampled (20 coloured)
- [ ] Pieter Vanderdoncktdoorgang · 28 fronts · partial (11 coloured)
- [ ] Tussen 't Pas · 28 fronts · partial (10 coloured)
- [x] Bennesteeg · 27 fronts · sampled (15 coloured)
- [ ] Gebroeders Van Eyckstraat · 27 fronts · sampled (19 coloured)
- [x] Pussemierstraat · 27 fronts · partial (11 coloured)
- [x] Jakob Jordaensstraat · 26 fronts · sampled (18 coloured)
- [ ] Jan Palfijnstraat · 26 fronts · sampled (18 coloured, 1 by hand)
- [ ] Sint-Jansvest · 26 fronts · sampled (16 coloured)
- [x] Penitentenstraat · 25 fronts · partial (10 coloured)
- [x] Posteernestraat · 25 fronts · sampled (23 coloured)
- [x] Wolfstraat · 25 fronts · partial (12 coloured)
- [ ] Zandpoortstraat · 25 fronts · sampled (17 coloured)
- [ ] Zuidstationstraat · 25 fronts · sampled (23 coloured)
- [ ] Annonciadenstraat · 24 fronts · sampled (23 coloured)
- [x] Drabstraat · 24 fronts · sampled (16 coloured, 2 by hand)
- [ ] Notarisstraat · 24 fronts · sampled (12 coloured)
- [ ] Plotersgracht · 24 fronts · sampled (19 coloured)
- [x] Pollepelstraat · 24 fronts · sampled (19 coloured)
- [ ] Verdedigingstraat · 24 fronts · sampled (14 coloured)
- [x] Voldersstraat · 24 fronts · sampled (18 coloured, 1 by hand)
- [x] Zwartezustersstraat · 24 fronts · sampled (13 coloured)
- [ ] Koolsteeg · 23 fronts · sampled (15 coloured)
- [ ] Sint-Martensstraat · 23 fronts · sampled (22 coloured)
- [ ] Henegouwenstraat · 22 fronts · sampled (22 coloured)
- [x] Jan Breydelstraat · 22 fronts · partial (8 coloured, 1 by hand)
- [ ] Kwaadham · 22 fronts · sampled (21 coloured)
- [ ] Laurent Delvauxstraat · 22 fronts · sampled (17 coloured)
- [x] Corduwaniersstraat · 21 fronts · partial (6 coloured, 2 by hand)
- [x] Jonkvrouw Mattestraat · 21 fronts · sampled (13 coloured)
- [x] Korte Meer · 21 fronts · sampled (19 coloured)
- [ ] Pelikaanstraat · 21 fronts · sampled (17 coloured)
- [x] Kammerstraat · 20 fronts · sampled (13 coloured, 3 by hand)
- [ ] Sint-Kristoffelstraat · 20 fronts · sampled (20 coloured)
- [x] Sint-Niklaasstraat · 20 fronts · partial (8 coloured, 2 by hand)
- [x] Bij Sint-Jacobs · 19 fronts · sampled (6 coloured, 8 by hand)
- [ ] Frans Ackermanstraat · 19 fronts · sampled (15 coloured)
- [ ] Gebroeders Vandeveldestraat · 19 fronts · sampled (18 coloured)
- [x] Kalversteeg · 19 fronts · sampled (11 coloured)
- [ ] Perkamentstraat · 19 fronts · partial (9 coloured)
- [ ] Sint-Jansdreef · 19 fronts · sampled (13 coloured)
- [x] Belfortstraat · 18 fronts · sampled (13 coloured)
- [ ] Gouvernementstraat · 18 fronts · sampled (16 coloured)
- [x] Koestraat · 18 fronts · sampled (14 coloured)
- [x] Schepenhuisstraat · 18 fronts · partial (7 coloured)
- [x] Serpentstraat · 18 fronts · partial (6 coloured, 1 by hand)
- [ ] Zeugsteeg · 18 fronts · sampled (11 coloured)
- [ ] Ballenstraat · 17 fronts · partial (6 coloured, 3 by hand)
- [ ] Charles de Kerchovelaan · 17 fronts · sampled (15 coloured)
- [ ] Kraanlei · 17 fronts · photos (1 coloured, 15 by hand)
- [ ] Nederpolder · 17 fronts · sampled (12 coloured)
- [x] Sint-Amelbergastraat · 17 fronts · partial (8 coloured)
- [ ] Apostelhuizen · 16 fronts · sampled (14 coloured)
- [ ] Bonifantenstraat · 16 fronts · sampled (12 coloured)
- [ ] Erpelsteeg · 16 fronts · sampled (9 coloured, 1 by hand)
- [x] Kortedagsteeg · 16 fronts · sampled (11 coloured)
- [ ] Napoleon Destanbergstraat · 16 fronts · sampled (12 coloured)
- [ ] Persellestraat · 16 fronts · partial (6 coloured)
- [ ] Schepenenvijverstraat · 16 fronts · sampled (16 coloured)
- [x] Wilderoosstraat · 16 fronts · sampled (13 coloured)
- [ ] Gezusters Lovelingstraat · 15 fronts · sampled (14 coloured)
- [ ] Jan Botermanstraat · 15 fronts · sampled (10 coloured)
- [ ] Klein Turkije · 15 fronts · sampled (8 coloured)
- [x] Koningstraat · 15 fronts · sampled (10 coloured)
- [x] Meerseniersstraat · 15 fronts · sampled (5 coloured, 6 by hand)
- [x] Vrijdagmarkt · 15 fronts · sampled (2 coloured, 12 by hand)
- [x] Ajuinlei · 14 fronts · partial (4 coloured, 2 by hand)
- [ ] Apotheekstraat · 14 fronts · partial (2 coloured)
- [ ] Barrestraat · 14 fronts · sampled (11 coloured)
- [x] Garensteeg · 14 fronts · sampled (9 coloured, 2 by hand)
- [ ] Hertogstraat · 14 fronts · sampled (10 coloured, 3 by hand)
- [x] Kalandeberg · 14 fronts · sampled (13 coloured)
- [ ] Kapucijnenham · 14 fronts · sampled (8 coloured)
- [ ] Korianderstraat · 14 fronts · sampled (12 coloured)
- [ ] Ramen · 14 fronts · sampled (10 coloured)
- [ ] Volmolenstraat · 14 fronts · partial (3 coloured)
- [x] Walpoortstraat · 14 fronts · sampled (11 coloured)
- [x] Zwaanstraat · 14 fronts · sampled (12 coloured)
- [ ] Doornsteeg · 13 fronts · partial (3 coloured)
- [ ] Groentenmarkt · 13 fronts · photos (2 coloured, 3 by hand)
- [ ] Haringsteeg · 13 fronts · sampled (13 coloured)
- [ ] Houtbriel · 13 fronts · sampled (10 coloured)
- [x] Koophandelsplein · 13 fronts · partial (2 coloured)
- [ ] Kozijntjesstraat · 13 fronts · partial (4 coloured)
- [ ] Kuiperskaai · 13 fronts · sampled (13 coloured)
- [ ] Reep · 13 fronts · sampled (9 coloured)
- [x] Rodekoningstraat · 13 fronts · sampled (9 coloured, 1 by hand)
- [ ] Sint-Baafsplein · 13 fronts · photos (2 coloured, 9 by hand)
- [ ] Gildestraat · 12 fronts · sampled (7 coloured)
- [ ] Hoofdkerkstraat · 12 fronts · sampled (8 coloured)
- [ ] Karrenstraat · 12 fronts · sampled (7 coloured)
- [ ] Platteberg · 12 fronts · sampled (9 coloured)
- [x] Saghermansstraat · 12 fronts · partial (5 coloured)
- [ ] Sint-Agnetestraat · 12 fronts · sampled (10 coloured)
- [ ] Ursulinenstraat · 12 fronts · sampled (7 coloured)
- [ ] Verlorenkost · 12 fronts · partial (5 coloured)
- [ ] Zilverenberg · 12 fronts · partial (3 coloured)
- [ ] Baaisteeg · 11 fronts · sampled (7 coloured, 1 by hand)
- [x] Borreputsteeg · 11 fronts · partial (4 coloured)
- [ ] IJkmeesterstraat · 11 fronts · partial (3 coloured)
- [ ] Kapittelstraat · 11 fronts · partial (5 coloured)
- [x] Kleinvleeshuissteeg · 11 fronts · partial (2 coloured, 1 by hand)
- [ ] Lindenlei · 11 fronts · sampled (11 coloured)
- [ ] Sint-Liesbetsteeg · 11 fronts · sampled (7 coloured)
- [x] Waaistraat · 11 fronts · sampled (6 coloured, 1 by hand)
- [ ] Graslei · 10 fronts · hand-drawn
- [x] Hoornstraat · 10 fronts · sampled (5 coloured, 1 by hand)
- [x] Kouter · 10 fronts · sampled (5 coloured, 3 by hand)
- [x] Koutersteeg · 10 fronts · partial (4 coloured)
- [x] Nodenaysteeg · 10 fronts · sampled (5 coloured, 2 by hand)
- [x] Oliestraat · 10 fronts · sampled (7 coloured)
- [ ] Oude Schaapmarkt · 10 fronts · sampled (10 coloured)
- [ ] Recollettenlei · 10 fronts · sampled (7 coloured)
- [ ] Ridderstraat · 10 fronts · sampled (6 coloured)
- [x] Universiteitstraat · 10 fronts · sampled (7 coloured, 1 by hand)
- [x] Wijzemanstraat · 10 fronts · sampled (5 coloured, 3 by hand)
- [ ] Klein Raamhof · 9 fronts · sampled (9 coloured)
- [ ] Nederkwaadham · 9 fronts · sampled (7 coloured)
- [ ] Oudescheldestraat · 9 fronts · sampled (6 coloured)
- [ ] Schuddeveestraatje · 9 fronts · partial (6 by hand)
- [ ] Struifstraat · 9 fronts · sampled (6 coloured)
- [ ] Watermolenstraat · 9 fronts · sampled (8 coloured)
- [x] Werregarenstraat · 9 fronts · partial (3 coloured, 1 by hand)
- [x] Zandberg · 9 fronts · sampled (9 coloured)
- [ ] Grote Huidevettershoek · 8 fronts · sampled (8 coloured)
- [ ] Gruuthuusestraat · 8 fronts · sampled (5 coloured, 2 by hand)
- [ ] Korenlei · 8 fronts · hand-drawn
- [ ] Mageleinsteeg · 8 fronts · sampled (7 coloured, 1 by hand)
- [x] Predikherenlei · 8 fronts · sampled (1 coloured, 7 by hand)
- [x] Prudens Van Duyseplein · 8 fronts · sampled (4 coloured)
- [ ] Seminariestraat · 8 fronts · sampled (8 coloured)
- [ ] Biezekapelstraat · 7 fronts · sampled (4 coloured, 2 by hand)
- [x] Edward Anseeleplein · 7 fronts · sampled (5 coloured)
- [ ] Emile Braunplein · 7 fronts · photos (1 by hand)
- [x] Heilig-Sacramentstraat · 7 fronts · partial (1 coloured)
- [x] Jakobijnenstraat · 7 fronts · sampled (3 coloured, 1 by hand)
- [ ] Kalandestraat · 7 fronts · sampled (6 coloured)
- [x] Karmelietenstraat · 7 fronts · sampled (6 coloured)
- [ ] Kleine Vismarkt · 7 fronts · sampled (6 coloured, 1 by hand)
- [ ] Koepoortkaai · 7 fronts · partial
- [ ] Kruideniersstraat · 7 fronts · sampled (4 coloured)
- [x] Okkernootsteeg · 7 fronts · sampled (5 coloured)
- [x] Zonnestraat · 7 fronts · partial (2 coloured, 2 by hand)
- [ ] Duivelsteeg · 6 fronts · sampled (5 coloured)
- [x] Frans Tavernierstraat · 6 fronts · sampled (5 coloured)
- [x] Hoefslagstraatje · 6 fronts · partial (2 by hand)
- [ ] Koperstraat · 6 fronts · sampled (5 coloured)
- [ ] Oude Beestenmarkt · 6 fronts · sampled (5 coloured)
- [x] Paddenhoek · 6 fronts · partial (1 coloured)
- [x] Schouwburgstraat · 6 fronts · partial (2 coloured, 1 by hand)
- [x] Straatje Zonder Einde · 6 fronts · partial (2 coloured, 1 by hand)
- [ ] Trommelstraat · 6 fronts · sampled (6 coloured)
- [ ] Bijlokekaai · 5 fronts · partial
- [x] Bonteleeuwstraat · 5 fronts · sampled (3 coloured)
- [x] Conduitsteeg · 5 fronts · partial (2 coloured)
- [ ] François Laurentplein · 5 fronts · partial (1 coloured)
- [ ] Hospitaalstraat · 5 fronts · sampled (4 coloured)
- [ ] Kaatsspelplein · 5 fronts · sampled (5 coloured)
- [ ] Pieter de Keyserestraat · 5 fronts · sampled (5 coloured)
- [ ] Stoofstraat · 5 fronts · sampled (5 coloured)
- [x] Boeksteeg · 4 fronts · sampled (2 coloured, 2 by hand)
- [x] Grootkanonplein · 4 fronts · sampled (2 coloured, 1 by hand)
- [ ] Hazewindstraatje · 4 fronts · sampled (1 coloured, 2 by hand)
- [ ] Hof van Fiennes · 4 fronts · sampled (3 coloured, 1 by hand)
- [ ] Kortemunt · 4 fronts · sampled (1 coloured, 3 by hand)
- [x] Kouterdreef · 4 fronts · sampled (2 coloured)
- [ ] Lange Kruisstraat · 4 fronts · sampled (4 coloured)
- [ ] Limburgstraat · 4 fronts · sampled (3 coloured)
- [ ] Oranjeberg · 4 fronts · partial (1 coloured)
- [ ] Pensmarkt · 4 fronts · partial (1 coloured, 1 by hand)
- [ ] Poeljemarkt · 4 fronts · sampled (4 coloured)
- [x] Raffinaderijstraatje · 4 fronts · sampled (2 coloured)
- [ ] Rekelingestraat · 4 fronts · hand-drawn
- [ ] Rozendaalken · 4 fronts · sampled (2 coloured)
- [x] Schoenlapperstraat · 4 fronts · partial
- [x] Schuurkenstraat · 4 fronts · sampled (2 coloured)
- [ ] Sint-Baafssteeg · 4 fronts · sampled (3 coloured, 1 by hand)
- [ ] Stadhuissteeg · 4 fronts · sampled (3 coloured)
- [ ] Tiebaertsteeg · 4 fronts · sampled (4 coloured)
- [x] Vlasmarkt · 4 fronts · sampled (2 coloured)
- [x] Vogelmarkt · 4 fronts · sampled (2 coloured)
- [x] Walter De Buckplein · 4 fronts · sampled (2 coloured)
- [ ] Zoutstraat · 4 fronts · sampled (2 coloured)
- [x] Zuivelbrugstraat · 4 fronts · sampled (4 coloured)
- [ ] Bisdomkaai · 3 fronts · sampled (2 coloured)
- [ ] Botermarkt · 3 fronts · photos (2 by hand)
- [x] Jan van Stopenberghestraat · 3 fronts · sampled (2 coloured)
- [ ] Jodenstraat · 3 fronts · sampled (2 coloured)
- [ ] Julius de Vigneplein · 3 fronts · sampled (3 coloured)
- [ ] Korte Kruisstraat · 3 fronts · sampled (3 coloured)
- [ ] Paradijszak · 3 fronts · partial (1 coloured)
- [ ] Rembert Dodoensdreef · 3 fronts · sampled (3 coloured)
- [x] Sint-Michielshelling · 3 fronts · sampled (2 coloured)
- [ ] Albert Baertsoenkaai · 2 fronts · sampled (2 coloured)
- [ ] Graaf van Vlaanderenplein · 2 fronts · sampled (2 coloured)
- [ ] Hooiaard · 2 fronts · hand-drawn
- [ ] Kalvermarkt · 2 fronts · sampled (2 coloured)
- [ ] Korenmarkt · 2 fronts · photos (1 coloured, 1 by hand)
- [ ] Sint-Crispijnstraat · 2 fronts · sampled (2 coloured)
- [ ] Zwaardsteeg · 2 fronts · sampled (2 coloured)
- [x] Beverhoutplein · 1 front · sampled (1 coloured)
- [ ] Bisdomplein · 1 front · sampled (1 coloured)
- [ ] Geraard de Duivelstraat · 1 front · sampled (1 coloured)
- [ ] Grasbrug · 1 front · hand-drawn
- [ ] Hippoliet Lippensplein · 1 front · sampled (1 coloured)
- [ ] Jozef Kluyskensstraat · 1 front · partial
- [ ] Ketelpoort · 1 front · sampled (1 coloured)

## Rabot - Blaisantvest

67 streets, 2682 house fronts; 1827 done (68%): 1827 coloured from photos, 0 drawn by hand.

- **Houses:** besides the ones drawn by hand, they have Ghent's ordinary fronts, in a colour picked by a hash unless coloured from photos.
- **3D landmarks:** Rabot
- **Named on the big map:** Studio Skoop, Sint-Annakerk, Sint-Jozefskerk, Rabotpark, Rabot, AZ Sint-Lucas

- [ ] IJskelderstraat · 141 fronts · sampled (119 coloured)
- [ ] Wondelgemstraat · 131 fronts · sampled (75 coloured)
- [ ] Gebroeders De Smetstraat · 104 fronts · sampled (86 coloured)
- [ ] Wilgestraat · 101 fronts · partial (50 coloured)
- [ ] Jozef II-straat · 99 fronts · sampled (67 coloured)
- [ ] Begijnhoflaan · 93 fronts · sampled (56 coloured)
- [ ] Victor Frisstraat · 87 fronts · partial (43 coloured)
- [ ] Filips van Cleeflaan · 86 fronts · sampled (58 coloured)
- [ ] Schaliestraat · 85 fronts · sampled (44 coloured)
- [ ] Pannestraat · 81 fronts · sampled (55 coloured)
- [ ] Rabotstraat · 78 fronts · sampled (55 coloured)
- [ ] Blaisantvest · 70 fronts · sampled (57 coloured)
- [ ] Kwakkelstraat · 70 fronts · sampled (37 coloured)
- [ ] Kaprijkestraat · 68 fronts · sampled (55 coloured)
- [ ] Schommelstraat · 68 fronts · sampled (36 coloured)
- [ ] Rietstraat · 67 fronts · sampled (52 coloured)
- [ ] Vlotstraat · 67 fronts · sampled (57 coloured)
- [ ] Meelstraat · 63 fronts · sampled (53 coloured)
- [ ] Gerststraat · 59 fronts · sampled (44 coloured)
- [ ] Tarwestraat · 58 fronts · sampled (33 coloured)
- [ ] Maria-Theresiastraat · 57 fronts · sampled (54 coloured)
- [ ] Gagelstraat · 54 fronts · sampled (38 coloured)
- [ ] Magnoliastraat · 51 fronts · sampled (30 coloured)
- [ ] Ferdinand Lousbergskaai · 50 fronts · partial (19 coloured)
- [ ] Watervlietstraat · 49 fronts · sampled (43 coloured)
- [ ] Gasklokstraat · 47 fronts · sampled (40 coloured)
- [ ] Drietorekensstraat · 44 fronts · sampled (37 coloured)
- [ ] Lorkenstraat · 44 fronts · sampled (28 coloured)
- [ ] Haverstraat · 42 fronts · sampled (23 coloured)
- [ ] Oosteeklostraat · 40 fronts · sampled (34 coloured)
- [ ] Citroenstraat · 37 fronts · sampled (29 coloured)
- [ ] Kluizenaarstraat · 37 fronts · sampled (36 coloured)
- [ ] Hippoliet Lammensstraat · 33 fronts · sampled (21 coloured)
- [ ] Bij Sint-Jozef · 29 fronts · sampled (19 coloured)
- [ ] Hector Van Wittenberghestraat · 27 fronts · sampled (23 coloured)
- [ ] Kolveniersgang · 27 fronts · sampled (23 coloured)
- [ ] Muishondstraat · 26 fronts · partial (7 coloured)
- [ ] Spaarstraat · 25 fronts · sampled (21 coloured)
- [ ] IJzendijkestraat · 24 fronts · sampled (18 coloured)
- [ ] Elsstraat · 22 fronts · partial (10 coloured)
- [ ] Gravin Johannastraat · 22 fronts · sampled (11 coloured)
- [ ] Triomfstraat · 20 fronts · sampled (16 coloured)
- [ ] Filaturestraat · 18 fronts · partial (1 coloured)
- [ ] Mathias Gesweinstraat · 17 fronts · sampled (15 coloured)
- [ ] Jan Verspeyenstraat · 16 fronts · sampled (12 coloured)
- [ ] Vogelenzang · 16 fronts · sampled (8 coloured)
- [ ] Nieuwebosstraat · 15 fronts · sampled (12 coloured)
- [ ] Bellemansstraat · 14 fronts · sampled (10 coloured)
- [ ] Sophie Van Akenstraat · 14 fronts · partial (5 coloured)
- [ ] Lodewijk van Malestraat · 12 fronts · partial (1 coloured)
- [ ] 't Stuk · 10 fronts · sampled (10 coloured)
- [ ] Filips van Arteveldestraat · 10 fronts · partial (4 coloured)
- [ ] Michel Thieryhof · 8 fronts · sampled (5 coloured)
- [ ] Bachtenwalle · 7 fronts · sampled (7 coloured)
- [ ] Groene Ooie · 7 fronts · partial (3 coloured)
- [ ] Creesersweg · 6 fronts · sampled (5 coloured)
- [ ] Tondelierlaan · 6 fronts · sampled (5 coloured)
- [ ] Sint-Annaplein · 5 fronts · sampled (4 coloured)
- [ ] Spoelbotenstraat · 5 fronts · sampled (3 coloured)
- [ ] Parallelweg · 4 fronts · sampled (3 coloured)
- [ ] Cornelis Sneyssonestraat · 3 fronts · partial
- [ ] Abraham Voortmanstraat · 1 front · partial
- [ ] Biervlietstraat · 1 front · sampled (1 coloured)
- [x] Nicolaas Zannekinstraat · 1 front · partial
- [ ] Opgeëistenlaan · 1 front · partial
- [ ] Terhagen · 1 front · partial
- [ ] Texasstraat · 1 front · sampled (1 coloured)

## Stationsbuurt-Noord

85 streets, 2572 house fronts; 272 done (11%): 251 coloured from photos, 21 drawn by hand.

- **Houses:** besides the ones drawn by hand, they have Ghent's ordinary fronts, in a colour picked by a hash unless coloured from photos.
- **3D landmarks:** Vooruit, Sint-Pietersabdij, Boekentoren
- **Monuments:** Banner, Provinciehuis (Leopoldskazerne)
- **Tour sights:** Vooruit, Sint-Pietersabdij, Provinciehuis (Leopoldskazerne)
- **Named on the big map:** Museum voor Schone Kunsten, S.M.A.K., Kinepolis Gent, Kunstencentrum Vooruit, Kuipke, UFO, Campus Ledeganck, Sint-Barbaracollege, and 5 more

- [ ] Meersstraat · 128 fronts · todo (2 coloured)
- [ ] Smidsestraat · 99 fronts · todo (6 coloured)
- [ ] Ottergemsesteenweg · 96 fronts · todo
- [ ] Hofstraat · 82 fronts · todo
- [ ] Zwijnaardsesteenweg · 80 fronts · todo
- [ ] Sint-Pietersnieuwstraat · 75 fronts · todo (7 coloured)
- [ ] Stropstraat · 75 fronts · todo
- [ ] Ter Platen · 68 fronts · todo
- [ ] Leeuwstraat · 67 fronts · todo
- [ ] Muinkkaai · 65 fronts · todo (1 coloured)
- [ ] Baliestraat · 64 fronts · todo
- [ ] Hertstraat · 61 fronts · todo (2 coloured)
- [x] Overpoortstraat · 61 fronts · partial (16 coloured, 20 by hand)
- [ ] Paul Fredericqstraat · 58 fronts · todo (2 coloured)
- [ ] Tentoonstellingslaan · 53 fronts · todo
- [ ] Bagattenstraat · 49 fronts · todo (8 coloured)
- [ ] Eedverbondkaai · 48 fronts · todo (1 coloured)
- [ ] Jozef Plateaustraat · 46 fronts · todo (1 coloured)
- [ ] Willem Wenemaerstraat · 45 fronts · todo
- [x] Kunstlaan · 43 fronts · sampled (27 coloured)
- [x] Gravenbolwerkstraat · 42 fronts · partial (4 coloured)
- [ ] Kraaistraat · 42 fronts · todo
- [x] Sint-Amandstraat · 42 fronts · sampled (29 coloured)
- [ ] Lentestraat · 40 fronts · todo
- [ ] Floraliënlaan · 39 fronts · todo (4 coloured)
- [ ] Holdaal · 36 fronts · todo
- [x] Voetweg · 36 fronts · sampled (27 coloured)
- [ ] Jakob Heremansstraat · 35 fronts · todo
- [ ] Karel de Stoutestraat · 33 fronts · todo
- [ ] Willem van Nassaustraat · 30 fronts · todo
- [ ] Kleppersstraat · 28 fronts · todo
- [ ] Willem Tellstraat · 28 fronts · todo (2 coloured)
- [ ] Gangmakersstraat · 27 fronts · todo
- [ ] Raketstraat · 27 fronts · todo (1 coloured)
- [ ] Tijgerstraat · 27 fronts · todo
- [ ] Alpacastraat · 26 fronts · todo
- [ ] Tennisbaanstraat · 26 fronts · todo (1 coloured)
- [ ] Buffelstraat · 25 fronts · todo
- [ ] Filips van Marnixstraat · 25 fronts · todo
- [ ] Normaalschoolstraat · 24 fronts · todo
- [ ] Sint-Coletastraat · 23 fronts · todo
- [x] Kattenberg · 22 fronts · partial (2 coloured)
- [ ] Takkebosstraat · 22 fronts · todo
- [ ] François Benardstraat · 21 fronts · todo
- [ ] Jan-Baptist Guinardstraat · 21 fronts · todo
- [ ] Keviestraat · 21 fronts · todo
- [x] Stalhof · 21 fronts · partial (8 coloured)
- [ ] Stropkaai · 21 fronts · todo
- [ ] Sint-Paulusstraat · 20 fronts · todo
- [ ] Guldenspoorstraat · 19 fronts · todo
- [x] Kazernenstraat · 19 fronts · partial (8 coloured)
- [ ] Lammerstraat · 19 fronts · todo (1 coloured)
- [ ] Jan zonder Vreesstraat · 17 fronts · todo
- [x] Kantienberg · 17 fronts · sampled (15 coloured)
- [x] Arendstraat · 15 fronts · partial (6 coloured)
- [x] Eekhout · 15 fronts · partial (7 coloured)
- [x] Hoveniersberg · 15 fronts · sampled (10 coloured)
- [ ] Franklin Rooseveltlaan · 14 fronts · todo
- [ ] Gustaaf Magnelstraat · 14 fronts · todo (1 coloured)
- [ ] Henleykaai · 14 fronts · todo
- [ ] Hofbouwlaan · 14 fronts · todo (2 coloured)
- [x] Jan Frans Willemsstraat · 14 fronts · sampled (10 coloured)
- [ ] Langhalsstraat · 14 fronts · todo
- [ ] Karel Lodewijk Ledeganckstraat · 13 fronts · todo
- [ ] Herfststraat · 12 fronts · todo
- [x] Citadellaan · 10 fronts · sampled (7 coloured, 1 by hand)
- [x] Florbertusstraat · 10 fronts · sampled (8 coloured)
- [ ] IJzerlaan · 10 fronts · todo
- [ ] Rozier · 10 fronts · todo
- [ ] Isabellakaai · 9 fronts · todo (1 coloured)
- [x] Victor Hortastraat · 9 fronts · partial (1 coloured)
- [x] Blandijnberg · 8 fronts · sampled (4 coloured)
- [x] Gaspar de Craeyerstraat · 8 fronts · sampled (7 coloured)
- [ ] Zwijntjeskaai · 8 fronts · todo (1 coloured)
- [x] Benedictijnenstraat · 7 fronts · sampled (6 coloured)
- [ ] Sint-Hubertusstraat · 7 fronts · todo (1 coloured)
- [ ] Steeg der Menigte · 7 fronts · todo
- [x] Kramersplein · 6 fronts · partial (2 coloured)
- [x] Sint-Pietersplein · 6 fronts · partial (1 coloured)
- [ ] Beemdstraat · 5 fronts · todo
- [x] Graaf Arnulfstraat · 4 fronts · partial (1 coloured)
- [ ] Klaproosstraat · 4 fronts · todo
- [ ] Woodrow Wilsonplein · 3 fronts · todo
- [ ] Familie Van Rysselberghedreef · 2 fronts · todo
- [ ] Jan Hoetplein · 1 front · todo

## Bloemekenswijk

46 streets, 2413 house fronts; 1400 done (58%): 1400 coloured from photos, 0 drawn by hand.

- **Houses:** besides the ones drawn by hand, 730 stand in the brugse-poort quarter, with its own 'worker' fronts, and the rest have Ghent's ordinary fronts, in a colour picked by a hash unless coloured from photos.
- **Named on the big map:** Museum Dr. Guislain

- [ ] Hamerstraat · 152 fronts · sampled (101 coloured)
- [ ] Hortensiastraat · 139 fronts · sampled (81 coloured)
- [x] Groendreef · 127 fronts · sampled (95 coloured)
- [ ] Fuchsiastraat · 119 fronts · sampled (75 coloured)
- [ ] Brugsesteenweg · 114 fronts · sampled (69 coloured)
- [ ] Maïsstraat · 106 fronts · sampled (69 coloured)
- [ ] Boomstraat · 101 fronts · partial (39 coloured)
- [ ] Frans van Ryhovelaan · 101 fronts · sampled (71 coloured)
- [ ] Abrikoosstraat · 89 fronts · partial (34 coloured)
- [ ] Notelaarstraat · 88 fronts · sampled (59 coloured)
- [x] Olijfstraat · 82 fronts · sampled (56 coloured)
- [x] Lobeliastraat · 81 fronts · sampled (49 coloured)
- [ ] Wielewaalstraat · 80 fronts · partial (22 coloured)
- [ ] Gezondheidstraat · 73 fronts · sampled (54 coloured)
- [ ] Kiekenstraat · 72 fronts · sampled (65 coloured)
- [ ] Lavendelstraat · 72 fronts · sampled (44 coloured)
- [ ] Palinghuizen · 72 fronts · partial (15 coloured)
- [ ] Jozef Guislainstraat · 66 fronts · sampled (47 coloured)
- [ ] Dahliastraat · 65 fronts · partial (9 coloured)
- [ ] Virginiastraat · 63 fronts · sampled (41 coloured)
- [ ] Zinniastraat · 61 fronts · sampled (34 coloured)
- [ ] Tortelduifstraat · 52 fronts · partial (20 coloured)
- [ ] Elyzeese Velden · 47 fronts · sampled (45 coloured)
- [ ] Francisco Ferrerlaan · 39 fronts · sampled (31 coloured)
- [ ] Isegrimstraat · 38 fronts · sampled (38 coloured)
- [ ] Welvaartstraat · 35 fronts · sampled (22 coloured)
- [ ] Lucienne Herman-Michielsensstraat · 32 fronts · sampled (16 coloured)
- [ ] Goudvinkstraat · 30 fronts · partial (5 coloured)
- [ ] Jan Lampensstraat · 27 fronts · partial (2 coloured)
- [ ] Amanda Foketstraat · 26 fronts · sampled (20 coloured)
- [ ] Roggestraat · 26 fronts · sampled (18 coloured)
- [ ] Kempstraat · 25 fronts · sampled (19 coloured)
- [ ] Ogier van Boesbekestraat · 20 fronts · partial
- [ ] Cantecleerstraat · 17 fronts · sampled (13 coloured)
- [ ] Textielstraat · 17 fronts · partial (1 coloured)
- [ ] Pioenstraat · 12 fronts · sampled (7 coloured)
- [ ] Lijsterstraat · 11 fronts · partial (1 coloured)
- [ ] Nieuwevaart · 10 fronts · partial
- [ ] Spinnerijdoorgang · 9 fronts · partial (2 coloured)
- [ ] Sisalstraat · 8 fronts · sampled (6 coloured)
- [ ] Antoinette Vandeputtepad · 2 fronts · sampled (1 coloured)
- [ ] Gaardeniersweg · 2 fronts · sampled (1 coloured)
- [ ] Koning Nobelplein · 2 fronts · sampled (2 coloured)
- [ ] Clematisstraat · 1 front · partial
- [ ] Getouwstraat · 1 front · partial
- [ ] Manilastraat · 1 front · sampled (1 coloured)

## Sluizeken - Tolhuis - Ham

78 streets, 2206 house fronts; 83 done (4%): 79 coloured from photos, 4 drawn by hand.

- **Houses:** besides the ones drawn by hand, they have Ghent's ordinary fronts, in a colour picked by a hash unless coloured from photos.
- **Named on the big map:** Industriemuseum, Caermersklooster, Kunsthal Gent, Kopergietery, De Centrale Gent, Sint-Stefanuskerk, Gruut, Baudelohof

- [ ] Ham · 122 fronts · todo
- [ ] Sleepstraat · 102 fronts · todo
- [ ] Tolhuislaan · 96 fronts · todo
- [ ] Sint-Salvatorstraat · 85 fronts · todo
- [ ] Meerhem · 78 fronts · todo
- [ ] Kongostraat · 75 fronts · todo
- [ ] Rodelijvekensstraat · 73 fronts · todo
- [ ] Berouw · 70 fronts · todo
- [ ] Kartuizerlaan · 68 fronts · todo
- [ ] Nieuwland · 66 fronts · todo
- [ ] Blekerijstraat · 62 fronts · todo
- [ ] Frans Rensstraat · 61 fronts · todo
- [ ] Jozef Van Crombrugghestraat · 61 fronts · todo
- [x] Baudelostraat · 53 fronts · sampled (28 coloured, 1 by hand)
- [ ] Doornzelestraat · 46 fronts · todo
- [ ] Stokerijstraat · 45 fronts · todo
- [ ] Lambert Queteletstraat · 44 fronts · todo
- [x] Gelukstraat · 42 fronts · partial (16 coloured)
- [ ] Godshuishammeke · 42 fronts · todo
- [ ] Antoon Sanderusstraat · 40 fronts · todo
- [ ] Karel Mirystraat · 40 fronts · todo
- [ ] Blekersdijk · 39 fronts · todo
- [ ] Justus Lipsiusstraat · 37 fronts · todo
- [ ] Geraard Mercatorstraat · 36 fronts · todo
- [ ] Jacob van Maerlantstraat · 35 fronts · todo
- [ ] Bomastraat · 34 fronts · todo
- [ ] Oudevest · 30 fronts · todo (4 coloured)
- [ ] Désiré Fiévéstraat · 29 fronts · todo
- [ ] Jan Baptist Davidstraat · 27 fronts · todo
- [ ] Sint-Margrietstraat · 26 fronts · todo (1 by hand)
- [ ] Achterleie · 25 fronts · todo
- [ ] Desiderius Erasmusstraat · 24 fronts · todo
- [ ] Jakob Van Caeneghemstraat · 24 fronts · todo
- [ ] Sint-Katelijnestraat · 24 fronts · todo (2 coloured)
- [ ] Tempelhof · 23 fronts · todo
- [ ] Geuzenberg · 22 fronts · todo
- [ ] Drongenhof · 21 fronts · todo (5 coloured)
- [ ] Goudstraat · 21 fronts · todo (1 coloured)
- [ ] Groenbrugstraat · 21 fronts · todo
- [ ] Huidevetterken · 21 fronts · todo
- [ ] Huidevetterskaai · 21 fronts · todo
- [ ] Bandelierstraat · 19 fronts · todo
- [ ] Hugo Van der Goesstraat · 18 fronts · todo
- [ ] Grauwpoort · 17 fronts · todo
- [ ] Lange Steenstraat · 16 fronts · todo
- [ ] Gillis Coppinsstraat · 15 fronts · todo
- [ ] Klipperstraat · 14 fronts · todo
- [ ] Lievestraat · 14 fronts · todo (1 by hand)
- [ ] Fratersplein · 12 fronts · todo
- [ ] Sluizeken · 12 fronts · todo (1 coloured)
- [x] Speldenstraat · 12 fronts · sampled (10 coloured)
- [ ] Pierre De Geyterstraat · 11 fronts · todo
- [ ] Willem de Beersteeg · 11 fronts · todo
- [ ] Gillis Coppinssteeg · 10 fronts · todo
- [ ] Krommewal · 9 fronts · todo
- [ ] Vrouwebroersstraat · 9 fronts · todo (1 coloured)
- [ ] Baudelokaai · 8 fronts · todo (1 coloured)
- [ ] Moestuinstraat · 8 fronts · todo
- [ ] Regattenlaan · 8 fronts · todo
- [ ] Stapelplein · 8 fronts · todo
- [x] Twijndersstraat · 8 fronts · sampled (6 coloured)
- [x] Bibliotheekstraat · 6 fronts · partial (1 coloured, 1 by hand)
- [ ] Logstraat · 6 fronts · todo
- [x] Ottogracht · 5 fronts · sampled (3 coloured)
- [ ] Rendelgat · 5 fronts · todo
- [ ] Reke · 4 fronts · todo
- [ ] Sluizekenkaai · 4 fronts · todo
- [ ] Spijkeboorstraat · 4 fronts · todo
- [ ] Tolpoort · 4 fronts · todo
- [ ] Baviaanstraat · 3 fronts · todo
- [ ] Dobbelslot · 3 fronts · todo
- [ ] Kofschipstraat · 3 fronts · todo
- [ ] Academiestraat · 2 fronts · todo
- [ ] Kraankindersstraat · 2 fronts · todo
- [ ] Tichelrei · 2 fronts · todo
- [ ] Sint-Vincentiusplein · 1 front · todo
- [ ] Sluizekenstraat · 1 front · todo
- [ ] Winston Churchillplein · 1 front · todo

## Elisabethbegijnhof - Prinsenhof - Papegaai - Sint-Michiels

69 streets, 1986 house fronts; 111 done (6%): 95 coloured from photos, 16 drawn by hand.

- **Houses:** besides the ones drawn by hand, they have Ghent's ordinary fronts, in a colour picked by a hash unless coloured from photos.
- **Named on the big map:** NTGent Arca, Tinnenpot, LUCA School of Arts, Koninklijk Atheneum West, Kunsthumaniora Sint-Lucas, Sint-Elisabethkerk, Oak, De Gekroonde Hoofden, and 2 more

- [ ] Coupure Links · 115 fronts · todo (3 coloured)
- [ ] Zonder-Naamstraat · 87 fronts · todo (4 coloured)
- [ ] Hoogstraat · 86 fronts · todo
- [ ] Coupure Rechts · 80 fronts · todo (3 coloured)
- [ ] Twaalfkameren · 74 fronts · todo (1 coloured)
- [ ] Warandestraat · 69 fronts · todo (2 coloured)
- [ ] Papegaaistraat · 66 fronts · todo (4 coloured)
- [ ] Holstraat · 64 fronts · todo
- [ ] Molenaarsstraat · 63 fronts · todo (13 coloured)
- [ ] Lieven de Winnestraat · 56 fronts · todo
- [ ] Krommenelleboog · 53 fronts · todo
- [ ] Pijndersstraat · 49 fronts · todo
- [ ] Bernard Spaelaan · 46 fronts · todo
- [ ] Stoppelstraat · 46 fronts · todo (17 coloured)
- [ ] Wellingstraat · 44 fronts · todo (2 coloured)
- [ ] Brandstraat · 43 fronts · todo (2 coloured)
- [ ] Koopvaardijlaan · 41 fronts · todo
- [ ] Provenierstersstraat · 41 fronts · todo (1 coloured)
- [ ] Begijnengracht · 39 fronts · todo
- [ ] Tinnenpotstraat · 36 fronts · todo
- [ ] Prinsenhof · 35 fronts · todo
- [ ] Rasphuisstraat · 35 fronts · todo
- [ ] Simon de Mirabellostraat · 32 fronts · todo
- [ ] Gewad · 31 fronts · todo (1 coloured, 1 by hand)
- [ ] Peperstraat · 31 fronts · todo (1 coloured)
- [ ] Komijnstraat · 30 fronts · todo (3 coloured)
- [ ] Galgenberg · 27 fronts · todo
- [ ] Theresianenstraat · 27 fronts · todo
- [ ] Akkerstraat · 25 fronts · todo
- [ ] Schouwvegersstraat · 24 fronts · todo (2 coloured)
- [ ] Abrahamstraat · 23 fronts · todo (1 coloured)
- [ ] Marialand · 23 fronts · todo
- [ ] Roderoestraat · 23 fronts · todo
- [ ] Zilverhof · 23 fronts · todo
- [ ] Pluimstraat · 22 fronts · todo
- [ ] Turrepoortsteeg · 21 fronts · todo (12 coloured)
- [ ] Brugsepoortstraat · 19 fronts · todo (1 coloured)
- [ ] Casinoplein · 19 fronts · todo
- [ ] Sanderswal · 19 fronts · todo
- [ ] Ingelandgat · 18 fronts · todo (5 coloured)
- [ ] Johan Daisnestraat · 18 fronts · todo
- [ ] Begijnhofdries · 17 fronts · todo (3 coloured)
- [ ] Lievekaai · 17 fronts · todo
- [ ] Sint-Elisabethplein · 17 fronts · todo (6 coloured)
- [ ] Sint-Michielsstraat · 16 fronts · todo (1 by hand)
- [ ] Kleindokkaai · 15 fronts · todo
- [ ] Metselaarsstraat · 15 fronts · todo
- [ ] Varkensstraat · 15 fronts · todo
- [ ] Brouwersstraat · 14 fronts · todo (2 coloured)
- [ ] Sint-Michielsplein · 13 fronts · photos (11 by hand)
- [ ] Sint-Widostraat · 13 fronts · todo
- [ ] Sint-Antoniuskaai · 12 fronts · todo
- [ ] Watergraafstraat · 10 fronts · todo (1 coloured)
- [ ] Edmond Boonenstraat · 9 fronts · todo (2 coloured)
- [ ] Prinsenhofplein · 9 fronts · todo
- [ ] Wispelbergstraat · 9 fronts · todo
- [ ] Brioolstraat · 8 fronts · todo
- [ ] Augustijnenkaai · 7 fronts · todo
- [ ] Poel · 7 fronts · todo (2 coloured)
- [ ] Stukwerkersstraat · 7 fronts · todo
- [ ] Braderijstraat · 6 fronts · todo
- [ ] Contributiestraat · 5 fronts · todo
- [ ] Ravensteinstraat · 5 fronts · todo (1 coloured, 3 by hand)
- [ ] Straatje van Oliveten · 4 fronts · todo
- [ ] Blindeken · 3 fronts · todo
- [ ] Domein Antoniushof · 3 fronts · todo
- [ ] Ravelijnstraat · 3 fronts · todo
- [ ] Zwartekatstraat · 3 fronts · todo
- [ ] Dok-Zuid · 1 front · todo

## Stationsbuurt-Zuid

60 streets, 1952 house fronts; 472 done (24%): 457 coloured from photos, 15 drawn by hand.

- **Houses:** besides the ones drawn by hand, they have Ghent's ordinary fronts, in a colour picked by a hash unless coloured from photos.
- **Monuments:** Station Gent-Sint-Pieters
- **Named on the big map:** GUM, Citadelpark, Plantentuin UGent

- [ ] Sportstraat · 149 fronts · todo (3 coloured)
- [ ] Kortrijksesteenweg · 142 fronts · todo (7 coloured)
- [ ] Koning Albertlaan · 109 fronts · sampled (73 coloured)
- [ ] Lucas de Heerestraat · 102 fronts · todo (1 coloured)
- [ ] Aaigemstraat · 95 fronts · todo (6 coloured)
- [ ] Ganzendries · 74 fronts · todo
- [ ] Sint-Denijslaan · 69 fronts · sampled (40 coloured)
- [ ] Victoriastraat · 66 fronts · todo
- [ ] Merelstraat · 65 fronts · todo
- [ ] Koningin Fabiolalaan · 61 fronts · sampled (46 coloured, 11 by hand)
- [ ] Koningin Astridlaan · 60 fronts · sampled (39 coloured)
- [ ] Lostraat · 59 fronts · todo (4 coloured)
- [ ] Poelsnepstraat · 58 fronts · todo (2 coloured)
- [ ] Patijntjestraat · 57 fronts · todo
- [ ] Reigerstraat · 52 fronts · todo (2 coloured)
- [ ] Prinses Clementinalaan · 49 fronts · partial (1 coloured)
- [ ] Distelstraat · 45 fronts · todo (2 coloured)
- [ ] Désiré Van Monckhovenstraat · 42 fronts · sampled (25 coloured)
- [ ] Prosper Claeysstraat · 39 fronts · sampled (33 coloured)
- [ ] Knokkestraat · 35 fronts · todo (1 coloured)
- [ ] Koning Boudewijnstraat · 35 fronts · sampled (28 coloured, 4 by hand)
- [ ] Monterreystraat · 35 fronts · todo
- [ ] Woeringenstraat · 30 fronts · sampled (24 coloured)
- [ ] Duifhuisstraat · 28 fronts · todo
- [ ] Blankenbergestraat · 26 fronts · todo (3 coloured)
- [ ] Lamoraal van Egmontstraat · 26 fronts · sampled (23 coloured)
- [ ] Handbalstraat · 24 fronts · todo
- [ ] Rijsenbergstraat · 23 fronts · todo (1 coloured)
- [ ] Voskenslaan · 22 fronts · sampled (22 coloured)
- [ ] Hendrik van Brederodestraat · 21 fronts · sampled (20 coloured)
- [ ] Parklaan · 21 fronts · partial (8 coloured)
- [ ] Sperwerstraat · 21 fronts · todo
- [ ] Koningin Elisabethlaan · 19 fronts · partial (7 coloured)
- [ ] Oostendestraat · 19 fronts · todo
- [ ] Roosakker · 18 fronts · todo (2 coloured)
- [ ] Oude Fortweg · 17 fronts · todo (4 coloured)
- [ ] Tenderstraat · 17 fronts · todo (1 coloured)
- [ ] Wiemersdreef · 17 fronts · todo
- [ ] Frans De Potterstraat · 15 fronts · sampled (14 coloured)
- [ ] Hof ter Mere · 13 fronts · todo
- [ ] Fortlaan · 11 fronts · todo
- [ ] Krijgslaan · 10 fronts · sampled (9 coloured)
- [ ] Verpleegstersstraat · 10 fronts · todo
- [ ] Estafetteweg · 8 fronts · todo
- [ ] Golfweg · 6 fronts · todo
- [ ] Vina Bovypark · 6 fronts · todo (3 coloured)
- [ ] Corbiestraat · 4 fronts · todo
- [ ] Achilles Musschestraat · 3 fronts · todo
- [ ] Jozef Cantréstraat · 3 fronts · partial
- [ ] Koningin Maria Hendrikaplein · 3 fronts · sampled (2 coloured)
- [ ] Jemappesstraat · 2 fronts · todo
- [ ] Snepkaai · 2 fronts · todo
- [ ] Vlierstraat · 2 fronts · todo
- [ ] Boentweg · 1 front · todo (1 coloured)
- [ ] Congreslaan · 1 front · todo
- [ ] Marathonstraat · 1 front · todo
- [ ] Onafhankelijkheidslaan · 1 front · todo
- [ ] Paul Bergmansdreef · 1 front · todo
- [ ] Sneppenbrugstraat · 1 front · todo
- [ ] Suzanne Lilarstraat · 1 front · todo

## Sint-Amandsberg

40 streets, 1912 house fronts; 42 done (2%): 42 coloured from photos, 0 drawn by hand.

- **Houses:** besides the ones drawn by hand, they have Ghent's ordinary fronts, in a colour picked by a hash unless coloured from photos.
- **Named on the big map:** Groot Begijnhof

- [ ] Dendermondsesteenweg · 149 fronts · todo (1 coloured)
- [ ] Visserij · 135 fronts · todo
- [ ] Halvemaanstraat · 124 fronts · todo (7 coloured)
- [ ] Nijverheidstraat · 110 fronts · todo
- [ ] Kunstenaarstraat · 109 fronts · todo
- [ ] Toekomststraat · 100 fronts · todo
- [ ] Groot Begijnhof · 74 fronts · todo
- [ ] Serafijnstraat · 71 fronts · todo (4 coloured)
- [ ] Beeldhouwersstraat · 65 fronts · todo
- [ ] Wittemolenstraat · 64 fronts · todo
- [ ] Jean Béthunestraat · 63 fronts · todo
- [ ] Nieuwhof · 59 fronts · todo (11 coloured)
- [ ] Heilig-Hartstraat · 55 fronts · todo
- [ ] Antwerpsesteenweg · 53 fronts · todo (6 coloured)
- [ ] Brusselsepoortstraat · 52 fronts · todo (1 coloured)
- [ ] Bouwmeestersstraat · 50 fronts · todo
- [ ] Alphonse de Hollainhof · 47 fronts · todo (3 coloured)
- [ ] Blijde-Inkomststraat · 45 fronts · todo
- [ ] Krevelstraat · 45 fronts · todo
- [ ] Brunaustraat · 40 fronts · todo (2 coloured)
- [ ] Ommegangstraat · 36 fronts · todo
- [ ] Joseph Gérardstraat · 35 fronts · todo
- [ ] Klinkkouterstraat · 35 fronts · todo
- [ ] Doornakkerstraat · 34 fronts · todo
- [ ] Banierstraat · 33 fronts · todo (3 coloured)
- [ ] Schildersstraat · 33 fronts · todo
- [ ] Evarist De Buckstraat · 32 fronts · todo
- [ ] Hendrik Waelputstraat · 24 fronts · todo (1 coloured)
- [ ] Ambachtstraat · 22 fronts · todo
- [ ] Sint-Clarastraat · 21 fronts · todo
- [ ] Neringstraat · 19 fronts · todo (2 coloured)
- [ ] Verbindingstraat · 19 fronts · todo
- [ ] Louis Cloquetstraat · 17 fronts · todo (1 coloured)
- [ ] Ververijstraat · 12 fronts · todo
- [ ] Louis Schuermanstraat · 10 fronts · todo
- [ ] Heernisplein · 9 fronts · todo
- [ ] Schoolstraat · 8 fronts · todo
- [ ] Achterstraat · 1 front · todo
- [ ] Tienmeterstraat · 1 front · todo
- [ ] Visitatiestraat · 1 front · todo

## Dampoort

36 streets, 1851 house fronts; 1227 done (66%): 1227 coloured from photos, 0 drawn by hand.

- **Houses:** besides the ones drawn by hand, they have Ghent's ordinary fronts, in a colour picked by a hash unless coloured from photos.
- **Monuments:** Station Gent-Dampoort
- **Named on the big map:** Publiek, Koning Albertpark, Klein Begijnhof Gent

- [ ] Lange Violettestraat · 197 fronts · sampled (143 coloured)
- [ ] Karperstraat · 153 fronts · sampled (112 coloured)
- [ ] Spijkstraat · 118 fronts · sampled (98 coloured)
- [ ] Reginald Warnefordstraat · 106 fronts · sampled (58 coloured)
- [ ] Wasstraat · 99 fronts · partial (43 coloured)
- [ ] Snoekstraat · 92 fronts · sampled (46 coloured)
- [ ] Biekorfstraat · 90 fronts · sampled (69 coloured)
- [ ] Engelbert van Arenbergstraat · 89 fronts · sampled (62 coloured)
- [ ] Lozevisserstraat · 88 fronts · sampled (57 coloured)
- [ ] Spitaalpoortstraat · 85 fronts · sampled (55 coloured)
- [ ] Dampoortstraat · 79 fronts · sampled (60 coloured)
- [ ] Tarbotstraat · 79 fronts · sampled (54 coloured)
- [ ] Kogelstraat · 60 fronts · sampled (44 coloured)
- [ ] Hubert Frère-Orbanlaan · 50 fronts · sampled (36 coloured)
- [ ] Karel Antheunisstraat · 50 fronts · sampled (37 coloured)
- [ ] Zeemstraat · 41 fronts · sampled (36 coloured)
- [ ] Tweebruggenstraat · 32 fronts · sampled (19 coloured)
- [ ] Voorhoutkaai · 29 fronts · partial (10 coloured)
- [ ] Land van Waaslaan · 28 fronts · sampled (23 coloured)
- [ ] Nieuwewijkstraat · 26 fronts · sampled (16 coloured)
- [ ] Vijfwindgatenstraat · 26 fronts · sampled (14 coloured)
- [ ] Wespstraat · 26 fronts · partial (7 coloured)
- [ ] Sint-Annastraat · 25 fronts · sampled (20 coloured)
- [ ] Keizer Leopoldstraat · 24 fronts · partial (8 coloured)
- [ ] Tinkstraat · 23 fronts · partial (11 coloured)
- [ ] Clarissenstraat · 20 fronts · sampled (12 coloured)
- [ ] Antwerpenplein · 18 fronts · partial (6 coloured)
- [ ] Nieuwbrugkaai · 18 fronts · sampled (13 coloured)
- [ ] Pilorijnstraat · 17 fronts · sampled (15 coloured)
- [ ] Tongstraat · 15 fronts · sampled (15 coloured)
- [ ] Filips Benthuysstraat · 13 fronts · partial (6 coloured)
- [ ] Sint-Joriskaai · 13 fronts · sampled (9 coloured)
- [ ] Jan van Gentstraat · 11 fronts · sampled (8 coloured)
- [ ] Rodetorenkaai · 7 fronts · sampled (5 coloured)
- [ ] Koning Willem I-kaai · 3 fronts · partial
- [ ] Joremaaie · 1 front · partial

## Watersportbaan - Ekkergem

53 streets, 1374 house fronts; 8 done (1%): 8 coloured from photos, 0 drawn by hand.

- **Houses:** besides the ones drawn by hand, they have Ghent's ordinary fronts, in a colour picked by a hash unless coloured from photos.
- **Monuments:** Uitkijktoren Karel Sabbeberg, Le Beach House
- **Tour sights:** Blaarmeersen, Karel Sabbeberg, De Rechtvaardige Rechters — gevonden!
- **Named on the big map:** Campus Dunant, Campus Mercator, Hoger Instituut voor Lichamelijke Opvoeding, Sint-Martinuskerk, Blaarmeersen, Watersportbaan, AZ Jan Palfijn

- [ ] Ekkergemstraat · 94 fronts · todo (1 coloured)
- [ ] Krijgsgasthuisstraat · 86 fronts · todo (1 coloured)
- [ ] Bijlokevest · 84 fronts · todo
- [ ] Spiegelhofstraat · 78 fronts · todo (1 coloured)
- [ ] Raas van Gaverestraat · 74 fronts · todo
- [ ] Aannemersstraat · 68 fronts · todo
- [ ] Rozemarijnstraat · 64 fronts · todo
- [ ] Rijkeklarenstraat · 52 fronts · todo
- [ ] Martelaarslaan · 49 fronts · todo
- [ ] Pijlstraat · 49 fronts · todo
- [ ] Koolkapperstraat · 48 fronts · todo
- [ ] Karel Lodewijk Dierickxstraat · 43 fronts · todo
- [ ] Groot-Brittanniëlaan · 42 fronts · todo
- [ ] Gordunakaai · 40 fronts · todo
- [ ] Wintertuinstraat · 39 fronts · todo
- [ ] Brankardierstraat · 38 fronts · todo
- [ ] Jan-Baptist Boterdaelestraat · 38 fronts · todo
- [ ] Korenbloemstraat · 33 fronts · todo
- [ ] Halfweg · 32 fronts · todo
- [ ] Bassijnstraat · 31 fronts · todo
- [ ] Heilig-Bloedstraat · 31 fronts · todo
- [ ] Rokerelsstraat · 30 fronts · todo
- [ ] Bijlokemeers · 23 fronts · todo
- [ ] Abdisstraat · 22 fronts · todo
- [ ] Sint-Martensblindeken · 21 fronts · todo
- [ ] Wolterslaan · 21 fronts · todo
- [ ] Guldenmeers · 19 fronts · todo
- [ ] Nonnemeersstraat · 13 fronts · todo
- [ ] Bijlokehof · 12 fronts · todo (1 coloured)
- [ ] Offerlaan · 11 fronts · todo
- [ ] Kruisboogstraat · 10 fronts · todo
- [ ] Jan Delvinlaan · 8 fronts · todo
- [ ] Emile Moysonlaan · 7 fronts · todo
- [ ] Henri Dunantlaan · 7 fronts · todo
- [ ] Alfred Vanderstegenlaan · 6 fronts · todo
- [ ] Bijlokestraat · 6 fronts · todo
- [ ] Groot-Brittanniëhof · 5 fronts · todo
- [ ] Waarschootstraat · 5 fronts · todo (1 coloured)
- [ ] Iepensteeg · 4 fronts · todo (2 coloured)
- [ ] Jubileumlaan · 4 fronts · todo
- [ ] Neermeerskaai · 4 fronts · todo
- [ ] Pontstraat · 4 fronts · todo
- [ ] Skiweg · 4 fronts · todo
- [ ] Beneluxplein · 3 fronts · todo
- [ ] Godshuizenlaan · 2 fronts · todo
- [ ] Maagd van Gentstraat · 2 fronts · todo
- [ ] Maurice De Weertstraat · 2 fronts · todo (1 coloured)
- [ ] Aan de Bocht · 1 front · todo
- [ ] Campinglaan · 1 front · todo
- [ ] Charles Andrieslaan · 1 front · todo
- [ ] Europalaan · 1 front · todo
- [ ] Nekkersberglaan · 1 front · todo
- [ ] Westerlaan · 1 front · todo

## Macharius - Heirnis

28 streets, 1091 house fronts; 19 done (2%): 19 coloured from photos, 0 drawn by hand.

- **Houses:** besides the ones drawn by hand, they have Ghent's ordinary fronts, in a colour picked by a hash unless coloured from photos.
- **Named on the big map:** Sint-Macharius, Sint-Baafsabdij

- [ ] Eendrachtstraat · 131 fronts · todo
- [ ] Ossenstraat · 104 fronts · todo
- [ ] Zalmstraat · 99 fronts · todo
- [ ] Forelstraat · 91 fronts · todo (10 coloured)
- [ ] Kasteellaan · 90 fronts · todo
- [ ] Lucas Munichstraat · 68 fronts · todo
- [ ] Kazemattenstraat · 65 fronts · todo
- [ ] Puinstraat · 54 fronts · todo
- [ ] Ooilamstraat · 45 fronts · todo (1 coloured)
- [ ] Heernislaan · 44 fronts · todo
- [ ] Paardestraat · 37 fronts · todo
- [ ] Hagelandkaai · 36 fronts · todo (5 coloured)
- [ ] Slachthuisstraat · 36 fronts · todo (1 coloured)
- [ ] Sint-Machariusstraat · 33 fronts · todo
- [ ] Buitenhof · 28 fronts · todo
- [ ] Stierstraat · 20 fronts · todo
- [ ] Schoolkaai · 18 fronts · todo
- [ ] Spaanskasteelplein · 17 fronts · todo
- [ ] Kasterbant · 15 fronts · todo
- [ ] Gandastraat · 12 fronts · todo
- [ ] Rommelwaterpark · 12 fronts · todo
- [ ] Sint-Baafsdorp · 12 fronts · todo
- [ ] Spanjaardstraat · 11 fronts · todo (2 coloured)
- [ ] Bastionstraat · 3 fronts · todo
- [ ] Denderlaan · 3 fronts · todo
- [ ] Oostenrijkersstraat · 3 fronts · todo
- [ ] Prooststraat · 3 fronts · todo
- [ ] Kapelaanstraat · 1 front · todo

## Ledeberg

34 streets, 932 house fronts; 6 done (1%): 6 coloured from photos, 0 drawn by hand.

- **Houses:** besides the ones drawn by hand, they have Ghent's ordinary fronts, in a colour picked by a hash unless coloured from photos.

- [ ] Sint-Lievenspoortstraat · 80 fronts · todo (2 coloured)
- [ ] Auguste Van Ooststraat · 72 fronts · todo
- [ ] Olifantstraat · 61 fronts · todo
- [ ] Dwarsstraat · 52 fronts · todo
- [ ] Keizervest · 48 fronts · todo
- [ ] Hogepontstraat · 45 fronts · todo
- [ ] Edward Pynaertkaai · 43 fronts · todo
- [ ] Sasstraat · 43 fronts · todo
- [ ] Posthoornstraat · 42 fronts · todo
- [ ] Neerscheldestraat · 40 fronts · todo
- [ ] Frans Spaestraat · 39 fronts · todo
- [ ] Zebrastraat · 35 fronts · todo
- [ ] Maria van Boergondiëstraat · 30 fronts · todo
- [ ] Filips de Goedekaai · 23 fronts · todo
- [ ] Kreeftstraat · 22 fronts · todo (3 coloured)
- [ ] Sint-Lievenslaan · 22 fronts · todo
- [ ] Rosa Geingerstraat · 21 fronts · todo
- [ ] Fransevaart · 20 fronts · todo
- [ ] Vlaamsekaai · 20 fronts · todo
- [ ] Edward Blaesstraat · 19 fronts · todo
- [ ] Zakstraat · 19 fronts · todo
- [ ] Scheldekaai · 18 fronts · todo
- [ ] Irene Van Der Brachtstraat · 17 fronts · todo
- [ ] Gustaaf Callierlaan · 16 fronts · todo
- [ ] Raveschootstraat · 16 fronts · todo
- [ ] Jan Rijmstraat · 14 fronts · todo
- [ ] Onderwijsstraat · 14 fronts · todo
- [ ] Henri-Joseph Reystraat · 12 fronts · todo
- [ ] Sint-Lievensdoorgang · 10 fronts · todo (1 coloured)
- [ ] Irma Lozinstraat · 8 fronts · todo
- [ ] Kruitmagazijnstraat · 7 fronts · todo
- [ ] Achtervisserij · 2 fronts · todo
- [ ] Bisschopstraat · 1 front · todo
- [ ] Emiel Hullebroeckplein · 1 front · todo

## Oud Gentbrugge

8 streets, 295 house fronts; 0 done (0%): 0 coloured from photos, 0 drawn by hand.

- **Houses:** besides the ones drawn by hand, they have Ghent's ordinary fronts, in a colour picked by a hash unless coloured from photos.

- [ ] Kerkstraat · 81 fronts · todo
- [ ] Louis Van Houttestraat · 68 fronts · todo
- [ ] August Van Bockxstaelestraat · 38 fronts · todo
- [ ] Arthur Latourstraat · 35 fronts · todo
- [ ] Louis De Smetstraat · 28 fronts · todo
- [ ] Oude Brusselseweg · 22 fronts · todo
- [ ] Brusselsesteenweg · 19 fronts · todo
- [ ] Kleemburg · 4 fronts · todo

## Muide - Meulestede - Afrikalaan

20 streets, 262 house fronts; 1 done (0%): 1 coloured from photos, 0 drawn by hand.

- **Houses:** besides the ones drawn by hand, they have Ghent's ordinary fronts, in a colour picked by a hash unless coloured from photos.
- **Monuments:** Route du Soleil, Dok Noord, AEG

- [ ] Voormuide · 62 fronts · todo
- [ ] Sassekaai · 42 fronts · todo
- [ ] Justus de Harduwijnlaan · 36 fronts · todo
- [ ] Bevelandstraat · 27 fronts · todo
- [ ] Scheepvaartstraat · 17 fronts · todo
- [ ] Millinocketstraat · 15 fronts · todo
- [ ] Gasmeterlaan · 12 fronts · todo (1 coloured)
- [ ] Dok-Noord · 8 fronts · todo
- [ ] Muidelaan · 8 fronts · todo
- [ ] Overreke · 8 fronts · todo
- [ ] Tolhuiskaai · 8 fronts · todo
- [ ] Galeipad · 4 fronts · todo
- [ ] Kompasplein · 4 fronts · todo
- [ ] Korte Sint-Salvatorstraat · 3 fronts · todo
- [ ] Neuseplein · 3 fronts · todo
- [ ] Afrikalaan · 1 front · todo
- [ ] Atlantastraat · 1 front · todo
- [ ] Galjoenstraat · 1 front · todo
- [ ] Terneuzenlaan · 1 front · todo
- [ ] Wiedauwkaai · 1 front · todo
