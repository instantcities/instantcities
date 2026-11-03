// The Taj Mahal's sights: ride up to one while exploring and a card tells you what you are looking at.
// Each { id, emoji, x, z (game metres, where the card counts from), r (how close you have to be, game
// metres), text: { <lang>: { name, text } } }. In English and Dutch; the other languages show the English.
export const SIGHTS = [
  {
    id: 'great-gate', emoji: '🚪', x: -91, z: 196, r: 60,
    text: {
      en: { name: 'The great gate', text: 'Darwaza-i-Rauza, the red sandstone gate into the garden, finished in 1648. The 22 small domes along its top are said to stand for the years it took to build the Taj.' },
      nl: { name: 'De grote poort', text: 'Darwaza-i-Rauza, de poort van rode zandsteen naar de tuin, klaar in 1648. De 22 koepeltjes bovenop zouden staan voor de jaren die de bouw van de Taj duurde.' },
    },
  },
  {
    id: 'charbagh', emoji: '🌳', x: -91, z: 80, r: 90,
    text: {
      en: { name: 'The charbagh', text: 'A Persian garden: four quarters round a channel of water, 300 metres across. It stands for the four rivers of paradise, and from the middle the tomb seems to float above the canal.' },
      nl: { name: 'De charbagh', text: 'Een Perzische tuin: vier kwarten rond een waterloop, 300 meter breed. Hij verwijst naar de vier rivieren van het paradijs, en vanuit het midden lijkt de tombe boven het kanaal te zweven.' },
    },
  },
  {
    id: 'taj-mahal', emoji: '🕌', x: -91, z: -254, r: 110,
    text: {
      en: { name: 'The Taj Mahal', text: 'Shah Jahan built it for his wife Mumtaz Mahal, who died in 1631, and it took about 20 years. The marble tomb stands on a platform, with an onion dome 73 metres up. It looks pink at dawn and gold at dusk.' },
      nl: { name: 'De Taj Mahal', text: 'Shah Jahan liet hem bouwen voor zijn vrouw Mumtaz Mahal, die in 1631 stierf, en het duurde zo’n 20 jaar. De marmeren tombe staat op een platform, met een uiensluitkoepel 73 meter hoog. Hij lijkt roze bij zonsopgang en goud bij zonsondergang.' },
    },
  },
  {
    id: 'minarets', emoji: '🗼', x: -32, z: -195, r: 60,
    text: {
      en: { name: 'The minarets', text: 'The four minarets are 40 metres high and each leans a little outward. If one ever fell, it would fall away from the tomb.' },
      nl: { name: 'De minaretten', text: 'De vier minaretten zijn 40 meter hoog en leunen elk een beetje naar buiten. Als er ooit een zou vallen, valt hij weg van de tombe.' },
    },
  },
  {
    id: 'mosque', emoji: '🕋', x: -264, z: -254, r: 70,
    text: {
      en: { name: 'The mosque', text: 'The red sandstone mosque west of the tomb, still used on Fridays. It has three white domes, and its prayer hall faces Mecca, to the west.' },
      nl: { name: 'De moskee', text: 'De moskee van rode zandsteen ten westen van de tombe, nog altijd in gebruik op vrijdag. Ze heeft drie witte koepels en haar gebedshal kijkt naar Mekka, in het westen.' },
    },
  },
  {
    id: 'jawab', emoji: '🔴', x: 82, z: -254, r: 70,
    text: {
      en: { name: 'The Jawab', text: 'The “answer”: a copy of the mosque on the east side, built so the view of the tomb would be symmetrical. Nobody prays there, as it does not face Mecca.' },
      nl: { name: 'De Jawab', text: 'Het “antwoord”: een kopie van de moskee aan de oostkant, gebouwd zodat het zicht op de tombe symmetrisch zou zijn. Er wordt niet gebeden, want hij kijkt niet naar Mekka.' },
    },
  },
];
