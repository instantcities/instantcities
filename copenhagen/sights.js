// Copenhagen's sights: ride up to one while exploring and a card tells you what you are looking at.
// Made by tools/sights.mjs from _data/landmarks/copenhagen.json; { id, emoji, x, z (game metres), r (how close), text: { <lang>: { name, text } } }.
export const SIGHTS = [
  {
    id: "nyhavn", emoji: "⛵", x: 692.6, z: -257.6, r: 60,
    text: { en: { name: "Nyhavn", text: "The 17th-century harbour of coloured houses, wooden ships and café terraces." } },
  },
  {
    id: "kongens-nytorv", emoji: "🐎", x: 355.3, z: -216.1, r: 60,
    text: { en: { name: "Kongens Nytorv", text: "The King’s New Square, with the Royal Danish Theatre and a bronze king on horseback." } },
  },
  {
    id: "christiansborg", emoji: "🏛️", x: -91.9, z: 253.9, r: 60,
    text: { en: { name: "Christiansborg", text: "The palace on Slotsholmen that holds the parliament, the prime minister’s office and the supreme court." } },
  },
  {
    id: "borsen", emoji: "🐉", x: 159.1, z: 309.1, r: 60,
    text: { en: { name: "Børsen", text: "Christian IV’s stock exchange of 1640, with a spire of four dragons’ tails, burned in 2024." } },
  },
  {
    id: "rundetaarn", emoji: "🔭", x: -429.3, z: -464.9, r: 60,
    text: { en: { name: "Round Tower", text: "Christian IV’s observatory of 1642, climbed by a spiral ramp instead of stairs." } },
  },
  {
    id: "stroget", emoji: "🛍️", x: -170.4, z: -91.7, r: 60,
    text: { en: { name: "Strøget", text: "One of the longest pedestrian shopping streets in Europe, from the City Hall Square to Kongens Nytorv." } },
  },
  {
    id: "radhuspladsen", emoji: "🏛️", x: -962.8, z: 309.1, r: 60,
    text: { en: { name: "City Hall Square", text: "The square in front of Copenhagen’s red-brick city hall, with its 105-metre tower." } },
  },
  {
    id: "tivoli", emoji: "🎢", x: -1025.6, z: 585.6, r: 60,
    text: { en: { name: "Tivoli", text: "One of the oldest amusement parks in the world, opened in 1843 in the middle of the city." } },
  },
  {
    id: "amalienborg", emoji: "👑", x: 928.0, z: -838.1, r: 60,
    text: { en: { name: "Amalienborg", text: "Four identical rococo palaces round an octagonal square, home of the Danish royal family." } },
  },
  {
    id: "lille-havfrue", emoji: "🧜", x: 1422.3, z: -2068.2, r: 60,
    text: { en: { name: "The Little Mermaid", text: "Edvard Eriksen’s statue of Andersen’s mermaid on a rock by the harbour, beyond this small map." } },
  },
];
