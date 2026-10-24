// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [-207, -430, 3], [-208, -399, 16], [-204, -367], [-196, -338], [-186, -308], [-180, -277], [-172, -247], [-163, -217],
    [-154, -188], [-146, -158], [-139, -129], [-131, -100], [-125, -70], [-119, -40], [-113, -9], [-109, 22],
    [-107, 54], [-106, 84], [-104, 114], [-103, 144], [-103, 174], [-102, 205], [-102, 208], [-102, 238],
    [-102, 269], [-103, 299], [-106, 329], [-109, 359], [-112, 389], [-116, 416], [-143, 426], [-127, 438],
    [-98, 437], [-97, 434], [-65, 435], [-35, 437], [-4, 437], [27, 438], [58, 441], [68, 436],
    [74, 404], [78, 374], [84, 343], [87, 311], [92, 280], [97, 250], [102, 219], [107, 190],
    [113, 160], [118, 130], [124, 101], [129, 71], [134, 41], [140, 12], [145, -18], [150, -48],
    [157, -77], [164, -106], [171, -136], [178, -165], [185, -195], [192, -224], [198, -254], [207, -284],
    [210, -293], [201, -325], [172, -338], [142, -347], [114, -358], [84, -368], [55, -377], [26, -385],
    [-2, -394], [-31, -402], [-60, -411], [-89, -419], [-118, -428], [-150, -436], [-182, -440], [-201, -436],
    [-207, -430],
  ],
  stops: [
    {
      emoji: '🐎', at: [-139, -129], look: [-189, 6, -119],
      text: {
        en: { name: 'Horse Guards', text: 'Mounted troopers of the Household Cavalry stand guard here every day, sword in hand.' },
        nl: { name: 'Horse Guards', text: 'Ruiters van de Household Cavalry staan hier elke dag op wacht, met de sabel in de hand.' },
      },
    },
    {
      emoji: '🚪', at: [-106, 84], look: [-224, 6, 103],
      text: {
        en: { name: 'Downing Street', text: 'Number 10, behind the gates, has been the home of British prime ministers since 1735.' },
        nl: { name: 'Downing Street', text: 'Nummer 10, achter de hekken, is sinds 1735 het huis van de Britse premier.' },
      },
    },
    {
      emoji: '🕰️', at: [27, 438], look: [36, 30, 476],
      text: {
        en: { name: 'Big Ben', text: 'Big Ben is really the great bell inside. The tower itself has been called the Elizabeth Tower since 2012.' },
        nl: { name: 'Big Ben', text: 'Big Ben is eigenlijk de grote klok binnenin. De toren zelf heet sinds 2012 de Elizabeth Tower.' },
      },
    },
    {
      emoji: '🦁', at: [-118, -428], look: [-267, 30, -533],
      text: {
        en: { name: 'Trafalgar Square', text: 'Nelson on his column, four bronze lions at its foot, and the National Gallery along the north side.' },
        nl: { name: 'Trafalgar Square', text: 'Nelson op zijn zuil, vier bronzen leeuwen aan zijn voeten en de National Gallery aan de noordkant.' },
      },
    },
  ],
  end: { look: [-267, 15, -533] },
  names: [
    { name: 'Whitehall', at: [-207, -430] },
    { name: 'Parliament Street', at: [-102, 208] },
    { name: 'Great George Street', at: [-116, 416] },
    { name: 'Saint Margaret Street', at: [-98, 437] },
    { name: 'Bridge Street', at: [-97, 434] },
    { name: 'Victoria Embankment', at: [68, 436] },
    { name: 'Northumberland Avenue', at: [210, -293] },
    { name: 'Charing Cross', at: [-201, -436] },
  ],
};
