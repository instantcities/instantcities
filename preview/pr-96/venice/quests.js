// The quests in Venice: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'tintoretto', emoji: '🖼️', player: { mount: 'bike', pick: 'stroopwafel' }, kind: 'thief', loot: 'painting', time: 150, start: [296, 337], thief: [241, 313],
    text: {
      nl: {
        title: 'Een Tintoretto op de vlucht',
        where: 'Start aan het Dogepaleis. Vang de dief voor de Rialto.',
        story: 'Iemand is het Dogepaleis uit geglipt met een schilderij van Tintoretto en duikt het doolhof van calli in. In Venetië zijn er geen auto’s om mee te vluchten: vang hem, over de bruggen, voor hij de Rialto haalt.',
        hud: '🦹 Vang de dief!',
        done: 'GEVANGEN! 🖼️',
        win: '🖼️ De Tintoretto gaat terug naar het Dogepaleis.',
        lose: '🦹 De dief is verdwenen in de calli…',
      },
      en: {
        title: 'A Tintoretto on the run',
        where: 'Start at the Doge’s Palace. Catch the thief before the Rialto.',
        story: 'Someone has slipped out of the Doge’s Palace with a painting by Tintoretto and is heading into the maze of calli. In Venice there are no cars to escape in: catch them on foot, over the bridges, before they reach the Rialto.',
        hud: '🦹 Catch the thief!',
        done: 'CAUGHT! 🖼️',
        win: '🖼️ The Tintoretto goes back to the Doge’s Palace.',
        lose: '🦹 The thief vanished into the calli…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [-731, -176], pad: [-731, -176], radius: 16,
    victims: [[-280, -147, 'Rialto'], [208, 503, 'Bacino di San Marco']], drop: [140, 268, 'Piazza San Marco'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan de Campo San Polo. Red twee zwemmers en breng ze naar de Piazza San Marco.',
        story: 'Alarm! Er raakt een zwemmer in nood in het Canal Grande, bij de Rialtobrug, en nóg iemand gaat bijna kopje-onder in het Bacino di San Marco, voor het Dogenpaleis! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar de Piazza San Marco, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar de Rialto!', '🚁 Naar het Bacino di San Marco!', '🚁 Naar de Piazza San Marco, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the Campo San Polo. Save two swimmers and fly them to the Piazza San Marco.',
        story: 'Alarm! A swimmer is in trouble in the Grand Canal, by the Rialto Bridge, and a second one is about to go under in the Bacino di San Marco, off the Doge’s Palace! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the Piazza San Marco, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To the Rialto!', '🚁 To the Bacino di San Marco!', '🚁 To the Piazza San Marco, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
