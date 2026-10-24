// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [169, -304, 3], [138, -304, 16], [129, -304], [99, -303], [67, -300], [37, -293], [6, -285], [-22, -274],
    [-50, -259], [-77, -245], [-106, -237], [-137, -231], [-143, -227], [-150, -197], [-153, -167], [-157, -137],
    [-160, -107], [-164, -77], [-167, -47], [-171, -17], [-174, 13], [-178, 43], [-181, 73], [-185, 103],
    [-189, 133], [-193, 163], [-196, 193], [-200, 223], [-197, 254], [-178, 278], [-157, 299], [-138, 303],
    [-118, 277], [-93, 261], [-63, 249], [-33, 242], [-2, 234], [27, 223], [55, 213], [85, 208],
    [116, 204], [118, 203], [124, 171], [131, 141], [140, 111], [148, 82], [158, 52], [165, 23],
    [170, -7], [175, -37], [180, -67], [185, -97], [189, -128], [193, -160], [194, -190], [195, -221],
    [197, -251], [199, -283], [199, -302], [169, -304],
  ],
  stops: [
    {
      emoji: '🏛️', at: [67, -300], look: [179, 6, -356],
      text: {
        en: { name: 'Dam', text: 'The square on the dam built across the Amstel in the 13th century, which gave the city its name.' },
        nl: { name: 'Dam', text: 'Het plein op de dam die in de 13de eeuw in de Amstel werd gelegd, en waar de stad haar naam aan dankt.' },
      },
    },
    {
      emoji: '👑', at: [67, -300], look: [68, 6, -370],
      text: {
        en: { name: 'Royal Palace', text: 'Built as the city hall in the 17th century, Amsterdam’s Golden Age. Louis Napoleon made it a palace in 1808.' },
        nl: { name: 'Koninklijk Paleis', text: 'Gebouwd als stadhuis in de 17de eeuw, de Gouden Eeuw van Amsterdam. Lodewijk Napoleon maakte er in 1808 een paleis van.' },
      },
    },
    {
      emoji: '📚', at: [-63, 249], look: [-76, 6, 252],
      text: {
        en: { name: 'Spui', text: 'A small square of bookshops and cafés, with the quiet Begijnhof hidden behind a door in the corner.' },
        nl: { name: 'Spui', text: 'Een pleintje vol boekhandels en cafés, met het stille Begijnhof verstopt achter een deur in de hoek.' },
      },
    },
  ],
  // it sets off at night (core/js/main.js), it is day as soon as it is on its way, and evening at the end
  skies: [
    { at: [99, -303], sky: 'day:clear' },
    { at: [189, -128], sky: 'night:clear' },
  ],
  end: { look: [179, 15, -356] },
  names: [
    { name: 'Dam', at: [169, -304] },
    { name: 'Paleisstraat', at: [129, -304] },
    { name: 'Singel', at: [-143, -227] },
    { name: 'Spui', at: [-138, 303] },
    { name: 'Rokin', at: [118, 203] },
  ],
};
