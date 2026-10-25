// Barcelona's sights: ride up to one while exploring and a card tells you what you are looking at.
// Made by tools/sights.mjs from _data/landmarks/barcelona.json; { id, emoji, x, z (game metres), r (how close), text: { <lang>: { name, text } } }.
export const SIGHTS = [
  {
    id: "la-rambla", emoji: "🚶", x: -181.6, z: 19.7, r: 60,
    text: { en: { name: "La Rambla", text: "The tree-lined promenade from Plaça de Catalunya down to the sea, Barcelona’s busiest street." } },
  },
  {
    id: "placa-de-catalunya", emoji: "⛲", x: -494.9, z: -740.5, r: 60,
    text: { en: { name: "Plaça de Catalunya", text: "The great square where the old town meets the 19th-century Eixample." } },
  },
  {
    id: "la-boqueria", emoji: "🍓", x: -327.8, z: -21.7, r: 60,
    text: { en: { name: "La Boqueria", text: "Barcelona’s most famous market, under an iron roof just off the Rambla." } },
  },
  {
    id: "liceu", emoji: "🎭", x: -129.4, z: 144.1, r: 60,
    text: { en: { name: "Gran Teatre del Liceu", text: "The opera house on the Rambla, opened in 1847 and rebuilt after a fire in 1994." } },
  },
  {
    id: "placa-reial", emoji: "🌴", x: 48.1, z: 213.2, r: 60,
    text: { en: { name: "Plaça Reial", text: "An arcaded square with palm trees and lamps designed by a young Antoni Gaudí." } },
  },
  {
    id: "catedral", emoji: "⛪", x: 152.5, z: -325.8, r: 60,
    text: { en: { name: "Cathedral", text: "The Gothic cathedral of Santa Eulàlia, with thirteen white geese in its cloister." } },
  },
  {
    id: "placa-de-sant-jaume", emoji: "🏛️", x: 236.0, z: -146.1, r: 60,
    text: { en: { name: "Plaça de Sant Jaume", text: "The square where the government of Catalonia and the city hall face each other, on the old Roman forum." } },
  },
  {
    id: "monument-a-colom", emoji: "🧭", x: 319.5, z: 807.6, r: 60,
    text: { en: { name: "Columbus Monument", text: "Columbus on a 60-metre column at the bottom of the Rambla, pointing out to sea." } },
  },
  {
    id: "barri-gotic", emoji: "🏰", x: 131.6, z: -187.6, r: 60,
    text: { en: { name: "Gothic Quarter", text: "The maze of narrow medieval lanes at the heart of the old town, on top of Roman Barcino." } },
  },
  {
    id: "palau-de-la-musica", emoji: "🎶", x: 58.5, z: -809.6, r: 60,
    text: { en: { name: "Palau de la Música Catalana", text: "A concert hall of Catalan Modernism, all mosaic, stained glass and sculpture." } },
  },
  {
    id: "sagrada-familia", emoji: "⛪", x: -35.5, z: -3034.9, r: 60,
    text: { en: { name: "Sagrada Família", text: "Gaudí’s basilica, under construction since 1882; it lies beyond this small map, in the Eixample." } },
  },
];
