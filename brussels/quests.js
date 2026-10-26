// The quests in Brussels: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'manneken', emoji: '💦', player: { mount: 'bike', pick: 'stroopwafel' }, kind: 'thief', loot: 'statue', time: 150, start: [-101, 235], thief: [-60, 191],
    text: {
      nl: {
        title: 'Manneken Pis is gestolen!',
        where: 'Start aan Manneken Pis. Vang de dief.',
        story: 'Manneken Pis is door de eeuwen heen al een paar keer gestolen, en elke keer kreeg Brussel hem terug. Het gebeurt opnieuw: daar gaat de dief met het bronzen ventje onder de arm. Vang hem in de straatjes rond de Grote Markt.',
        hud: '🦹 Vang de dief!',
        done: 'GEVANGEN! 💦',
        win: '💦 Manneken Pis staat terug op zijn hoek, even brutaal als altijd.',
        lose: '🦹 De dief is ontsnapt. De hoek is leeg…',
      },
      en: {
        title: 'Manneken Pis is stolen!',
        where: 'Start at the Manneken Pis. Catch the thief.',
        story: 'The Manneken Pis has been stolen several times over the centuries, and every time Brussels got him back. It is happening again: there goes the thief with the little bronze boy under his arm. Catch them in the lanes round the Grand-Place.',
        hud: '🦹 Catch the thief!',
        done: 'CAUGHT! 💦',
        win: '💦 Manneken Pis is back on his corner, as cheeky as ever.',
        lose: '🦹 The thief got away. The corner is empty…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 240,
    start: [514, 373], pad: [514, 373], radius: 16,
    victims: [[-365, -923, 'Vismet'], [1128, 150, 'Parc de Bruxelles']], drop: [118, 0, 'Grand-Place'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan de Kunstberg. Red twee zwemmers en breng ze naar de Grote Markt.',
        story: 'Alarm! Er raakt een zwemmer in nood in het oude havenbekken aan de Vismet, en nóg iemand gaat bijna kopje-onder in de vijver van het Warandepark! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar de Grote Markt, waar de ambulance wacht. Land in de lichtzuil. Je hebt 4 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar de Vismet!', '🚁 Naar het Warandepark!', '🚁 Naar de Grote Markt, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the Mont des Arts. Save two swimmers and fly them to the Grand-Place.',
        story: 'Alarm! A swimmer is in trouble in the old harbour basin at the Vismet, and a second one is about to go under in the pond of the Parc de Bruxelles! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the Grand-Place, where the ambulance is waiting. Land in the beam of light. You have 4 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To the Vismet!', '🚁 To the Parc de Bruxelles!', '🚁 To the Grand-Place, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
