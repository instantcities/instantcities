// Bruges's sights: ride up to one while exploring and a card tells you what you are looking at.
// Made by tools/sights.mjs from _data/landmarks/bruges.json; { id, emoji, x, z (game metres), r (how close), text: { <lang>: { name, text } } }.
export const SIGHTS = [
  {
    id: "markt", emoji: "🏰", x: -44.1, z: -305.9, r: 60,
    text: { en: { name: "Markt", text: "Bruges’ market square, with the Belfry on its south side and the Provincial Court on the east." } },
  },
  {
    id: "belfort", emoji: "🔔", x: -0.5, z: -250.6, r: 60,
    text: { en: { name: "Belfry", text: "The 83-metre belfry over the Markt: 366 steps up to its carillon of 47 bells." } },
  },
  {
    id: "burg", emoji: "⚖️", x: 217.5, z: -223.0, r: 60,
    text: { en: { name: "Burg", text: "The square of the city hall, the Basilica of the Holy Blood and the old court." } },
  },
  {
    id: "stadhuis", emoji: "🏛️", x: 243.6, z: -153.9, r: 60,
    text: { en: { name: "City Hall", text: "One of the oldest city halls in the Low Countries, begun in 1376, with a Gothic Hall full of murals." } },
  },
  {
    id: "heilig-bloedbasiliek", emoji: "🩸", x: 182.6, z: -181.5, r: 60,
    text: { en: { name: "Basilica of the Holy Blood", text: "A Romanesque chapel with a Gothic one above it, holding a relic of the blood of Christ." } },
  },
  {
    id: "rozenhoedkaai", emoji: "📸", x: 243.6, z: 12.0, r: 60,
    text: { en: { name: "Rozenhoedkaai", text: "The most photographed corner of Bruges, where the canal turns under the Belfry." } },
  },
  {
    id: "gruuthuse", emoji: "🍺", x: 60.5, z: 177.9, r: 60,
    text: { en: { name: "Gruuthuse", text: "The palace of the lords of Gruuthuse, who could tax gruut, the herbs for brewing beer." } },
  },
  {
    id: "onze-lieve-vrouwekerk", emoji: "⛪", x: -17.9, z: 274.6, r: 60,
    text: { en: { name: "Church of Our Lady", text: "Its brick tower of 115 metres is one of the tallest in the world; inside is Michelangelo’s Madonna." } },
  },
  {
    id: "sint-salvatorskathedraal", emoji: "⛪", x: -235.9, z: 164.0, r: 60,
    text: { en: { name: "St Saviour’s Cathedral", text: "Bruges’ oldest parish church, which became its cathedral in the 19th century." } },
  },
  {
    id: "begijnhof", emoji: "🌳", x: -105.1, z: 716.9, r: 60,
    text: { en: { name: "Begijnhof", text: "The beguinage of 1245: white houses round a lawn of tall trees, still home to a community of nuns." } },
  },
  {
    id: "minnewater", emoji: "🦢", x: 112.8, z: 786.0, r: 60,
    text: { en: { name: "Minnewater", text: "The “lake of love” at the south end of the old town, with swans and a lock house." } },
  },
];
