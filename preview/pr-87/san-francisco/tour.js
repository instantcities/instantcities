// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [-702, 159, 3], [-693, 215, 16], [-684, 272], [-675, 328], [-666, 384], [-640, 415], [-584, 406], [-527, 397],
    [-471, 388], [-414, 379], [-358, 370], [-301, 361], [-244, 352], [-187, 343], [-130, 334], [-75, 326],
    [-19, 319], [29, 338], [73, 324], [114, 283], [154, 243], [195, 203], [236, 162], [276, 122],
    [317, 82], [356, 41], [397, 0], [438, -40], [478, -80], [522, -117], [565, -84], [606, -43],
    [645, -4], [684, 35], [729, 19], [758, -24], [722, -65], [679, -100], [635, -134], [594, -171],
    [560, -216], [535, -266], [509, -316], [479, -363], [446, -411], [394, -413], [339, -402], [285, -383],
    [231, -372], [174, -363], [120, -351], [63, -342], [6, -333], [-50, -323], [-105, -314], [-160, -305],
    [-214, -296], [-272, -288], [-329, -280], [-386, -271], [-443, -262], [-500, -253], [-556, -244], [-613, -237],
    [-670, -228], [-727, -219], [-758, -188], [-749, -132], [-740, -75], [-731, -19], [-722, 37], [-713, 94],
    [-702, 159],
  ],
  stops: [
    {
      emoji: '🐉', at: [-666, 384], look: [-651, 6, 404],
      text: {
        en: { name: 'Dragon Gate', text: 'The gate into Chinatown, built in 1970 with stone and green tiles from Taiwan. Over its middle arch hang four characters by Sun Yat-sen: all under heaven is for the good of the people.' },
        nl: { name: 'Dragon Gate', text: 'De poort naar Chinatown, gebouwd in 1970 met steen en groene pannen uit Taiwan. Boven de middelste boog hangen vier tekens van Sun Yat-sen: alles onder de hemel is voor het welzijn van het volk.' },
      },
    },
    {
      emoji: '⛴️', at: [594, -171], look: [672, 40, -268],
      text: {
        en: { name: 'Ferry Building', text: 'The ferry terminal of 1898 at the foot of Market Street. Its clock tower copies the Giralda of Seville, and inside is a long hall of bakers, cheese makers and oyster bars.' },
        nl: { name: 'Ferry Building', text: 'De veerterminal uit 1898 aan het eind van Market Street. De klokkentoren is een kopie van de Giralda in Sevilla, en binnen loopt een lange hal vol bakkers, kaasmakers en oesterbars.' },
      },
    },
    {
      emoji: '🔺', at: [-272, -288], look: [-355, 150, -220],
      text: {
        en: { name: 'Transamerica Pyramid', text: 'The white pyramid of the Financial District, 260 metres and 48 floors tall, finished in 1972. Its shape lets more light down into the streets than a box would.' },
        nl: { name: 'Transamerica Pyramid', text: 'De witte piramide van het Financial District, 260 meter en 48 verdiepingen hoog, klaar in 1972. Door de vorm valt er meer licht in de straten dan bij een gewone toren.' },
      },
    },
    {
      emoji: '🇺🇸', at: [-613, -237], look: [-636, 4, -170],
      text: {
        en: { name: 'Portsmouth Square', text: 'The old plaza of Yerba Buena, where the city began. Sailors of the USS Portsmouth raised the American flag here in 1846, and the news of the gold was shouted here in 1848.' },
        nl: { name: 'Portsmouth Square', text: 'Het oude plein van Yerba Buena, waar de stad begon. Matrozen van de USS Portsmouth hesen hier in 1846 de Amerikaanse vlag, en in 1848 werd hier het nieuws van het goud rondgeroepen.' },
      },
    },
    {
      emoji: '🏮', at: [-740, -75], look: [-722, 8, 37],
      text: {
        en: { name: 'Chinatown', text: 'The oldest Chinatown in North America, along Grant Avenue. It burnt down in 1906 and was rebuilt at once, with pagoda roofs and red lanterns over the street.' },
        nl: { name: 'Chinatown', text: 'De oudste Chinatown van Noord-Amerika, langs Grant Avenue. Ze brandde af in 1906 en werd meteen herbouwd, met pagodedaken en rode lampionnen boven de straat.' },
      },
    },
  ],
  // a clear day from the start, and night from the Embarcadero on, when Chinatown's lanterns are lit
  skies: [
    { at: [-684, 272], sky: 'day:clear' },
    { at: [479, -363], sky: 'night:clear' },
  ],
  end: { look: [-355, 150, -220] },
  names: [
    { name: 'Grant Avenue', at: [-702, 159] },
    { name: 'Bush Street', at: [-584, 406] },
    { name: 'Market Street', at: [73, 324] },
    { name: 'Steuart Street', at: [522, -117] },
    { name: 'Mission Street', at: [729, 19] },
    { name: 'The Embarcadero', at: [758, -24] },
    { name: 'Washington Street', at: [394, -413] },
    { name: 'Grant Avenue', at: [-758, -188] },
  ],
};
