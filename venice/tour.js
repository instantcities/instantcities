// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [20, 296, 3], [46, 281, 16], [73, 265], [99, 250], [126, 235], [152, 220], [160, 202], [167, 189],
    [149, 163], [146, 162], [136, 164], [120, 135], [107, 108], [94, 83], [102, 71], [99, 65],
    [74, 44], [49, 25], [32, 11], [18, -8], [-6, -27], [-31, -44], [-40, -55], [-32, -84],
    [-43, -92], [-34, -121], [-30, -150], [-59, -164], [-68, -169], [-70, -198], [-68, -204], [-91, -223],
    [-110, -239], [-134, -259], [-157, -279],
  ],
  stops: [
    {
      emoji: '🕊️', at: [126, 235], look: [140, 6, 268],
      text: {
        en: { name: 'Piazza San Marco', text: 'The only square in Venice that is called a piazza: all the others are campi.' },
        nl: { name: 'Piazza San Marco', text: 'Het enige plein in Venetië dat een piazza heet: alle andere zijn campi.' },
      },
    },
    {
      emoji: '⛪', at: [167, 189], look: [228, 6, 226],
      text: {
        en: { name: 'Basilica di San Marco', text: 'Built for the relics of Saint Mark, brought from Alexandria in 828, and covered inside with golden mosaics.' },
        nl: { name: 'Basilica di San Marco', text: 'Gebouwd voor de relieken van Sint-Marcus, in 828 uit Alexandrië gehaald, en vanbinnen bedekt met gouden mozaïeken.' },
      },
    },
    {
      emoji: '🗿', at: [-68, -204], look: [-46, 6, -230],
      text: {
        en: { name: 'Campo San Bartolomeo', text: 'The square at the foot of the Rialto bridge, where the playwright Carlo Goldoni stands in bronze.' },
        nl: { name: 'Campo San Bartolomeo', text: 'Het plein aan de voet van de Rialtobrug, waar toneelschrijver Carlo Goldoni in brons staat.' },
      },
    },
    {
      emoji: '🌉', at: [-68, -204], look: [-144, 6, -258],
      text: {
        en: { name: 'Ponte di Rialto', text: 'The stone bridge of 1591 over the Grand Canal, for centuries the only way across it on foot.' },
        nl: { name: 'Ponte di Rialto', text: 'De stenen brug uit 1591 over het Canal Grande, eeuwenlang de enige manier om er te voet over te komen.' },
      },
    },
  ],
  // it sets off at night (core/js/main.js), it is day as soon as it is on its way, and evening at the end
  skies: [
    { at: [99, 250], sky: 'day:clear' },
    { at: [-68, -204], sky: 'night:clear' },
  ],
  end: { look: [140, 15, 268] },
  names: [
    { name: 'Piazza San Marco', at: [20, 296] },
    { name: 'Piazzetta dei Leoncini', at: [160, 202] },
    { name: 'Calle del Pellegrin', at: [167, 189] },
    { name: 'Calle Larga San Marco', at: [146, 162] },
    { name: 'Marzaria dell’Orologio', at: [136, 164] },
    { name: 'Calle Fiubera', at: [94, 83] },
    { name: 'Campo San Zulian', at: [102, 71] },
    { name: 'Marzaria San Zulian', at: [99, 65] },
    { name: 'Ponte dei Bareteri', at: [32, 11] },
    { name: 'Marzaria del Capitello', at: [18, -8] },
    { name: 'Ramo San Salvador', at: [-40, -55] },
    { name: 'Marzaria San Salvador', at: [-32, -84] },
    { name: 'Calle dei Stagneri', at: [-43, -92] },
    { name: 'Campo San Bartolomeo', at: [-68, -169] },
    { name: 'Salizada Pio X', at: [-68, -204] },
    { name: 'Ponte di Rialto', at: [-110, -239] },
  ],
};
