// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [157, -16, 3], [131, -36, 16], [111, -60], [92, -73], [69, -92], [45, -111], [19, -130], [0, -148],
    [2, -172], [-25, -190], [-45, -213], [-71, -228], [-102, -238], [-120, -243], [-140, -224], [-169, -241],
    [-196, -250], [-221, -269], [-244, -290], [-270, -307], [-278, -308], [-302, -290], [-302, -287], [-302, -255],
    [-310, -225], [-306, -213], [-273, -212], [-243, -211], [-210, -207], [-181, -201], [-154, -191], [-129, -174],
    [-104, -157], [-79, -140], [-53, -122], [-26, -105], [-25, -100], [-39, -72], [-53, -45], [-68, -19],
    [-84, 7], [-99, 33], [-115, 59], [-131, 85], [-146, 111], [-162, 136], [-177, 162], [-193, 188],
    [-209, 215], [-220, 235], [-195, 251], [-169, 269], [-144, 280], [-126, 254], [-107, 229], [-85, 208],
    [-63, 186], [-41, 164], [-29, 159], [-5, 179], [16, 203], [36, 226], [58, 247], [83, 264],
    [113, 279], [142, 288], [166, 308], [169, 309], [179, 283], [156, 266], [147, 264], [165, 240],
    [182, 215], [198, 188], [216, 161], [236, 138], [256, 115], [275, 93], [299, 70], [311, 55],
    [295, 28], [283, 1], [263, -19], [255, -22], [229, -4], [204, 15], [191, 21], [170, -2],
    [157, -16],
  ],
  stops: [
    {
      emoji: '🌸', at: [69, -92], look: [118, 6, 0],
      text: {
        en: { name: 'Grand-Place', text: 'Guild houses and a Gothic town hall round one of the most beautiful squares in Europe. Every other summer a carpet of flowers covers it.' },
        nl: { name: 'Grote Markt', text: 'Gildehuizen en een gotisch stadhuis rond een van de mooiste pleinen van Europa. Om de twee zomers ligt er een tapijt van bloemen.' },
      },
    },
    {
      emoji: '📈', at: [-140, -224], look: [-128, 6, -221],
      text: {
        en: { name: 'Bourse', text: 'The old stock exchange of 1873. The boulevard in front of it has been free of cars since 2015.' },
        nl: { name: 'Beurs', text: 'De oude beurs uit 1873. De boulevard ervoor is sinds 2015 autovrij.' },
      },
    },
    {
      emoji: '💦', at: [-107, 229], look: [-101, 6, 235],
      text: {
        en: { name: 'Manneken Pis', text: 'A bronze boy barely half a metre tall, with a wardrobe of more than a thousand costumes.' },
        nl: { name: 'Manneken Pis', text: 'Een bronzen jongetje van amper een halve meter, met een kleerkast van meer dan duizend kostuums.' },
      },
    },
  ],
  // a clear day from the start, and night only near the end
  skies: [
    { at: [92, -73], sky: 'day:clear' },
    { at: [299, 70], sky: 'night:clear' },
  ],
  end: { look: [118, 15, 0] },
  names: [
    { name: 'Grand-Place - Grote Markt', at: [157, -16] },
    { name: 'Rue au Beurre - Boterstraat', at: [92, -73] },
    { name: 'Rue de Tabora - Taborastraat', at: [0, -148] },
    { name: 'Rue de la Bourse - Beursstraat', at: [2, -172] },
    { name: 'Place de la Bourse - Beursplein', at: [-120, -243] },
    { name: 'Rue Auguste Orts - Auguste Ortsstraat', at: [-140, -224] },
    { name: 'Rue Van Artevelde - Arteveldestraat', at: [-278, -308] },
    { name: 'Rue du Pont de la Carpe - Karperbrug', at: [-302, -287] },
    { name: 'Rue Jules Van Praet - Jules Van Praetstraat', at: [-306, -213] },
    { name: 'Rue Henri Maus - Henri Mausstraat', at: [-154, -191] },
    { name: 'Rue du Midi - Zuidstraat', at: [-25, -100] },
    { name: 'Rue des Moineaux - Mussenstraat', at: [-220, 235] },
    { name: 'Rue de l’Étuve - Stoofstraat', at: [-144, 280] },
    { name: 'Rue du Lombard - Lombardstraat', at: [-29, 159] },
    { name: 'Rue de l’Hôpital - Gasthuisstraat', at: [142, 288] },
    { name: 'Place Saint-Jean - Sint-Jansplein', at: [169, 309] },
    { name: 'Rue des Éperonniers - Spoormakersstraat', at: [147, 264] },
    { name: 'Rue du Marché aux Herbes - Grasmarkt', at: [311, 55] },
    { name: 'Rue de la Colline - Heuvelstraat', at: [255, -22] },
  ],
};
