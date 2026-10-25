// London's sights: ride up to one while exploring and a card tells you what you are looking at.
// Made by tools/sights.mjs from _data/landmarks/london.json; { id, emoji, x, z (game metres), r (how close), text: { <lang>: { name, text } } }.
export const SIGHTS = [
  {
    id: "big-ben", emoji: "🕰️", x: 36.0, z: 475.7, r: 60,
    text: { en: { name: "Big Ben", text: "The great bell in the clock tower of the Houses of Parliament, whose tower is now the Elizabeth Tower." } },
  },
  {
    id: "houses-of-parliament", emoji: "🏛️", x: 18.7, z: 641.6, r: 60,
    text: { en: { name: "Houses of Parliament", text: "The Palace of Westminster on the Thames, rebuilt in Gothic style after the fire of 1834." } },
  },
  {
    id: "westminster-abbey", emoji: "⛪", x: -197.8, z: 669.2, r: 60,
    text: { en: { name: "Westminster Abbey", text: "The church where English and British monarchs have been crowned since 1066." } },
  },
  {
    id: "trafalgar-square", emoji: "🦁", x: -267.1, z: -533.3, r: 60,
    text: { en: { name: "Trafalgar Square", text: "Nelson on his column, four bronze lions and the National Gallery along the north side." } },
  },
  {
    id: "national-gallery", emoji: "🖼️", x: -284.5, z: -657.7, r: 60,
    text: { en: { name: "National Gallery", text: "Britain’s collection of European paintings, free to visit, along the north side of Trafalgar Square." } },
  },
  {
    id: "downing-street", emoji: "🚪", x: -223.8, z: 102.5, r: 60,
    text: { en: { name: "Downing Street", text: "Number 10, the home of British prime ministers since 1735, behind black gates off Whitehall." } },
  },
  {
    id: "horse-guards", emoji: "🐎", x: -189.2, z: -118.6, r: 60,
    text: { en: { name: "Horse Guards", text: "Mounted troopers of the Household Cavalry stand sentry on Whitehall every day." } },
  },
  {
    id: "london-eye", emoji: "🎡", x: 469.1, z: 116.4, r: 60,
    text: { en: { name: "London Eye", text: "The giant observation wheel across the Thames, built for the year 2000." } },
  },
  {
    id: "westminster-bridge", emoji: "🌉", x: 269.9, z: 461.9, r: 60,
    text: { en: { name: "Westminster Bridge", text: "The green bridge over the Thames beside Big Ben, painted the colour of the House of Commons’ benches." } },
  },
];
