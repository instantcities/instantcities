// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [158, -212, 3], [156, -183, 16], [148, -153], [135, -128], [113, -108], [92, -85], [80, -56], [105, -48],
    [124, -30], [138, -4], [151, 21], [157, 50], [166, 79], [172, 107], [173, 135], [157, 161],
    [136, 184], [114, 205], [94, 226], [77, 250], [86, 278], [105, 303], [125, 323], [149, 342],
    [153, 371], [132, 391], [106, 403], [77, 411], [66, 393], [74, 362], [60, 336], [43, 310],
    [27, 285], [10, 259], [-7, 234], [-27, 210], [-48, 188], [-69, 167], [-91, 148], [-118, 132],
    [-145, 116], [-170, 99], [-167, 71], [-154, 44], [-134, 21], [-107, 7], [-80, -5], [-58, -24],
    [-29, -25], [-14, -46], [-7, -76], [7, -103], [30, -123], [44, -147], [43, -177], [48, -206],
    [54, -233], [50, -264], [44, -292], [37, -319], [23, -346], [1, -363], [14, -386], [41, -402],
    [68, -412], [85, -388], [101, -362], [116, -338], [128, -312], [139, -285], [147, -257], [154, -229],
    [158, -212],
  ],
  stops: [
    {
      emoji: '⚖️', at: [156, -183], look: [138, 8, -118],
      text: {
        en: { name: 'Loggia della Mercanzia', text: 'The loggia of the merchants’ court, begun in 1417 where the three main streets of Siena meet, a few steps above the Campo.' },
        nl: { name: 'Loggia della Mercanzia', text: 'De loggia van de rechtbank van de kooplui, begonnen in 1417 waar de drie hoofdstraten van Siena samenkomen, een paar treden boven de Campo.' },
      },
    },
    {
      emoji: '🐚', at: [124, -30], look: [243, 50, -24],
      text: {
        en: { name: 'Piazza del Campo', text: 'The shell of red brick that slopes down to the town hall and its 88-metre Torre del Mangia. Twice every summer the contrade race the Palio round it.' },
        nl: { name: 'Piazza del Campo', text: 'De schelp van rode baksteen die afloopt naar het stadhuis en zijn Torre del Mangia van 88 meter. Twee keer per zomer rijden de contrade er de Palio rond.' },
      },
    },
    {
      emoji: '⛪', at: [-69, 167], look: [-106, 25, 81],
      text: {
        en: { name: 'Duomo di Siena', text: 'The cathedral on the highest hill, striped in white and dark green marble, with a floor of 56 marble pictures inside.' },
        nl: { name: 'Duomo di Siena', text: 'De kathedraal op de hoogste heuvel, gestreept in wit en donkergroen marmer, met binnen een vloer van 56 marmeren taferelen.' },
      },
    },
    {
      emoji: '🏥', at: [-170, 99], look: [-167, 10, 155],
      text: {
        en: { name: 'Santa Maria della Scala', text: 'For nearly a thousand years a hospital for pilgrims, the sick and foundlings, opposite the cathedral. Now a museum.' },
        nl: { name: 'Santa Maria della Scala', text: 'Bijna duizend jaar lang een gasthuis voor pelgrims, zieken en vondelingen, tegenover de kathedraal. Nu een museum.' },
      },
    },
    {
      emoji: '⛪', at: [30, -123], look: [-287, 20, -223],
      text: {
        en: { name: 'San Domenico', text: 'The great brick church across the valley, where Saint Catherine of Siena prayed, and where her head is kept.' },
        nl: { name: 'San Domenico', text: 'De grote bakstenen kerk aan de overkant van het dal, waar de heilige Catharina van Siena bad en waar haar hoofd bewaard wordt.' },
      },
    },
  ],
  // a clear day from the start, and night on the way back, when the lanterns light the brick
  skies: [
    { at: [135, -128], sky: 'day:clear' },
    { at: [-29, -25], sky: 'night:clear' },
  ],
  end: { look: [243, 50, -24] },
  names: [
    { name: 'Banchi di Sopra', at: [158, -212] },
    { name: 'Via di Città', at: [135, -128] },
    { name: 'Il Campo', at: [124, -30] },
    { name: 'Casato di Sotto', at: [157, 50] },
    { name: 'Casato di Sopra', at: [77, 250] },
    { name: 'Via San Pietro', at: [66, 393] },
    { name: 'Via del Capitano', at: [10, 259] },
    { name: 'Piazza del Duomo', at: [-91, 148] },
    { name: 'Via dei Fusari', at: [-167, 71] },
    { name: 'Piazza San Giovanni', at: [-58, -24] },
    { name: 'Via di Diacceto', at: [-14, -46] },
    { name: 'Via delle Terme', at: [44, -147] },
    { name: 'Costa dell’Incrociata', at: [1, -363] },
    { name: 'Banchi di Sopra', at: [68, -412] },
  ],
};
