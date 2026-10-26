// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [-296, -50, 3], [-293, -80, 16], [-289, -110], [-286, -140], [-283, -170], [-281, -200], [-279, -230], [-277, -260],
    [-275, -290], [-273, -320], [-271, -351], [-269, -381], [-265, -411], [-261, -442], [-257, -472], [-254, -502],
    [-246, -532], [-214, -529], [-185, -514], [-173, -486], [-158, -458], [-143, -431], [-128, -404], [-128, -373],
    [-131, -343], [-134, -311], [-135, -280], [-132, -248], [-123, -219], [-112, -191], [-104, -162], [-99, -131],
    [-97, -99], [-96, -69], [-105, -40], [-117, -11], [-128, 17], [-140, 45], [-152, 72], [-165, 100],
    [-179, 127], [-192, 155], [-203, 183], [-207, 214], [-206, 247], [-200, 279], [-191, 308], [-180, 338],
    [-151, 333], [-121, 325], [-91, 316], [-62, 309], [-33, 301], [-4, 293], [26, 286], [58, 281],
    [89, 276], [120, 274], [153, 273], [184, 275], [216, 280], [247, 285], [277, 291], [308, 299],
    [338, 308], [367, 319], [364, 347], [351, 375], [338, 403], [317, 419], [287, 408], [257, 401],
    [227, 394], [195, 388], [164, 385], [134, 385], [102, 386], [72, 389], [42, 394], [12, 400],
    [-19, 409], [-47, 419], [-76, 431], [-104, 445], [-132, 459], [-159, 473], [-187, 486], [-216, 501],
    [-242, 517], [-269, 533], [-289, 510], [-304, 484], [-320, 458], [-336, 432], [-350, 406], [-360, 377],
    [-369, 348], [-368, 318], [-362, 288], [-355, 258], [-349, 228], [-343, 198], [-337, 169], [-331, 139],
    [-325, 109], [-318, 79], [-312, 50], [-306, 20], [-300, -11], [-297, -41], [-296, -50],
  ],
  stops: [
    {
      emoji: '⛪', at: [-254, -502], look: [-250, 25, -647],
      text: {
        en: { name: 'Piazza dei Miracoli', text: 'The Duomo, the Baptistery, the bell tower and the Camposanto, all in white marble on one green lawn: the cathedral square of a sea power at its height.' },
        nl: { name: 'Piazza dei Miracoli', text: 'De Duomo, het baptisterium, de klokkentoren en het Camposanto, allemaal in wit marmer op één groen grasveld: het domplein van een zeemacht op zijn hoogtepunt.' },
      },
    },
    {
      emoji: '🗼', at: [-173, -486], look: [-179, 35, -608],
      text: {
        en: { name: 'Leaning Tower', text: 'The bell tower began to lean in the 1170s, before its third floor was finished. Engineers brought it back by 40 cm around 2000; it still leans about four degrees.' },
        nl: { name: 'Scheve toren', text: 'De klokkentoren begon al in de jaren 1170 over te hellen, voor de derde verdieping af was. Rond 2000 trokken ingenieurs hem 40 cm terug; hij helt nog altijd zo’n vier graden.' },
      },
    },
    {
      emoji: '🎓', at: [-112, -191], look: [-97, 6, -99],
      text: {
        en: { name: 'Via Santa Maria', text: 'The street of the university, from the Duomo down to the Arno, past the botanical garden and the colleges. Galileo was born in Pisa and studied and taught here.' },
        nl: { name: 'Via Santa Maria', text: 'De straat van de universiteit, van de Duomo naar de Arno, langs de botanische tuin en de colleges. Galileo werd in Pisa geboren en studeerde en doceerde hier.' },
      },
    },
    {
      emoji: '🌉', at: [308, 299], look: [352, 4, 373],
      text: {
        en: { name: 'Ponte di Mezzo', text: 'The middle bridge, where the north and the south of Pisa push a heavy cart against each other every June, in the Gioco del Ponte.' },
        nl: { name: 'Ponte di Mezzo', text: 'De middelste brug, waar het noorden en het zuiden van Pisa elke juni een zware kar tegen elkaar in duwen, in het Gioco del Ponte.' },
      },
    },
    {
      emoji: '⛪', at: [-132, 459], look: [-178, 4, 469],
      text: {
        en: { name: 'Santa Maria della Spina', text: 'A tiny Gothic church full of pinnacles on the bank of the Arno. It flooded so often that in 1871 the city took it apart and built it up again higher up.' },
        nl: { name: 'Santa Maria della Spina', text: 'Een piepklein gotisch kerkje vol torentjes aan de oever van de Arno. Het liep zo vaak onder dat de stad het in 1871 afbrak en hoger weer opbouwde.' },
      },
    },
  ],
  // a clear day from the start, and night along the river, when the Luminara lights the Lungarni every June
  skies: [
    { at: [-279, -230], sky: 'day:clear' },
    { at: [216, 280], sky: 'night:clear' },
  ],
  end: { look: [-179, 35, -608] },
  names: [
    { name: 'Via Roma', at: [-296, -50] },
    { name: 'Piazza del Duomo', at: [-246, -532] },
    { name: 'Via Santa Maria', at: [-128, -404] },
    { name: 'Lungarno Antonio Pacinotti', at: [-151, 333] },
    { name: 'Ponte di Mezzo', at: [367, 319] },
    { name: 'Lungarno Gambacorti', at: [317, 419] },
    { name: 'Ponte Solferino', at: [-289, 510] },
    { name: 'Piazza Solferino', at: [-350, 406] },
    { name: 'Via Roma', at: [-368, 318] },
  ],
};
