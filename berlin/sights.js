// Berlin's sights: ride up to one while exploring and a card tells you what you are looking at.
// Made by tools/sights.mjs from _data/landmarks/berlin.json; { id, emoji, x, z (game metres), r (how close), text: { <lang>: { name, text } } }.
export const SIGHTS = [
  {
    id: "brandenburger-tor", emoji: "🏛️", x: -659.0, z: -199.4, r: 60,
    text: { en: { name: "Brandenburg Gate", text: "The neoclassical gate of 1791 crowned by the Quadriga, symbol of a divided and reunited Germany." } },
  },
  {
    id: "reichstag", emoji: "🏛️", x: -786.0, z: -517.3, r: 60,
    text: { en: { name: "Reichstag", text: "The parliament building of 1894, crowned since 1999 by a glass dome you can walk up." } },
  },
  {
    id: "unter-den-linden", emoji: "🌳", x: 213.2, z: -296.2, r: 60,
    text: { en: { name: "Unter den Linden", text: "The boulevard under the lime trees, from the Brandenburg Gate to Museum Island." } },
  },
  {
    id: "gendarmenmarkt", emoji: "🎻", x: 611.1, z: 159.9, r: 60,
    text: { en: { name: "Gendarmenmarkt", text: "The French and the German church facing each other across the square, with the concert hall between." } },
  },
  {
    id: "holocaust-mahnmal", emoji: "🕯️", x: -574.3, z: 132.3, r: 60,
    text: { en: { name: "Holocaust Memorial", text: "The Memorial to the Murdered Jews of Europe: 2,711 concrete slabs on a sloping field." } },
  },
  {
    id: "bebelplatz", emoji: "📚", x: 721.2, z: -227.1, r: 60,
    text: { en: { name: "Bebelplatz", text: "The square where the Nazis burned books in 1933, now marked by a library of empty shelves under the ground." } },
  },
  {
    id: "museumsinsel", emoji: "🏺", x: 1110.7, z: -627.9, r: 60,
    text: { en: { name: "Museum Island", text: "Five great museums on an island in the Spree, from the Pergamon Altar to Nefertiti." } },
  },
  {
    id: "berliner-dom", emoji: "⛪", x: 1314.0, z: -586.5, r: 60,
    text: { en: { name: "Berlin Cathedral", text: "The great domed Protestant cathedral on Museum Island, finished in 1905." } },
  },
  {
    id: "fernsehturm", emoji: "📡", x: 2025.2, z: -821.4, r: 60,
    text: { en: { name: "TV Tower", text: "East Berlin’s 368-metre TV tower of 1969, with a ball that throws a cross of light in the sun." } },
  },
];
