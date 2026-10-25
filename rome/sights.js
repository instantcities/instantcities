// Rome's sights: ride up to one while exploring and a card tells you what you are looking at.
// Made by tools/sights.mjs from _data/landmarks/rome.json; { id, emoji, x, z (game metres), r (how close), text: { <lang>: { name, text } } }.
export const SIGHTS = [
  {
    id: "colosseo", emoji: "🏟️", x: 1431.7, z: 1193.2, r: 140,
    text: { en: { name: "Colosseum", text: "The great amphitheatre of ancient Rome, opened in AD 80 for gladiator fights before some 50,000 people." } },
  },
  {
    id: "pantheon", emoji: "🏛️", x: -153.1, z: 32.2, r: 60,
    text: { en: { name: "Pantheon", text: "A temple to all the gods rebuilt under Hadrian, with the largest unreinforced concrete dome in the world." } },
  },
  {
    id: "fontana-di-trevi", emoji: "⛲", x: 509.8, z: -285.7, r: 60,
    text: { en: { name: "Trevi Fountain", text: "Rome’s grandest fountain, where a coin thrown over your shoulder means you will come back." } },
  },
  {
    id: "piazza-navona", emoji: "🗿", x: -546.7, z: -50.8, r: 60,
    text: { en: { name: "Piazza Navona", text: "A long Baroque square on the outline of Domitian’s stadium, with Bernini’s Fountain of the Four Rivers." } },
  },
  {
    id: "foro-romano", emoji: "🏺", x: 717.0, z: 875.3, r: 60,
    text: { en: { name: "Roman Forum", text: "The heart of ancient Rome: temples, basilicas and the Senate house, in a valley between the hills." } },
  },
  {
    id: "vittoriano", emoji: "🦅", x: 489.1, z: 585.0, r: 60,
    text: { en: { name: "Vittoriano", text: "The huge white marble monument to Victor Emmanuel II on Piazza Venezia, nicknamed the typewriter." } },
  },
  {
    id: "campo-de-fiori", emoji: "🌸", x: -639.9, z: 446.8, r: 60,
    text: { en: { name: "Campo de’ Fiori", text: "A lively square with a morning market and, in the middle, the hooded statue of Giordano Bruno." } },
  },
  {
    id: "colonna-di-marco-aurelio", emoji: "🗼", x: 168.0, z: -299.5, r: 60,
    text: { en: { name: "Column of Marcus Aurelius", text: "A marble column carved with the emperor’s wars along the Danube, standing on Piazza Colonna since the 2nd century." } },
  },
  {
    id: "largo-di-torre-argentina", emoji: "🐈", x: -163.4, z: 460.6, r: 60,
    text: { en: { name: "Largo di Torre Argentina", text: "Four temples of the Republic sunk below the street, beside the spot where Julius Caesar was murdered." } },
  },
];
