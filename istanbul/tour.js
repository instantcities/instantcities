// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [236, 411, 3], [221, 437, 16], [198, 456], [171, 467], [141, 468], [111, 463], [82, 458], [52, 452],
    [23, 447], [-7, 441], [-36, 437], [-66, 433], [-96, 430], [-125, 425], [-155, 423], [-185, 420],
    [-215, 418], [-245, 416], [-275, 413], [-305, 410], [-334, 407], [-364, 403], [-394, 400], [-424, 397],
    [-454, 394], [-484, 391], [-498, 365], [-511, 338], [-518, 309], [-524, 280], [-530, 250], [-529, 221],
    [-526, 191], [-524, 161], [-509, 141], [-479, 139], [-449, 138], [-419, 137], [-389, 136], [-359, 134],
    [-329, 133], [-299, 131], [-269, 129], [-239, 125], [-211, 119], [-198, 92], [-185, 65], [-170, 39],
    [-155, 13], [-138, -11], [-120, -36], [-103, -61], [-85, -84], [-71, -99], [-85, -125], [-81, -154],
    [-78, -184], [-90, -210], [-110, -232], [-129, -255], [-148, -279], [-157, -306], [-148, -335], [-134, -361],
    [-120, -388], [-107, -415], [-96, -442], [-84, -470], [-71, -497], [-46, -506], [-38, -479], [-14, -461],
    [12, -445], [37, -429], [44, -405], [35, -376], [25, -348], [15, -319], [5, -291], [-4, -263],
    [17, -242], [41, -224], [65, -206], [89, -188], [113, -171], [137, -153], [161, -135], [185, -117],
    [209, -99], [219, -74], [212, -45], [206, -15], [199, 14], [202, 43], [224, 63], [247, 83],
    [264, 107], [264, 136], [261, 166], [258, 196], [255, 226], [253, 256], [250, 286], [247, 316],
    [244, 346], [242, 375], [264, 357], [279, 331], [294, 305], [309, 279], [325, 253], [340, 228],
    [360, 207], [385, 223], [408, 242], [431, 262], [453, 282], [476, 302], [498, 321], [516, 345],
    [530, 371], [512, 393], [489, 412], [466, 431], [444, 452], [423, 473], [403, 495], [378, 505],
    [354, 487], [330, 470], [305, 452], [281, 435], [257, 418], [236, 411],
  ],
  stops: [
    {
      emoji: '🕌', at: [221, 437], look: [412, 50, 361],
      text: {
        en: { name: 'Hagia Sophia', text: 'Emperor Justinian’s great church, finished in 537, with a dome 55 metres high. For almost a thousand years it was the largest church in the world, then a mosque, a museum, and a mosque again.' },
        nl: { name: 'Hagia Sophia', text: 'De grote kerk van keizer Justinianus, klaar in 537, met een koepel van 55 meter hoog. Bijna duizend jaar was ze de grootste kerk ter wereld, daarna een moskee, een museum en weer een moskee.' },
      },
    },
    {
      emoji: '🐎', at: [23, 447], look: [61, 35, 795],
      text: {
        en: { name: 'Hippodrome and Blue Mosque', text: 'Down this side street lay the Hippodrome, where Byzantium watched its chariot races; an Egyptian obelisk still stands on it. Behind it rises the Blue Mosque, with its six minarets.' },
        nl: { name: 'Hippodroom en Blauwe Moskee', text: 'Langs deze zijstraat lag de Hippodroom, waar Byzantium naar de wagenrennen keek; er staat nog een Egyptische obelisk. Daarachter rijst de Blauwe Moskee op, met haar zes minaretten.' },
      },
    },
    {
      emoji: '🛍️', at: [-524, 161], look: [-849, 10, 74],
      text: {
        en: { name: 'Grand Bazaar', text: 'Past the Column of Constantine, the gate by the Nuruosmaniye Mosque leads into the Grand Bazaar: some sixty covered streets and four thousand shops, selling gold, carpets and lamps since the 15th century.' },
        nl: { name: 'Grote Bazaar', text: 'Voorbij de zuil van Constantijn leidt de poort bij de Nuruosmaniyemoskee de Grote Bazaar in: een zestigtal overdekte straten en vierduizend winkels, die sinds de 15de eeuw goud, tapijten en lampen verkopen.' },
      },
    },
    {
      emoji: '🚂', at: [12, -445], look: [82, 8, -536],
      text: {
        en: { name: 'Sirkeci', text: 'The station where the Orient Express from Paris came in, built in 1890 by the sea. Today the trams ring past it, and the ferries leave from the quays at Eminönü just below.' },
        nl: { name: 'Sirkeci', text: 'Het station waar de Oriënt-Express uit Parijs aankwam, gebouwd in 1890 aan zee. Nu rammelen de trams erlangs, en de veerboten vertrekken net beneden van de kades van Eminönü.' },
      },
    },
    {
      emoji: '🏰', at: [498, 321], look: [544, 12, 276],
      text: {
        en: { name: 'Topkapı Palace', text: 'Through the Imperial Gate, at the end of this lane of wooden houses, lies the palace where the Ottoman sultans lived and ruled for nearly four hundred years.' },
        nl: { name: 'Topkapıpaleis', text: 'Door de Keizerlijke Poort, aan het eind van dit straatje met houten huizen, ligt het paleis waar de Osmaanse sultans bijna vierhonderd jaar woonden en regeerden.' },
      },
    },
  ],
  // a clear day from the start, and night from Sirkeci on, when the domes are lit
  skies: [
    { at: [198, 456], sky: 'day:clear' },
    { at: [-46, -506], sky: 'night:clear' },
  ],
  end: { look: [412, 50, 361] },
  names: [
    { name: 'Sultanahmet Meydanı', at: [236, 411] },
    { name: 'Divanyolu Caddesi', at: [198, 456] },
    { name: 'Vezirhanı Caddesi', at: [-498, 365] },
    { name: 'Nuruosmaniye Caddesi', at: [-509, 141] },
    { name: 'Babıali Caddesi', at: [-211, 119] },
    { name: 'Ankara Caddesi', at: [-170, 39] },
    { name: 'Hüdavendigar Caddesi', at: [-46, -506] },
    { name: 'Ebussuud Caddesi', at: [-4, -263] },
    { name: 'Alemdar Caddesi', at: [212, -45] },
    { name: 'Soğukçeşme Sokağı', at: [360, 207] },
    { name: 'Bab-ı Hümayun Caddesi', at: [530, 371] },
    { name: 'Sultanahmet Meydanı', at: [403, 495] },
  ],
};
