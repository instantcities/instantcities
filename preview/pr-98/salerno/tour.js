// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [-14, -94, 3], [-5, -123, 16], [2, -148], [12, -170], [41, -166], [70, -158], [99, -149], [124, -143],
    [151, -131], [178, -117], [206, -104], [229, -91], [253, -79], [280, -66], [303, -55], [328, -42],
    [357, -29], [385, -17], [414, -5], [442, 7], [463, 23], [451, 50], [437, 72], [421, 99],
    [410, 118], [391, 147], [375, 172], [347, 162], [319, 150], [291, 138], [263, 127], [235, 115],
    [208, 103], [180, 91], [152, 79], [124, 67], [96, 56], [68, 44], [40, 33], [12, 22],
    [-16, 10], [-44, -1], [-71, -13], [-99, -25], [-123, -34], [-152, -44], [-178, -49], [-204, -52],
    [-230, -53], [-261, -52], [-292, -49], [-323, -46], [-354, -42], [-385, -40], [-411, -36], [-442, -29],
    [-462, -37], [-457, -68], [-452, -98], [-450, -125], [-439, -148], [-409, -144], [-379, -140], [-349, -136],
    [-319, -133], [-287, -127], [-261, -121], [-232, -112], [-203, -101], [-174, -91], [-146, -80], [-117, -69],
    [-92, -59], [-63, -48], [-36, -37], [-21, -59], [-16, -83], [-14, -94],
  ],
  stops: [
    {
      emoji: '⛪', at: [12, -170], look: [114, 30, -301],
      text: {
        en: { name: 'Duomo di San Matteo', text: 'Salerno’s cathedral, built by the Norman Robert Guiscard in 1084 over the tomb of Saint Matthew the Evangelist.' },
        nl: { name: 'Duomo di San Matteo', text: 'De kathedraal van Salerno, in 1084 gebouwd door de Normandiër Robert Guiscard boven het graf van de evangelist Matteüs.' },
      },
    },
    {
      emoji: '🛍️', at: [124, -143], look: [206, 6, -104],
      text: {
        en: { name: 'Via dei Mercanti', text: 'The medieval merchants’ street, a narrow lane of shops through the old town, as busy now as in the Middle Ages.' },
        nl: { name: 'Via dei Mercanti', text: 'De middeleeuwse straat van de kooplui, een smal winkelstraatje door de oude stad, nog even druk als toen.' },
      },
    },
    {
      emoji: '🚶', at: [414, -5], look: [560, 6, 45],
      text: {
        en: { name: 'Corso Vittorio Emanuele', text: 'Salerno’s long shopping street, closed to cars, where the whole town walks up and down in the evening for the passeggiata.' },
        nl: { name: 'Corso Vittorio Emanuele', text: 'De lange winkelstraat van Salerno, autovrij, waar ’s avonds de hele stad op en neer wandelt voor de passeggiata.' },
      },
    },
    {
      emoji: '🌴', at: [124, 67], look: [69, 2, 260],
      text: {
        en: { name: 'Lungomare Trieste', text: 'The seafront promenade under palms and holm oaks, with the Gulf of Salerno in front and the Amalfi Coast on the horizon.' },
        nl: { name: 'Lungomare Trieste', text: 'De zeedijk onder palmen en steeneiken, met de Golf van Salerno ervoor en de Amalfikust aan de horizon.' },
      },
    },
    {
      emoji: '🎭', at: [-450, -125], look: [-640, 8, -100],
      text: {
        en: { name: 'Villa Comunale and Teatro Verdi', text: 'The town’s 19th-century garden, with the opera house of 1872 beside it, built to look like the San Carlo in Naples.' },
        nl: { name: 'Villa Comunale en Teatro Verdi', text: 'De stadstuin uit de 19e eeuw, met daarnaast het operahuis uit 1872, gebouwd naar het voorbeeld van het San Carlo in Napels.' },
      },
    },
  ],
  // a clear day from the start, and night near the end, when the Luci d'Artista would light the streets
  skies: [
    { at: [70, -158], sky: 'day:clear' },
    { at: [-117, -69], sky: 'night:clear' },
  ],
  end: { look: [114, 25, -301] },
  names: [
    { name: 'Via Duomo', at: [-14, -94] },
    { name: 'Via dei Mercanti', at: [12, -170] },
    { name: 'Piazza Sedile di Portanova', at: [303, -55] },
    { name: 'Corso Vittorio Emanuele', at: [357, -29] },
    { name: 'Via Velia', at: [463, 23] },
    { name: 'Lungomare Trieste', at: [375, 172] },
    { name: 'Traversa Giuseppe Verdi', at: [-462, -37] },
    { name: 'Via Roma', at: [-439, -148] },
    { name: 'Via Duomo', at: [-36, -37] },
  ],
};
