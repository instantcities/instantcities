// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [531, -288, 3], [509, -269, 16], [491, -244], [461, -245], [458, -246], [429, -254], [399, -263], [370, -274],
    [347, -294], [324, -314], [301, -334], [278, -355], [256, -374], [253, -374], [233, -350], [215, -323],
    [198, -297], [181, -271], [165, -245], [149, -219], [132, -193], [106, -177], [76, -165], [57, -163],
    [43, -190], [27, -211], [-5, -211], [-19, -236], [-14, -258], [-43, -271], [-74, -278], [-105, -282],
    [-138, -285], [-168, -290], [-199, -294], [-215, -289], [-241, -272], [-269, -261], [-288, -281], [-303, -307],
    [-319, -332], [-334, -358], [-350, -384], [-365, -410], [-381, -436], [-396, -463], [-415, -486], [-443, -470],
    [-469, -454], [-500, -459], [-530, -464], [-554, -465], [-563, -434], [-569, -405], [-575, -375], [-581, -345],
    [-583, -331], [-589, -301], [-595, -271], [-601, -241], [-607, -212], [-613, -182], [-619, -152], [-625, -123],
    [-617, -92], [-597, -68], [-577, -45], [-565, -32], [-545, -9], [-524, 13], [-504, 36], [-484, 58],
    [-464, 81], [-444, 103], [-424, 126], [-404, 148], [-384, 171], [-364, 194], [-344, 216], [-324, 239],
    [-304, 261], [-284, 284], [-264, 306], [-243, 329], [-223, 351], [-201, 374], [-198, 376], [-169, 386],
    [-140, 396], [-112, 405], [-80, 416], [-49, 426], [-21, 436], [11, 446], [39, 456], [71, 466],
    [102, 477], [133, 485], [146, 484], [158, 454], [168, 425], [178, 397], [188, 369], [198, 340],
    [209, 319], [219, 291], [226, 266], [218, 237], [207, 209], [196, 180], [183, 151], [161, 131],
    [148, 103], [139, 73], [134, 47], [159, 26], [179, 1], [196, -24], [213, -49], [233, -74],
    [262, -60], [288, -45], [314, -31], [341, -16], [366, 2], [381, 18], [407, 24], [410, 23],
    [440, 32], [463, 41], [492, 50], [521, 59], [551, 65], [562, 35], [574, 5], [583, -23],
    [594, -54], [604, -84], [603, -89], [590, -103], [598, -135], [606, -164], [609, -183], [604, -189],
    [616, -217], [623, -246], [596, -259], [568, -271], [540, -284], [531, -288],
  ],
  stops: [
    {
      emoji: '🕯️', at: [301, -334], look: [286, 6, -336],
      text: {
        en: { name: 'Graben', text: 'Vienna’s grand shopping street, with the Plague Column of 1693 in the middle.' },
        nl: { name: 'Graben', text: 'De deftige winkelstraat van Wenen, met in het midden de pestzuil uit 1693.' },
      },
    },
    {
      emoji: '👑', at: [-19, -236], look: [-2, 6, -239],
      text: {
        en: { name: 'Hofburg', text: 'The Habsburgs’ winter palace for six centuries. The Spanish Riding School is inside.' },
        nl: { name: 'Hofburg', text: 'Zes eeuwen lang het winterpaleis van de Habsburgers. De Spaanse Rijschool zit binnen.' },
      },
    },
    {
      emoji: '🎶', at: [168, 425], look: [240, 6, 452],
      text: {
        en: { name: 'State Opera', text: 'Opened in 1869, the first great building on the Ringstraße.' },
        nl: { name: 'Staatsopera', text: 'Geopend in 1869, het eerste grote gebouw aan de Ringstraße.' },
      },
    },
    {
      emoji: '🖼️', at: [207, 209], look: [156, 6, 244],
      text: {
        en: { name: 'Albertina', text: 'A Habsburg palace with one of the largest collections of prints and drawings in the world.' },
        nl: { name: 'Albertina', text: 'Een paleis van de Habsburgers met een van de grootste verzamelingen prenten en tekeningen ter wereld.' },
      },
    },
    {
      emoji: '⛪', at: [623, -246], look: [620, 30, -308],
      text: {
        en: { name: 'Stephansdom', text: 'St Stephen’s Cathedral: a south tower of 136 metres and a roof of glazed tiles in zigzags.' },
        nl: { name: 'Stephansdom', text: 'De Sint-Stefanuskathedraal: een zuidtoren van 136 meter en een dak van geglazuurde pannen in zigzag.' },
      },
    },
  ],
  // it sets off at night (core/js/main.js), it is day as soon as it is on its way, and evening at the end
  skies: [
    { at: [461, -245], sky: 'day:clear' },
    { at: [551, 65], sky: 'night:clear' },
  ],
  end: { look: [620, 15, -308] },
  names: [
    { name: 'Stephansplatz', at: [531, -288] },
    { name: 'Stock-im-Eisen-Platz', at: [509, -269] },
    { name: 'Graben', at: [458, -246] },
    { name: 'Habsburgergasse', at: [253, -374] },
    { name: 'Reitschulgasse', at: [57, -163] },
    { name: 'Michaelerplatz', at: [27, -211] },
    { name: 'Schauflergasse', at: [-14, -258] },
    { name: 'Ballhausplatz', at: [-215, -289] },
    { name: 'Löwelstraße', at: [-288, -281] },
    { name: 'Josef-Meinrad-Platz', at: [-415, -486] },
    { name: 'Universitätsring', at: [-554, -465] },
    { name: 'Dr.-Karl-Renner-Ring', at: [-583, -331] },
    { name: 'Burgring', at: [-565, -32] },
    { name: 'Opernring', at: [-198, 376] },
    { name: 'Operngasse', at: [146, 484] },
    { name: 'Albertinaplatz', at: [209, 319] },
    { name: 'Augustinerstraße', at: [226, 266] },
    { name: 'Dorotheergasse', at: [134, 47] },
    { name: 'Plankengasse', at: [233, -74] },
    { name: 'Neuer Markt', at: [381, 18] },
    { name: 'Donnergasse', at: [410, 23] },
    { name: 'Himmelpfortgasse', at: [463, 41] },
    { name: 'Rauhensteingasse', at: [551, 65] },
    { name: 'Weihburggasse', at: [603, -89] },
    { name: 'Liliengasse', at: [590, -103] },
    { name: 'Singerstraße', at: [609, -183] },
    { name: 'Churhausgasse', at: [604, -189] },
  ],
};
