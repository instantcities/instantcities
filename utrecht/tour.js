// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [-91, -203, 3], [-64, -210, 16], [-36, -213], [-6, -215], [2, -190], [0, -162], [7, -136], [33, -124],
    [61, -110], [88, -96], [117, -85], [145, -77], [174, -73], [199, -59], [220, -38], [237, -14],
    [252, 11], [265, 38], [274, 64], [257, 90], [239, 111], [220, 132], [196, 153], [170, 167],
    [143, 181], [116, 195], [91, 209], [64, 210], [41, 192], [21, 172], [0, 150], [-13, 123],
    [-19, 95], [-30, 67], [-55, 60], [-84, 71], [-112, 83], [-140, 95], [-167, 107], [-177, 130],
    [-191, 151], [-217, 161], [-231, 139], [-236, 109], [-241, 80], [-252, 54], [-267, 30], [-261, 10],
    [-236, -5], [-207, -14], [-178, -23], [-148, -32], [-121, -39], [-93, -46], [-80, -67], [-88, -96],
    [-95, -125], [-102, -155], [-91, -203],
  ],
  stops: [
    {
      emoji: '💐', at: [-64, -210], look: [-101, 10, -243],
      text: {
        en: { name: 'Janskerkhof', text: 'The square round the Janskerk, one of the four churches that Bishop Bernold set round the cathedral in a cross. On Saturdays it is a flower market.' },
        nl: { name: 'Janskerkhof', text: 'Het plein rond de Janskerk, een van de vier kerken die bisschop Bernold in een kruis rond de Dom zette. Op zaterdag is het een bloemenmarkt.' },
      },
    },
    {
      emoji: '⛪', at: [174, -73], look: [122, 15, 42],
      text: {
        en: { name: 'Pieterskerk', text: 'The eastern arm of Bernold’s cross, consecrated in 1048: one of the oldest churches in the Netherlands, with a Romanesque crypt.' },
        nl: { name: 'Pieterskerk', text: 'De oostelijke arm van Bernolds kruis, ingewijd in 1048: een van de oudste kerken van Nederland, met een romaanse crypte.' },
      },
    },
    {
      emoji: '👑', at: [143, 181], look: [98, 8, 166],
      text: {
        en: { name: 'Paushuize', text: 'Built for Adrian of Utrecht, who became Pope Adrian VI in 1522, the only Dutch pope. He died in Rome before he could live in it.' },
        nl: { name: 'Paushuize', text: 'Gebouwd voor Adriaan van Utrecht, die in 1522 paus Adrianus VI werd, de enige Nederlandse paus. Hij stierf in Rome voor hij er kon wonen.' },
      },
    },
    {
      emoji: '🗼', at: [-30, 67], look: [-155, 80, 141],
      text: {
        en: { name: 'Domtoren', text: 'The tallest church tower in the country, 112 metres. It stands alone since a storm blew down the nave in 1674; the Domplein fills the gap.' },
        nl: { name: 'Domtoren', text: 'De hoogste kerktoren van het land, 112 meter. Hij staat los sinds een storm in 1674 het schip wegblies; het Domplein vult het gat.' },
      },
    },
    {
      emoji: '🛶', at: [-231, 139], look: [-245, 2, 0],
      text: {
        en: { name: 'Oudegracht', text: 'The medieval canal through the old town. Its quays lie low at the water, with the merchants’ old cellars under the street, now full of cafés.' },
        nl: { name: 'Oudegracht', text: 'De middeleeuwse gracht door de oude stad. De werven liggen laag aan het water, met de oude kelders van de kooplui onder de straat, nu vol cafés.' },
      },
    },
  ],
  // a clear day from the start, and night along the Oudegracht, when the terraces on the wharves light up
  skies: [
    { at: [-36, -213], sky: 'day:clear' },
    { at: [-191, 151], sky: 'night:clear' },
  ],
  end: { look: [-155, 80, 141] },
  names: [
    { name: 'Janskerkhof', at: [-91, -203] },
    { name: 'Drift', at: [-6, -215] },
    { name: 'Kromme Nieuwegracht', at: [7, -136] },
    { name: 'Achter de Dom', at: [64, 210] },
    { name: 'Voetiusstraat', at: [-30, 67] },
    { name: 'Domplein', at: [-84, 71] },
    { name: 'Servetstraat', at: [-177, 130] },
    { name: 'Vismarkt', at: [-217, 161] },
    { name: 'Oudkerkhof', at: [-267, 30] },
    { name: 'Korte Jansstraat', at: [-80, -67] },
  ],
};
