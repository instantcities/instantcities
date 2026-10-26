// The quests in London: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'bigben', emoji: '🕰️', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 240, start: [-267, -533], goal: [36, 476], radius: 22,
    text: {
      nl: {
        title: 'Voor de Big Ben slaat',
        where: 'Van Trafalgar Square naar de Big Ben voor die twaalf uur slaat.',
        story: 'Je hebt om twaalf uur afgesproken onder de Big Ben, en het is bijna zover. Whitehall af, langs de Horse Guards en Downing Street. Pas op voor de zwarte taxi’s en de rode bussen, en hou links!',
        hud: '🕰️ Naar de Big Ben!',
        done: 'BONG! 🕰️',
        win: '🕰️ Net bij de eerste slag. Stipt op tijd.',
        lose: '🕰️ Twaalf slagen, en je bent nog op Whitehall…',
      },
      en: {
        title: 'Before Big Ben strikes',
        where: 'From Trafalgar Square to Big Ben before it strikes twelve.',
        story: 'You promised to meet a friend under Big Ben at noon, and it is nearly twelve. Down Whitehall you go, past the Horse Guards and Downing Street. Mind the black cabs and the red buses, and keep left!',
        hud: '🕰️ To Big Ben!',
        done: 'BONG! 🕰️',
        win: '🕰️ Just as the first stroke rings out. Perfectly punctual.',
        lose: '🕰️ Twelve strokes, and you are still on Whitehall…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [-267, -533], pad: [-267, -533], radius: 16,
    victims: [[305, 158, 'London Eye'], [218, 780, 'St Thomas’']], drop: [-172, 503, 'Parliament Square'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan Trafalgar Square. Red twee zwemmers en breng ze naar Parliament Square, onder de Big Ben.',
        story: 'Alarm! Er raakt een zwemmer in nood in de Theems, onder het London Eye, en nóg iemand gaat bijna kopje-onder in de Theems, bij het St Thomas’ ziekenhuis! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar Parliament Square, onder de Big Ben, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar het London Eye!', '🚁 Naar St Thomas’!', '🚁 Naar Parliament Square, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at Trafalgar Square. Save two swimmers and fly them to Parliament Square, under Big Ben.',
        story: 'Alarm! A swimmer is in trouble in the Thames, under the London Eye, and a second one is about to go under in the Thames, by St Thomas’ Hospital! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to Parliament Square, under Big Ben, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To the London Eye!', '🚁 To St Thomas’!', '🚁 To Parliament Square, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
