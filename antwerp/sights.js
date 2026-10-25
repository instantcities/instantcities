// Antwerp's sights: ride up to one while exploring and a card tells you what you are looking at.
// Made by tools/sights.mjs from _data/landmarks/antwerp.json; { id, emoji, x, z (game metres), r (how close), text: { <lang>: { name, text } } }.
export const SIGHTS = [
  {
    id: "grote-markt", emoji: "🖐️", x: 16.3, z: -179.3, r: 60,
    text: { en: { name: "Grote Markt", text: "The square of the city hall and the guild houses, with the Brabo fountain in the middle." } },
  },
  {
    id: "brabofontein", emoji: "⛲", x: 33.7, z: -193.1, r: 60,
    text: { en: { name: "Brabo Fountain", text: "The Roman soldier Brabo throwing the giant’s hand away: the legend behind the city’s name." } },
  },
  {
    id: "stadhuis", emoji: "🏛️", x: -27.3, z: -165.5, r: 60,
    text: { en: { name: "City Hall", text: "A Renaissance city hall from 1565, all flags and columns, on the Grote Markt." } },
  },
  {
    id: "kathedraal", emoji: "⛪", x: 173.2, z: -41.1, r: 60,
    text: { en: { name: "Cathedral of Our Lady", text: "The largest Gothic church in the Low Countries, its spire 123 metres high, with four Rubens altarpieces." } },
  },
  {
    id: "het-steen", emoji: "🏰", x: -201.6, z: -372.8, r: 60,
    text: { en: { name: "Het Steen", text: "The oldest building in Antwerp, a castle on the Scheldt from the Middle Ages." } },
  },
  {
    id: "vleeshuis", emoji: "🥩", x: -62.1, z: -441.9, r: 60,
    text: { en: { name: "Vleeshuis", text: "The Gothic hall of the butchers’ guild, striped in brick and white stone." } },
  },
  {
    id: "groenplaats", emoji: "🎨", x: 129.6, z: 138.6, r: 60,
    text: { en: { name: "Groenplaats", text: "The square at the foot of the cathedral, with a statue of Rubens in the middle." } },
  },
  {
    id: "plantin-moretus", emoji: "📖", x: -131.8, z: 235.3, r: 60,
    text: { en: { name: "Plantin-Moretus", text: "The house and workshop of a great printing firm, with the two oldest printing presses in the world." } },
  },
  {
    id: "meir", emoji: "🛍️", x: 652.5, z: 207.7, r: 60,
    text: { en: { name: "Meir", text: "Antwerp’s great shopping street, lined with palaces and department stores." } },
  },
  {
    id: "rubenshuis", emoji: "🖌️", x: 966.3, z: 345.9, r: 60,
    text: { en: { name: "Rubenshuis", text: "The house and studio where Peter Paul Rubens lived and painted from 1610." } },
  },
];
