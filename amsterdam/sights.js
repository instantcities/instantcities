// Amsterdam's sights: ride up to one while exploring and a card tells you what you are looking at.
// Made by tools/sights.mjs from _data/landmarks/amsterdam.json; { id, emoji, x, z (game metres), r (how close), text: { <lang>: { name, text } } }.
export const SIGHTS = [
  {
    id: "dam", emoji: "🏛️", x: 178.7, z: -356.1, r: 60,
    text: { en: { name: "Dam", text: "The square on the dam built across the Amstel in the 13th century, which gave the city its name." } },
  },
  {
    id: "koninklijk-paleis", emoji: "👑", x: 68.3, z: -369.9, r: 60,
    text: { en: { name: "Royal Palace", text: "Built as the city hall of the Golden Age, made a palace by Louis Napoleon in 1808." } },
  },
  {
    id: "nieuwe-kerk", emoji: "⛪", x: 68.3, z: -508.1, r: 60,
    text: { en: { name: "Nieuwe Kerk", text: "The church on the Dam where Dutch kings and queens are sworn in." } },
  },
  {
    id: "begijnhof", emoji: "🌳", x: -50.7, z: 169.1, r: 60,
    text: { en: { name: "Begijnhof", text: "A hidden courtyard of old houses round a garden, behind a door off the Spui." } },
  },
  {
    id: "spui", emoji: "📖", x: -76.2, z: 252.1, r: 60,
    text: { en: { name: "Spui", text: "A small square of bookshops and cafés, with a book market on Fridays." } },
  },
  {
    id: "bloemenmarkt", emoji: "🌷", x: 68.3, z: 528.5, r: 60,
    text: { en: { name: "Flower market", text: "The floating flower market on the Singel, selling bulbs and flowers since 1862." } },
  },
  {
    id: "westerkerk", emoji: "🔔", x: -568.9, z: -577.2, r: 60,
    text: { en: { name: "Westerkerk", text: "The church on the Prinsengracht with the tallest tower in Amsterdam, crowned by an imperial crown." } },
  },
  {
    id: "anne-frank-huis", emoji: "📔", x: -551.9, z: -646.3, r: 60,
    text: { en: { name: "Anne Frank House", text: "The canal house where Anne Frank and her family hid from the Nazis and she wrote her diary." } },
  },
];
