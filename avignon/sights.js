// Avignon's sights: ride up to one while exploring and a card tells you what you are looking at.
// Made by tools/sights.mjs from _data/landmarks/avignon.json; { id, emoji, x, z (game metres), r (how close), text: { <lang>: { name, text } } }.
export const SIGHTS = [
  {
    id: "palais-des-papes", emoji: "🏰", x: 304.4, z: -517.3, r: 60,
    text: { en: { name: "Palais des Papes", text: "The largest Gothic palace in the world, built when the popes lived in Avignon, from 1309 to 1377." } },
  },
  {
    id: "pont-saint-benezet", emoji: "🌉", x: 43.9, z: -945.7, r: 60,
    text: { en: { name: "Pont Saint-Bénezet", text: "The bridge of the song “Sur le pont d’Avignon”, of which only four arches are left." } },
  },
  {
    id: "place-de-l-horloge", emoji: "🕰️", x: 134.1, z: -309.9, r: 60,
    text: { en: { name: "Place de l’Horloge", text: "The town square, named after the Gothic clock tower behind the town hall, with a carousel and café terraces." } },
  },
  {
    id: "rocher-des-doms", emoji: "🌳", x: 264.3, z: -821.3, r: 60,
    text: { en: { name: "Rocher des Doms", text: "The rocky hill above the palace, a garden with a view over the Rhône and the bridge." } },
  },
  {
    id: "notre-dame-des-doms", emoji: "⛪", x: 314.4, z: -641.7, r: 60,
    text: { en: { name: "Notre-Dame des Doms", text: "The Romanesque cathedral beside the palace, topped by a gilded statue of the Virgin." } },
  },
  {
    id: "hotel-de-ville", emoji: "🏛️", x: 94.0, z: -282.3, r: 60,
    text: { en: { name: "Hôtel de Ville", text: "The town hall of 1856 on the Place de l’Horloge, built round an older Gothic tower." } },
  },
  {
    id: "les-halles", emoji: "🧺", x: 414.6, z: -75.0, r: 60,
    text: { en: { name: "Les Halles", text: "The covered market behind a living wall of plants, with Provençal food under one roof." } },
  },
  {
    id: "remparts", emoji: "🧱", x: -356.8, z: 422.6, r: 60,
    text: { en: { name: "Ramparts", text: "The 4.3-kilometre stone wall built by the popes, which still rings the whole old town." } },
  },
  {
    id: "rue-de-la-republique", emoji: "🛍️", x: 144.1, z: 146.2, r: 60,
    text: { en: { name: "Rue de la République", text: "The broad street from the station gate to the Place de l’Horloge, cut through the old town in the 19th century." } },
  },
  {
    id: "musee-calvet", emoji: "🖼️", x: -156.5, z: 353.5, r: 60,
    text: { en: { name: "Musée Calvet", text: "A museum of fine arts in an 18th-century town house, founded on a doctor’s collection." } },
  },
];
