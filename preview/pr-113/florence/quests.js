// The quests in Florence: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'david', emoji: '🗿', player: { mount: 'bike', pick: 'stroopwafel' }, kind: 'thief', loot: 'statue', time: 150, start: [246, 152], thief: [234, 211],
    text: {
      nl: {
        title: 'Kleine David op de vlucht',
        where: 'Start op de Piazza della Signoria. Vang de dief.',
        story: 'Het mooiste stuk van een souvenirverkoper, een marmeren David van een meter hoog, is net van zijn kraam op de Piazza della Signoria gegrist. De dief gaat richting Ponte Vecchio. Vang hem voor David aan de overkant van de Arno belandt.',
        hud: '🦹 Vang de dief!',
        done: 'GEVANGEN! 🗿',
        win: '🗿 David staat terug op zijn kraam, even trots als altijd.',
        lose: '🦹 De dief is de Arno over…',
      },
      en: {
        title: 'Little David on the run',
        where: 'Start on Piazza della Signoria. Catch the thief.',
        story: 'A souvenir seller’s best piece, a marble David a metre tall, has just been snatched from his stall on Piazza della Signoria. The thief is heading for the Ponte Vecchio. Catch them before David ends up across the Arno.',
        hud: '🦹 Catch the thief!',
        done: 'CAUGHT! 🗿',
        win: '🗿 David is back on his stall, as proud as ever.',
        lose: '🦹 The thief got away across the Arno…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [-365, -526], pad: [-365, -526], radius: 16,
    victims: [[-286, 235, 'Ponte Santa Trinita'], [600, 683, 'Ponte alle Grazie']], drop: [272, -309, 'Piazza del Duomo'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan de Piazza Santa Maria Novella. Red twee zwemmers en breng ze naar de Piazza del Duomo.',
        story: 'Alarm! Er raakt een zwemmer in nood in de Arno, bij de Ponte Santa Trinita, en nóg iemand gaat bijna kopje-onder in de Arno, bij de Ponte alle Grazie! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar de Piazza del Duomo, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar de Ponte Santa Trinita!', '🚁 Naar de Ponte alle Grazie!', '🚁 Naar de Piazza del Duomo, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at Piazza Santa Maria Novella. Save two swimmers and fly them to the Piazza del Duomo.',
        story: 'Alarm! A swimmer is in trouble in the Arno, by the Ponte Santa Trinita, and a second one is about to go under in the Arno, by the Ponte alle Grazie! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the Piazza del Duomo, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To the Ponte Santa Trinita!', '🚁 To the Ponte alle Grazie!', '🚁 To the Piazza del Duomo, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
