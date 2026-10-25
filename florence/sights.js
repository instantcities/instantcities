// Florence's sights: ride up to one while exploring and a card tells you what you are looking at.
// Made by tools/sights.mjs from _data/landmarks/florence.json; { id, emoji, x, z (game metres), r (how close), text: { <lang>: { name, text } } }.
export const SIGHTS = [
  {
    id: "duomo", emoji: "🔴", x: 266.2, z: -332.2, r: 60,
    text: { en: { name: "Duomo", text: "Florence’s cathedral, crowned by Brunelleschi’s dome, still the largest brick dome ever built." } },
  },
  {
    id: "campanile-di-giotto", emoji: "🔔", x: 205.9, z: -290.7, r: 60,
    text: { en: { name: "Giotto’s Bell Tower", text: "The slender bell tower beside the cathedral, clad in white, green and pink marble." } },
  },
  {
    id: "battistero", emoji: "🚪", x: 155.7, z: -332.2, r: 60,
    text: { en: { name: "Baptistery", text: "The octagonal baptistery with Ghiberti’s bronze doors, which Michelangelo called the Gates of Paradise." } },
  },
  {
    id: "piazza-della-signoria", emoji: "🗿", x: 246.1, z: 151.6, r: 60,
    text: { en: { name: "Piazza della Signoria", text: "The square of the Palazzo Vecchio, with a copy of Michelangelo’s David at its door." } },
  },
  {
    id: "palazzo-vecchio", emoji: "🏰", x: 296.4, z: 179.3, r: 60,
    text: { en: { name: "Palazzo Vecchio", text: "Florence’s fortress-like town hall since 1299, with its tall tower off to one side." } },
  },
  {
    id: "loggia-dei-lanzi", emoji: "🛡️", x: 226.0, z: 206.9, r: 60,
    text: { en: { name: "Loggia dei Lanzi", text: "An open arcade on the square, full of statues, among them Cellini’s Perseus with the head of Medusa." } },
  },
  {
    id: "uffizi", emoji: "🖼️", x: 195.9, z: 400.4, r: 60,
    text: { en: { name: "Uffizi", text: "The Medici’s offices turned into one of the world’s great museums, with Botticelli’s Birth of Venus." } },
  },
  {
    id: "ponte-vecchio", emoji: "💍", x: -25.2, z: 372.8, r: 60,
    text: { en: { name: "Ponte Vecchio", text: "The bridge of goldsmiths over the Arno, the only one the retreating Germans left standing in 1944." } },
  },
  {
    id: "piazza-della-repubblica", emoji: "🎠", x: 55.2, z: -97.2, r: 60,
    text: { en: { name: "Piazza della Repubblica", text: "Where the Roman forum was, now a square with a carousel and old cafés under a triumphal arch." } },
  },
  {
    id: "santa-croce", emoji: "⛪", x: 889.2, z: 289.8, r: 60,
    text: { en: { name: "Santa Croce", text: "The great Franciscan church where Michelangelo, Galileo and Machiavelli are buried." } },
  },
  {
    id: "santa-maria-novella", emoji: "⛪", x: -417.1, z: -525.7, r: 60,
    text: { en: { name: "Santa Maria Novella", text: "The Dominican church with its white and green marble front by Alberti, by the station that bears its name." } },
  },
  {
    id: "il-porcellino", emoji: "🐗", x: 35.1, z: 137.8, r: 60,
    text: { en: { name: "Il Porcellino", text: "The bronze boar at the Mercato Nuovo: rub its nose and you will come back to Florence." } },
  },
];
