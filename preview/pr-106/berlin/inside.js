// The buildings in Berlin you can go into (js/interiors.js), both on the Museum Island: the Neues
// Museum, its door on Bodestraße, and the Pergamon Museum, its door in the court of honour on the
// Kupfergraben. yaw is the way out, away from the building.
import { makeNeuesMuseum, NEUES_SIZE, makePergamon, PERGAMON_SIZE } from './inside/museumsinsel.js';

const card = (emoji, x, z, r, en, nl) => ({ emoji, x, z, r, text: { en, nl } });

export const INSIDE = [
  {
    id: 'neues-museum', emoji: '👑', make: makeNeuesMuseum, size: NEUES_SIZE,
    name: { en: 'The Neues Museum', nl: 'Het Neues Museum' },
    door: { x: 1099.5, z: -710.8, yaw: Math.PI / 2, name: 'Bodestraße' },
    look: { hemi: [0xfff4e8, 0xc0b4a0, 2.2], horizon: 0x5a5248 },
    exhibits: [
      card('🧱', 0, -10, 7,
        { name: 'The stair hall', text: 'Bombed in 1943 and a ruin for sixty years, the museum was rebuilt by David Chipperfield and opened in 2009, the scars left in the old brick and the new stair poured in pale concrete.' },
        { name: 'De traphal', text: 'In 1943 gebombardeerd en zestig jaar lang een ruïne, werd het museum herbouwd door David Chipperfield en in 2009 geopend, de littekens gelaten in de oude baksteen en de nieuwe trap in licht beton gegoten.' }),
      card('👸', 0, 22, 6,
        { name: 'Nefertiti', text: 'Her painted bust was found at Amarna in 1912, in the workshop of the sculptor Thutmose, where it had stood for 3,300 years. One eye was never set in. She is not to be photographed.' },
        { name: 'Nefertiti', text: 'Haar beschilderde buste werd in 1912 in Amarna gevonden, in de werkplaats van de beeldhouwer Thoetmosis, waar ze 3.300 jaar had gestaan. Eén oog werd nooit ingezet. Foto’s nemen mag niet.' }),
      card('🏺', 22, 2, 8,
        { name: 'The Egyptian courtyard', text: 'Coffins, statues of the gods and kings, and the papyri of the Egyptian collection, under the glass roof of what was an open courtyard.' },
        { name: 'De Egyptische binnenplaats', text: 'Sarcofagen, beelden van goden en koningen, en de papyri van de Egyptische verzameling, onder het glazen dak van wat ooit een open binnenplaats was.' }),
    ],
  },
  {
    id: 'pergamon', emoji: '🏛️', make: makePergamon, size: PERGAMON_SIZE,
    name: { en: 'The Pergamon Museum', nl: 'Het Pergamonmuseum' },
    door: { x: 867.0, z: -876.7, yaw: -Math.PI / 2, name: 'Am Kupfergraben' },
    look: { hemi: [0xfff4e8, 0xc0b4a0, 2.2], horizon: 0x5a5248 },
    exhibits: [
      card('🏛️', 0, -8, 10,
        { name: 'The Pergamon Altar', text: 'Built around 170 BC at Pergamon (now Bergama, in Turkey), dug up by German engineers in the 1870s and rebuilt here. Round its foot the gods fight the giants, 113 m of frieze. The hall is closed for rebuilding until about 2027.' },
        { name: 'Het Pergamonaltaar', text: 'Rond 170 v.Chr. gebouwd in Pergamon (nu Bergama, in Turkije), in de jaren 1870 door Duitse ingenieurs opgegraven en hier weer opgebouwd. Rond de voet vechten de goden tegen de reuzen, 113 m fries. De zaal is dicht voor verbouwing tot ongeveer 2027.' }),
      card('🦁', 0, 46, 8,
        { name: 'The Ishtar Gate', text: 'Nebuchadnezzar II’s gate to Babylon (575 BC), its bricks glazed blue with 575 lions, bulls and dragons, rebuilt from thousands of fragments dug up from 1902. Only the smaller, front gate is here: the one behind it was too tall.' },
        { name: 'De Ishtarpoort', text: 'De poort van Nebukadnezar II naar Babylon (575 v.Chr.), de bakstenen blauw geglazuurd met 575 leeuwen, stieren en draken, weer opgebouwd uit duizenden scherven die vanaf 1902 werden opgegraven. Alleen de kleinere voorpoort staat hier: de poort erachter was te hoog.' }),
    ],
  },
];
