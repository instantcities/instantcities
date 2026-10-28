// The tour: a flight along the race route (races.js) over the roofs, then up through the Eixample
// to the Sagrada Família and down to the beach, slowing down at the sights on the way for a card
// about each (in English and Dutch; the other languages show the English), with the name of the
// street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [-400, -687, 3], [-417, -661, 16], [-434, -636], [-451, -610], [-468, -585], [-482, -567], [-509, -552], [-512, -544],
    [-498, -515], [-485, -488], [-471, -460], [-457, -433], [-444, -406], [-428, -377], [-414, -350], [-399, -321],
    [-384, -292], [-369, -265], [-354, -238], [-339, -212], [-320, -189], [-297, -174], [-279, -147], [-261, -119],
    [-244, -91], [-226, -63], [-208, -35], [-189, -12], [-172, 14], [-155, 39], [-138, 65], [-122, 90],
    [-105, 115], [-88, 141], [-71, 166], [-55, 192], [-38, 217], [-22, 242], [-6, 267], [11, 293],
    [27, 318], [44, 346], [64, 371], [83, 395], [97, 423], [111, 450], [126, 476], [140, 503],
    [154, 530], [169, 556], [185, 583], [200, 610], [216, 636], [233, 662], [251, 683], [272, 707],
    [282, 720], [303, 743], [330, 743], [338, 735], [356, 712], [372, 686], [387, 660], [403, 635],
    [419, 609], [435, 583], [451, 557], [466, 531], [476, 505], [449, 490], [422, 477], [399, 460],
    [411, 432], [424, 404], [438, 376], [453, 349], [467, 322], [482, 295], [494, 266], [507, 237],
    [512, 220], [486, 202], [458, 187], [429, 174], [400, 163], [372, 153], [344, 143], [317, 128],
    [289, 114], [262, 101], [235, 84], [208, 70], [182, 55], [158, 37], [135, 16], [120, -6],
    [140, -29], [161, -51], [183, -72], [203, -95], [210, -111], [203, -137], [224, -160], [242, -184],
    [242, -189], [233, -216], [249, -241], [229, -266], [229, -271], [249, -296], [250, -304], [227, -328],
    [203, -350], [180, -371], [166, -384], [142, -401], [140, -399], [119, -376], [100, -358], [81, -339],
    [66, -341], [45, -363], [28, -381], [2, -398], [-24, -417], [-49, -437], [-63, -434], [-85, -457],
    [-102, -484], [-122, -510], [-143, -531], [-166, -554], [-187, -578], [-208, -600], [-228, -623], [-249, -646],
    [-270, -668], [-290, -691], [-311, -713], [-321, -742], [-324, -742], [-350, -739], [-367, -731], [-387, -707],
    [-400, -687],
    // on up Passeig de Gràcia and across the Eixample to the Sagrada Família, round it, and down past
    // the Arc de Triomf and over the Ciutadella to the sea, along the beach of Barceloneta
    [-568, -744, 30], [-585, -769], [-602, -794], [-606, -815], [-579, -828], [-552, -842],
    [-525, -856], [-498, -868], [-501, -893], [-522, -915], [-543, -937], [-564, -959], [-585, -981],
    [-606, -1004], [-628, -1027], [-654, -1044], [-681, -1058], [-700, -1082], [-711, -1112],
    [-730, -1136], [-750, -1158], [-771, -1180], [-791, -1202], [-812, -1224], [-833, -1246],
    [-853, -1268], [-874, -1290], [-894, -1312], [-915, -1334], [-935, -1356], [-956, -1378],
    [-976, -1400], [-997, -1422], [-1017, -1444], [-1038, -1466], [-1058, -1488], [-1079, -1510],
    [-1099, -1533], [-1119, -1555], [-1121, -1581], [-1100, -1605], [-1079, -1627], [-1058, -1648],
    [-1037, -1669], [-1015, -1691], [-1002, -1716], [-979, -1740], [-957, -1761], [-934, -1784],
    [-910, -1807], [-889, -1828], [-865, -1851], [-844, -1873], [-822, -1895], [-800, -1917],
    [-778, -1938], [-755, -1961], [-734, -1982], [-713, -2004], [-690, -2028], [-667, -2051],
    [-644, -2075], [-622, -2096], [-601, -2117], [-579, -2138], [-558, -2160], [-536, -2181],
    [-514, -2203], [-493, -2225], [-471, -2247], [-449, -2268], [-428, -2289], [-406, -2311],
    [-384, -2332], [-367, -2355], [-346, -2377], [-324, -2399], [-303, -2420], [-281, -2442],
    [-259, -2463], [-237, -2484], [-216, -2506], [-193, -2529], [-172, -2551], [-149, -2574],
    [-128, -2595], [-105, -2619], [-84, -2640], [-60, -2664], [-39, -2685], [-18, -2706], [4, -2727],
    [25, -2749], [46, -2770], [45, -2802], [23, -2825, 60], [1, -2847], [-21, -2868], [-34, -2892],
    [-56, -2914], [-82, -2927], [-104, -2948], [-125, -2970], [-147, -2991], [-176, -2993],
    [-178, -2991], [-192, -2919], [-144, -2875], [-84, -2849], [-19, -2845], [44, -2864], [96, -2903],
    [133, -2957], [148, -3020], [142, -3085], [114, -3144], [131, -3083], [147, -3022], [164, -2960],
    [180, -2899], [197, -2838], [214, -2777], [230, -2715], [247, -2654], [263, -2593], [280, -2532],
    [297, -2470], [313, -2409], [330, -2348], [346, -2287], [363, -2225], [380, -2164], [396, -2103],
    [413, -2042], [429, -1981], [446, -1919], [463, -1858], [479, -1797], [496, -1736], [512, -1674],
    [529, -1613], [546, -1552], [562, -1491], [579, -1429], [595, -1368], [612, -1307, 46],
    [653, -1265], [694, -1224], [735, -1182], [776, -1141], [817, -1099], [858, -1058], [899, -1016],
    [940, -975], [981, -933], [1022, -892], [1063, -850], [1104, -809], [1145, -767], [1186, -726],
    [1227, -684], [1268, -643], [1309, -601], [1350, -560], [1407, -545], [1464, -530], [1521, -515],
    [1578, -499], [1635, -484], [1692, -469], [1749, -454], [1806, -439], [1863, -424], [1920, -409],
    [1977, -394], [2034, -378], [2091, -363], [2148, -348], [2205, -333], [2262, -318, 18],
    [2240, -276], [2218, -235], [2196, -193], [2174, -152], [2152, -110], [2130, -69], [2108, -27],
    [2086, 15], [2064, 56], [2042, 98], [2020, 139], [1998, 181], [1976, 222], [1954, 264],
    [1934, 304], [1915, 344], [1895, 384], [1875, 424], [1856, 464], [1836, 504], [1817, 544],
    [1797, 583], [1777, 623], [1758, 663], [1738, 703], [1718, 743], [1699, 783], [1679, 823],
    [1667, 863], [1655, 903], [1643, 942], [1631, 982], [1619, 1022], [1607, 1062], [1594, 1101],
    [1582, 1141], [1570, 1181], [1558, 1221], [1546, 1260], [1534, 1300, 6],
  ],
  stops: [
    {
      emoji: '🎭', at: [-105, 115], look: [-129, 6, 144],
      text: {
        en: { name: 'Liceu', text: 'The opera house on the Rambla, opened in 1847 and built again after a fire in 1994.' },
        nl: { name: 'Liceu', text: 'Het operahuis aan de Rambla, geopend in 1847 en opnieuw opgebouwd na een brand in 1994.' },
      },
    },
    {
      emoji: '🌴', at: [-22, 242], look: [48, 6, 213],
      text: {
        en: { name: 'Plaça Reial', text: 'An arcaded square with palm trees, and street lamps designed by a young Antoni Gaudí.' },
        nl: { name: 'Plaça Reial', text: 'Een plein met arcades en palmbomen, en straatlantaarns ontworpen door een jonge Antoni Gaudí.' },
      },
    },
    {
      emoji: '🧭', at: [330, 743], look: [320, 30, 808],
      text: {
        en: { name: 'Monument a Colom', text: 'Columbus on top of a 60-metre column at the bottom of the Rambla, pointing out to sea.' },
        nl: { name: 'Monument a Colom', text: 'Columbus boven op een zuil van 60 meter onderaan de Rambla, met zijn vinger naar zee.' },
      },
    },
    {
      emoji: '🏛️', at: [224, -160], look: [236, 6, -146],
      text: {
        en: { name: 'Plaça de Sant Jaume', text: 'The government of Catalonia and the city hall of Barcelona face each other here, where the Roman forum was.' },
        nl: { name: 'Plaça de Sant Jaume', text: 'De regering van Catalonië en het stadhuis van Barcelona kijken elkaar hier aan, waar het Romeinse forum lag.' },
      },
    },
    {
      emoji: '⛪', at: [180, -371], look: [152, 30, -326],
      text: {
        en: { name: 'Catedral', text: 'The Gothic cathedral of Santa Eulàlia. Thirteen white geese live in its cloister, one for each year of the young saint’s life.' },
        nl: { name: 'Catedral', text: 'De gotische kathedraal van Santa Eulàlia. In de kloostergang leven dertien witte ganzen, een voor elk jaar van de jonge heilige.' },
      },
    },
    {
      emoji: '🦎', at: [-997, -1422], look: [-1022, 20, -1383],
      text: {
        en: { name: 'Casa Batlló', text: 'A house on Passeig de Gràcia that Gaudí rebuilt in 1904-06, with balconies like masks and a roof like the back of a dragon.' },
        nl: { name: 'Casa Batlló', text: 'Een huis aan de Passeig de Gràcia dat Gaudí in 1904-06 verbouwde, met balkons als maskers en een dak als de rug van een draak.' },
      },
    },
    {
      emoji: '⛪', at: [-21, -2868], look: [-41, 90, -3034],
      text: {
        en: { name: 'Sagrada Família', text: 'Gaudí’s basilica, begun in 1882 and still being built. With its cross, the tower of Jesus in the middle is 172.5 metres high, which makes it the tallest church in the world.' },
        nl: { name: 'Sagrada Família', text: 'De basiliek van Gaudí, begonnen in 1882 en nog altijd in aanbouw. Met zijn kruis is de toren van Jezus in het midden 172,5 meter hoog: de hoogste kerk ter wereld.' },
      },
    },
    {
      emoji: '🧱', at: [612, -1307], look: [612, 10, -1307],
      text: {
        en: { name: 'Arc de Triomf', text: 'A gateway of red brick, built as the entrance to the World Exhibition of 1888 in the Parc de la Ciutadella.' },
        nl: { name: 'Arc de Triomf', text: 'Een poort van rode baksteen, gebouwd als ingang van de Wereldtentoonstelling van 1888 in het Parc de la Ciutadella.' },
      },
    },
    {
      emoji: '🏖️', at: [1954, 264], look: [2150, 0, 330],
      text: {
        en: { name: 'Platja de la Barceloneta', text: 'The city’s beach, below the old fishermen’s quarter of Barceloneta. Its sand was brought in for the Olympic Games of 1992.' },
        nl: { name: 'Platja de la Barceloneta', text: 'Het strand van de stad, onder de oude vissersbuurt Barceloneta. Het zand werd aangevoerd voor de Olympische Spelen van 1992.' },
      },
    },
  ],
  // a clear day from the start, and night only near the end
  skies: [
    { at: [-451, -610], sky: 'day:clear' },
    { at: [1679, 823], sky: 'night:clear' },
  ],
  end: { look: [2200, 0, 1100] },
  names: [
    { name: 'Plaça de Catalunya', at: [-400, -687] },
    { name: 'Carrer de Pelai', at: [-482, -567] },
    { name: 'La Rambla', at: [-512, -544] },
    { name: 'Plaça del Portal de la Pau', at: [282, 720] },
    { name: 'Passeig de Colom', at: [338, 735] },
    { name: 'Plaça del Duc de Medinaceli', at: [476, 505] },
    { name: 'Carrer Ample', at: [399, 460] },
    { name: 'Carrer d’Avinyó', at: [512, 220] },
    { name: 'Carrer de Ferran', at: [120, -6] },
    { name: 'Plaça de Sant Jaume', at: [210, -111] },
    { name: 'Carrer del Paradís', at: [242, -189] },
    { name: 'Carrer de la Pietat', at: [229, -271] },
    { name: 'Carrer dels Comtes', at: [250, -304] },
    { name: 'Pla de la Seu', at: [166, -384] },
    { name: 'Avinguda de la Catedral', at: [140, -399] },
    { name: 'Carrer dels Arcs', at: [28, -381] },
    { name: 'Avinguda del Portal de l’Àngel', at: [-63, -434] },
    { name: 'Carrer de Fontanella', at: [-324, -742] },
    { name: 'Passeig de Gràcia', at: [-498, -868] },
    { name: 'Carrer de València', at: [-1121, -1581] },
    { name: 'Carrer de Sardenya', at: [45, -2802] },
    { name: 'Passeig de Lluís Companys', at: [612, -1307] },
    { name: 'Passeig Marítim de la Barceloneta', at: [2262, -318] },
  ],
};
