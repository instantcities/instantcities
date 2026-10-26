// Stonehenge's sights: ride up to one while exploring and a card tells you what you are looking at.
// Each { id, emoji, x, z (game metres, where the card counts from), r (how close you have to be, game
// metres), text: { <lang>: { name, text } } }. In English and Dutch; the other languages show the English.
import { at } from './frame.js';

const s = (id, emoji, e, z, r, text) => ({ id, emoji, x: at(e, z)[0], z: at(e, z)[1], r, text });
export const SIGHTS = [
  s('circle', '🪨', 3, 27, 60, {
    en: { name: 'The sarsen circle', text: 'Thirty great sandstone blocks from the Marlborough Downs, 25 kilometres away, set up about 2500 BC. Each is about 4 metres high and weighs some 25 tonnes. A ring of lintels once ran across their tops, and they were smoothed and fitted with joints like carpentry.' },
    nl: { name: 'De sarsencirkel', text: 'Dertig enorme zandstenen blokken van de Marlborough Downs, 25 kilometer verderop, geplaatst rond 2500 v.Chr. Elk is zo’n 4 meter hoog en weegt ongeveer 25 ton. Een ring van dekstenen liep ooit over de bovenkant, en ze waren glad bewerkt en met verbindingen als in houtwerk.' },
  }),
  s('trilithons', '⛰️', -17, -2, 36, {
    en: { name: 'The trilithons', text: 'Five pairs of the biggest stones, each with a lintel over it, stand in a horseshoe open to the north-east. They are 6 to 7.3 metres high. Three still stand whole; the great one in the middle fell long ago.' },
    nl: { name: 'De trilithons', text: 'Vijf paren van de grootste stenen, elk met een deksteen, staan in een hoefijzer dat naar het noordoosten open is. Ze zijn 6 tot 7,3 meter hoog. Drie staan nog helemaal overeind; de grote in het midden viel lang geleden.' },
  }),
  s('bluestones', '🔵', 12, 2, 40, {
    en: { name: 'The bluestones', text: 'The smaller stones, about 2 metres high, came from the Preseli Hills in Wales, some 250 kilometres away. Nobody knows for sure how they were moved. They were set up and taken down and moved around several times.' },
    nl: { name: 'De blauwstenen', text: 'De kleinere stenen, zo’n 2 meter hoog, komen van de Preseli Hills in Wales, zo’n 250 kilometer verderop. Niemand weet zeker hoe ze verplaatst zijn. Ze werden meermaals neergezet, weggehaald en verschoven.' },
  }),
  s('heel-stone', '🌅', 58, -48, 38, {
    en: { name: 'The Heel Stone', text: 'A rough, leaning stone 77 metres out along the axis. On midsummer morning the sun rises over its tip and sends its light down the Avenue into the middle of the circle. At midwinter the sun sets on the opposite side.' },
    nl: { name: 'De Heel Stone', text: 'Een ruwe, scheve steen 77 meter verderop langs de as. Op midzomermorgen komt de zon boven de top op en valt het licht langs de Avenue in het midden van de cirkel. Op midwinter gaat de zon aan de andere kant onder.' },
  }),
  s('slaughter-stone', '🪦', 17, -14, 25, {
    en: { name: 'The Slaughter Stone', text: 'A big fallen stone by the entrance, with pits in its top that filled with rainwater and turned red with the iron in the rock. The name was made up in the 1600s and has nothing to do with sacrifices.' },
    nl: { name: 'De Slachtsteen', text: 'Een grote omgevallen steen bij de ingang, met kuiltjes in de bovenkant die vol regenwater liepen en rood werden van het ijzer in het gesteente. De naam werd in de 17de eeuw verzonnen en heeft niets met offers te maken.' },
  }),
  s('aubrey', '⚪', -40, 15, 30, {
    en: { name: 'The Aubrey holes', text: 'A ring of 56 pits, each about a metre wide, round the stones, under the bank. Some held wooden posts, and later cremated remains. They were found in the 1600s by John Aubrey and are marked on the turf with white discs.' },
    nl: { name: 'De Aubrey-gaten', text: 'Een ring van 56 kuilen, elk zo’n meter breed, rond de stenen, onder de wal. In sommige stonden houten palen, later ook gecremeerde resten. John Aubrey vond ze in de 17de eeuw, en ze zijn in het gras gemarkeerd met witte schijven.' },
  }),
  s('avenue', '🛤️', 200, -160, 70, {
    en: { name: 'The Avenue', text: 'A broad path between two low banks that runs from the entrance for nearly three kilometres, to the River Avon. People walked it towards the circle. It was made about 2400 BC.' },
    nl: { name: 'De Avenue', text: 'Een brede weg tussen twee lage wallen die vanaf de ingang bijna drie kilometer loopt, tot aan de rivier de Avon. Mensen liepen er naar de cirkel toe. Hij werd rond 2400 v.Chr. aangelegd.' },
  }),
];
