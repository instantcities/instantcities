// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [-7, -252, 3], [22, -249, 16], [31, -239], [48, -211], [65, -185], [83, -161], [106, -139], [128, -118],
    [149, -97], [171, -73], [192, -49], [205, -39], [208, -33], [188, -8], [168, 14], [147, 37],
    [127, 59], [106, 81], [85, 103], [64, 126], [42, 149], [16, 163], [-8, 185], [-30, 206],
    [-44, 219], [-66, 239], [-84, 253], [-102, 226], [-115, 196], [-126, 165], [-136, 137], [-146, 109],
    [-154, 78], [-160, 59], [-178, 35], [-197, 10], [-208, -11], [-190, -36], [-172, -62], [-154, -90],
    [-139, -116], [-120, -142], [-100, -166], [-80, -189], [-60, -212], [-58, -215], [-34, -236], [-8, -251],
    [-7, -252],
  ],
  stops: [
    {
      emoji: '📸', at: [208, -33], look: [244, 6, 12],
      text: {
        en: { name: 'Rozenhoedkaai', text: 'The most photographed corner of Bruges, where the canal turns and the Belfry rises over the roofs.' },
        nl: { name: 'Rozenhoedkaai', text: 'Het meest gefotografeerde hoekje van Brugge, waar de rei draait en het Belfort boven de daken uitsteekt.' },
      },
    },
    {
      emoji: '🍺', at: [42, 149], look: [61, 6, 178],
      text: {
        en: { name: 'Gruuthuse', text: 'The palace of the lords of Gruuthuse, who could tax gruut, the herbs for brewing beer.' },
        nl: { name: 'Gruuthuse', text: 'Het paleis van de heren van Gruuthuse, die belasting mochten heffen op gruut, de kruiden om bier te brouwen.' },
      },
    },
    {
      emoji: '⛪', at: [-66, 239], look: [-18, 30, 275],
      text: {
        en: { name: 'Church of Our Lady', text: 'Its brick tower of 115 metres is one of the tallest in the world. Inside is Michelangelo’s Madonna and Child.' },
        nl: { name: 'Onze-Lieve-Vrouwekerk', text: 'De bakstenen toren van 115 meter is een van de hoogste ter wereld. Binnen staat de Madonna met Kind van Michelangelo.' },
      },
    },
    {
      emoji: '🔔', at: [-60, -212], look: [0, 30, -251],
      text: {
        en: { name: 'Belfort', text: 'The 83-metre belfry over the Markt: 366 steps up to its carillon of 47 bells.' },
        nl: { name: 'Belfort', text: 'Het belfort van 83 meter boven de Markt: 366 treden naar de beiaard met 47 klokken.' },
      },
    },
  ],
  end: { look: [-44, 15, -306] },
  names: [
    { name: 'Markt', at: [-7, -252] },
    { name: 'Wollestraat', at: [31, -239] },
    { name: 'Rozenhoedkaai', at: [205, -39] },
    { name: 'Dijver', at: [208, -33] },
    { name: 'Gruuthusestraat', at: [16, 163] },
    { name: 'Guido Gezelleplein', at: [-44, 219] },
    { name: 'Mariastraat', at: [-84, 253] },
    { name: 'Simon Stevinplein', at: [-160, 59] },
    { name: 'Steenstraat', at: [-208, -11] },
  ],
};
