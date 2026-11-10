// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [19, -152, 3], [-9, -137, 16], [-31, -115], [-39, -106], [-69, -115], [-97, -126], [-125, -138], [-153, -149],
    [-182, -160], [-198, -181], [-201, -181], [-215, -152], [-226, -124], [-238, -96], [-250, -69], [-262, -41],
    [-274, -13], [-277, 4], [-269, 16], [-277, 45], [-280, 76], [-282, 106], [-280, 111], [-250, 118],
    [-219, 123], [-188, 134], [-174, 142], [-156, 114], [-140, 88], [-121, 67], [-94, 80], [-66, 94],
    [-39, 109], [-12, 124], [15, 139], [42, 152], [70, 166], [73, 167], [103, 177], [123, 180],
    [133, 149], [137, 119], [136, 88], [135, 58], [145, 33], [175, 41], [206, 47], [233, 51],
    [259, 32], [281, 10], [282, 7], [279, -26], [276, -40], [251, -59], [227, -78], [200, -91],
    [180, -98], [182, -129], [180, -149], [151, -160], [122, -169], [92, -171], [61, -173], [32, -160],
    [19, -152],
  ],
  stops: [
    {
      emoji: '🖐️', at: [-69, -115], look: [16, 6, -179],
      text: {
        en: { name: 'Grote Markt', text: 'The guild houses, the city hall and the Brabo fountain: the hero who threw the giant’s hand into the river.' },
        nl: { name: 'Grote Markt', text: 'De gildehuizen, het stadhuis en de Brabofontein: de held die de hand van de reus in de stroom gooide.' },
      },
    },
    {
      emoji: '🎨', at: [133, 149], look: [130, 6, 139],
      text: {
        en: { name: 'Groenplaats', text: 'The square at the foot of the cathedral, with Rubens in bronze in the middle.' },
        nl: { name: 'Groenplaats', text: 'Het plein aan de voet van de kathedraal, met Rubens in brons in het midden.' },
      },
    },
    {
      emoji: '⛪', at: [200, -91], look: [173, 30, -41],
      text: {
        en: { name: 'Cathedral of Our Lady', text: 'Its spire reaches 123 metres. Inside hang four great altarpieces by Rubens.' },
        nl: { name: 'Onze-Lieve-Vrouwekathedraal', text: 'De torenspits haalt 123 meter. Binnen hangen vier grote altaarstukken van Rubens.' },
      },
    },
  ],
  // a clear day from the start, and night only near the end
  skies: [
    { at: [-39, -106], sky: 'day:clear' },
    { at: [182, -129], sky: 'night:clear' },
  ],
  end: { look: [16, 15, -179] },
  names: [
    { name: 'Grote Markt', at: [19, -152] },
    { name: 'Suikerrui', at: [-39, -106] },
    { name: 'Ernest Van Dijckkaai', at: [-201, -181] },
    { name: 'Vlasmarkt', at: [-277, 4] },
    { name: 'Zand', at: [-269, 16] },
    { name: 'Stoofstraat', at: [-280, 111] },
    { name: 'Hoogstraat', at: [-174, 142] },
    { name: 'Reyndersstraat', at: [-121, 67] },
    { name: 'Groenkerkhofstraat', at: [73, 167] },
    { name: 'Groenplaats', at: [123, 180] },
    { name: 'Sint-Pieterstraat', at: [233, 51] },
    { name: 'Melkmarkt', at: [282, 7] },
    { name: 'Lijnwaadmarkt', at: [276, -40] },
    { name: 'Torfbrug', at: [180, -98] },
  ],
};
