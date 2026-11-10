// The tour: a flight from the great gate up the garden along the long canal to the tomb, round the
// tomb and its four minarets, and back down the east side of the garden (hand-written). The path
// is [x, z, height] in game metres; see ghent/tour.js for everything a tour can have.
const C = [-91, -254]; // the middle of the tomb
const around = (r, h, from, to, n) => Array.from({ length: n + 1 }, (_, k) => {
  const t = from + ((to - from) * k) / n;
  return [Math.round(C[0] + r * Math.cos(t)), Math.round(C[1] + r * Math.sin(t)), h];
});

export const TOUR = {
  path: [
    [-91, 340, 7], [-91, 300, 14], [-91, 262, 40], [-91, 220, 36], [-91, 150, 26], [-91, 60, 22], [-91, -40, 22], [-91, -120, 26],
    // up to the terrace, then once round the tomb from its south side, west first
    ...around(150, 74, Math.PI / 2, Math.PI / 2 + 2 * Math.PI, 16),
    [-91, -110, 40], [-40, -40, 30], [20, 60, 24], [20, 170, 22], [-20, 262, 36], [-70, 330, 14],
  ],
  stops: [
    {
      emoji: '🚪', at: [-91, 262], look: [-91, 14, 196],
      text: {
        en: { name: 'The great gate', text: 'Darwaza-i-Rauza, the red sandstone gate into the garden. Its 22 little domes along the top stand for the years the Taj took to build.' },
        nl: { name: 'De grote poort', text: 'Darwaza-i-Rauza, de poort van rode zandsteen naar de tuin. De 22 koepeltjes bovenop staan voor de jaren die de bouw van de Taj duurde.' },
      },
    },
    {
      emoji: '💧', at: [-91, 60], look: [-91, 0, -60],
      text: {
        en: { name: 'The long canal', text: 'The garden is a charbagh: four quarters round a channel of water. Looking up the canal, the tomb seems to float above it.' },
        nl: { name: 'Het lange kanaal', text: 'De tuin is een charbagh: vier kwarten rond een waterloop. Kijk je langs het kanaal omhoog, dan lijkt de tombe erboven te zweven.' },
      },
    },
    {
      emoji: '🕌', at: [-91, -120], look: [-91, 55, -254],
      text: {
        en: { name: 'The tomb', text: 'Shah Jahan built it for his wife Mumtaz Mahal, who died in 1631. It took about 20 years and the dome is 73 metres up. The marble looks pink at dawn and gold at dusk.' },
        nl: { name: 'De tombe', text: 'Shah Jahan liet ze bouwen voor zijn vrouw Mumtaz Mahal, die in 1631 stierf. Het duurde zo’n 20 jaar en de koepel staat 73 meter hoog. Het marmer lijkt roze bij zonsopgang en goud bij zonsondergang.' },
      },
    },
  ],
  names: [],
};
