// The quests in Bruges: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'madonna', emoji: '🗿', player: { mount: 'bike', pick: 'stroopwafel' }, kind: 'thief', loot: 'statue', time: 150, start: [-18, 275], thief: [20, 228],
    text: {
      nl: {
        title: 'De Madonna van Michelangelo',
        where: 'Start aan de Onze-Lieve-Vrouwekerk. Vang de dief met het beeld.',
        story: 'In 1944 droegen terugtrekkende Duitse soldaten de Madonna van Michelangelo de Onze-Lieve-Vrouwekerk uit, gewikkeld in matrassen, en pas de Monuments Men brachten haar terug. Nu loopt iemand er opnieuw mee weg. Vang hem voor hij de Markt haalt.',
        hud: '🦹 Vang de dief!',
        done: 'GEVANGEN! 🗿',
        win: '🗿 De Madonna staat terug in haar kapel.',
        lose: '🦹 De dief is ontsnapt met de Madonna…',
      },
      en: {
        title: 'Michelangelo’s Madonna',
        where: 'Start at the Church of Our Lady. Catch the thief with the statue.',
        story: 'In 1944 retreating German soldiers carried Michelangelo’s Madonna out of the Church of Our Lady, wrapped in mattresses, and only the Monuments Men brought her back. Now someone is running off with her again. Catch them before they reach the Markt.',
        hud: '🦹 Catch the thief!',
        done: 'CAUGHT! 🗿',
        win: '🗿 The Madonna is back in her chapel.',
        lose: '🦹 The thief got away with the Madonna…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [-628, 164], pad: [-628, 164], radius: 16,
    victims: [[36, 815, 'Minnewater'], [157, 9, 'Dijver']], drop: [-44, -306, 'Markt'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan ’t Zand. Red twee zwemmers en breng ze naar de Markt, onder het Belfort.',
        story: 'Alarm! Er raakt een zwemmer in nood in het Minnewater, en nóg iemand gaat bijna kopje-onder in de reie langs de Dijver! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar de Markt, onder het Belfort, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar het Minnewater!', '🚁 Naar de Dijver!', '🚁 Naar de Markt, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at ’t Zand. Save two swimmers and fly them to the Markt, under the Belfry.',
        story: 'Alarm! A swimmer is in trouble in the Minnewater, the Lake of Love, and a second one is about to go under in the canal along the Dijver! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the Markt, under the Belfry, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To the Minnewater!', '🚁 To the Dijver!', '🚁 To the Markt, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
