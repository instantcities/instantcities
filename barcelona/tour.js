// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [-400, -687, 3], [-417, -661, 16], [-434, -636], [-451, -610], [-468, -585], [-482, -567], [-509, -552], [-512, -544],
    [-498, -515], [-485, -488], [-471, -460], [-457, -433], [-444, -406], [-428, -377], [-414, -350], [-399, -321],
    [-384, -292], [-369, -265], [-354, -238], [-339, -212], [-320, -189], [-297, -174], [-279, -147], [-261, -119],
    [-244, -91], [-226, -63], [-208, -35], [-189, -12], [-172, 14], [-155, 39], [-138, 65], [-122, 90],
    [-105, 115], [-88, 141], [-71, 166], [-55, 192], [-38, 217], [-22, 242], [-6, 267], [11, 293],
    [27, 318], [44, 346], [64, 371], [83, 395], [97, 423], [111, 450], [126, 476], [140, 503],
    [154, 530], [169, 556], [185, 583], [200, 610], [216, 636], [233, 662], [251, 683], [272, 707],
    [282, 720], [303, 743], [330, 743], [338, 735], [356, 712], [372, 686], [387, 660], [403, 635],
    [419, 609], [435, 583], [451, 557], [466, 531], [476, 505], [449, 490], [422, 477], [399, 460],
    [411, 432], [424, 404], [438, 376], [453, 349], [467, 322], [482, 295], [494, 266], [507, 237],
    [512, 220], [486, 202], [458, 187], [429, 174], [400, 163], [372, 153], [344, 143], [317, 128],
    [289, 114], [262, 101], [235, 84], [208, 70], [182, 55], [158, 37], [135, 16], [120, -6],
    [140, -29], [161, -51], [183, -72], [203, -95], [210, -111], [203, -137], [224, -160], [242, -184],
    [242, -189], [233, -216], [249, -241], [229, -266], [229, -271], [249, -296], [250, -304], [227, -328],
    [203, -350], [180, -371], [166, -384], [142, -401], [140, -399], [119, -376], [100, -358], [81, -339],
    [66, -341], [45, -363], [28, -381], [2, -398], [-24, -417], [-49, -437], [-63, -434], [-85, -457],
    [-102, -484], [-122, -510], [-143, -531], [-166, -554], [-187, -578], [-208, -600], [-228, -623], [-249, -646],
    [-270, -668], [-290, -691], [-311, -713], [-321, -742], [-324, -742], [-350, -739], [-367, -731], [-387, -707],
    [-400, -687],
  ],
  stops: [
    {
      emoji: '🎭', at: [-105, 115], look: [-129, 6, 144],
      text: {
        en: { name: 'Liceu', text: 'The opera house on the Rambla, opened in 1847 and built again after a fire in 1994.' },
        nl: { name: 'Liceu', text: 'Het operahuis aan de Rambla, geopend in 1847 en opnieuw opgebouwd na een brand in 1994.' },
      },
    },
    {
      emoji: '🌴', at: [-22, 242], look: [48, 6, 213],
      text: {
        en: { name: 'Plaça Reial', text: 'An arcaded square with palm trees, and street lamps designed by a young Antoni Gaudí.' },
        nl: { name: 'Plaça Reial', text: 'Een plein met arcades en palmbomen, en straatlantaarns ontworpen door een jonge Antoni Gaudí.' },
      },
    },
    {
      emoji: '🧭', at: [330, 743], look: [320, 30, 808],
      text: {
        en: { name: 'Monument a Colom', text: 'Columbus on top of a 60-metre column at the bottom of the Rambla, pointing out to sea.' },
        nl: { name: 'Monument a Colom', text: 'Columbus boven op een zuil van 60 meter onderaan de Rambla, met zijn vinger naar zee.' },
      },
    },
    {
      emoji: '🏛️', at: [224, -160], look: [236, 6, -146],
      text: {
        en: { name: 'Plaça de Sant Jaume', text: 'The government of Catalonia and the city hall of Barcelona face each other here, where the Roman forum was.' },
        nl: { name: 'Plaça de Sant Jaume', text: 'De regering van Catalonië en het stadhuis van Barcelona kijken elkaar hier aan, waar het Romeinse forum lag.' },
      },
    },
    {
      emoji: '⛪', at: [180, -371], look: [152, 30, -326],
      text: {
        en: { name: 'Catedral', text: 'The Gothic cathedral of Santa Eulàlia. Thirteen white geese live in its cloister, one for each year of the young saint’s life.' },
        nl: { name: 'Catedral', text: 'De gotische kathedraal van Santa Eulàlia. In de kloostergang leven dertien witte ganzen, een voor elk jaar van de jonge heilige.' },
      },
    },
  ],
  // it sets off at night (core/js/main.js), it is day as soon as it is on its way, and evening at the end
  skies: [
    { at: [-451, -610], sky: 'day:clear' },
    { at: [-85, -457], sky: 'night:clear' },
  ],
  end: { look: [-495, 15, -740] },
  names: [
    { name: 'Plaça de Catalunya', at: [-400, -687] },
    { name: 'Carrer de Pelai', at: [-482, -567] },
    { name: 'La Rambla', at: [-512, -544] },
    { name: 'Plaça del Portal de la Pau', at: [282, 720] },
    { name: 'Passeig de Colom', at: [338, 735] },
    { name: 'Plaça del Duc de Medinaceli', at: [476, 505] },
    { name: 'Carrer Ample', at: [399, 460] },
    { name: 'Carrer d’Avinyó', at: [512, 220] },
    { name: 'Carrer de Ferran', at: [120, -6] },
    { name: 'Plaça de Sant Jaume', at: [210, -111] },
    { name: 'Carrer del Paradís', at: [242, -189] },
    { name: 'Carrer de la Pietat', at: [229, -271] },
    { name: 'Carrer dels Comtes', at: [250, -304] },
    { name: 'Pla de la Seu', at: [166, -384] },
    { name: 'Avinguda de la Catedral', at: [140, -399] },
    { name: 'Carrer dels Arcs', at: [28, -381] },
    { name: 'Avinguda del Portal de l’Àngel', at: [-63, -434] },
    { name: 'Carrer de Fontanella', at: [-324, -742] },
  ],
};
