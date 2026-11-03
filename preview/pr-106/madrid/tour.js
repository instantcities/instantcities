// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [503, 166, 3], [471, 170, 16], [441, 173], [413, 177], [383, 184], [354, 191], [321, 196], [292, 201],
    [262, 206], [230, 211], [200, 216], [167, 222], [137, 227], [107, 233], [76, 238], [44, 244],
    [15, 253], [-14, 263], [-43, 271], [-74, 278], [-105, 289], [-136, 300], [-167, 310], [-197, 320],
    [-227, 327], [-256, 334], [-286, 341], [-316, 348], [-346, 354], [-377, 360], [-408, 368], [-440, 376],
    [-470, 381], [-501, 387], [-526, 387], [-523, 356], [-518, 326], [-511, 297], [-508, 266], [-508, 234],
    [-511, 202], [-510, 170], [-508, 140], [-506, 110], [-505, 106], [-481, 98], [-451, 100], [-421, 103],
    [-391, 105], [-359, 105], [-352, 74], [-349, 41], [-336, 12], [-333, 10], [-311, -14], [-301, -44],
    [-299, -77], [-308, -106], [-325, -133], [-329, -136], [-326, -166], [-324, -197], [-316, -222], [-290, -221],
    [-264, -241], [-254, -249], [-229, -268], [-206, -288], [-184, -308], [-161, -328], [-138, -347], [-114, -367],
    [-90, -387], [-82, -390], [-55, -374], [-25, -366], [6, -362], [24, -337], [39, -310], [56, -282],
    [61, -276], [83, -252], [97, -225], [112, -195], [124, -171], [154, -175], [184, -180], [217, -178],
    [246, -172], [259, -201], [271, -225], [301, -226], [316, -240], [333, -212], [349, -184], [364, -158],
    [379, -132], [397, -106], [418, -83], [439, -60], [458, -35], [476, -11], [492, 17], [506, 47],
    [512, 77], [522, 92], [526, 123], [518, 151], [503, 166],
  ],
  stops: [
    {
      emoji: '🏛️', at: [107, 233], look: [116, 6, 328],
      text: {
        en: { name: 'Plaza Mayor', text: 'The arcaded square of 1619, where Madrid held markets, bullfights, coronations and the trials of the Inquisition.' },
        nl: { name: 'Plaza Mayor', text: 'Het plein met arcades uit 1619, waar Madrid markten, stierengevechten, kroningen en de processen van de Inquisitie hield.' },
      },
    },
    {
      emoji: '⛪', at: [-518, 326], look: [-647, 30, 301],
      text: {
        en: { name: 'Almudena Cathedral', text: 'Begun in 1883 and only consecrated in 1993, by Pope John Paul II, across the square from the Royal Palace.' },
        nl: { name: 'Almudenakathedraal', text: 'Begonnen in 1883 en pas in 1993 ingewijd, door paus Johannes Paulus II, tegenover het Koninklijk Paleis.' },
      },
    },
    {
      emoji: '🎭', at: [-299, -77], look: [-265, 6, -72],
      text: {
        en: { name: 'Teatro Real', text: 'Madrid’s opera house, facing the Royal Palace across the gardens of the Plaza de Oriente.' },
        nl: { name: 'Teatro Real', text: 'Het operahuis van Madrid, tegenover het Koninklijk Paleis aan de overkant van de tuinen van de Plaza de Oriente.' },
      },
    },
    {
      emoji: '👑', at: [-329, -136], look: [-371, 30, -86],
      text: {
        en: { name: 'Royal Palace', text: 'With more than 3,000 rooms the largest royal palace in western Europe, still used by the king for state occasions.' },
        nl: { name: 'Koninklijk Paleis', text: 'Met meer dan 3000 kamers het grootste koninklijke paleis van West-Europa, nog altijd gebruikt door de koning voor staatsbezoeken.' },
      },
    },
    {
      emoji: '🎬', at: [271, -225], look: [275, 6, -280],
      text: {
        en: { name: 'Callao', text: 'The square on the Gran Vía with Madrid’s great old cinemas and their neon signs.' },
        nl: { name: 'Callao', text: 'Het plein aan de Gran Vía met de grote oude bioscopen van Madrid en hun neonletters.' },
      },
    },
    {
      emoji: '🐻', at: [512, 77], look: [529, 6, 135],
      text: {
        en: { name: 'Puerta del Sol', text: 'Kilometre zero of Spain’s roads, with the bear and the strawberry tree of Madrid’s coat of arms. On New Year’s Eve Spain eats its twelve grapes to the chimes of its clock.' },
        nl: { name: 'Puerta del Sol', text: 'Kilometer nul van de Spaanse wegen, met de beer en de aardbeiboom uit het wapen van Madrid. Op oudejaarsavond eet Spanje hier zijn twaalf druiven op de slagen van de klok.' },
      },
    },
  ],
  // a clear day from the start, and night only near the end
  skies: [
    { at: [413, 177], sky: 'day:clear' },
    { at: [364, -158], sky: 'night:clear' },
  ],
  end: { look: [529, 15, 135] },
  names: [
    { name: 'Plaza de la Puerta del Sol', at: [503, 166] },
    { name: 'Calle Mayor', at: [413, 177] },
    { name: 'Calle de Bailén', at: [-526, 387] },
    { name: 'Calle de Requena', at: [-505, 106] },
    { name: 'Calle de Lepanto', at: [-359, 105] },
    { name: 'Plaza de Oriente', at: [-333, 10] },
    { name: 'Calle de Pavía', at: [-329, -136] },
    { name: 'Calle de San Quintín', at: [-316, -222] },
    { name: 'Plaza de la Encarnación', at: [-290, -221] },
    { name: 'Calle de la Bola', at: [-254, -249] },
    { name: 'Plaza de Santo Domingo', at: [-82, -390] },
    { name: 'Calle de las Veneras', at: [61, -276] },
    { name: 'Calle de las Navas de Tolosa', at: [124, -171] },
    { name: 'Calle del Postigo de San Martín', at: [246, -172] },
    { name: 'Plaza de Callao', at: [271, -225] },
    { name: 'Calle del Carmen', at: [316, -240] },
  ],
};
