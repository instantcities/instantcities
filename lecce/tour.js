// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [351, 91, 3], [336, 112, 16], [322, 115], [290, 116], [259, 118], [227, 121], [196, 127], [170, 144],
    [143, 158], [116, 172], [87, 186], [55, 195], [23, 199], [11, 200], [-19, 211], [-47, 222],
    [-75, 234], [-103, 246], [-131, 258], [-160, 271], [-190, 282], [-220, 293], [-249, 302], [-278, 310],
    [-307, 319], [-336, 328], [-367, 335], [-397, 339], [-430, 344], [-443, 336], [-429, 310], [-414, 284],
    [-399, 258], [-384, 232], [-399, 211], [-400, 184], [-388, 154], [-368, 133], [-340, 121], [-312, 120],
    [-296, 93], [-281, 66], [-267, 39], [-253, 12], [-239, -14], [-225, -41], [-210, -68], [-196, -95],
    [-182, -122], [-167, -148], [-152, -174], [-136, -200], [-121, -226], [-104, -252], [-87, -277], [-71, -303],
    [-54, -328], [-38, -344], [-10, -330], [-13, -299], [-12, -280], [20, -276], [50, -279], [80, -281],
    [111, -281], [142, -281], [163, -259], [190, -241], [218, -232], [250, -237], [279, -230], [309, -225],
    [337, -241], [367, -253], [397, -261], [413, -260], [419, -228], [423, -197], [426, -166], [428, -136],
    [428, -106], [427, -74], [429, -42], [432, -32], [437, -1], [441, 30], [441, 60], [439, 62],
    [408, 66], [378, 71], [353, 89], [351, 91],
  ],
  stops: [
    { sight: 'piazza-duomo', at: [55,195], look: [67, 6, 286] },
    { sight: 'porta-rudiae', at: [-430,344], look: [-437, 6, 344] },
    { sight: 'porta-napoli', at: [-38,-344], look: [-14, 6, -367] },
    { sight: 'santa-croce', at: [428,-106], look: [482, 6, -118] },
    { sight: 'sant-oronzo', at: [439,62], look: [409, 6, 141] },
  ],
  // it sets off at night (core/js/main.js), it is day as soon as it is on its way, and evening at the end
  skies: [
    { at: [290, 116], sky: 'day:clear' },
    { at: [428, -106], sky: 'night:clear' },
  ],
  end: { look: [481.8, 15, -117.8] },
  names: [
    { name: 'Piazza Sant’Oronzo', at: [351, 91] },
    { name: 'Via Vittorio Emanuele Secondo', at: [322, 115] },
    { name: 'Via Giuseppe Libertini', at: [11, 200] },
    { name: 'Via Adua', at: [-443, 336] },
    { name: 'Piazza Vittorio Aymone', at: [-38, -344] },
    { name: 'Via Idomeneo', at: [-12, -280] },
    { name: 'Via Umberto Primo', at: [413, -260] },
    { name: 'Via Templari', at: [432, -32] },
  ],
};
