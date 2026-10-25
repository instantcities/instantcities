// Vienna's sights: ride up to one while exploring and a card tells you what you are looking at.
// Made by tools/sights.mjs from _data/landmarks/vienna.json; { id, emoji, x, z (game metres), r (how close), text: { <lang>: { name, text } } }.
export const SIGHTS = [
  {
    id: "stephansdom", emoji: "⛪", x: 619.8, z: -308.5, r: 60,
    text: { en: { name: "St Stephen’s Cathedral", text: "Vienna’s Gothic cathedral, with its 136-metre south tower and a roof of glazed tiles in zigzags." } },
  },
  {
    id: "graben", emoji: "🛍️", x: 286.0, z: -336.1, r: 60,
    text: { en: { name: "Graben", text: "Vienna’s grand shopping street on the line of the Roman ditch, with the Plague Column in the middle." } },
  },
  {
    id: "pestsaule", emoji: "🕯️", x: 258.1, z: -322.3, r: 60,
    text: { en: { name: "Plague Column", text: "The Baroque column of clouds and angels put up after the plague of 1679." } },
  },
  {
    id: "hofburg", emoji: "👑", x: -85.0, z: -45.9, r: 60,
    text: { en: { name: "Hofburg", text: "The Habsburgs’ winter palace for six centuries, now the seat of Austria’s president." } },
  },
  {
    id: "michaelerplatz", emoji: "🏛️", x: -1.5, z: -239.4, r: 60,
    text: { en: { name: "Michaelerplatz", text: "The round square at the Hofburg’s gate, where Roman ruins and Adolf Loos’ plain house face the palace." } },
  },
  {
    id: "spanische-hofreitschule", emoji: "🐎", x: 54.1, z: -197.9, r: 60,
    text: { en: { name: "Spanish Riding School", text: "The white Lipizzaner stallions dance in a Baroque riding hall inside the Hofburg." } },
  },
  {
    id: "staatsoper", emoji: "🎶", x: 239.6, z: 451.7, r: 60,
    text: { en: { name: "State Opera", text: "Opened in 1869, the first great building on the Ringstraße and one of the world’s great opera houses." } },
  },
  {
    id: "albertina", emoji: "🖼️", x: 156.1, z: 244.4, r: 60,
    text: { en: { name: "Albertina", text: "A Habsburg palace with one of the world’s largest collections of prints and drawings, Dürer’s Hare among them." } },
  },
  {
    id: "burgtheater", emoji: "🎭", x: -483.7, z: -571.1, r: 60,
    text: { en: { name: "Burgtheater", text: "One of the most important German-language theatres, on the Ringstraße, opposite the town hall." } },
  },
];
