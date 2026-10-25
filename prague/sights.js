// Prague's sights: ride up to one while exploring and a card tells you what you are looking at.
// Made by tools/sights.mjs from _data/landmarks/prague.json; { id, emoji, x, z (game metres), r (how close), text: { <lang>: { name, text } } }.
export const SIGHTS = [
  {
    id: "staromestske-namesti", emoji: "⛪", x: 289.9, z: 32.0, r: 60,
    text: { en: { name: "Old Town Square", text: "The great square of the Old Town, with the Týn church, the astronomical clock and the Jan Hus memorial." } },
  },
  {
    id: "orloj", emoji: "🕰️", x: 245.3, z: 101.1, r: 60,
    text: { en: { name: "Astronomical clock", text: "Made in 1410: every hour the twelve apostles pass its little windows while Death rings his bell." } },
  },
  {
    id: "tyn", emoji: "⛪", x: 414.9, z: 4.4, r: 60,
    text: { en: { name: "Týn Church", text: "The Gothic church with two spiky 80-metre towers, behind the houses on the Old Town Square." } },
  },
  {
    id: "karluv-most", emoji: "🌉", x: -593.9, z: 170.2, r: 60,
    text: { en: { name: "Charles Bridge", text: "The stone bridge of 1357 across the Vltava, lined with thirty statues of saints." } },
  },
  {
    id: "mostecka-vez", emoji: "🏰", x: -397.5, z: 211.7, r: 60,
    text: { en: { name: "Old Town Bridge Tower", text: "The Gothic gate tower at the Old Town end of the Charles Bridge, one of the finest in Europe." } },
  },
  {
    id: "klementinum", emoji: "📚", x: -156.5, z: 184.0, r: 60,
    text: { en: { name: "Klementinum", text: "The vast Jesuit college beside the bridge, with a Baroque library hall and an astronomical tower." } },
  },
  {
    id: "josefov", emoji: "✡️", x: 75.7, z: -327.4, r: 60,
    text: { en: { name: "Josefov", text: "Prague’s Jewish Quarter, with old synagogues and the Old Jewish Cemetery." } },
  },
  {
    id: "staronova-synagoga", emoji: "🕍", x: 40.0, z: -355.0, r: 60,
    text: { en: { name: "Old-New Synagogue", text: "Built around 1270, the oldest synagogue in Europe still in use." } },
  },
  {
    id: "rudolfinum", emoji: "🎻", x: -272.5, z: -313.5, r: 60,
    text: { en: { name: "Rudolfinum", text: "The neo-Renaissance concert hall on the Vltava, home of the Czech Philharmonic." } },
  },
  {
    id: "prasna-brana", emoji: "🗼", x: 843.5, z: 73.5, r: 60,
    text: { en: { name: "Powder Tower", text: "A Gothic gate tower of 1475 at the start of the Royal Route, once used to store gunpowder." } },
  },
  {
    id: "prazsky-hrad", emoji: "🏰", x: -1567.1, z: -368.8, r: 60,
    text: { en: { name: "Prague Castle", text: "The castle on the hill across the river, the largest ancient castle complex in the world; beyond this map." } },
  },
];
