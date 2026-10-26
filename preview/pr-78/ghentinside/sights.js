// The sights inside: ride up to one and a card tells you what you are looking at. Each { id (the
// same id as the sight outside, in ghent/sights.js, for the three buildings), emoji, x, z (the map's
// metres), r (how close you have to be), text: { <lang>: { name, text } }, arrival?: { x, z, look } where
// a link to it puts you }. The three buildings are in a row, 120 m apart (monuments.js).
import { AT } from './monuments.js';

export const SIGHTS = [
  {
    id: 'sint-baafs', page: '/preview/pr-78/ghent/landmark/sint-baafs-kathedraal/', emoji: '🖼️', x: AT.baafs[0] + 0, z: AT.baafs[1] + -30, r: 40,
    arrival: { x: AT.baafs[0], z: AT.baafs[1] - 55, look: [AT.baafs[0], AT.baafs[1]] },
    text: {
      nl: { name: 'Sint-Baafskathedraal', text: 'Het schip van de kathedraal is in zijn huidige vorm van de 15de en 16de eeuw. De zwart-witte marmeren vloer werd in de 18de eeuw gelegd, op de diagonaal. Rij door de zijbeuken en rond het koor naar de kapellen achteraan.' },
      en: { name: 'St Bavo’s Cathedral', text: 'The nave of the cathedral dates from the 15th and 16th centuries. The black and white marble floor was laid in the 18th century, on the diagonal. Ride through the aisles and round the choir to the chapels at the back.' },
      fr: { name: 'Cathédrale Saint-Bavon', text: 'La nef de la cathédrale date des XVe et XVIe siècles. Le sol de marbre noir et blanc a été posé au XVIIIe siècle, en diagonale. Parcours les bas-côtés et le déambulatoire jusqu’aux chapelles du fond.' },
      es: { name: 'Catedral de San Bavón', text: 'La nave de la catedral es de los siglos XV y XVI. El suelo de mármol blanco y negro se colocó en el siglo XVIII, en diagonal. Recorre las naves laterales y el deambulatorio hasta las capillas del fondo.' },
    },
  },
  {
    id: 'sint-niklaas', page: '/preview/pr-78/ghent/landmark/sint-niklaaskerk/', emoji: '⛪', x: AT.niklaas[0] + 0, z: AT.niklaas[1] + -10, r: 40,
    arrival: { x: AT.niklaas[0], z: AT.niklaas[1] - 30, look: [AT.niklaas[0], AT.niklaas[1]] },
    text: {
      nl: { name: 'Sint-Niklaaskerk', text: 'Scheldegotiek in blauwgrijze Doornikse steen. Boven de viering staat de lantaarntoren; het schip is hoog, licht en bijna kaal. Vandaag is het ook een plek voor concerten en tentoonstellingen.' },
      en: { name: 'St Nicholas’ Church', text: 'Scheldt Gothic in blue-grey Tournai stone. The lantern tower stands over the crossing; the nave is tall, light and almost bare. Today it is also a place for concerts and exhibitions.' },
      fr: { name: 'Église Saint-Nicolas', text: 'Gothique scaldien en pierre bleu-gris de Tournai. La tour-lanterne se dresse sur la croisée ; la nef est haute, claire et presque nue. Aujourd’hui, on y donne aussi des concerts et des expositions.' },
      es: { name: 'Iglesia de San Nicolás', text: 'Gótico del Escalda en piedra azul grisácea de Tournai. La torre linterna se alza sobre el crucero; la nave es alta, luminosa y casi desnuda. Hoy también acoge conciertos y exposiciones.' },
    },
  },
  {
    id: 'stadhuis', emoji: '🏛️', x: AT.stadhuis[0] + 0, z: AT.stadhuis[1] + 0, r: 40,
    arrival: { x: AT.stadhuis[0], z: AT.stadhuis[1] - 20, look: [AT.stadhuis[0], AT.stadhuis[1]] },
    text: {
      nl: { name: 'Stadhuis', text: 'Binnen volgen de zalen elkaar op: de Pacificatiezaal, waar in 1576 de Pacificatie van Gent werd getekend, en de trouwzaal.' },
      en: { name: 'City Hall', text: 'Inside, the halls follow one another: the Pacification Hall, where the Pacification of Ghent was signed in 1576, and the wedding hall.' },
      fr: { name: 'Hôtel de ville', text: 'À l’intérieur, les salles se suivent : la salle de la Pacification, où fut signée en 1576 la Pacification de Gand, et la salle des mariages.' },
      es: { name: 'Ayuntamiento', text: 'Dentro se suceden las salas: la Sala de la Pacificación, donde se firmó en 1576 la Pacificación de Gante, y la sala de bodas.' },
    },
  },
];
