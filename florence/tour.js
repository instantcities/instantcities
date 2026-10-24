// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [199, -285, 3], [203, -265, 16], [202, -233], [202, -203], [201, -173], [200, -143], [199, -113], [198, -83],
    [197, -53], [196, -23], [196, 8], [195, 38], [194, 68], [190, 94], [185, 124], [181, 156],
    [175, 168], [144, 162], [114, 153], [103, 153], [86, 177], [70, 203], [55, 230], [41, 256],
    [26, 282], [8, 304], [-12, 293], [-3, 262], [6, 234], [5, 228], [-22, 215], [-51, 203],
    [-79, 192], [-108, 180], [-136, 169], [-165, 157], [-189, 136], [-197, 121], [-203, 90], [-199, 59],
    [-197, 58], [-165, 58], [-135, 61], [-105, 64], [-75, 67], [-43, 68], [-12, 68], [17, 64],
    [19, 62], [21, 29], [21, -1], [21, -31], [22, -61], [23, -93], [24, -124], [24, -155],
    [25, -185], [25, -215], [26, -246], [27, -276], [29, -280], [61, -286], [91, -288], [112, -289],
    [138, -304], [170, -304], [197, -299], [199, -285],
  ],
  stops: [
    {
      emoji: '🗿', at: [181, 156], look: [246, 30, 152],
      text: {
        en: { name: 'Piazza della Signoria', text: 'The Palazzo Vecchio, the Loggia dei Lanzi, and a copy of Michelangelo’s David at the door.' },
        nl: { name: 'Piazza della Signoria', text: 'Het Palazzo Vecchio, de Loggia dei Lanzi en een kopie van Michelangelo’s David bij de deur.' },
      },
    },
    {
      emoji: '💍', at: [8, 304], look: [-25, 6, 373],
      text: {
        en: { name: 'Ponte Vecchio', text: 'The bridge of goldsmiths’ shops over the Arno, the only one in Florence left standing by the retreating Germans in 1944.' },
        nl: { name: 'Ponte Vecchio', text: 'De brug vol goudsmeden over de Arno, de enige in Florence die de terugtrekkende Duitsers in 1944 lieten staan.' },
      },
    },
    {
      emoji: '🎠', at: [23, -93], look: [55, 6, -97],
      text: {
        en: { name: 'Piazza della Repubblica', text: 'Where the Roman forum was, now with an old carousel and the cafés under the arch.' },
        nl: { name: 'Piazza della Repubblica', text: 'Waar het Romeinse forum lag, nu met een oude draaimolen en de cafés onder de boog.' },
      },
    },
    {
      emoji: '🚪', at: [112, -289], look: [156, 6, -332],
      text: {
        en: { name: 'Baptistery', text: 'The Baptistery of San Giovanni, with the bronze doors by Ghiberti that Michelangelo called the Gates of Paradise.' },
        nl: { name: 'Baptisterium', text: 'Het baptisterium van San Giovanni, met de bronzen deuren van Ghiberti die Michelangelo de Poorten van het Paradijs noemde.' },
      },
    },
    {
      emoji: '🔴', at: [112, -289], look: [266, 30, -332],
      text: {
        en: { name: 'Duomo', text: 'Brunelleschi’s dome, finished in 1436, is still the largest brick dome ever built.' },
        nl: { name: 'Duomo', text: 'De koepel van Brunelleschi, af in 1436, is nog altijd de grootste bakstenen koepel ooit gebouwd.' },
      },
    },
  ],
  // it sets off at night (core/js/main.js), it is day as soon as it is on its way, and evening at the end
  skies: [
    { at: [202, -203], sky: 'day:clear' },
    { at: [27, -276], sky: 'night:clear' },
  ],
  end: { look: [266, 15, -332] },
  names: [
    { name: 'Piazza del Duomo', at: [199, -285] },
    { name: 'Via dei Calzaiuoli', at: [203, -265] },
    { name: 'Piazza della Signoria', at: [190, 94] },
    { name: 'Via Vacchereccia', at: [175, 168] },
    { name: 'Via Por Santa Maria', at: [103, 153] },
    { name: 'Lungarno degli Acciaioli', at: [8, 304] },
    { name: 'Vicolo dell’Oro', at: [-12, 293] },
    { name: 'Borgo Santi Apostoli', at: [5, 228] },
    { name: 'Piazza di Santa Trinita', at: [-197, 121] },
    { name: 'Via Porta Rossa', at: [-197, 58] },
    { name: 'Pellicceria', at: [19, 62] },
    { name: 'Via dei Brunelleschi', at: [22, -61] },
    { name: 'Via dei Pecori', at: [29, -280] },
    { name: 'Piazza San Giovanni', at: [112, -289] },
  ],
};
