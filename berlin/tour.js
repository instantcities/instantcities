// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [7, -248, 3], [36, -251, 16], [66, -254], [96, -257], [126, -261], [156, -264], [186, -267], [216, -270],
    [246, -273], [276, -276], [306, -280], [335, -283], [365, -286], [395, -289], [425, -292], [441, -289],
    [443, -259], [449, -227], [448, -196], [451, -166], [455, -136], [466, -106], [470, -74], [473, -44],
    [474, -11], [477, 20], [481, 50], [484, 81], [486, 112], [488, 143], [491, 173], [494, 204],
    [498, 235], [495, 241], [462, 245], [432, 248], [402, 251], [372, 254], [341, 257], [310, 260],
    [280, 263], [250, 266], [220, 269], [190, 272], [161, 275], [131, 278], [101, 282], [70, 285],
    [39, 289], [9, 292], [-3, 290], [-11, 261], [-19, 231], [-27, 202], [-35, 173], [-42, 143],
    [-48, 113], [-54, 84], [-61, 58], [-91, 63], [-121, 69], [-151, 76], [-180, 87], [-208, 97],
    [-237, 107], [-265, 118], [-289, 124], [-318, 133], [-346, 142], [-375, 151], [-405, 160], [-434, 169],
    [-447, 173], [-459, 143], [-468, 115], [-477, 86], [-486, 57], [-495, 29], [-496, 14], [-467, 2],
    [-438, -7], [-409, -16], [-380, -25], [-352, -34], [-341, -43], [-349, -72], [-358, -101], [-368, -129],
    [-377, -158], [-386, -187], [-387, -204], [-355, -210], [-325, -213], [-296, -216], [-266, -219], [-236, -222],
    [-206, -225], [-176, -229], [-146, -232], [-116, -235], [-86, -238], [-56, -241], [-26, -244], [4, -248],
    [7, -248],
  ],
  stops: [
    {
      emoji: '🌳', at: [216, -270], look: [213, 6, -296],
      text: {
        en: { name: 'Unter den Linden', text: 'The boulevard under the lime trees, from the Brandenburg Gate to Museum Island.' },
        nl: { name: 'Unter den Linden', text: 'De boulevard onder de lindebomen, van de Brandenburger Tor tot het Museumeiland.' },
      },
    },
    {
      emoji: '🎻', at: [491, 173], look: [611, 30, 160],
      text: {
        en: { name: 'Gendarmenmarkt', text: 'The French and the German church face each other across the square, with the concert hall between them.' },
        nl: { name: 'Gendarmenmarkt', text: 'De Franse en de Duitse kerk kijken elkaar aan over het plein, met de concertzaal ertussen.' },
      },
    },
    {
      emoji: '🕯️', at: [-468, 115], look: [-574, 6, 132],
      text: {
        en: { name: 'Holocaust Memorial', text: 'The Memorial to the Murdered Jews of Europe: 2,711 concrete slabs on a sloping field.' },
        nl: { name: 'Holocaustmonument', text: 'Het monument voor de vermoorde Joden van Europa: 2711 betonblokken op een glooiend veld.' },
      },
    },
  ],
  end: { look: [-659, 15, -199] },
  names: [
    { name: 'Unter den Linden', at: [7, -248] },
    { name: 'Charlottenstraße', at: [441, -289] },
    { name: 'Taubenstraße', at: [495, 241] },
    { name: 'Mauerstraße', at: [-3, 290] },
    { name: 'Französische Straße', at: [-61, 58] },
    { name: 'Hannah-Arendt-Straße', at: [-289, 124] },
    { name: 'Cora-Berliner-Straße', at: [-447, 173] },
    { name: 'Behrenstraße', at: [-496, 14] },
    { name: 'Wilhelmstraße', at: [-341, -43] },
  ],
};
