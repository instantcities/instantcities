// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [361, 305, 3], [330, 308, 16], [300, 316], [269, 324], [250, 323], [240, 295], [231, 265], [222, 236],
    [214, 206], [206, 177], [200, 145], [202, 143], [230, 131], [258, 119], [260, 95], [254, 63],
    [248, 33], [247, 19], [271, -2], [297, -19], [289, -50], [281, -80], [273, -110], [266, -139],
    [257, -168], [247, -197], [238, -226], [228, -255], [218, -284], [209, -313], [199, -342], [189, -373],
    [178, -398], [146, -393], [117, -385], [89, -374], [96, -345], [107, -316], [107, -311], [102, -301],
    [71, -294], [39, -291], [8, -293], [-24, -302], [-42, -313], [-72, -314], [-102, -314], [-132, -314],
    [-162, -318], [-184, -316], [-185, -284], [-187, -253], [-193, -232], [-223, -233], [-255, -234], [-286, -234],
    [-317, -234], [-348, -235], [-360, -231], [-361, -199], [-359, -176], [-330, -169], [-300, -159], [-299, -158],
    [-267, -155], [-235, -156], [-205, -155], [-198, -125], [-190, -95], [-183, -67], [-185, -36], [-193, -23],
    [-197, 8], [-200, 39], [-201, 69], [-200, 100], [-202, 131], [-203, 159], [-204, 189], [-206, 219],
    [-207, 250], [-207, 280], [-208, 311], [-208, 342], [-206, 365], [-175, 376], [-146, 385], [-117, 393],
    [-97, 399], [-66, 399], [-36, 398], [-5, 398], [11, 397], [42, 394], [74, 392], [93, 389],
    [123, 380], [152, 370], [181, 359], [210, 351], [239, 342], [268, 334], [297, 326], [326, 318],
    [355, 310], [361, 305],
  ],
  stops: [
    {
      emoji: '🗿', at: [209, -313], look: [168, 30, -300],
      text: {
        en: { name: 'Piazza Colonna', text: 'The Column of Marcus Aurelius, carved with his wars along the Danube, has stood here since the end of the 2nd century.' },
        nl: { name: 'Piazza Colonna', text: 'De zuil van Marcus Aurelius, met zijn oorlogen aan de Donau erin uitgehouwen, staat hier sinds het eind van de 2de eeuw.' },
      },
    },
    {
      emoji: '⛪', at: [-200, 39], look: [-153, 6, 32],
      text: {
        en: { name: 'Pantheon', text: 'Built under Hadrian almost 1,900 years ago. Its concrete dome is still the largest unreinforced one in the world, with an open eye at the top.' },
        nl: { name: 'Pantheon', text: 'Gebouwd onder Hadrianus, bijna 1900 jaar geleden. De betonnen koepel is nog altijd de grootste ongewapende ter wereld, met bovenaan een open oog.' },
      },
    },
    {
      emoji: '🐈', at: [-146, 385], look: [-163, 6, 461],
      text: {
        en: { name: 'Largo di Torre Argentina', text: 'Four temples of the Roman Republic, below the street, next to where Julius Caesar was murdered in 44 BC. Today it is also a home for stray cats.' },
        nl: { name: 'Largo di Torre Argentina', text: 'Vier tempels uit de Romeinse Republiek, onder het straatniveau, naast de plek waar Julius Caesar in 44 v.Chr. werd vermoord. Nu wonen er ook zwerfkatten.' },
      },
    },
    {
      emoji: '🏛️', at: [268, 334], look: [437, 6, 419],
      text: {
        en: { name: 'Piazza Venezia', text: 'The square at the foot of the Vittoriano, the white marble monument to Victor Emmanuel II, the first king of Italy. Romans call it the typewriter.' },
        nl: { name: 'Piazza Venezia', text: 'Het plein aan de voet van het Vittoriano, het witmarmeren monument voor Victor Emmanuel II, de eerste koning van Italië. De Romeinen noemen het de schrijfmachine.' },
      },
    },
  ],
  // it sets off at night (core/js/main.js), it is day as soon as it is on its way, and evening at the end
  skies: [
    { at: [269, 324], sky: 'day:clear' },
    { at: [42, 394], sky: 'night:clear' },
  ],
  end: { look: [437, 15, 419] },
  names: [
    { name: 'Via del Plebiscito', at: [361, 305] },
    { name: 'Via della Gatta', at: [250, 323] },
    { name: 'Piazza del Collegio Romano', at: [202, 143] },
    { name: 'Via del Collegio Romano', at: [260, 95] },
    { name: 'Via Alessandro Specchi', at: [247, 19] },
    { name: 'Via del Corso', at: [297, -19] },
    { name: 'Vicolo dello Sdrucciolo', at: [178, -398] },
    { name: 'Via dell’Impresa', at: [89, -374] },
    { name: 'Piazza Colonna', at: [107, -311] },
    { name: 'Piazza di Monte Citorio', at: [102, -301] },
    { name: 'Via degli Uffici del Vicario', at: [-42, -313] },
    { name: 'Via della Maddalena', at: [-184, -316] },
    { name: 'Via delle Coppelle', at: [-193, -232] },
    { name: 'Via della Scrofa', at: [-360, -231] },
    { name: 'Largo Giuseppe Toniolo', at: [-359, -176] },
    { name: 'Via del Pozzo delle Cornacchie', at: [-299, -158] },
    { name: 'Via della Rosetta', at: [-205, -155] },
    { name: 'Piazza della Rotonda', at: [-190, -95] },
    { name: 'Via della Rotonda', at: [-193, -23] },
    { name: 'Via di Torre Argentina', at: [-203, 159] },
    { name: 'Largo di Torre Argentina', at: [-206, 365] },
    { name: 'Corso Vittorio Emanuele Secondo', at: [-97, 399] },
    { name: 'Piazza del Gesù', at: [11, 397] },
  ],
};
