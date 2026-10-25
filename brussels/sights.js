// Brussels's sights: ride up to one while exploring and a card tells you what you are looking at.
// Made by tools/sights.mjs from _data/landmarks/brussels.json; { id, emoji, x, z (game metres), r (how close), text: { <lang>: { name, text } } }.
export const SIGHTS = [
  {
    id: "grand-place", emoji: "🌸", x: 118.3, z: 0.2, r: 60,
    text: { en: { name: "Grand-Place", text: "Guild houses and a Gothic town hall round one of the most beautiful squares in Europe." } },
  },
  {
    id: "hotel-de-ville", emoji: "🏛️", x: 48.0, z: 55.5, r: 60,
    text: { en: { name: "Town Hall", text: "The Gothic town hall with its 96-metre tower, topped by Saint Michael slaying the dragon." } },
  },
  {
    id: "maison-du-roi", emoji: "👑", x: 144.6, z: -41.3, r: 60,
    text: { en: { name: "King’s House", text: "The neo-Gothic house facing the town hall, home of the city museum and Manneken Pis’ wardrobe." } },
  },
  {
    id: "manneken-pis", emoji: "💦", x: -101.4, z: 235.2, r: 60,
    text: { en: { name: "Manneken Pis", text: "A bronze boy barely half a metre tall, with a wardrobe of more than a thousand costumes." } },
  },
  {
    id: "galeries-saint-hubert", emoji: "🛍️", x: 329.1, z: -179.5, r: 60,
    text: { en: { name: "Galeries Royales Saint-Hubert", text: "One of the first covered shopping arcades in Europe, opened in 1847 under a glass roof." } },
  },
  {
    id: "bourse", emoji: "📈", x: -127.7, z: -221.0, r: 60,
    text: { en: { name: "Bourse", text: "The old stock exchange of 1873, on a boulevard that has been free of cars since 2015." } },
  },
  {
    id: "cathedrale", emoji: "⛪", x: 777.2, z: -179.5, r: 60,
    text: { en: { name: "Cathedral of St Michael and St Gudula", text: "Brussels’ Gothic cathedral on the slope towards the upper town, where royal weddings are held." } },
  },
  {
    id: "mont-des-arts", emoji: "🌳", x: 513.6, z: 373.4, r: 60,
    text: { en: { name: "Mont des Arts", text: "The garden steps between the lower and the upper town, with a view over the city." } },
  },
  {
    id: "sablon", emoji: "🍫", x: 425.8, z: 788.0, r: 60,
    text: { en: { name: "Sablon", text: "The square of antique dealers and chocolatiers, below the Gothic church of Notre-Dame du Sablon." } },
  },
];
