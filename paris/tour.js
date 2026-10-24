// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [433, -16, 3], [424, 14, 16], [414, 43], [404, 72], [400, 84], [408, 115], [397, 145], [384, 172],
    [370, 199], [358, 223], [345, 251], [332, 278], [319, 305], [306, 332], [292, 359], [279, 387],
    [266, 414], [260, 425], [237, 424], [211, 425], [183, 412], [155, 399], [129, 397], [114, 425],
    [92, 430], [70, 427], [43, 415], [16, 401], [-10, 387], [-37, 373], [-64, 359], [-90, 345],
    [-117, 331], [-133, 322], [-158, 307], [-184, 290], [-209, 274], [-234, 257], [-259, 239], [-281, 216],
    [-299, 192], [-317, 168], [-336, 144], [-354, 120], [-372, 96], [-390, 71], [-408, 47], [-427, 22],
    [-445, -2], [-461, -27], [-445, -53], [-442, -73], [-433, -104], [-419, -131], [-404, -158], [-390, -185],
    [-375, -211], [-361, -238], [-352, -251], [-325, -270], [-309, -298], [-292, -326], [-275, -351], [-258, -376],
    [-239, -403], [-224, -430], [-218, -435], [-188, -423], [-161, -410], [-134, -397], [-107, -384], [-80, -370],
    [-53, -357], [-26, -344], [2, -331], [29, -317], [56, -304], [83, -291], [110, -278], [137, -264],
    [164, -251], [191, -238], [218, -225], [245, -211], [272, -198], [299, -185], [326, -172], [353, -158],
    [381, -145], [410, -131], [440, -117], [462, -102], [453, -74], [442, -45], [433, -17], [433, -16],
  ],
  stops: [
    {
      emoji: '⛪', at: [260, 425], look: [326, 30, 509],
      text: {
        en: { name: 'Notre-Dame', text: 'The Gothic cathedral on the Île de la Cité, begun in 1163. After the fire of 2019 it opened again in December 2024.' },
        nl: { name: 'Notre-Dame', text: 'De gotische kathedraal op het Île de la Cité, begonnen in 1163. Na de brand van 2019 ging ze in december 2024 weer open.' },
      },
    },
    {
      emoji: '✨', at: [-184, 290], look: [-123, 30, 177],
      text: {
        en: { name: 'Sainte-Chapelle', text: 'Louis IX’s royal chapel of 1248, built for the Crown of Thorns, with walls of almost nothing but stained glass.' },
        nl: { name: 'Sainte-Chapelle', text: 'De koninklijke kapel van Lodewijk IX uit 1248, gebouwd voor de doornenkroon, met muren van bijna alleen glas-in-lood.' },
      },
    },
    {
      emoji: '🌉', at: [-442, -73], look: [-462, 6, -72],
      text: {
        en: { name: 'Pont Neuf', text: 'The “new bridge” is in fact the oldest bridge still standing across the Seine in Paris, finished in 1607.' },
        nl: { name: 'Pont Neuf', text: 'De “nieuwe brug” is eigenlijk de oudste brug over de Seine in Parijs die nog overeind staat, af in 1607.' },
      },
    },
    {
      emoji: '🎭', at: [110, -278], look: [60, 6, -182],
      text: {
        en: { name: 'Châtelet', text: 'Once a fortress guarding the bridge to the island; now two theatres face each other across the square and its fountain.' },
        nl: { name: 'Châtelet', text: 'Ooit een burcht die de brug naar het eiland bewaakte; nu kijken twee theaters elkaar aan over het plein en zijn fontein.' },
      },
    },
    {
      emoji: '🏛️', at: [462, -102], look: [536, 6, 11],
      text: {
        en: { name: 'Hôtel de Ville', text: 'The city hall of Paris has stood on this spot since 1357. The building you see was put up again after it burned down in the Commune of 1871.' },
        nl: { name: 'Hôtel de Ville', text: 'Het stadhuis van Parijs staat al sinds 1357 op deze plek. Het gebouw dat je ziet werd opnieuw opgetrokken nadat het in de Commune van 1871 afbrandde.' },
      },
    },
  ],
  // it sets off at night (core/js/main.js), it is day as soon as it is on its way, and evening at the end
  skies: [
    { at: [404, 72], sky: 'day:clear' },
    { at: [272, -198], sky: 'night:clear' },
  ],
  end: { look: [326, 15, 509] },
  names: [
    { name: 'Place de l’Hôtel de Ville', at: [433, -16] },
    { name: 'Pont d’Arcole', at: [400, 84] },
    { name: 'Rue d’Arcole', at: [358, 223] },
    { name: 'Parvis Notre-Dame - Place Jean-Paul II', at: [260, 425] },
    { name: 'Quai du Marché Neuf - Maurice Grimaud', at: [70, 427] },
    { name: 'Quai des Orfèvres', at: [-133, 322] },
    { name: 'Place du Pont-Neuf - Christo et Jeanne-Claude', at: [-461, -27] },
    { name: 'Pont Neuf', at: [-442, -73] },
    { name: 'Rue du Pont Neuf', at: [-352, -251] },
    { name: 'Rue de Rivoli', at: [-218, -435] },
  ],
};
