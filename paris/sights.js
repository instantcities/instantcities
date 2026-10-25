// Paris's sights: ride up to one while exploring and a card tells you what you are looking at.
// Made by tools/sights.mjs from _data/landmarks/paris.json; { id, emoji, x, z (game metres), r (how close), text: { <lang>: { name, text } } }.
export const SIGHTS = [
  {
    id: "notre-dame", emoji: "⛪", x: 325.8, z: 508.6, r: 60,
    text: { en: { name: "Notre-Dame", text: "The Gothic cathedral on the Île de la Cité, begun in 1163 and open again since the fire of 2019." } },
  },
  {
    id: "sainte-chapelle", emoji: "✨", x: -122.9, z: 176.9, r: 60,
    text: { en: { name: "Sainte-Chapelle", text: "Louis IX’s royal chapel of 1248, its walls almost all stained glass." } },
  },
  {
    id: "louvre", emoji: "🖼️", x: -800.4, z: -541.9, r: 60,
    text: { en: { name: "Louvre", text: "A royal palace turned into the world’s most visited museum, with the glass pyramid in its courtyard." } },
  },
  {
    id: "pont-neuf", emoji: "🌉", x: -461.6, z: -71.9, r: 60,
    text: { en: { name: "Pont Neuf", text: "The “new bridge”, which is in fact the oldest bridge still standing across the Seine in Paris." } },
  },
  {
    id: "hotel-de-ville", emoji: "🏛️", x: 536.3, z: 11.0, r: 60,
    text: { en: { name: "Hôtel de Ville", text: "The city hall of Paris, on this spot since 1357 and rebuilt after the Commune burned it in 1871." } },
  },
  {
    id: "conciergerie", emoji: "⚖️", x: -67.9, z: 93.9, r: 60,
    text: { en: { name: "Conciergerie", text: "A medieval royal palace on the island, later the prison where Marie-Antoinette awaited the guillotine." } },
  },
  {
    id: "tour-saint-jacques", emoji: "🗼", x: 225.0, z: -182.5, r: 60,
    text: { en: { name: "Tour Saint-Jacques", text: "A lone Gothic bell tower, all that remains of a church on the pilgrims’ road to Santiago." } },
  },
  {
    id: "centre-pompidou", emoji: "🎨", x: 536.3, z: -541.9, r: 60,
    text: { en: { name: "Centre Pompidou", text: "The museum of modern art with its pipes, ducts and escalators on the outside, opened in 1977." } },
  },
];
