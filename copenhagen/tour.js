// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [394, -449, 3], [421, -436, 16], [448, -422], [475, -409], [470, -381], [464, -361], [491, -346], [521, -332],
    [548, -319], [576, -306], [603, -294], [630, -281], [657, -268], [684, -255], [712, -242], [739, -229],
    [766, -216], [782, -207], [771, -176], [758, -149], [746, -121], [733, -93], [708, -75], [680, -64],
    [652, -52], [624, -41], [596, -30], [568, -19], [540, -8], [512, 4], [484, 14], [456, 25],
    [427, 35], [404, 44], [376, 60], [348, 72], [320, 83], [292, 95], [265, 107], [235, 119],
    [204, 124], [176, 136], [148, 149], [121, 162], [110, 171], [94, 190], [78, 200], [51, 185],
    [27, 166], [2, 147], [-23, 130], [-48, 113], [-73, 96], [-98, 79], [-106, 74], [-136, 78],
    [-165, 89], [-192, 103], [-219, 120], [-245, 137], [-269, 158], [-289, 180], [-310, 203], [-331, 226],
    [-350, 251], [-366, 277], [-384, 301], [-398, 313], [-423, 332], [-448, 350], [-473, 367], [-498, 385],
    [-523, 402], [-548, 419], [-573, 436], [-598, 454], [-623, 471], [-639, 482], [-662, 462], [-684, 441],
    [-707, 421], [-729, 400], [-751, 380], [-774, 360], [-782, 346], [-758, 325], [-733, 308], [-708, 290],
    [-683, 273], [-658, 255], [-633, 238], [-618, 228], [-592, 211], [-566, 194], [-540, 178], [-513, 162],
    [-486, 146], [-462, 124], [-454, 113], [-472, 87], [-491, 63], [-504, 44], [-483, 22], [-459, 2],
    [-455, -5], [-470, -30], [-488, -55], [-506, -81], [-508, -98], [-476, -98], [-445, -94], [-414, -92],
    [-393, -94], [-362, -97], [-330, -98], [-298, -99], [-268, -103], [-239, -111], [-209, -119], [-180, -126],
    [-151, -134], [-121, -142], [-113, -145], [-84, -154], [-55, -163], [-26, -173], [3, -182], [32, -195],
    [61, -209], [87, -225], [114, -241], [141, -259], [168, -274], [178, -284], [171, -314], [163, -343],
    [159, -366], [189, -379], [218, -388], [248, -397], [277, -406], [295, -413], [307, -444], [320, -474],
    [346, -473], [373, -460], [394, -449],
  ],
  stops: [
    {
      emoji: '⛵', at: [684, -255], look: [693, 6, -258],
      text: {
        en: { name: 'Nyhavn', text: 'The 17th-century harbour of coloured houses. Hans Christian Andersen lived at numbers 18, 20 and 67.' },
        nl: { name: 'Nyhavn', text: 'De haven uit de 17de eeuw met haar gekleurde huizen. Hans Christian Andersen woonde op de nummers 18, 20 en 67.' },
      },
    },
    {
      emoji: '🐉', at: [94, 190], look: [159, 30, 309],
      text: {
        en: { name: 'Børsen', text: 'Christian IV’s stock exchange, with a spire of four dragons’ tails twisted together. It fell in a fire in 2024 and is being built again.' },
        nl: { name: 'Børsen', text: 'De beurs van Christiaan IV, met een spits van vier ineengedraaide drakenstaarten. Die viel bij een brand in 2024 en wordt heropgebouwd.' },
      },
    },
    {
      emoji: '🏛️', at: [-23, 130], look: [-92, 30, 254],
      text: {
        en: { name: 'Christiansborg', text: 'The palace on Slotsholmen that holds the parliament, the prime minister’s office and the supreme court.' },
        nl: { name: 'Christiansborg', text: 'Het paleis op Slotsholmen met het parlement, het kantoor van de premier en het hooggerechtshof.' },
      },
    },
    {
      emoji: '⛲', at: [-180, -126], look: [-170, 6, -92],
      text: {
        en: { name: 'Amagertorv', text: 'The middle of the Strøget, one of the longest shopping streets in Europe, with the Stork Fountain.' },
        nl: { name: 'Amagertorv', text: 'Het midden van de Strøget, een van de langste winkelstraten van Europa, met de ooievaarsfontein.' },
      },
    },
  ],
  end: { look: [693, 15, -258] },
  names: [
    { name: 'Kongens Nytorv', at: [394, -449] },
    { name: 'Nyhavn', at: [464, -361] },
    { name: 'Holbergsgade', at: [782, -207] },
    { name: 'Holmens Kanal', at: [404, 44] },
    { name: 'Holmens Bro', at: [110, 171] },
    { name: 'Børsgade', at: [78, 200] },
    { name: 'Vindebrogade', at: [-106, 74] },
    { name: 'Stormgade', at: [-398, 313] },
    { name: 'Vester Voldgade', at: [-639, 482] },
    { name: 'Farvergade', at: [-782, 346] },
    { name: 'Kompagnistræde', at: [-618, 228] },
    { name: 'Knabrostræde', at: [-454, 113] },
    { name: 'Brolæggerstræde', at: [-504, 44] },
    { name: 'Badstuestræde', at: [-455, -5] },
    { name: 'Vimmelskaftet', at: [-508, -98] },
    { name: 'Amagertorv', at: [-393, -94] },
    { name: 'Østergade', at: [-113, -145] },
    { name: 'Ny Østergade', at: [178, -284] },
    { name: 'Hovedvagtsgade', at: [159, -366] },
  ],
};
