// The quests in Antwerp: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'brabo', emoji: '🖐️', player: { mount: 'bike', pick: 'stroopwafel' }, kind: 'thief', loot: 'statue', time: 150, start: [16, -179], thief: [-29, -219],
    text: {
      nl: {
        title: 'Wie heeft Brabo?',
        where: 'Start op de Grote Markt. Vang de dief met Brabo.',
        story: 'De fontein op de Grote Markt is leeg: iemand is ervandoor met Brabo, de held die de hand van de reus in de Schelde gooide. Daar gaan ze, naar de stroom. Vang hem voor Brabo zelf in het water belandt.',
        hud: '🦹 Vang de dief!',
        done: 'GEVANGEN! 🖐️',
        win: '🖐️ Brabo staat terug op zijn fontein, de hand in de lucht.',
        lose: '🦹 De dief is ontsnapt. Brabo is weg…',
      },
      en: {
        title: 'Who took Brabo?',
        where: 'Start on the Grote Markt. Catch the thief with Brabo.',
        story: 'The fountain on the Grote Markt is empty: someone has made off with Brabo, the hero who threw the giant’s hand into the Scheldt. There they go, towards the river. Catch them before Brabo ends up in the water himself.',
        hud: '🦹 Catch the thief!',
        done: 'CAUGHT! 🖐️',
        win: '🖐️ Brabo is back on his fountain, hand in the air.',
        lose: '🦹 The thief got away. Brabo is gone…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [146, 139], pad: [146, 139], radius: 16,
    victims: [[-306, -442, 'Het Steen'], [248, -1123, 'Eilandje']], drop: [16, -179, 'Grote Markt'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan de Groenplaats. Red twee zwemmers en breng ze naar de Grote Markt.',
        story: 'Alarm! Er raakt een zwemmer in nood in de Schelde, naast het Steen, en nóg iemand gaat bijna kopje-onder in de dokken van het Eilandje, bij het MAS! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar de Grote Markt, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar het Steen!', '🚁 Naar het MAS!', '🚁 Naar de Grote Markt, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the Groenplaats. Save two swimmers and fly them to the Grote Markt.',
        story: 'Alarm! A swimmer is in trouble in the Scheldt, beside Het Steen, and a second one is about to go under in the docks of the Eilandje, by the MAS! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the Grote Markt, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To Het Steen!', '🚁 To the MAS!', '🚁 To the Grote Markt, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
