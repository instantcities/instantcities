// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [-367, 122, 3], [-357, 148, 16], [-349, 175], [-338, 203], [-326, 231], [-314, 257], [-310, 244], [-297, 225],
    [-268, 216], [-239, 207], [-210, 199], [-181, 190], [-152, 181], [-123, 172], [-94, 163], [-67, 154],
    [-39, 143], [-12, 134], [17, 125], [45, 116], [70, 102], [100, 93], [128, 84], [157, 74],
    [186, 65], [214, 55], [242, 44], [270, 34], [290, 16], [308, -5], [335, -20], [362, -35],
    [387, -53], [408, -72], [424, -95], [399, -112], [377, -128], [351, -142], [326, -158], [310, -183],
    [295, -208], [277, -231], [264, -257], [239, -258], [212, -250], [182, -241], [152, -233], [123, -224],
    [94, -216], [65, -207], [36, -198], [7, -190], [-22, -181], [-51, -172], [-80, -164], [-109, -155],
    [-137, -146], [-166, -137], [-195, -128], [-224, -119], [-253, -110], [-281, -101], [-310, -92], [-339, -83],
    [-367, -75], [-398, -71], [-425, -64], [-419, -34], [-412, -5], [-405, 25], [-396, 52], [-386, 80],
    [-374, 108], [-367, 122],
  ],
  stops: [
    {
      emoji: '🗿', at: [-326, 231], look: [-105, 8, 473],
      text: {
        en: { name: 'Plein 1940', text: 'Down by the Leuvehaven stands Zadkine’s De Verwoeste Stad, a figure with its heart torn out, for the centre that burned on 14 May 1940. The Erasmusbrug lies beyond.' },
        nl: { name: 'Plein 1940', text: 'Bij de Leuvehaven staat De Verwoeste Stad van Zadkine, een figuur zonder hart, voor het centrum dat op 14 mei 1940 afbrandde. Verderop ligt de Erasmusbrug.' },
      },
    },
    {
      emoji: '🏢', at: [290, 16], look: [567, 30, 82],
      text: {
        en: { name: 'Witte Huis', text: 'The white office building of 1898 by the Oude Haven, among the first high-rise buildings of Europe, and one of the few that came through the bombing.' },
        nl: { name: 'Witte Huis', text: 'Het witte kantoorgebouw uit 1898 aan de Oude Haven, een van de eerste hoogbouw van Europa, en een van de weinige gebouwen die het bombardement doorstonden.' },
      },
    },
    {
      emoji: '🟨', at: [408, -72], look: [453, 12, -121],
      text: {
        en: { name: 'Cube houses', text: 'Piet Blom’s houses of 1984, each a cube tipped on its corner, a forest of them on a bridge over the Blaak. The pointed tower beside them is the Potlood, the pencil.' },
        nl: { name: 'Kubuswoningen', text: 'De woningen van Piet Blom uit 1984, elk een kubus op zijn punt, een heel bos ervan op een brug over de Blaak. De spitse toren ernaast is het Potlood.' },
      },
    },
    {
      emoji: '🌈', at: [326, -158], look: [150, 25, -95],
      text: {
        en: { name: 'Markthal', text: 'A market hall under an arch of 228 flats, opened in 2014, with giant fruit, fish and flowers painted over the whole ceiling.' },
        nl: { name: 'Markthal', text: 'Een markthal onder een boog van 228 woningen, geopend in 2014, met reusachtig fruit, vis en bloemen over het hele plafond.' },
      },
    },
    {
      emoji: '⛪', at: [36, -198], look: [25, 25, -297],
      text: {
        en: { name: 'Laurenskerk', text: 'The late-Gothic church of the old town, burnt out in 1940 and rebuilt, the last medieval building in the centre. Erasmus reads his book on the square in front.' },
        nl: { name: 'Laurenskerk', text: 'De laatgotische kerk van de oude stad, uitgebrand in 1940 en herbouwd, het laatste middeleeuwse gebouw in het centrum. Op het plein ervoor leest Erasmus zijn boek.' },
      },
    },
  ],
  // a clear day from the start, and night on the way back, with the towers lit up
  skies: [
    { at: [-338, 203], sky: 'day:clear' },
    { at: [-109, -155], sky: 'night:clear' },
  ],
  end: { look: [150, 25, -95] },
  names: [
    { name: 'Coolsingel', at: [-367, 122] },
    { name: 'Churchillplein', at: [-338, 203] },
    { name: 'Blaak', at: [-297, 225] },
    { name: 'Kolk', at: [424, -95] },
    { name: 'Binnenrotte', at: [377, -128] },
    { name: 'Hoogstraat', at: [264, -257] },
    { name: 'Beursplein', at: [-281, -101] },
    { name: 'Coolsingel', at: [-425, -64] },
  ],
};
