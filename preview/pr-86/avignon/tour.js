// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [129, -226, 3], [134, -223, 16], [134, -190], [131, -160], [129, -130], [127, -100], [125, -70], [123, -40],
    [121, -10], [119, 20], [117, 50], [115, 80], [113, 110], [111, 140], [109, 170], [107, 200],
    [104, 231], [97, 255], [65, 249], [36, 240], [6, 231], [-25, 221], [-54, 206], [-73, 181],
    [-90, 156], [-103, 127], [-111, 97], [-119, 67], [-123, 37], [-124, 6], [-125, -25], [-126, -56],
    [-131, -88], [-135, -119], [-129, -149], [-123, -180], [-115, -209], [-108, -239], [-102, -256], [-71, -251],
    [-41, -245], [-10, -241], [20, -238], [50, -235], [80, -231], [110, -228], [116, -227], [129, -226],
  ],
  stops: [
    {
      emoji: '🛍️', at: [111, 140], look: [144, 6, 146],
      text: {
        en: { name: 'Rue de la République', text: 'The broad street cut through the old town in the 19th century, from the station gate to the Place de l’Horloge.' },
        nl: { name: 'Rue de la République', text: 'De brede straat die in de 19de eeuw door de oude stad werd getrokken, van de stationspoort tot de Place de l’Horloge.' },
      },
    },
    {
      emoji: '🏰', at: [50, -235], look: [304, 30, -517],
      text: {
        en: { name: 'Palais des Papes', text: 'The largest Gothic palace in the world, built when the popes lived in Avignon instead of Rome, from 1309 to 1377.' },
        nl: { name: 'Pausenpaleis', text: 'Het grootste gotische paleis ter wereld, gebouwd toen de pausen in Avignon woonden in plaats van in Rome, van 1309 tot 1377.' },
      },
    },
    {
      emoji: '🕰️', at: [50, -235], look: [94, 6, -282],
      text: {
        en: { name: 'Place de l’Horloge', text: 'The town square, named after the Gothic clock tower behind the town hall, with an old carousel and café terraces.' },
        nl: { name: 'Place de l’Horloge', text: 'Het stadsplein, genoemd naar de gotische klokkentoren achter het stadhuis, met een oude draaimolen en terrasjes.' },
      },
    },
  ],
  // a clear day from the start, and night only near the end
  skies: [
    { at: [131, -160], sky: 'day:clear' },
    { at: [20, -238], sky: 'night:clear' },
  ],
  end: { look: [304, 15, -517] },
  names: [
    { name: 'Place de l’Horloge', at: [129, -226] },
    { name: 'Rue de la République', at: [134, -223] },
    { name: 'Rue Joseph Vernet', at: [97, 255] },
    { name: 'Rue Saint-Agricol', at: [-102, -256] },
  ],
};
