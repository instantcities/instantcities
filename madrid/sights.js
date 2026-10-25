// Madrid's sights: ride up to one while exploring and a card tells you what you are looking at.
// Made by tools/sights.mjs from _data/landmarks/madrid.json; { id, emoji, x, z (game metres), r (how close), text: { <lang>: { name, text } } }.
export const SIGHTS = [
  {
    id: "puerta-del-sol", emoji: "☀️", x: 529.2, z: 134.9, r: 60,
    text: { en: { name: "Puerta del Sol", text: "Kilometre zero of Spain’s roads, where Spain eats its twelve grapes at midnight on New Year’s Eve." } },
  },
  {
    id: "oso-y-madrono", emoji: "🐻", x: 560.9, z: 121.1, r: 60,
    text: { en: { name: "Bear and Strawberry Tree", text: "The bronze bear reaching up into a strawberry tree, Madrid’s coat of arms on the Puerta del Sol." } },
  },
  {
    id: "plaza-mayor", emoji: "🏛️", x: 116.0, z: 328.4, r: 60,
    text: { en: { name: "Plaza Mayor", text: "The arcaded square of 1619, where Madrid held markets, bullfights and the trials of the Inquisition." } },
  },
  {
    id: "palacio-real", emoji: "👑", x: -615.0, z: -17.1, r: 60,
    text: { en: { name: "Royal Palace", text: "With more than 3,000 rooms the largest royal palace in western Europe, still used for state occasions." } },
  },
  {
    id: "almudena", emoji: "⛪", x: -646.8, z: 300.8, r: 60,
    text: { en: { name: "Almudena Cathedral", text: "Madrid’s cathedral, begun in 1883 and only consecrated in 1993, facing the Royal Palace." } },
  },
  {
    id: "plaza-de-oriente", emoji: "🌳", x: -371.3, z: -86.2, r: 60,
    text: { en: { name: "Plaza de Oriente", text: "The gardens between the Royal Palace and the opera, with a famous statue of Philip IV on a rearing horse." } },
  },
  {
    id: "teatro-real", emoji: "🎭", x: -265.4, z: -72.4, r: 60,
    text: { en: { name: "Teatro Real", text: "Madrid’s opera house, facing the Royal Palace across the Plaza de Oriente." } },
  },
  {
    id: "mercado-de-san-miguel", emoji: "🫒", x: -53.5, z: 342.3, r: 60,
    text: { en: { name: "Mercado de San Miguel", text: "An iron-and-glass market hall of 1916, now a gourmet food hall next to the Plaza Mayor." } },
  },
  {
    id: "plaza-de-la-villa", emoji: "🏰", x: -170.0, z: 356.1, r: 60,
    text: { en: { name: "Plaza de la Villa", text: "A small square of three buildings from three centuries, the old heart of Madrid’s government." } },
  },
  {
    id: "gran-via", emoji: "🎬", x: 274.9, z: -279.7, r: 60,
    text: { en: { name: "Gran Vía", text: "The great avenue of 1910 to the 1950s, Madrid’s Broadway of cinemas, theatres and early skyscrapers." } },
  },
];
