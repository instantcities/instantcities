// Venice's sights: ride up to one while exploring and a card tells you what you are looking at.
// Made by tools/sights.mjs from _data/landmarks/venice.json; { id, emoji, x, z (game metres), r (how close), text: { <lang>: { name, text } } }.
export const SIGHTS = [
  {
    id: "piazza-san-marco", emoji: "🕊️", x: 139.6, z: 267.6, r: 60,
    text: { en: { name: "Piazza San Marco", text: "The only square in Venice called a piazza, ringed by arcades and opening onto the lagoon." } },
  },
  {
    id: "basilica-di-san-marco", emoji: "⛪", x: 227.5, z: 226.1, r: 60,
    text: { en: { name: "St Mark’s Basilica", text: "Built for the relics of Saint Mark, covered inside with golden mosaics." } },
  },
  {
    id: "palazzo-ducale", emoji: "🏰", x: 295.9, z: 336.7, r: 60,
    text: { en: { name: "Doge’s Palace", text: "The pink and white Gothic palace from which the doges ruled the Republic of Venice." } },
  },
  {
    id: "campanile", emoji: "🔔", x: 159.2, z: 295.2, r: 60,
    text: { en: { name: "Campanile di San Marco", text: "The bell tower of St Mark’s, which fell down in 1902 and was rebuilt “where it was, as it was”." } },
  },
  {
    id: "ponte-dei-sospiri", emoji: "😮‍💨", x: 344.7, z: 295.2, r: 60,
    text: { en: { name: "Bridge of Sighs", text: "The covered stone bridge between the Doge’s Palace and the prisons, built in 1600." } },
  },
  {
    id: "ponte-di-rialto", emoji: "🌉", x: -143.5, z: -257.6, r: 60,
    text: { en: { name: "Rialto Bridge", text: "The stone bridge of 1591 over the Grand Canal, with shops along its arch." } },
  },
  {
    id: "mercerie", emoji: "🛍️", x: 12.7, z: -8.9, r: 60,
    text: { en: { name: "Mercerie", text: "The chain of narrow shopping lanes from St Mark’s to the Rialto, the race route in the game." } },
  },
  {
    id: "la-fenice", emoji: "🎭", x: -368.1, z: 336.7, r: 60,
    text: { en: { name: "La Fenice", text: "Venice’s opera house, which has risen from its ashes more than once, as its name promises." } },
  },
];
