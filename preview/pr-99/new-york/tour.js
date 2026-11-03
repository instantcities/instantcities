// The tour: a flight along the race route (races.js) between the towers, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [-600, -134, 3], [-614, -108, 16], [-629, -81, 22], [-643, -55], [-657, -28], [-672, -2], [-686, 25], [-701, 51],
    [-717, 80], [-732, 106], [-746, 132], [-762, 161], [-777, 187], [-792, 213], [-807, 240], [-823, 269],
    [-837, 295], [-852, 322], [-867, 349], [-881, 376], [-896, 403], [-911, 430], [-926, 456], [-933, 476],
    [-907, 494], [-878, 510], [-852, 524], [-823, 540], [-794, 556], [-765, 572], [-736, 588], [-710, 603],
    [-681, 619], [-652, 635], [-623, 651], [-594, 667], [-568, 681], [-539, 697], [-510, 713], [-481, 729],
    [-452, 745], [-426, 759], [-397, 775], [-368, 791], [-339, 807], [-310, 823], [-297, 825], [-280, 797],
    [-265, 771], [-249, 742], [-233, 713], [-217, 684], [-203, 658], [-187, 629], [-171, 600], [-156, 574],
    [-140, 545], [-124, 516], [-110, 490], [-95, 463], [-79, 435], [-65, 408], [-49, 379], [-33, 351],
    [-18, 324], [-2, 295], [14, 266], [30, 238], [45, 211], [60, 184], [75, 158], [92, 139],
    [122, 153], [148, 168], [175, 182], [201, 197], [228, 212], [254, 226], [280, 241], [307, 257],
    [334, 273], [360, 288], [387, 302], [413, 317], [439, 331], [466, 346], [492, 360], [519, 375],
    [545, 389], [571, 403], [598, 412], [615, 384], [630, 358], [646, 329], [661, 303], [677, 274],
    [691, 248], [706, 221], [722, 193], [737, 166], [751, 140], [767, 111], [782, 85], [798, 56],
    [814, 27], [829, 1], [845, -28], [859, -54], [874, -80], [890, -109], [905, -136], [921, -164],
    [933, -194], [907, -212], [881, -227], [852, -243], [826, -258], [800, -272], [773, -287], [747, -302],
    [721, -316], [694, -331], [668, -345], [641, -360], [615, -374], [589, -389], [562, -403], [536, -418],
    [509, -432], [483, -446], [456, -461], [430, -475], [425, -478], [396, -494], [367, -510], [341, -525],
    [314, -539], [286, -555], [259, -570], [233, -585], [204, -601], [178, -615], [152, -630], [123, -646],
    [96, -660], [70, -675], [41, -691], [15, -705], [-11, -720], [-40, -736], [-66, -750], [-93, -765],
    [-122, -781], [-150, -797], [-177, -812], [-206, -826], [-209, -826], [-227, -799], [-242, -773], [-258, -747],
    [-272, -720], [-287, -694], [-301, -667], [-316, -641], [-331, -614], [-345, -588], [-360, -561], [-375, -535],
    [-389, -508], [-404, -482], [-419, -456], [-434, -430], [-450, -404], [-464, -377], [-478, -351], [-493, -324],
    [-507, -298], [-522, -271], [-537, -245], [-552, -218], [-567, -192], [-582, -166], [-597, -139], [-600, -134],
  ],
  stops: [
    {
      emoji: '🏙️', at: [-623, 651], look: [-456, 260, 821],
      text: {
        en: { name: 'Empire State Building', text: 'Built in just over a year and opened in 1931, it was the tallest building in the world for almost forty years. Its mast reaches 443 metres, and its lights change colour for every holiday.' },
        nl: { name: 'Empire State Building', text: 'In iets meer dan een jaar gebouwd en geopend in 1931. Bijna veertig jaar was het het hoogste gebouw ter wereld. De mast reikt tot 443 meter, en de lichten krijgen een andere kleur bij elke feestdag.' },
      },
    },
    {
      emoji: '🦁', at: [-18, 324], look: [-70, 18, 165],
      text: {
        en: { name: 'New York Public Library', text: 'The marble library on Fifth Avenue, opened in 1911, with two stone lions at its steps called Patience and Fortitude. Behind it lies Bryant Park, with its lawn, its chairs and in winter its ice rink.' },
        nl: { name: 'New York Public Library', text: 'De marmeren bibliotheek aan Fifth Avenue, geopend in 1911, met twee stenen leeuwen bij de trappen, Patience en Fortitude. Erachter ligt Bryant Park, met zijn grasveld, zijn stoeltjes en in de winter een schaatsbaan.' },
      },
    },
    {
      emoji: '🚂', at: [439, 331], look: [674, 250, 408],
      text: {
        en: { name: 'Grand Central and the Chrysler Building', text: 'Grand Central Terminal, on your left, has the biggest station hall in New York, under a ceiling painted with the stars. Ahead stands the Chrysler Building, whose steel crown of arches went up in 1930.' },
        nl: { name: 'Grand Central en de Chrysler Building', text: 'Grand Central Terminal, links, heeft de grootste stationshal van New York, onder een plafond vol sterren. Vooruit staat de Chrysler Building, met een stalen kroon van bogen uit 1930.' },
      },
    },
    {
      emoji: '🎄', at: [233, -585], look: [218, 150, -648],
      text: {
        en: { name: 'Rockefeller Center', text: 'Fourteen Art Deco towers that John D. Rockefeller Jr. built in the 1930s, round a sunken plaza with the golden Prometheus. In winter the skating rink opens and a giant Christmas tree goes up.' },
        nl: { name: 'Rockefeller Center', text: 'Veertien art-decotorens die John D. Rockefeller Jr. in de jaren 1930 bouwde, rond een verzonken plein met de gouden Prometheus. In de winter gaat de schaatsbaan open en komt er een reusachtige kerstboom.' },
      },
    },
    {
      emoji: '🌃', at: [-389, -508], look: [-507, 60, -239],
      text: {
        en: { name: 'Times Square', text: 'Where Broadway crosses Seventh Avenue, under walls of screens that never go dark. On New Year’s Eve a million people watch the ball drop from One Times Square at midnight.' },
        nl: { name: 'Times Square', text: 'Waar Broadway Seventh Avenue kruist, onder wanden van schermen die nooit uitgaan. Op oudejaarsavond kijken een miljoen mensen hoe om middernacht de bal zakt op One Times Square.' },
      },
    },
  ],
  // a clear day from the start, and night from Rockefeller Center on, for the lights of Times Square
  skies: [
    { at: [-629, -81], sky: 'day:clear' },
    { at: [314, -539], sky: 'night:clear' },
  ],
  end: { look: [-507, 60, -239] },
  names: [
    { name: 'Seventh Avenue', at: [-600, -134] },
    { name: 'West 34th Street', at: [-907, 494] },
    { name: 'Fifth Avenue', at: [-280, 797] },
    { name: 'East 42nd Street', at: [122, 153] },
    { name: 'Lexington Avenue', at: [615, 384] },
    { name: 'East 49th Street', at: [907, -212] },
    { name: 'West 49th Street', at: [396, -494] },
    { name: 'Seventh Avenue', at: [-227, -799] },
  ],
};
